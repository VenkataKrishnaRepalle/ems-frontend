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
import {useAppSelector} from "./redux/hooks";
import Profile from "./components/profile/profile";
import Education from "./components/education/Education";
import Attendance from "./components/attendance/Attendance";
import ForgotPassword from "./components/auth/ForgotPassword";
import ResetPassword from "./components/auth/ResetPassword";
import LoginLimitExceedPage from "./components/auth/LoginLimitExceedPage";
import TeamView from "./components/team-view/TeamView";
import AllEmployees from "./components/dashboard/AllEmployees";
import NotificationCom from "./components/notification/Notification";

const App: React.FC = () => {
    const employee = useAppSelector((state) => state.employee.employee);

    return (
        <div className="App">
            <ToastContainer/>
            {employee && employee.uuid && <Header role="search"/>}
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
                <Route path={"/team-view"} element={<TeamView/>}/>
                <Route path={"/all-employees"} element={<AllEmployees/>}/>
                <Route path={"/notifications"} element={<NotificationCom/>}/>
            </Routes>
        </div>
    );
};

export default App;