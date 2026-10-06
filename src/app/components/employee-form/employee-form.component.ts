import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  VcButtonComponent,
  VcCheckboxComponent,
  VcHeadingComponent,
  VcInputComponent,
  VcSelectComponent,
  VcTextComponent
} from '@vyracare/design-system';
import type { VcSelectOption } from '@vyracare/design-system';
import { EmployeeRegistrationPayload } from '../../models/employee.model';

@Component({
  selector: 'vyracare-employee-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    VcButtonComponent,
    VcCheckboxComponent,
    VcHeadingComponent,
    VcInputComponent,
    VcSelectComponent,
    VcTextComponent
  ],
  templateUrl: './employee-form.component.html',
  styleUrl: './employee-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
/** Mantem os campos, validacoes e eventos do cadastro de funcionario. */
export class EmployeeFormComponent implements OnChanges {
  @Input() loading = false;
  @Input() error: string | null = null;
  @Input() initialValue: EmployeeRegistrationPayload | null = null;
  @Input() title = 'Dados do funcionario';
  @Input() description = 'Preencha os dados essenciais para liberar o acesso ao sistema.';
  @Input() submitLabel = 'Salvar funcionario';
  @Input() showReset = true;
  @Output() formSubmit = new EventEmitter<EmployeeRegistrationPayload>();

  readonly roles = ['Clinico', 'Administrativo', 'Financeiro', 'Recepcao', 'Suporte'];
  readonly accessLevels = ['Administrador', 'Gestor', 'Operacional', 'Leitura'];
  readonly roleOptions: VcSelectOption[] = this.roles.map((role) => ({ label: role, value: role }));
  readonly accessLevelOptions: VcSelectOption[] = this.accessLevels.map((level) => ({
    label: level,
    value: level
  }));

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

  /** Sincroniza o formulario quando os dados do funcionario chegam da API. */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialValue'] && this.initialValue) {
      this.form.reset(this.initialValue);
    }
  }

  /** Marca campos invalidos ou emite um cadastro completo para a pagina consumidora. */
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.formSubmit.emit(this.form.getRawValue());
  }

  /** Restaura os valores padrao de um novo funcionario. */
  resetForm(): void {
    this.form.reset(this.initialValue ?? {
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
