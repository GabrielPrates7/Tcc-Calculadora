import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Componentes de Autenticação
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';

// Estrutura
import { Sidebar } from './components/Sidebar';

// Telas do Sistema
import { Orcamentos } from './modules/orcamentos/Orcamentos';
import { Financeiro } from './modules/financeiro/Financeiro';
import { Funcionarios } from './modules/funcionarios/Funcionarios';
import { CustoObra } from './modules/custo-obra/CustoObra';
import { OrdemServicoKanban } from './modules/ordemServico/ordemServico';
import { Dashboard } from './modules/dashboard/Dashboard'; 
import { Configuracoes } from './modules/configuracoes/Configuracoes';

// Componentes temporários de Login e Registro (Criaremos a UI no próximo passo)
const LoginTemp = () => <div style={{ padding: '2rem' }}><h1>Tela de Login em construção</h1></div>;
const RegistroTemp = () => <div style={{ padding: '2rem' }}><h1>Tela de Registro em construção</h1></div>;

// Layout exclusivo para usuários autenticados (impede que a Sidebar apareça na tela de login)
const PrivateLayout = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, overflowY: 'auto' }}>
        <Outlet /> {/* Aqui o React injeta a rota filha (Dashboard, Orçamentos, etc) */}
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
          {/* ============================== */}
          {/* ROTAS PÚBLICAS (Sem Sidebar) */}
          {/* ============================== */}
          <Route path="/login" element={<LoginTemp />} />
          <Route path="/registro" element={<RegistroTemp />} />

          {/* ============================== */}
          {/* ROTAS PROTEGIDAS (Com Sidebar) */}
          {/* ============================== */}
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

          {/* Fallback de rotas não encontradas */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;