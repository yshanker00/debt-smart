import { Component } from '@angular/core';
import { DebtFormComponent } from './components/debt-form/debt-form';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DebtFormComponent],
  template: `<app-debt-form></app-debt-form>`
})
export class App {}


