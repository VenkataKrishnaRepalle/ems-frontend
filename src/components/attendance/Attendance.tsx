import React, {useCallback, useEffect, useState} from "react";
import {APPLICATION_URL, Attendance} from "../types/types.d";
import axios from "axios";
import {AuthState} from "../config/AuthContext";
import {toast} from "react-toastify";
import useValidateToken from "../auth/ValidateToken";

const ATTENDANCE_PATH = `attendance/`;
const AttendancePage: React.FC = () => {
    const {authentication} = AuthState();
    const [attendances, setAttendances] = useState<Attendance[]>();

    useValidateToken();

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