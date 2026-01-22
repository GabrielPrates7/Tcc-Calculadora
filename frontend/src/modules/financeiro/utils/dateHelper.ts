// ARQUIVO: src/modules/financeiro/utils/dateHelper.ts

export const MESES_CURTOS = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
export const MESES_LONGOS = ['JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO', 'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'];

export function analisarIntervalo(inicio: string, fim: string) {
    if (!inicio || !fim) return { label: '', meses: [], ano: null, isMesUnico: false };

    // Adiciona meio-dia para evitar problemas de fuso horário
    const dtInicio = new Date(inicio + 'T12:00:00');
    const dtFim = new Date(fim + 'T12:00:00');

    const mesesEncontrados: number[] = []; 
    const anoEncontrado = dtInicio.getFullYear();

    // CORREÇÃO: Mudamos para 'const'. 
    // O objeto muda internamente, mas a variável 'cursor' aponta sempre para o mesmo objeto.
    const cursor = new Date(dtInicio);

    while (cursor <= dtFim) {
        // Se virar o ano (ex: Dez/25 a Jan/26), tratamos como período complexo
        if (cursor.getFullYear() !== anoEncontrado) {
            return { label: 'PERÍODO MULTIANUAL', meses: [], ano: null, isMesUnico: false };
        }
        
        const mes = cursor.getMonth();
        
        if (!mesesEncontrados.includes(mes)) {
            mesesEncontrados.push(mes);
        }

        // Avança 5 dias
        cursor.setDate(cursor.getDate() + 5);
    }

    // --- Gerar a Label ---
    let label = '';
    const isMesUnico = mesesEncontrados.length === 1;

    if (isMesUnico) {
        label = MESES_LONGOS[mesesEncontrados[0]].toUpperCase(); 
    } else if (mesesEncontrados.length <= 3) {
        label = mesesEncontrados.map(m => MESES_CURTOS[m]).join(' / '); 
    } else {
        label = `${MESES_CURTOS[mesesEncontrados[0]]} ... ${MESES_CURTOS[mesesEncontrados[mesesEncontrados.length - 1]]}`;
    }

    return { 
        label, 
        meses: mesesEncontrados, 
        ano: anoEncontrado, 
        isMesUnico 
    };
}