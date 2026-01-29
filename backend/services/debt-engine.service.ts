import { Debt } from "../src/models/debt.model";

export type Strategy = 'snowball' | 'avalanche';

export function calculatePayoff(
  debts: Debt[],
  extraPayment: number,
  strategy: Strategy
) {
  let month = 0;
  let totalInterest = 0;

  // clone debts so we don't mutate input
  const remaining = debts.map(d => ({ ...d }));

  // sort based on strategy
  if (strategy === 'snowball') {
    remaining.sort((a, b) => a.balance - b.balance);
  } else {
    remaining.sort((a, b) => b.interestRate - a.interestRate);
  }

  // safety cap: 50 years max
  while (remaining.some(d => d.balance > 0) && month < 600) {
    month++;

    // apply interest + minimum payments
    for (const debt of remaining) {
      if (debt.balance <= 0) continue;

      const monthlyRate = debt.interestRate / 100 / 12;
      const interest = debt.balance * monthlyRate;
      totalInterest += interest;

      debt.balance += interest;
      debt.balance -= debt.minimumPayment;

      if (debt.balance < 0) debt.balance = 0;
    }

    // apply extra payment to highest priority debt
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
