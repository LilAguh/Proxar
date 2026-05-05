export interface Company {
  // Identificación
  id: string;
  slug: string;
  name: string;
  legalName?: string;
  logoUrl?: string;
  website?: string;
  active: boolean;
  createdAt: string;

  // Datos fiscales (Argentina)
  cuit?: string;
  iva?: string; // IVACondition: ResponsableInscripto, Monotributista, etc.
  iibb?: string;
  fiscalAddress?: string;
  fiscalCity?: string;
  fiscalProvince?: string;
  fiscalPostalCode?: string;
  startOfActivities?: string;
  defaultSalesPoint?: number;

  // Contacto
  email?: string;
  phone?: string;
  mobilePhone?: string;
  supportEmail?: string;

  // Configuración regional
  currency?: string; // ISO 4217: ARS, USD, EUR
  timeZoneId?: string; // IANA: America/Argentina/Buenos_Aires
  language?: string; // es-AR, en-US
  dateFormat?: string; // dd/MM/yyyy
}
