import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { VcToastService } from '@vyracare/design-system';
import { of, throwError } from 'rxjs';
import { EmployeeRegistrationPageComponent } from './employee-registration.component';
import { EmployeeService } from '../../services/employee.service';
import { EmployeeSummary } from '../../models/employee.model';

describe('EmployeeRegistrationPageComponent', () => {
  let employeeService: jest.Mocked<EmployeeService>;
  let toastService: { show: jest.Mock };
  const employee: EmployeeSummary = {
    id: '1', fullName: 'Maria Silva', email: 'maria@empresa.com', phone: null, role: 'Clinico',
    department: 'Clinica', accessLevel: 'Gestor', active: true
  };

  beforeEach(async () => {
    employeeService = {
      registerEmployee: jest.fn(),
      listEmployees: jest.fn().mockReturnValue(of([])),
      getEmployee: jest.fn(),
      updateEmployee: jest.fn(),
      changeEmployeeStatus: jest.fn()
    } as unknown as jest.Mocked<EmployeeService>;
    toastService = { show: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [EmployeeRegistrationPageComponent, RouterTestingModule],
      providers: [
        { provide: EmployeeService, useValue: employeeService },
        { provide: VcToastService, useValue: toastService }
      ]
    }).compileComponents();
  });

  it('should create and load employees', () => {
    employeeService.listEmployees.mockReturnValue(of([employee]));
    const fixture = TestBed.createComponent(EmployeeRegistrationPageComponent);
    const component = fixture.componentInstance;

    component.ngOnInit();
    component.search('maria');

    expect(component).toBeTruthy();
    expect(employeeService.listEmployees).toHaveBeenLastCalledWith('maria');
    expect((component as any).employees()).toEqual([employee]);
    expect((component as any).listLoading()).toBe(false);
  });

  it('should expose an error when employees cannot be loaded', () => {
    const component = TestBed.createComponent(EmployeeRegistrationPageComponent).componentInstance;
    employeeService.listEmployees.mockReturnValue(throwError(() => new Error('fail')));

    component.search('maria');

    expect((component as any).employees()).toEqual([]);
    expect((component as any).listError()).toContain('possível carregar');
    expect((component as any).listLoading()).toBe(false);
  });

  it('should explain forbidden employee management access', () => {
    const component = TestBed.createComponent(EmployeeRegistrationPageComponent).componentInstance;
    employeeService.listEmployees.mockReturnValue(throwError(() => ({ status: 403 })));

    component.search('');

    expect((component as any).employees()).toEqual([]);
    expect((component as any).listError()).toContain('permissão administrativa');
    expect((component as any).listLoading()).toBe(false);
  });

  it('should track and navigate to employee edition', () => {
    const component = TestBed.createComponent(EmployeeRegistrationPageComponent).componentInstance;
    const router = TestBed.inject(Router);
    const navigate = jest.spyOn(router, 'navigate').mockResolvedValue(true);

    expect(component.trackEmployee(0, employee)).toBe('1');
    component.editEmployee(employee);

    expect(navigate).toHaveBeenCalledWith(['/cadastro/funcionarios/editar', '1']);
  });

  it('should confirm an employee status change and update the row', () => {
    const component = TestBed.createComponent(EmployeeRegistrationPageComponent).componentInstance;
    (component as any).employees.set([employee]);
    employeeService.changeEmployeeStatus.mockReturnValue(of({ ...employee, active: false }));

    component.requestStatusChange(employee);
    component.confirmStatusChange();

    expect(employeeService.changeEmployeeStatus).toHaveBeenCalledWith('1', false);
    expect((component as any).employees()[0].active).toBe(false);
    expect((component as any).statusModalOpen()).toBe(false);
    expect(toastService.show).toHaveBeenCalledWith(expect.objectContaining({ variant: 'success' }));
  });

  it('should keep the status confirmation open while saving and report API failures', () => {
    const component = TestBed.createComponent(EmployeeRegistrationPageComponent).componentInstance;
    component.requestStatusChange(employee);
    (component as any).statusLoading.set(true);
    component.cancelStatusChange();
    expect((component as any).statusModalOpen()).toBe(true);

    (component as any).statusLoading.set(false);
    employeeService.changeEmployeeStatus.mockReturnValue(throwError(() => ({ status: 400 })));
    component.confirmStatusChange();

    expect(toastService.show).toHaveBeenCalledWith(expect.objectContaining({ variant: 'error' }));
    expect((component as any).statusLoading()).toBe(false);

    employeeService.changeEmployeeStatus.mockReturnValue(throwError(() => ({ status: 500 })));
    component.confirmStatusChange();
    expect(toastService.show).toHaveBeenLastCalledWith(expect.objectContaining({
      message: 'Tente novamente em alguns instantes.'
    }));
  });

  it('should reactivate an inactive employee', () => {
    const component = TestBed.createComponent(EmployeeRegistrationPageComponent).componentInstance;
    const inactive = { ...employee, active: false };
    (component as any).employees.set([inactive]);
    employeeService.changeEmployeeStatus.mockReturnValue(of(employee));

    component.requestStatusChange(inactive);
    component.confirmStatusChange();

    expect(employeeService.changeEmployeeStatus).toHaveBeenCalledWith('1', true);
    expect(toastService.show).toHaveBeenCalledWith(expect.objectContaining({ title: 'Funcionario ativado' }));
  });

  it('should ignore status confirmation without a selected employee', () => {
    const component = TestBed.createComponent(EmployeeRegistrationPageComponent).componentInstance;
    component.confirmStatusChange();
    expect(employeeService.changeEmployeeStatus).not.toHaveBeenCalled();
  });

});
