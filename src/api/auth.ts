import {Login} from "../components/types/types.d";
import api from "./api";

export const LOGIN_API = async (login: Login) => {
    const response = await api.post("/auth/login", login);
    return response.data;
}

