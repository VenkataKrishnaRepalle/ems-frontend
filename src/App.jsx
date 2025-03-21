import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css';
import {Route, Routes} from "react-router-dom";
import Login from "./components/login/Login";
import Dashboard from "./components/dashboard/Dashboard";
import Register from "./components/register/Register";
import Logout from "./components/login/Logout";
import TeamView from "./components/team-view/TeamView";
import {ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Review from "./components/review/Review";

function App() {
    return (
        <div className="App">
            <ToastContainer/>
            <Routes>
                <Route exact path={"/"} element={<Login/>}/>
                <Route path={"/dashboard"} element={<Dashboard/>}/>
                <Route path={"/register"} element={<Register/>}/>
                <Route path={"/team-view"} element={<TeamView/>}/>
                <Route path={"/logout"} element={<Logout/>}/>
                <Route path={"/review/:reviewType/reviewUuid/:employeePeriodUuid"} element={<Review/>}/>
            </Routes>
        </div>
    );
}

export default App;