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
import { AuthProvider } from "./auth/AuthContext";
import { RequireAuth } from "./auth/RequireAuth";

const App: React.FC = () => {
    const employee = useAppSelector((state) => state.employee.employee);

    return (
        <AuthProvider>
            <div className="App">
                <ToastContainer/>
                {employee && employee.uuid && <Header role="search"/>}
                <Routes>
                    <Route path="/" element={<Login/>}/>
                    <Route path="/logout" element={<Logout/>}/>
                    <Route path="/forgot-password" element={<ForgotPassword/>}/>
                    <Route path="/reset-password" element={<ResetPassword/>}/>
                    <Route path={"/sessions"} element={<LoginLimitExceedPage/>}/>

                    <Route path="/profile" element={<RequireAuth><Profile/></RequireAuth>}/>
                    <Route path="/dashboard" element={<RequireAuth><Dashboard/></RequireAuth>}/>
                    <Route path="/register" element={<RequireAuth><Register/></RequireAuth>}/>
                    <Route path="/education" element={<RequireAuth><Education/></RequireAuth>}/>
                    <Route path="/attendance" element={<RequireAuth><Attendance/></RequireAuth>}/>
                    <Route path="/review/:reviewType/reviewUuid/:employeePeriodUuid" element={<RequireAuth><Review/></RequireAuth>}/>
                    <Route path={"/team-view"} element={<RequireAuth><TeamView/></RequireAuth>}/>
                    <Route path={"/all-employees"} element={<RequireAuth><AllEmployees/></RequireAuth>}/>
                    <Route path={"/notifications"} element={<RequireAuth><NotificationCom/></RequireAuth>}/>
                </Routes>
            </div>
        </AuthProvider>
    );
};

export default App;
