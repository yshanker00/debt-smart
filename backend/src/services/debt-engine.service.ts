import { Debt } from '../models/debt.model';

export type Strategy = 'snowball' | 'avalanche';

export function calculatePayoff(
  debts: Debt[],
  extraPayment: number,
  strategy: Strategy
) {
  let month = 0;
  let totalInterest = 0;

  const remaining = debts.map(d => ({ ...d }));

  if (strategy === 'snowball') {
    remaining.sort((a, b) => a.balance - b.balance);
  } else {
    remaining.sort((a, b) => b.interestRate - a.interestRate);
  }

  while (remaining.some(d => d.balance > 0) && month < 600) {
    month++;

    for (const debt of remaining) {
      if (debt.balance <= 0) continue;

      const monthlyRate = debt.interestRate / 100 / 12;
      const interest = debt.balance * monthlyRate;
      totalInterest += interest;

      debt.balance += interest;
      debt.balance -= debt.minimumPayment;

      if (debt.balance < 0) debt.balance = 0;
    }

    const target = remaining.find(d => d.balance > 0);
    if (target) {
      target.balance -= extraPayment;
      if (target.balance < 0) target.balance = 0;
    }
  }

  return {
    strategy,
    monthsToDebtFree: month,
    totalInterest: Number(totalInterest.toFixed(2))
  };
}
