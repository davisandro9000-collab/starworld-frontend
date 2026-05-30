import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../../stores/authStore';
import { register } from '../../api/auth.api';

const schema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  referralCode: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setUser, setAccessToken } = useAuthStore();
  const [serverError, setServerError] = useState('');

  const {
    register: registerField,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setServerError('');
    try {
      const res = await register({
        username: data.username,
        email: data.email,
        password: data.password,
        referralCode: data.referralCode,
      });
      setUser(res.user);
      setAccessToken(res.accessToken);
      navigate('/dashboard');
    } catch (err: any) {
      setServerError(err?.response?.data?.message ?? 'Registration failed. Try a different email or username.');
    }
  }

  return (
    <div className="min-h-screen bg-sw-bg bg-dark-grid flex items-center justify-center px-4">
      <div className="w-full max-w-sm relative">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold to-gold-dim flex items-center justify-center shadow-gold">
              <span className="font-heading font-black text-sw-bg text-sm">SW</span>
            </span>
            <span className="font-heading font-black text-xl text-white tracking-tight">StarWorld</span>
          </Link>
          <h1 className="font-heading font-bold text-2xl text-white mt-5 mb-1">Create account</h1>
          <p className="text-white/40 text-sm">Join the StarWorld community</p>
        </div>

        <div className="card p-6 space-y-4">
          {serverError && (
            <div className="bg-loss/10 border border-loss/30 text-loss text-sm rounded-lg px-4 py-3">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div>
              <label className="block text-white/70 text-sm font-medium mb-1.5">Username</label>
              <input
                {...registerField('username')}
                type="text"
                placeholder="coolfan123"
                className="input-sw w-full"
              />
              {errors.username && <p className="text-loss text-xs mt-1">{errors.username.message}</p>}
            </div>

            <div>
              <label className="block text-white/70 text-sm font-medium mb-1.5">Email</label>
              <input
                {...registerField('email')}
                type="email"
                placeholder="you@example.com"
                className="input-sw w-full"
              />
              {errors.email && <p className="text-loss text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-white/70 text-sm font-medium mb-1.5">Password</label>
              <input
                {...registerField('password')}
                type="password"
                placeholder="••••••••"
                className="input-sw w-full"
              />
              {errors.password && <p className="text-loss text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-white/70 text-sm font-medium mb-1.5">Referral Code (optional)</label>
              <input
                {...registerField('referralCode')}
                type="text"
                placeholder="FRIENDCODE"
                className="input-sw w-full"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-gold w-full py-3 mt-1 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating account...' : 'Sign Up →'}
            </button>
          </form>
        </div>

        <p className="text-center text-white/40 text-sm mt-5">
          Already have an account?{' '}
          <Link to="/auth/login" className="text-gold hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}