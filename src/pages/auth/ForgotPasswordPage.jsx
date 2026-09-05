import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Armchair, Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-teal-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-purple-800/40">
        <div className="p-8 text-center bg-gradient-to-b from-purple-50 to-white border-b border-gray-100">
          <div className="w-14 h-14 bg-purple-900 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg mb-4">
            <Armchair className="w-8 h-8 text-teal-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Reset Password</h1>
          <p className="text-xs text-purple-800 font-semibold tracking-wide uppercase mt-1">
            Urban Furniture ERP
          </p>
        </div>

        <div className="p-8">
          {submitted ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-gray-900">Reset link sent!</h3>
              <p className="text-xs text-gray-500">
                We have sent password reset instructions to <span className="font-medium text-gray-800">{email}</span>.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-xs font-semibold text-purple-900 hover:underline pt-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-gray-600">
                Enter your account email address and we'll send you instructions to reset your password.
              </p>
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
                    placeholder="admin@urbanfurniture.in"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-purple-900 hover:bg-purple-800 text-white font-semibold rounded-lg shadow-md transition-all text-sm"
              >
                Send Reset Link
              </button>

              <div className="text-center pt-2">
                <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-purple-900 font-semibold hover:underline">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
