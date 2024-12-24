import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css';
import {Route, Routes} from "react-router-dom";
import Login from "./components/login/Login";
import Dashboard from "./components/dashboard/Dashboard";

function App() {
    return (
        <div className="App">
            <Routes>
                <Route exact path="/" element={<Login/>}/>
                <Route path="/dashboard" element={<Dashboard/>}/>
            </Routes>
        </div>
    );
}

export default App;