import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '@mui/material/styles'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { theme } from '@/theme/theme'
import type { DataTableColumn } from './DataTable'
import { ExportMenu } from './ExportMenu'

const exportRowsToCsv = vi.fn()
const exportRowsToPdf = vi.fn()
vi.mock('./export', async importOriginal => {
  const actual = await importOriginal<typeof import('./export')>()
  return {
    ...actual,
    exportRowsToCsv: (...args: unknown[]) => exportRowsToCsv(...args),
    exportRowsToPdf: (...args: unknown[]) => exportRowsToPdf(...args)
  }
})

const toastSuccess = vi.fn()
const toastError = vi.fn()
const toastInfo = vi.fn()
vi.mock('../ui/toast', () => ({
  toast: {
    success: (...a: unknown[]) => toastSuccess(...a),
    error: (...a: unknown[]) => toastError(...a),
    info: (...a: unknown[]) => toastInfo(...a)
  }
}))

interface Row {
  id: number
  name: string
}

const columns: DataTableColumn<Row>[] = [{ key: 'id', label: 'ID' }]

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>)
}

describe('ExportMenu', () => {
  beforeEach(() => {
    exportRowsToCsv.mockReset()
    exportRowsToPdf.mockReset()
    toastSuccess.mockReset()
    toastError.mockReset()
    toastInfo.mockReset()
  })

  it('mostra as opções CSV e PDF ao clicar em "Exportar"', async () => {
    const onExportAll = vi.fn().mockResolvedValue([{ id: 1, name: 'Ana' }])
    renderWithTheme(<ExportMenu columns={columns} onExportAll={onExportAll} filenameBase='teste' title='Teste' />)

    await userEvent.click(screen.getByRole('button', { name: 'Exportar' }))

    expect(screen.getByRole('menuitem', { name: 'Exportar CSV' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Exportar PDF' })).toBeInTheDocument()
  })

  it('ao escolher CSV: busca todos os registros e chama exportRowsToCsv', async () => {
    const rows = [{ id: 1, name: 'Ana' }]
    const onExportAll = vi.fn().mockResolvedValue(rows)
    renderWithTheme(<ExportMenu columns={columns} onExportAll={onExportAll} filenameBase='usuarios' title='Usuários' />)

    await userEvent.click(screen.getByRole('button', { name: 'Exportar' }))
    await userEvent.click(screen.getByRole('menuitem', { name: 'Exportar CSV' }))

    await waitFor(() => expect(exportRowsToCsv).toHaveBeenCalledTimes(1))
    expect(onExportAll).toHaveBeenCalledTimes(1)
    const [calledColumns, calledRows, filename] = exportRowsToCsv.mock.calls[0]
    expect(calledColumns).toBe(columns)
    expect(calledRows).toEqual(rows)
    expect(filename).toMatch(/^usuarios-\d{4}-\d{2}-\d{2}\.csv$/)
    expect(toastSuccess).toHaveBeenCalledWith(expect.stringContaining('1 registro'))
  })

  it('ao escolher PDF: busca todos os registros e chama exportRowsToPdf com o título', async () => {
    const rows = [{ id: 1, name: 'Ana' }]
    const onExportAll = vi.fn().mockResolvedValue(rows)
    renderWithTheme(<ExportMenu columns={columns} onExportAll={onExportAll} filenameBase='usuarios' title='Usuários' />)

    await userEvent.click(screen.getByRole('button', { name: 'Exportar' }))
    await userEvent.click(screen.getByRole('menuitem', { name: 'Exportar PDF' }))

    await waitFor(() => expect(exportRowsToPdf).toHaveBeenCalledTimes(1))
    const [, calledRows, filename, title] = exportRowsToPdf.mock.calls[0]
    expect(calledRows).toEqual(rows)
    expect(filename).toMatch(/^usuarios-\d{4}-\d{2}-\d{2}\.pdf$/)
    expect(title).toBe('Usuários')
  })

  it('sem nenhum registro: avisa e não gera arquivo', async () => {
    const onExportAll = vi.fn().mockResolvedValue([])
    renderWithTheme(<ExportMenu columns={columns} onExportAll={onExportAll} filenameBase='usuarios' title='Usuários' />)

    await userEvent.click(screen.getByRole('button', { name: 'Exportar' }))
    await userEvent.click(screen.getByRole('menuitem', { name: 'Exportar CSV' }))

    await waitFor(() => expect(toastInfo).toHaveBeenCalledTimes(1))
    expect(exportRowsToCsv).not.toHaveBeenCalled()
  })

  it('erro ao buscar os registros: mostra toast de erro, sem travar', async () => {
    const onExportAll = vi.fn().mockRejectedValue(new Error('falha de rede'))
    renderWithTheme(<ExportMenu columns={columns} onExportAll={onExportAll} filenameBase='usuarios' title='Usuários' />)

    await userEvent.click(screen.getByRole('button', { name: 'Exportar' }))
    await userEvent.click(screen.getByRole('menuitem', { name: 'Exportar CSV' }))

    await waitFor(() => expect(toastError).toHaveBeenCalledTimes(1))
    expect(exportRowsToCsv).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Exportar' })).not.toBeDisabled()
  })
})
