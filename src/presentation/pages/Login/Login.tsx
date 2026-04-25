import { useState } from 'react';
import { useLogin } from '@/hooks/api/useAuth';
import { Input, Button } from '@presentation/atoms';
import { Spinner } from '@presentation/molecules';
import logo from '../../../../public/SVG/Proxar-full.svg'
import './Login.scss';

export const Login = () => {
  const login = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate({ email, password });
  };

  const isValid = email && password;

  return (
    <div className="login">
      <div className="login__container">
        <div className="login__logo">
          <img src={logo} alt="Logo" className="logo" />
        </div>

        <div className="login__card">
          <h1 className="login__title">Iniciar Sesión</h1>
          <p className="login__subtitle">Aberturas Sagitario</p>

          <form onSubmit={handleSubmit} className="login__form">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="tu@email.com"
              required
              disabled={login.isPending}
            />

            <Input
              label="Contraseña"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              required
              disabled={login.isPending}
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={!isValid || login.isPending}
            >
              {login.isPending ? (
                <>
                  <Spinner size="sm" />
                  Ingresando...
                </>
              ) : (
                'Ingresar'
              )}
            </Button>
          </form>

          <div className="login__footer">
            <p className="login__hint">
              💡 Usuarios de prueba:<br />
              <code>admin@proxar.com</code> / <code>Admin123!</code><br />
              <code>operador@proxar.com</code> / <code>Operador123!</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};