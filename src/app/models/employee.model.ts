export interface EmployeeRegistrationPayload {
  fullName: string;
  email: string;
  role: string;
  department?: string;
  phone?: string;
  accessLevel: string;
  active: boolean;
}
