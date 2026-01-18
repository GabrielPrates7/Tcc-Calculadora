// src/modules/funcionarios/components/ResumoFinanceiro.tsx
import { Wallet, Briefcase, Users } from 'lucide-react';
import './ResumoFinanceiro.css';

interface Props {
  custoFolha: number;
  custoProducao: number;
  totalAtivos: number;
  loading: boolean;
}

export function ResumoFinanceiro({ custoFolha, custoProducao, totalAtivos, loading }: Props) {
  
  // Função auxiliar para formatar dinheiro
  const BRL = (val: number) => 
    val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="resumo-container">
      
      {/* CARD 1: TOTAL DE COLABORADORES */}
      <div className="card-resumo">
        <div className="icon-wrapper orange">
          <Users size={24} />
        </div>
        <div className="info-content">
          <span className="info-label">Equipe Ativa</span>
          {loading ? (
            <div className="skeleton-line" style={{ width: '50px' }}></div>
          ) : (
            <span className="info-valor">{totalAtivos}</span>
          )}
        </div>
      </div>

      {/* CARD 2: CUSTO FOLHA TOTAL */}
      <div className="card-resumo">
        <div className="icon-wrapper blue">
          <Wallet size={24} />
        </div>
        <div className="info-content">
          <span className="info-label">Custo Folha Mensal</span>
          {loading ? (
            <div className="skeleton-line"></div>
          ) : (
            <span className="info-valor">{BRL(custoFolha)}</span>
          )}
        </div>
      </div>

      {/* CARD 3: CUSTO PRODUÇÃO (Filtro Setor) */}
      <div className="card-resumo" style={{ borderBottom: '4px solid #16a34a' }}>
        <div className="icon-wrapper green">
          <Briefcase size={24} />
        </div>
        <div className="info-content">
          <span className="info-label">Custo Produção</span>
          {loading ? (
            <div className="skeleton-line"></div>
          ) : (
            <span className="info-valor">{BRL(custoProducao)}</span>
          )}
        </div>
      </div>

    </div>
  );
}