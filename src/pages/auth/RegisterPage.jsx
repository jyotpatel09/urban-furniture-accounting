import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Armchair, ArrowRight, User, Mail, Lock } from 'lucide-react';

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const setUser = useStore((state) => state.setUser);
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    setUser({
      name: name || 'New Admin',
      email: email || 'user@urbanfurniture.in',
      role: 'Admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
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
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Create Urban Furniture Account</h1>
          <p className="text-xs text-purple-800 font-semibold tracking-wide uppercase mt-1">
            Enterprise Accounting & ERP
          </p>
        </div>

        <form onSubmit={handleRegister} className="p-8 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-800 outline-none"
                placeholder="Nimesh Pathak"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-800 outline-none"
                placeholder="nimesh@example.com"
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
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-800 outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-purple-900 hover:bg-purple-800 text-white font-semibold rounded-lg shadow-md transition-all flex items-center justify-center gap-2 text-sm mt-2"
          >
            <span>Register & Start Demo</span>
            <ArrowRight className="w-4 h-4 text-teal-300" />
          </button>

          <div className="text-center text-xs text-gray-500 pt-2">
            Already have an account?{' '}
            <Link to="/login" className="text-purple-800 font-semibold hover:underline">
              Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
