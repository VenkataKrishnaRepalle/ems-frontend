import React, {useCallback, useEffect, useState} from "react";
import {ValidateLogin} from "../auth/ValidateLogin";
import {EmployeePaginationResponse, EmployeeResponse} from "../types/types.d";
import {GET_ALL_EMPLOYEES_BY_PAGINATION} from "../../api/Employee";
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    TableSortLabel,
    Typography,
    CircularProgress,
    useMediaQuery,
    useTheme,
    Grid,
    IconButton,
    Collapse
} from "@mui/material";
import {
    KeyboardArrowDown as KeyboardArrowDownIcon,
    KeyboardArrowUp as KeyboardArrowUpIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    Cake as CakeIcon,
    Event as EventIcon,
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { visuallyHidden } from '@mui/utils';

const formatDateTime = (dateString: string) => {
    if (!dateString) return '-';
    try {
        const date = parseISO(dateString);
        return format(date, 'MMM dd, yyyy hh:mm a');
    } catch (error) {
        console.error('Error formatting date:', error);
        return dateString;
    }
};

const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
        const date = parseISO(dateString);
        return format(date, 'MMM dd, yyyy');
    } catch (error) {
        console.error('Error formatting date:', error);
        return dateString;
    }
};

interface HeadCell {
    id: keyof EmployeeResponse;
    label: string;
    numeric: boolean;
    mobileOnly?: boolean;
    desktopOnly?: boolean;
    hideOnMobile?: boolean;
}

const headCells: readonly HeadCell[] = [
    {id: 'firstName', numeric: false, label: 'First Name'},
    {id: 'lastName', numeric: false, label: 'Last Name'},
    {id: 'email', numeric: false, label: 'Email', mobileOnly: true},
    {id: 'phoneNumber', numeric: false, label: 'Phone', mobileOnly: true},
    {id: 'dateOfBirth', numeric: false, label: 'DOB', desktopOnly: true},
    {id: 'joiningDate', numeric: false, label: 'Joined', desktopOnly: true},
    {id: 'createdTime', numeric: false, label: 'Created', desktopOnly: true},
    {id: 'updatedTime', numeric: false, label: 'Updated', desktopOnly: true},
];

// Default sort will still use 'uuid' but it won't be displayed in the UI
const DEFAULT_SORT_FIELD: keyof EmployeeResponse = 'uuid';

