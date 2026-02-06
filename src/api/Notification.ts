import api from "./Api";

export const GET_NOTIFICATIONS_BY_EMPLOYEE = async (employeeUuid: string) => {
    const response = await api.get(`/notification/${employeeUuid}`);
    return response.data;
};

export const GET_NOTIFICATION_BY_EMPLOYEE_PAGINATION = async (employeeUuid: string) => {
    const response = await api.get(`notification/get-by-employee/${employeeUuid}/status?statuses=READ&statuses=UNREAD&page=0`);
    return response.data;
};

export const GET_NOTIFICATIONS_COUNT = async (employeeUuid: string) => {
    const response = await api.get(`/notification/get-count/${employeeUuid}`);
    return response.data;
};

export const UPDATE_NOTIFICATION_BY_ID = async (id: string, status: string) => {
    const response = await api.put(`/notification/update/${id}/status/${status}`);
    return response.data;
};

export const UPDATE_NOTIFICATION_BY_EMPLOYEE = async (employeeUuid: string, status: string) => {
    const response = await api.put(`/notification/updateByEmployee/${employeeUuid}/status/${status}`);
    return response.data;
};

export const DELETE_NOTIFICATION_BY_ID = async (id: string) => {
    await api.delete(`/notification/delete/${id}`);
};

export const DELETE_NOTIFICATION_BY_EMPLOYEE = async (id: string) => {
    await api.delete(`/notification/delete-by-employee/${id}`);
};