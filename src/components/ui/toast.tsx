import { ToastContainer as ReactToastifyContainer, toast as toastify, type ToastOptions } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const DEFAULT_OPTIONS: ToastOptions = {
  position: 'top-right',
  autoClose: 4000,
  theme: 'colored'
}

/**
 * Wrapper fino sobre `react-toastify` com as opções sempre iguais — a
 * auditoria encontrou `{position: toast.POSITION..., theme:'colored'}`
 * repetido (e ligeiramente diferente) em toda tela que dispara um toast.
 * Chamar `toast.success('msg')` aqui já sai com a aparência do Design System.
 */
export const toast = {
  success: (message: string, options?: ToastOptions) => toastify.success(message, { ...DEFAULT_OPTIONS, ...options }),
  error: (message: string, options?: ToastOptions) => toastify.error(message, { ...DEFAULT_OPTIONS, ...options }),
  info: (message: string, options?: ToastOptions) => toastify.info(message, { ...DEFAULT_OPTIONS, ...options }),
  warning: (message: string, options?: ToastOptions) => toastify.warning(message, { ...DEFAULT_OPTIONS, ...options })
}

/** Um único `<ToastContainer />` por app (montado no layout raiz na Fase 4) — hoje cada tela monta o seu próprio. */
export function ToastContainer() {
  return <ReactToastifyContainer position='top-right' theme='colored' newestOnTop limit={3} />
}
