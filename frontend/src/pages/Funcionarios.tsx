import { useState, useEffect } from 'react';
import { Users, Save, Trash2, Edit2, XCircle, ChevronDown, ChevronUp, Wallet } from 'lucide-react';
import './Funcionarios.css';

interface Funcionario {
  id: number;
  nome: string;
  funcao?: string;
  salario_base: string;
  epi: string;
  decimo_terceiro: string;
  ferias: string;
  um_terco_ferias: string;
  inss: string;
  multa_fgts: string;
  custo_total_mensal: string;
}

export function Funcionarios() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [versaoDados, setVersaoDados] = useState(0);

  // Formulário
  const [nome, setNome] = useState('');
  const [funcao, setFuncao] = useState('');
  const [salario, setSalario] = useState('');
  const [epi, setEpi] = useState('');
  
  // Controle
  const [idEditando, setIdEditando] = useState<number | null>(null);
  const [idExpandido, setIdExpandido] = useState<number | null>(null);

  const API_URL = 'http://localhost:3000/funcionarios';

  useEffect(() => {
    async function carregar() {
      try {
        const res = await fetch(API_URL);
        const dados = await res.json();
        setFuncionarios(dados);
      } catch (error) {
        console.error("Erro ao buscar funcionários:", error);
      }
    }
    carregar();
  }, [versaoDados]);

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    if (!nome || !salario) return alert("Preencha nome e salário!");

    const corpo = {
      nome,
      funcao,
      salario: Number(salario),
      epi: Number(epi)
    };

    try {
      if (idEditando) {
        await fetch(`${API_URL}/${idEditando}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(corpo)
        });
      } else {
        await fetch(API_URL, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(corpo)
        });
      }
      limparForm();
      setVersaoDados(v => v + 1);
    } catch (error) { console.error(error); }
  }

  function iniciarEdicao(func: Funcionario) {
    setIdEditando(func.id);
    setNome(func.nome);
    setFuncao(func.funcao || '');
    setSalario(func.salario_base);
    setEpi(func.epi);
  }

  function limparForm() {
    setIdEditando(null); setNome(''); setFuncao(''); setSalario(''); setEpi('');
  }

  async function excluir(id: number) {
    if (!confirm("Excluir funcionário?")) return;
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    setVersaoDados(v => v + 1);
  }

  const custoTotalEquipe = funcionarios.reduce((acc, f) => acc + Number(f.custo_total_mensal), 0);
  const BRL = (v: string | number) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="funcionarios-container">
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'20px'}}>
        <h1>Equipe & Custos 👷‍♂️</h1>
        <div style={{
            textAlign:'right', backgroundColor: 'rgba(30, 41, 59, 0.8)', padding: '15px 25px', 
            borderRadius: '12px', border: '1px solid #334155', boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
        }}>
            <small style={{color:'#cbd5e1', fontSize:'0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '5px'}}>
                <Wallet size={16} /> Custo Mensal da Equipe
            </small>
            <div style={{fontSize:'2.2rem', fontWeight:'800', color:'#f97316', marginTop: '5px'}}>
                {BRL(custoTotalEquipe)}
            </div>
        </div>
      </div>

      <div className="card-cadastro">
        <h2>{idEditando ? <Edit2 size={24} /> : <Users size={24} />} {idEditando ? 'Editar' : 'Novo Colaborador'}</h2>
        <form onSubmit={handleSalvar} className="form-funcionario">
            <div><label>Nome</label><input type="text" value={nome} onChange={e => setNome(e.target.value)} /></div>
            <div><label>Função</label><input type="text" value={funcao} onChange={e => setFuncao(e.target.value)} /></div>
            <div><label>Salário (R$)</label><input type="number" value={salario} onChange={e => setSalario(e.target.value)} /></div>
            <div><label>EPI/Vale (R$)</label><input type="number" value={epi} onChange={e => setEpi(e.target.value)} /></div>
            <button type="submit" className="btn-salvar"><Save size={18} /> Salvar</button>
            {idEditando && <button type="button" className="btn-salvar btn-cancelar" onClick={limparForm}><XCircle size={18}/></button>}
        </form>
      </div>

      <div className="card-lista">
        <table>
            <thead>
                <tr><th>Colaborador</th><th>Função</th><th>Salário Base</th><th>Custo Mensal</th><th>Ações</th></tr>
            </thead>
            <tbody>
                {funcionarios.map(func => (
                    <>
                        <tr key={func.id} style={{backgroundColor: idExpandido === func.id ? '#eff6ff' : 'transparent'}}>
                            <td style={{fontWeight:'600'}}>{func.nome}</td>
                            <td>{func.funcao || '-'}</td>
                            <td>{BRL(func.salario_base)}</td>
                            <td><span className="custo-total-highlight">{BRL(func.custo_total_mensal)}</span></td>
                            <td>
                                <div className="acoes">
                                    <button className="btn-icon btn-expand" onClick={() => setIdExpandido(idExpandido === func.id ? null : func.id)}>
                                        {idExpandido === func.id ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
                                    </button>
                                    <button className="btn-icon btn-edit" onClick={() => iniciarEdicao(func)}><Edit2 size={16}/></button>
                                    <button className="btn-icon btn-delete" onClick={() => excluir(func.id)}><Trash2 size={16}/></button>
                                </div>
                            </td>
                        </tr>
                        {idExpandido === func.id && (
                            <tr className="row-detalhes"><td colSpan={5}>
                                <div className="detalhes-grid">
                                    <div className="detalhe-item"><span>13º</span><span>{BRL(func.decimo_terceiro)}</span></div>
                                    <div className="detalhe-item"><span>Férias</span><span>{BRL(func.ferias)}</span></div>
                                    <div className="detalhe-item"><span>1/3 Férias</span><span>{BRL(func.um_terco_ferias)}</span></div>
                                    <div className="detalhe-item"><span>INSS</span><span>{BRL(func.inss)}</span></div>
                                    <div className="detalhe-item"><span>Multa FGTS</span><span>{BRL(func.multa_fgts)}</span></div>
                                    <div className="detalhe-item"><span>EPI</span><span>{BRL(func.epi)}</span></div>
                                </div>
                            </td></tr>
                        )}
                    </>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
}