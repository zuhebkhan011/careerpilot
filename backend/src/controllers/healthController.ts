import { Request, Response } from 'express';

export const getHealth = (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: 'CareerPilot API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
};
