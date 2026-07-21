import express from 'express';
import cors from 'cors';

import { funcaoRoutes } from './routes/funcao.routes';
import { funcionarioRoutes } from './routes/funcionario.routes';
import { financeiroRoutes } from './routes/financeiro.routes';
// 1. ADICIONADO: Importação da nossa nova rota de Custo de Obra
import obraRoutes from './routes/obra.routes'; 

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use('/api/funcoes', funcaoRoutes);
app.use('/api/funcionarios', funcionarioRoutes);
app.use('/api/financeiro', financeiroRoutes);

// 2. ADICIONADO: Registro da rota seguindo o padrão da sua arquitetura
app.use('/api/obras', obraRoutes);

app.listen(PORT, () => {
    console.log(`🚀 Servidor backend rodando na porta ${PORT}`);
});