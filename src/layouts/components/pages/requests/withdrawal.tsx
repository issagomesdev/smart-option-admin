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
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Link from '@mui/material/Link';
import FilterListIcon from '@mui/icons-material/FilterList';
import { visuallyHidden } from '@mui/utils';
import { withdrawal, respondWithdrawalRequest } from "src/services/requests.service";
import { useEffect } from 'react';
import themeConfig from "src/configs/themeConfig";
import DefaultPalette from "src/@core/theme/palette";
import { PuffLoader, BeatLoader } from 'react-spinners';
import BlankLayout from "src/@core/layouts/BlankLayout";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useAuth } from "src/providers/AuthContext";
import Modal from '@mui/material/Modal';
import useMediaQuery from '@mui/material/useMediaQuery';
import TextField from '@mui/material/TextField'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FormControl, Select } from "@mui/material";

interface Data {
  id: number,
  user_id: string,
  user: string,
  value: string,
  erros: any,
  reference_id: string,
  reply: string,
  status: string,
  transaction_id: string,
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
  numeric: boolean;
}

const headCells: readonly HeadCell[] = [
  {
    id: 'id',
    numeric: true,
    disablePadding: false,
    label: 'ID',
  },
  {
    id: 'user',
    numeric: true,
    disablePadding: false,
    label: 'Usuário',
  },
  {
    id: 'value',
    numeric: false,
    disablePadding: true,
    label: 'Valor',
  },
  {
    id: 'status',
    numeric: false,
    disablePadding: false,
    label: 'Situação',
  },
  {
    id: 'created_at',
    numeric: false,
    disablePadding: false,
    label: 'Data',
  },
  {
    id: 'actions',
    numeric: false,
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
  const { order, orderBy, rowCount, onRequestSort } = props;
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
            align={'left'}
            padding={'normal'}
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

function EnhancedTableToolbar() {
  return (
    <Toolbar>
    <Typography variant="h6">
        Solicitações de saques
    </Typography>
    </Toolbar>
  );
}

interface ExtractProps {
    userID?: string|null;
    sx:any
}

export const Withdrawal: React.FC<ExtractProps> = ({ userID = null, sx }) => {
  const [order, setOrder] = React.useState<Order>('asc');
  const [orderBy, setOrderBy] = React.useState<keyof Data>('id');
  const [selected, setSelected] = React.useState<readonly number[]>([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [rows, setRows] = React.useState<Data[]>([]);
  const [actions, setActions] = React.useState<null | HTMLElement>(null);
  const [isEmpty, setIsEmpty] = React.useState<boolean>(false); 
  const [item, setItem] = React.useState<any>({});
  const [open, setOpen] = React.useState(false);
  const [filters, setFilters] = React.useState<any>({ id: '', name: '', value: '', status: 'all', created_at: '' });
  const [observation, setObservation] = React.useState<string>('');
  const [loadingWithdrawalRequest, setLoadingWithdrawalRequest] = React.useState(false);
  const { token } = useAuth();

  const isSmallerThan = useMediaQuery('(max-width:830px)');

  useEffect(() => {   
    withdrawalRequests();
  }, [filters]);

  const withdrawalRequests = () => {
    withdrawal(userID, token(), filters).then(data => {
      const res = data.data.map(function(data:any) {
          return {id: data.id, user_id: data.user_id, user: data.name, value: data.value, reference_id: data.reference_id, reply: data.reply_observation, status: data.status, erros: data.errors_cause, transaction_id: data.transaction_id, created_at: data.created_at };
        });
        if(res.length <= 0) setIsEmpty(true);
        else setIsEmpty(false), setRows(res);
      }).catch(error => console.error(error));
  }

  let visibleRows = React.useMemo(
    () =>
      stableSort(rows, getComparator(order, orderBy)).slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage,
      ),
    [order, rows, orderBy, page, rowsPerPage],
  );

  const respondRequest = async(res:any) => {

    setLoadingWithdrawalRequest(true);

    try {

      const response:any = await respondWithdrawalRequest(res, token());
      console.log(response)
      if(response.data.status) {
        toast.success(response.data.message, {
          position: toast.POSITION.TOP_RIGHT,
          theme: "colored"
        });
      } else {
        toast.error(response.data.message, {
          position: toast.POSITION.TOP_RIGHT,
          theme: "colored"
        });
      }

      withdrawalRequests();

    } catch(error) {
      toast.error(`Erro: ${JSON.stringify(error)}`, {
        position: toast.POSITION.TOP_RIGHT,
        theme: "colored"
      });
    }

      setLoadingWithdrawalRequest(false);
      setOpen(false);
      setObservation('');

  }

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof Data,
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isSelected = (id: number) => selected.indexOf(id) !== -1;

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

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
    return <Box sx={{ width: '100%' }}>
        <ToastContainer/>
        <EnhancedTableToolbar/>
        <TableContainer sx={sx}>
          <Table
            sx={{ width: 1000 }}
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
                    <TextField value={filters.id} inputProps={{ style: { height: "10px" } }} fullWidth size="small" onChange={(event) => setFilters((values:any) => ({ ...values, id: event.target.value }))}/>
                </TableCell>
                <TableCell align="center"> 
                    <TextField value={filters.name} inputProps={{ style: { height: "10px" } }} fullWidth size="small" onChange={(event) => setFilters((values:any) => ({ ...values, name: event.target.value }))}/>
                </TableCell>
                <TableCell align="center"> 
                    <TextField value={filters.value} inputProps={{ style: { height: "10px" } }} fullWidth size="small" onChange={(event) => setFilters((values:any) => ({ ...values, value: event.target.value }))}/>
                </TableCell>
                <TableCell align="center"> 
                  <FormControl sx={{width: '100%'}} variant="outlined" size="small">
                      <Select size="small" style={{ height: '25px' }} value={filters.status} onChange={(event) => setFilters((values:any) => ({ ...values, status: event.target.value }))}>
                      <MenuItem value='all'>Todos</MenuItem>
                      <MenuItem value='pending'>Pendente</MenuItem>
                      <MenuItem value='authorized'>Autorizado</MenuItem>
                      <MenuItem value='refused'>Rejeitado</MenuItem>
                      <MenuItem value='success'>Concluído</MenuItem>
                      <MenuItem value='failed'>Falhou</MenuItem>
                      </Select>
                    </FormControl> 
                </TableCell>
                <TableCell align="center"> 
                  <TextField type="date" inputProps={{ style: { height: "10px" } }} fullWidth size="small" value={filters.created_at} onChange={(event) => setFilters((values:any) => ({ ...values, created_at: event.target.value }))}/> 
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
          </Table>
        </TableContainer>
      
        <Box sx={{ width: '100%', marginY: '1em' }}>
          <Typography variant="subtitle1" sx={{textAlign: 'center'}}> Não há registros de solicitações de saque no momento </Typography>
        </Box>
    </Box>
  }

  return (
    <Box sx={{ width: '100%' }}>
        <ToastContainer/>

        <EnhancedTableToolbar/>
        <TableContainer sx={sx}>
          <Table
            sx={{ width: 1000 }}
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
                    <TextField value={filters.id} inputProps={{ style: { height: "10px" } }} fullWidth size="small" onChange={(event) => setFilters((values:any) => ({ ...values, id: event.target.value }))}/>
                </TableCell>
                <TableCell align="center"> 
                    <TextField value={filters.name} inputProps={{ style: { height: "10px" } }} fullWidth size="small" onChange={(event) => setFilters((values:any) => ({ ...values, name: event.target.value }))}/>
                </TableCell>
                <TableCell align="center"> 
                    <TextField value={filters.value} inputProps={{ style: { height: "10px" } }} fullWidth size="small" onChange={(event) => setFilters((values:any) => ({ ...values, value: event.target.value }))}/>
                </TableCell>
                <TableCell align="center"> 
                  <FormControl sx={{width: '100%'}} variant="outlined" size="small">
                      <Select size="small" style={{ height: '25px' }} value={filters.status} onChange={(event) => setFilters((values:any) => ({ ...values, status: event.target.value }))}>
                      <MenuItem value='all'>Todos</MenuItem>
                      <MenuItem value='pending'>Pendente</MenuItem>
                      <MenuItem value='authorized'>Autorizado</MenuItem>
                      <MenuItem value='refused'>Rejeitado</MenuItem>
                      <MenuItem value='success'>Concluído</MenuItem>
                      <MenuItem value='failed'>Falhou</MenuItem>
                      </Select>
                    </FormControl> 
                </TableCell>
                <TableCell align="center"> 
                  <TextField type="date" inputProps={{ style: { height: "10px" } }} fullWidth size="small" value={filters.created_at} onChange={(event) => setFilters((values:any) => ({ ...values, created_at: event.target.value }))}/> 
                </TableCell>
                <TableCell></TableCell>
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
                    <TableCell>
                      <Link
                          textAlign="center"
                          href={"/users/view/"+row.user_id}
                          underline="hover"
                          >
                          {row.user} 
                      </Link>
                    </TableCell>
                    <TableCell>{row.value}</TableCell>
                    <TableCell>{row.status == "pending"? "Pendente" : row.status == "authorized"? "Autorizado" : row.status == "refused"? "Rejeitado" : row.status == "failed"? "Falhou" : row.status == "success"? "Concluído" : row.status }</TableCell>
                    <TableCell>{row.created_at}</TableCell>
                    <TableCell>
                      <IconButton
                      edge="end"
                      color="inherit"
                      aria-label="menu"
                      aria-haspopup="true"
                      onClick={(event) =>{setActions(event.currentTarget as HTMLElement); setItem(row) }}>
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
                          <MenuItem onClick={() => {setOpen(true); setActions(null)}}> {item.status == "pending"? 'Responder' : 'Visualizar'} </MenuItem>
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

        <Modal open={open} sx={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center'}}>
          
          <Paper sx={{ position: 'relative', width: isSmallerThan ? '100%' : '40%', height: '60%', padding: '30px', margin: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY:'auto'}}>

            { loadingWithdrawalRequest? <Box sx={{position: 'absolute', top: '60%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', }}>
              <BeatLoader
                size={15}
                color={DefaultPalette(themeConfig.mode, 'primary').customColors.primaryGradient}
                cssOverride={{
                  display: "block",
                  margin: "1",
                  borderColor: DefaultPalette(themeConfig.mode, 'primary').customColors.primaryGradient,
                }}
                speedMultiplier={0.8}
              />
            </Box> : ''  }

            { item.status == "pending"? <Box sx={{ width: '100%', height: '90%', marginBottom: 3, overflow: 'auto', display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
            <TextField style={{ width: '100%'}} label="Observações" multiline rows={6}
            onChange={(event) => { setObservation(event.target.value)} }
            value={observation}/>
            </Box> : <Box sx={{ width: '100%', height: '90%', marginBottom: 3 }}>
            <Typography> Situação: {item.status == "pending"? "Pendente" : item.status == "authorized"? "Autorizado" : item.status == "refused"? "Rejeitado" : item.status == "failed"? "Falhou" : item.status == "success"? "Concluído" : item.status } </Typography>
            {item.erros? <Typography> Detalhes: {JSON.parse(item.erros).map((erro:any) => `${erro.description} `)} </Typography> : ''}
            <Typography sx={{ overflow: 'auto', height: '90%' }}> Observação: {item.reply? item.reply : "Nenhuma observação foi incluída na resposta à solicitação."} </Typography>
            </Box>  }     
            
           { item.status == "pending"? <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: 2 }}>
              <Box sx={{ cursor: 'pointer', backgroundColor: DefaultPalette(themeConfig.mode, 'primary').customColors.primaryGradient, width: 120, height: 30, borderRadius: '4px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginRight: 5 }} onClick={() => respondRequest({id: item.id, res: true, observation: observation})}>
                <Typography sx={{ textAlign: 'center', color: '#fff' }}> Autorizar </Typography>
              </Box>

              <Box sx={{ cursor: 'pointer', backgroundColor: '#ff5d61', width: 120, height: 30, borderRadius: '4px', display: 'flex', justifyContent: 'center', alignItems: 'center' }} onClick={() => respondRequest({id: item.id, res: false, observation: observation})}>
              <Typography sx={{ textAlign: 'center', color: '#fff' }}> Rejeitar </Typography>
              </Box>
            </Box> : null }

            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <Box sx={{ cursor: 'pointer', backgroundColor: '#ff5d61', width: 120, height: 30, borderRadius: '4px', display: 'flex', justifyContent: 'center', alignItems: 'center' }} onClick={() => setOpen(false)}>
                <Typography sx={{ textAlign: 'center', color: '#fff' }}> Fechar </Typography>
              </Box>
            </Box> 
          </Paper>
        </Modal>
    </Box>
  );
}
