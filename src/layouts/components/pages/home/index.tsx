// ** MUI Imports
import Grid from '@mui/material/Grid'
import * as React from 'react';
// ** Icons Imports
import Poll from 'mdi-material-ui/Poll'
import CurrencyUsd from 'mdi-material-ui/CurrencyUsd'
import HelpCircleOutline from 'mdi-material-ui/HelpCircleOutline'
import BriefcaseVariantOutline from 'mdi-material-ui/BriefcaseVariantOutline'

// ** Custom Components Imports
import CardStatisticsVerticalComponent from 'src/@core/components/card-statistics/card-stats-vertical'

// ** Styled Component Import
import ApexChartWrapper from 'src/@core/styles/libs/react-apexcharts'

// ** Demo Components Imports
import Table from 'src/views/dashboard/Table'
import Trophy from 'src/views/dashboard/Trophy'
import TotalEarning from 'src/views/dashboard/TotalEarning'
import StatisticsCard from 'src/views/dashboard/StatisticsCard'
import WeeklyOverview from 'src/views/dashboard/WeeklyOverview'
import DepositWithdraw from 'src/views/dashboard/DepositWithdraw'
import SalesByCountries from 'src/views/dashboard/SalesByCountries'
import { Box, Paper, Typography, Select, MenuItem, InputLabel, FormControl } from "@mui/material"
import { useAuth } from "src/providers/AuthContext";
import { users, balance } from "src/services/dashboard.service";
import { AccountMultiple, AccountMultipleCheck, Medal }  from 'mdi-material-ui';
import { useEffect } from 'react';
import BlankLayout from "src/@core/layouts/BlankLayout";
import { PuffLoader } from "react-spinners";
import DefaultPalette from "src/@core/theme/palette";
import themeConfig from "src/configs/themeConfig";
import { botUsers } from "src/services/users.service";

