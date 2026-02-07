import { Request, Response } from 'express';
import { calculatePayoff } from '../services/debt-engine.service';

export function calculate(req: Request, res: Response) {
  const { debts, extraPayment } = req.body;

  if (!Array.isArray(debts)) {
    return res.status(400).json({ error: 'Debts must be an array' });
  }
  
  if (debts.length === 0) {
    return res.status(400).json({ error: 'At least one debt is required' });
  }
  
  // Validate each debt
  for (let i = 0; i < debts.length; i++) {
    const debt = debts[i];
    if (!debt.balance || debt.balance <= 0) {
      return res.status(400).json({ error: `Debt ${i} must have a positive balance` });
    }
    if (debt.interestRate === undefined || debt.interestRate < 0) {
      return res.status(400).json({ error: `Debt ${i} must have a valid interest rate` });
    }
    if (!debt.minimumPayment || debt.minimumPayment <= 0) {
      return res.status(400).json({ error: `Debt ${i} must have a positive minimum payment` });
    }
    
    // Check if minimum payment can cover interest
    const monthlyInterest = debt.balance * (debt.interestRate / 100 / 12);
    if (debt.minimumPayment < monthlyInterest) {
      const minimumRequired = Math.ceil(monthlyInterest) + 10;
      return res.status(400).json({ 
        error: `"${debt.name || 'Debt ' + (i+1)}" minimum payment ($${debt.minimumPayment}) is less than monthly interest ($${monthlyInterest.toFixed(2)}). Minimum payment should be at least $${minimumRequired} to avoid debt growth.` 
      });
    }
  }

  const snowball = calculatePayoff(debts, extraPayment || 0, 'snowball');
  const avalanche = calculatePayoff(debts, extraPayment || 0, 'avalanche');
  
  const result = { snowball, avalanche };

  res.json(result);
}
