import { TestBed } from '@angular/core/testing';
import { EmployeeFormComponent } from './employee-form.component';
import { EmployeeRegistrationPayload } from '../../models/employee.model';

describe('EmployeeFormComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeFormComponent]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(EmployeeFormComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should emit payload when form is valid', () => {
    const fixture = TestBed.createComponent(EmployeeFormComponent);
    const component = fixture.componentInstance;

    const formValue = {
      fullName: 'Maria Silva',
      email: 'maria@empresa.com',
      role: 'Clinico',
      department: 'Clinica Geral',
      phone: '(11) 99999-9999',
      accessLevel: 'Administrador',
      active: true
    };

    component.form.setValue(formValue);

    const emitSpy = jest.spyOn(component.formSubmit, 'emit');
    component.onSubmit();

    expect(emitSpy).toHaveBeenCalledWith(formValue as EmployeeRegistrationPayload);
  });

  it('should mark controls as touched when form is invalid', () => {
    const fixture = TestBed.createComponent(EmployeeFormComponent);
    const component = fixture.componentInstance;

    const emitSpy = jest.spyOn(component.formSubmit, 'emit');
    component.onSubmit();

    expect(emitSpy).not.toHaveBeenCalled();
    expect(component.form.controls.fullName.touched).toBe(true);
    expect(component.form.controls.email.touched).toBe(true);
  });

  it('should reset the form to defaults', () => {
    const fixture = TestBed.createComponent(EmployeeFormComponent);
    const component = fixture.componentInstance;

    component.form.setValue({
      fullName: 'Maria Silva',
      email: 'maria@empresa.com',
      role: 'Clinico',
      department: 'Clinica Geral',
      phone: '(11) 99999-9999',
      accessLevel: 'Administrador',
      active: false
    });

    component.resetForm();

    expect(component.form.getRawValue()).toEqual({
      fullName: '',
      email: '',
      role: '',
      department: '',
      phone: '',
      accessLevel: '',
      active: true
    });
  });
});
