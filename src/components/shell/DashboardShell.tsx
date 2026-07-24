'use client'

import { useState, type ReactNode } from 'react'
import NextLink from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import AppBar from '@mui/material/AppBar'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import AccountGroup from 'mdi-material-ui/AccountGroup'
import AccountSupervisorOutline from 'mdi-material-ui/AccountSupervisorOutline'
import BriefcaseVariant from 'mdi-material-ui/BriefcaseVariant'
import CogOutline from 'mdi-material-ui/CogOutline'
import HomeCircleOutline from 'mdi-material-ui/HomeCircleOutline'
import LogoutVariant from 'mdi-material-ui/LogoutVariant'
import MenuIcon from 'mdi-material-ui/Menu'
import type { SessionUser } from '@/domain/dtos/auth.dto'
import type { Permission } from '@/domain/permissions'
import { toast } from '@/components/ui/toast'
import { SessionProvider } from './SessionContext'

const DRAWER_WIDTH = 260
const APP_NAME = 'Smart Option Admin'

/** `permission` opcional — item sem essa chave é visível a qualquer staff autenticado (leitura fica aberta, mesmo padrão do backend). */
const NAV_ITEMS: { label: string; href: string; icon: typeof HomeCircleOutline; permission?: Permission }[] = [
  { label: 'Dashboard', href: '/', icon: HomeCircleOutline },
  { label: 'Usuários', href: '/users', icon: AccountGroup },
  { label: 'Solicitações', href: '/requests', icon: BriefcaseVariant },
  { label: 'Equipe', href: '/team', icon: AccountSupervisorOutline, permission: 'staff.manage' }
]

export interface DashboardShellProps {
  user: SessionUser
  children: ReactNode
}

export function DashboardShell({ user, children }: DashboardShellProps) {
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'))
  const pathname = usePathname()
  const router = useRouter()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)

  async function handleLogout() {
    setMenuAnchor(null)
    await fetch('/api/auth/logout', { method: 'POST' })
    router.replace('/login')
    router.refresh()
  }

  const initials = `${user.name?.[0] ?? ''}${user.surname?.[0] ?? ''}`.toUpperCase()

  const visibleNavItems = NAV_ITEMS.filter(item => !item.permission || user.permissions.includes(item.permission))

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ px: 3 }}>
        <Typography variant='h4' component='span' sx={{ fontWeight: 700, color: 'primary.main' }}>
          {APP_NAME}
        </Typography>
      </Toolbar>
      <Divider />
      <List sx={{ px: 2, py: 2, flex: 1 }}>
        {visibleNavItems.map(item => {
          const isActive = item.href === '/' ? pathname === '/' : pathname?.startsWith(item.href)
          const Icon = item.icon
          return (
            // `ListItemButton` sozinho como filho direto de `List` (`<ul>`) vira
            // `<a>` (via `component={NextLink}`), não `<li>` — achado real de
            // auditoria de acessibilidade. `ListItem disablePadding` restaura o
            // `<li>` semântico, com `ListItemButton` como o elemento interativo dentro dele.
            <ListItem key={item.href} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={NextLink}
                href={item.href}
                selected={isActive}
                onClick={() => setMobileOpen(false)}
                sx={{ borderRadius: 2 }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: isActive ? 'primary.main' : 'text.secondary' }}>
                  <Icon fontSize='small' />
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  slotProps={{ primary: { sx: { fontWeight: isActive ? 600 : 400 } } }}
                />
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position='fixed'
        color='inherit'
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {!isDesktop && (
            <IconButton aria-label='Abrir menu de navegação' onClick={() => setMobileOpen(true)}>
              <MenuIcon />
            </IconButton>
          )}
          <Box sx={{ flex: 1 }} />
          <IconButton
            aria-label='Menu do usuário'
            aria-controls={menuAnchor ? 'user-menu' : undefined}
            aria-haspopup='true'
            onClick={event => setMenuAnchor(event.currentTarget)}
          >
            <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: '0.875rem' }}>{initials}</Avatar>
          </IconButton>
          <Menu id='user-menu' anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant='body2' sx={{ fontWeight: 600 }}>
                {user.name} {user.surname}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                {user.email}
              </Typography>
            </Box>
            <Divider />
            <MenuItem component={NextLink} href='/account-settings' onClick={() => setMenuAnchor(null)}>
              <ListItemIcon>
                <CogOutline fontSize='small' />
              </ListItemIcon>
              Configurações da conta
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleLogout().catch(() => toast.error('Não foi possível sair. Tente novamente.'))
              }}
            >
              <ListItemIcon>
                <LogoutVariant fontSize='small' />
              </ListItemIcon>
              Sair
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box component='nav' sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant={isDesktop ? 'permanent' : 'temporary'}
          open={isDesktop ? true : mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              borderRight: '1px solid',
              borderColor: 'divider'
            }
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box component='main' sx={{ flexGrow: 1, width: { md: `calc(100% - ${DRAWER_WIDTH}px)` } }}>
        <Toolbar />
        <Box sx={{ p: { xs: 2, md: 4 } }}>
          <SessionProvider user={user}>{children}</SessionProvider>
        </Box>
      </Box>
    </Box>
  )
}
