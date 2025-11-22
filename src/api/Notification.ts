import api from "./Api";

export const getByEmployee = async (employeeUuid: string) => {
    const response = await api.get(`/notification/${employeeUuid}`);
    return response.data;
}