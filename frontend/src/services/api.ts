import axios from 'axios';

export const api = axios.create({
    baseURL: 'http://localhost:3000/api', // Porta padrão definida no seu index.ts do backend
});

// Interceptador de Requisição: Injeta o token antes de enviar ao Node.js
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('@Denarius:token');
    
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
}, (error) => {
    return Promise.reject(error);
});