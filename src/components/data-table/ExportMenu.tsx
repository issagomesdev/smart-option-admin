'use client'

import { useState } from 'react'
import CircularProgress from '@mui/material/CircularProgress'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import FileDelimitedOutline from 'mdi-material-ui/FileDelimitedOutline'
import FilePdfBox from 'mdi-material-ui/FilePdfBox'
import DownloadOutline from 'mdi-material-ui/DownloadOutline'
import { Button } from '../ui/Button'
import { toast } from '../ui/toast'
import type { DataTableColumn } from './DataTable'
import { exportRowsToCsv, exportRowsToPdf } from './export'

export interface ExportMenuProps<T> {
  columns: DataTableColumn<T>[]
  onExportAll: () => Promise<T[]>
  filenameBase: string
  title: string
}

/**
 * Botão "Exportar" (CSV/PDF) das telas com `DataTable` — busca TODOS os
 * registros que batem o filtro atual (`onExportAll`, implementado por cada
 * tela com `fetchAllPages`), não só a página carregada, antes de gerar o
 * arquivo. O fetch de todas as páginas é o passo mais lento — o botão fica
 * desabilitado com spinner enquanto isso roda, pra não deixar parecer
 * travado nem permitir clique duplo.
 */
export function ExportMenu<T>({ columns, onExportAll, filenameBase, title }: ExportMenuProps<T>) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleExport(format: 'csv' | 'pdf') {
    setAnchorEl(null)
    setLoading(true)
    try {
      const rows = await onExportAll()
      if (rows.length === 0) {
        toast.info('Nenhum registro para exportar com os filtros atuais.')
        return
      }

      const stamp = new Date().toISOString().slice(0, 10)
      if (format === 'csv') {
        exportRowsToCsv(columns, rows, `${filenameBase}-${stamp}.csv`)
      } else {
        exportRowsToPdf(columns, rows, `${filenameBase}-${stamp}.pdf`, title)
      }
      toast.success(`${rows.length} registro(s) exportado(s) em ${format.toUpperCase()}.`)
    } catch {
      toast.error('Não foi possível exportar os dados.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        intent='secondary'
        size='small'
        startIcon={
          loading ? <CircularProgress size={16} aria-label='Exportando' /> : <DownloadOutline fontSize='small' />
        }
        disabled={loading}
        onClick={event => setAnchorEl(event.currentTarget)}
        aria-haspopup='true'
        aria-controls={anchorEl ? 'export-menu' : undefined}
      >
        Exportar
      </Button>
      <Menu id='export-menu' anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={() => handleExport('csv')}>
          <ListItemIcon>
            <FileDelimitedOutline fontSize='small' />
          </ListItemIcon>
          <ListItemText>Exportar CSV</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleExport('pdf')}>
          <ListItemIcon>
            <FilePdfBox fontSize='small' />
          </ListItemIcon>
          <ListItemText>Exportar PDF</ListItemText>
        </MenuItem>
      </Menu>
    </>
  )
}
