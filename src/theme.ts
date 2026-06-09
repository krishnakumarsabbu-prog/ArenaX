export const colors = {
  primary: {
    50:  '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },
  teal: {
    50:  '#F0FDFA',
    100: '#CCFBF1',
    200: '#99F6E4',
    300: '#5EEAD4',
    400: '#2DD4BF',
    500: '#14B8A6',
    600: '#0D9488',
    700: '#0F766E',
    800: '#115E59',
    900: '#134E4A',
  },
  amber: {
    50:  '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },
  green: {
    50:  '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E',
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#14532D',
  },
  red: {
    50:  '#FFF1F2',
    100: '#FFE4E6',
    200: '#FECDD3',
    300: '#FDA4AF',
    400: '#FB7185',
    500: '#F43F5E',
    600: '#E11D48',
    700: '#BE123C',
    800: '#9F1239',
    900: '#881337',
  },
  neutral: {
    50:  '#F8FAFC',
    100: '#F1F5F9',
    150: '#EDF2F7',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },
}

export const status = {
  running: {
    bg:     'bg-green-50',
    text:   'text-green-700',
    border: 'border-green-200',
    dot:    'bg-green-500',
    label:  'Running',
  },
  paused: {
    bg:     'bg-amber-50',
    text:   'text-amber-700',
    border: 'border-amber-200',
    dot:    'bg-amber-500',
    label:  'Paused',
  },
  concluded: {
    bg:     'bg-gray-100',
    text:   'text-gray-500',
    border: 'border-gray-200',
    dot:    'bg-gray-400',
    label:  'Concluded',
  },
  draft: {
    bg:     'bg-blue-50',
    text:   'text-blue-600',
    border: 'border-blue-200',
    dot:    'bg-blue-400',
    label:  'Draft',
  },
  live: {
    bg:     'bg-green-50',
    text:   'text-green-700',
    border: 'border-green-200',
    dot:    'bg-green-500',
    label:  'Live',
  },
  completed: {
    bg:     'bg-blue-50',
    text:   'text-blue-700',
    border: 'border-blue-200',
    dot:    'bg-blue-500',
    label:  'Completed',
  },
} as const

export type StatusKey = keyof typeof status

export const shadows = {
  card:   '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
  cardMd: '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
  glow:   '0 0 0 3px rgba(59,130,246,0.15)',
}

export const gradients = {
  ab:       'linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)',
  champion: 'linear-gradient(135deg, #14B8A6 0%, #10B981 100%)',
  gold:     'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)',
  silver:   'linear-gradient(135deg, #94A3B8 0%, #64748B 100%)',
  bronze:   'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
  header:   'linear-gradient(180deg, #0F172A 0%, #1E293B 100%)',
}

export const typography = {
  fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  weights: { normal: 400, medium: 500, semibold: 600, bold: 700, extrabold: 800 },
  sizes: {
    xs:   '0.75rem',
    sm:   '0.875rem',
    base: '1rem',
    lg:   '1.125rem',
    xl:   '1.25rem',
    '2xl':'1.5rem',
    '3xl':'1.875rem',
  },
}

export const spacing = {
  unit: 8,
  xs:   '4px',
  sm:   '8px',
  md:   '16px',
  lg:   '24px',
  xl:   '32px',
  '2xl':'48px',
}
