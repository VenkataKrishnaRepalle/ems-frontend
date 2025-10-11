import * as React from "react";
import './App.css';
import {Route, Routes} from "react-router-dom";
import Login from "./components/auth/Login";
import Dashboard from "./components/dashboard/Dashboard";
import Register from "./components/register/Register";
import Logout from "./components/auth/Logout";
import {ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Review from "./components/review/Review";
import Header from "./components/header/Header";
import {AuthState} from "./components/config/AuthContext";
import Profile from "./components/profile/profile";
import Education from "./components/education/Education";
import Attendance from "./components/attendance/Attendance";
import ForgotPassword from "./components/auth/ForgotPassword";
import ResetPassword from "./components/auth/ResetPassword";
import LoginLimitExceedPage from "./components/auth/LoginLimitExceedPage";

const App: React.FC = () => {
    const {authentication} = AuthState();

    return (
        <div className="App">
            <ToastContainer/>
            {authentication && authentication.userId && <Header role="search"/>}
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