const HomePage = () => {
  
  const { token } = useAuth();
  const [users_list, setUsers_list] = React.useState<any>([]);
  const [totalUsers, setTotalUsers] = React.useState<any>([]);
  const [ balanceTotal, setBalanceTotal] = React.useState<any>([]);
  const [filters, setFilters] = React.useState<any>({ user_id: 'all', product_id: 'all', data: 'all' });

  useEffect(() => {
    users(token()).then((data:any) => {
      setTotalUsers([{
        id: 1,
        name: 'Total de Usuários',
        total:  data.data.allUsers,
        md: 6,
        icon: <AccountMultiple sx={{ fontSize: 60, color: DefaultPalette(themeConfig.mode, 'primary').customColors.primaryGradient }}/>
      },
      {
        id: 2,
        name: 'Total de Usuários Ativos',
        total:  data.data.activeUsers,
        md: 6,
        icon: <AccountMultipleCheck sx={{ fontSize: 60, color: DefaultPalette(themeConfig.mode, 'primary').customColors.primaryGradient }}/>
      },
      {
        id: 3,
        name: 'Total de Usuários Bronze',
        total:  data.data.bronzeUsers,
        md: 4,
        icon: <Medal sx={{ fontSize: 60, color: "#795548" }}/>
      },
      {
        id: 4,
        name: 'Total de Usuários Prata',
        total:  data.data.silverUsers,
        md: 4,
        icon: <Medal sx={{ fontSize: 60, color: "#607d8b"  }}/>
      },
      {
        id: 5,
        name: 'Total de Usuários Ouro',
        total:  data.data.goldUsers,
        md: 4,
        icon: <Medal sx={{ fontSize: 60, color: "#ffd24b"  }}/>
      }])
    }).catch((error:any) => console.error(error));

    balance(token(), filters).then((data:any) => {
      setBalanceTotal([{
        id: 1,
        name: 'Total na plataforma (R$)',
        total:  data.data,
        md: 6,
        icon: <AccountMultiple sx={{ fontSize: 60, color: DefaultPalette(themeConfig.mode, 'primary').customColors.primaryGradient }}/>
      }]);
    }).catch((error:any) => console.error(error));

    botUsers(token()).then((data:any) => {
      setUsers_list(data.data);
    }).catch((error:any) => console.error(error));
    
  }, []);

  useEffect(() => {

    balance(token(), filters).then((data:any) => {
      setBalanceTotal([{
        id: 1,
        name: 'Total na Plataforma (R$)',
        total:  data.data,
        md: 6,
        icon: <AccountMultiple sx={{ fontSize: 60, color: DefaultPalette(themeConfig.mode, 'primary').customColors.primaryGradient }}/>
      }]);
    }).catch((error:any) => console.error(error));

  }, [filters]);

  if (totalUsers.length <= 0) {
    return <BlankLayout>
      <Box className='content-center'>
        <PuffLoader
          size={100}
          color={DefaultPalette(themeConfig.mode, 'primary').customColors.primaryGradient}
          cssOverride={{
            display: "block",
            margin: "1",
            borderColor: DefaultPalette(themeConfig.mode, 'primary').customColors.primaryGradient,
          }}
          speedMultiplier={0.8}
        />
      </Box>
    </BlankLayout>
  }

  return (
    <ApexChartWrapper>
      <Box>
          <Grid container spacing={3}>
          {totalUsers.map((total:any) => {
            return ( <Grid item xs={6} md={total.md}>
              <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
                {total.icon}
              <Typography sx={{ textAlign: 'center', fontWeight: 900 }}> {total.name} </Typography>
              <Typography sx={{ textAlign: 'center', fontWeight: 900 }}> {total.total} </Typography>
              </Paper>
          </Grid> )
        })}
          </Grid>
      </Box>
      <Box style={{ marginTop: 10, padding: 10 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <FormControl sx={{width: '100%'}}>
                <InputLabel id="filter-for-user-label">Filtrar por Usuário</InputLabel>
                  <Select fullWidth onChange={(event) => setFilters((values:any) => ({ ...values, user_id: event.target.value, product_id: 'all' }))}
                  labelId="filter-for-user-label"
                  id="filter-for-user"
                  label="Filtrar por Usuário"
                  value={filters.user_id}>
                    <MenuItem value='all'>Todos</MenuItem>
                    {users_list.map((user:any) => {
                      return ( <MenuItem value={user.id}>{user.name}</MenuItem> )
                    })}
                  </Select>
              </FormControl>
            </Grid> 
            <Grid item xs={12} sm={4}>
              <FormControl sx={{width: '100%'}}>
                <InputLabel id="filter-for-product-label">Filtrar por Plano</InputLabel>
                <Select fullWidth onChange={(event) => setFilters((values:any) => ({ ...values, product_id: event.target.value, user_id: 'all' }))}
              value={filters.product_id}
              labelId="filter-for-product-label"
              id="filter-for-product"
              label="Filtrar por Plano">
                <MenuItem value='all'>Todos</MenuItem>
                <MenuItem value={1}>Smart Bronze</MenuItem>
                <MenuItem value={2}>Smart Silver</MenuItem>
                <MenuItem value={3}>Smart Gold</MenuItem>
                </Select>
              </FormControl> 
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl sx={{width: '100%'}}>
                <InputLabel id="filter-for-data-label">Filtrar por Data</InputLabel>
                <Select fullWidth onChange={(event) => setFilters((values:any) => ({ ...values, data: event.target.value }))}
              value={filters.data}
              labelId="filter-for-data-label"
              id="filter-for-data"
              label="Filtrar por Data">
                <MenuItem value='all'>Todos</MenuItem>
                <MenuItem value={1}>Smart Bronze</MenuItem>
                <MenuItem value={2}>Smart Silver</MenuItem>
                <MenuItem value={3}>Smart Gold</MenuItem>
                </Select>
              </FormControl> 
            </Grid>
          </Grid>
      </Box>
      <Box>
          <Grid container spacing={3}>
          {balanceTotal.map((total:any) => {
            return ( <Grid item xs={6} md={total.md}>
              <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
                {total.icon}
              <Typography sx={{ textAlign: 'center', fontWeight: 900 }}> {total.name} </Typography>
              <Typography sx={{ textAlign: 'center', fontWeight: 900 }}> {total.total} </Typography>
              </Paper>
          </Grid> )
        })}
          </Grid>
      </Box>
    </ApexChartWrapper>
  )
}

export default HomePage