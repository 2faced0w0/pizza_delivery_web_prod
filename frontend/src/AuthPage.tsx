import { useState, FormEvent } from 'react';
import { api } from './api';

interface AuthPageProps {
  onClose?: () => void;
  onAuthSuccess?: (userData: any) => void;
}

export default function AuthPage({ onClose, onAuthSuccess }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const response = await api.post(endpoint, { email, password });
      
      if (response.token) {
        localStorage.setItem('authToken', response.token);
        // Decode JWT to get user role
        try {
          const payload = JSON.parse(atob(response.token.split('.')[1]));
          const userData = { token: response.token, role: payload.role, id: payload.id };
          if (onAuthSuccess) onAuthSuccess(userData);
        } catch (err) {
          console.error('Error decoding token:', err);
          if (onAuthSuccess) onAuthSuccess(response);
        }
      }
      
      if (onClose) onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      fontFamily: 'sans-serif'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 12,
        padding: 40,
        width: '90%',
        maxWidth: 420,
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'transparent',
            border: 'none',
            fontSize: 24,
            cursor: 'pointer',
            color: '#666',
            padding: 0,
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ×
        </button>

        <h2 style={{ marginTop: 0, marginBottom: 8, fontSize: 28, textAlign: 'center' }}>
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: 32, fontSize: 14 }}>
          {isLogin ? 'Login to continue your pizza journey' : 'Sign up to start building your perfect pizza'}
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: '500', fontSize: 14 }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: 16,
                border: '1px solid #ddd',
                borderRadius: 6,
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#1976d2'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#ddd'}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: '500', fontSize: 14 }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: 16,
                border: '1px solid #ddd',
                borderRadius: 6,
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#1976d2'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#ddd'}
            />
          </div>

          {!isLogin && (
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: '500', fontSize: 14 }}>
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: 16,
                  border: '1px solid #ddd',
                  borderRadius: 6,
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#1976d2'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#ddd'}
              />
            </div>
          )}

          {error && (
            <div style={{
              padding: '12px 16px',
              background: '#ffebee',
              color: '#c62828',
              borderRadius: 6,
              marginBottom: 20,
              fontSize: 14
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              fontSize: 16,
              fontWeight: '600',
              color: '#fff',
              background: loading ? '#90a4ae' : '#1976d2',
              border: 'none',
              borderRadius: 6,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
              marginBottom: 16
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#1565c0'; }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = '#1976d2'; }}
          >
            {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Sign Up')}
          </button>

          <div style={{ textAlign: 'center', fontSize: 14 }}>
            <span style={{ color: '#666' }}>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
            </span>
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setPassword('');
                setConfirmPassword('');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#1976d2',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: 14,
                textDecoration: 'underline',
                padding: 0
              }}
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
