import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';
import { EmployeeRegistrationPayload, EmployeeSummary } from '../models/employee.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  listEmployees(search = ''): Observable<EmployeeSummary[]> {
    let params = new HttpParams().set('limit', 100);
    const normalizedSearch = search.trim();

    if (normalizedSearch) {
      params = params.set('search', normalizedSearch);
    }

    return this.http.get<EmployeeSummary[]>(`${this.apiUrl}/employees`, { params });
  }

  registerEmployee(payload: EmployeeRegistrationPayload): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/register`, payload);
  }
}
