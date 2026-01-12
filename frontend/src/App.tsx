import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Orcamentos } from './modules/orcamentos/Orcamentos';
import { Financeiro } from './modules/financeiro/Financeiro';
// CORREÇÃO: Importando do novo módulo organizado
import { Funcionarios } from './modules/funcionarios/Funcionarios';
import { CustoObra } from './modules/custo-obra/CustoObra';

function App() {
  return (
    <BrowserRouter>
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