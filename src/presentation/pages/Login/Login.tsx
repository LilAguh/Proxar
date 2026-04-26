import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompanyStore } from '@/stores/useCompanyStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { Input, Button } from '@presentation/atoms';
import { Spinner } from '@presentation/molecules';
import { isValidEmail } from '@/utils/validators';
import { apiClient } from '@/core/config/api.config';
import './Login.scss';

const isDevelopment = import.meta.env.DEV;

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

  // Verificar que haya company guardada, sino redirigir a /company
  useEffect(() => {
    if (!company) {
      navigate('/company', { replace: true });
    }
  }, [company, navigate]);

  // Auto-focus en email al cargar
  useEffect(() => {
    const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
    if (emailInput) {
      emailInput.focus();
    }
  }, []);

  // Limpiar errores cuando cambian los valores
  useEffect(() => {
    if (serverError) {
      setServerError('');
    }
  }, [email, password]);

  const validateForm = () => {
    const newErrors = { email: '', password: '' };

    if (touched.email && !email) {
      newErrors.email = 'El email es requerido';
    } else if (touched.email && !isValidEmail(email)) {
      newErrors.email = 'Email inválido';
    }

    if (touched.password && !password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (touched.password && password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    }

    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Marcar todos como touched
    setTouched({ email: true, password: true });

    // Validar
    const newErrors = { email: '', password: '' };

    if (!email) {
      newErrors.email = 'El email es requerido';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Email inválido';
    }

    if (!password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    }

    setErrors(newErrors);

    if (!newErrors.email && !newErrors.password && company) {
      setLoading(true);
      setServerError('');

      try {
        // Login interno por slug de empresa
        const response = await apiClient.post(`/auth/login/${company.slug}`, {
          email: email.trim(),
          password: password,
        });

        if (response.data) {
          // Guardar auth
          setAuth(response.data.user, response.data.token);

          // Redirigir al dashboard
          navigate('/');
        }
      } catch (err: any) {
        const message = err?.response?.data?.message || 'Error al iniciar sesión. Verificá tus credenciales.';
        setServerError(message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleQuickFill = (emailValue: string, passwordValue: string) => {
    setEmail(emailValue);
    setPassword(passwordValue);
    setTouched({ email: true, password: true });
  };

  const isValid = email && password && !errors.email && !errors.password;

  return (
    <div className="login">
      <div className="login__container">
        

        <div className="login__card">
          {company && (
            <div className="login__company-badge">
              🏢 {company.name}
            </div>
          )}

          <div className="login__logo">
          <img
            src="/SVG/Proxar.svg"
            alt="Proxar"
            className="company-login__logo"
          />
        </div>

          <h1 className="login__title">Bienvenido</h1>
          <p className="login__subtitle">Ingresá tus credenciales para continuar</p>

          {serverError && (
            <div className="login__error">
              ⚠️ {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login__form">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(value) => {
                setEmail(value);
                if (!touched.email) setTouched({ ...touched, email: true });
              }}
              onBlur={() => {
                setTouched({ ...touched, email: true });
                validateForm();
              }}
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
              onChange={(value) => {
                setPassword(value);
                if (!touched.password) setTouched({ ...touched, password: true });
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

            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={!isValid || loading}
            >
              {loading ? (
                <div className="login__button-loading">
                  <Spinner size="sm" />
                  <span>Ingresando...</span>
                </div>
              ) : (
                'Ingresar'
              )}
            </Button>
          </form>

          {isDevelopment && (
            <div className="login__footer">
              <p className="login__hint">💡 Usuarios de prueba:</p>
              <div className="login__quick-fills">
                <button
                  type="button"
                  className="login__quick-fill"
                  onClick={() => handleQuickFill('admin@sagitario.com', 'Admin1234')}
                >
                  👑 Admin
                </button>
                <button
                  type="button"
                  className="login__quick-fill"
                  onClick={() => handleQuickFill('operador@sagitario.com', 'Operador1234')}
                >
                  👤 Operador
                </button>
                <button
                  type="button"
                  className="login__quick-fill"
                  onClick={() => handleQuickFill('visor@sagitario.com', 'Visor1234')}
                >
                  👁️ Visor
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};