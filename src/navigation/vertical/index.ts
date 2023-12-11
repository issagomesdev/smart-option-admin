// ** Icon imports
import {HomeCircleOutline, AccountGroup, ShieldAccount, BriefcaseVariant, }  from 'mdi-material-ui';

// ** Type import
import { VerticalNavItemsType } from 'src/@core/layouts/types'

const navigation = (): VerticalNavItemsType => {
  return [
    {
      title: 'Dashboard',
      icon: HomeCircleOutline,
      path: '/'
    },
    {
      title: 'Admin',
      icon: ShieldAccount,
      path: '/admin'
    },
    {
      title: 'Usuários',
      icon: AccountGroup,
      path: '/users'
    },
    {
      title: 'Solicitações',
      icon: BriefcaseVariant,
      path: '/requests'
    }
  ]
}

export default navigation
