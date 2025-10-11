import api from "./Api";
import {Employee, EmployeeRequest, Manager} from "../components/types/types.d";

export const ME_API = async () => {
    const response = await api.get("/employee/me");
    return response.data as Employee;
};

export const GET_ACTIVE_MANAGERS =async() => {
    const response = await api.get("/employee/active-managers");
    return response.data as Manager[];
};

export const ADD_EMPLOYEE = async (employee: EmployeeRequest) => {
    const response = await api.post("/employee/add", employee);
    return response.data;
}