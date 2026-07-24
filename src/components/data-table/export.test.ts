import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { DataTableColumn } from './DataTable'

// `vi.hoisted`: `vi.mock` é içado para o topo do módulo (antes até de
// imports normais), então essas variáveis precisam existir antes disso —
// um `const` comum aqui cairia em TDZ (mesmo achado de tooling de
// `payment.service.test.ts`, Fase 6 do backend). A fábrica do mock também
// precisa de uma `function` de verdade (não arrow) — `new (() => {})()`
// lança "is not a constructor" em JS puro, arrow function nunca serve de
// construtor, independente de estar dentro de um `vi.fn()`.
const { jsPdfInstances, jsPdfConstructor, autoTableMock } = vi.hoisted(() => ({
  jsPdfInstances: [] as Array<{
    text: (...a: unknown[]) => void
    setFontSize: (...a: unknown[]) => void
    setTextColor: (...a: unknown[]) => void
    save: (...a: unknown[]) => void
  }>,
  jsPdfConstructor: vi.fn(),
  autoTableMock: vi.fn()
}))

vi.mock('jspdf', () => ({
  jsPDF: vi.fn().mockImplementation(function (this: unknown, ...args: unknown[]) {
    jsPdfConstructor(...args)
    const instance = { text: vi.fn(), setFontSize: vi.fn(), setTextColor: vi.fn(), save: vi.fn() }
    jsPdfInstances.push(instance)
    return instance
  })
}))

vi.mock('jspdf-autotable', () => ({ default: (...args: unknown[]) => autoTableMock(...args) }))

const { exportRowsToCsv, exportRowsToPdf, fetchAllPages } = await import('./export')

interface Row {
  id: number
  name: string
}

const columns: DataTableColumn<Row>[] = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Nome' }
]

describe('fetchAllPages', () => {
  it('para quando chega em totalPages, juntando os dados de todas as páginas', async () => {
    const fetchPage = vi
      .fn()
      .mockResolvedValueOnce({
        data: [{ id: 1 }, { id: 2 }],
        pagination: { page: 1, limit: 2, total: 3, totalPages: 2 }
      })
      .mockResolvedValueOnce({ data: [{ id: 3 }], pagination: { page: 2, limit: 2, total: 3, totalPages: 2 } })

    const result = await fetchAllPages(fetchPage)

    expect(result).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }])
    expect(fetchPage).toHaveBeenCalledTimes(2)
    expect(fetchPage).toHaveBeenNthCalledWith(1, 1, 100)
    expect(fetchPage).toHaveBeenNthCalledWith(2, 2, 100)
  })

  it('para numa página vazia mesmo que totalPages diga que tem mais (defesa contra loop infinito)', async () => {
    const fetchPage = vi
      .fn()
      .mockResolvedValue({ data: [], pagination: { page: 1, limit: 200, total: 0, totalPages: 5 } })

    const result = await fetchAllPages(fetchPage)

    expect(result).toEqual([])
    expect(fetchPage).toHaveBeenCalledTimes(1)
  })

  it('respeita um limit customizado', async () => {
    const fetchPage = vi
      .fn()
      .mockResolvedValue({ data: [], pagination: { page: 1, limit: 50, total: 0, totalPages: 1 } })

    await fetchAllPages(fetchPage, 50)

    expect(fetchPage).toHaveBeenCalledWith(1, 50)
  })
})

describe('exportRowsToCsv', () => {
  let createObjectURL: ReturnType<typeof vi.fn>
  let revokeObjectURL: ReturnType<typeof vi.fn>
  let clickSpy: ReturnType<typeof vi.fn>
  let capturedBlob: Blob | null

  beforeEach(() => {
    capturedBlob = null
    createObjectURL = vi.fn((blob: Blob) => {
      capturedBlob = blob
      return 'blob:mock-url'
    })
    revokeObjectURL = vi.fn()
    vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL })
    clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
  })

  function getCapturedBlob(): Blob {
    if (!capturedBlob) throw new Error('Nenhum blob foi capturado por createObjectURL')
    return capturedBlob
  }

  it('gera um CSV com BOM nos bytes crus, cabeçalho e uma linha por row', async () => {
    const rows: Row[] = [
      { id: 1, name: 'Ana' },
      { id: 2, name: 'Bruno' }
    ]

    exportRowsToCsv(columns, rows, 'teste.csv')

    expect(createObjectURL).toHaveBeenCalledTimes(1)
    expect(clickSpy).toHaveBeenCalledTimes(1)

    // BOM (EF BB BF) nos bytes crus — `Blob.text()` já decodifica UTF-8 e
    // descarta o BOM automaticamente (comportamento padrão do
    // `TextDecoder`), então a verificação de verdade é nos bytes, não no
    // texto decodificado.
    const bytes = new Uint8Array(await getCapturedBlob().arrayBuffer())
    expect([...bytes.slice(0, 3)]).toEqual([0xef, 0xbb, 0xbf])

    const text = await getCapturedBlob().text()
    expect(text).toBe('ID,Nome\r\n1,Ana\r\n2,Bruno')
  })

  it('usa exportValue quando presente, em vez do valor bruto', async () => {
    const cols: DataTableColumn<Row>[] = [{ key: 'name', label: 'Nome', exportValue: row => `Sr. ${row.name}` }]

    exportRowsToCsv(cols, [{ id: 1, name: 'Ana' }], 'teste.csv')

    const text = await getCapturedBlob().text()
    expect(text).toBe('Nome\r\nSr. Ana')
  })

  it('escapa vírgula, aspas e quebra de linha (RFC 4180)', async () => {
    const cols: DataTableColumn<Row>[] = [{ key: 'name', label: 'Nome' }]

    exportRowsToCsv(cols, [{ id: 1, name: 'Silva, "Ana"' }], 'teste.csv')

    const text = await getCapturedBlob().text()
    expect(text).toBe('Nome\r\n"Silva, ""Ana"""')
  })

  it('não inclui coluna marcada excludeFromExport', async () => {
    const cols: DataTableColumn<Row>[] = [
      { key: 'name', label: 'Nome' },
      { key: 'id', label: 'Ações', excludeFromExport: true }
    ]

    exportRowsToCsv(cols, [{ id: 1, name: 'Ana' }], 'teste.csv')

    const text = await getCapturedBlob().text()
    expect(text).toBe('Nome\r\nAna')
  })
})

describe('exportRowsToPdf', () => {
  beforeEach(() => {
    jsPdfConstructor.mockClear()
    autoTableMock.mockClear()
    jsPdfInstances.length = 0
  })

  it('monta a tabela com jspdf-autotable e chama save com o nome do arquivo', () => {
    const rows: Row[] = [{ id: 1, name: 'Ana' }]

    exportRowsToPdf(columns, rows, 'teste.pdf', 'Usuários')

    expect(autoTableMock).toHaveBeenCalledWith(
      jsPdfInstances[0],
      expect.objectContaining({
        head: [['ID', 'Nome']],
        body: [['1', 'Ana']]
      })
    )
    expect(jsPdfInstances[0].save).toHaveBeenCalledWith('teste.pdf')
  })

  it('usa orientação paisagem quando há mais de 6 colunas exportáveis', () => {
    const manyColumns: DataTableColumn<Row>[] = Array.from({ length: 7 }, (_, index) => ({
      key: `col${index}`,
      label: `Coluna ${index}`
    }))

    exportRowsToPdf(manyColumns, [{ id: 1, name: 'Ana' }], 'teste.pdf', 'Título')

    expect(jsPdfConstructor).toHaveBeenCalledWith(expect.objectContaining({ orientation: 'landscape' }))
  })
})
