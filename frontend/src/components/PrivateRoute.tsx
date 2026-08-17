import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const PrivateRoute = () => {
    const { autenticado, carregando } = useAuth();

    if (carregando) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                Carregando sistema...
            </div>
        );
    }

    // Se o usuário estiver autenticado, renderiza a rota filha (Outlet). 
    // Caso contrário, redireciona para a tela de login substituindo o histórico de navegação (replace).
    return autenticado ? <Outlet /> : <Navigate to="/login" replace />;
};