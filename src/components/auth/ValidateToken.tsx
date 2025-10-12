import {useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {useAppDispatch, useAppSelector} from "../../redux/hooks";
import {clearEmployee} from "../../redux/employeeSlice";
import {toast} from "react-toastify";
import {VALIDATE_TOKEN_API} from "../../api/Auth";

const useValidateToken = () => {
    const dispatch = useAppDispatch();
    const employee = useAppSelector((state) => state.employee.employee);
    const navigate = useNavigate();

    useEffect(() => {
        const validate = async () => {
            if (!employee?.uuid) {
                return;
            }

            try {
                const data = await VALIDATE_TOKEN_API(employee.uuid);
                if (data?.expired === true || data?.TOKEN_NOT_PROVIDED === true) {
                    dispatch(clearEmployee());
                    localStorage.removeItem("authentication");
                    toast.dismiss();
                    toast.success("You have been logged out successfully.");
                    navigate("/");
                }
            } catch (error) {
                dispatch(clearEmployee());
                localStorage.removeItem("authentication");
                navigate("/");
            }
        };

        validate();
    }, [employee, navigate, dispatch]);
};

export default useValidateToken;
