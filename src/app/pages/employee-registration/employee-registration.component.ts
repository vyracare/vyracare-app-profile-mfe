import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EmployeeFormComponent } from '../../components/employee-form/employee-form.component';
import { EmployeeService } from '../../services/employee.service';
import { EmployeeRegistrationPayload } from '../../models/employee.model';

@Component({
  selector: 'vyracare-employee-registration-page',
  standalone: true,
  imports: [CommonModule, RouterLink, EmployeeFormComponent],
  templateUrl: './employee-registration.component.html',
  styleUrl: './employee-registration.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeeRegistrationPageComponent {
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly success = signal(false);

  constructor(private readonly employeeService: EmployeeService) {}

  handleSubmit(payload: EmployeeRegistrationPayload) {
    this.loading.set(true);
    this.error.set(null);
    this.success.set(false);

    this.employeeService.registerEmployee(payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Falha ao salvar funcionario. Tente novamente.');
      }
    });
  }
}
