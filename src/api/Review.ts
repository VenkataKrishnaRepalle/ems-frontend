import api from "./Api";
import {Review} from "../components/types/types.d";

export const ADD_REVIEW_API = async (userId: string, review: Review) => {
    const response = await api.post(`/review/add/${userId}`, review);
    return response;
};
