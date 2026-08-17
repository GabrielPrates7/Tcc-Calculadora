import { createContext, useState, useContext, type ReactNode } from 'react';

// Tipagem expandida para capturar o formato exato que o Node.js envia
interface Usuario {
    nome?: string;
    nome_usuario?: string;
    email?: string;
}

interface AuthContextData {
    autenticado: boolean;
    usuario: Usuario | null;
    carregando: boolean;
    login: (token: string, dadosUsuario: Usuario) => void;
    logout: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [usuario, setUsuario] = useState<Usuario | null>(() => {
        const tokenSalvo = localStorage.getItem('@Denarius:token');
        const usuarioSalvo = localStorage.getItem('@Denarius:usuario');
        
        if (tokenSalvo && usuarioSalvo) {
            return JSON.parse(usuarioSalvo);
        }
        return null;
    });

    const [carregando] = useState(false);

    const login = (token: string, dadosUsuario: Usuario) => {
        localStorage.setItem('@Denarius:token', token);
        localStorage.setItem('@Denarius:usuario', JSON.stringify(dadosUsuario));
        setUsuario(dadosUsuario);
    };

    const logout = () => {
        localStorage.removeItem('@Denarius:token');
        localStorage.removeItem('@Denarius:usuario');
        setUsuario(null);
    };

    return (
        <AuthContext.Provider value={{ autenticado: !!usuario, usuario, carregando, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);