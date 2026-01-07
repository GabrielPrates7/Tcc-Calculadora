import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // <--- Importamos os hooks de rota
import { 
  LayoutDashboard, 
  Users, 
  HardHat, 
  DollarSign, 
  Calculator, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';
import './Sidebar.css';

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const navigate = useNavigate(); // Função para mudar de página
  const location = useLocation(); // Função para saber onde estamos

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { id: 'funcionarios', label: 'Funcionários', icon: Users, path: '/funcionarios' },
    { id: 'custo-obra', label: 'Custo de Obra', icon: HardHat, path: '/custo-obra' },
    { id: 'financeiro', label: 'Financeiro', icon: DollarSign, path: '/financeiro' },
    { id: 'orcamentos', label: 'Orçamentos', icon: Calculator, path: '/orcamentos' },
  ];

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : 'expanded'}`}>
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

      <nav className="nav-links">
        {menuItems.map((item) => {
          // Verifica se a URL atual começa com o caminho do item
          const isActive = location.pathname === item.path;
          
          return (
            <div 
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => navigate(item.path)} // Navega sem recarregar
              title={isCollapsed ? item.label : ''}
            >
              <item.icon className="nav-icon" size={20} />
              <span className="nav-text">{item.label}</span>
            </div>
          );
        })}
      </nav>
    </div>
  );
}