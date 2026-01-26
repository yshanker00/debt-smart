import { Request, Response } from 'express';
import { calculatePayoff } from '../services/debt-engine.service';

export function calculate(req: Request, res: Response) {
  const { debts, extraPayment } = req.body;

  if (!Array.isArray(debts)) {
    return res.status(400).json({ error: 'Debts must be an array' });
  }

  const snowball = calculatePayoff(debts, extraPayment || 0, 'snowball');
  const avalanche = calculatePayoff(debts, extraPayment || 0, 'avalanche');

  res.json({ snowball, avalanche });
}
