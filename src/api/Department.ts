import api from "./Api";
import {Department} from "../components/types/types.d";

export const GET_ALL_DEPARTMENTS_API = async () => {
    const response = await api.get("/department/getAll");
    return response.data as Department[];
}