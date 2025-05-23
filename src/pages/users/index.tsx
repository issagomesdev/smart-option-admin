import * as React from 'react';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { TextField } from "@mui/material";
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import Modal from '@mui/material/Modal';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Switch from '@mui/material/Switch';
import Link from '@mui/material/Link';
import { PlusOne } from '@mui/icons-material';
import { visuallyHidden } from '@mui/utils';
import { botUsersWithFilter, lockBotUser, transfUserAdmin, deleteBotUser } from "src/services/users.service";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect } from 'react';
import themeConfig from "src/configs/themeConfig";
import DefaultPalette from "src/@core/theme/palette";
import { PuffLoader } from 'react-spinners';
import BlankLayout from "src/@core/layouts/BlankLayout";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useRouter } from 'next/router';
import { useAuth } from "src/providers/AuthContext";
import { Select, FormControl, InputLabel, FormControlLabel } from "@mui/material";
import { BottleSoda } from "mdi-material-ui";
import { products, Plans } from 'src/services/products.service';
import { plans } from "src/services/dashboard.service";

interface Data {
  id: number,
  name: string,
  email: string,
  plan: string,
  telegram: string,
  balance: string,
  status: number,
  is_active: number,
  created_at: string,
  actions: string
}

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

type Order = 'asc' | 'desc';

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key,
): (
  a: { [key in Key]: number | string },
  b: { [key in Key]: number | string },
) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort<T>(array: readonly T[], comparator: (a: T, b: T) => number) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

interface HeadCell {
  disablePadding: boolean;
  id: keyof Data;
  label: string;
  padding: number;
  numeric: boolean;
}

const headCells: readonly HeadCell[] = [
  {
    id: 'id',
    numeric: true,
    padding: 30,
    disablePadding: false,
    label: 'ID',
  },
  {
    id: 'name',
    numeric: false,
    padding: 60,
    disablePadding: true,
    label: 'Nome',
  },
  {
    id: 'email',
    numeric: false,
    padding: 0,
    disablePadding: false,
    label: 'Email',
  },
  {
    id: 'plan',
    numeric: false,
    padding: 0,
    disablePadding: false,
    label: 'Plano',
  },
  {
    id: 'telegram',
    numeric: false,
    padding: 30,
    disablePadding: false,
    label: 'Telegram',
  },
  {
    id: 'balance',
    numeric: false,
    padding: 20,
    disablePadding: false,
    label: 'Saldo',
  },
  {
    id: 'status',
    numeric: true,
    padding: 0,
    disablePadding: false,
    label: 'Situação',
  },
  {
    id: 'is_active',
    numeric: false,
    padding: 20,
    disablePadding: false,
    label: 'Bloqueio',
  },
  {
    id: 'created_at',
    numeric: false,
    padding: 20,
    disablePadding: false,
    label: 'Cadastrado em',
  },
  {
    id: 'actions',
    numeric: false,
    padding: 0,
    disablePadding: false,
    label: 'Ações',
  },
];

interface EnhancedTableProps {
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof Data) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { order, orderBy, rowCount, onRequestSort } =
    props;
  const createSortHandler =
    (property: keyof Data) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={'center'}
            padding={'normal'}
            style={{ paddingLeft: headCell.padding, paddingRight: headCell.padding}}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

interface EnhancedTableToolbarProps {
  numSelected: number;
}

function EnhancedTableToolbar() {
  const router = useRouter();
  return (
    <Toolbar
    >
      <Typography
          sx={{ marginRight: 2 }}
          variant="h6"
          id="tableTitle"
          component="div"
        >
          Usuários 
      </Typography>
          <Box sx={{ cursor: 'pointer', backgroundColor: DefaultPalette(themeConfig.mode, 'primary').customColors.primaryGradient, borderRadius: 2 }} onClick={() => router.push(`/users/create`)}>
            <Typography sx={{ color: '#fff', fontWeight: 600, paddingX: 3 }}> Novo </Typography>
          </Box>
    </Toolbar>
  );
}



