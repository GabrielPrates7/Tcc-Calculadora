import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import { Sidebar } from './components/Sidebar';

// Telas de Autenticação (Agora no padrão modular)
import { Login } from './modules/auth/Login';
import { Registro } from './modules/auth/Registro';

// Telas do Sistema
import { Orcamentos } from './modules/orcamentos/Orcamentos';
import { Financeiro } from './modules/financeiro/Financeiro';
import { Funcionarios } from './modules/funcionarios/Funcionarios';
import { CustoObra } from './modules/custo-obra/CustoObra';
import { OrdemServicoKanban } from './modules/ordemServico/ordemServico';
import { Dashboard } from './modules/dashboard/Dashboard'; 
import { Configuracoes } from './modules/configuracoes/Configuracoes';

const PrivateLayout = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ToastContainer 
          theme="dark"
          position="top-right" 
          autoClose={3000}
        />
        
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />

          {/* Rotas Protegidas */}
          <Route element={<PrivateRoute />}>
            <Route element={<PrivateLayout />}>
              <Route path="/" element={<Dashboard />} /> 
              <Route path="/orcamentos" element={<Orcamentos />} />
              <Route path="/custos-despesas" element={<Financeiro />} />
              <Route path="/funcionarios" element={<Funcionarios />} />
              <Route path="/custo-obra" element={<CustoObra />} />
              <Route path="/ordens-servico" element={<OrdemServicoKanban />} />
              <Route path="/configuracoes" element={<Configuracoes />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;