import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';
import { EmployeeRegistrationPayload, EmployeeSummary, EmployeeUpdatePayload } from '../models/employee.model';

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

    return this.http.get<EmployeeSummary[]>(`${this.apiUrl}/employees/manage`, { params });
  }

  registerEmployee(payload: EmployeeRegistrationPayload): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/employees`, payload);
  }

  /** Recupera a projecao administrativa de um funcionario sem dados de credencial. */
  getEmployee(id: string): Observable<EmployeeSummary> {
    return this.http.get<EmployeeSummary>(`${this.apiUrl}/employees/${id}`);
  }

  /** Atualiza os dados administrativos sem enviar ou substituir a senha. */
  updateEmployee(id: string, payload: EmployeeUpdatePayload): Observable<EmployeeSummary> {
    return this.http.put<EmployeeSummary>(`${this.apiUrl}/employees/${id}`, payload);
  }

  /** Ativa ou inativa rapidamente um funcionario. */
  changeEmployeeStatus(id: string, active: boolean): Observable<EmployeeSummary> {
    return this.http.patch<EmployeeSummary>(`${this.apiUrl}/employees/${id}/status`, { active });
  }
}
