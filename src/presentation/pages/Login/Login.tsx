import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompanyStore } from '@/stores/useCompanyStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { Input, Button } from '@presentation/atoms';
import { Spinner } from '@presentation/molecules';
import { AuthCard } from '@presentation/organisms';
import { isValidEmail } from '@/utils/validators';
import { getApiErrorMessage } from '@/utils/api.utils';
import { apiClient } from '@/core/config/api.config';

export const Login = () => {
  const { company } = useCompanyStore();
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [touched, setTouched] = useState({ email: false, password: false });
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (!company) navigate('/company/login', { replace: true });
  }, [company, navigate]);

  useEffect(() => {
    const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
    if (emailInput) emailInput.focus();
  }, []);

  useEffect(() => {
    if (serverError) setServerError('');
  }, [email, password]);

  const validateForm = () => {
    const newErrors = { email: '', password: '' };
    if (touched.email && !email) newErrors.email = 'El email es requerido';
    else if (touched.email && !isValidEmail(email)) newErrors.email = 'Email inválido';
    if (touched.password && !password) newErrors.password = 'La contraseña es requerida';
    else if (touched.password && password.length < 8) newErrors.password = 'Mínimo 8 caracteres';
    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });

    const newErrors = { email: '', password: '' };
    if (!email) newErrors.email = 'El email es requerido';
    else if (!isValidEmail(email)) newErrors.email = 'Email inválido';
    if (!password) newErrors.password = 'La contraseña es requerida';
    else if (password.length < 8) newErrors.password = 'Mínimo 8 caracteres';
    setErrors(newErrors);

    if (!newErrors.email && !newErrors.password && company) {
      setLoading(true);
      setServerError('');
      try {
        const response = await apiClient.post(`/auth/login/${company.slug}`, {
          email: email.trim(),
          password,
        });
        if (response.data) {
          setAuth(
            response.data.user,
            response.data.token,
            response.data.refreshToken,
            response.data.expiresAt,
            response.data.refreshTokenExpiresAt
          );
          navigate('/');
        }
      } catch (err) {
        setServerError(getApiErrorMessage(err, 'Error al iniciar sesión. Verificá tus credenciales.'));
      } finally {
        setLoading(false);
      }
    }
  };

  const isValid = email && password && !errors.email && !errors.password;

  const badge = company ? `🏢 ${company.name}` : undefined;

  return (
    <AuthCard
      title="Bienvenido"
      subtitle="Ingresá tus credenciales para continuar"
      error={serverError}
      badge={badge}
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
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Spinner size="xs" /> Ingresando...
            </span>
          ) : 'Ingresar'}
        </Button>
      </form>
    </AuthCard>
  );
};
