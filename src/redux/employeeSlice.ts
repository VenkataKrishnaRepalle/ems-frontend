import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Employee } from '../components/types/types.d';

interface EmployeeState {
    employee: Employee | null;
    loading: boolean;
}

const initialState: EmployeeState = {
    employee: null,
    loading: false,
};

const employeeSlice = createSlice({
    name: 'employee',
    initialState,
    reducers: {
        setEmployee: (state, action: PayloadAction<Employee>) => {
            state.employee = action.payload;
        },
        clearEmployee: (state) => {
            state.employee = null;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
    },
});

export const { setEmployee, clearEmployee, setLoading } = employeeSlice.actions;
export default employeeSlice.reducer;
