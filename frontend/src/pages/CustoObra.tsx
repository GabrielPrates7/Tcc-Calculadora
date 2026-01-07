import { useState, useEffect } from 'react';
import { HardHat, Clock, Users, Calendar, Briefcase, Calculator, AlertTriangle } from 'lucide-react';
import './CustoObra.css';

export function CustoObra() {
  // --- Estados Unificados ---
  const [tipoTempo, setTipoTempo] = useState<'dias' | 'horas'>('horas');
  const [tipoOrganizacao, setTipoOrganizacao] = useState<'individual' | 'grupo'>('individual');
  
  // AQUI ESTÁ A MÁGICA: Um único estado para o tempo
  const [tempoInput, setTempoInput] = useState(0);
  
  const [qtdUnidades, setQtdUnidades] = useState(1);
  const [tamanhoGrupo, setTamanhoGrupo] = useState(2);

  // Resultados
  const [custoEquipe, setCustoEquipe] = useState(0);
  const [valorUnitario, setValorUnitario] = useState(0);
  
  const [versaoDados, setVersaoDados] = useState(0);
  const API_URL = 'http://localhost:3000/calculo-obra';

  // --- EFEITO: Buscar Dados ---
  useEffect(() => {
    async function buscarDados() {
      try {
        const res = await fetch(API_URL);
        const data = await res.json();
        const conf = data.config;
        const modo = conf.tipo_tempo || 'horas';

        setTipoTempo(modo);
        setTipoOrganizacao(conf.tipo_organizacao || 'individual');
        setQtdUnidades(Number(conf.qtd_unidades) || 1);
        setTamanhoGrupo(Number(conf.tamanho_grupo) || 2);

        // Se o modo for 'dias', pega do campo dias. Se for 'horas', pega do campo horas.
        if (modo === 'dias') {
            setTempoInput(Number(conf.dias_trabalhados_mes) || 20);
        } else {
            setTempoInput(Number(conf.horas_trabalhadas_dia) || 160);
        }

        setCustoEquipe(Number(data.calculo.custoEquipeMensal) || 0);
        setValorUnitario(Number(data.calculo.valorUnitario) || 0);

      } catch (error) {
        console.error("Erro ao carregar:", error);
      }
    }
    buscarDados();
  }, [versaoDados]);

  // --- AÇÃO: Atualizar ---
  async function handleAtualizar() {
    try {
      // Agora enviamos 'tempoInput', que o seu Backend já sabe ler!
      await fetch(API_URL, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ 
            tempoInput, 
            qtdUnidades, 
            tipoTempo, tipoOrganizacao, tamanhoGrupo 
        })
      });
      setVersaoDados(v => v + 1);
      alert("Cálculo atualizado com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar.");
    }
  }

  // Textos Dinâmicos
  const getTituloResultado = () => {
    const tempo = tipoTempo === 'dias' ? 'Dia' : 'Hora';
    let sujeito = 'Funcionário';
    if (tipoOrganizacao === 'grupo') sujeito = tamanhoGrupo === 2 ? 'Dupla' : 'Equipe';
    return `Custo do ${tempo} por ${sujeito}`;
  };

  const getLabelInputTempo = () => {
      if (tipoTempo === 'dias') return "📅 Dias Trabalhados no Mês";
      return "⏰ Horas TOTAIS Trabalhadas no Mês";
  };

  return (
    <div className="custo-obra-container">
      <h1>Custo Operacional 🏗️</h1>
      
      {/* Alerta de Segurança */}
      {custoEquipe === 0 && (
          <div style={{background: '#fff3cd', color: '#856404', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #ffeeba', display: 'flex', alignItems: 'center', gap: '10px'}}>
              <AlertTriangle size={24} />
              <div>
                  <strong>Atenção: Custo de equipe zerado.</strong><br/>
                  Cadastre salários na tela "Funcionários" para o cálculo funcionar.
              </div>
          </div>
      )}

      {/* --- RESULTADO --- */}
      <div className="card-resultado">
        <div className="resultado-titulo">{getTituloResultado()}</div>
        <div className="resultado-valor">
            R$ {valorUnitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </div>
        <div className="resultado-info">
            Baseado no Custo Mensal Total de <strong>R$ {custoEquipe.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
        </div>
      </div>

      <div className="config-grid">
        
        {/* --- FORMULÁRIO --- */}
        <div className="card-config">
            <h2><Calculator size={20} style={{marginRight:'8px'}}/> Configuração</h2>
            
            {/* 1. MODO DE COBRANÇA */}
            <div className="input-group">
                <label>Como você cobra o cliente?</label>
                <div style={{display:'flex', gap:'10px'}}>
                    <button 
                        className={`btn-opcao ${tipoTempo === 'horas' ? 'ativo' : ''}`}
                        onClick={() => setTipoTempo('horas')}
                    ><Clock size={16}/> Por Hora</button>
                    
                    <button 
                        className={`btn-opcao ${tipoTempo === 'dias' ? 'ativo' : ''}`}
                        onClick={() => setTipoTempo('dias')}
                    ><Calendar size={16}/> Por Dia</button>
                </div>
            </div>

            {/* 2. MODO DE EQUIPE */}
            <div className="input-group">
                <label>Quem executa o serviço?</label>
                <div style={{display:'flex', gap:'10px'}}>
                    <button 
                        className={`btn-opcao ${tipoOrganizacao === 'individual' ? 'ativo' : ''}`}
                        onClick={() => { setTipoOrganizacao('individual'); setQtdUnidades(1); }}
                    ><Users size={16}/> Individual</button>
                    
                    <button 
                        className={`btn-opcao ${tipoOrganizacao === 'grupo' ? 'ativo' : ''}`}
                        onClick={() => setTipoOrganizacao('grupo')}
                    ><Briefcase size={16}/> Em Grupo</button>
                </div>
            </div>

            <div style={{marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '15px'}}>
                
                {/* CAMPO DINÂMICO 1: Qtd Pessoas/Equipes */}
                {tipoOrganizacao === 'grupo' && (
                    <div className="input-group">
                        <label>Tamanho da Equipe (Ex: 2 para Dupla)</label>
                        <input type="number" value={tamanhoGrupo} onChange={e => setTamanhoGrupo(Number(e.target.value))} />
                    </div>
                )}
                
                <div className="input-group">
                    <label>
                        {tipoOrganizacao === 'individual' 
                            ? 'Quantos funcionários trabalham nessa função?' 
                            : `Quantas equipes (${tamanhoGrupo} pessoas) existem?`
                        }
                    </label>
                    <input type="number" value={qtdUnidades} onChange={e => setQtdUnidades(Number(e.target.value))} />
                </div>

                {/* CAMPO DINÂMICO 2: TEMPO ÚNICO (O Segredo!) */}
                <div className="input-group">
                    <label>{getLabelInputTempo()}</label>
                    <input 
                        type="number" 
                        value={tempoInput} 
                        onChange={e => setTempoInput(Number(e.target.value))} 
                        style={{border: '2px solid #3b82f6', backgroundColor: '#f0f9ff'}} 
                    />
                    <small style={{color: '#64748b'}}>
                        {tipoTempo === 'horas' 
                         ? 'Ex: 176 horas (22 dias x 8h)' 
                         : 'Ex: 22 dias úteis'}
                    </small>
                </div>

            </div>

            <button className="btn-atualizar" onClick={handleAtualizar}>
                Recalcular Custo
            </button>
        </div>

        {/* --- EXPLICAÇÃO --- */}
        <div className="card-config">
            <h2><HardHat size={20} style={{marginRight:'8px'}}/> Resumo</h2>
            <div className="formula-box">
                <p>O custo é calculado dividindo o total de despesas da equipe pela capacidade de produção.</p>
                <ul style={{paddingLeft: '20px', lineHeight: '1.8'}}>
                    <li>Custo Total Equipe: <strong>R$ {custoEquipe.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</strong></li>
                    <li>Capacidade Total: <strong>{tempoInput * qtdUnidades} {tipoTempo}</strong></li>
                </ul>
                
                <div className="formula-total">
                    {custoEquipe.toLocaleString('pt-BR', {minimumFractionDigits: 2})} ÷ ({tempoInput} x {qtdUnidades})
                    <br/>
                    = <strong>R$ {valorUnitario.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</strong>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}