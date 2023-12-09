// ** React Imports
import { useState, ElementType, ChangeEvent, SyntheticEvent } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Link from '@mui/material/Link'
import Alert from '@mui/material/Alert'
import Select from '@mui/material/Select'
import { styled } from '@mui/material/styles'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import InputLabel from '@mui/material/InputLabel'
import AlertTitle from '@mui/material/AlertTitle'
import IconButton from '@mui/material/IconButton'
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import Button, { ButtonProps } from '@mui/material/Button'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// ** Icons Imports
import Close from 'mdi-material-ui/Close'
import { useAuth } from "src/providers/AuthContext"
import { editAccount } from "src/services/user.service"
const ImgStyled = styled('img')(({ theme }) => ({
  width: 120,
  height: 120,
  marginRight: theme.spacing(6.25),
  borderRadius: theme.shape.borderRadius
}))

const ButtonStyled = styled(Button)<ButtonProps & { component?: ElementType; htmlFor?: string }>(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    textAlign: 'center'
  }
}))

const ResetButtonStyled = styled(Button)<ButtonProps>(({ theme }) => ({
  marginLeft: theme.spacing(4.5),
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    marginLeft: 0,
    textAlign: 'center',
    marginTop: theme.spacing(4)
  }
}))

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

  const submit = async() => {
    try {
      await editAccount(values);
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
