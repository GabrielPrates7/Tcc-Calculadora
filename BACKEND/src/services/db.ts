import { Pool } from 'pg';

/**
 * Controla o TLS da conexão com o Postgres via DB_SSL ('true'/'false').
 * Sem a variável definida, preserva o comportamento histórico: SSL desligado
 * só quando DB_HOST é literalmente 'localhost', ligado (sem verificar
 * certificado) em qualquer outro host.
 */
const sslHabilitado = process.env.DB_SSL !== undefined
    ? process.env.DB_SSL === 'true'
    : process.env.DB_HOST !== 'localhost';

export const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
    ssl: sslHabilitado ? { rejectUnauthorized: false } : false
});