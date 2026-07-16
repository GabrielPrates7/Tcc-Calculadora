export const formatarBRL = (valor: string | number | null | undefined): string => {
  if (valor === null || valor === undefined) return 'R$ 0,00';

  let numero: number;

  if (typeof valor === 'string') {
    // Se a string contiver vírgula, assumimos que é padrão BR digitado pelo usuário (ex: "1.500,00")
    if (valor.includes(',')) {
      const stringLimpa = valor.replace(/\./g, '').replace(',', '.');
      numero = parseFloat(stringLimpa);
    } else {
      // Se NÃO tiver vírgula, assumimos que veio direto do Banco de Dados (ex: "1500.00" ou "1500")
      numero = parseFloat(valor);
    }
  } else {
    numero = valor; // Já é um número
  }

  // Fallback caso a conversão falhe
  if (isNaN(numero)) return 'R$ 0,00';

  // Formata o número real para a máscara de Reais com 2 casas
  return numero.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};