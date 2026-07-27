import MuiSkeleton, { type SkeletonProps as MuiSkeletonProps } from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'

export type { MuiSkeletonProps as SkeletonProps }
/** Reexportado direto — o `Skeleton` do MUI já cobre as 3 variantes (`text`/`circular`/`rectangular`) e a animação `wave`, sem necessidade de reimplementar. */
export const Skeleton = MuiSkeleton

/** Bloco retangular arredondado — mesmo `border-radius` do `Card` (tema `MuiCard`), para um placeholder do tamanho de um KPI card/gráfico antes dos dados chegarem. */
export function SkeletonCard({ height = 120 }: { height?: number }) {
  return <Skeleton variant='rounded' height={height} sx={{ borderRadius: 3, width: '100%' }} />
}

/** Algumas linhas de texto de largura decrescente — usado no lugar de um título/valor enquanto carrega. */
export function SkeletonLines({ lines = 2 }: { lines?: number }) {
  return (
    <Stack spacing={1}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton key={index} variant='text' width={index === 0 ? '60%' : '40%'} />
      ))}
    </Stack>
  )
}
