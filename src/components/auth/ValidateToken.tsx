// src/hooks/useValidateToken.ts
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthState } from "../config/AuthContext";
import axios from "axios";
import { APPLICATION_URL } from "../types/types.d";

const useValidateToken = () => {
    const { authentication } = AuthState();
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
