
import React, { useState } from 'react';
import { Flower2, Mail, Lock, User as UserIcon, ArrowRight } from 'lucide-react';
import { Button } from './Button';
import { dbService } from '../services/dbService';
import { User } from '../types';

interface AuthProps {
  onSuccess: (user: User) => void;
  onCancel: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onSuccess, onCancel }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      let user;
      if (isLogin) {
        user = await dbService.login(formData.email, formData.password);
      } else {
        if (!formData.name) throw new Error("Name is required");
        user = await dbService.register(formData.name, formData.email, formData.password);
      }
      onSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#646E57]/80 backdrop-blur-xl border border-[#A4BAA8]/20 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        
        {/* Decorative background element */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#E2D2BC]/10 rounded-full blur-3xl"></div>
        
        <div className="flex flex-col items-center mb-8">
          <div className="bg-[#E2D2BC] p-3 rounded-xl shadow-lg mb-4">
            <Flower2 className="h-8 w-8 text-[#646E57]" />
          </div>
          <h2 className="text-2xl font-serif text-[#E2D2BC] font-medium tracking-wide">
            {isLogin ? 'Welcome Back' : 'Join ReScape'}
          </h2>
          <p className="text-[#A4BAA8] text-sm mt-2 text-center">
            {isLogin ? 'Log in to access your client projects.' : 'Create an account to start designing.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {!isLogin && (
            <div className="space-y-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-4 w-4 text-[#A4BAA8]" />
                </div>
                <input
                  type="text"
                  placeholder="Full Name"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-black/20 border border-[#A4BAA8]/20 rounded-xl text-[#E2D2BC] placeholder-[#A4BAA8]/50 focus:outline-none focus:border-[#E2D2BC] transition-colors"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-[#A4BAA8]" />
              </div>
              <input
                type="email"
                placeholder="Email Address"
                required
                className="w-full pl-10 pr-4 py-3 bg-black/20 border border-[#A4BAA8]/20 rounded-xl text-[#E2D2BC] placeholder-[#A4BAA8]/50 focus:outline-none focus:border-[#E2D2BC] transition-colors"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-[#A4BAA8]" />
              </div>
              <input
                type="password"
                placeholder="Password"
                required
                className="w-full pl-10 pr-4 py-3 bg-black/20 border border-[#A4BAA8]/20 rounded-xl text-[#E2D2BC] placeholder-[#A4BAA8]/50 focus:outline-none focus:border-[#E2D2BC] transition-colors"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-300 text-xs text-center bg-red-900/20 p-2 rounded-lg border border-red-500/20">
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full mt-2" 
            isLoading={isLoading}
            variant="primary"
          >
            {isLogin ? 'Sign In' : 'Create Account'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-[#A4BAA8]">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
          </span>
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-[#E2D2BC] font-medium hover:underline hover:text-white transition-colors"
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </div>
        
        <div className="mt-6 text-center">
             <button onClick={onCancel} className="text-xs text-[#A4BAA8]/60 hover:text-[#A4BAA8]">Back to Home</button>
        </div>
      </div>
    </div>
  );
};
