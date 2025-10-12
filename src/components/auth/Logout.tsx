import { useEffect } from "react";
import { useAppDispatch } from "../../redux/hooks";
import { clearEmployee } from "../../redux/employeeSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { LOGOUT_API } from "../../api/Auth";

const Logout = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        const performLogout = async () => {
            try {
                const logout = await LOGOUT_API();
                if (logout) {
                    dispatch(clearEmployee());
                    toast.dismiss();
                    toast.success("You have been logged out successfully.");
                    navigate("/");
                } else {
                    toast.error("Failed to logout. Please try again.");
                }
            } catch (error) {
                dispatch(clearEmployee());
                toast.dismiss();
                toast.warning("Session cleared locally.");
                navigate("/");
            }
        };

        performLogout();
    }, [dispatch, navigate]);

    return null;
};

export default Logout;