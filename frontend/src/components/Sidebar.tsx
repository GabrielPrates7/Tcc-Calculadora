import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, HardHat, DollarSign, Calculator,
  ChevronLeft, ChevronRight, ClipboardList, Settings, LogOut, 
  ShieldCheck,
  type LucideIcon
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext'; 
import logoDenarius from '../assets/images/logo-denarius.png';
import './sidebar.css';

interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
}

const MENU_PRINCIPAL: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
];

const MENU_GESTAO: MenuItem[] = [
  { id: 'orcamentos', label: 'Orçamentos', icon: Calculator, path: '/orcamentos' },
  { id: 'ordens-servico', label: 'Ordens de Serviço', icon: ClipboardList, path: '/ordens-servico' },
  { id: 'custo-obra', label: 'Custo de Produção', icon: HardHat, path: '/custo-obra' },
  { id: 'custos-despesas', label: 'Custos e Despesas', icon: DollarSign, path: '/custos-despesas' },
  { id: 'funcionarios', label: 'Funcionários', icon: Users, path: '/funcionarios' },
];

const MENU_SISTEMA: MenuItem[] = [
  { id: 'configuracoes', label: 'Configurações', icon: Settings, path: '/configuracoes' },
];

const MENU_ADMIN: MenuItem[] = [
  { id: 'admin', label: 'Painel Admin', icon: ShieldCheck, path: '/admin' },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { usuario, logout } = useAuth(); 

  const toggleSidebar = () => setIsCollapsed((prev) => !prev);

  const nomeExibicao = usuario?.nome || usuario?.nome_usuario || 'Usuário';
  const inicialAvatar = nomeExibicao.charAt(0).toUpperCase();

  const isSuperAdmin = nomeExibicao === 'Gabriel Prates';

  const renderLinks = (items: MenuItem[]) => (
    items.map((item) => (
      <NavLink
        key={item.id}
        to={item.path}
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        title={isCollapsed ? item.label : undefined}
      >
        <item.icon className="nav-icon" size={20} strokeWidth={2} />
        <span className="nav-text">{item.label}</span>
      </NavLink>
    ))
  );

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : 'expanded'}`}>
      <div className="sidebar-header">
        <div className="brand-container">
          <img src={logoDenarius} alt="Logo Denarius" className="brand-logo" />
          {!isCollapsed && (
            <span className="brand-text">DENARIUS</span>
          )}
        </div>

        <button 
          className="toggle-btn" 
          onClick={toggleSidebar}
          aria-expanded={!isCollapsed}
          aria-label="Alternar barra lateral"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <div className="sidebar-content">
        <nav className="nav-group">
          {!isCollapsed && <span className="nav-group-title">GERAL</span>}
          {renderLinks(MENU_PRINCIPAL)}
        </nav>

        <nav className="nav-group">
          {!isCollapsed && <span className="nav-group-title">OPERAÇÃO</span>}
          {renderLinks(MENU_GESTAO)}
        </nav>

        <div className="bottom-section">
          <nav className="nav-group">
            {renderLinks(MENU_SISTEMA)}
          </nav>
          
          {isSuperAdmin && (
            <nav className="nav-group" style={{ marginTop: '10px' }}>
              {!isCollapsed && <span className="nav-group-title" style={{ color: '#f97316' }}>ADMINISTRAÇÃO</span>}
              {renderLinks(MENU_ADMIN)}
            </nav>
          )}
          
          <div className="user-profile">
            <div className="avatar">
              {inicialAvatar}
            </div>
            
            {!isCollapsed && (
              <div className="user-info">
                <span className="user-name">{nomeExibicao}</span>
                <span className="user-role">{isSuperAdmin ? 'Administrador do Sistema' : 'Usuário'}</span>
              </div>
            )}
            {!isCollapsed && (
              <button className="logout-btn" title="Sair" onClick={logout}>
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}