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
import { network } from "src/services/network.service";
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
import Grid from '@mui/material/Grid';
import { HumanCapacityDecrease, HumanCapacityIncrease }  from 'mdi-material-ui';
import { FormControl, TextField, Select } from "@mui/material";

interface Data {
  id: number,
  name: string,
  level: string,
  status: number,
  actions: string
}

const headCells: readonly HeadCell[] = [
  {
    id: 'id',
    numeric: true,
    disablePadding: false,
    label: 'ID',
  },
  {
    id: 'name',
    numeric: false,
    disablePadding: true,
    label: 'Nome',
  },
  {
    id: 'level',
    numeric: true,
    disablePadding: false,
    label: 'Nivel',
  },
  {
    id: 'status',
    numeric: false,
    disablePadding: false,
    label: 'Situação',
  },
  {
    id: 'actions',
    numeric: false,
    disablePadding: false,
    label: 'Ações',
  },
];

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
    <Toolbar
      sx={{
        pl: { sm: 10 },
        pr: { xs: 1, sm: 1 },
      }}
    >
    <Typography variant="h6">
        Rede
    </Typography>
    </Toolbar>
  );
}

interface ExtractProps {
    userID?: string;
    sx:any
}

export const Network: React.FC<ExtractProps> = ({ userID, sx }) => {
  const [order, setOrder] = React.useState<Order>('asc');
  const [orderBy, setOrderBy] = React.useState<keyof Data>('id');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [rows, setRows] = React.useState<Data[]>([]); 
  const [guests, setGuests] = React.useState<Data[]>([]); 
  const [affiliates, setAffiliates] = React.useState<Data[]>([]);
  const [actions, setActions] = React.useState<null | HTMLElement>(null);  
  const [typeOfNetwork, setTypeOfNetwork] = React.useState<number|null>(null);
  const [id, setId] = React.useState<any>({}); 
  const [filters, setFilters] = React.useState<any>({ id: '', name: '', level: 'all', status: 'all'  });
  const router = useRouter();
  const { token } = useAuth();

  useEffect(() => {

    network(userID, token(), filters).then(data => {
      const data_affiliates = data.data.affiliates.map(function(data:any) {
        return {id: data.id, name: data.name, level: data.level, status: data.status };
      });

      setAffiliates(data_affiliates);

      const data_guests = data.data.guests.map(function(data:any) {
        return {id: data.id, name: data.name, level: data.level, status: data.status };
      });

      setGuests(data_guests);
  
    }).catch(error => console.error(error));

  }, [filters]);

  useEffect(() => {

    selectTypeOfNetwork(typeOfNetwork);

  }, [guests, affiliates]);

  let visibleRows = React.useMemo(
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

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  function TypeOfNetwork(){
    return (
      <Grid container spacing={2}>
      <Grid item xs={6} sx={{cursor: 'pointer'}} onClick={() => selectTypeOfNetwork(2)}>
          <Paper sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', backgroundColor: DefaultPalette(themeConfig.mode, 'primary').primary.light, color: '#fff' }}>
          <HumanCapacityIncrease sx={{ fontSize: 40 }}/>
          <Typography sx={{ textAlign: 'center', color: '#fff', fontWeight: 'bolder' }}> Afiliação </Typography>
          </Paper>
      </Grid>
      <Grid item xs={6} sx={{cursor: 'pointer'}} onClick={() => selectTypeOfNetwork(1)}>
          <Paper sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', backgroundColor: DefaultPalette(themeConfig.mode, 'primary').primary.light, color: '#fff' }}>
          <HumanCapacityDecrease sx={{ fontSize: 40 }}/>
          <Typography sx={{ textAlign: 'center', color: '#fff', fontWeight: 'bolder' }}> Afiliados </Typography>
          </Paper>
      </Grid>
      </Grid>
    )
  }

  const selectTypeOfNetwork = (id: number|null) =>{ 
    if(id){
      setTypeOfNetwork(id);
      id == 1? setRows(guests) : setRows(affiliates);
    }
  }

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  if (rows.length <= 0) {
    return (
    <Box sx={{ width: '100%',  marginY: '1em', flexGrow: 1 }}>
      <Box sx={{ width: '100%' }}>
      <TypeOfNetwork/>
        <EnhancedTableToolbar/>
        <TableContainer sx={sx}>
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
                    <TextField value={filters.id} inputProps={{ style: { height: "10px" } }} fullWidth size="small" onChange={(event) => setFilters((values:any) => ({ ...values, id: event.target.value }))}/>
                </TableCell>
                <TableCell align="center"> 
                    <TextField value={filters.name} inputProps={{ style: { height: "10px" } }} fullWidth size="small" onChange={(event) => setFilters((values:any) => ({ ...values, name: event.target.value }))}/>
                </TableCell>
                <TableCell align="center"> 
                  <FormControl sx={{width: '100%'}} variant="outlined" size="small">
                      <Select size="small" style={{ height: '25px' }} value={filters.level} onChange={(event) => setFilters((values:any) => ({ ...values, level: event.target.value }))}>
                      <MenuItem value='all'>Todos</MenuItem>
                      <MenuItem value={1}>Nivel 1</MenuItem>
                      <MenuItem value={2}>Nivel 2</MenuItem>
                      <MenuItem value={3}>Nivel 3</MenuItem>
                      </Select>
                    </FormControl> 
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
                <TableCell align="center"> </TableCell>
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
                    <TableCell>{row.level}</TableCell> <TableCell>{row.status? 
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

        
    
    <Box sx={{ width: '100%', marginY: '1em' }}>
      <Typography variant="subtitle1" sx={{textAlign: 'center'}}> {typeOfNetwork == 1? 'Usuário sem afiliados no momento' : typeOfNetwork == 2? '  Usuário sem afiliações no momento': ''} </Typography>
    </Box>

    </Box>
    </Box>
    )
  }

  return (
    <Box sx={{ width: '100%' }}>
      <TypeOfNetwork/>
        <EnhancedTableToolbar/>
        <TableContainer sx={sx}>
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
                    <TextField value={filters.id} inputProps={{ style: { height: "10px" } }} fullWidth size="small" onChange={(event) => setFilters((values:any) => ({ ...values, id: event.target.value }))}/>
                </TableCell>
                <TableCell align="center"> 
                    <TextField value={filters.name} inputProps={{ style: { height: "10px" } }} fullWidth size="small" onChange={(event) => setFilters((values:any) => ({ ...values, name: event.target.value }))}/>
                </TableCell>
                <TableCell align="center"> 
                  <FormControl sx={{width: '100%'}} variant="outlined" size="small">
                      <Select size="small" style={{ height: '25px' }} value={filters.level} onChange={(event) => setFilters((values:any) => ({ ...values, level: event.target.value }))}>
                      <MenuItem value='all'>Todos</MenuItem>
                      <MenuItem value={1}>Nivel 1</MenuItem>
                      <MenuItem value={2}>Nivel 2</MenuItem>
                      <MenuItem value={3}>Nivel 3</MenuItem>
                      </Select>
                    </FormControl> 
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
                <TableCell align="center"> </TableCell>
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
                    <TableCell>{row.level}</TableCell> <TableCell>{row.status? 
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
    </Box>
  );
}
