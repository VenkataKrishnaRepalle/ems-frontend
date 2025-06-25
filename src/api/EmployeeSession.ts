import api from "./Api";
import {EmployeeSession} from "../components/types/types.d";

export const GET_EMPLOYEE_SESSION = async (email: string, isActive: boolean): Promise<Map<string, EmployeeSession[]>> => {
    const response = await api.get(`/employeeSession/get/${email}?isActive=${isActive}`);

    const data = response.data;
    return new Map<string, EmployeeSession[]>(
        Object.entries(data) as [string, EmployeeSession[]][]
    );
};

export const DELETE_EMPLOYEE_SESSION = async (uuid: string): Promise<void> => {
    await api.delete(`/employeeSession/delete/${uuid}`);
}