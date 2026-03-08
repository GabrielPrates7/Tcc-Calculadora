import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

// --- IMPORTANDO ROTAS ---
import funcionariosRoutes from './routes/funcionarios.routes';
import financeiroRoutes from './routes/financeiro.routes';
import obraRoutes from './routes/obra.routes'; // Confirme se o arquivo chama 'obra.routes.ts' ou 'calculo-obra.routes.ts'
import orcamentosRoutes from './routes/orcamentos.routes';
import ordemServicoRoutes from './routes/ordemServico.routes';

const app = express();

// --- 1. CONFIGURAÇÃO DO CORS ---
app.use(cors());

// --- 2. CONFIGURAÇÃO DO JSON ---
app.use(express.json()); // (Substitui o bodyParser, é mais moderno, mas faz a mesma coisa)

// --- 3. DEFINIÇÃO DAS ROTAS ---

// Rota de Teste
app.get('/', (req, res) => {
    res.send('Servidor Denarius está ON! 🚀');
});

// Módulo Funcionários
app.use('/funcionarios', funcionariosRoutes);

// Módulo Financeiro (AQUI ESTAVA O ERRO)
// Antes estava '/', agora colocamos o prefixo correto:
app.use('/financeiro', financeiroRoutes); 

// Módulo Custo de Obra
app.use('/calculo-obra', obraRoutes);

// Módulo Orçamentos
app.use('/orcamentos', orcamentosRoutes);

app.use('/ordens-servico', ordemServicoRoutes);

// --- 4. INICIALIZAÇÃO ---
app.listen(3000, () => {
    console.log('------------------------------------------------');
    console.log('🚀 SERVIDOR DENARIUS RODANDO!');
    console.log('🔓 CORS: Ativado (Frontend liberado)');
    console.log('📍 Local: http://localhost:3000');
    console.log('------------------------------------------------');
});