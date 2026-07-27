import { useMemo, useRef, useState } from 'react'
import Box from '@mui/material/Box'
import { colorTokens } from '@/theme/tokens'

export interface ChartPoint {
  bucket: string
  total: number
}

export interface RentabilidadeChartProps {
  data: ChartPoint[]
  granularity: 'day' | 'month'
}

const WIDTH = 640
const HEIGHT = 220
const PADDING = { top: 16, right: 16, bottom: 28, left: 56 }
const PLOT_WIDTH = WIDTH - PADDING.left - PADDING.right
const PLOT_HEIGHT = HEIGHT - PADDING.top - PADDING.bottom

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const compactCurrencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  notation: 'compact',
  maximumFractionDigits: 1
})

function parseBucket(bucket: string, granularity: 'day' | 'month'): Date {
  if (granularity === 'month') {
    const [year, month] = bucket.split('-').map(Number)
    return new Date(year, month - 1, 1)
  }
  const [year, month, day] = bucket.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function formatBucketLabel(bucket: string, granularity: 'day' | 'month'): string {
  const date = parseBucket(bucket, granularity)
  return granularity === 'month'
    ? date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
    : date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

/** Arredonda pra um "número limpo" acima do maior valor — nunca um teto arbitrário tipo 1347. */
function niceMax(value: number): number {
  if (value <= 0) return 10
  const magnitude = 10 ** Math.floor(Math.log10(value))
  const normalized = value / magnitude
  const niceNormalized = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10
  return niceNormalized * magnitude
}

/**
 * Gráfico de linha único (sem série secundária — o título já diz o que é, sem legenda) para
 * "Rentabilidade da rede". SVG desenhado à mão (sem lib de gráfico) para ter controle exato sobre as
 * specs de marca (linha 2px, marcador de ponta com anel na cor da superfície, crosshair+tooltip) sem
 * o custo de bundle de uma lib pra um único tipo de gráfico usado num único lugar. Vem com uma
 * `<table>` visualmente oculta com os mesmos dados — a alternativa acessível ao hover.
 */
export function RentabilidadeChart({ data, granularity }: RentabilidadeChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const maxValue = useMemo(() => niceMax(Math.max(...data.map(point => point.total), 0)), [data])

  const points = useMemo(
    () =>
      data.map((point, index) => {
        const x =
          data.length > 1 ? PADDING.left + (index / (data.length - 1)) * PLOT_WIDTH : PADDING.left + PLOT_WIDTH / 2
        const y = PADDING.top + PLOT_HEIGHT - (point.total / maxValue) * PLOT_HEIGHT
        return { ...point, x, y }
      }),
    [data, maxValue]
  )

  const firstPoint = points.at(0)
  const lastPoint = points.at(-1)
  const linePath = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')
  const areaPath =
    firstPoint && lastPoint
      ? `${linePath} L ${lastPoint.x} ${PADDING.top + PLOT_HEIGHT} L ${firstPoint.x} ${PADDING.top + PLOT_HEIGHT} Z`
      : ''

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(fraction => ({
    value: maxValue * fraction,
    y: PADDING.top + PLOT_HEIGHT - fraction * PLOT_HEIGHT
  }))

  // Só rotula uma amostra esparsa do eixo X (primeiro, último, e alguns no meio) — nunca todo ponto.
  const labelEvery = Math.max(1, Math.ceil(points.length / 6))
  const xLabels = points.filter((_, index) => index === 0 || index === points.length - 1 || index % labelEvery === 0)

  function handlePointerMove(event: React.PointerEvent<SVGSVGElement>) {
    if (points.length === 0 || !svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    const relativeX = ((event.clientX - rect.left) / rect.width) * WIDTH
    let closestIndex = 0
    let closestDistance = Infinity
    points.forEach((point, index) => {
      const distance = Math.abs(point.x - relativeX)
      if (distance < closestDistance) {
        closestDistance = distance
        closestIndex = index
      }
    })
    setActiveIndex(closestIndex)
  }

  function handleKeyDown(event: React.KeyboardEvent<SVGSVGElement>) {
    if (points.length === 0) return
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      setActiveIndex(current => Math.min(points.length - 1, (current ?? -1) + 1))
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      setActiveIndex(current => Math.max(0, (current ?? points.length) - 1))
    } else if (event.key === 'Escape') {
      setActiveIndex(null)
    }
  }

  const active = activeIndex !== null ? points[activeIndex] : null

  return (
    <Box sx={{ width: '100%' }}>
      <Box
        component='svg'
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role='img'
        aria-label={`Rentabilidade da rede por ${granularity === 'day' ? 'dia' : 'mês'}, de ${currencyFormatter.format(
          data[0]?.total ?? 0
        )} a ${currencyFormatter.format(lastPoint?.total ?? 0)}`}
        tabIndex={0}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setActiveIndex(null)}
        onKeyDown={handleKeyDown}
        sx={{ width: '100%', height: 'auto', display: 'block', outline: 'none', cursor: 'crosshair' }}
      >
        {yTicks.map(tick => (
          <g key={tick.value}>
            <line
              x1={PADDING.left}
              x2={WIDTH - PADDING.right}
              y1={tick.y}
              y2={tick.y}
              stroke={colorTokens.slate[200]}
              strokeWidth={1}
            />
            <text
              x={PADDING.left - 8}
              y={tick.y}
              textAnchor='end'
              dominantBaseline='middle'
              fontSize={10}
              fill={colorTokens.slate[500]}
            >
              {compactCurrencyFormatter.format(tick.value)}
            </text>
          </g>
        ))}

        {xLabels.map(point => (
          <text
            key={point.bucket}
            x={point.x}
            y={HEIGHT - 8}
            textAnchor='middle'
            fontSize={10}
            fill={colorTokens.slate[500]}
          >
            {formatBucketLabel(point.bucket, granularity)}
          </text>
        ))}

        {areaPath && <path d={areaPath} fill={colorTokens.indigo[600]} fillOpacity={0.08} stroke='none' />}
        {linePath && (
          <path
            d={linePath}
            fill='none'
            stroke={colorTokens.indigo[600]}
            strokeWidth={2}
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        )}

        {lastPoint && (
          <circle
            cx={lastPoint.x}
            cy={lastPoint.y}
            r={5}
            fill={colorTokens.indigo[600]}
            stroke='#ffffff'
            strokeWidth={2}
          />
        )}
        {lastPoint && (
          <text
            x={lastPoint.x}
            y={lastPoint.y - 12}
            textAnchor='end'
            fontSize={11}
            fontWeight={600}
            fill={colorTokens.slate[700]}
          >
            {compactCurrencyFormatter.format(lastPoint.total)}
          </text>
        )}

        {active && (
          <>
            <line
              x1={active.x}
              x2={active.x}
              y1={PADDING.top}
              y2={PADDING.top + PLOT_HEIGHT}
              stroke={colorTokens.slate[400]}
              strokeWidth={1}
              strokeDasharray='4 4'
            />
            <circle cx={active.x} cy={active.y} r={5} fill={colorTokens.indigo[600]} stroke='#ffffff' strokeWidth={2} />
          </>
        )}
      </Box>

      {active && (
        <Box
          sx={{
            mt: 1,
            display: 'inline-flex',
            alignItems: 'baseline',
            gap: 1,
            px: 1.5,
            py: 0.5,
            borderRadius: 2,
            bgcolor: 'grey.50',
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Box component='span' sx={{ fontWeight: 700, fontSize: 14 }}>
            {currencyFormatter.format(active.total)}
          </Box>
          <Box component='span' sx={{ fontSize: 12, color: 'text.secondary' }}>
            {formatBucketLabel(active.bucket, granularity)}
          </Box>
        </Box>
      )}

      <Box
        component='table'
        sx={{
          position: 'absolute',
          width: 1,
          height: 1,
          overflow: 'hidden',
          clip: 'rect(0 0 0 0)',
          whiteSpace: 'nowrap'
        }}
      >
        <caption>Rentabilidade da rede por {granularity === 'day' ? 'dia' : 'mês'}</caption>
        <thead>
          <tr>
            <th scope='col'>Data</th>
            <th scope='col'>Valor</th>
          </tr>
        </thead>
        <tbody>
          {data.map(point => (
            <tr key={point.bucket}>
              <td>{formatBucketLabel(point.bucket, granularity)}</td>
              <td>{currencyFormatter.format(point.total)}</td>
            </tr>
          ))}
        </tbody>
      </Box>
    </Box>
  )
}
