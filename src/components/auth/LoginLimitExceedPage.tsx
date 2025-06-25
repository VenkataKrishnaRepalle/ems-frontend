import React, {useEffect, useState} from "react";
import {useNavigate, useLocation} from "react-router-dom";
import {DELETE_EMPLOYEE_SESSION, GET_EMPLOYEE_SESSION} from "../../api/EmployeeSession";
import {Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@mui/material";
import {toast} from "react-toastify";
import {EmployeeSession} from "../types/types.d";

const LoginLimitExceedPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const {maxLoginAttempts, email} = location.state || {};

    const [employeeSessions, setEmployeeSessions] = useState<EmployeeSession[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        setIsLoading(true);
        const fetchEmployeeSession = async () => {
            if (!maxLoginAttempts || !email) {
                navigate("/");
                return;
            }

            try {
                const response = await GET_EMPLOYEE_SESSION(email, true);
                if (response !== null && response.get("active")?.length > 0) {
                    setEmployeeSessions(response.get("active"));
                }
            } catch (error) {
            } finally {
                setIsLoading(false);
            }
        };

        fetchEmployeeSession();
    }, [maxLoginAttempts, email, navigate]);

    const handleDeleteSession = (uuid: string) => async () => {
        try {
            await DELETE_EMPLOYEE_SESSION(uuid);
            toast.success("Session deleted successfully.");
            setEmployeeSessions((prevSessions) =>
                prevSessions.filter((session) => session.uuid !== uuid)
            );
        } catch (error) {
            console.error("Error deleting session:", error);
            toast.error("Failed to delete session. Please try again.");
        }
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <TableContainer component={Paper}>
            <Table sx={{minWidth: 650}} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell>Browser Name</TableCell>
                        <TableCell align="right">Os Name</TableCell>
                        <TableCell align="right">Platform</TableCell>
                        <TableCell align="right">Location</TableCell>
                        <TableCell align="right">Login Time</TableCell>
                        <TableCell align="right">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {employeeSessions.length > 0 ? (
                        employeeSessions.map((employeeSession) => (
                            <TableRow
                                key={employeeSession.uuid}
                                sx={{'&:last-child td, &:last-child th': {border: 0}}}
                            >
                                <TableCell component="th" scope="row">
                                    {employeeSession.browserName}
                                </TableCell>
                                <TableCell align="right">{employeeSession.osName}</TableCell>
                                <TableCell align="right">{employeeSession.platform}</TableCell>
                                <TableCell align="right">{employeeSession.location}</TableCell>
                                <TableCell align="right">{employeeSession.loginTime}</TableCell>
                                <TableCell align="right">
                                    <button onClick={handleDeleteSession(employeeSession.uuid)}>Delete Session</button>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={6} align="center">
                                No active sessions found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default LoginLimitExceedPage;