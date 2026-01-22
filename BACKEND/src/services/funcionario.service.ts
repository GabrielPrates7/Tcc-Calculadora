// ARQUIVO: BACKEND/src/services/funcionario.service.ts
import { pool } from './db';

// --- 1. Interface de Tipagem (Mantida) ---
export interface EncargosSociais {
    salarioBase: number;
    epi: number;
    decimoTerceiro: number;
    ferias: number;
    umTercoFerias: number;
    inss: number;
    multaFgts: number;
    custoTotal: number;
}

// --- 2. Função de Cálculo (Mantida e usada pela classe abaixo) ---
export function calcularEncargos(salario: number, epi: number): EncargosSociais {
    const decimoTerceiro = salario / 12;
    const ferias = salario / 12;
    const umTercoFerias = ferias / 3;
    const inss = salario * 0.08; // Estimativa de 8%
    const multaFgts = salario * 0.032; // 40% sobre 8%

    const custoTotal = salario + epi + decimoTerceiro + ferias + umTercoFerias + inss + multaFgts;

    return {
        salarioBase: salario,
        epi,
        decimoTerceiro,
        ferias,
        umTercoFerias,
        inss,
        multaFgts,
        custoTotal
    };
}

// --- 3. A CLASSE QUE FALTAVA (Correção do Erro) ---
export class FuncionarioService {

    // Método que o index.ts está chamando
    async criarFuncionario(dados: { nome: string; salarioBase: number; epi: number }) {
        
        // 1. Faz os cálculos usando a função acima
        const memoriaCalculo = calcularEncargos(dados.salarioBase, dados.epi);

        console.log(`💾 Salvando funcionário: ${dados.nome}`);
        console.log(`💰 Custo Total Calculado: R$ ${memoriaCalculo.custoTotal.toFixed(2)}`);

        // 2. Insere no Banco de Dados (PostgreSQL)
        // Ajuste a query conforme o nome real das suas colunas no banco
        const query = `
            INSERT INTO funcionarios (
                nome, 
                funcao, 
                setor, 
                salario_base, 
                epi_mensal, 
                custo_total_mensal, 
                ativo, 
                data_admissao
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
            RETURNING *
        `;

        const values = [
            dados.nome,
            'Teste',           // Função (placeholder)
            'Produção',        // Setor (placeholder)
            dados.salarioBase,
            dados.epi,
            memoriaCalculo.custoTotal,
            true               // Ativo
        ];

        try {
            const resultado = await pool.query(query, values);
            return resultado.rows[0];
        } catch (erro) {
            console.error('Erro ao salvar no banco:', erro);
            throw erro;
        }
    }
}