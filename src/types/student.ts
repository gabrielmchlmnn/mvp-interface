export interface Student {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  zip_code: string;
}

export interface StudentFormData {
  name: string;
  email: string;
  phone: string;
  zip_code: string;
}

export interface Address {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
}