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
      registerEmployee: jest.fn(),
      listEmployees: jest.fn().mockReturnValue(of([]))
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

  it('should load and search employees', () => {
    const fixture = TestBed.createComponent(EmployeeRegistrationPageComponent);
    const component = fixture.componentInstance;
    const employees = [{ id: '1', fullName: 'Maria Silva', email: 'maria@empresa.com', phone: null, role: 'Clinico' }];
    employeeService.listEmployees.mockReturnValue(of(employees));

    component.ngOnInit();
    component.search('maria');

    expect(employeeService.listEmployees).toHaveBeenLastCalledWith('maria');
    expect((component as any).employees()).toEqual(employees);
    expect((component as any).listLoading()).toBe(false);
  });

  it('should expose an error when employees cannot be loaded', () => {
    const fixture = TestBed.createComponent(EmployeeRegistrationPageComponent);
    const component = fixture.componentInstance;
    employeeService.listEmployees.mockReturnValue(throwError(() => new Error('fail')));

    component.search('maria');

    expect((component as any).employees()).toEqual([]);
    expect((component as any).listError()).toBe('Não foi possível carregar os funcionários.');
    expect((component as any).listLoading()).toBe(false);
  });

  it('should manage the registration modal without closing during a save', () => {
    const fixture = TestBed.createComponent(EmployeeRegistrationPageComponent);
    const component = fixture.componentInstance;

    component.openRegistration();
    expect((component as any).registrationModalOpen()).toBe(true);

    (component as any).loading.set(true);
    component.closeRegistration();
    expect((component as any).registrationModalOpen()).toBe(true);

    (component as any).loading.set(false);
    component.closeRegistration();
    expect((component as any).registrationModalOpen()).toBe(false);
  });

  it('should track employees by id', () => {
    const fixture = TestBed.createComponent(EmployeeRegistrationPageComponent);
    const component = fixture.componentInstance;

    expect(component.trackEmployee(0, {
      id: 'employee-1',
      fullName: 'Maria Silva',
      email: 'maria@empresa.com',
      phone: null,
      role: null
    })).toBe('employee-1');
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
