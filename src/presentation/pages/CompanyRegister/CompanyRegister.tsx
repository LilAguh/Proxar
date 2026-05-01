import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompanyStore } from '@/stores/useCompanyStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { Button } from '@presentation/atoms';
import { Spinner } from '@presentation/molecules';
import { apiClient } from '@/core/config/api.config';
import { getErrorMessage } from '@core/utils/errorMessage';
import './CompanyRegister.scss';

export const CompanyRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    companyName: '',
    companySlug: '',
    logoUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    companyName: '',
    companySlug: '',
  });
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    passwordConfirm: false,
    companyName: false,
    companySlug: false,
  });
  const { setCompany } = useCompanyStore();
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'name':
        if (!value) return 'El nombre es requerido';
        if (value.length < 2) return 'Mínimo 2 caracteres';
        return '';

      case 'email':
        if (!value) return 'El email es requerido';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Email inválido';
        return '';

      case 'password':
        if (!value) return 'La contraseña es requerida';
        if (value.length < 8) return 'Mínimo 8 caracteres';
        return '';

      case 'passwordConfirm':
        if (!value) return 'Confirmá tu contraseña';
        if (value !== formData.password) return 'Las contraseñas no coinciden';
        return '';

      case 'companyName':
        if (!value) return 'El nombre de la empresa es requerido';
        if (value.length < 2) return 'Mínimo 2 caracteres';
        return '';

      case 'companySlug':
        if (!value) return 'El slug es requerido';
        if (value.length < 2) return 'Mínimo 2 caracteres';
        if (!/^[a-z0-9-]+$/.test(value)) return 'Solo letras minúsculas, números y guiones';
        return '';

      default:
        return '';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Marcar como touched
    setTouched((prev) => ({ ...prev, [name]: true }));

    // Validar el campo
    const error = validateField(name, value);
    setFieldErrors((prev) => ({ ...prev, [name]: error }));

    // Si cambia password, revalidar passwordConfirm
    if (name === 'password' && formData.passwordConfirm) {
      const confirmError = validateField('passwordConfirm', formData.passwordConfirm);
      setFieldErrors((prev) => ({ ...prev, passwordConfirm: confirmError }));
    }

    // Auto-generar slug desde companyName
    if (name === 'companyName') {
      const slug = value
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      setFormData((prev) => ({ ...prev, companySlug: slug }));

      // Validar el slug generado
      const slugError = validateField('companySlug', slug);
      setFieldErrors((prev) => ({ ...prev, companySlug: slugError }));
      setTouched((prev) => ({ ...prev, companySlug: true }));
    }

    // Limpiar error general
    if (error) setError('');
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    const error = validateField(name, value);
    setFieldErrors((prev) => ({ ...prev, [name]: error }));
  };

  const validateForm = (): boolean => {
    const errors = {
      name: validateField('name', formData.name),
      email: validateField('email', formData.email),
      password: validateField('password', formData.password),
      passwordConfirm: validateField('passwordConfirm', formData.passwordConfirm),
      companyName: validateField('companyName', formData.companyName),
      companySlug: validateField('companySlug', formData.companySlug),
    };

    setFieldErrors(errors);
    setTouched({
      name: true,
      email: true,
      password: true,
      passwordConfirm: true,
      companyName: true,
      companySlug: true,
    });

    return !Object.values(errors).some(err => err !== '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validar formulario
    if (!validateForm()) {
      setError('Por favor corregí los errores antes de continuar');
      return;
    }

    setLoading(true);

    try {
      // Remover passwordConfirm antes de enviar
      const { passwordConfirm, ...registerData } = formData;

      const response = await apiClient.post('/auth/register', registerData);

      if (response.data) {
        // Guardar company en el store
        setCompany({
          slug: formData.companySlug,
          name: formData.companyName,
          logoUrl: formData.logoUrl || undefined,
        });

        // Guardar auth (el usuario owner ya viene logueado)
        setAuth(response.data.user, response.data.token);

        // Redirigir al dashboard
        navigate('/');
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Error al registrar la empresa'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="company-register">
      <div className="company-register__container">
        <div className="company-register__header">
          <img
            src="/SVG/Proxar-full.svg"
            alt="Proxar"
            className="company-register__logo"
          />
          <h1 className="company-register__title">Registrá tu Empresa</h1>
          <p className="company-register__subtitle">
            Creá tu cuenta y comenzá a gestionar tu negocio
          </p>
        </div>

        <form onSubmit={handleSubmit} className="company-register__form">
          <div className="company-register__section">
            <h3>Datos de la Empresa</h3>
            <div className="company-register__field">
              <label>Nombre de la Empresa *</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Ej: Aberturas Norte"
                className={touched.companyName && fieldErrors.companyName ? 'error' : ''}
                disabled={loading}
              />
              {touched.companyName && fieldErrors.companyName && (
                <span className="company-register__field-error">⚠️ {fieldErrors.companyName}</span>
              )}
            </div>

            <div className="company-register__field">
              <label>Identificador (slug) *</label>
              <input
                type="text"
                name="companySlug"
                value={formData.companySlug}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="aberturas-norte"
                className={touched.companySlug && fieldErrors.companySlug ? 'error' : ''}
                disabled={loading}
              />
              {touched.companySlug && fieldErrors.companySlug ? (
                <span className="company-register__field-error">⚠️ {fieldErrors.companySlug}</span>
              ) : (
                <small>Solo letras minúsculas, números y guiones. Se genera automáticamente.</small>
              )}
            </div>

            <div className="company-register__field">
              <label>Logo URL (opcional)</label>
              <input
                type="url"
                name="logoUrl"
                value={formData.logoUrl}
                onChange={handleChange}
                placeholder="https://ejemplo.com/logo.png"
                disabled={loading}
              />
            </div>
          </div>

          <div className="company-register__section">
            <h3>Tus Datos (Administrador)</h3>
            <div className="company-register__field">
              <label>Nombre Completo *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Juan Pérez"
                className={touched.name && fieldErrors.name ? 'error' : ''}
                disabled={loading}
              />
              {touched.name && fieldErrors.name && (
                <span className="company-register__field-error">⚠️ {fieldErrors.name}</span>
              )}
            </div>

            <div className="company-register__field">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="tu@email.com"
                className={touched.email && fieldErrors.email ? 'error' : ''}
                disabled={loading}
              />
              {touched.email && fieldErrors.email && (
                <span className="company-register__field-error">⚠️ {fieldErrors.email}</span>
              )}
            </div>

            <div className="company-register__field">
              <label>Contraseña *</label>
              <div className="company-register__password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="••••••••"
                  className={touched.password && fieldErrors.password ? 'error' : ''}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="company-register__password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {touched.password && fieldErrors.password ? (
                <span className="company-register__field-error">⚠️ {fieldErrors.password}</span>
              ) : (
                <small>Mínimo 8 caracteres</small>
              )}
            </div>

            <div className="company-register__field">
              <label>Confirmar Contraseña *</label>
              <div className="company-register__password-wrapper">
                <input
                  type={showPasswordConfirm ? 'text' : 'password'}
                  name="passwordConfirm"
                  value={formData.passwordConfirm}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="••••••••"
                  className={touched.passwordConfirm && fieldErrors.passwordConfirm ? 'error' : ''}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="company-register__password-toggle"
                  onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                  tabIndex={-1}
                >
                  {showPasswordConfirm ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {touched.passwordConfirm && fieldErrors.passwordConfirm && (
                <span className="company-register__field-error">⚠️ {fieldErrors.passwordConfirm}</span>
              )}
            </div>
          </div>

          {error && <div className="company-register__error">⚠️ {error}</div>}

          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            fullWidth
            className="company-register__button"
          >
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                <Spinner size="xs" />
                <span>Registrando empresa...</span>
              </div>
            ) : (
              'Crear Empresa'
            )}
          </Button>
        </form>

        <div className="company-register__footer">
          <p>¿Ya tenés una empresa?</p>
          <a href="/company/login" className="company-register__link">
            Iniciá sesión
          </a>
        </div>
      </div>
    </div>
  );
};
