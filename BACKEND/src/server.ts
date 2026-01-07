import express from 'express';
import cors from 'cors'; // Importando o desbloqueador
import bodyParser from 'body-parser';

// Importando as rotas (O Mapa do sistema)
import funcionariosRoutes from './routes/funcionarios.routes';
import financeiroRoutes from './routes/financeiro.routes';
import obraRoutes from './routes/obra.routes';
import orcamentosRoutes from './routes/orcamentos.routes';

const app = express();

// --- 1. CONFIGURAÇÃO DO CORS (O Desbloqueio) ---
// Isso permite que o Frontend (porta 5173) converse com o Backend (porta 3000)
app.use(cors());

// --- 2. CONFIGURAÇÃO DO JSON ---
app.use(bodyParser.json());

// --- 3. DEFINIÇÃO DAS ROTAS ---

// Rota de Teste (Para saber se o servidor está vivo)
app.get('/', (req, res) => {
    res.send('Servidor Denarius está ON! 🚀');
});

// Módulo Funcionários -> localhost:3000/funcionarios
app.use('/funcionarios', funcionariosRoutes);

// Módulo Financeiro (Faturamento, Despesas, Investimentos)
// Usamos '/' para que ele assuma as rotas internas direto (ex: /faturamento)
app.use('/', financeiroRoutes);

// Módulo Custo de Obra -> localhost:3000/calculo-obra
app.use('/calculo-obra', obraRoutes);

// Módulo Orçamentos -> localhost:3000/orcamentos
app.use('/orcamentos', orcamentosRoutes);


// --- 4. INICIALIZAÇÃO ---
app.listen(3000, () => {
    console.log('------------------------------------------------');
    console.log('🚀 SERVIDOR DENARIUS RODANDO!');
    console.log('🔓 CORS: Ativado (Frontend liberado)');
    console.log('📍 Local: http://localhost:3000');
    console.log('------------------------------------------------');
});