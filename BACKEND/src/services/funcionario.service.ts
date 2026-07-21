import { pool } from './db';

export interface EncargosSociais {
    salarioBase: number;
    epi: number;
    decimoTerceiro: number;
    ferias: number;
    umTercoFerias: number;
    inss: number;
    fgtsMensal: number;
    multaFgts: number;
    custoTotal: number;
}

// Motor Contábil Anti-Float
export function calcularEncargos(salario: number, epi: number): EncargosSociais {
    const salarioCentavos = Math.round(salario * 100);
    const epiCentavos = Math.round(epi * 100);

    const decimoTerceiro = Math.round(salarioCentavos / 12);
    const ferias = Math.round(salarioCentavos / 12);
    const umTercoFerias = Math.round(ferias / 3);
    const inss = Math.round(salarioCentavos * 0.08); 
    const fgtsMensal = Math.round(salarioCentavos * 0.08); 
    const multaFgts = Math.round(fgtsMensal * 0.40); 

    const custoTotalCentavos = salarioCentavos + epiCentavos + decimoTerceiro + ferias + umTercoFerias + inss + multaFgts;

    return {
        salarioBase: salarioCentavos / 100, 
        epi: epiCentavos / 100, 
        decimoTerceiro: decimoTerceiro / 100, 
        ferias: ferias / 100,
        umTercoFerias: umTercoFerias / 100, 
        inss: inss / 100, 
        fgtsMensal: fgtsMensal / 100, 
        multaFgts: multaFgts / 100, 
        custoTotal: custoTotalCentavos / 100
    };
}

export interface FiltrosPesquisa {
    pagina: number;
    limite: number;
    busca?: string;
    setor?: string;
    status?: string;
    funcao?: string;
    ordenarPor?: string;
    direcaoOrdem?: 'asc' | 'desc';
}

export class FuncionarioService {

    // 1. Agregação Direta via Banco de Dados (Evita memory leak no Node)
async obterResumoFinanceiro() {
        const query = `
            SELECT 
                COUNT(*) FILTER (WHERE ativo = true) as total_ativos,
                SUM(custo_total_mensal) FILTER (WHERE ativo = true) as custo_folha,
                -- Correção: ILIKE 'produ%' captura "Produção", "PRODUÇÃO" ou "producao" de bases legadas
                SUM(custo_total_mensal) FILTER (WHERE ativo = true AND setor ILIKE 'produ%') as custo_producao
            FROM funcionarios
        `;
        const resultado = await pool.query(query);
        const row = resultado.rows[0];
        
        return {
            totalAtivos: parseInt(row.total_ativos || '0', 10),
            custoFolha: parseFloat(row.custo_folha || '0'),
            custoProducao: parseFloat(row.custo_producao || '0')
        };
    }

    // 2. Paginação Server-Side (Substitui listarTodos)
    async listarPaginado(filtros: FiltrosPesquisa) {
        const whereClauses = [];
        const values: any[] = [];
        let paramCount = 1;

        if (filtros.busca) {
            whereClauses.push(`(f.nome ILIKE $${paramCount} OR fun.nome ILIKE $${paramCount})`);
            values.push(`%${filtros.busca}%`);
            paramCount++;
        }
        if (filtros.setor && filtros.setor !== 'todos') {
            whereClauses.push(`f.setor = $${paramCount}`);
            values.push(filtros.setor);
            paramCount++;
        }
        if (filtros.status && filtros.status !== 'todos') {
            const isAtivo = filtros.status === 'ativos';
            whereClauses.push(`f.ativo = $${paramCount}`);
            values.push(isAtivo);
            paramCount++;
        }
        if (filtros.funcao && filtros.funcao !== 'todas') {
            whereClauses.push(`fun.nome = $${paramCount}`);
            values.push(filtros.funcao);
            paramCount++;
        }

        const whereSQL = whereClauses.length > 0 ? `WHERE ` + whereClauses.join(' AND ') : '';

        // Proteção contra SQL Injection dinâmico no ORDER BY
        const colunasPermitidas: Record<string, string> = {
            'nome': 'f.nome',
            'salario': 'f.custo_total_mensal',
            'admissao': 'f.data_admissao'
        };
        const sortField = filtros.ordenarPor ? (colunasPermitidas[filtros.ordenarPor] || 'f.nome') : 'f.nome';
        const sortDir = filtros.direcaoOrdem === 'desc' ? 'DESC' : 'ASC';

        const limite = filtros.limite || 8;
        const offset = ((filtros.pagina || 1) - 1) * limite;

        // Query 1: Contagem Total para Paginação
        const countQuery = `
            SELECT COUNT(*) 
            FROM funcionarios f 
            LEFT JOIN funcoes fun ON f.funcao_id = fun.id 
            ${whereSQL}
        `;
        const totalResult = await pool.query(countQuery, values);
        const totalRegistros = parseInt(totalResult.rows[0].count, 10);

        // Query 2: Dados Fatiados
        const dataQuery = `
            SELECT f.id, f.nome, fun.nome AS funcao, f.funcao_id, f.setor, 
                   f.salario_base, f.epi, f.custo_total_mensal, f.ativo, f.data_admissao,
                   f.decimo_terceiro, f.um_terco_ferias, f.ferias, f.inss, f.multa_fgts
            FROM funcionarios f
            LEFT JOIN funcoes fun ON f.funcao_id = fun.id
            ${whereSQL}
            ORDER BY ${sortField} ${sortDir}
            LIMIT $${paramCount} OFFSET $${paramCount + 1}
        `;
        
        const dataResult = await pool.query(dataQuery, [...values, limite, offset]);

        return {
            dados: dataResult.rows,
            total: totalRegistros,
            paginas: Math.ceil(totalRegistros / limite)
        };
    }

