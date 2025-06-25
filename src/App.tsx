import * as React from "react";
import {useEffect, useState} from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import {Route, Routes, useNavigate} from "react-router-dom";
import Login from "./components/auth/Login";
import Dashboard from "./components/dashboard/Dashboard";
import Register from "./components/register/Register";
import Logout from "./components/auth/Logout";
import {toast, ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Review from "./components/review/Review";
import Header from "./components/header/Header";
import {AuthState} from "./components/config/AuthContext";
import Profile from "./components/profile/profile";
import Education from "./components/education/Education";
import Attendance from "./components/attendance/Attendance";
import ForgotPassword from "./components/auth/ForgotPassword";
import ResetPassword from "./components/auth/ResetPassword";
import {VALIDATE_TOKEN_API} from "./api/Auth";
import LoginLimitExceedPage from "./components/auth/LoginLimitExceedPage";

const App: React.FC = () => {
    const {authentication, setAuthentication} = AuthState();
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

    useEffect(() => {
        const validate = async () => {
            try {
                if (!authentication?.accessToken || !authentication?.userId) {
                    setIsLoggedIn(false);
                    navigate("/");
                    return;
                }

                const data = await VALIDATE_TOKEN_API(authentication.userId);
                if (data?.expired || data?.TOKEN_NOT_PROVIDED) {
                    setAuthentication(null);
                    localStorage.removeItem("authentication");
                    toast.dismiss();
                    setIsLoggedIn(false);
                    navigate("/");
                } else if (!data?.expired && authentication?.userId) {
                    setIsLoggedIn(true);
                }
            } catch (error) {
                console.error("Validation error:", error);
                setIsLoggedIn(false);
                navigate("/");
            }
        };

        validate();
    }, [authentication, navigate, setAuthentication]);

    return (
        <div className="App">
            <ToastContainer/>
            {isLoggedIn && <Header role="search"/>}
            <Routes>
                <Route path="/" element={<Login/>}/>
                <Route path="/profile" element={<Profile/>}/>
                <Route path="/dashboard" element={<Dashboard/>}/>
                <Route path="/register" element={<Register/>}/>
                <Route path="/education" element={<Education/>}/>
                <Route path="/attendance" element={<Attendance/>}/>
                <Route path="/logout" element={<Logout/>}/>
                <Route path="/review/:reviewType/reviewUuid/:employeePeriodUuid" element={<Review/>}/>
                <Route path="/forgot-password" element={<ForgotPassword/>}/>
                <Route path="/reset-password" element={<ResetPassword/>}/>
                <Route path={"/sessions"} element={<LoginLimitExceedPage/>}/>
            </Routes>
        </div>
    );
};

export default App;