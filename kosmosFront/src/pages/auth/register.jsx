import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './auth.css';

const API_BASE_URL = 'http://172.20.10.2:5075/api';

export function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/user/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: username, 
          email,
          password,
        })
      });

      if (!response.ok) {
        let message = 'Ошибка регистрации';
        try {
          const data = await response.json();
          message = data.error || data.message || message;
        } catch {
          message = await response.text() || message;
        }
        throw new Error(message);
      }

      navigate('/login');
    } catch (err) {
      setError(err.message || 'Ошибка соединения');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2 className="auth-title">Регистрация</h2>
        {error && <div className="auth-error">{error}</div>}
        <div className="input-group">
          <label>Имя пользователя</label>
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} required />
        </div>
        <div className="input-group">
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="input-group">
          <label>Пароль</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <button className="auth-button" type="submit" disabled={isLoading}>
          {isLoading ? 'Загрузка...' : 'Зарегистрироваться'}
        </button>
        <p className="auth-footer">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </form>
    </div>
  );
}
