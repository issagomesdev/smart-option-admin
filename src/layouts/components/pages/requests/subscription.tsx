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
import { subscription } from "src/services/requests.service";
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

interface Data {
  id: number,
  user_id: string,
  user: string,
  product_id: string,
  product: string,
  value: string,
  reference_id: string,
  status: string,
  transaction_id: string,
  created_at: string,
}

type Plans = 'bronze' | 'silver' | 'gold' | 'without';

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
    id: 'product',
    numeric: true,
    disablePadding: false,
    label: 'Plano',
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

function EnhancedTableToolbar() {
  return (
    <Toolbar>
    <Typography variant="h6">
        Solicitações de Adesão
    </Typography>
    </Toolbar>
  );
}

interface ExtractProps {
    userID?: string|null;
    sx:any
}

export const Subscription: React.FC<ExtractProps> = ({ userID = null, sx }) => {
  const [order, setOrder] = React.useState<Order>('asc');
  const [orderBy, setOrderBy] = React.useState<keyof Data>('id');
  const [selected, setSelected] = React.useState<readonly number[]>([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [rows, setRows] = React.useState<Data[]>([]);
  const [actions, setActions] = React.useState<null | HTMLElement>(null);
  const [isEmpty, setIsEmpty] = React.useState<boolean>(false); 
  const [id, setId] = React.useState<any>({}); 
  const router = useRouter();
  const { token } = useAuth();

  useEffect(() => {

    subscription(userID, token()).then(data => {
       console.log(data);

       const res = data.data.map(function(data:any) {
        return {id: data.id, user_id: data.user_id, user: data.name, product: data.product, product_id: data.product_id, value: data.value, reference_id: data.reference_id, status: data.status, transaction_id: data.transaction_id, created_at: data.created_at};
      });
      if(res.length <= 0) setIsEmpty(true);
      else setRows(res);
      
    }).catch(error => console.error(error));

  }, []);

  

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
    return <Box sx={{ width: '100%',  marginY: '1em', flexGrow: 1 }}>
    <Box sx={{ width: '100%', marginY: '1em' }}>
      <Typography variant="subtitle1" sx={{textAlign: 'center'}}> Não há registros de solicitações de adesão no momento </Typography>
    </Box>
    </Box>
  }

  return (
    <Box sx={{ width: '100%' }}>
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
                    <TableCell> 
                    <Box
                    bgcolor={DefaultPalette(themeConfig.mode, 'primary').customColors[row.product as Plans]}
                    borderRadius={16}
                    textAlign="center"
                    width={100}
                    color="white">
                      {row.product}
                    </Box>
                  </TableCell>
                    <TableCell>{row.value}</TableCell>
                    <TableCell>{row.status == "PENDING"? "Pendente" : row.status == "AUTHORIZED"? "Pre-Autorizado" : row.status == "PAID"? "Concluído" : row.status == "IN_ANALYSIS"? "Em análise" : row.status == "DECLINED"? "Recusado" : row.status == "CANCELED"? "Cancelado" : "Pendente"}</TableCell>
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
