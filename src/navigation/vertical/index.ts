// ** Icon imports
import HomeOutline from 'mdi-material-ui/HomeOutline'
import AccountGroup from 'mdi-material-ui/AccountGroup'

// ** Type import
import { VerticalNavItemsType } from 'src/@core/layouts/types'

const navigation = (): VerticalNavItemsType => {
  return [
    {
      title: 'Dashboard',
      icon: HomeOutline,
      path: '/'
    },
    {
      title: 'Usuários ',
      icon: AccountGroup,
      path: '/users'
    },
  ]
}

export default navigation
