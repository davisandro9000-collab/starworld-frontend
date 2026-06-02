import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../lib/utils'
import { useAuthStore } from '../stores/authStore'
import { updateProfile, sendPasswordResetEmail } from '../api/user.api'
import Input from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import TierBadge from '../components/ui/TierBadge'
import DepositForm from '../features/coins/DepositForm'
import DepositStatus from '../features/coins/DepositStatus'
import ReferralDash from '../features/referrals/ReferralDash'
import { placeholders } from '../lib/placeholders'

// ─── Types / schemas ──────────────────────────────────────────────────────────

const profileSchema = z.object({
  displayName: z
    .string()
    .min(2, 'At least 2 characters')
    .max(32, 'Max 32 characters'),
})
type ProfileForm = z.infer<typeof profileSchema>

// ─── Tab config ───────────────────────────────────────────────────────────────

const TABS = [
  { id: 'profile',   label: 'Profile',   icon: '👤' },
  { id: 'deposits',  label: 'Deposits',  icon: '🪙' },
  { id: 'referrals', label: 'Referrals', icon: '🔗' },
  { id: 'security',  label: 'Security',  icon: '🔐' },
] as const

type TabId = (typeof TABS)[number]['id']

// ─── Profile tab ──────────────────────────────────────────────────────────────

function ProfileTab() {
  const { user, setUser } = useAuthStore()
  const qc = useQueryClient()
  const [saved,    setSaved]    = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { displayName: user?.username ?? '' },
  })

  const mutation = useMutation({
    mutationFn: (v: ProfileForm) => updateProfile({ displayName: v.displayName }),
    onSuccess: (updated) => {
      if (user) setUser({ ...user, username: updated.username ?? user.username })
      qc.invalidateQueries({ queryKey: ['me'] })
      setSaved(true)
      setApiError(null)
      setTimeout(() => setSaved(false), 2500)
    },
    onError: (err: any) => {
      setApiError(err?.response?.data?.message ?? 'Update failed. Please try again.')
    },
  })

  const avatarUrl = user?.avatarUrl || placeholders.userAvatar(user?.username)

  return (
    <form
      onSubmit={handleSubmit(v => mutation.mutate(v))}
      className="space-y-5 max-w-sm"
    >
      <div className="flex items-center gap-4">
        <img
          src={avatarUrl}
          alt="Avatar"
          className="w-16 h-16 rounded-full object-cover border-2 border-gold/30"
          onError={(e) => { e.currentTarget.src = placeholders.userAvatar(user?.username); }}
        />
        <div>
          <p className="text-sm font-semibold text-white mb-1">{user?.username}</p>
          <TierBadge tier={user?.tier?.slug ?? 'bronze'} />
        </div>
      </div>

      <Input
        label="Display name"
        placeholder="How you appear on leaderboards"
        {...register('displayName')}
        error={errors.displayName?.message}
        hint="Visible on leaderboards and winner feeds"
      />

      <Input
        label="Email"
        type="email"
        value={user?.email ?? ''}
        disabled
        hint="Email address cannot be changed"
      />

      <div className="card p-4 flex items-center justify-between">
        <span className="text-sm text-white/50">Coin balance</span>
        <span className="font-heading font-bold text-gold">
          {(user?.coinBalance ?? 0).toLocaleString()} coins
        </span>
      </div>

      {apiError && (
        <p className="text-xs text-[#FF4560] bg-[#FF4560]/10 border border-[#FF4560]/20 rounded-lg px-3 py-2">
          {apiError}
        </p>
      )}

      <Button
        type="submit"
        variant="gold"
        loading={mutation.isPending}
        disabled={!isDirty}
        className="w-full"
      >
        {saved ? '✓ Saved' : 'Save changes'}
      </Button>
    </form>
  )
}

// ─── Deposits tab ─────────────────────────────────────────────────────────────

function DepositsTab() {
  const [showForm, setShowForm] = useState(true)

  return (
    <div className="space-y-5">
      <div className="flex gap-1 p-1 bg-[#111527] rounded-xl w-fit">
        {[
          { id: true,  label: 'New deposit' },
          { id: false, label: 'History'     },
        ].map(t => (
          <button
            key={String(t.id)}
            onClick={() => setShowForm(t.id)}
            className={cn(
              'px-4 py-2 rounded-lg text-xs font-semibold transition-all',
              showForm === t.id
                ? 'bg-gold text-deep shadow'
                : 'text-white/40 hover:text-white/70'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {showForm ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.15 }}
          >
            <DepositForm />
          </motion.div>
        ) : (
          <motion.div
            key="history"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.15 }}
          >
            <DepositStatus />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Security tab ─────────────────────────────────────────────────────────────

function SecurityTab() {
  const [emailSent, setEmailSent] = useState(false)

  const resetMutation = useMutation({
    mutationFn: sendPasswordResetEmail,
    onSuccess: () => setEmailSent(true),
  })

  return (
    <div className="space-y-4 max-w-sm">
      <div className="card p-5 space-y-3">
        <p className="text-sm font-semibold text-white">Change password</p>
        <p className="text-xs text-white/40 leading-relaxed">
          For security, password changes are sent via email reset link.
          Check your inbox after clicking below.
        </p>
        {emailSent ? (
          <p className="text-xs text-[#00E396] flex items-center gap-2">
            ✓ Reset link sent — check your inbox
          </p>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            loading={resetMutation.isPending}
            onClick={() => resetMutation.mutate()}
          >
            Send reset email
          </Button>
        )}
      </div>

      <div className="card p-5 space-y-3">
        <p className="text-sm font-semibold text-white">Two-factor authentication</p>
        <p className="text-xs text-white/40 leading-relaxed">
          Add an extra layer of security with an authenticator app.
        </p>
        <span className="inline-block text-[11px] text-amber-400 border border-amber-400/30 bg-amber-400/10 rounded-full px-2.5 py-0.5">
          Coming soon
        </span>
      </div>

      <div className="card p-5 space-y-3 border-[#FF4560]/20">
        <p className="text-sm font-semibold text-[#FF4560]">Danger zone</p>
        <p className="text-xs text-white/40 leading-relaxed">
          Account deletion is permanent. All coin balances, prizes and game
          history will be removed. This cannot be undone.
        </p>
        <Button
          variant="danger"
          size="sm"
          className="w-full"
          onClick={() => {
            if (window.confirm('Are you sure? This is permanent.')) {
              // TODO: call delete account API
            }
          }}
        >
          Request account deletion
        </Button>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('profile')

  const tabContent: Record<TabId, React.ReactElement> = {
    profile:   <ProfileTab />,
    deposits:  <DepositsTab />,
    referrals: <ReferralDash />,
    security:  <SecurityTab />,
  }

  return (
    <div className="page-content">
      <h1 className="font-heading font-bold text-2xl text-gold-gradient mb-6">
        Settings
      </h1>

      <div className="flex gap-1 bg-[#13172B] rounded-xl p-1 mb-6 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap min-w-[80px]',
              activeTab === tab.id
                ? 'bg-gold text-deep shadow'
                : 'text-white/40 hover:text-white/70'
            )}
          >
            <span className="text-base leading-none">{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
        >
          {tabContent[activeTab]}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}