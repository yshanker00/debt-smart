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

@Component({
  selector: 'app-debt-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './debt-form.html'
})
export class DebtFormComponent {

  form!: FormGroup;
  result: any = null;
  loading = false;

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

  removeDebt(index: number) {
    this.debts.removeAt(index);
  }

  submit() {
    if (this.form.invalid || this.loading) return;

    this.loading = true;
    this.result = null;

    this.debtService.calculate(this.form.value).subscribe({
      next: (res) => {
        this.result = res;
        this.loading = false;
        this.cdr.detectChanges(); // ✅ single, clean trigger
      },
      error: (err) => {
        console.error('API Error', err);
        this.loading = false;
        this.cdr.detectChanges();
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
    if (!this.result) return 0;

    return Math.abs(
      this.result.snowball.totalInterest -
      this.result.avalanche.totalInterest
    );
  }
}
