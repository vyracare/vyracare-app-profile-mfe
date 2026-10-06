import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { VcToastService } from '@vyracare/design-system';
import { of, throwError } from 'rxjs';
import { EmployeeEditPageComponent } from './employee-edit.component';
import { EmployeeService } from '../../services/employee.service';
import { EmployeeRegistrationPayload, EmployeeSummary } from '../../models/employee.model';

describe('EmployeeEditPageComponent', () => {
  let service: jest.Mocked<EmployeeService>;
  let toast: { show: jest.Mock };
  const employee: EmployeeSummary = {
    id: '1', fullName: 'Maria Silva', email: 'maria@empresa.com', phone: null, role: 'Clinico',
    department: null, accessLevel: 'Administrador', active: true
  };

  async function configure(id: string | null = '1'): Promise<void> {
    service = {
      getEmployee: jest.fn().mockReturnValue(of(employee)),
      updateEmployee: jest.fn(),
      listEmployees: jest.fn(), registerEmployee: jest.fn(), changeEmployeeStatus: jest.fn()
    } as unknown as jest.Mocked<EmployeeService>;
    toast = { show: jest.fn() };
    await TestBed.configureTestingModule({
      imports: [EmployeeEditPageComponent, RouterTestingModule],
      providers: [
        { provide: EmployeeService, useValue: service },
        { provide: VcToastService, useValue: toast },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => id } } } }
      ]
    }).compileComponents();
  }

  it('should load and map the employee to the shared form', async () => {
    await configure();
    const component = TestBed.createComponent(EmployeeEditPageComponent).componentInstance;
    component.ngOnInit();

    expect(service.getEmployee).toHaveBeenCalledWith('1');
    expect((component as any).employee()).toEqual(employee);
    expect(component.formValue(employee)).toEqual({
      fullName: employee.fullName, email: employee.email, phone: '', role: 'Clinico', department: '',
      accessLevel: 'Administrador', active: true
    });
  });

  it('should report a missing id and loading failures', async () => {
    await configure(null);
    let component = TestBed.createComponent(EmployeeEditPageComponent).componentInstance;
    component.ngOnInit();
    expect((component as any).error()).toContain('nao informado');

    TestBed.resetTestingModule();
    await configure('1');
    service.getEmployee.mockReturnValue(throwError(() => ({ status: 403 })));
    component = TestBed.createComponent(EmployeeEditPageComponent).componentInstance;
    component.ngOnInit();
    expect((component as any).error()).toContain('administradores');

    service.getEmployee.mockReturnValue(throwError(() => ({ status: 500 })));
    component = TestBed.createComponent(EmployeeEditPageComponent).componentInstance;
    component.ngOnInit();
    expect((component as any).error()).toContain('carregar');
  });

  it('should request confirmation and save changes', async () => {
    await configure();
    const component = TestBed.createComponent(EmployeeEditPageComponent).componentInstance;
    component.ngOnInit();
    const payload: EmployeeRegistrationPayload = {
      ...component.formValue(employee), fullName: 'Maria Atualizada'
    };
    service.updateEmployee.mockReturnValue(of({ ...employee, fullName: payload.fullName }));

    component.requestUpdate(payload);
    expect((component as any).confirmationOpen()).toBe(true);
    component.confirmUpdate();

    expect(service.updateEmployee).toHaveBeenCalledWith('1', payload);
    expect((component as any).employee().fullName).toBe('Maria Atualizada');
    expect((component as any).confirmationOpen()).toBe(false);
    expect(toast.show).toHaveBeenCalledWith(expect.objectContaining({ variant: 'success' }));
  });

  it('should handle update conflicts and protect the modal while saving', async () => {
    await configure();
    const component = TestBed.createComponent(EmployeeEditPageComponent).componentInstance;
    component.ngOnInit();
    component.requestUpdate(component.formValue(employee));
    (component as any).saving.set(true);
    component.cancelUpdate();
    expect((component as any).confirmationOpen()).toBe(true);

    (component as any).saving.set(false);
    service.updateEmployee.mockReturnValue(throwError(() => ({ status: 409 })));
    component.confirmUpdate();
    expect((component as any).error()).toContain('outro usuario');
    expect((component as any).saving()).toBe(false);

    service.updateEmployee.mockReturnValue(throwError(() => ({ status: 400 })));
    component.confirmUpdate();
    expect((component as any).error()).toContain('Revise os dados');

    service.updateEmployee.mockReturnValue(throwError(() => ({ status: 500 })));
    component.confirmUpdate();
    expect((component as any).error()).toContain('Nao foi possivel atualizar');
  });

  it('should ignore confirmation without loaded data', async () => {
    await configure(null);
    const component = TestBed.createComponent(EmployeeEditPageComponent).componentInstance;
    component.confirmUpdate();
    expect(service.updateEmployee).not.toHaveBeenCalled();
  });
});
