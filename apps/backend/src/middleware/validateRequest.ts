import { Request, Response, NextFunction } from 'express';
import { Schema } from 'zod';

export const validateRequest = (schema: Schema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      });
      next();
    } catch (error) {
      res.status(400).json({ error: 'Validation failed' });
    }
  };
}; 