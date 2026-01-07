// src/services/db.ts
import { Pool } from 'pg';

export const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'db_industria',
    password: 'C1roAqu3m3nis#', 
    port: 5432,
});