import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Employee } from '../components/types/types.d';
import { ME_API } from '../api/Employee';

interface EmployeeState {
    employee: Employee | null;
    loading: boolean;
}

const initialState: EmployeeState = {
    employee: null,
    loading: false,
};

// Async thunk for checking authentication
export const checkAuth = createAsyncThunk(
    'employee/checkAuth',
    async (_, { rejectWithValue }) => {
        try {
            const response = await ME_API();
            return response;
        } catch (error) {
            return rejectWithValue(null);
        }
    }
);

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
    extraReducers: (builder) => {
        builder
            .addCase(checkAuth.pending, (state) => {
                state.loading = true;
            })
            .addCase(checkAuth.fulfilled, (state, action) => {
                state.employee = action.payload;
                state.loading = false;
            })
            .addCase(checkAuth.rejected, (state) => {
                state.employee = null;
                state.loading = false;
            });
    },
});

export const { setEmployee, clearEmployee, setLoading } = employeeSlice.actions;
export default employeeSlice.reducer;
