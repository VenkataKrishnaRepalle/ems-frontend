import React, {useCallback, useEffect, useState} from "react";
import {APPLICATION_URL, Attendance} from "../types/types.d";
import axios from "axios";
import {AuthState} from "../config/AuthContext";
import {useNavigate} from "react-router-dom";

const ATTENDANCE_PATH = `attendance/`;
const AttendancePage: React.FC = () => {
    const navigate = useNavigate();
    const {authentication} = AuthState();
    const [attendances, setAttendances] = useState<Attendance[]>();

    const validateToken = useCallback(async () => {
        try {
            if (!authentication?.accessToken || !authentication?.userId) {
                navigate("/");
                return;
            }
            const validateToken = await axios.post(APPLICATION_URL + `auth/validate-token?employeeId=${authentication.userId}`, null, {
                headers: {Authorization: authentication.accessToken},
            });
            if (validateToken.data?.expired === true || validateToken.data?.TOKEN_NOT_PROVIDED === true) {
                navigate("/");
                return;
            }
        } catch (error) {
            navigate("/")
        }
    }, [navigate, authentication?.accessToken, authentication?.userId]);
    useEffect(() => {
        validateToken();
    }, [validateToken]);

    const getAllAttendances = async () => {
        const attendances = await axios.get(APPLICATION_URL + ATTENDANCE_PATH + `get/${authentication.userId}`)
    }
    return (
        <div>
            <h1>Attendance</h1>
        </div>
    )
}

export default AttendancePage;