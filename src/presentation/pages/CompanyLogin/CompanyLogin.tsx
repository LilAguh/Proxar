import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompanyStore } from '@/stores/useCompanyStore';
import { Input, Button } from '@presentation/atoms';
import { AuthCard } from '@presentation/organisms';
import { apiClient } from '@/core/config/api.config';
import { isValidEmail } from '@/utils/validators';
import './CompanyLogin.scss';

const isDevelopment = import.meta.env.DEV;

export const CompanyLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false });
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const { setCompany } = useCompanyStore();
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const newErrors = { email: '', password: '' };
    if (!email) newErrors.email = 'El email es requerido';
    else if (!isValidEmail(email)) newErrors.email = 'El email no es válido';
    if (!password) newErrors.password = 'La contraseña es requerida';
    else if (password.length < 8) newErrors.password = 'Mínimo 8 caracteres';
    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    setServerError('');
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      if (response.data) {
        const { user, token } = response.data;
        const companyResponse = await apiClient.get(`/companies/${user.companyId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCompany({
          slug: companyResponse.data.slug,
          name: companyResponse.data.name,
          logoUrl: companyResponse.data.logoUrl,
        });
        navigate('/login');
      }
    } catch (err: any) {
      setServerError(err?.response?.data?.message || 'Email o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (emailValue: string, passwordValue: string) => {
    setEmail(emailValue);
    setPassword(passwordValue);
    setTouched({ email: true, password: true });
    setErrors({ email: '', password: '' });
    setServerError('');
  };

  const isValid = email && password && !errors.email && !errors.password;

  const footer = (
    <>
      {isDevelopment && (
        <>
          <p style={{ margin: 0, fontSize: '12px', color: '#6b7280', textAlign: 'center' }}>💡 Empresas de prueba:</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { label: '🏢 Sagitario', email: 'admin@sagitario.com', pass: 'Admin1234' },
              { label: '🪟 Vidrios Norte', email: 'admin@vidriosnorte.com', pass: 'Admin1234' },
              { label: '🔧 AlumCor', email: 'admin@alumcor.com', pass: 'Admin1234' },
            ].map(({ label, email: e, pass }) => (
              <button
                key={label}
                type="button"
                className="auth-quick-fill"
                onClick={() => handleQuickFill(e, pass)}
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
        title="Bienvenido a Proxar"
        subtitle="Ingresá con tu cuenta para gestionar tu empresa"
        error={serverError}
        footer={footer}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(value) => { setEmail(value); if (!touched.email) setTouched({ ...touched, email: true }); }}
            onBlur={() => { setTouched({ ...touched, email: true }); validateForm(); }}
            placeholder="tu@email.com"
            required
            disabled={loading}
            error={touched.email ? errors.email : ''}
            autoComplete="email"
          />
          <Input
            label="Contraseña"
            type="password"
            value={password}
            onChange={(value) => { setPassword(value); if (!touched.password) setTouched({ ...touched, password: true }); }}
            onBlur={() => { setTouched({ ...touched, password: true }); validateForm(); }}
            placeholder="••••••••"
            required
            disabled={loading}
            error={touched.password ? errors.password : ''}
            autoComplete="current-password"
          />
          <Button type="submit" variant="primary" fullWidth disabled={!isValid || loading}>
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
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
