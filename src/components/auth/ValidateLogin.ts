import {useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {useAppDispatch} from "../../redux/hooks";
import {ME_API} from "../../api/Employee";
import {REFRESH_TOKEN_API, VALIDATE_TOKEN_API} from "../../api/Auth";
import {toast} from "react-toastify";
import {clearEmployee, setEmployee} from "../../redux/employeeSlice";

export const ValidateLogin = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    useEffect(() => {
        const validateAndRefresh = async () => {
            try {
                const refreshToken = await VALIDATE_TOKEN_API();
                console.log(refreshToken);
                if (refreshToken?.tokenActive === false && refreshToken.refreshTokenActive === false) {
                    dispatch(clearEmployee());
                    navigate("/logout");
                    toast.error("Session expired. Please login again.");
                } else if (refreshToken?.tokenActive === true) {
                    const me = await ME_API();
                    dispatch(setEmployee(me));
                } else if (refreshToken?.refreshTokenActive === true) {
                    const refreshToken = await REFRESH_TOKEN_API();
                    dispatch(setEmployee(refreshToken));
                } else {
                    navigate("/logout");
                }
            } catch (error) {
                navigate("/logout");
            }
        };

        validateAndRefresh();
    }, [navigate, dispatch]);
};
