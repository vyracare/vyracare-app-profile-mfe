import { Routes } from '@angular/router';
import { EmployeeRegistrationPageComponent } from './pages/employee-registration/employee-registration.component';
import { EmployeeEditPageComponent } from './pages/employee-edit/employee-edit.component';

export const routes: Routes = [
  { path: '', component: EmployeeRegistrationPageComponent },
  { path: 'editar/:id', component: EmployeeEditPageComponent }
];

export const ROUTES: Routes = routes;
