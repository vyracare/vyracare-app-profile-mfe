import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { EmployeeService } from './employee.service';
import { environment } from '../../environments/environments';
import { EmployeeRegistrationPayload, EmployeeSummary } from '../models/employee.model';

describe('EmployeeService', () => {
  let service: EmployeeService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EmployeeService, provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(EmployeeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should list employees using only the operational endpoint', () => {
    const response: EmployeeSummary[] = [{
      id: 'employee-1',
      fullName: 'Maria Silva',
      email: 'maria@empresa.com',
      phone: '(11) 99999-9999',
      role: 'Clinico'
    }];

    service.listEmployees('maria').subscribe((employees) => expect(employees).toEqual(response));

    const req = httpMock.expectOne(
      (request) => request.url === `${environment.apiUrl}/employees`
        && request.params.get('search') === 'maria'
        && request.params.get('limit') === '100'
    );
    expect(req.request.method).toBe('GET');
    req.flush(response);
  });

  it('should omit the search parameter when listing all employees', () => {
    service.listEmployees().subscribe();

    const req = httpMock.expectOne((request) =>
      request.url === `${environment.apiUrl}/employees`
      && !request.params.has('search')
      && request.params.get('limit') === '100'
    );
    req.flush([]);
  });

  it('should ignore a search containing only spaces', () => {
    service.listEmployees('   ').subscribe();

    const req = httpMock.expectOne((request) =>
      request.url === `${environment.apiUrl}/employees` && !request.params.has('search')
    );
    req.flush([]);
  });

  it('should register an employee via POST', () => {
    const payload: EmployeeRegistrationPayload = {
      fullName: 'Maria Silva',
      email: 'maria@empresa.com',
      role: 'Clinico',
      department: 'Clinica Geral',
      phone: '(11) 99999-9999',
      accessLevel: 'Administrador',
      active: true
    };

    service.registerEmployee(payload).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/register`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(null);
  });
});
