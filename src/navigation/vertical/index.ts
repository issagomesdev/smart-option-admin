// ** Icon imports
import HomeCircleOutline from 'mdi-material-ui/HomeCircleOutline'
import AccountGroup from 'mdi-material-ui/AccountGroup'
import ShieldAccount  from 'mdi-material-ui/ShieldAccount';
import BriefcaseVariant  from 'mdi-material-ui/BriefcaseVariant';

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
      path: '/'
    },
    {
      title: 'Usuários',
      icon: AccountGroup,
      path: '/users'
    },
    {
      title: 'Solicitações',
      icon: BriefcaseVariant,
      path: '/'
    }
  ]
}

export default navigation
