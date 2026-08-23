import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Guarda de rota para as telas restritas ao administrador global.
 * Deve ser usada dentro de PrivateRoute (que já garante a autenticação).
 * Quem não for super admin é mandado para o dashboard, mesmo digitando
 * a URL direto no navegador.
 *
 * Isto é apenas uma barreira de navegação: quem de fato protege os dados
 * é o middleware verificarSuperAdmin no backend, que revalida a flag no
 * banco a cada requisição.
 */
export const SuperAdminRoute = () => {
    const { usuario, carregando } = useAuth();

    if (carregando) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                Carregando sistema...
            </div>
        );
    }

    return usuario?.super_admin === true ? <Outlet /> : <Navigate to="/" replace />;
};
