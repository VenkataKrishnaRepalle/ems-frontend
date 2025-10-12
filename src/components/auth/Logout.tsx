import { useEffect } from "react";
import { useAppDispatch } from "../../redux/hooks";
import { clearEmployee } from "../../redux/employeeSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Logout = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        dispatch(clearEmployee());
        toast.dismiss();
        toast.success("You have been logged out successfully.");
        navigate("/");
    }, [dispatch, navigate]);

    return null;
};

export default Logout;