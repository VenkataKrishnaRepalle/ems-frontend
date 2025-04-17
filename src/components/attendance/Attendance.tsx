import React, {useCallback, useEffect, useState} from "react";
import {APPLICATION_URL, Attendance} from "../types/types.d";
import axios from "axios";
import {AuthState} from "../config/AuthContext";
import ValidateToken from "../auth/ValidateToken";
import {toast} from "react-toastify";

const ATTENDANCE_PATH = `attendance/`;
const AttendancePage: React.FC = () => {
    const {authentication} = AuthState();
    const [attendances, setAttendances] = useState<Attendance[]>();

    ValidateToken();

    const getAllAttendances = useCallback(async () => {
        try {
            const attendances = await axios.get(APPLICATION_URL + ATTENDANCE_PATH + `get/${authentication.userId}`, {
                headers: {
                    Authorization: `${authentication.accessToken}`,
                }
            });
            setAttendances(attendances.data);
        } catch (error) {
            toast.error(error.response?.data?.errorCode)
        }
    }, [authentication.userId, authentication.accessToken]);

    useEffect(() => {
        getAllAttendances();
    }, [getAllAttendances]);

    return (
        <div>
            <h1>Attendance</h1>
        </div>
    )
}

export default AttendancePage;