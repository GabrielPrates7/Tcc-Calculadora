import * as express from "express";

declare global {
  namespace Express {
    interface Request {
      usuario?: {
        id: number;
        empresa_id: number;
      };
    }
  }
}