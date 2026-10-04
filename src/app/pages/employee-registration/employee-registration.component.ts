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
export class EmployeeRegistrationPageComponent implements OnInit {
  protected readonly employees = signal<EmployeeSummary[]>([]);
  protected readonly loading = signal(false);
  protected readonly listLoading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly listError = signal<string | null>(null);
  protected readonly success = signal(false);
  protected readonly registrationModalOpen = signal(false);

  constructor(private readonly employeeService: EmployeeService) {}

  ngOnInit(): void {
    this.search('');
  }

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

  openRegistration(): void {
    this.error.set(null);
    this.success.set(false);
    this.registrationModalOpen.set(true);
  }

  closeRegistration(): void {
    if (!this.loading()) {
      this.registrationModalOpen.set(false);
    }
  }

  trackEmployee(_: number, employee: EmployeeSummary): string {
    return employee.id;
  }

  handleSubmit(payload: EmployeeRegistrationPayload) {
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
