import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import AccountMultipleCheck from 'mdi-material-ui/AccountMultipleCheck'
import Wallet from 'mdi-material-ui/Wallet'
import CashPlus from 'mdi-material-ui/CashPlus'
import ClockAlertOutline from 'mdi-material-ui/ClockAlertOutline'
import { Card } from '@/components/ui/Card'
import { TrendBadge, type TrendPolarity } from '@/components/ui/TrendBadge'
import type { DashboardKpis, KpiValue } from '@/domain/dtos/dashboard.dto'

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const numberFormatter = new Intl.NumberFormat('pt-BR')

interface KpiCardProps {
  label: string
  value: string
  icon: React.ReactNode
  kpi: KpiValue
  polarity?: TrendPolarity
  caption?: string
}

function KpiCard({ label, value, icon, kpi, polarity, caption }: KpiCardProps) {
  return (
    <Card>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant='body2' color='text.secondary'>
            {label}
          </Typography>
          {/* `component='p'`: valor de destaque, não um heading real — evita pular níveis do
              heading outline (o `<h1>` "Dashboard" já existe em outro lugar da página). */}
          <Typography variant='h3' component='p' sx={{ mt: 0.5 }}>
            {value}
          </Typography>
          <Box sx={{ mt: 1 }}>
            <TrendBadge value={kpi.change} format={kpi.changeType} polarity={polarity} />
          </Box>
          {caption && (
            <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 0.5 }}>
              {caption}
            </Typography>
          )}
        </Box>
        <Box sx={{ color: 'primary.main', opacity: 0.8 }} aria-hidden>
          {icon}
        </Box>
      </Box>
    </Card>
  )
}

export interface KpiCardsRowProps {
  kpis: DashboardKpis
}

/** Os 4 KPIs do dashboard agregado — cada um com tendência vs. o período anterior de mesmo tamanho. */
export function KpiCardsRow({ kpis }: KpiCardsRowProps) {
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <KpiCard
          label='Usuários ativos'
          value={numberFormatter.format(kpis.activeUsers.value)}
          icon={<AccountMultipleCheck sx={{ fontSize: 36 }} />}
          kpi={kpis.activeUsers}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <KpiCard
          label='Saldo da rede'
          value={currencyFormatter.format(kpis.networkBalance.value)}
          icon={<Wallet sx={{ fontSize: 36 }} />}
          kpi={kpis.networkBalance}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <KpiCard
          label='Depósitos'
          value={currencyFormatter.format(kpis.deposits.value)}
          icon={<CashPlus sx={{ fontSize: 36 }} />}
          kpi={kpis.deposits}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <KpiCard
          label='Saques pendentes'
          value={numberFormatter.format(kpis.pendingWithdrawals.value)}
          icon={<ClockAlertOutline sx={{ fontSize: 36 }} />}
          kpi={kpis.pendingWithdrawals}
          polarity='negative-is-good'
          caption={`${numberFormatter.format(kpis.pendingWithdrawals.currentBacklog)} aguardando aprovação agora`}
        />
      </Grid>
    </Grid>
  )
}
