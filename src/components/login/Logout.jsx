import {AuthState} from "../config/AuthContext";
import {useNavigate} from "react-router-dom";
import {toast} from "react-toastify";

const Logout = () => {
    const {setAuthentication} = AuthState();
    const navigate = useNavigate();

    setAuthentication(null);
    localStorage.removeItem('authentication');
    toast.dismiss();
    toast.success('You have been logged out successfully.');
    navigate("/");
}

export default Logout;