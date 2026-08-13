import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // OBRIGATÓRIO

import { Sidebar } from './components/Sidebar';
import { Orcamentos } from './modules/orcamentos/Orcamentos';
import { Financeiro } from './modules/financeiro/Financeiro';
import { Funcionarios } from './modules/funcionarios/Funcionarios';
import { CustoObra } from './modules/custo-obra/CustoObra';
import { OrdemServicoKanban } from './modules/ordemServico/ordemServico';
import { Dashboard } from './modules/dashboard/Dashboard'; 
import { Configuracoes } from './modules/configuracoes/Configuracoes';

function App() {
  return (
    <BrowserRouter>
      {/* NOVO CONTAINER DE AVISOS */}
      <ToastContainer 
        theme="dark"
        position="top-right" 
        autoClose={3000}
      />
      
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />

        <main style={{ flex: 1, overflowY: 'auto' }}> 
          <Routes>
            <Route path="/" element={<Dashboard />} /> 
            
            <Route path="/orcamentos" element={<Orcamentos />} />
            
            {/* CORREÇÃO APLICADA AQUI: Sincronia de rota com a Sidebar */}
            <Route path="/custos-fixos" element={<Financeiro />} />
            
            <Route path="/funcionarios" element={<Funcionarios />} />
            <Route path="/custo-obra" element={<CustoObra />} />
            <Route path="/ordens-servico" element={<OrdemServicoKanban />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App;