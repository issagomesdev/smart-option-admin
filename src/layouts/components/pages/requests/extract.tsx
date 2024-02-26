import * as React from 'react';
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
import { visuallyHidden } from '@mui/utils';
import { extract, extractWithFilter } from "src/services/requests.service";
import { useEffect } from 'react';
import themeConfig from "src/configs/themeConfig";
import DefaultPalette from "src/@core/theme/palette";
import { PuffLoader } from 'react-spinners';
import BlankLayout from "src/@core/layouts/BlankLayout";
import MenuItem from '@mui/material/MenuItem';
import { useRouter } from 'next/router';
import { useAuth } from "src/providers/AuthContext";
import { TextField, FormControl, Select } from "@mui/material";

interface Data {
  id: number,
  value: string,
  origin: string,
  type: string,
  created_at: string,
  reference_id: string,
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
    id: 'value',
    numeric: false,
    disablePadding: true,
    label: 'Valor',
  },
  {
    id: 'origin',
    numeric: false,
    disablePadding: false,
    label: 'Origem',
  },
  {
    id: 'created_at',
    numeric: false,
    disablePadding: false,
    label: 'Data',
  }
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

function EnhancedTableToolbar(props: any) {
    const { balance } = props;
  return (
    <Box>
      <Toolbar>
        <Typography variant="h6">Extrato</Typography>
      </Toolbar>
      <Toolbar>
        <Typography variant="subtitle1">
        Saldo Atual R$ {Number(balance)? Number(balance).toFixed(2) : '0.00'}
        </Typography>
      </Toolbar>
    </Box>
  );
}

interface ExtractProps {
    userID?: string;
    sx:any
}

