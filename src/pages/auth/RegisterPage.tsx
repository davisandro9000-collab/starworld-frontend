import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '../../stores/authStore'
import { register as registerUser } from '../../api/auth.api'

const schema = z.object({
  username:        z.string().min(3, 'At least 3 characters').max(30, 'Max 30 characters')
                    .regex(/^[a-zA-Z0-9_]+$/, 'Letters, numbers and _ only'),
  email:           z.string().email('Enter a valid email'),
  password:        z.string().min(8, 'At least 8 characters'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})
type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const refCode = searchParams.get('ref') ?? ''
  const { setUser, setAccessToken } = useAuthStore()
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    setServerError('')
    try {
      const res = await registerUser({
        username: data.username,
        email:    data.email,
        password: data.password,
        referralCode: refCode || undefined,
      })
      setUser(res.user)
      setAccessToken(res.accessToken)
      navigate('/dashboard', { replace: true })
    } catch (err: any) {
      setServerError(err?.response?.data?.message ?? 'Registration failed. Try a different email or username.')
    }
  }

  return (
    <div className="min-h-screen bg-sw-bg bg-dark-grid flex items-center justify-center px-4 py-10">

      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-gold/5 blur-[100px] rounded-full" />

      <div className="w-full max-w-sm relative">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold to-gold-dim flex items-center justify-center shadow-gold">
              <span className="font-heading font-black text-sw-bg text-sm">SW</span>
            </span>
            <span className="font-heading font-black text-xl text-white tracking-tight">StarWorld</span>
          </Link>
          <h1 className="font-heading font-bold text-2xl text-white mt-5 mb-1">Create your account</h1>
          <p className="text-white/40 text-sm">Free forever on Bronze tier</p>
        </div>

        {/* Referral banner */}
        {refCode && (
          <div className="mb-4 bg-gold/10 border border-gold/30 rounded-xl px-4 py-3 flex items-center gap-2 text-sm">
            <span className="text-gold text-lg">🎁</span>
            <span className="text-white/80">
              You were invited! Referral code <span className="text-gold font-semibold">{refCode}</span> applied.
            </span>
          </div>
        )}

        <div className="card p-6 space-y-4">

          {serverError && (
            <div className="bg-loss/10 border border-loss/30 text-loss text-sm rounded-lg px-4 py-3">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>

            {/* Username */}
            <div>
              <label className="block text-white/70 text-sm font-medium mb-1.5">Username</label>
              <input
                {...register('username')}
                type="text"
                placeholder="coolstar_fan"
                className="input-sw w-full"
                autoComplete="username"
              />
              {errors.username && <p className="text-loss text-xs mt-1">{errors.username.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-white/70 text-sm font-medium mb-1.5">Email</label>
              <input
                {...register('email')}
                type="email"
                placeholder="you@example.com"
                className="input-sw w-full"
                autoComplete="email"
              />
              {errors.email && <p className="text-loss text-xs mt-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-white/70 text-sm font-medium mb-1.5">Password</label>
              <input
                {...register('password')}
                type="password"
                placeholder="••••••••"
                className="input-sw w-full"
                autoComplete="new-password"
              />
              {errors.password && <p className="text-loss text-xs mt-1">{errors.password.message}</p>}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-white/70 text-sm font-medium mb-1.5">Confirm Password</label>
              <input
                {...register('confirmPassword')}
                type="password"
                placeholder="••••••••"
                className="input-sw w-full"
                autoComplete="new-password"
              />
              {errors.confirmPassword && <p className="text-loss text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            {/* Tier info */}
            <div className="bg-sw-card-2 rounded-xl p-3 flex items-center gap-3 border border-sw-border">
              <div className="w-8 h-8 rounded-lg bg-bronze/20 border border-bronze/40 flex items-center justify-center text-sm">
                🥉
              </div>
              <div>
                <p className="text-white text-xs font-semibold">Starting on Bronze tier</p>
                <p className="text-white/40 text-xs">30% win rate · Upgrade anytime</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-gold w-full py-3 mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-sw-bg/40 border-t-sw-bg rounded-full animate-spin" />
                  Creating account…
                </span>
              ) : 'Create Account — It\'s Free →'}
            </button>

            <p className="text-white/30 text-xs text-center">
              By signing up you agree to our Terms of Service and Privacy Policy.
            </p>
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
  )
}
