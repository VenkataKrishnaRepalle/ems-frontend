import {useCallback, useEffect, useState} from "react";
import axios from "axios";
import {APPLICATION_URL} from "../types/types.d";
import {useNavigate} from "react-router-dom";
import {AuthState} from "../config/AuthContext";
import FullPageLoader from "../Loader/FullPageLoader";

const ValidateToken: () => void = () => {
    const navigate = useNavigate();
    const {authentication} = AuthState();
    const [loading, setLoading] = useState(false);

    const validateToken = useCallback(async () => {
        setLoading(true);
        try {
            if (!authentication?.accessToken || !authentication?.userId) {
                navigate("/");
                return;
            }
            const validateToken = await axios.post(APPLICATION_URL + `auth/validate-token?employeeId=${authentication.userId}`, null, {
                headers: {Authorization: authentication.accessToken},
            });
            if (validateToken.data?.expired === false) {
                navigate("/dashboard");
            } else if (validateToken.data?.expired === true || validateToken.data?.TOKEN_NOT_PROVIDED === true) {
                navigate("/");
                return;
            }
        } catch (error) {
            navigate("/")
        } finally {
            setLoading(false);
        }
    }, [navigate, authentication?.accessToken, authentication?.userId]);
    useEffect(() => {
        validateToken();
    }, [validateToken]);
    return (
        <>
            <FullPageLoader loading={loading}/>
        </>
    )
}

export default ValidateToken;