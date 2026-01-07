import { pool } from './db'; // Ajuste o import conforme o nome do seu arquivo de banco (db.ts)

// Interface para tipar os dados que chegam
interface CriarFuncionarioDTO {
  nome: string;
  salarioBase: number;
  epi?: number;
  outrosGastos?: number;
}

export class FuncionarioService {
  
  // Taxas fixas (Para TCC está ótimo assim. Em sistema real, viriam do banco)
  private readonly TAXA_INSS = 0.08;      // 8%
  private readonly TAXA_FGTS = 0.08;      // 8%
  private readonly TAXA_MULTA_FGTS = 0.40; // 40%

  // 1. MATEMÁTICA FINANCEIRA
  calcularCustos(dados: CriarFuncionarioDTO) {
    const { nome, salarioBase, epi = 0, outrosGastos = 0 } = dados;

    const decimoTerceiro = salarioBase / 12;
    const ferias = salarioBase / 12;
    const umTercoFerias = ferias / 3;
    
    // Encargos
    const inss = salarioBase * this.TAXA_INSS;
    const fgtsMensal = salarioBase * this.TAXA_FGTS;
    const multaFgts = fgtsMensal * this.TAXA_MULTA_FGTS;

    // Soma Total
    const custoTotal = 
      salarioBase + 
      decimoTerceiro + 
      ferias + 
      umTercoFerias + 
      inss + 
      multaFgts + 
      epi + 
      outrosGastos;

    return {
      nome,
      salario_base: salarioBase,
      decimo_terceiro: decimoTerceiro,
      ferias: ferias,
      um_terco_ferias: umTercoFerias,
      inss: inss,
      multa_fgts: multaFgts,
      epi: epi,
      outros_gastos: outrosGastos,
      custo_total_mensal: custoTotal
    };
  }

  // 2. SALVAR NO BANCO
  async criarFuncionario(dados: CriarFuncionarioDTO) {
    const calc = this.calcularCustos(dados);

    const querySQL = `
      INSERT INTO funcionarios (
        nome, salario_base, decimo_terceiro, ferias, um_terco_ferias, 
        inss, multa_fgts, epi, outros_gastos, custo_total_mensal
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;

    const valores = [
      calc.nome,
      calc.salario_base,
      calc.decimo_terceiro,
      calc.ferias,
      calc.um_terco_ferias,
      calc.inss,
      calc.multa_fgts,
      calc.epi,
      calc.outros_gastos,
      calc.custo_total_mensal
    ];

    try {
      const resultado = await pool.query(querySQL, valores);
      return resultado.rows[0];
    } catch (erro) {
      console.error('❌ Erro ao salvar funcionário:', erro);
      throw new Error('Falha no banco de dados');
    }
  }

  // 3. LISTAR E SOMAR (CORRIGIDO)
  async listarTodos() {
    try {
      const querySQL = `SELECT * FROM funcionarios ORDER BY nome ASC`;
      const resultado = await pool.query(querySQL);
      
      const listaFuncionarios = resultado.rows;

      // Otimização: Soma usando Javascript (reduce) já que temos os dados na mão
      // Não precisa ir no banco de novo
      const custoTotalMensalEmpresa = listaFuncionarios.reduce((acumulador, func) => {
        return acumulador + Number(func.custo_total_mensal);
      }, 0);

      return {
        funcionarios: listaFuncionarios,
        total_funcionarios: listaFuncionarios.length,
        custo_mensal_mao_de_obra: custoTotalMensalEmpresa.toFixed(2)
      };

    } catch (erro) {
      console.error('❌ Erro ao listar:', erro);
      throw new Error('Falha ao buscar dados');
    }
  }

  // 4. DELETAR
  async deletarFuncionario(id: number) {
    try {
      await pool.query('DELETE FROM funcionarios WHERE id = $1', [id]);
      return { mensagem: "Funcionário excluído com sucesso" };
    } catch (erro) {
      console.error('❌ Erro ao deletar:', erro);
      throw new Error('Falha ao deletar dados');
    }
  }
}