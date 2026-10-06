import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { VcButtonComponent, VcHeadingComponent, VcIconButtonComponent, VcTextComponent, VcToastService, VcTooltipComponent } from '@vyracare/design-system';
import { EmployeeFormComponent } from '../../components/employee-form/employee-form.component';
import { EmployeeService } from '../../services/employee.service';
import { EmployeeRegistrationPayload, EmployeeSummary } from '../../models/employee.model';

@Component({
  selector: 'vyracare-employee-registration-page',
  standalone: true,
  imports: [CommonModule, RouterLink, EmployeeFormComponent, VcButtonComponent, VcHeadingComponent, VcIconButtonComponent, VcTextComponent, VcTooltipComponent],
  templateUrl: './employee-registration.component.html',
  styleUrl: './employee-registration.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
/** Coordena a consulta e o cadastro modal de funcionarios. */
export class EmployeeRegistrationPageComponent implements OnInit {
  protected readonly employees = signal<EmployeeSummary[]>([]);
  protected readonly loading = signal(false);
  protected readonly listLoading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly listError = signal<string | null>(null);
  protected readonly success = signal(false);
  protected readonly registrationModalOpen = signal(false);
  protected readonly statusModalOpen = signal(false);
  protected readonly selectedEmployee = signal<EmployeeSummary | null>(null);
  protected readonly statusLoading = signal(false);

  constructor(
    private readonly employeeService: EmployeeService,
    private readonly router: Router,
    private readonly toastService: VcToastService
  ) {}

  /** Carrega a lista inicial de funcionarios ativos. */
  ngOnInit(): void {
    this.search('');
  }

  /** Pesquisa funcionarios por nome, e-mail ou telefone e atualiza os estados da tabela. */
  search(value: string): void {
    this.listLoading.set(true);
    this.listError.set(null);

    this.employeeService.listEmployees(value).subscribe({
      next: (employees) => {
        this.employees.set(employees);
        this.listLoading.set(false);
      },
      error: error => {
        this.employees.set([]);
        this.listError.set(error?.status === 403
          ? 'Seu perfil não possui permissão administrativa para consultar funcionários. Entre novamente se o acesso foi alterado recentemente.'
          : 'Não foi possível carregar os funcionários.');
        this.listLoading.set(false);
      }
    });
  }

  /** Abre o formulario de cadastro com os feedbacks anteriores limpos. */
  openRegistration(): void {
    this.error.set(null);
    this.success.set(false);
    this.registrationModalOpen.set(true);
  }

  /** Fecha o cadastro quando nao existe uma gravacao em andamento. */
  closeRegistration(): void {
    if (!this.loading()) {
      this.registrationModalOpen.set(false);
    }
  }

  /** Fornece uma chave estavel para a renderizacao das linhas de funcionarios. */
  trackEmployee(_: number, employee: EmployeeSummary): string {
    return employee.id;
  }

  /** Abre a rota de edicao administrativa do funcionario selecionado. */
  editEmployee(employee: EmployeeSummary): void {
    void this.router.navigate(['/cadastro/funcionarios/editar', employee.id]);
  }

  /** Solicita confirmacao antes de alterar rapidamente o status do funcionario. */
  requestStatusChange(employee: EmployeeSummary): void {
    this.selectedEmployee.set(employee);
    this.statusModalOpen.set(true);
  }

  /** Fecha a confirmacao de status quando nenhuma requisicao esta em andamento. */
  cancelStatusChange(): void {
    if (this.statusLoading()) return;
    this.statusModalOpen.set(false);
    this.selectedEmployee.set(null);
  }

  /** Confirma a ativacao ou inativacao e atualiza a linha retornada pela API. */
  confirmStatusChange(): void {
    const employee = this.selectedEmployee();
    if (!employee) return;
    const nextStatus = !employee.active;
    this.statusLoading.set(true);

    this.employeeService.changeEmployeeStatus(employee.id, nextStatus).subscribe({
      next: updated => {
        this.employees.update(employees => employees.map(item => item.id === updated.id ? updated : item));
        this.statusLoading.set(false);
        this.cancelStatusChange();
        this.toastService.show({
          variant: 'success',
          title: nextStatus ? 'Funcionario ativado' : 'Funcionario inativado',
          message: `${updated.fullName} foi atualizado com sucesso.`
        });
      },
      error: error => {
        this.statusLoading.set(false);
        this.toastService.show({
          variant: 'error',
          title: 'Nao foi possivel alterar o status',
          message: error?.status === 400
            ? 'Voce nao pode inativar o proprio usuario.'
            : 'Tente novamente em alguns instantes.'
        });
      }
    });
  }

  /** Persiste um funcionario, fecha o modal e recarrega a listagem em caso de sucesso. */
  handleSubmit(payload: EmployeeRegistrationPayload): void {
    this.loading.set(true);
    this.error.set(null);
    this.success.set(false);

    this.employeeService.registerEmployee(payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
        this.registrationModalOpen.set(false);
        this.search('');
        this.toastService.show({ variant: 'success', title: 'Funcionario cadastrado', message: 'O novo perfil foi salvo com sucesso.' });
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Falha ao salvar funcionario. Tente novamente.');
      }
    });
  }
}
