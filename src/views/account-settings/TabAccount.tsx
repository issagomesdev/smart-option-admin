import { useState, ElementType, ChangeEvent, SyntheticEvent } from 'react'
import Grid from '@mui/material/Grid'
import { styled } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import CardContent from '@mui/material/CardContent'
import Button, { ButtonProps } from '@mui/material/Button'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from "src/providers/AuthContext"
import { editAccount } from "src/services/users.service"

interface Form {
  id: number,
  name: string,
  surname: string,
  email:string
}

const TabAccount = () => {
  const { user } = useAuth();
  
  const [values, setValues] = useState<Form>({
    id: user.id,
    name: user.name,
    surname: user.surname,
    email: user.email })

  const handleChange = (prop: keyof Form) => (event: ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [prop]: event.target.value })
  }

  const { token } = useAuth();

  const submit = async() => {
    try {
      await editAccount(values, token());
      toast.success("Perfil atualizado com sucesso!", {
        position: toast.POSITION.TOP_RIGHT,
        theme: "colored"
      });
    } catch (error:any) {
      toast.error(JSON.parse(error).errors[0].message || error, {
        position: toast.POSITION.TOP_RIGHT,
        theme: "colored"
      });
    }
  
    };

  return (
    <CardContent>
      <form>
        <Grid container spacing={7}>
          
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label='Nome' defaultValue={user.name} onChange={handleChange('name')}/>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label='Segundo Nome' defaultValue={user.surname} onChange={handleChange('surname')}/>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type='email'
              label='Email'
              defaultValue={user.email}
              onChange={handleChange('email')}
            />
          </Grid>

          <Grid item xs={12}>
            <Button variant='contained' sx={{ marginRight: 3.5 }} onClick={() => submit()}>
              Save Changes
            </Button>
            <Button type='reset' variant='outlined' color='secondary'>
              Reset
            </Button>
          </Grid>
        </Grid>
      </form>
      <ToastContainer />
    </CardContent>
  )
}

export default TabAccount
