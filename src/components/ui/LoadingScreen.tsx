import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'

export interface LoadingScreenProps {
  label?: string
  /** `false` para um bloco inline (dentro de um Card/tabela) em vez de ocupar a tela toda. */
  fullPage?: boolean
}

/**
 * Substitui as 7+ cópias de um bloco `PuffLoader` de página inteira
 * encontradas na auditoria (uma por tela, sem padrão em comum). Usa
 * `CircularProgress` do MUI — já integrado ao tema e com `role="progressbar"`
 * de acessibilidade nativo, sem precisar de `react-spinners` no código novo.
 */
export function LoadingScreen({ label = 'Carregando...', fullPage = true }: LoadingScreenProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        ...(fullPage ? { minHeight: '100vh' } : { py: 8 })
      }}
    >
      <CircularProgress size={36} aria-label={label} />
      {label && (
        <Typography variant='body2' color='text.secondary'>
          {label}
        </Typography>
      )}
    </Box>
  )
}
