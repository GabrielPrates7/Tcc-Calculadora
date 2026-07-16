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

export function calcularEncargos(salario: number, epi: number): EncargosSociais {
    const decimoTerceiro = salario / 12;
    const ferias = salario / 12;
    const umTercoFerias = ferias / 3;
    const inss = salario * 0.08; 
    const fgtsMensal = salario * 0.08; 
    const multaFgts = salario * 0.032; 

    // FGTS Mensal (8%) removido da soma final conforme regra de negócio estrita
    const custoTotal = salario + epi + decimoTerceiro + ferias + umTercoFerias + inss + multaFgts;

    return {
        salarioBase: salario, 
        epi, 
        decimoTerceiro, 
        ferias,
        umTercoFerias, 
        inss, 
        fgtsMensal, 
        multaFgts, 
        custoTotal
    };
}

export class FuncionarioService {

    async listarTodos() {
        const query = `
            SELECT f.id, f.nome, fun.nome AS funcao, f.funcao_id, f.setor, 
                   f.salario_base, f.epi, f.custo_total_mensal, f.ativo, f.data_admissao
            FROM funcionarios f
            LEFT JOIN funcoes fun ON f.funcao_id = fun.id
            ORDER BY f.nome ASC
        `;
        const resultado = await pool.query(query);
        return resultado.rows;
    }

    async criarFuncionario(dados: { nome: string; funcao_id: number; setor: string; salarioBase: number; epi: number }) {
        const calc = calcularEncargos(dados.salarioBase, dados.epi);
        const query = `
            INSERT INTO funcionarios (nome, funcao_id, setor, salario_base, epi, custo_total_mensal, ativo, data_admissao) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING *
        `;
        const values = [dados.nome, dados.funcao_id, dados.setor, dados.salarioBase, dados.epi, calc.custoTotal, true];
        const resultado = await pool.query(query, values);
        return resultado.rows[0];
    }

    // Método para processar o PUT
    async atualizarFuncionario(id: number, dados: any) {
        let custoTotal = null;
        if (dados.salarioBase !== undefined && dados.epi !== undefined) {
            custoTotal = calcularEncargos(dados.salarioBase, dados.epi).custoTotal;
        }

        const query = `
            UPDATE funcionarios 
            SET nome = COALESCE($1, nome),
                funcao_id = COALESCE($2, funcao_id),
                setor = COALESCE($3, setor),
                salario_base = COALESCE($4, salario_base),
                epi = COALESCE($5, epi),
                custo_total_mensal = COALESCE($6, custo_total_mensal),
                ativo = COALESCE($7, ativo)
            WHERE id = $8
        `;
        const values = [dados.nome, dados.funcao_id, dados.setor, dados.salarioBase, dados.epi, custoTotal, dados.ativo, id];
        await pool.query(query, values);
    }

    // Método para processar o DELETE
    async excluirFuncionario(id: number) {
        await pool.query('DELETE FROM funcionarios WHERE id = $1', [id]);
    }
}