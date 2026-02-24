import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmployeeRegistrationPayload } from '../../models/employee.model';

@Component({
  selector: 'vyracare-employee-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './employee-form.component.html',
  styleUrl: './employee-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeeFormComponent {
  @Input() loading = false;
  @Input() error: string | null = null;
  @Output() formSubmit = new EventEmitter<EmployeeRegistrationPayload>();

  readonly roles = ['Clinico', 'Administrativo', 'Financeiro', 'Recepcao', 'Suporte'];
  readonly accessLevels = ['Administrador', 'Gestor', 'Operacional', 'Leitura'];

  readonly form: FormGroup<{
    fullName: FormControl<string>;
    email: FormControl<string>;
    role: FormControl<string>;
    department: FormControl<string>;
    phone: FormControl<string>;
    accessLevel: FormControl<string>;
    active: FormControl<boolean>;
  }>;

  constructor(private readonly fb: NonNullableFormBuilder) {
    this.form = this.fb.group({
      fullName: this.fb.control('', {
        validators: [Validators.required, Validators.minLength(3)]
      }),
      email: this.fb.control('', {
        validators: [Validators.required, Validators.email]
      }),
      role: this.fb.control('', {
        validators: [Validators.required]
      }),
      department: this.fb.control(''),
      phone: this.fb.control(''),
      accessLevel: this.fb.control('', {
        validators: [Validators.required]
      }),
      active: this.fb.control(true)
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.formSubmit.emit(this.form.getRawValue());
  }

  resetForm() {
    this.form.reset({
      fullName: '',
      email: '',
      role: '',
      department: '',
      phone: '',
      accessLevel: '',
      active: true
    });
  }
}
