import api from "./Api";
import {Employee, EmployeePaginationResponse, EmployeeRequest, FullTeam, Manager} from "../components/types/types.d";

export const ME_API = async () => {
    const response = await api.get("/employee/me");
    return response.data as Employee;
};

export const GET_ACTIVE_MANAGERS = async () => {
    const response = await api.get("/employee/active-managers");
    return response.data as Manager[];
};

export const ADD_EMPLOYEE = async (employee: EmployeeRequest) => {
    const response = await api.post("/employee/add", employee);
    return response.data;
}

export const GET_FULL_TEAM_API = async (employeeId: string) => {
    const response = await api.get(`/employee/getFullTeam/${employeeId}`);
    return response.data as FullTeam;
}

export const GET_EMPLOYEES_BY_MANAGER_API = async (employeeId: string) => {
    const response = await api.get(`/employee/getByManagerId/${employeeId}`);
    return response.data as Employee[];
}

export const GET_ALL_EMPLOYEES_BY_PAGINATION = async (page?: number, size?: number, sortBy?: string, sortOrder?: string) => {
    const params = new URLSearchParams();
    
    if (page !== undefined && page > 0) params.append('page', page.toString());
    if (size !== undefined && size > 0) params.append('size', size.toString());
    if (sortBy) params.append('sortBy', sortBy);
    if (sortOrder) params.append('sortOrder', sortOrder);
    
    const queryString = params.toString();
    const url = `/employee/getAll/pagination${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get(url);
    return response.data as EmployeePaginationResponse;
}
