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
import { Box, Paper, Typography, Select, MenuItem, InputLabel, FormControl, TextField, Modal, useMediaQuery, useTheme } from "@mui/material"
import { useAuth } from "src/providers/AuthContext";
import { users, balance } from "src/services/dashboard.service";
import { AccountMultiple, AccountMultipleCheck, Medal, RadioboxBlank, CheckCircle }  from 'mdi-material-ui';
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
  const [open, setOpen] = React.useState(false);
  const [filters, setFilters] = React.useState<any>({ user: {id: 'all', name: 'Todos'}, product_id: 'all', period: 'all' });
  const [ searchUser, setSearchUser] = React.useState<string>('');
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

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

    botUsers(token(), searchUser).then((data:any) => {
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

  useEffect(() => {

    botUsers(token(), searchUser).then((data:any) => {
      setUsers_list(data.data);
    }).catch((error:any) => console.error(error));

  }, [searchUser]);

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
                <TextField fullWidth label='Filtrar por Usuário' value={filters.user.name} InputProps={{ readOnly: true }} onClick={() => { setOpen(true) }}/>
              </FormControl>
            </Grid> 
            <Grid item xs={12} sm={4}>
              <FormControl sx={{width: '100%'}}>
                <InputLabel id="filter-for-product-label">Filtrar por Plano</InputLabel>
                <Select fullWidth onChange={(event) => setFilters((values:any) => ({ ...values, product_id: event.target.value, user: {id: 'all', name: 'Todos'} }))}
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
                <InputLabel id="filter-for-period-label">Filtrar por Periodo</InputLabel>
                <Select fullWidth onChange={(event) => setFilters((values:any) => ({ ...values, period: event.target.value }))}
              value={filters.period}
              labelId="filter-for-period-label"
              id="filter-for-period"
              label="Filtrar por Periodo">
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

      <Modal open={open} sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          <Paper sx={{ position: 'relative', minWidth: isSmallScreen? '90%' : '60%', height: '70%', padding: '30px', margin: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <Box sx={{ width: '100%' }}>
            <TextField fullWidth label="Search" type="search" placeholder="Pesquise por ID ou Nome" onChange={(event) => { setSearchUser(event.target.value)}}/>
          </Box> 
          
          <Box sx={{ width: '100%', margin: 5, overflowY:'auto' }}>
            <Box sx={{ paddingX: 1, paddingY: 3, display: 'flex', alignItems: 'center' }} onClick={() => { setFilters((values:any) => ({ ...values, user: {id: 'all', name: 'Todos'}, product_id: 'all' })), setOpen(false), setSearchUser('') }}>

              { filters.user.id == 'all'? <CheckCircle sx={{ fontSize: 30, color: DefaultPalette(themeConfig.mode, 'primary').customColors.primaryGradient, cursor: 'pointer', marginRight: 3 }}/> : <RadioboxBlank sx={{ fontSize: 30, color: DefaultPalette(themeConfig.mode, 'primary').customColors.primaryGradient, cursor: 'pointer', marginRight: 3 }}/> }
              
              <Typography sx={{  }}> Todos </Typography>
            </Box> 
            {users_list.map((user:any) => {
              return ( 
                <Box sx={{ paddingX: 1, paddingY: 3, display: 'flex', alignItems: 'center' }} onClick={() => { setFilters((values:any) => ({ ...values, user: {id: user.id, name: user.name}, product_id: 'all' })), setOpen(false), setSearchUser('') }}>

               { filters.user.id == user.id? <CheckCircle sx={{ fontSize: 30, color: DefaultPalette(themeConfig.mode, 'primary').customColors.primaryGradient, cursor: 'pointer', marginRight: 3 }}/> : <RadioboxBlank sx={{ fontSize: 30, color: DefaultPalette(themeConfig.mode, 'primary').customColors.primaryGradient, cursor: 'pointer', marginRight: 3 }}/> }
                
                <Typography sx={{  }}> #{user.id} - {user.name} </Typography>
                </Box> 
               )
            })}
          </Box>        
          <Box sx={{ cursor: 'pointer', backgroundColor: '#ff5d61', width: 120, height: 30, borderRadius: '4px', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'absolute', bottom: 10 }} onClick={() => {setOpen(false), setSearchUser('')}}>
            <Typography sx={{ textAlign: 'center', color: '#fff' }}> Fechar </Typography>
          </Box>
          </Paper>
    </Modal>
    </ApexChartWrapper>
  )
}

export default HomePage