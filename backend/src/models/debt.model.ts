export interface Debt {
  name: string;
  balance: number;
  interestRate: number; // annual %
  minimumPayment: number;
}
