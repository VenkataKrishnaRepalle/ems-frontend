import * as React from "react";
import {useEffect, useState} from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
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

const App: React.FC = () => {
    const {authentication} = AuthState();
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

    useEffect(() => {
        setIsLoggedIn(!!authentication?.accessToken);
    }, [authentication]);

    return (
        <div className="App">
            <ToastContainer/>
            {isLoggedIn && <Header role={"search"}/>}
            <Routes>
                <Route path="/" element={<Login/>}/>
                <Route path="/profile" element={<Profile/>}/>
                <Route path="/dashboard" element={<Dashboard/>}/>
                <Route path="/register" element={<Register/>}/>
                <Route path="/education" element={<Education/>}/>
                <Route path="/attendance" element={<Attendance/>}/>
                {/*<Route path="/team-view" element={<TeamView />} />*/}
                <Route path="/logout" element={<Logout/>}/>
                <Route path="/review/:reviewType/reviewUuid/:employeePeriodUuid" element={<Review/>}/>
            </Routes>
        </div>
    );
};

export default App;
