import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Orcamentos } from './pages/Orcamentos';
import { Financeiro } from './pages/Financeiro';
import { Funcionarios } from './pages/Funcionarios';
import { CustoObra } from './pages/CustoObra';

function App() {
  return (
    <BrowserRouter>
      {/* 1. Removido o backgroundColor fixo para usar o tema escuro do CSS */}
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        
        <Sidebar />

        <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
          <Routes>
            <Route path="/" element={<h2>Bem-vindo ao Dashboard (Em construção)</h2>} />
            
            <Route path="/orcamentos" element={<Orcamentos />} />
            <Route path="/financeiro" element={<Financeiro />} />
            <Route path="/funcionarios" element={<Funcionarios />} />
            <Route path="/custo-obra" element={<CustoObra />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App;