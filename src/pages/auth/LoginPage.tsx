import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '../../stores/authStore'
import { login } from '../../api/auth.api'

const schema = z.object({
  email:    z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setUser, setAccessToken } = useAuthStore()
  const [serverError, setServerError] = useState('')

  const from = (location.state as any)?.from?.pathname ?? '/dashboard'

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    setServerError('')
    try {
      const res = await login(data.email, data.password)
      setUser(res.user)
      setAccessToken(res.accessToken)
      navigate(from, { replace: true })
    } catch (err: any) {
      setServerError(err?.response?.data?.message ?? 'Invalid email or password.')
    }
  }

  return (
    <div className="min-h-screen bg-sw-bg bg-dark-grid flex items-center justify-center px-4">

      {/* Glow */}
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
          <h1 className="font-heading font-bold text-2xl text-white mt-5 mb-1">Welcome back</h1>
          <p className="text-white/40 text-sm">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="card p-6 space-y-4">

          {serverError && (
            <div className="bg-loss/10 border border-loss/30 text-loss text-sm rounded-lg px-4 py-3">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>

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
              {errors.email && (
                <p className="text-loss text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-white/70 text-sm font-medium">Password</label>
                <button type="button" className="text-gold text-xs hover:underline">
                  Forgot password?
                </button>
              </div>
              <input
                {...register('password')}
                type="password"
                placeholder="••••••••"
                className="input-sw w-full"
                autoComplete="current-password"
              />
              {errors.password && (
                <p className="text-loss text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-gold w-full py-3 mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-sw-bg/40 border-t-sw-bg rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : 'Sign In →'}
            </button>

          </form>
        </div>

        {/* Footer link */}
        <p className="text-center text-white/40 text-sm mt-5">
          Don't have an account?{' '}
          <Link to="/auth/register" className="text-gold hover:underline font-medium">
            Join free
          </Link>
        </p>

      </div>
    </div>
  )
}
