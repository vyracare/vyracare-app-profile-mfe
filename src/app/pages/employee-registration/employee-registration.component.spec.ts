import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { EmployeeRegistrationPageComponent } from './employee-registration.component';
import { EmployeeService } from '../../services/employee.service';
import { EmployeeRegistrationPayload } from '../../models/employee.model';

describe('EmployeeRegistrationPageComponent', () => {
  let employeeService: jest.Mocked<EmployeeService>;

  beforeEach(async () => {
    employeeService = {
      registerEmployee: jest.fn()
    } as jest.Mocked<EmployeeService>;

    await TestBed.configureTestingModule({
      imports: [EmployeeRegistrationPageComponent, RouterTestingModule],
      providers: [{ provide: EmployeeService, useValue: employeeService }]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(EmployeeRegistrationPageComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should handle successful registration', () => {
    const fixture = TestBed.createComponent(EmployeeRegistrationPageComponent);
    const component = fixture.componentInstance;

    const payload: EmployeeRegistrationPayload = {
      fullName: 'Maria Silva',
      email: 'maria@empresa.com',
      role: 'Clinico',
      department: 'Clinica Geral',
      phone: '(11) 99999-9999',
      accessLevel: 'Administrador',
      active: true
    };

    employeeService.registerEmployee.mockReturnValue(of(void 0));

    component.handleSubmit(payload);

    expect(employeeService.registerEmployee).toHaveBeenCalledWith(payload);
    expect((component as any).loading()).toBe(false);
    expect((component as any).success()).toBe(true);
    expect((component as any).error()).toBeNull();
  });

  it('should handle failed registration', () => {
    const fixture = TestBed.createComponent(EmployeeRegistrationPageComponent);
    const component = fixture.componentInstance;

    const payload: EmployeeRegistrationPayload = {
      fullName: 'Maria Silva',
      email: 'maria@empresa.com',
      role: 'Clinico',
      department: 'Clinica Geral',
      phone: '(11) 99999-9999',
      accessLevel: 'Administrador',
      active: true
    };

    employeeService.registerEmployee.mockReturnValue(throwError(() => new Error('fail')));

    component.handleSubmit(payload);

    expect(employeeService.registerEmployee).toHaveBeenCalledWith(payload);
    expect((component as any).loading()).toBe(false);
    expect((component as any).success()).toBe(false);
    expect((component as any).error()).toBe('Falha ao salvar funcionario. Tente novamente.');
  });
});
