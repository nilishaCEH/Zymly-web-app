import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate('/admin/dashboard');
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail.map(e => e.msg || JSON.stringify(e)).join(' '));
      } else if (typeof detail === 'string') {
        setError(detail);
      } else {
        setError('Invalid credentials');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#2B3033] flex items-center justify-center px-4" data-testid="admin-login-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <img
            src="/zymly-logo.png"
            alt="Zymly"
            className="h-16 mx-auto mb-4"
            style={{ filter: 'drop-shadow(0 4px 14px rgba(0, 0, 0, 0.45))' }}
          />
          <h1 className="text-2xl font-bold text-[#E0D8C8]">Admin Login</h1>
          <p className="text-[#E0D8C8]/60 mt-2">Access the CMS dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#F2EFE8] rounded-2xl p-8" data-testid="login-form">
          {error && (
            <div className="bg-red-100 text-red-600 px-4 py-3 rounded-lg mb-6" data-testid="login-error">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-[#2B3033]">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@zymly.in"
                className="mt-2 bg-white border-[#2B3033]/20"
                data-testid="login-email-input"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-[#2B3033]">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-2 bg-white border-[#2B3033]/20"
                data-testid="login-password-input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-secondary w-full"
              data-testid="login-submit-button"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
