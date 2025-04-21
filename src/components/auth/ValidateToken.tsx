import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthState } from "../config/AuthContext";
import axios from "axios";
import { APPLICATION_URL } from "../types/types.d";
import {toast} from "react-toastify";

const useValidateToken = () => {
    const { authentication } = AuthState();
    const { setAuthentication } = AuthState();
    const navigate = useNavigate();

    useEffect(() => {
        const validate = async () => {
            try {
                if (!authentication?.accessToken || !authentication?.userId) {
                    navigate("/");
                    return;
                }

                const response = await axios.post(
                    `${APPLICATION_URL}auth/validate-token?employeeId=${authentication.userId}`,
                    null,
                    {
                        headers: {
                            Authorization: authentication.accessToken,
                        },
                    }
                );

                const data = response.data;
                if (data?.expired === true || data?.TOKEN_NOT_PROVIDED === true) {
                    setAuthentication(null);
                    localStorage.removeItem("authentication");
                    toast.dismiss();
                    toast.success("You have been logged out successfully.");
                    navigate("/");
                }
            } catch (error) {
                navigate("/");
            }
        };

        validate();
    }, [authentication, navigate]);
};

export default useValidateToken;
