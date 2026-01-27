import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
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
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    CommonModule
  ],
  templateUrl: './debt-form.html'
})
export class DebtFormComponent {

  form!: FormGroup; // declare first, initialize later

  constructor(private fb: FormBuilder) {
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
    console.log(this.form.value);
  }
}
