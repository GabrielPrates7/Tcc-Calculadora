// ResultadoCusto.tsx
import { AlertTriangle } from 'lucide-react';
import type { CustoResultado, TipoTempo, TipoOrganizacao } from '../types';
import './ResultadoCusto.css';

interface Props {
    resultado: CustoResultado;
    tipoTempo: TipoTempo;
    tipoOrganizacao: TipoOrganizacao;
    tamanhoGrupo: number;
}

export function ResultadoCusto({ resultado, tipoTempo, tipoOrganizacao, tamanhoGrupo }: Props) {
    const getTitulo = () => {
        const tempo = tipoTempo === 'dias' ? 'Dia' : 'Hora';
        let sujeito = 'Funcionário';
        if (tipoOrganizacao === 'grupo') sujeito = tamanhoGrupo === 2 ? 'Dupla' : 'Equipe';
        return `Custo do ${tempo} por ${sujeito}`;
    };

    return (
        <>
            {/* Alerta de Segurança */}
            {resultado.custoEquipeMensal === 0 && (
                <div className="alert-custo-zero">
                    <AlertTriangle size={24} />
                    <div>
                        <strong>Atenção: Custo de equipe zerado.</strong><br />
                        Cadastre salários na tela "Funcionários" para o cálculo funcionar.
                    </div>
                </div>
            )}

            <div className="card-resultado">
                <div className="resultado-titulo">{getTitulo()}</div>
                <div className="resultado-valor">
                    R$ {resultado.valorUnitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="resultado-info">
                    Baseado no Custo Mensal Total de <strong>R$ {resultado.custoEquipeMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                </div>
            </div>
        </>
    );
}