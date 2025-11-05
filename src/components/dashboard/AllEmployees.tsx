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
    CircularProgress
} from "@mui/material";
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
}

const headCells: readonly HeadCell[] = [
    {id: 'firstName', numeric: false, label: 'First Name'},
    {id: 'lastName', numeric: false, label: 'Last Name'},
    {id: 'email', numeric: false, label: 'Email'},
    {id: 'dateOfBirth', numeric: false, label: 'Date of Birth'},
    {id: 'phoneNumber', numeric: false, label: 'Phone Number'},
    {id: 'joiningDate', numeric: false, label: 'Joining Date'},
    {id: 'createdTime', numeric: false, label: 'Created Time'},
    {id: 'updatedTime', numeric: false, label: 'Updated Time'},
];

// Default sort will still use 'uuid' but it won't be displayed in the UI
const DEFAULT_SORT_FIELD: keyof EmployeeResponse = 'uuid';

const AllEmployees: React.FC = () => {
    ValidateLogin();

    const [result, setResult] = useState<EmployeePaginationResponse | null>(null);
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [sortBy, setSortBy] = useState<keyof EmployeeResponse>(DEFAULT_SORT_FIELD);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [loading, setLoading] = useState<boolean>(true);

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
                    <Table sx={{minWidth: 750}}>
                        <TableHead>
                            <TableRow>
                                {headCells.map((headCell) => (
                                    <TableCell
                                        key={headCell.id}
                                        align={headCell.numeric ? 'right' : 'left'}
                                        sortDirection={sortBy === headCell.id ? sortOrder : false}
                                        sx={{
                                            fontWeight: 'bold',
                                            backgroundColor: (theme) => theme.palette.grey[100]
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
                                        <TableCell>{employee.email || '-'}</TableCell>
                                        <TableCell>{formatDate(employee.dateOfBirth)}</TableCell>
                                        <TableCell>{employee.phoneNumber || '-'}</TableCell>
                                        <TableCell>{formatDate(employee.joiningDate)}</TableCell>
                                        <TableCell>{formatDateTime(employee.createdTime)}</TableCell>
                                        <TableCell>{formatDateTime(employee.updatedTime)}</TableCell>
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
                </TableContainer>

                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={result?.totalItems || 0}
                    rowsPerPage={size}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Rows per page:"
                    labelDisplayedRows={({from, to, count}) =>
                        `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`
                    }
                />
            </Paper>
        </Box>
    );
};

export default AllEmployees;