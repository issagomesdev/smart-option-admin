import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TrendingUp from 'mdi-material-ui/TrendingUp'
import TrendingDown from 'mdi-material-ui/TrendingDown'
import TrendingNeutral from 'mdi-material-ui/TrendingNeutral'
import { colorTokens } from '@/theme/tokens'

export type TrendFormat = 'percentage' | 'absolute'
/** Qual direção é a notícia boa para esta métrica — nem toda alta é positiva (ex.: saques pendentes). */
export type TrendPolarity = 'positive-is-good' | 'negative-is-good'

export interface TrendBadgeProps {
  value: number
  format?: TrendFormat
  polarity?: TrendPolarity
}

/**
 * Formata a variação de um KPI contra o período anterior — pontos percentuais (`+8.4%`) ou delta
 * absoluto (`-3`, usado por "Saques pendentes", que não tem um total do período anterior que faça
 * sentido dividir). Centraliza a lógica de cor (`value = 0`, direção declarada boa/ruim por métrica)
 * pra não duplicar em cada card de KPI.
 */
export function TrendBadge({ value, format = 'percentage', polarity = 'positive-is-good' }: TrendBadgeProps) {
  const isPositive = value > 0
  const isNeutral = value === 0
  const isGood = isNeutral ? null : isPositive === (polarity === 'positive-is-good')

  const color = isNeutral ? colorTokens.slate[500] : isGood ? colorTokens.emerald[700] : colorTokens.red[700]
  const Icon = isNeutral ? TrendingNeutral : isPositive ? TrendingUp : TrendingDown
  const sign = isPositive ? '+' : ''
  const text = format === 'percentage' ? `${sign}${value}%` : `${sign}${value}`

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, color }}>
      <Icon sx={{ fontSize: 18 }} aria-hidden />
      <Typography variant='body2' component='span' sx={{ fontWeight: 600, color: 'inherit' }}>
        {text}
      </Typography>
    </Box>
  )
}
