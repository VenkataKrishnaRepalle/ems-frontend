import api from "./Api";

export const GET_ALL_ATTENDANCE_API = async (userId: string) => {
    const response = await api.get(`/attendance/get/${userId}`);
    return response.data;
};
