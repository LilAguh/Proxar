import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { useCompanyStore } from '@/stores/useCompanyStore';
import { Input, Button } from '@presentation/atoms';
import { AuthCard } from '@presentation/organisms';
import { getApiErrorMessage } from '@/utils/api.utils';
import { apiClient } from '@/core/config/api.config';
import './CompanyLogin.scss';

export const CompanyLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const { setCompany } = useCompanyStore();
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const newErrors = { email: '', password: '' };
    if (!email) newErrors.email = 'El email es requerido';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Email inválido';
    if (!password) newErrors.password = 'La contraseña es requerida';
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
      const response = await apiClient.post('/auth/login', {
        email: email.trim(),
        password: password,
      });

      const { user, company, token, refreshToken, expiresAt, refreshTokenExpiresAt } = response.data;

      // Guardar company en el store
      setCompany({
        slug: company.slug,
        name: company.name,
        logoUrl: company.logoUrl,
        timeZoneId: company.timeZoneId,
      });

      // Guardar autenticación
      setAuth(user, token, refreshToken, expiresAt, refreshTokenExpiresAt);

      // Redirigir al dashboard
      navigate('/');
    } catch (err) {
      setServerError(getApiErrorMessage(err, 'Email o contraseña incorrectos'));
    } finally {
      setLoading(false);
    }
  };

  const isValid = email && password && !errors.email && !errors.password;

  const footer = (
    <div className="company-login__register">
      <p>¿No tenés empresa?</p>
      <a href="/company/register" className="company-login__link">
        Registrate acá
      </a>
    </div>
  );

  return (
    <>
      <AuthCard
        title="Ingresá a tu Empresa"
        subtitle="Usá tu email y contraseña de administrador"
        error={serverError}
        footer={footer}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(value) => {
              setEmail(value);
              if (touched.email) validateForm();
            }}
            onBlur={() => {
              setTouched({ ...touched, email: true });
              validateForm();
            }}
            placeholder="tu@empresa.com"
            required
            disabled={loading}
            error={touched.email ? errors.email : ''}
            autoComplete="email"
          />

          <div style={{ position: 'relative' }}>
            <Input
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(value) => {
                setPassword(value);
                if (touched.password) validateForm();
              }}
              onBlur={() => {
                setTouched({ ...touched, password: true });
                validateForm();
              }}
              placeholder="••••••••"
              required
              disabled={loading}
              error={touched.password ? errors.password : ''}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '38px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '18px',
              }}
              tabIndex={-1}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>

          <Button type="submit" variant="primary" fullWidth disabled={!isValid || loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
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
