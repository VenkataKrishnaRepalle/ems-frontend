import {ForgotPasswordRequest, Login, ResetPasswordRequest} from "../components/types/types.d";
import api from "./Api";

export const LOGIN_API = async (login: Login) => {
    const response = await api.post("/auth/login", login);
    return response.data;
}

export const VALIDATE_TOKEN_API = async (userId: string) => {
    const response = await api.post(`auth/validate-token?employeeId=${userId}`);
    return response.data;
}

export const VERIFY_EMAIL_API = async (email: string) => {
    const response = await api.post(`/auth/verify-email?email=${email}`);
    return response.data;
}

export const SEND_OTP_API = async (email: string, type: string) => {
    const response = await api.post(`/otp/sendOtp?email=${email}&type=${type}`);
    return response.data;
}

export const FORGOT_PASSWORD_API = async (forgotPassword: ForgotPasswordRequest) => {
    const response = await api.post("/password/forgotPassword", forgotPassword);
    return response.data;
}

export const RESET_PASSWORD_API = async (resetPassword: ResetPasswordRequest) => {
    const response = await api.post("/password/resetPassword", resetPassword);
    return response.data;
}