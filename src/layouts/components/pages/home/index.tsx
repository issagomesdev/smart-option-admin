import Grid from '@mui/material/Grid'
import * as React from 'react';
import ApexChartWrapper from 'src/@core/styles/libs/react-apexcharts'
import { Box, Paper, Typography, Select, MenuItem, InputLabel, FormControl, TextField, Modal, useMediaQuery, useTheme } from "@mui/material"
import { useAuth } from "src/providers/AuthContext";
import { users, balance } from "src/services/dashboard.service";
import { AccountMultiple, AccountMultipleCheck, Medal, RadioboxBlank, CheckCircle, AccountCash }  from 'mdi-material-ui';
import { useEffect } from 'react';
import BlankLayout from "src/@core/layouts/BlankLayout";
import { PuffLoader } from "react-spinners";
import DefaultPalette from "src/@core/theme/palette";
import themeConfig from "src/configs/themeConfig";
import { botUsers } from "src/services/users.service";
import 'react-date-range/dist/styles.css'; 
import 'react-date-range/dist/theme/default.css';
import { DateRange } from 'react-date-range';

const HomePage = () => {
  
  const { token } = useAuth();
  const [users_list, setUsers_list] = React.useState<any>([]);
  const [totalUsers, setTotalUsers] = React.useState<any>([]);
  const [ balanceTotal, setBalanceTotal] = React.useState<any>([]);
  const [openSearchUsers, setOpenSearchUsers] = React.useState(false);
  const [openSelectInterval, setOpenSelectInterval] = React.useState(false);
  const [interval, setInterval] = React.useState<any>([
    {
      startDate: null,
      endDate: null,
      key: 'selection'
    }
  ]);
  const [filters, setFilters] = React.useState<any>({ user: {value: 'all', label: 'Todos'}, product_id: 'all', interval: {value: 'all', label: 'Todos'} });
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

    botUsers(token(), searchUser).then((data:any) => {
      setUsers_list(data.data);
    }).catch((error:any) => console.error(error));
    
  }, []);

  useEffect(() => {

    balance(token(), filters).then((data:any) => {
      
      setBalanceTotal(() =>
          data.data.map((total:any) => {
            return {
              name: total.name,
              total:  total.value,
              md: 6,
              icon: <AccountCash sx={{ fontSize: 60, color: DefaultPalette(themeConfig.mode, 'primary').customColors.primaryGradient }}/>
            };
          })
        );
        
    }).catch((error:any) => console.error(error));

  }, [filters]);

  useEffect(() => {

    botUsers(token(), searchUser).then((data:any) => {
      setUsers_list(data.data);
    }).catch((error:any) => console.error(error));

  }, [searchUser]);

  useEffect(() => {

    if(interval[0].startDate && interval[0].endDate){
      const value = `${String((interval[0].startDate).getDate()).padStart(2, '0')}-${String((interval[0].startDate).getMonth() + 1).padStart(2, '0')}-${(interval[0].startDate).getFullYear()} - ${String((interval[0].endDate).getDate()).padStart(2, '0')}-${String((interval[0].endDate).getMonth() + 1).padStart(2, '0')}-${(interval[0].endDate).getFullYear()}`;
  
      setFilters((values:any) => ({ ...values, interval: { value: value, label: value} }));
    }

  }, [interval]);

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
                <TextField fullWidth label='Filtrar por Usuário' value={filters.user.label} InputProps={{ readOnly: true }} onClick={() => { setOpenSearchUsers(true); }}/>
              </FormControl>
            </Grid> 
            <Grid item xs={12} sm={4}>
              <FormControl sx={{width: '100%'}}>
                <InputLabel id="filter-for-product-label">Filtrar por Plano</InputLabel>
                <Select fullWidth onChange={(event) => setFilters((values:any) => ({ ...values, product_id: event.target.value, user: {value: 'all', label: 'Todos'} }))}
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
            <TextField fullWidth label='Filtrar por Período' value={filters.interval.label} InputProps={{ readOnly: true }} onClick={() => { setOpenSelectInterval(true) }}/>
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

      <Modal open={openSearchUsers} sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          <Paper sx={{ position: 'relative', minWidth: isSmallScreen? '90%' : '60%', height: '70%', padding: '30px', margin: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <Box sx={{ width: '100%' }}>
            <TextField fullWidth label="Search" type="search" placeholder="Pesquise por ID ou Nome" onChange={(event) => { setSearchUser(event.target.value)}}/>
          </Box> 
          
          <Box sx={{ width: '100%', margin: 5, overflowY:'auto' }}>
            <Box sx={{ paddingX: 1, paddingY: 3, display: 'flex', alignItems: 'center' }} onClick={() => { setFilters((values:any) => ({ ...values, user: {value: 'all', label: 'Todos'}, product_id: 'all' })), setOpenSearchUsers(false), setSearchUser('') }}>

              { filters.user.value == 'all'? <CheckCircle sx={{ fontSize: 30, color: DefaultPalette(themeConfig.mode, 'primary').customColors.primaryGradient, cursor: 'pointer', marginRight: 3 }}/> : <RadioboxBlank sx={{ fontSize: 30, color: DefaultPalette(themeConfig.mode, 'primary').customColors.primaryGradient, cursor: 'pointer', marginRight: 3 }}/> }
              
              <Typography> Todos </Typography>
            </Box> 
            {users_list.map((user:any) => {
              return ( 
                <Box sx={{ paddingX: 1, paddingY: 3, display: 'flex', alignItems: 'center' }} onClick={() => { setFilters((values:any) => ({ ...values, user: {value: user.id, label: user.name}, product_id: 'all' })), setOpenSearchUsers(false), setSearchUser('') }}>

               { filters.user.value == user.id? <CheckCircle sx={{ fontSize: 30, color: DefaultPalette(themeConfig.mode, 'primary').customColors.primaryGradient, cursor: 'pointer', marginRight: 3 }}/> : <RadioboxBlank sx={{ fontSize: 30, color: DefaultPalette(themeConfig.mode, 'primary').customColors.primaryGradient, cursor: 'pointer', marginRight: 3 }}/> }
                
                <Typography sx={{  }}> #{user.id} - {user.name} </Typography>
                </Box> 
               )
            })}
          </Box>        
          <Box sx={{ cursor: 'pointer', backgroundColor: '#ff5d61', width: 120, height: 30, borderRadius: '4px', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'absolute', bottom: 10 }} onClick={() => {setOpenSearchUsers(false), setSearchUser('')}}>
            <Typography sx={{ textAlign: 'center', color: '#fff' }}> Fechar </Typography>
          </Box>
          </Paper>
      </Modal>
      
      <Modal open={openSelectInterval} sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          <Paper sx={{ position: 'relative', minWidth: isSmallScreen? '90%' : '60%', height: '70%', padding: '30px', margin: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          
          <Box>
            <DateRange
            editableDateInputs={true}
            onChange={item => setInterval([item.selection])}
            moveRangeOnFirstSelection={false}
            ranges={interval}/>
          </Box>

          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center',  }} >
            <Box sx={{ cursor: 'pointer', backgroundColor: DefaultPalette(themeConfig.mode, 'primary').customColors.primaryGradient, width: 120, height: 30, borderRadius: '4px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginRight: 5 }} onClick={() => {setOpenSelectInterval(false)}}>
              <Typography sx={{ textAlign: 'center', color: '#fff' }}> Confirmar </Typography>
            </Box>
            <Box sx={{ cursor: 'pointer', backgroundColor: '#ff5d61', width: 120, height: 30, borderRadius: '4px', display: 'flex', justifyContent: 'center', alignItems: 'center' }} onClick={() => {setOpenSelectInterval(false), setFilters((values:any) => ({ ...values, interval: { value: 'all', label: 'Todos'} })) }}>
            <Typography sx={{ textAlign: 'center', color: '#fff' }}> Limpar </Typography>
            </Box>
          </Box>
          </Paper>
      </Modal>
    </ApexChartWrapper>
  )
}

export default HomePage