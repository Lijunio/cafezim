import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/common/Button';
import './Login.css';

export default function Register() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: signUpError } = await signUp(email, password, name);

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
    } else {
      // Redirect to home after successful signup
      navigate('/home');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Logo / Brand */}
        <div className="auth-brand">
          <div className="auth-logo">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="22" fill="#E07B4C" />
              <path d="M16 20C16 16 20 12 24 12C28 12 32 16 32 20C32 26 24 34 24 34C24 34 16 26 16 20Z" fill="#FBF7F2" />
              <ellipse cx="22" cy="19" rx="2" ry="2.5" fill="#4A3728" />
              <ellipse cx="28" cy="19" rx="2" ry="2.5" fill="#4A3728" />
              <path d="M20 23C20 23 22 25 24 25C26 25 28 23 28 23" stroke="#4A3728" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="auth-title">Cafezim</h1>
          <p className="auth-subtitle">Comece sua jornada de cafés com amigos</p>
        </div>

        {/* Register Form */}
        <form className="auth-form" onSubmit={handleRegister}>
          <div className="auth-field">
            <label htmlFor="name">Nome</label>
            <input
              id="name"
              type="text"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              placeholder="Crie uma senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" variant="primary" size="lg" fullWidth disabled={loading}>
            {loading ? 'Criando conta...' : 'Criar conta'}
          </Button>

          {error && <p className="auth-error">{error}</p>}
        </form>

        <p className="auth-footer">
          Já tem uma conta?{' '}
          <Link to="/login" className="auth-link">Entrar</Link>
        </p>
      </div>
    </div>
  );
}
