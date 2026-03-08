import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, HardHat, DollarSign, Calculator,
  ChevronLeft, ChevronRight, ClipboardList // <-- Ícone novo adicionado aqui!
} from 'lucide-react';
import './Sidebar.css';

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { id: 'funcionarios', label: 'Funcionários', icon: Users, path: '/funcionarios' },
    { id: 'custo-obra', label: 'Custo de Obra', icon: HardHat, path: '/custo-obra' },
    { id: 'financeiro', label: 'Financeiro', icon: DollarSign, path: '/financeiro' },
    { id: 'orcamentos', label: 'Orçamentos', icon: Calculator, path: '/orcamentos' },
    // 👇 NOVA TELA ADICIONADA AQUI 👇
    { id: 'ordens-servico', label: 'Ordens de Serviço', icon: ClipboardList, path: '/ordens-servico' }, 
  ];

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : 'expanded'}`}>
      {/* CABEÇALHO */}
      <div className="sidebar-header">
        {!isCollapsed && (
            <div className="logo-text">
                Denarius<span className="logo-highlight">.</span>
            </div>
        )}
        <button className="toggle-btn" onClick={toggleSidebar}>
          {isCollapsed ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
        </button>
      </div>

      {/* NAVEGAÇÃO */}
      <nav className="nav-links">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <div
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
              title={isCollapsed ? item.label : ''}
            >
              <item.icon className="nav-icon" size={20} />
              <span className="nav-text">{item.label}</span>
            </div>
          );
        })}
      </nav>
      
      {/* Rodapé decorativo ou versão */}
      <div className="sidebar-footer">
          {!isCollapsed && <span style={{fontSize: '0.75rem', color: '#64748b'}}>v1.0.0</span>}
      </div>
    </div>
  );
}