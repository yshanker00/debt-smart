import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DebtService {
  private apiUrl = 'http://localhost:8080/calculate';

  constructor(private http: HttpClient) {}

  calculate(payload: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, payload);
  }
}
