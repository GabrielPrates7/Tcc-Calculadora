import { useState, useEffect } from 'react';
import { Users, Save, Trash2, Edit2, XCircle, HardHat } from 'lucide-react';
import './Funcionarios.css';

interface Funcionario {
  id: number;
  nome: string;
  salario_base: string;
  epi: string;
  // Campos calculados pelo backend
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
  const [salario, setSalario] = useState('');
  const [epi, setEpi] = useState('');
  
  // Controle de Edição
  const [idEditando, setIdEditando] = useState<number | null>(null);

  const API_URL = 'http://localhost:3000/funcionarios';

  // Carregar dados
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

  // Salvar (Criar ou Editar)
  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    if (!nome || !salario) return alert("Preencha nome e salário!");

    const corpo = {
      nome,
      salario: Number(salario),
      epi: Number(epi)
    };

    try {
      if (idEditando) {
        // PUT
        await fetch(`${API_URL}/${idEditando}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(corpo)
        });
      } else {
        // POST
        await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(corpo)
        });
      }

      limparForm();
      setVersaoDados(v => v + 1);
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar funcionário.");
    }
  }

  function iniciarEdicao(func: Funcionario) {
    setIdEditando(func.id);
    setNome(func.nome);
    setSalario(func.salario_base);
    setEpi(func.epi);
    document.getElementById('inputNome')?.focus();
  }

  function limparForm() {
    setIdEditando(null);
    setNome('');
    setSalario('');
    setEpi('');
  }

  async function excluir(id: number) {
    if (!confirm("Tem certeza que deseja excluir?")) return;
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      setVersaoDados(v => v + 1);
    } catch (error) {
      console.error("Erro ao excluir:", error);
    }
  }

  const custoTotalEquipe = funcionarios.reduce((acc, f) => acc + Number(f.custo_total_mensal), 0);

  // Função auxiliar para formatar dinheiro
  const BRL = (valor: string | number) => {
    return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="funcionarios-container">
      
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap: 'wrap', gap: '10px'}}>
        <h1>Equipe & Custos 👷‍♂️</h1>
        <div style={{textAlign:'right'}}>
            <small style={{color:'#64748b'}}>Custo Mensal da Equipe</small>
            <div style={{fontSize:'1.5rem', fontWeight:'bold', color:'#1e293b'}}>
                {BRL(custoTotalEquipe)}
            </div>
        </div>
      </div>

      {/* CARD DE CADASTRO */}
      <div className="card-cadastro">
        <h2>
            {idEditando ? <Edit2 size={24} /> : <Users size={24} />}
            {idEditando ? 'Editar Funcionário' : 'Novo Colaborador'}
        </h2>
        
        <form onSubmit={handleSalvar} className="form-funcionario">
            <div>
                <label>Nome Completo</label>
                <input 
                    id="inputNome" type="text" placeholder="Ex: João da Silva" 
                    value={nome} onChange={e => setNome(e.target.value)}
                />
            </div>
            <div>
                <label>Salário Base (R$)</label>
                <input 
                    type="number" placeholder="0.00" 
                    value={salario} onChange={e => setSalario(e.target.value)}
                />
            </div>
            <div>
                <label>EPI / Vale / Outros (R$)</label>
                <input 
                    type="number" placeholder="0.00" 
                    value={epi} onChange={e => setEpi(e.target.value)}
                />
            </div>
            
            {idEditando ? (
                <div style={{display:'flex', gap:'10px'}}>
                    <button type="submit" className="btn-salvar"> <Save size={18} /> Salvar </button>
                    <button type="button" className="btn-salvar btn-cancelar" onClick={limparForm}> <XCircle size={18} /> </button>
                </div>
            ) : (
                <button type="submit" className="btn-salvar"> <Save size={18} /> Cadastrar </button>
            )}
        </form>
      </div>

      {/* LISTA DE FUNCIONÁRIOS (TABELA COMPLETA) */}
      <div className="card-lista">
        <div className="table-responsive"> {/* Scroll aqui */}
            <table>
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th title="Salário Base">Salário</th>
                        <th title="Provisão mensal de 13º">13º (Prov.)</th>
                        <th title="Provisão mensal de Férias">Férias (Prov.)</th>
                        <th title="1/3 de Férias">1/3 Férias</th>
                        <th title="INSS Patronal ou desc.">INSS (8%)</th>
                        <th title="Multa FGTS (40%)">Multa FGTS</th>
                        <th>EPI/Outros</th>
                        <th>Somatório</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {funcionarios.map(func => (
                        <tr key={func.id}>
                            <td style={{fontWeight:'500'}}>{func.nome}</td>
                            <td className="col-destaque">{BRL(func.salario_base)}</td>
                            <td>{BRL(func.decimo_terceiro)}</td>
                            <td>{BRL(func.ferias)}</td>
                            <td>{BRL(func.um_terco_ferias)}</td>
                            <td>{BRL(func.inss)}</td>
                            <td>{BRL(func.multa_fgts)}</td>
                            <td>{BRL(func.epi)}</td>
                            <td className="col-total">{BRL(func.custo_total_mensal)}</td>
                            <td>
                                <div className="acoes">
                                    <button className="btn-icon btn-edit" onClick={() => iniciarEdicao(func)}>
                                        <Edit2 size={16} />
                                    </button>
                                    <button className="btn-icon btn-delete" onClick={() => excluir(func.id)}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {funcionarios.length === 0 && (
                        <tr>
                            <td colSpan={10} style={{textAlign:'center', padding:'30px', color:'#94a3b8'}}>
                                <HardHat size={40} style={{marginBottom:'10px', opacity:0.5}} /><br/>
                                Nenhum funcionário cadastrado.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

    </div>
  );
}