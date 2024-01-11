import * as React from 'react';
import { Box } from '@mui/material';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import BlankLayout from "src/@core/layouts/BlankLayout";
import {CartArrowDown, CashMinus, CashPlus, FaceAgent }  from 'mdi-material-ui';
import Grid from '@mui/material/Grid';
import useMediaQuery from '@mui/material/useMediaQuery';
import Modal from '@mui/material/Modal';
import { Withdrawal } from "src/layouts/components/pages/requests/withdrawal";
import { Deposit } from "src/layouts/components/pages/requests/deposit";
import { Subscription } from "src/layouts/components/pages/requests/subscription";
import { Support } from "src/layouts/components/pages/requests/support";
import { useEffect } from "react";
import { pendingRequests } from "src/services/requests.service";
import { useAuth } from "src/providers/AuthContext";
import Badge from '@mui/material/Badge';
import MailIcon from '@mui/icons-material/Mail';

  const Requests: React.FC = () => {
    const [open, setOpen] = React.useState(false);
    const [renderItem, setRenderItem] = React.useState<number>()
    const isSmallerThan809 = useMediaQuery('(max-width:808px)');
    const [requests, setRequests] = React.useState<any>([
      {
        id: 1,
        name: 'Solicitações de saque',
        label: 'withdrawals',
        badge: true,
        pendings: 0,
        icon: <CashMinus sx={{ fontSize: 60 }}/>
      },
      {
        id: 2,
        name: 'Solicitações de depósito',
        label: 'deposits',
        badge: false,
        pendings: 0,
        icon: <CashPlus sx={{ fontSize: 60 }}/>
      },
      {
        id: 3,
        name: 'Solicitações de suporte',
        label: 'support',
        badge: true,
        pendings: 0,
        icon: <FaceAgent sx={{ fontSize: 60 }}/>
      },
      {
        id: 4,
        name: 'Solicitações de adesão',
        label: 'subscriptions',
        badge: false,
        pendings: 0,
        icon: <CartArrowDown sx={{ fontSize: 60 }}/>
      },
    ]);

    const { token } = useAuth();

    const getPendencies = () => {
      pendingRequests(token()).then((pendencies) => {
        setRequests((requests:any) =>
          requests.map((request:any) => {
            const pendings = pendencies.data.find((pen:any) => pen.requests === request.label);
            return pendings ? { ...request, pendings: pendings.pendings } : request;
          })
        );
      }).catch(error => console.error(error));
    }

    useEffect(() => {
      getPendencies();
    }, []);

  return (
    <BlankLayout>
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <Box sx={{ width: '90%', marginY: '1em' }}>
          <Grid container spacing={2} sx={{ height: '100%' }} columnSpacing={{ xs: 2 }}>
          {requests.map((request:any, index:any) => {
            return ( <Grid key={index} item xs={isSmallerThan809 ? 6 : 4} onClick={() => {setOpen(true); setRenderItem(request.id)}} sx={{cursor: 'pointer'}}>
               <Badge badgeContent={request.pendings} color="primary" sx={{  width: '100%'}}>
                  <Paper sx={{  width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
                    {request.icon}
                    <Typography sx={{ textAlign: 'center' }}> {request.name} </Typography>
                  </Paper>
               </Badge> 
            </Grid> )
        })}
          </Grid>

        </Box>
      </Box>

      <Modal open={open}  sx={{ width: '100%', display: 'flex', justifyContent: 'center'}}>
          <Paper sx={{ position: 'relative', minWidth: '70%', padding: '30px', margin: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY:'auto'}}>         
            { renderItem == 1? <Withdrawal sx={{overflowY:'auto', maxHeight: 450}}/> :     
            renderItem == 2? <Deposit sx={{overflowY:'auto', maxHeight: 450}}/> :    
            renderItem == 3? <Support sx={{overflowY:'auto', maxHeight: 450}}/> :  
            renderItem == 4? <Subscription sx={{overflowY:'auto', maxHeight: 450}}/> :
            null }
            <Box sx={{ cursor: 'pointer', backgroundColor: '#ff5d61', width: 120, height: 30, borderRadius: '4px', display: 'flex', justifyContent: 'center', alignItems: 'center' }} onClick={() =>{ setOpen(false); getPendencies(); }}>
              <Typography sx={{ textAlign: 'center', color: '#fff' }}> Fechar </Typography>
            </Box>
          </Paper>
    </Modal>
      
    </BlankLayout>
  );
}

export default Requests;

