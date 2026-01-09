import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  
  const navigate = useNavigate();
  const location = useLocation();

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { id: 'funcionarios', label: 'Funcionários', icon: Users, path: '/funcionarios' },
    { id: 'custo-obra', label: 'Custo de Obra', icon: HardHat, path: '/custo-obra' },
    { id: 'financeiro', label: 'Financeiro', icon: DollarSign, path: '/financeiro' },
    { id: 'orcamentos', label: 'Orçamentos', icon: Calculator, path: '/orcamentos' },
  ];

  return (
    <div 
      className={`sidebar ${isCollapsed ? 'collapsed' : 'expanded'}`}
      // 2. Estilo INLINE para garantir o visual Dark Navy
      style={{
        backgroundColor: '#1e293b', // Azul Petróleo
        borderRight: '1px solid #334155', // Borda sutil
        color: '#f8fafc' // Texto claro
      }}
    >
      <div className="sidebar-header">
        {!isCollapsed && (
            <div className="logo-text" style={{color: 'white'}}>
                Denarius<span className="logo-highlight" style={{color: '#3b82f6'}}>.</span>
            </div>
        )}
        <button className="toggle-btn" onClick={toggleSidebar} style={{color: 'white'}}>
          {isCollapsed ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
        </button>
      </div>

      <nav className="nav-links">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <div 
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
              title={isCollapsed ? item.label : ''}
              // Ajuste para hover ficar bonito no tema escuro
              style={{ color: isActive ? '#3b82f6' : '#cbd5e1' }}
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