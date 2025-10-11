import api from "./Api";

export const ADD_REVIEW_API = async (userId: string, review: any) => {
    const response = await api.post(`/review/add/${userId}`, review);
    return response;
};
