import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { VcButtonComponent, VcHeadingComponent, VcTextComponent } from '@vyracare/design-system';
import { EmployeeFormComponent } from '../../components/employee-form/employee-form.component';
import { EmployeeService } from '../../services/employee.service';
import { EmployeeRegistrationPayload, EmployeeSummary } from '../../models/employee.model';

@Component({
  selector: 'vyracare-employee-registration-page',
  standalone: true,
  imports: [CommonModule, RouterLink, EmployeeFormComponent, VcButtonComponent, VcHeadingComponent, VcTextComponent],
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

  constructor(private readonly employeeService: EmployeeService) {}

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
      error: () => {
        this.employees.set([]);
        this.listError.set('Não foi possível carregar os funcionários.');
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
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Falha ao salvar funcionario. Tente novamente.');
      }
    });
  }
}
