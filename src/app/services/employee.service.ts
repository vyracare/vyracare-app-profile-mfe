import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';
import { EmployeeRegistrationPayload } from '../models/employee.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  registerEmployee(payload: EmployeeRegistrationPayload): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/register`, payload);
  }
}
