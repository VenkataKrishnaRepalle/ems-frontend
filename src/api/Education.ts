import api from "./Api";
import {Education} from "../components/types/types.d";

export const GET_ALL_EDUCATIONS = async (userId: string) => {
    const response = await api.get(`/education/getAll/${userId}`);
    return response.data as Education[];
};

export const ADD_EDUCATION = async (education: Partial<Education>) => {
    const response = await api.post(`/education/add`, education);
    return response.data as Education;
};

export const UPDATE_EDUCATION = async (uuid: string, education: Partial<Education>) => {
    const response = await api.put(`/education/update/${uuid}`, education);
    return response.data as Education;
};

export const DELETE_EDUCATION = async (uuid: string) => {
    const response = await api.delete(`/education/delete/${uuid}`);
    return response.data;
}