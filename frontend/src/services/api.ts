import axios from 'axios';

export const api = axios.create({
    baseURL: 'https://api-tcc-drs1.onrender.com/api',
});

// Interceptador de Requisição: Antes de enviar qualquer requisição, anexa o Token JWT
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('@Denarius:token');

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});

// Interceptador de Resposta (Opcional, mas recomendado para deslogar caso o token expire)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Se o servidor avisar que o token é inválido ou expirou:
            localStorage.removeItem('@Denarius:token');
            localStorage.removeItem('@Denarius:usuario');
            // Redireciona para o login (caso use React Router e janela inteira)
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);