export default function Users() {
  const [order, setOrder] = React.useState<Order>('asc');
  const [orderBy, setOrderBy] = React.useState<keyof Data>('id');
  const [selected, setSelected] = React.useState<readonly number[]>([]);
  const [page, setPage] = React.useState(0);
  const [open, setOpen] = React.useState(false);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [rows, setRows] = React.useState<Data[]>([]);
  const [actions, setActions] = React.useState<null | HTMLElement>(null); 
  const [isEmpty, setIsEmpty] = React.useState<boolean>(false);
  const [filters, setFilters] = React.useState<any>({ user_id: '', name: '', email: '', product_id: 'all', telegram: '', balance: '', status: 'all', is_active: 'all', created_at: '' });
  const [transf, setTransf] = React.useState<any>({ user_id: '', value: '', type: '' });
  const [id, setId] = React.useState<any>({}); 
  const [list_plans, setListPlans] = React.useState<any>([]);
  const router = useRouter();
  const { token } = useAuth();

  const getUsers = () => {
    botUsersWithFilter(token(), filters).then(data => {
      const res = data.data.map(function(user:any) {
        return {id: user.id, name: user.name, email: user.email, plan: user.plan, telegram: user.telegram, status: user.status, is_active: user.is_active, balance: user.balance, created_at: user.created_at};
      });

      if(res.length <= 0) setIsEmpty(true);
      else setRows(res), setIsEmpty(false);
  
    }).catch(error => console.error(error));
  }

  const deleteUser = async () => {
    const confirmed = window.confirm(`Você está a um passo de excluir esse usuário, confirma?`);
    if(confirmed){
      try {
        const response = await deleteBotUser(id, token()) 
        toast.success(response.data.message, {
          position: toast.POSITION.TOP_RIGHT,
          theme: "colored"
        });
  
        getUsers();
        setActions(null)
          
        } catch (error:any) {
          toast.error(error.response.data.errors[0].message, {
            position: toast.POSITION.TOP_RIGHT,
            theme: "colored"
          });
        } 
    }
  };

  useEffect(() => {
    plans(token()).then((data:any) => {
      setListPlans(data.data);
    }).catch((error:any) => console.error(error));
  }, []);

  useEffect(() => {
    getUsers();
  }, [filters]);

  const visibleRows = React.useMemo(
    () =>
      stableSort(rows, getComparator(order, orderBy)).slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage,
      ),
    [order, rows, orderBy, page, rowsPerPage],
  );

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof Data,
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const userLock = async(userID:number, status:boolean) => {
    const confirmed = window.confirm(`Você está a um passo de ${!status? 'desbloquear' : 'bloquear'} esse usuário, confirma?`);
    if(confirmed){
      try {
            
        const response = await lockBotUser(`${userID}`, status? '0' : '1', token());
        getUsers();

        toast.success(response.data.message, {
          position: toast.POSITION.TOP_RIGHT,
          theme: "colored"
        });
          
        } catch (error:any) {
          toast.error(error, {
            position: toast.POSITION.TOP_RIGHT,
            theme: "colored"
          });
        } 
    }
  };

  const makeTransfer = async() => {
    if(transf.user_id && transf.value && transf.type){

      try {
            
        const response = await transfUserAdmin(transf, token());
        setTransf({ user_id: '', value: '', type: '' });
        setOpen(false);
        getUsers();
  
        toast.success(response.data.message, {
          position: toast.POSITION.TOP_RIGHT,
          theme: "colored"
        });
          
        } catch (error:any) {
          toast.error(error, {
            position: toast.POSITION.TOP_RIGHT,
            theme: "colored"
          });
        } 

    } else {
      toast.error('Preencha todos os campos', {
        position: toast.POSITION.TOP_RIGHT,
        theme: "colored"
      });
    }
  }

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  if (rows.length <= 0 && !isEmpty) {
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

  if (isEmpty) {
    return <Box sx={{ width: '100%',  marginY: '1em', flexGrow: 1 }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <EnhancedTableToolbar/>
        <TableContainer>
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size={"medium"}>
            <EnhancedTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}/>

            <TableHead>
              <TableRow>
                <TableCell align="center"> 
                    <TextField value={filters.user_id} inputProps={{ style: { height: "10px" } }} fullWidth size="small" onChange={(event) => setFilters((values:any) => ({ ...values, user_id: event.target.value }))}/>
                </TableCell>
                <TableCell align="center"> 
                    <TextField value={filters.name} inputProps={{ style: { height: "10px" } }} fullWidth size="small" onChange={(event) => setFilters((values:any) => ({ ...values, name: event.target.value }))}/>
                </TableCell>
                <TableCell align="center"> 
                    <TextField value={filters.email} inputProps={{ style: { height: "10px" } }} fullWidth size="small" onChange={(event) => setFilters((values:any) => ({ ...values, email: event.target.value }))}/>
                </TableCell>
                <TableCell align="center"> 
                  <FormControl sx={{width: '100%'}} variant="outlined" size="small">
                      <Select size="small" style={{ height: '25px' }} value={filters.product_id} onChange={(event) => setFilters((values:any) => ({ ...values, product_id: event.target.value }))}>
                      <MenuItem value='all'>Todos</MenuItem>
                      {list_plans.map((plan:any, index:any) => {
                        return <MenuItem key={index} value={plan.id}>{products[plan.name]}</MenuItem>
                      })}
                      </Select>
                    </FormControl> 
                </TableCell>
                <TableCell align="center"> 
                    <TextField inputProps={{ style: { height: "10px" } }} fullWidth size="small" value={filters.telegram} onChange={(event) => setFilters((values:any) => ({ ...values, telegram: event.target.value }))}/>
                </TableCell>
                <TableCell align="center"> 
                <TextField inputProps={{ style: { height: "10px" } }} fullWidth size="small" value={filters.balance} onChange={(event) => setFilters((values:any) => ({ ...values, balance: event.target.value }))}/>
                </TableCell>
                <TableCell align="center"> 
                    <FormControl sx={{width: '100%'}} variant="outlined" size="small">
                      <Select size="small" style={{ height: '25px' }} value={filters.status} onChange={(event) => setFilters((values:any) => ({ ...values, status: event.target.value }))}>
                      <MenuItem value='all'>Todos</MenuItem>
                      <MenuItem value={0}>Inativo</MenuItem>
                      <MenuItem value={1}>Ativo</MenuItem>
                      </Select>
                    </FormControl> 
                </TableCell>
                <TableCell align="center"> 
                  <FormControl sx={{width: '100%'}} variant="outlined" size="small">
                    <Select size="small" style={{ height: '25px' }} value={filters.is_active} onChange={(event) => setFilters((values:any) => ({ ...values, is_active: event.target.value }))}>
                      <MenuItem value='all'>Todos</MenuItem>
                      <MenuItem value={0}>Ativado</MenuItem>
                      <MenuItem value={1}>Desativado</MenuItem>
                    </Select>
                  </FormControl> 
                </TableCell>
                <TableCell align="center"> 
                    <TextField inputProps={{ style: { height: "10px" } }} fullWidth size="small" value={filters.created_at} onChange={(event) => setFilters((values:any) => ({ ...values, created_at: event.target.value }))}/>
                </TableCell>
                <TableCell align="center"> 
                </TableCell>
              </TableRow>
            </TableHead>
    
          </Table>
        </TableContainer>

            
  <Box sx={{ width: '100%', marginY: '1em' }}>
    <Typography variant="subtitle1" sx={{textAlign: 'center'}}> Não há registros de usuários no momento </Typography>
  </Box>
          
      </Paper>
    </Box>
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <EnhancedTableToolbar/>
        <TableContainer>
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size={"medium"}
          >
            <EnhancedTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
            />

        <TableHead>
          <TableRow>
            <TableCell align="center"> 
                <TextField value={filters.user_id} inputProps={{ style: { height: "10px" } }} fullWidth size="small" onChange={(event) => setFilters((values:any) => ({ ...values, user_id: event.target.value }))}/>
            </TableCell>
            <TableCell align="center"> 
                <TextField value={filters.name} inputProps={{ style: { height: "10px" } }} fullWidth size="small" onChange={(event) => setFilters((values:any) => ({ ...values, name: event.target.value }))}/>
            </TableCell>
            <TableCell align="center"> 
                <TextField value={filters.email} inputProps={{ style: { height: "10px" } }} fullWidth size="small" onChange={(event) => setFilters((values:any) => ({ ...values, email: event.target.value }))}/>
            </TableCell>
            <TableCell align="center"> 
              <FormControl sx={{width: '100%'}} variant="outlined" size="small">
                  <Select size="small" style={{ height: '25px' }} value={filters.product_id} onChange={(event) => setFilters((values:any) => ({ ...values, product_id: event.target.value }))}>
                  <MenuItem value='all'>Todos</MenuItem>
                  {list_plans.map((plan:any, index:any) => {
                    return <MenuItem key={index} value={plan.id}>{products[plan.name]}</MenuItem>
                  })}
                  </Select>
                </FormControl> 
            </TableCell>
            <TableCell align="center"> 
                <TextField inputProps={{ style: { height: "10px" } }} fullWidth size="small" value={filters.telegram} onChange={(event) => setFilters((values:any) => ({ ...values, telegram: event.target.value }))}/>
            </TableCell>
            <TableCell align="center"> 
            <TextField inputProps={{ style: { height: "10px" } }} fullWidth size="small" value={filters.balance} onChange={(event) => setFilters((values:any) => ({ ...values, balance: event.target.value }))}/>
            </TableCell>
            <TableCell align="center"> 
            <FormControl sx={{width: '100%'}} variant="outlined" size="small">
                  <Select size="small" style={{ height: '25px' }} value={filters.status} onChange={(event) => setFilters((values:any) => ({ ...values, status: event.target.value }))}>
                  <MenuItem value='all'>Todos</MenuItem>
                  <MenuItem value={0}>Inativo</MenuItem>
                  <MenuItem value={1}>Ativo</MenuItem>
                  </Select>
                </FormControl> 
            </TableCell>
            <TableCell align="center"> 
              <FormControl sx={{width: '100%'}} variant="outlined" size="small">
                <Select size="small" style={{ height: '25px' }} value={filters.is_active} onChange={(event) => setFilters((values:any) => ({ ...values, is_active: event.target.value }))}>
                  <MenuItem value='all'>Todos</MenuItem>
                  <MenuItem value={0}>Ativado</MenuItem>
                  <MenuItem value={1}>Desativado</MenuItem>
                </Select>
              </FormControl> 
            </TableCell>
            <TableCell align="center"> 
                <TextField inputProps={{ style: { height: "10px" } }} fullWidth size="small" value={filters.created_at} onChange={(event) => setFilters((values:any) => ({ ...values, created_at: event.target.value }))}/>
            </TableCell>
            <TableCell align="center"> 
            </TableCell>
          </TableRow>
        </TableHead>

            <TableBody>
              {visibleRows.map((row, index) => {

                return (
                  <TableRow
                    hover
                    role="checkbox"
                    tabIndex={-1}
                    key={row.id}
                    sx={{ cursor: 'pointer' }}
                  >
                    
                    <TableCell>{row.id}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>
                      <Box
                      bgcolor={DefaultPalette(themeConfig.mode, 'primary').customColors[row.plan as Plans]}
                      borderRadius={16}
                      textAlign="center"
                      color="white">
                        {row.plan == 'without'? 'nenhum' : products[row.plan]}
                      </Box>
                    </TableCell>
                    <TableCell>{!row.telegram || row.telegram == 'off'? 
                      <Box
                      bgcolor={DefaultPalette(themeConfig.mode, 'primary').error.dark}
                      borderRadius={16}
                      textAlign="center"
                      color="white">
                        desligado
                      </Box> : 
                    <Link
                    bgcolor={DefaultPalette(themeConfig.mode, 'primary').primary.light}
                    borderRadius={16}
                    textAlign="center"
                    paddingX={3}
                    paddingY={0.4}
                    color="white"
                    href={"https://web.telegram.org/k/#@"+row.telegram}
                    underline="hover"
                    >
                      {row.telegram} 
                    </Link>
                    }</TableCell>
                    <TableCell>R$ { parseFloat(row.balance).toFixed(2)}</TableCell>
                    <TableCell>{row.status? 
                      <Box
                      bgcolor={DefaultPalette(themeConfig.mode, 'primary').success.light}
                      borderRadius={16}
                      textAlign="center"
                      color="white">
                        Ativo
                      </Box> : 
                      <Box
                      bgcolor={DefaultPalette(themeConfig.mode, 'primary').error.main}
                      borderRadius={16}
                      textAlign="center"
                      color="white">
                        Inativo
                      </Box>
                    }</TableCell>
                    <TableCell>
                    <Switch checked={row.is_active? false : true} onChange={(event) => { userLock(row.id, event.target.checked) }}/>
                    </TableCell>
                    <TableCell>{row.created_at}</TableCell>
                    <TableCell>
                      <IconButton
                      edge="end"
                      color="inherit"
                      aria-label="menu"
                      aria-haspopup="true"
                      onClick={(event) =>{setActions(event.currentTarget as HTMLElement); setId(row.id) }}>
                        <MoreVertIcon/>
                      </IconButton>
                        <Menu
                        anchorEl={actions}
                        open={Boolean(actions)}
                        PaperProps={{
                          style: {
                            boxShadow: 'rgb(0 0 0 / 5%) 0px 0px 6px',
                          },
                        }}
                        onClose={() => setActions(null)}>
                          <MenuItem onClick={() => router.push(`/users/view/${id}`)}> Visualizar </MenuItem>
                          <MenuItem onClick={() => router.push(`/users/update/${id}`)}> Editar </MenuItem>
                          <MenuItem onClick={() => deleteUser()}> Excluir </MenuItem>
                          <MenuItem onClick={() => { setOpen(true); setTransf((values:any) => ({ ...values, user_id: id })) }}> Transf </MenuItem>
                        </Menu>
                    </TableCell>
                  </TableRow>
                );
              })}
              {emptyRows > 0 && (
                <TableRow
                  style={{
                    height: 53 * emptyRows,
                  }}
                >
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 100]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
        <ToastContainer />

        <Modal open={open} sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          <Paper sx={{ position: 'relative', minWidth: '50%', height: '50%', padding: '30px', margin: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY:'auto'}}> 

            <Typography variant="h6"> Adicione ou retire valores nesse conta </Typography>

            <Box sx={{ width: '100%', height: '90%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>

              <Select size="small" value={transf.type} style={{ width: '70px', marginRight: 2 }} onChange={(event) => setTransf((values:any) => ({ ...values, type: event.target.value }))}>
                <MenuItem value='sum'>+</MenuItem>
                <MenuItem value='subtract'>-</MenuItem>
              </Select>
              <TextField value={transf.value} type="number" size="small" onChange={(event) => setTransf((values:any) => ({ ...values, value: event.target.value }))}/>
              
            </Box>

            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <Box sx={{ cursor: 'pointer', backgroundColor: DefaultPalette(themeConfig.mode, 'primary').customColors.primaryGradient, width: 120, height: 30, borderRadius: '4px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginRight: 5 }} onClick={() => makeTransfer()}>
                <Typography sx={{ textAlign: 'center', color: '#fff' }}> Enviar </Typography>
              </Box>
              <Box sx={{ cursor: 'pointer', backgroundColor: '#ff5d61', width: 120, height: 30, borderRadius: '4px', display: 'flex', justifyContent: 'center', alignItems: 'center' }} onClick={() => setOpen(false)}>
              <Typography sx={{ textAlign: 'center', color: '#fff' }}> Fechar </Typography>
              </Box>
            </Box>
          </Paper>
      </Modal>
    </Box>
  );
}
