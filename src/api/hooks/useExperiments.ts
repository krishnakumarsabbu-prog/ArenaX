import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../client'
import type { Experiment, ExperimentCreate, ExperimentAnalytics, Variant, VariantChange } from '@/types'

export const useExperiments = () =>
  useQuery<Experiment[]>({
    queryKey: ['experiments'],
    queryFn: () => api.get('/experiments').then((r) => r.data),
    refetchInterval: 15_000
  })

export const useExperiment = (id: string | null) =>
  useQuery<Experiment>({
    queryKey: ['experiment', id],
    queryFn: () => api.get(`/experiments/${id}`).then((r) => r.data),
    enabled: !!id
  })

export const useExperimentAnalytics = (expId: string | null) =>
  useQuery<ExperimentAnalytics>({
    queryKey: ['analytics', expId],
    queryFn: () => api.get(`/analytics/${expId}`).then((r) => r.data),
    enabled: !!expId,
    refetchInterval: 10_000
  })

export const useVariants = (experimentId: string | null) =>
  useQuery<Variant[]>({
    queryKey: ['variants', experimentId],
    queryFn: () => api.get(`/variants?experiment_id=${experimentId}`).then((r) => r.data),
    enabled: !!experimentId
  })

export const useCreateExperiment = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ExperimentCreate) => api.post('/experiments', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['experiments'] })
  })
}

export const useUpdateExperiment = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; status?: string; name?: string; hypothesis?: string }) =>
      api.patch(`/experiments/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['experiments'] })
  })
}

export const useDeleteExperiment = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/experiments/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['experiments'] })
  })
}

export const useCreateVariant = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      experiment_id: string
      key: string
      name: string
      description?: string
      changes: VariantChange[]
    }) => api.post('/variants', data).then((r) => r.data),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['variants', vars.experiment_id] })
      qc.invalidateQueries({ queryKey: ['experiments'] })
    }
  })
}

export const useAISynthesize = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (experiment_id: string) =>
      api.post('/ai/synthesize', { experiment_id }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['experiments'] })
  })
}
