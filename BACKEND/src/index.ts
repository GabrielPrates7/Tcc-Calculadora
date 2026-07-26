import express from 'express';
import cors from 'cors';

// Importação das rotas existentes
import { funcaoRoutes } from './routes/funcao.routes';
import { funcionarioRoutes } from './routes/funcionario.routes';
import { financeiroRoutes } from './routes/financeiro.routes';
import obraRoutes from './routes/obra.routes';

// ✅ 1. ADICIONADO: Importação da rota de Orçamentos
import orcamentosRoutes from './routes/orcamentos.routes'; 

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Registro dos middlewares de rotas
app.use('/api/funcoes', funcaoRoutes);
app.use('/api/funcionarios', funcionarioRoutes);
app.use('/api/financeiro', financeiroRoutes);
app.use('/api/obras', obraRoutes);

// ✅ 2. ADICIONADO: Expondo a rota de orçamentos para o Frontend consumir
app.use('/api/orcamentos', orcamentosRoutes);

app.listen(PORT, () => {
    console.log(`🚀 Servidor backend rodando na porta ${PORT}`);
});