import MuiButton, { type ButtonProps as MuiButtonProps } from '@mui/material/Button'

export type ButtonIntent = 'primary' | 'secondary' | 'danger' | 'ghost'

export interface ButtonProps extends Omit<MuiButtonProps, 'color' | 'variant'> {
  intent?: ButtonIntent
}

const INTENT_MAP: Record<ButtonIntent, { variant: MuiButtonProps['variant']; color: MuiButtonProps['color'] }> = {
  primary: { variant: 'contained', color: 'primary' },
  secondary: { variant: 'outlined', color: 'secondary' },
  danger: { variant: 'contained', color: 'error' },
  ghost: { variant: 'text', color: 'secondary' }
}

/**
 * Vocabulário fechado de 4 intenções em vez do produto cartesiano
 * `variant`×`color` do MUI — a auditoria encontrou "botões" ad hoc
 * (`<Box onClick>` sem foco/teclado, cores escolhidas por tela) em vez de um
 * `<button>` de verdade; este wrapper garante semântica de botão real
 * (herdada do `MuiButton`) e um vocabulário visual consistente.
 * `loading`/`loadingPosition` já vêm nativos do `MuiButton` a partir do MUI v6.
 */
export function Button({ intent = 'primary', ...props }: ButtonProps) {
  const { variant, color } = INTENT_MAP[intent]
  return <MuiButton variant={variant} color={color} {...props} />
}
