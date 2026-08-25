import { pool } from './db';

export interface EncargosSociais {
    salarioBase: number;
    valorEpi: number;
    valorBeneficio: number;
    decimoTerceiro: number;
    ferias: number;
    umTercoFerias: number;
    inss: number;
    fgtsMensal: number;
    multaFgts: number;
    custoTotal: number;
}

// Motor Contábil Anti-Float
export function calcularEncargos(salario: number, valorEpi: number, valorBeneficio: number): EncargosSociais {
    const salarioCentavos = Math.round(salario * 100);
    const epiCentavos = Math.round(valorEpi * 100);
    const beneficioCentavos = Math.round(valorBeneficio * 100);

    const decimoTerceiro = Math.round(salarioCentavos / 12);
    const ferias = Math.round(salarioCentavos / 12);
    const umTercoFerias = Math.round(ferias / 3);
    const inss = Math.round(salarioCentavos * 0.08);
    const fgtsMensal = Math.round(salarioCentavos * 0.08);
    const multaFgts = Math.round(fgtsMensal * 0.40);

    const custoTotalCentavos = salarioCentavos + epiCentavos + beneficioCentavos + decimoTerceiro + ferias + umTercoFerias + inss + multaFgts;

    return {
        salarioBase: salarioCentavos / 100,
        valorEpi: epiCentavos / 100,
        valorBeneficio: beneficioCentavos / 100,
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

    // 1. Agregação Direta via Banco de Dados
    async obterResumoFinanceiro(empresa_id: number) {
        const query = `
            SELECT 
                COUNT(*) FILTER (WHERE ativo = true) as total_ativos,
                SUM(custo_total_mensal) FILTER (WHERE ativo = true) as custo_folha,
                SUM(custo_total_mensal) FILTER (WHERE ativo = true AND setor ILIKE 'produ%') as custo_producao
            FROM funcionarios
            WHERE empresa_id = $1
        `;
        const resultado = await pool.query(query, [empresa_id]);
        const row = resultado.rows[0];
        
        return {
            totalAtivos: parseInt(row.total_ativos || '0', 10),
            custoFolha: parseFloat(row.custo_folha || '0'),
            custoProducao: parseFloat(row.custo_producao || '0')
        };
    }

    // 2. Paginação Server-Side
    async listarPaginado(filtros: FiltrosPesquisa, empresa_id: number) {
        const whereClauses = [`f.empresa_id = $1`];
        const values: any[] = [empresa_id];
        let paramCount = 2;

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

        const whereSQL = `WHERE ` + whereClauses.join(' AND ');

        const colunasPermitidas: Record<string, string> = {
            'nome': 'f.nome',
            'salario': 'f.custo_total_mensal',
            'admissao': 'f.data_admissao'
        };
        const sortField = filtros.ordenarPor ? (colunasPermitidas[filtros.ordenarPor] || 'f.nome') : 'f.nome';
        const sortDir = filtros.direcaoOrdem === 'desc' ? 'DESC' : 'ASC';

        const limite = filtros.limite || 8;
        const offset = ((filtros.pagina || 1) - 1) * limite;

        const countQuery = `
            SELECT COUNT(*) 
            FROM funcionarios f 
            LEFT JOIN funcoes fun ON f.funcao_id = fun.id 
            ${whereSQL}
        `;
        const totalResult = await pool.query(countQuery, values);
        const totalRegistros = parseInt(totalResult.rows[0].count, 10);

        // Adicionado 'f.custo_hora' no select para disponibilidade no frontend caso necessário no futuro
        const dataQuery = `
            SELECT f.id, f.nome, fun.nome AS funcao, f.funcao_id, f.setor,
                   f.salario_base, f.valor_epi, f.valor_beneficio, f.custo_total_mensal, f.custo_hora, f.ativo, f.data_admissao,
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

    // 3. Single Source of Truth na inserção
    async criarFuncionario(dados: { nome: string; funcao_id: number; setor: string; salarioBase: number; valorEpi: number; valorBeneficio: number }, empresa_id: number) {
        const calc = calcularEncargos(dados.salarioBase, dados.valorEpi, dados.valorBeneficio);

        // INTERCEPTAÇÃO GLOBAL: Busca a base de horas da empresa para derivar o Custo Hora Real
        const configRes = await pool.query('SELECT horas_trabalhadas_dia FROM configuracao_producao WHERE empresa_id = $1', [empresa_id]);
        const baseHoras = configRes.rows[0]?.horas_trabalhadas_dia || 176;
        const custoHoraReal = Number((calc.custoTotal / baseHoras).toFixed(2));

        const query = `
            INSERT INTO funcionarios (
                nome, funcao_id, setor, salario_base, valor_epi, valor_beneficio,
                decimo_terceiro, um_terco_ferias, ferias, inss, multa_fgts, custo_total_mensal, custo_hora,
                ativo, data_admissao, empresa_id
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), $15) RETURNING *
        `;
        const values = [
            dados.nome, dados.funcao_id, dados.setor, calc.salarioBase, calc.valorEpi, calc.valorBeneficio,
            calc.decimoTerceiro, calc.umTercoFerias, calc.ferias, calc.inss, calc.multaFgts, calc.custoTotal, custoHoraReal,
            true, empresa_id
        ];
        const resultado = await pool.query(query, values);
        return resultado.rows[0];
    }

    async atualizarFuncionario(id: number, dados: any, empresa_id: number) {
        let updateFills = '';
        const values: any[] = [];
        let index = 1;

        if (dados.nome !== undefined) { updateFills += `nome = $${index++}, `; values.push(dados.nome); }
        if (dados.funcao_id !== undefined) { updateFills += `funcao_id = $${index++}, `; values.push(dados.funcao_id); }
        if (dados.setor !== undefined) { updateFills += `setor = $${index++}, `; values.push(dados.setor); }
        if (dados.ativo !== undefined) { updateFills += `ativo = $${index++}, `; values.push(dados.ativo); }
        if (dados.motivo_inativacao !== undefined) { updateFills += `motivo_inativacao = $${index++}, `; values.push(dados.motivo_inativacao); }
        if (dados.data_inativacao !== undefined) { updateFills += `data_inativacao = $${index++}, `; values.push(dados.data_inativacao); }

        if (dados.salarioBase !== undefined && dados.valorEpi !== undefined && dados.valorBeneficio !== undefined) {
            const calc = calcularEncargos(dados.salarioBase, dados.valorEpi, dados.valorBeneficio);

            // REPROCESSAMENTO DO CUSTO HORA GLOBAL EM CASO DE AUMENTO DE SALÁRIO
            const configRes = await pool.query('SELECT horas_trabalhadas_dia FROM configuracao_producao WHERE empresa_id = $1', [empresa_id]);
            const baseHoras = configRes.rows[0]?.horas_trabalhadas_dia || 176;
            const custoHoraReal = Number((calc.custoTotal / baseHoras).toFixed(2));

            updateFills += `
                salario_base = $${index++}, valor_epi = $${index++}, valor_beneficio = $${index++}, decimo_terceiro = $${index++},
                um_terco_ferias = $${index++}, ferias = $${index++}, inss = $${index++},
                multa_fgts = $${index++}, custo_total_mensal = $${index++}, custo_hora = $${index++},
            `;
            values.push(calc.salarioBase, calc.valorEpi, calc.valorBeneficio, calc.decimoTerceiro, calc.umTercoFerias, calc.ferias, calc.inss, calc.multaFgts, calc.custoTotal, custoHoraReal);
        }

        updateFills = updateFills.replace(/,\s*$/, ''); 
        
        values.push(id, empresa_id); 

        const query = `UPDATE funcionarios SET ${updateFills} WHERE id = $${index} AND empresa_id = $${index + 1}`;
        await pool.query(query, values);
    }

    async excluirFuncionario(id: number, empresa_id: number) {
        await pool.query('DELETE FROM funcionarios WHERE id = $1 AND empresa_id = $2', [id, empresa_id]);
    }
}