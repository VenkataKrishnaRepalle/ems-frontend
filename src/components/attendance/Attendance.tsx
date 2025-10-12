import React, {useCallback, useEffect, useState} from "react";
import {Attendance} from "../types/types.d";
import {toast} from "react-toastify";
import useValidateToken from "../auth/ValidateToken";
import {GET_ALL_ATTENDANCE_API} from "../../api/Attendance";
import {useAppSelector} from "../../redux/hooks";
const AttendancePage: React.FC = () => {
    const [attendances, setAttendances] = useState<Attendance[]>();
    const employee = useAppSelector((state) => state.employee.employee);

    useValidateToken();

    const getAllAttendances = useCallback(async () => {
        try {
            const attendances = await GET_ALL_ATTENDANCE_API(employee?.uuid);
            setAttendances(attendances.data);
        } catch (error) {
            toast.error(error.response?.data?.errorCode)
        }
    }, []);

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