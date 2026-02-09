import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DebtService } from '../../services/debt';
import {
  FormArray,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormGroup
} from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-debt-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    MatListModule,
    MatTabsModule
  ],
  templateUrl: './debt-form.html',
  styleUrl: './debt-form.component.scss'
})
export class DebtFormComponent {

  form: FormGroup;
  result: any = null;
  loading = false;
  showOtherStrategies = false;
  expandedStrategies: { [key: string]: boolean } = {};

  constructor(
    private fb: FormBuilder,
    private debtService: DebtService,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      debts: this.fb.array([]),
      extraPayment: [0, [Validators.min(0)]]
    });

    this.addDebt();
  }

  get debts(): FormArray {
    return this.form.get('debts') as FormArray;
  }

  addDebt() {
    this.debts.push(
      this.fb.group({
        name: ['', Validators.required],
        balance: [0, [Validators.required, Validators.min(0)]],
        interestRate: [0, [Validators.required, Validators.min(0)]],
        minimumPayment: [0, [Validators.required, Validators.min(0)]]
      })
    );
  }

  loadExampleDebts() {
    const examples = [
      { name: 'Student Loan', balance: 3000, interestRate: 6, minimumPayment: 100 },
      { name: 'Credit Card', balance: 8000, interestRate: 22, minimumPayment: 200 },
      { name: 'Car Loan', balance: 12000, interestRate: 5, minimumPayment: 300 }
    ];

    const exampleFormGroups = examples.map(example =>
      this.fb.group({
        name: [example.name, Validators.required],
        balance: [example.balance, [Validators.required, Validators.min(0)]],
        interestRate: [example.interestRate, [Validators.required, Validators.min(0)]],
        minimumPayment: [example.minimumPayment, [Validators.required, Validators.min(0)]]
      })
    );

    this.form.setControl('debts', this.fb.array(exampleFormGroups));
    this.form.patchValue({ extraPayment: 50 });
    this.cdr.markForCheck();
    setTimeout(() => this.cdr.detectChanges(), 0);
  }

  removeDebt(index: number) {
    this.debts.removeAt(index);
  }

  submit() {
    // Prevent multiple submissions
    if (this.loading) {
      return;
    }
    
    // Validate form - check if we have at least one debt with valid data
    const hasValidDebt = this.debts.controls.some(debt => {
      const value = debt.value;
      return value.name && value.balance > 0 && value.interestRate >= 0 && value.minimumPayment > 0;
    });
    
    if (!hasValidDebt) {
      alert('Please add at least one valid debt with all fields filled.');
      return;
    }

    this.loading = true;
    this.result = null;
    this.cdr.markForCheck();

    this.debtService.calculate(this.form.value).subscribe({
      next: (res) => {
        this.result = res;
        this.loading = false;
        this.cdr.markForCheck();
        setTimeout(() => this.cdr.detectChanges(), 0);
      },
      error: (err) => {
        console.error('API Error:', err);
        let errorMessage = 'Error calculating debt payoff. Please check your inputs and try again.';
        
        if (err.error && err.error.error) {
          errorMessage = err.error.error;
        } else if (err.status === 0) {
          errorMessage = 'Cannot connect to server. Please make sure the backend is running on port 8080.';
        }
        
        alert(errorMessage);
        this.loading = false;
        this.result = null;
        this.cdr.markForCheck();
        setTimeout(() => this.cdr.detectChanges(), 0);
      }
    });
  }

  bestStrategy(): 'snowball' | 'avalanche' | null {
    if (!this.result) return null;

    return this.result.snowball.totalInterest <
      this.result.avalanche.totalInterest
      ? 'snowball'
      : 'avalanche';
  }

  interestDifference(): number {
    if (!this.result) {
      console.log('No result available for interest difference');
      return 0;
    }

    const diff = Math.abs(
      this.result.snowball.totalInterest -
      this.result.avalanche.totalInterest
    );
    
    return diff;
  }

  getSnowballOrder(): any[] {
    if (!this.form.value.debts || this.form.value.debts.length === 0) return [];
    
    return [...this.form.value.debts]
      .sort((a: any, b: any) => a.balance - b.balance)
      .map((debt: any, index: number) => ({
        ...debt,
        order: index + 1,
        reason: index === 0 ? 'Smallest balance - Quick win!' : 'Pay after previous debt'
      }));
  }

  getAvalancheOrder(): any[] {
    if (!this.form.value.debts || this.form.value.debts.length === 0) return [];
    
    return [...this.form.value.debts]
      .sort((a: any, b: any) => b.interestRate - a.interestRate)
      .map((debt: any, index: number) => ({
        ...debt,
        order: index + 1,
        reason: index === 0 ? 'Highest interest - Maximum savings!' : 'Pay after previous debt'
      }));
  }

  getExtraPaymentImpact(): any {
    if (!this.result || !this.form.value.extraPayment) return null;

    const extraPayment = this.form.value.extraPayment;
    const best = this.bestStrategy();
    const bestResult = best === 'snowball' ? this.result.snowball : this.result.avalanche;
    
    const currentMonths = bestResult.monthsToDebtFree;
    const currentInterest = bestResult.totalInterest;
    
    const estimatedMonthsSaved = Math.floor((extraPayment / 100) * 2.5);
    const estimatedInterestSaved = (currentInterest * estimatedMonthsSaved) / currentMonths;

    return {
      extraPayment,
      estimatedMonthsSaved,
      estimatedInterestSaved,
      newDebtFreeMonths: Math.max(1, currentMonths - estimatedMonthsSaved),
      newTotalInterest: Math.max(0, currentInterest - estimatedInterestSaved)
    };
  }

  getRecommendations(): string[] {
    if (!this.result || !this.form.value.debts || this.form.value.debts.length === 0) return [];

    const recommendations: string[] = [];
    const debts = this.form.value.debts;
    const best = this.bestStrategy();
    const extraPayment = this.form.value.extraPayment || 0;

    if (best === 'snowball') {
      recommendations.push(`🎯 Use Snowball method: Pay off smallest debt first for psychological wins and momentum.`);
    } else {
      recommendations.push(`🎯 Use Avalanche method: Pay off highest interest debt first to save $${this.interestDifference().toFixed(2)}.`);
    }

    if (extraPayment > 0) {
      const impact = this.getExtraPaymentImpact();
      if (impact) {
        recommendations.push(`💰 Your extra $${extraPayment}/month payment will save you approximately ${impact.estimatedMonthsSaved} months and $${impact.estimatedInterestSaved.toFixed(2)} in interest!`);
      }
    } else {
      recommendations.push(`💡 Consider adding extra monthly payments to become debt-free faster and save on interest.`);
    }

    const highestInterestDebt = debts.reduce((max: any, debt: any) => 
      debt.interestRate > max.interestRate ? debt : max
    );
    
    if (highestInterestDebt.interestRate > 15) {
      recommendations.push(`⚠️ Your "${highestInterestDebt.name}" has a high interest rate of ${highestInterestDebt.interestRate}%. Consider paying this off first or refinancing.`);
    }

    const smallestDebt = debts.reduce((min: any, debt: any) => 
      debt.balance < min.balance ? debt : min
    );
    
    if (smallestDebt.balance < 1000 && debts.length > 1) {
      recommendations.push(`🚀 Quick win: "${smallestDebt.name}" has only $${smallestDebt.balance} balance. Pay this off first for an immediate psychological boost!`);
    }

    if (extraPayment < 100 && debts.length > 1) {
      recommendations.push(`📈 If possible, try to increase extra payment to $100-200/month. This could reduce your debt-free timeline by 6-12 months.`);
    }

    return recommendations;
  }

  toggleOtherStrategies() {
    this.showOtherStrategies = !this.showOtherStrategies;
  }

  toggleStrategy(strategyName: string) {
    this.expandedStrategies[strategyName] = !this.expandedStrategies[strategyName];
  }

  isStrategyExpanded(strategyName: string): boolean {
    return !!this.expandedStrategies[strategyName];
  }

  getOtherStrategies() {
    const strategies = [
      {
        name: 'Debt Snowflake',
        icon: '❄️',
        description: 'Use small extra amounts (cashbacks, side income, spare change)',
        method: 'Combine with Snowball or Avalanche',
        bestFor: 'Irregular income earners',
        pros: ['Utilizes every extra dollar', 'Flexible and adaptable', 'Accelerates any method'],
        cons: ['Requires discipline', 'May feel slow', 'Hard to track small amounts']
      },
      {
        name: 'Debt Consolidation',
        icon: '🔄',
        description: 'Combine multiple debts into one loan',
        method: 'Usually lower interest, fixed payment',
        bestFor: 'Multiple high-interest debts',
        pros: ['Simplified payments', 'Often lower interest', 'Fixed monthly payment'],
        cons: ['Longer payoff if discipline is weak', 'May have fees', 'Could increase total interest']
      },
      {
        name: 'Balance Transfer (0% APR)',
        icon: '💳',
        description: 'Move credit card debt to 0% interest card',
        method: 'Must pay before promo ends',
        bestFor: 'Good credit score holders',
        pros: ['No interest during promo', 'Can save thousands', 'Focused payoff period'],
        cons: ['High fees (3-5%)', 'Interest spike after promo', 'Requires good credit']
      },
      {
        name: 'Refinancing',
        icon: '🏦',
        description: 'Replace old loan with lower-rate loan',
        method: 'Common for auto, student, personal loans',
        bestFor: 'Improved credit or lower rates available',
        pros: ['Lower interest rate', 'Lower monthly payment', 'Simplifies payments'],
        cons: ['May extend loan term', 'Closing costs', 'Credit check required']
      }
    ];
    
    return strategies;
  }
}