const AllEmployees: React.FC = () => {
    ValidateLogin();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
    const [result, setResult] = useState<EmployeePaginationResponse | null>(null);
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [sortBy, setSortBy] = useState<keyof EmployeeResponse>(DEFAULT_SORT_FIELD);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [loading, setLoading] = useState<boolean>(true);

    const toggleRow = (uuid: string) => {
        setExpandedRows(prev => ({
            ...prev,
            [uuid]: !prev[uuid]
        }));
    };

    const renderMobileRow = (employee: EmployeeResponse) => {
        const isExpanded = !!expandedRows[employee.uuid];
        
        return (
            <React.Fragment key={employee.uuid}>
                <TableRow 
                    hover 
                    onClick={() => toggleRow(employee.uuid)}
                    sx={{ '& > *': { borderBottom: 'unset' } }}
                >
                    <TableCell>
                        <IconButton
                            aria-label="expand row"
                            size="small"
                            onClick={() => toggleRow(employee.uuid)}
                        >
                            {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                        </IconButton>
                    </TableCell>
                    <TableCell component="th" scope="row">
                        {employee.firstName} {employee.lastName}
                    </TableCell>
                    <TableCell align="right">
                        <IconButton size="small" href={`mailto:${employee.email}`}>
                            <EmailIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" href={`tel:${employee.phoneNumber}`}>
                            <PhoneIcon fontSize="small" />
                        </IconButton>
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                            <Box sx={{ margin: 1 }}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="body2">
                                            <CakeIcon fontSize="small" color="action" sx={{ verticalAlign: 'middle', mr: 1 }} />
                                            {formatDate(employee.dateOfBirth)}
                                        </Typography>
                                        <Typography variant="body2">
                                            <EventIcon fontSize="small" color="action" sx={{ verticalAlign: 'middle', mr: 1 }} />
                                            Joined: {formatDate(employee.joiningDate)}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="caption" color="text.secondary">
                                            Created: {formatDateTime(employee.createdTime)}
                                        </Typography>
                                        <br />
                                        <Typography variant="caption" color="text.secondary">
                                            Updated: {formatDateTime(employee.updatedTime)}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Collapse>
                    </TableCell>
                </TableRow>
            </React.Fragment>
        );
    };

    const getAllEmployees = useCallback(async () => {
        try {
            setLoading(true);
            const response = await GET_ALL_EMPLOYEES_BY_PAGINATION(
                page + 1,
                size,
                sortBy,
                sortOrder
            );
            console.log('API Response:', response);
            if (response) {
                setResult(response);
            } else {
                console.error('Empty response received');
                setResult({data: [], currentPage: 0, totalItems: 0, totalPages: 0});
            }
        } catch (error) {
            console.error('Error fetching employees:', error);
        } finally {
            setLoading(false);
        }
    }, [page, size, sortBy, sortOrder]);

    useEffect(() => {
        getAllEmployees();
    }, [getAllEmployees]);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSize(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleRequestSort = (property: keyof EmployeeResponse | 'dateOfBirth') => {
        const isAsc = sortBy === property && sortOrder === 'asc';
        setSortOrder(isAsc ? 'desc' : 'asc');
        setSortBy(property);
        setPage(0);
    };

    return (
        <Box sx={{width: '100%'}}>
            <Paper sx={{width: '100%', mb: 2, p: 2}}>
                <Typography
                    variant="h5"
                    component="h2"
                    sx={{
                        p: 2,
                        fontWeight: 'bold',
                        mb: 2
                    }}
                >
                    Employees
                </Typography>

                <TableContainer>
                    {isMobile ? (
                        <Table size="small" aria-label="collapsible table">
                            <TableHead>
                                <TableRow>
                                    <TableCell />
                                    <TableCell>Name</TableCell>
                                    <TableCell align="right">Contact</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={3} align="center" sx={{py: 3}}>
                                            <CircularProgress size={24} />
                                        </TableCell>
                                    </TableRow>
                                ) : result?.data?.length > 0 ? (
                                    result.data.map(employee => renderMobileRow(employee))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={3} align="center" sx={{py: 3}}>
                                            {result ? 'No employees found' : 'Error loading employees'}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    ) : (
                        <Table sx={{ minWidth: 750 }}>
                            <TableHead>
                                <TableRow>
                                    {headCells.map((headCell) => (
                                        <TableCell
                                            key={headCell.id}
                                            align={headCell.numeric ? 'right' : 'left'}
                                            sortDirection={sortBy === headCell.id ? sortOrder : false}
                                            sx={{
                                                fontWeight: 'bold',
                                                backgroundColor: (theme) => theme.palette.grey[100],
                                                display: {
                                                    xs: headCell.desktopOnly ? 'none' : 'table-cell',
                                                    sm: 'table-cell'
                                                }
                                            }}
                                        >
                                            <TableSortLabel
                                                active={sortBy === headCell.id}
                                                direction={sortBy === headCell.id ? sortOrder : 'asc'}
                                                onClick={() => handleRequestSort(headCell.id)}
                                                sx={{
                                                    '&.Mui-active': {
                                                        color: sortOrder === 'asc' ? 'success.main' : 'error.main',
                                                        '& .MuiTableSortLabel-icon': {
                                                            color: sortOrder === 'asc' ? 'success.main' : 'error.main',
                                                        },
                                                    },
                                                    '&:hover': {
                                                        color: 'primary.main',
                                                    },
                                                }}
                                            >
                                                {headCell.label}
                                                {sortBy === headCell.id ? (
                                                    <Box component="span" sx={visuallyHidden}>
                                                        {sortOrder === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                                    </Box>
                                                ) : null}
                                            </TableSortLabel>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={headCells.length} align="center" sx={{py: 3}}>
                                            <CircularProgress/>
                                        </TableCell>
                                    </TableRow>
                                ) : result?.data?.length > 0 ? (
                                    result.data.map((employee) => (
                                        <TableRow hover key={employee.uuid}>
                                            <TableCell>{employee.firstName || '-'}</TableCell>
                                            <TableCell>{employee.lastName || '-'}</TableCell>
                                            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                                                {employee.email || '-'}
                                            </TableCell>
                                            <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                                                {employee.phoneNumber || '-'}
                                            </TableCell>
                                            <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
                                                {formatDate(employee.dateOfBirth)}
                                            </TableCell>
                                            <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
                                                {formatDate(employee.joiningDate)}
                                            </TableCell>
                                            <TableCell sx={{ display: { xs: 'none', xl: 'table-cell' } }}>
                                                {formatDateTime(employee.createdTime)}
                                            </TableCell>
                                            <TableCell sx={{ display: { xs: 'none', xl: 'table-cell' } }}>
                                                {formatDateTime(employee.updatedTime)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={headCells.length} align="center" sx={{py: 3}}>
                                            {result ? 'No employees found' : 'Error loading employees'}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </TableContainer>

                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={result?.totalItems || 0}
                    rowsPerPage={size}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Rows:"
                    labelDisplayedRows={({ from, to, count }) =>
                        isMobile 
                            ? `${from}-${to} of ${count}` 
                            : `Showing ${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`
                    }
                    sx={{
                        '& .MuiTablePagination-toolbar': {
                            flexWrap: 'wrap',
                            justifyContent: 'center',
                            '& .MuiTablePagination-actions': {
                                margin: 0,
                                '& button': {
                                    padding: '6px',
                                    margin: '0 4px'
                                }
                            },
                            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                                margin: '8px 0',
                                fontSize: '0.875rem'
                            },
                            '& .MuiTablePagination-select': {
                                margin: '0 8px',
                                padding: '4px 8px'
                            },
                            '& .MuiInputBase-root': {
                                marginRight: '16px'
                            }
                        },
                        '& .MuiTablePagination-spacer': {
                            flex: '0 1 100%',
                            height: '8px'
                        }
                    }}
                />
            </Paper>
        </Box>
    );
};

export default AllEmployees;