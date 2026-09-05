import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Armchair, ArrowRight, Lock, Mail, CheckCircle } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('admin@urbanfurniture.in');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);
  const setUser = useStore((state) => state.setUser);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setUser({
      name: email.includes('admin') ? 'Admin User' : 'Senior Accountant',
      email: email,
      role: email.includes('admin') ? 'Admin' : 'Accountant',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
    });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-teal-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-purple-800/40">
        <div className="p-8 text-center bg-gradient-to-b from-purple-50 to-white border-b border-gray-100">
          <div className="w-14 h-14 bg-purple-900 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg mb-4">
            <Armchair className="w-8 h-8 text-teal-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Urban Furniture</h1>
          <p className="text-xs text-purple-800 font-semibold tracking-wide uppercase mt-1">
            Accounting & ERP System
          </p>
        </div>

        <form onSubmit={handleLogin} className="p-8 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-800 focus:border-purple-800 outline-none"
                placeholder="admin@urbanfurniture.in"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-800 focus:border-purple-800 outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-gray-600">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded text-purple-800 focus:ring-purple-800"
              />
              Remember me
            </label>
            <Link to="/forgot-password" className="text-purple-800 font-semibold hover:underline">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-purple-900 hover:bg-purple-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
          >
            <span>Sign In to Accounting Console</span>
            <ArrowRight className="w-4 h-4 text-teal-300" />
          </button>

          <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-100 text-xs text-purple-900 flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Odoo Hackathon Finalist Demo:</span> Pre-loaded with realistic Indian Urban Furniture transactions & financial ledgers.
            </div>
          </div>

          <div className="text-center text-xs text-gray-500 pt-2">
            Don't have an account?{' '}
            <Link to="/register" className="text-purple-800 font-semibold hover:underline">
              Create account
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
