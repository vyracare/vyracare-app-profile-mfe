import { Routes } from '@angular/router';
import { EmployeeRegistrationPageComponent } from './pages/employee-registration/employee-registration.component';
import { EmployeeEditPageComponent } from './pages/employee-edit/employee-edit.component';
import { EmployeeCreatePageComponent } from './pages/employee-create/employee-create.component';

export const routes: Routes = [
  { path: '', component: EmployeeRegistrationPageComponent },
  { path: 'novo', component: EmployeeCreatePageComponent },
  { path: 'editar/:id', component: EmployeeEditPageComponent }
];

export const ROUTES: Routes = routes;
