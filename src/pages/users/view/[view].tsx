import * as React from 'react';
import { Box } from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Link from '@mui/material/Link';
import { botUser } from "src/services/user.service";
import { useEffect } from 'react';
import themeConfig from "src/configs/themeConfig";
import DefaultPalette from "src/@core/theme/palette";
import { PuffLoader } from 'react-spinners';
import BlankLayout from "src/@core/layouts/BlankLayout";
import { useRouter } from 'next/router';
import {CartArrowDown, CashRegister, AccountNetwork, CashMinus, CashPlus, FaceAgent, CloseCircle }  from 'mdi-material-ui';
import Grid from '@mui/material/Grid';
import useMediaQuery from '@mui/material/useMediaQuery';
import Modal from '@mui/material/Modal';
import { Extract } from "src/layouts/components/pages/requests/extract";
import { Network } from "src/layouts/components/pages/requests/network";
import { Withdrawal } from "src/layouts/components/pages/requests/withdrawal";
import { useAuth } from "src/providers/AuthContext"

type Plans = 'bronze' | 'silver' | 'gold' | 'without';

interface Requests {
  id: number;
  name: string;
  icon: any;
}

const requests:Requests[] = [
  {
    id: 1,
    name: 'Extrato',
    icon: <CashRegister sx={{ fontSize: 60 }}/>
  },
  {
    id: 2,
    name: 'Rede',
    icon: <AccountNetwork sx={{ fontSize: 60 }}/>
  },
  {
    id: 3,
    name: 'Solicitações de saque',
    icon: <CashMinus sx={{ fontSize: 60 }}/>
  },
  {
    id: 4,
    name: 'Solicitações de depósito',
    icon: <CashPlus sx={{ fontSize: 60 }}/>
  },
  {
    id: 5,
    name: 'Solicitações de suporte',
    icon: <FaceAgent sx={{ fontSize: 60 }}/>
  },
  {
    id: 6,
    name: 'Solicitações de adesão',
    icon: <CartArrowDown sx={{ fontSize: 60 }}/>
  },
]
  const View: React.FC = () => {
  const [data, setData] = React.useState<any>(null);
  const [open, setOpen] = React.useState(false);
  const [renderItem, setRenderItem] = React.useState<number>();
  const router = useRouter();
  const { view } = router.query;
  const isSmallerThan809 = useMediaQuery('(max-width:808px)');
  const { token } = useAuth();

  useEffect(() => {
    botUser(view as string, token()).then(data => {
      setData(data.data);
    }).catch(error => console.error(error));

  }, []);


  if (data === null) {
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
    <BlankLayout>
      <Box sx={{ width: '100%' }}>
        <Paper sx={{ width: '100%', mb: 2 }}>        
          <TableContainer>
            <Table
              sx={{ width: '100%' }}
              aria-labelledby="tableTitle"
              size={"medium"}>
              <TableBody>
                <TableRow> 
                  <TableCell> <Box sx={{ fontWeight: 'bold', m: 1 }}>ID</Box> </TableCell>
                  <TableCell>{data.id}</TableCell>
                </TableRow>
                <TableRow> 
                  <TableCell> <Box sx={{ fontWeight: 'bold', m: 1 }}>Nome</Box> </TableCell>
                  <TableCell>{data.name}</TableCell>
                </TableRow>
                <TableRow> 
                  <TableCell> <Box sx={{ fontWeight: 'bold', m: 1 }}>Email</Box> </TableCell>
                  <TableCell>{data.email}</TableCell>
                </TableRow>
                <TableRow> 
                  <TableCell> <Box sx={{ fontWeight: 'bold', m: 1 }}>Plano</Box> </TableCell>
                  <TableCell> 
                    <Box
                    bgcolor={DefaultPalette(themeConfig.mode, 'primary').customColors[data.plan as Plans]}
                    borderRadius={16}
                    textAlign="center"
                    width={100}
                    color="white">
                      {data.plan == 'without'? 'nenhum' : data.plan}
                    </Box>
                  </TableCell>
                </TableRow>
                <TableRow> 
                  <TableCell> <Box sx={{ fontWeight: 'bold', m: 1 }}>Telegram</Box> </TableCell>
                  <TableCell> 
                    {data.telegram == 'off'? 
                        <Box
                        bgcolor={DefaultPalette(themeConfig.mode, 'primary').error.dark}
                        borderRadius={16}
                        textAlign="center"
                        width={100}
                        color="white">
                          desligado
                        </Box> :
                        <Box
                        bgcolor={DefaultPalette(themeConfig.mode, 'primary').primary.light}
                        borderRadius={16}
                        width={100}
                        textAlign="center">
                          <Link
                          textAlign="center"
                          color="white"
                          href={"https://web.telegram.org/k/#@"+data.telegram}
                          underline="hover"
                          >
                          {data.telegram} 
                          </Link>
                        </Box>
                      }
                  </TableCell>
                </TableRow>
                <TableRow> 
                  <TableCell> <Box sx={{ fontWeight: 'bold', m: 1 }}>Situação</Box> </TableCell>
                  <TableCell> 
                    {data.status? 
                        <Box
                        bgcolor={DefaultPalette(themeConfig.mode, 'primary').success.light}
                        borderRadius={16}
                        textAlign="center"
                        width={100}
                        color="white">
                          Ativo
                        </Box> : 
                        <Box
                        bgcolor={DefaultPalette(themeConfig.mode, 'primary').error.main}
                        borderRadius={16}
                        textAlign="center"
                        width={100}
                        color="white">
                          Inativo
                        </Box>
                      }
                  </TableCell>
                </TableRow>
                  <TableCell> <Box sx={{ fontWeight: 'bold', m: 1 }}>Cadastrado em</Box> </TableCell>
                  <TableCell>{data.created_at}</TableCell>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
        <Box sx={{ width: '100%',  marginY: '1em', flexGrow: 1 }}>
          <Grid container spacing={2} sx={{ height: '100%' }} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
          {requests.map((request, index) => {
            return ( <Grid item xs={isSmallerThan809 ? 6 : 4} onClick={() => {setOpen(true); setRenderItem(request.id)}} sx={{cursor: 'pointer'}}>
              <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
                {request.icon}
              <Typography sx={{ textAlign: 'center' }}> {request.name} </Typography>
              </Paper>
          </Grid> )
        })}
          </Grid>

        </Box>

      </Box>

      <Modal open={open}  sx={{ width: '100%', display: 'flex', justifyContent: 'center'}}>
          <Paper sx={{ position: 'relative', minWidth: '70%', padding: '30px', margin: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY:'auto'}}>         
            { renderItem == 1? <Extract userID={view as string} sx={{overflowY:'auto', maxHeight: 450 }}/> : renderItem == 2? <Network userID={view as string} sx={{overflowY:'auto', maxHeight: 450}}/> : 
            renderItem == 3? <Withdrawal userID={view as string} sx={{overflowY:'auto', maxHeight: 450}}/> : null }
            <Box sx={{ cursor: 'pointer', backgroundColor: '#ff5d61', width: 120, height: 30, borderRadius: '4px', display: 'flex', justifyContent: 'center', alignItems: 'center' }} onClick={() => setOpen(false)}>
              <Typography sx={{ textAlign: 'center', color: '#fff' }}> Fechar </Typography>
            </Box>
          </Paper>
    </Modal>
      
    </BlankLayout>
  );
}

export default View;

