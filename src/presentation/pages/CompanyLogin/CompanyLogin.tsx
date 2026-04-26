import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompanyStore } from '@/stores/useCompanyStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { Button } from '@presentation/atoms';
import { apiClient } from '@/core/config/api.config';
import './CompanyLogin.scss';

const isDevelopment = import.meta.env.DEV;

export const CompanyLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    password: '',
  });
  const { setCompany } = useCompanyStore();
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Limpiar error específico del campo cuando el usuario escribe
    if (fieldErrors[name as keyof typeof fieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (error) setError('');
  };

  const validateForm = (): boolean => {
    const errors = {
      email: '',
      password: '',
    };

    if (!formData.email) {
      errors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'El email no es válido';
    }

    if (!formData.password) {
      errors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 8) {
      errors.password = 'La contraseña debe tener al menos 8 caracteres';
    }

    setFieldErrors(errors);
    return !errors.email && !errors.password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validar formulario
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      console.log('🔐 Intentando login con:', formData.email);

      // Login genérico (busca en todas las empresas)
      const response = await apiClient.post('/auth/login', formData);
      console.log('✅ Login exitoso:', response.data);

      if (response.data) {
        const { user, token } = response.data;
        console.log('👤 Usuario:', user);
        console.log('🏢 CompanyId:', user.companyId);

        // Obtener datos de la company (pasando token manualmente)
        console.log('📡 Obteniendo datos de company...');
        const companyResponse = await apiClient.get(`/companies/${user.companyId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('✅ Company obtenida:', companyResponse.data);

        // Guardar SOLO la company en el store (NO el auth todavía)
        setCompany({
          slug: companyResponse.data.slug,
          name: companyResponse.data.name,
          logoUrl: companyResponse.data.logoUrl,
        });
        console.log('💾 Company guardada en store');

        // Redirigir al login interno de empleados
        console.log('🚀 Redirigiendo a login interno...');
        navigate('/login');
      }
    } catch (err: any) {
      console.error('❌ Error en login:', err);
      console.error('📄 Response:', err?.response);
      const message = err?.response?.data?.message || 'Email o contraseña incorrectos';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsApp = () => {
    window.open('https://wa.me/5491234567890', '_blank');
  };

  const handleQuickFill = (emailValue: string, passwordValue: string) => {
    setFormData({ email: emailValue, password: passwordValue });
    setFieldErrors({ email: '', password: '' });
    setError('');
  };

  return (
    <div className="company-login">
      <div className="company-login__container">
        {/* Header con logo y contacto */}
        <div className="company-login__header">
          <img
            src="/SVG/Proxar.svg"
            alt="Proxar"
            className="company-login__logo"
          />
          <div className="company-login__contact">
            <p>📧 contacto@proxar.com</p>
            <p>📞 +54 9 11 1234-5678</p>
          </div>
        </div>

        {/* Formulario principal */}
        <div className="company-login__content">
          <h1 className="company-login__title">Bienvenido a Proxar</h1>
          <p className="company-login__subtitle">
            Ingresá con tu cuenta para gestionar tu empresa
          </p>

          <form onSubmit={handleSubmit} className="company-login__form">
            <div className="company-login__field">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="tu@email.com"
                className={`company-login__input ${fieldErrors.email ? 'company-login__input--error' : ''}`}
                disabled={loading}
                required
              />
              {fieldErrors.email && <span className="company-login__field-error">⚠️ {fieldErrors.email}</span>}
            </div>

            <div className="company-login__field">
              <div className="company-login__password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Contraseña"
                  className={`company-login__input ${fieldErrors.password ? 'company-login__input--error' : ''}`}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  className="company-login__password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {fieldErrors.password && <span className="company-login__field-error">⚠️ {fieldErrors.password}</span>}
            </div>

            {error && <p className="company-login__error">{error}</p>}

            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="company-login__button"
            >
              {loading ? 'Ingresando...' : 'Iniciar Sesión'}
            </Button>
          </form>

          {isDevelopment && (
            <div className="company-login__footer">
              <p className="company-login__hint">💡 Empresas de prueba:</p>
              <div className="company-login__quick-fills">
                <button
                  type="button"
                  className="company-login__quick-fill"
                  onClick={() => handleQuickFill('admin@sagitario.com', 'Admin1234')}
                >
                  🏢 Sagitario
                </button>
                <button
                  type="button"
                  className="company-login__quick-fill"
                  onClick={() => handleQuickFill('admin@vidriosnorte.com', 'Admin1234')}
                >
                  🪟 Vidrios Norte
                </button>
                <button
                  type="button"
                  className="company-login__quick-fill"
                  onClick={() => handleQuickFill('admin@alumcor.com', 'Admin1234')}
                >
                  🔧 AlumCor
                </button>
              </div>
            </div>
          )}

          <div className="company-login__register">
            <p>¿No tenés empresa?</p>
            <a href="/company/register" className="company-login__link">
              Registrate acá
            </a>
          </div>
        </div>

        {/* Botón WhatsApp flotante */}
        <button
          className="company-login__whatsapp"
          onClick={handleWhatsApp}
          aria-label="Contactar por WhatsApp"
        >
          <span>💬</span>
        </button>

        {/* Chatbot simulado */}
        <div className="company-login__chatbot">
          <div className="company-login__chatbot-header">
            <span>🤖</span>
            <span>Asistente Proxar</span>
          </div>
          <div className="company-login__chatbot-body">
            <div className="company-login__chatbot-message">
              ¡Hola! ¿En qué puedo ayudarte?
            </div>
            <div className="company-login__chatbot-message">
              Próximamente disponible...
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
