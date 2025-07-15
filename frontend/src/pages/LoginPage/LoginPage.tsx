// frontend/src/pages/LoginPage/LoginPage.tsx

import React, { useState } from 'react';
import { FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface LoginPageProps {
  onLoginSuccess: (userId: string, userName: string) => void;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [userCode, setUserCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (userCode.trim() === '') {
      setError('Por favor, insira seu Código de Usuário.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/auth`, { userCode: userCode.trim() });
      const { userId, name } = response.data;
      
      onLoginSuccess(userId, name);
    } catch (err: any) {
      console.error('Erro ao fazer login:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Código de usuário inválido ou erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToSignup = () => {
    navigate('/signup');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-50 text-neutral-100">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center border border-neutral-200">
        <h1 className="text-3xl text-neutral-900 mb-6">
          <span className="font-light">Ponto</span>
          <span className="font-bold"> Ilumeo</span>
        </h1>
        <form onSubmit={handleLogin} className="login-form">
          <label htmlFor="user-code" className="block text-neutral-400 text-sm font-semibold mb-2 text-left">
            Código do Usuário
          </label>
          <input
            type="text"
            id="user-code"
            placeholder="Ex: 4SXXFMf"
            value={userCode}
            onChange={(e) => setUserCode(e.target.value)}
            className="shadow appearance-none border border-neutral-700 bg-neutral-700 rounded w-full py-3 px-4 text-white leading-tight focus:outline-none focus:shadow-outline focus:bg-neutral-700 transition-colors mb-4"
            disabled={loading}
          />
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
          <button type="submit" className="bg-neutral-600 text-white hover:bg-neutral-700 font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center w-full" disabled={loading}>
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white mr-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <FaSignInAlt className="mr-2" />
            )}
            Confirmar
          </button>
        </form>

        <button
          onClick={handleNavigateToSignup}
          className="mt-4 text-neutral-700 hover:text-neutral-400 transition-colors flex items-center justify-center w-full"
          disabled={loading}
        >
          <FaUserPlus className="mr-2" />
          Não tem código? Registre-se
        </button>
      </div>
    </div>
  );
};

export default LoginPage;