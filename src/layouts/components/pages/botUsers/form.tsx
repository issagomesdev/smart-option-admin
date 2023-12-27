import * as React from 'react';
import { Box, Paper, Typography } from '@mui/material'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from "src/providers/AuthContext"
import { newBotUser, upBotUser, botUser } from "src/services/users.service";
import { useEffect } from "react";
import { useRouter } from 'next/router';

const BotUsersForm = (userID:any = null) => {
    
    const [data, setData] = React.useState<any>({
        name: '',
        email: '',
        cpf: '',
        password: '',
        phone_number: '',
        adress: '',
        pix_code: ''
    });
    const [errors, setErrors] = React.useState<any>({});
    const { token } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if(userID && userID.userID){
        console.log('userID', userID.userID)
        botUser(`${userID.userID}`, token()).then(user => {
          console.log('userID2', user.data)
          setData({
            id: user.data.id,
            name: user.data.name,
            email: user.data.email,
            cpf: user.data.cpf,
            password: '',
            phone_number: user.data.phone_number,
            adress: user.data.adress,
            pix_code: user.data.pix_code
        });
      }).catch((error:any) => {
        toast.error(error, {
          position: toast.POSITION.TOP_RIGHT,
          theme: "colored"
        });
      });
      }
  
    }, []);

    const submit = async () => {
      if(validateForm()){
        try {
            
          const response = userID.userID? await upBotUser(data, token()) : await newBotUser(data, token())

          toast.success(response.data.message, {
            position: toast.POSITION.TOP_RIGHT,
            theme: "colored"
          });

          setTimeout(() => {
            router.push('/users');
          }, 2000);
            
          } catch (error:any) {
            toast.error(error.response.data.errors[0].message, {
              position: toast.POSITION.TOP_RIGHT,
              theme: "colored"
            });
          } 
      }
    };

    const validateForm = () => {
      const newErrors: any = {};

      if (!data.name.trim()) {
        newErrors.name = 'Campo obrigatório';
      }

      if (!data.email.trim()) {
        newErrors.email = 'Campo obrigatório';
      }  

      if (!data.cpf.trim()) {
        newErrors.cpf = 'Campo obrigatório';
      } 

      if (!userID.userID && !data.password.trim()) {
        newErrors.password = 'Campo obrigatório';
      }

      if (!data.phone_number.trim()) {
        newErrors.phone_number = 'Campo obrigatório';
      }

      if (!data.adress.trim()) {
        newErrors.adress = 'Campo obrigatório';
      }

      if (!data.pix_code.trim()) {
        newErrors.pix_code = 'Campo obrigatório';
      }

      setErrors(newErrors);

      return Object.keys(newErrors).length === 0;
    };

    return (
      <Box sx={{ padding: 5 }}>
        <form>
          <Grid container spacing={7}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Nome'
                value={data.name}
                onChange={(event) => {
                      setData((values: any) => ({ ...values, name: event.target.value }));
                      validateForm();
                  }}
                error={!!errors.name}
                helperText={errors.name}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type='email'
                label='Email'
                value={data.email}
                onChange={(event) => {
                      setData((values: any) => ({ ...values, email: event.target.value }))
                      validateForm();
                  }}
                error={!!errors.email}
                helperText={errors.email}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='CPF'
                value={data.cpf}
                onChange={(event) => {
                      setData((values: any) => ({ ...values, cpf: event.target.value }))
                      validateForm();
                  }}
                error={!!errors.cpf}
                helperText={errors.cpf}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Senha'
                value={data.password}
                onChange={(event) => { 
                      setData((values: any) => ({ ...values, password: event.target.value }))
                      validateForm();
                  }}
                error={!!errors.password}
                helperText={errors.password}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Telefone'
                value={data.phone_number}
                onChange={(event) => { 
                      setData((values: any) => ({ ...values, phone_number: event.target.value }));
                      validateForm();
                  }}
                error={!!errors.phone_number}
                helperText={errors.phone_number}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Endereço'
                value={data.adress}
                onChange={(event) => { 
                      setData((values: any) => ({ ...values, adress: event.target.value }))
                      validateForm();
                  }}
                error={!!errors.adress}
                helperText={errors.adress}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Pix'
                value={data.pix_code}
                onChange={(event) => {
                      setData((values: any) => ({ ...values, pix_code: event.target.value }))
                      validateForm();
                  }}
                error={!!errors.pix_code}
                helperText={errors.pix_code}
              />
            </Grid>

            <Grid item xs={12}>
              <Button variant='contained' sx={{ marginRight: 3.5 }} onClick={() => submit()}>
                Salvar
              </Button>
            </Grid>
          </Grid>
        </form>
        <ToastContainer />
      </Box>
    );
}

export default BotUsersForm