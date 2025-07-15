
// frontend/src/pages/SignupPage/SignupPage.tsx

import React, { useState } from 'react';
import axios from 'axios';
import { FaUserPlus, FaSignInAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

interface SignupPageProps {
  // onSignupSuccess: (userId: string, userName: string) => void; // Não faz login direto, apenas redireciona
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const SignupPage: React.FC<SignupPageProps> = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [userCode, setUserCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate(); // Hook para navegação

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (!name.trim() || !email.trim() || !userCode.trim()) {
      setError('Todos os campos são obrigatórios.');
      setLoading(false);
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/users`, { name: name.trim(), email: email.trim(), userCode: userCode.trim() });
      
      setSuccessMessage(`Cadastro realizado com sucesso! Seu código é "${userCode}". Você será redirecionado para a página de Login.`);
      
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (err: any) {
      console.error('Erro ao cadastrar:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Erro ao cadastrar. Verifique se o código ou e-mail já estão em uso.');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-50 text-neutral-100">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center border border-neutral-200">
        <h1 className="text-3xl font-bold text-neutral-900 mb-6">Cadastre-se</h1>
        
        {successMessage && (
          <p className="text-green-400 text-sm mb-4">{successMessage}</p>
        )}
        {error && (
          <p className="text-red-400 text-sm mb-4">{error}</p>
        )}

        <form onSubmit={handleSignup} className="signup-form">
          <label htmlFor="name" className="block text-neutral-900 text-sm font-semibold mb-2 text-left">Nome</label>
          <input
            type="text"
            id="name"
            className="shadow appearance-none border border-neutral-700 bg-neutral-700 rounded w-full py-3 px-4 text-white leading-tight focus:outline-none focus:shadow-outline focus:bg-neutral-700 transition-colors mb-4"
            placeholder="Seu nome completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />

          <label htmlFor="email" className="block text-neutral-900 text-sm font-semibold mb-2 text-left">Email</label>
          <input
            type="email"
            id="email"
            className="shadow appearance-none border border-neutral-700 bg-neutral-700 rounded w-full py-3 px-4 text-white leading-tight focus:outline-none focus:shadow-outline focus:bg-neutral-700 transition-colors mb-4"
            placeholder="seu.email@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />

          <label htmlFor="access-code" className="block text-neutral-900 text-sm font-semibold mb-2 text-left">Código de Acesso</label>
          <input
            type="text"
            id="access-code"
            className="shadow appearance-none border border-neutral-700 bg-neutral-700 rounded w-full py-3 px-4 text-white leading-tight focus:outline-none focus:shadow-outline focus:bg-neutral-700 transition-colors mb-6"
            placeholder="Crie um código (ex: ABC123)"
            value={userCode}
            onChange={(e) => setUserCode(e.target.value)}
            disabled={loading}
          />

          <button type="submit" className="bg-neutral-600 text-white hover:bg-neutral-700 font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center w-full" disabled={loading || !name || !email || !userCode}>
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white mr-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <FaUserPlus className="mr-2" />
            )}
            Registrar
          </button>
        </form>

        <button
          onClick={handleNavigateToLogin}
          className="mt-4 text-neutral-700 hover:text-neutral-400 transition-colors flex items-center justify-center w-full"
          disabled={loading}
        >
          <FaSignInAlt className="mr-2" />
          Já tem código? Faça Login
        </button>
      </div>
    </div>
  );
};

export default SignupPage;