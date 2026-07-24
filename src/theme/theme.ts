import { createTheme, type Theme } from '@mui/material/styles'
import { colorTokens, radiusTokens, shadowTokens, typographyTokens } from './tokens'

/**
 * Tema MUI do Design System (Fase 3) — light mode only por enquanto (nenhum
 * requisito de dark mode no plano aprovado). Único tema do painel desde a
 * Fase 4 parte 4 (o tema antigo, `src/@core/theme`, foi removido junto com o
 * resto do Pages Router).
 */
export const theme: Theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      light: colorTokens.indigo[400],
      main: colorTokens.indigo[600],
      dark: colorTokens.indigo[700],
      contrastText: '#ffffff'
    },
    secondary: {
      light: colorTokens.slate[400],
      main: colorTokens.slate[600],
      dark: colorTokens.slate[800],
      contrastText: '#ffffff'
    },
    success: {
      light: colorTokens.emerald[100],
      main: colorTokens.emerald[600],
      dark: colorTokens.emerald[700],
      contrastText: '#ffffff'
    },
    warning: {
      light: colorTokens.amber[100],
      main: colorTokens.amber[600],
      dark: colorTokens.amber[700],
      contrastText: '#ffffff'
    },
    error: {
      light: colorTokens.red[100],
      main: colorTokens.red[600],
      dark: colorTokens.red[700],
      contrastText: '#ffffff'
    },
    info: {
      light: colorTokens.sky[100],
      main: colorTokens.sky[600],
      dark: colorTokens.sky[700],
      contrastText: '#ffffff'
    },
    background: { default: colorTokens.slate[50], paper: '#ffffff' },
    text: { primary: colorTokens.slate[900], secondary: colorTokens.slate[500] },
    divider: colorTokens.slate[200]
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: typographyTokens.fontFamily,
    h1: { fontSize: typographyTokens.fontSizes['3xl'], fontWeight: typographyTokens.fontWeights.semibold },
    h2: { fontSize: typographyTokens.fontSizes['2xl'], fontWeight: typographyTokens.fontWeights.semibold },
    h3: { fontSize: typographyTokens.fontSizes.xl, fontWeight: typographyTokens.fontWeights.semibold },
    h4: { fontSize: typographyTokens.fontSizes.lg, fontWeight: typographyTokens.fontWeights.semibold },
    body1: { fontSize: typographyTokens.fontSizes.base },
    body2: { fontSize: typographyTokens.fontSizes.sm },
    button: { fontWeight: typographyTokens.fontWeights.medium, textTransform: 'none' }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: radiusTokens.md, boxShadow: 'none' },
        contained: { '&:hover': { boxShadow: shadowTokens.sm } }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: radiusTokens.lg,
          boxShadow: shadowTokens.sm,
          border: `1px solid ${colorTokens.slate[200]}`
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: radiusTokens.sm, fontWeight: typographyTokens.fontWeights.medium }
      }
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: radiusTokens.lg }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: colorTokens.slate[50],
          fontWeight: typographyTokens.fontWeights.semibold,
          color: colorTokens.slate[600],
          fontSize: typographyTokens.fontSizes.xs,
          textTransform: 'uppercase',
          letterSpacing: '0.03em'
        }
      }
    }
  }
})
