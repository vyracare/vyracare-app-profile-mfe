import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { VcButtonComponent, VcHeadingComponent, VcTextComponent, VcToastService } from '@vyracare/design-system';
import { EmployeeFormComponent } from '../../components/employee-form/employee-form.component';
import { EmployeeRegistrationPayload, EmployeeSummary, EmployeeUpdatePayload } from '../../models/employee.model';
import { EmployeeService } from '../../services/employee.service';

@Component({
  selector: 'vyracare-employee-edit-page',
  standalone: true,
  imports: [CommonModule, RouterLink, EmployeeFormComponent, VcButtonComponent, VcHeadingComponent, VcTextComponent],
  templateUrl: './employee-edit.component.html',
  styleUrl: './employee-edit.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
/** Coordena a leitura, confirmacao e edicao administrativa de um funcionario. */
export class EmployeeEditPageComponent implements OnInit {
  protected readonly employee = signal<EmployeeSummary | null>(null);
  protected readonly initialFormValue = signal<EmployeeRegistrationPayload | null>(null);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly confirmationOpen = signal(false);
  protected readonly pendingUpdate = signal<EmployeeUpdatePayload | null>(null);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly employeeService: EmployeeService,
    private readonly toastService: VcToastService,
    private readonly router: Router
  ) {}

  /** Carrega o funcionario identificado na rota sem solicitar dados de credencial. */
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('Funcionario nao informado.');
      this.loading.set(false);
      return;
    }

    this.employeeService.getEmployee(id).subscribe({
      next: employee => {
        this.employee.set(employee);
        this.initialFormValue.set(this.formValue(employee));
        this.loading.set(false);
      },
      error: error => {
        this.error.set(error?.status === 403
          ? 'Somente administradores podem editar funcionarios.'
          : 'Nao foi possivel carregar o funcionario.');
        this.loading.set(false);
      }
    });
  }

  /** Converte a resposta administrativa no valor aceito pelo formulario compartilhado. */
  formValue(employee: EmployeeSummary): EmployeeRegistrationPayload {
    return {
      fullName: employee.fullName,
      email: employee.email,
      phone: employee.phone ?? '',
      role: employee.role ?? '',
      department: employee.department ?? '',
      accessLevel: employee.accessLevel ?? '',
      active: employee.active
    };
  }

  /** Guarda as alteracoes validas e abre a confirmacao antes do PUT. */
  requestUpdate(payload: EmployeeUpdatePayload): void {
    this.pendingUpdate.set(payload);
    this.confirmationOpen.set(true);
    this.error.set(null);
  }

  /** Envia as alteracoes confirmadas e atualiza o formulario com a resposta da API. */
  confirmUpdate(): void {
    const employee = this.employee();
    const payload = this.pendingUpdate();
    if (!employee || !payload) return;

    this.saving.set(true);
    this.employeeService.updateEmployee(employee.id, payload).subscribe({
      next: updated => {
        this.employee.set(updated);
        this.initialFormValue.set(this.formValue(updated));
        this.saving.set(false);
        this.cancelUpdate();
        this.toastService.show({
          variant: 'success',
          title: 'Funcionario atualizado',
          message: 'Os dados administrativos foram salvos com sucesso.'
        });
        void this.router.navigate(['/cadastro/funcionarios']);
      },
      error: error => {
        this.saving.set(false);
        this.error.set(error?.status === 409
          ? 'O e-mail informado ja pertence a outro usuario.'
          : error?.status === 400
            ? 'Revise os dados ou o status informado.'
            : 'Nao foi possivel atualizar o funcionario.');
      }
    });
  }

  /** Descarta a atualizacao pendente sem modificar o funcionario. */
  cancelUpdate(): void {
    if (this.saving()) return;
    this.confirmationOpen.set(false);
    this.pendingUpdate.set(null);
  }
}
