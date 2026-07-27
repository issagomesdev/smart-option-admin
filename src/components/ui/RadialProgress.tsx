import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import { colorTokens } from '@/theme/tokens'

export interface RadialProgressProps {
  /** 0-100, ou `null` quando não há base pra calcular uma taxa ainda (ex.: nada criado hoje) — mostra "—", nunca "0%" enganoso. */
  percent: number | null
  size?: number
  label?: string
}

/**
 * Anel de progresso determinado — MUI `CircularProgress` não anima transições de `value` por padrão,
 * só o `sx` abaixo (`stroke-dashoffset`) faz o preenchimento avançar suavemente quando o número muda,
 * em vez de saltar. A trilha (track) fica num cinza claro fixo; o anel preenchido usa o acento
 * primário — não é um medidor de severidade (não há "vermelho é ruim" aqui), só uma proporção.
 */
export function RadialProgress({ percent, size = 128, label }: RadialProgressProps) {
  const displayValue = percent ?? 0

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress
        variant='determinate'
        value={100}
        size={size}
        thickness={4}
        sx={{ color: colorTokens.slate[200] }}
      />
      <CircularProgress
        variant='determinate'
        value={displayValue}
        size={size}
        thickness={4}
        sx={{
          color: colorTokens.indigo[600],
          position: 'absolute',
          left: 0,
          '& .MuiCircularProgress-circle': {
            strokeLinecap: 'round',
            transition: 'stroke-dashoffset 0.6s ease'
          }
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Typography variant='h4' component='span' sx={{ fontWeight: 700, lineHeight: 1 }}>
          {percent === null ? '—' : `${percent}%`}
        </Typography>
        {label && (
          <Typography variant='caption' color='text.secondary' sx={{ mt: 0.5 }}>
            {label}
          </Typography>
        )}
      </Box>
    </Box>
  )
}
