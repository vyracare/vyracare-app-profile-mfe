import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { VcButtonComponent, VcHeadingComponent, VcIconButtonComponent, VcTextComponent, VcToastService, VcTooltipComponent } from '@vyracare/design-system';
import { EmployeeService } from '../../services/employee.service';
import { EmployeeSummary } from '../../models/employee.model';

@Component({
  selector: 'vyracare-employee-registration-page',
  standalone: true,
  imports: [CommonModule, RouterLink, VcButtonComponent, VcHeadingComponent, VcIconButtonComponent, VcTextComponent, VcTooltipComponent],
  templateUrl: './employee-registration.component.html',
  styleUrl: './employee-registration.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
/** Coordena a consulta e as acoes administrativas da lista de funcionarios. */
export class EmployeeRegistrationPageComponent implements OnInit {
  protected readonly employees = signal<EmployeeSummary[]>([]);
  protected readonly listLoading = signal(true);
  protected readonly listError = signal<string | null>(null);
  protected readonly statusModalOpen = signal(false);
  protected readonly selectedEmployee = signal<EmployeeSummary | null>(null);
  protected readonly statusLoading = signal(false);
  protected readonly deleteModalOpen = signal(false);
  protected readonly employeeToDelete = signal<EmployeeSummary | null>(null);
  protected readonly deleteLoading = signal(false);

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

  /** Solicita confirmação antes de excluir definitivamente o funcionário. */
  requestDelete(employee: EmployeeSummary): void {
    this.employeeToDelete.set(employee);
    this.deleteModalOpen.set(true);
  }

  /** Fecha a confirmação de exclusão quando nenhuma requisição está em andamento. */
  cancelDelete(): void {
    if (this.deleteLoading()) return;
    this.deleteModalOpen.set(false);
    this.employeeToDelete.set(null);
  }

  /** Exclui o funcionário confirmado e remove sua linha da tabela. */
  confirmDelete(): void {
    const employee = this.employeeToDelete();
    if (!employee) return;
    this.deleteLoading.set(true);

    this.employeeService.deleteEmployee(employee.id).subscribe({
      next: () => {
        this.employees.update(employees => employees.filter(item => item.id !== employee.id));
        this.deleteLoading.set(false);
        this.cancelDelete();
        this.toastService.show({
          variant: 'success',
          title: 'Funcionário excluído',
          message: `${employee.fullName} foi removido definitivamente.`
        });
      },
      error: error => {
        this.deleteLoading.set(false);
        this.toastService.show({
          variant: 'error',
          title: 'Não foi possível excluir o funcionário',
          message: error?.status === 400
            ? 'Você não pode excluir o próprio usuário.'
            : 'Tente novamente em alguns instantes.'
        });
      }
    });
  }

}
