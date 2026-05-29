import { useState } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Modal from '../../components/ui/Modal'
import { createListing, CreateListingPayload } from '../../api/ticket.api'
import { useTicketStore } from './ticketStore'

const schema = z.object({
  eventName:            z.string().min(3, 'Event name required'),
  eventDate:            z.string().optional(),
  seatInfo:             z.string().optional(),
  quantity:             z.number().min(1).max(10),
  listingType:          z.enum(['fixed', 'auction']),
  askingPriceCoins:     z.number().min(1).optional(),
  startingBidCoins:     z.number().min(1).optional(),
  auctionDurationHours: z.number().optional(),
  description:          z.string().max(500).optional(),
}).superRefine((d, ctx) => {
  if (d.listingType === 'fixed' && !d.askingPriceCoins) {
    ctx.addIssue({ code: 'custom', path: ['askingPriceCoins'], message: 'Set a price' })
  }
  if (d.listingType === 'auction' && !d.startingBidCoins) {
    ctx.addIssue({ code: 'custom', path: ['startingBidCoins'], message: 'Set a starting bid' })
  }
})

type FormData = z.infer<typeof schema>

const DURATIONS = [
  { label: '1 hour',   value: 1  },
  { label: '6 hours',  value: 6  },
  { label: '24 hours', value: 24 },
  { label: '48 hours', value: 48 },
]

interface Props {
  open: boolean
  onClose: () => void
  onCreated?: () => void
}

export default function CreateListingModal({ open, onClose, onCreated }: Props) {
  const [serverError, setServerError] = useState('')
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      listingType:          'fixed',
      quantity:             1,
      auctionDurationHours: 24,
    },
  })

  const listingType = watch('listingType')

  function handleClose() {
    reset()
    setServerError('')
    setSuccess(false)
    onClose()
  }

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setServerError('')
    try {
      const payload: CreateListingPayload = {
        eventName:   data.eventName,
        eventDate:   data.eventDate,
        seatInfo:    data.seatInfo,
        quantity:    data.quantity,
        listingType: data.listingType,
        description: data.description,
        ...(data.listingType === 'fixed'
          ? { askingPriceCoins: data.askingPriceCoins }
          : {
              startingBidCoins:     data.startingBidCoins,
              auctionDurationHours: data.auctionDurationHours,
            }),
      }
      await createListing(payload)
      setSuccess(true)
      onCreated?.()
    } catch (err: any) {
      setServerError(err?.response?.data?.message ?? 'Failed to create listing.')
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="List a Ticket">
      {success ? (
        <div className="text-center py-6 space-y-3">
          <div className="text-4xl">🎫</div>
          <p className="font-heading font-bold text-white text-lg">Listing created!</p>
          <p className="text-white/50 text-sm">Your ticket is now live on the marketplace.</p>
          <button className="btn-gold w-full mt-2" onClick={handleClose}>Done</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>

          {/* Event name */}
          <div>
            <label className="block text-white/70 text-sm font-medium mb-1.5">Event name *</label>
            <input
              {...register('eventName')}
              className="input-sw w-full"
              placeholder="Taylor Swift — Eras Tour"
            />
            {errors.eventName && (
              <p className="text-loss text-xs mt-1">{errors.eventName.message}</p>
            )}
          </div>

          {/* Date + Qty row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-white/70 text-sm font-medium mb-1.5">Event date</label>
              <input {...register('eventDate')} type="date" className="input-sw w-full" />
            </div>
            <div>
              <label className="block text-white/70 text-sm font-medium mb-1.5">Qty</label>
              <input
                type="number"
                min={1}
                max={10}
                className="input-sw w-full"
                defaultValue={1}
                onChange={e => setValue('quantity', Number(e.target.value))}
              />
            </div>
          </div>

          {/* Seat info */}
          <div>
            <label className="block text-white/70 text-sm font-medium mb-1.5">Seat info</label>
            <input
              {...register('seatInfo')}
              className="input-sw w-full"
              placeholder="Section A, Row 12, Seat 5"
            />
          </div>

          {/* Listing type toggle */}
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Listing type</label>
            <div className="grid grid-cols-2 gap-2">
              {(['fixed', 'auction'] as const).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setValue('listingType', type)}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                    listingType === type
                      ? 'border-gold bg-gold/10 text-gold'
                      : 'border-sw-border bg-sw-card-2 text-white/50 hover:border-sw-border-2'
                  }`}
                >
                  <span className="text-lg">{type === 'fixed' ? '💰' : '🔨'}</span>
                  <span className="font-heading font-semibold text-sm capitalize">{type}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Price fields */}
          {listingType === 'fixed' ? (
            <div>
              <label className="block text-white/70 text-sm font-medium mb-1.5">Price (coins) *</label>
              <input
                type="number"
                min={1}
                className="input-sw w-full"
                placeholder="150"
                onChange={e => setValue('askingPriceCoins', Number(e.target.value))}
              />
              {errors.askingPriceCoins && (
                <p className="text-loss text-xs mt-1">{errors.askingPriceCoins.message}</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-white/70 text-sm font-medium mb-1.5">Starting bid *</label>
                <input
                  type="number"
                  min={1}
                  className="input-sw w-full"
                  placeholder="50"
                  onChange={e => setValue('startingBidCoins', Number(e.target.value))}
                />
                {errors.startingBidCoins && (
                  <p className="text-loss text-xs mt-1">{errors.startingBidCoins.message}</p>
                )}
              </div>
              <div>
                <label className="block text-white/70 text-sm font-medium mb-1.5">Duration</label>
                <select
                  className="input-sw w-full"
                  defaultValue={24}
                  onChange={e => setValue('auctionDurationHours', Number(e.target.value))}
                >
                  {DURATIONS.map(d => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Platform fee note */}
          <div className="bg-sw-card-2 border border-sw-border rounded-xl p-3 text-xs text-white/50">
            ℹ️ A <strong className="text-white/70">5% platform fee</strong> is deducted from
            the sale price when your ticket sells.
          </div>

          {/* Description */}
          <div>
            <label className="block text-white/70 text-sm font-medium mb-1.5">
              Description (optional)
            </label>
            <textarea
              {...register('description')}
              className="input-sw w-full h-20 resize-none"
              placeholder="Any extra details about the tickets..."
            />
          </div>

          {serverError && (
            <p className="text-loss text-sm bg-loss/10 border border-loss/30 rounded-lg px-3 py-2">
              {serverError}
            </p>
          )}

          <div className="flex gap-2">
            <button type="button" className="btn-outline flex-1" onClick={handleClose}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-gold flex-1 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-sw-bg/40 border-t-sw-bg rounded-full animate-spin" />
                  Creating…
                </span>
              ) : 'List Ticket →'}
            </button>
          </div>

        </form>
      )}
    </Modal>
  )
}
