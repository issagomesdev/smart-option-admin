'use client'

import 'react-date-range/dist/styles.css'
import 'react-date-range/dist/theme/default.css'
import { DateRange, type Range, type RangeKeyDict } from 'react-date-range'

export interface PeriodRangePickerProps {
  ranges: Range[]
  onChange: (item: RangeKeyDict) => void
}

/**
 * Componente próprio só para isolar o import de `react-date-range` (JS +
 * CSS) atrás de `next/dynamic` em `page.tsx` — a lib só é carregada quando o
 * modal de período abre, em vez de entrar no chunk inicial do Dashboard
 * (confirmado no bundle antes desta mudança: ~240KB minificados, usados só
 * depois de um clique num campo que a maioria das visitas nunca toca).
 */
export function PeriodRangePicker({ ranges, onChange }: PeriodRangePickerProps) {
  return <DateRange editableDateInputs onChange={onChange} moveRangeOnFirstSelection={false} ranges={ranges} />
}
