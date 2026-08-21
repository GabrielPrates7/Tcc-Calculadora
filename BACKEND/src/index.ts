import express from 'express';
import cors from 'cors';

// Importação das rotas existentes
import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';
import { funcaoRoutes } from './routes/funcao.routes';
import { funcionarioRoutes } from './routes/funcionario.routes';
import { financeiroRoutes } from './routes/financeiro.routes';
import obraRoutes from './routes/obra.routes';
import orcamentosRoutes from './routes/orcamentos.routes'; 
import dashboardRoutes from './routes/dashboard.routes';
import ordemServicoRoutes from './routes/ordemServico.routes';

// ==========================================
// NOVAS IMPORTAÇÕES
// ==========================================
import perfilRoutes from './routes/perfil.routes';
import configuracoesRoutes from './routes/configuracoes.routes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ==========================================
// ROTAS PÚBLICAS (Não exigem Token)
// ==========================================
app.use('/api/auth', authRoutes);

// ==========================================
// ROTAS RESTRITAS / ADMINISTRAÇÃO GLOBAL
// ==========================================
app.use('/api/admin', adminRoutes);

// ==========================================
// ROTAS PROTEGIDAS (Exigem Token via Middleware interno)
// ==========================================
app.use('/api/funcoes', funcaoRoutes);
app.use('/api/funcionarios', funcionarioRoutes);
app.use('/api/financeiro', financeiroRoutes);
app.use('/api/obras', obraRoutes);
app.use('/api/orcamentos', orcamentosRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ordens-servico', ordemServicoRoutes);

// ==========================================
// NOVAS ROTAS
// ==========================================
app.use('/api/perfil', perfilRoutes);
app.use('/api/configuracoes', configuracoesRoutes);

app.listen(PORT, () => {
    console.log(`🚀 Servidor backend rodando na porta ${PORT}`);
});