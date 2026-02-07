import { Debt } from '../models/debt.model';

export type Strategy = 'snowball' | 'avalanche';

export function calculatePayoff(
  debts: Debt[],
  extraPayment: number,
  strategy: Strategy
) {
  let month = 0;
  let totalInterest = 0;
  let totalPaid = 0;

  const remaining = debts.map(d => ({ ...d }));

  if (strategy === 'snowball') {
    remaining.sort((a, b) => a.balance - b.balance);
  } else {
    remaining.sort((a, b) => b.interestRate - a.interestRate);
  }

  while (remaining.some(d => d.balance > 0.01) && month < 600) {
    month++;

    // Apply interest first
    for (const debt of remaining) {
      if (debt.balance > 0) {
        const monthlyRate = debt.interestRate / 100 / 12;
        const interest = debt.balance * monthlyRate;
        debt.balance += interest;
        totalInterest += interest;
      }
    }

    // Pay minimum payments on all debts
    for (const debt of remaining) {
      if (debt.balance > 0) {
        const payment = Math.min(debt.minimumPayment, debt.balance);
        debt.balance -= payment;
        totalPaid += payment;
        
        if (debt.balance < 0.01) debt.balance = 0;
      }
    }

    // Apply extra payment to first debt with balance
    let remainingExtra = extraPayment;
    for (const debt of remaining) {
      if (debt.balance > 0 && remainingExtra > 0) {
        const extraAmount = Math.min(remainingExtra, debt.balance);
        debt.balance -= extraAmount;
        totalPaid += extraAmount;
        remainingExtra -= extraAmount;
        
        if (debt.balance < 0.01) debt.balance = 0;
        break; // Only pay extra to first priority debt
      }
    }
  }

  const result = {
    strategy,
    monthsToDebtFree: month,
    totalInterest: Math.round(totalInterest * 100) / 100,
    totalPaid: Math.round(totalPaid * 100) / 100
  };
  
  return result;
}
