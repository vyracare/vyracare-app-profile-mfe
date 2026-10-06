import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { VcToastService } from '@vyracare/design-system';
import { of, throwError } from 'rxjs';
import { EmployeeRegistrationPayload } from '../../models/employee.model';
import { EmployeeService } from '../../services/employee.service';
import { EmployeeCreatePageComponent } from './employee-create.component';

describe('EmployeeCreatePageComponent', () => {
  let employeeService: jest.Mocked<EmployeeService>;
  let toastService: { show: jest.Mock };
  const payload: EmployeeRegistrationPayload = {
    fullName: 'Maria Silva', email: 'maria@empresa.com', role: 'Clinico', department: 'Clinica Geral',
    phone: '(11) 99999-9999', accessLevel: 'Administrador', active: true
  };

  beforeEach(async () => {
    employeeService = { registerEmployee: jest.fn() } as unknown as jest.Mocked<EmployeeService>;
    toastService = { show: jest.fn() };
    await TestBed.configureTestingModule({
      imports: [EmployeeCreatePageComponent],
      providers: [
        provideRouter([]),
        { provide: EmployeeService, useValue: employeeService },
        { provide: VcToastService, useValue: toastService }
      ]
    }).compileComponents();
  });

  it('should save the employee and return to the list', () => {
    employeeService.registerEmployee.mockReturnValue(of(void 0));
    const component = TestBed.createComponent(EmployeeCreatePageComponent).componentInstance;
    const navigate = jest.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    component.handleSubmit(payload);

    expect(employeeService.registerEmployee).toHaveBeenCalledWith(payload);
    expect(toastService.show).toHaveBeenCalledWith(expect.objectContaining({ variant: 'success' }));
    expect(navigate).toHaveBeenCalledWith(['/cadastro/funcionarios']);
    expect((component as any).loading()).toBe(false);
  });

  it('should preserve the page and report a save failure', () => {
    employeeService.registerEmployee.mockReturnValue(throwError(() => new Error('fail')));
    const component = TestBed.createComponent(EmployeeCreatePageComponent).componentInstance;

    component.handleSubmit(payload);

    expect((component as any).error()).toContain('Falha ao salvar');
    expect((component as any).loading()).toBe(false);
  });
});
