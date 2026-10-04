export interface EmployeeRegistrationPayload {
  fullName: string;
  email: string;
  role: string;
  department?: string;
  phone?: string;
  accessLevel: string;
  active: boolean;
}

export interface EmployeeSummary {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: string | null;
}
