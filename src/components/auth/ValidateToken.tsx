import {useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {AuthState} from "../config/AuthContext";
import {toast} from "react-toastify";
import {VALIDATE_TOKEN_API} from "../../api/Auth";

const useValidateToken = () => {
    const {authentication, setAuthentication} = AuthState();
    const navigate = useNavigate();

    useEffect(() => {
        const validate = async () => {
            if (!authentication?.userId) {
                return;
            }

            try {
                const data = await VALIDATE_TOKEN_API(authentication.userId);
                if (data?.expired === true || data?.TOKEN_NOT_PROVIDED === true) {
                    setAuthentication(null);
                    localStorage.removeItem("authentication");
                    toast.dismiss();
                    toast.success("You have been logged out successfully.");
                    navigate("/");
                }
            } catch (error) {
                setAuthentication(null);
                localStorage.removeItem("authentication");
                navigate("/");
            }
        };

        validate();
    }, [authentication, navigate, setAuthentication]);
};

export default useValidateToken;
