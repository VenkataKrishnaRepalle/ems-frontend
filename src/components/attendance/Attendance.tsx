import React, {useCallback, useEffect, useState} from "react";
import {Attendance} from "../types/types.d";
import {toast} from "react-toastify";
import {GET_ALL_ATTENDANCE_API} from "../../api/Attendance";
import {useAppSelector} from "../../redux/hooks";
import {ValidateLogin} from "../auth/ValidateLogin";
const AttendancePage: React.FC = () => {
    ValidateLogin();
    const [attendances, setAttendances] = useState<Attendance[]>();
    const employee = useAppSelector((state) => state.employee.employee);

    const getAllAttendances = useCallback(async () => {
        try {
            const uuid = employee?.uuid;
            const attendances = await GET_ALL_ATTENDANCE_API(uuid);
            setAttendances(attendances.data);
        } catch (error) {
            toast.error(error.response?.data?.errorCode)
        }
    }, [employee?.uuid]);

    useEffect(() => {
        if(employee && employee.uuid) {
            getAllAttendances();
        }
    }, [employee, getAllAttendances]);

    return (
        <div>
            <h1>Attendance</h1>
        </div>
    )
}

export default AttendancePage;