    // 3. Single Source of Truth na inserção (Tabela agora guarda as provisões)
    async criarFuncionario(dados: { nome: string; funcao_id: number; setor: string; salarioBase: number; epi: number }) {
        const calc = calcularEncargos(dados.salarioBase, dados.epi);
        const query = `
            INSERT INTO funcionarios (
                nome, funcao_id, setor, salario_base, epi, 
                decimo_terceiro, um_terco_ferias, ferias, inss, multa_fgts, custo_total_mensal, 
                ativo, data_admissao
            ) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW()) RETURNING *
        `;
        const values = [
            dados.nome, dados.funcao_id, dados.setor, calc.salarioBase, calc.epi,
            calc.decimoTerceiro, calc.umTercoFerias, calc.ferias, calc.inss, calc.multaFgts, calc.custoTotal, 
            true
        ];
        const resultado = await pool.query(query, values);
        return resultado.rows[0];
    }

    async atualizarFuncionario(id: number, dados: any) {
        let updateFills = '';
        const values: any[] = [];
        let index = 1;

        // Montagem dinâmica para não sobrescrever com null os dados não enviados
        if (dados.nome !== undefined) { updateFills += `nome = $${index++}, `; values.push(dados.nome); }
        if (dados.funcao_id !== undefined) { updateFills += `funcao_id = $${index++}, `; values.push(dados.funcao_id); }
        if (dados.setor !== undefined) { updateFills += `setor = $${index++}, `; values.push(dados.setor); }
        if (dados.ativo !== undefined) { updateFills += `ativo = $${index++}, `; values.push(dados.ativo); }
        if (dados.motivo_inativacao !== undefined) { updateFills += `motivo_inativacao = $${index++}, `; values.push(dados.motivo_inativacao); }
        if (dados.data_inativacao !== undefined) { updateFills += `data_inativacao = $${index++}, `; values.push(dados.data_inativacao); }

        if (dados.salarioBase !== undefined && dados.epi !== undefined) {
            const calc = calcularEncargos(dados.salarioBase, dados.epi);
            updateFills += `
                salario_base = $${index++}, epi = $${index++}, decimo_terceiro = $${index++}, 
                um_terco_ferias = $${index++}, ferias = $${index++}, inss = $${index++}, 
                multa_fgts = $${index++}, custo_total_mensal = $${index++}, 
            `;
            values.push(calc.salarioBase, calc.epi, calc.decimoTerceiro, calc.umTercoFerias, calc.ferias, calc.inss, calc.multaFgts, calc.custoTotal);
        }

        updateFills = updateFills.replace(/,\s*$/, ''); // Limpa a última vírgula
        values.push(id);

        const query = `UPDATE funcionarios SET ${updateFills} WHERE id = $${index}`;
        await pool.query(query, values);
    }

    async excluirFuncionario(id: number) {
        await pool.query('DELETE FROM funcionarios WHERE id = $1', [id]);
    }
}