// src/routes/funcionarios.routes.ts
import { Router, Request, Response } from 'express';
import { pool } from '../services/db';
const router = Router();

// --- INTERFACES ---
interface FuncionarioBody {
    nome: string;
    salario: string | number; 
    epi: string | number;
}

// ROTA: LISTAR (GET /)
// Note que usamos apenas '/' porque o server.ts já vai mandar para /funcionarios
router.get('/', async (req: Request, res: Response) => {
    try {
        const resultado = await pool.query('SELECT * FROM funcionarios ORDER BY id ASC');
        res.json(resultado.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao buscar dados');
    }
});

// ROTA: CRIAR (POST /)
router.post('/', async (req: Request, res: Response) => {
    const { nome, salario, epi } = req.body as FuncionarioBody; 

    const salarioBase = Number(salario);
    const valEpi = Number(epi);
    
    // Cálculos
    const decimoTerceiro = salarioBase / 12;
    const ferias = salarioBase / 12;
    const umTercoFerias = ferias / 3;
    const inss = salarioBase * 0.08; 
    const multaFgts = (salarioBase * 0.08) * 0.40;
    
    try {
        const query = `
            INSERT INTO funcionarios 
            (nome, salario_base, decimo_terceiro, um_terco_ferias, ferias, inss, multa_fgts, epi)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `;
        const values = [nome, salarioBase, decimoTerceiro, umTercoFerias, ferias, inss, multaFgts, valEpi];
        
        const novoFuncionario = await pool.query(query, values);
        res.json(novoFuncionario.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao salvar');
    }
});

// ROTA: DELETAR (DELETE /:id)
router.delete('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM funcionarios WHERE id = $1', [id]);
        res.json({ message: 'Funcionário excluído' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao excluir');
    }
});

// ROTA: ATUALIZAR (PUT /:id)
router.put('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { nome, salario, epi } = req.body as FuncionarioBody;

    const salarioBase = Number(salario);
    const valEpi = Number(epi);
    
    const decimoTerceiro = salarioBase / 12;
    const ferias = salarioBase / 12;
    const umTercoFerias = ferias / 3;
    const inss = salarioBase * 0.08;
    const multaFgts = (salarioBase * 0.08) * 0.40;

    try {
        const query = `
            UPDATE funcionarios 
            SET nome=$1, salario_base=$2, decimo_terceiro=$3, um_terco_ferias=$4, ferias=$5, inss=$6, multa_fgts=$7, epi=$8
            WHERE id=$9
        `;
        const values = [nome, salarioBase, decimoTerceiro, umTercoFerias, ferias, inss, multaFgts, valEpi, id];
        
        await pool.query(query, values);
        res.json({ message: 'Atualizado com sucesso!' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao atualizar');
    }
});

export default router;