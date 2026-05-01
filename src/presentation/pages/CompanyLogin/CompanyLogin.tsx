import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { useCompanyStore } from '@/stores/useCompanyStore';
import { Input, Button } from '@presentation/atoms';
import { AuthCard } from '@presentation/organisms';
import { apiClient } from '@/core/config/api.config';
import './CompanyLogin.scss';

const isDevelopment = import.meta.env.DEV;

export const CompanyLogin = () => {
  const [slug, setSlug] = useState('');
  const [touched, setTouched] = useState({ slug: false });
  const [errors, setErrors] = useState({ slug: '' });
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const { setCompany, clearCompany } = useCompanyStore();
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const newErrors = { slug: '' };
    if (!slug) newErrors.slug = 'El slug de la empresa es requerido';
    else if (!/^[a-z0-9-]+$/.test(slug)) newErrors.slug = 'Solo letras minúsculas, números y guiones';
    setErrors(newErrors);
    return !newErrors.slug;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ slug: true });
    setServerError('');
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await apiClient.get(`/companies/slug/${slug.trim().toLowerCase()}`);
      const company = response.data;

      // Evita que una sesión previa quede activa durante la selección de empresa.
      logout();
      clearCompany();

      setCompany({
        slug: company.slug,
        name: company.name,
        logoUrl: company.logoUrl,
        timeZoneId: company.timeZoneId,
      });

      navigate('/login');
    } catch (err: any) {
      setServerError(err?.response?.data?.message || 'No se pudo identificar la empresa');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (slugValue: string) => {
    setSlug(slugValue);
    setTouched({ slug: true });
    setErrors({ slug: '' });
    setServerError('');
  };

  const isValid = slug && !errors.slug;

  const footer = (
    <>
      {isDevelopment && (
        <>
          <p style={{ margin: 0, fontSize: '12px', color: '#6b7280', textAlign: 'center' }}>💡 Empresas de prueba:</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { label: '🏢 sagitario', slug: 'sagitario' },
              { label: '🪟 vidrios-norte', slug: 'vidrios-norte' },
              { label: '🔧 alumcor', slug: 'alumcor' },
            ].map(({ label, slug: s }) => (
              <button
                key={label}
                type="button"
                className="auth-quick-fill"
                onClick={() => handleQuickFill(s)}
              >
                {label}
              </button>
            ))}
          </div>
        </>
      )}
      <div className="company-login__register">
        <p>¿No tenés empresa?</p>
        <a href="/company/register" className="company-login__link">
          Registrate acá
        </a>
      </div>
    </>
  );

  return (
    <>
      <AuthCard
        title="Identificá tu empresa"
        subtitle="Ingresá el slug para continuar con el acceso"
        error={serverError}
        footer={footer}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Input
            label="Slug de empresa"
            value={slug}
            onChange={(value) => {
              setSlug(value.toLowerCase());
              if (!touched.slug) setTouched({ ...touched, slug: true });
            }}
            onBlur={() => { setTouched({ ...touched, slug: true }); validateForm(); }}
            placeholder="sagitario"
            required
            disabled={loading}
            error={touched.slug ? errors.slug : ''}
            autoComplete="off"
          />
          <Button type="submit" variant="primary" fullWidth disabled={!isValid || loading}>
            {loading ? 'Buscando...' : 'Continuar'}
          </Button>
        </form>
      </AuthCard>

      <button
        className="company-login__whatsapp"
        onClick={() => window.open('https://wa.me/5491234567890', '_blank')}
        aria-label="Contactar por WhatsApp"
      >
        <span>💬</span>
      </button>
    </>
  );
};