export const Extract: React.FC<ExtractProps> = ({ userID, sx }) => {
  const [order, setOrder] = React.useState<Order>('asc');
  const [orderBy, setOrderBy] = React.useState<keyof Data>('id');
  const [selected, setSelected] = React.useState<readonly number[]>([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [rows, setRows] = React.useState<Data[]>([]);
  const [balance, setBalance] = React.useState<string>();
  const [isEmpty, setIsEmpty] = React.useState<boolean>(false);
  const [filters, setFilters] = React.useState<any>({ value: '', origin: 'all', created_at: '' });
  const [createdAt, setCeatedAt] = React.useState<Date|null>(new Date());
  const router = useRouter();
  const { token } = useAuth();

  useEffect(() => {

    extractWithFilter(userID, token(), filters).then(data => {
      const res = data.data.extract.map(function(data:any) {
        return {id: data.id, value: data.value, reference_id: data.reference_id, type: data.type, origin: data.origin, created_at: data.created_at };
      });

      if(res.length <= 0) setIsEmpty(true);
      else setRows(res), setBalance(`${data.data.balance}`), setIsEmpty(false);

    }).catch(error => console.error(error));

  }, [filters]);

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

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = rows.map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event: React.MouseEvent<unknown>, id: number) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: readonly number[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }
    setSelected(newSelected);
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
        <EnhancedTableToolbar balance={balance}/>
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
                </TableCell>
                <TableCell align="center"> 
                    <TextField value={filters.value} inputProps={{ style: { height: "10px" } }} fullWidth size="small" onChange={(event) => setFilters((values:any) => ({ ...values, value: event.target.value }))}/>
                </TableCell>
                <TableCell align="center"> 
                  <FormControl sx={{width: '100%'}} variant="outlined" size="small">
                      <Select size="small" style={{ height: '25px' }} value={filters.origin} onChange={(event) => setFilters((values:any) => ({ ...values, origin: event.target.value }))}>
                      <MenuItem value='all'>Todos</MenuItem>
                      <MenuItem value='deposit'>Depósito</MenuItem>
                      <MenuItem value='withdrawal'>Saque</MenuItem>
                      <MenuItem value='subscription'>Adesão</MenuItem>
                      <MenuItem value='tuition'>Mensalidade</MenuItem>
                      <MenuItem value='earnings'>Rentabilidade</MenuItem>
                      <MenuItem value='profitability'>Bônus de Rentabilidade</MenuItem>
                      <MenuItem value='B.A'>Bônus de Adesão</MenuItem>
                      <MenuItem value='B.M'>Bônus de Mensalidade</MenuItem>
                      <MenuItem value='B.M'>Bônus de Mensalidade</MenuItem>
                      <MenuItem value='transfer'>Transf. entre contas</MenuItem>
                      <MenuItem value='admin'>Transf. ADM</MenuItem>
                      <MenuItem value='diamond_tax'>Taxa Diamante</MenuItem>
                      </Select>
                    </FormControl> 
                </TableCell>
                <TableCell align="center"> 
                
                  <TextField type="date" inputProps={{ style: { height: "10px" } }} fullWidth size="small" value={filters.created_at} onChange={(event) => setFilters((values:any) => ({ ...values, created_at: event.target.value }))}/> 

                </TableCell>
              </TableRow>
            </TableHead>
          </Table>
        </TableContainer>

                   
        <Box sx={{ width: '100%', marginY: '1em' }}>
          <Typography variant="subtitle1" sx={{textAlign: 'center'}}> Não há registros de movimentações no extrato no momento </Typography>
        </Box>
    </Box>
  }

  return (
    <Box sx={{ width: '100%' }}>
        <EnhancedTableToolbar balance={balance}/>
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
                </TableCell>
                <TableCell align="center"> 
                    <TextField value={filters.value} inputProps={{ style: { height: "10px" } }} fullWidth size="small" onChange={(event) => setFilters((values:any) => ({ ...values, value: event.target.value }))}/>
                </TableCell>
                <TableCell align="center"> 
                  <FormControl sx={{width: '100%'}} variant="outlined" size="small">
                      <Select size="small" style={{ height: '25px' }} value={filters.origin} onChange={(event) => setFilters((values:any) => ({ ...values, origin: event.target.value }))}>
                      <MenuItem value='all'>Todos</MenuItem>
                      <MenuItem value='deposit'>Depósito</MenuItem>
                      <MenuItem value='withdrawal'>Saque</MenuItem>
                      <MenuItem value='subscription'>Adesão</MenuItem>
                      <MenuItem value='tuition'>Mensalidade</MenuItem>
                      <MenuItem value='earnings'>Rentabilidade</MenuItem>
                      <MenuItem value='profitability'>Bônus de Rentabilidade</MenuItem>
                      <MenuItem value='B.A'>Bônus de Adesão</MenuItem>
                      <MenuItem value='B.M'>Bônus de Mensalidade</MenuItem>
                      <MenuItem value='transfer'>Transf. entre contas</MenuItem>
                      <MenuItem value='admin'>Transf. ADM</MenuItem>
                      <MenuItem value='diamond_tax'>Taxa Diamante</MenuItem>
                      </Select>
                    </FormControl> 
                </TableCell>
                <TableCell align="center"> 

                  <TextField type="date" inputProps={{ style: { height: "10px" } }} fullWidth size="small" value={filters.created_at} onChange={(event) => setFilters((values:any) => ({ ...values, created_at: event.target.value }))}/> 
                    
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
                    <TableCell>{row.type == 'sum'? '+' : '-'} {row.value}</TableCell>
                    <TableCell>{row.origin == "deposit"? "Depósito" : row.origin == "withdrawal"? "Saque" : row.origin == "subscription"? `${row.type == "sum"? `B.A.#${row.reference_id}` : 'Adesão'}` : row.origin == "tuition"? `${row.type == "sum"? `B.M.#${row.reference_id}` : 'Mensalidade'}` : row.origin == "earnings"? "Rentabilidade": row.origin == "profitability"? `B.R.#${row.reference_id}` : row.origin == "transf"? "Transf. entre contas" : row.origin == "admin"? "Transf. ADM" : row.origin == "diamond_tax"? "Taxa Diamante" : "Outros"}
                    </TableCell>
                    <TableCell>{row.created_at}</TableCell>
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
