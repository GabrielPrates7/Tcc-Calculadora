import express from 'express';
import cors from 'cors';

// Importação das rotas existentes
import { funcaoRoutes } from './routes/funcao.routes';
import { funcionarioRoutes } from './routes/funcionario.routes';
import { financeiroRoutes } from './routes/financeiro.routes';
import obraRoutes from './routes/obra.routes';
import orcamentosRoutes from './routes/orcamentos.routes'; 
import dashboardRoutes from './routes/dashboard.routes';

// 1. CORREÇÃO: Importação das rotas de Ordem de Serviço
import ordemServicoRoutes from './routes/ordemServico.routes';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Registro dos middlewares de rotas
app.use('/api/funcoes', funcaoRoutes);
app.use('/api/funcionarios', funcionarioRoutes);
app.use('/api/financeiro', financeiroRoutes);
app.use('/api/obras', obraRoutes);
app.use('/api/orcamentos', orcamentosRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 2. CORREÇÃO: Expondo a rota para responder em /api/ordens-servico
app.use('/api/ordens-servico', ordemServicoRoutes);

app.listen(PORT, () => {
    console.log(`🚀 Servidor backend rodando na porta ${PORT}`);
});