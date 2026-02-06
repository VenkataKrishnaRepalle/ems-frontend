import {useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {toast} from "react-toastify";
import { useAuth } from "../../auth/AuthContext";

const Logout = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    useEffect(() => {
        const performLogout = async () => {
            try {
                toast.dismiss();
                toast.success("You have been logged out successfully.");
                logout();
                navigate("/");

            } catch (error) {
                toast.dismiss();
                toast.warning("Session cleared locally.");
                navigate("/");
            }
        };

        performLogout();
    }, [logout, navigate]);

    return null;
};

export default Logout;
