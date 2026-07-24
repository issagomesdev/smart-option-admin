/**
 * Design tokens do painel — usados pelo tema construído em `theme.ts` e
 * pelos componentes de `src/components/ui/**`.
 *
 * Paleta pensada no mesmo espírito de Stripe/Linear/Vercel: neutros em
 * escala de cinza-azulado (slate), um único acento (índigo) para ações
 * primárias, e cores semânticas com contraste suficiente para funcionar
 * tanto em texto quanto em fundo de badge.
 */

export const colorTokens = {
  // Neutros — usados para texto, bordas, fundos de superfície.
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617'
  },
  // Acento primário — ações principais, links, foco.
  indigo: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1',
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81'
  },
  // Semânticas — sucesso/aviso/erro/info, usadas em StatusBadge e feedback.
  emerald: { 50: '#ecfdf5', 100: '#d1fae5', 500: '#10b981', 600: '#059669', 700: '#047857' },
  amber: { 50: '#fffbeb', 100: '#fef3c7', 500: '#f59e0b', 600: '#d97706', 700: '#b45309' },
  red: { 50: '#fef2f2', 100: '#fee2e2', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c' },
  sky: { 50: '#f0f9ff', 100: '#e0f2fe', 500: '#0ea5e9', 600: '#0284c7', 700: '#0369a1' }
} as const

export const spacingTokens = {
  /** Base de 8px — mesma unidade que o MUI `theme.spacing()` já usa por padrão; os tokens só nomeiam os múltiplos mais comuns. */
  unit: 8,
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px'
} as const

export const radiusTokens = {
  sm: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px'
} as const

export const typographyTokens = {
  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontWeights: { regular: 400, medium: 500, semibold: 600, bold: 700 },
  fontSizes: {
    xs: '0.75rem',
    sm: '0.8125rem',
    base: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem'
  }
} as const

/** Sombras rasas e sutis — Stripe/Linear evitam a elevação "Material" pesada do MUI default. */
export const shadowTokens = {
  sm: '0 1px 2px 0 rgb(15 23 42 / 0.06)',
  md: '0 1px 3px 0 rgb(15 23 42 / 0.08), 0 1px 2px -1px rgb(15 23 42 / 0.08)',
  lg: '0 4px 6px -1px rgb(15 23 42 / 0.08), 0 2px 4px -2px rgb(15 23 42 / 0.08)',
  xl: '0 10px 15px -3px rgb(15 23 42 / 0.08), 0 4px 6px -4px rgb(15 23 42 / 0.08)'
} as const
