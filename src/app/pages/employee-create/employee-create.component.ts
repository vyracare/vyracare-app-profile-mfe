import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { VcHeadingComponent, VcTextComponent, VcToastService } from '@vyracare/design-system';
import { EmployeeFormComponent } from '../../components/employee-form/employee-form.component';
import { EmployeeRegistrationPayload } from '../../models/employee.model';
import { EmployeeService } from '../../services/employee.service';

@Component({
  selector: 'vyracare-employee-create-page',
  standalone: true,
  imports: [RouterLink, EmployeeFormComponent, VcHeadingComponent, VcTextComponent],
  templateUrl: './employee-create.component.html',
  styleUrl: './employee-create.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
/** Coordena o cadastro de funcionario em uma pagina dedicada. */
export class EmployeeCreatePageComponent {
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  constructor(
    private readonly employeeService: EmployeeService,
    private readonly router: Router,
    private readonly toastService: VcToastService
  ) {}

  /** Persiste o funcionario e retorna para a listagem depois do sucesso. */
  handleSubmit(payload: EmployeeRegistrationPayload): void {
    this.loading.set(true);
    this.error.set(null);
    this.employeeService.registerEmployee(payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.toastService.show({ variant: 'success', title: 'Funcionario cadastrado', message: 'O novo perfil foi salvo com sucesso.' });
        void this.router.navigate(['/cadastro/funcionarios']);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Falha ao salvar funcionario. Tente novamente.');
      }
    });
  }
}
