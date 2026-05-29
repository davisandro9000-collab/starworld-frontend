import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { submitDeposit, SubmitDepositPayload } from '../api/deposit.api'

export function useDeposit() {
  const qc = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: (payload: SubmitDepositPayload) => submitDeposit(payload),
    onSuccess: () => {
      setError(null)
      qc.invalidateQueries({ queryKey: ['deposit-history'] })
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message ?? 'Deposit submission failed. Please try again.')
    },
  })

  return {
    submit: mutation.mutate,
    isSubmitting: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error,
    reset: () => { mutation.reset(); setError(null) },
  }
}
