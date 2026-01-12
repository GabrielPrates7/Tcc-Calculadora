// ARQUIVO: BACKEND/src/services/funcionario.service.ts

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

export function calcularEncargos(salario: number, epi: number): EncargosSociais {
    // 1. Provisão de 13º Salário (8,33%)
    const decimoTerceiro = salario / 12;

    // 2. Provisão de Férias (8,33%)
    const ferias = salario / 12;

    // 3. Adicional de 1/3 sobre Férias
    const umTercoFerias = ferias / 3;

    // 4. INSS Patronal / Encargos (Estimado em 8%)
    const inss = salario * 0.08;

    // 5. Multa FGTS (40% sobre o depósito mensal de 8%)
    // Conta: 0.08 * 0.40 = 0.032 (3,2% do salário)
    const multaFgts = salario * 0.032; 

    // 6. Custo Total Mensal
    const custoTotal = salario + epi + decimoTerceiro + ferias + umTercoFerias + inss + multaFgts;

    return {
        salarioBase: salario,
        epi: epi,
        decimoTerceiro: decimoTerceiro,
        ferias: ferias,
        umTercoFerias: umTercoFerias,
        inss: inss,
        multaFgts: multaFgts,
        custoTotal: custoTotal
    };
}