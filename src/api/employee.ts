import api from "./api";
import {Employee} from "../components/types/types.d";

export const ME_API = async () => {
    const response = await api.get("/employee/me");
    return response.data as Employee;
};