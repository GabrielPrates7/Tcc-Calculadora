import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Orcamentos } from './pages/Orcamentos';
import { Financeiro } from './pages/Financeiro';
import { Funcionarios } from './pages/Funcionarios';
import { CustoObra } from './pages/CustoObra'; // <--- 1. IMPORTA A NOVA TELA

function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f4f9' }}>
        
        <Sidebar />

        <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
          <Routes>
            <Route path="/" element={<h2>Bem-vindo ao Dashboard (Em construção)</h2>} />
            
            <Route path="/orcamentos" element={<Orcamentos />} />
            <Route path="/financeiro" element={<Financeiro />} />
            <Route path="/funcionarios" element={<Funcionarios />} />
            
            {/* 2. ATUALIZA A ROTA PARA USAR O COMPONENTE REAL */}
            <Route path="/custo-obra" element={<CustoObra />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App;