import rateLimit from 'express-rate-limit';

/**
 * Limite de tentativas nas rotas públicas de autenticação.
 *
 * Sem isto, /auth/login fica aberto a força bruta: a rota é pública, não há
 * bloqueio de conta e cada tentativa custa apenas uma requisição.
 *
 * O contador é por IP. Requer `trust proxy` configurado corretamente em
 * index.ts — atrás do proxy do Render, sem essa configuração o Express
 * enxergaria sempre o IP do proxy e todos os usuários cairiam no mesmo balde.
 */
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    limit: 5,
    standardHeaders: 'draft-8', // expõe RateLimit-* para o cliente
    legacyHeaders: false,
    // Só tentativas malsucedidas contam: quem acerta a senha não é penalizado
    skipSuccessfulRequests: true,
    message: {
        error: 'Muitas tentativas de login. Aguarde 15 minutos e tente novamente.'
    }
});

/**
 * Limite para criação de contas, evitando cadastro automatizado em massa.
 * Mais folgado que o login por ser uma ação legítima esporádica.
 */
export const registroLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    limit: 10,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
        error: 'Muitas tentativas de cadastro. Aguarde 15 minutos e tente novamente.'
    }
});
