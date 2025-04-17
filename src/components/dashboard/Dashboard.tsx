import React, {useEffect, useState, useCallback} from "react";
import {Container, Form, Row, Col} from "react-bootstrap";
import axios from "axios";
import {AuthState} from "../config/AuthContext";
import {useNavigate} from "react-router-dom";
import {toast} from "react-toastify";
import {Box, Button, Card} from "@mui/material";
import {Employee, EmployeePeriodAndTimeline} from "../types/types.d";
import ValidateToken from "../auth/ValidateToken";

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const {authentication} = AuthState();
    const [loading, setLoading] = useState<boolean>(true);
    const [years, setYears] = useState<number[]>([]);
    const [employeePeriod, setEmployeePeriod] = useState<EmployeePeriodAndTimeline>({
        employeeId: "",
        employeeCycleId: "",
        period: undefined,
        Q1: undefined,
        Q2: undefined,
        Q3: undefined,
        Q4: undefined
    });
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [selectedYear, setSelectedYear] = useState<number>();

    ValidateToken();

    const findEmployeePeriodByYear = useCallback(async (year: number) => {
        if (year === selectedYear) {
            return;
        }
        try {
            setLoading(true);
            setSelectedYear(year);
            const cyclesRes = await axios.get<EmployeePeriodAndTimeline>(
                `http://localhost:8082/api/employeePeriod/getByYear/${authentication.userId}?year=${year}`,
                {headers: {Authorization: `${authentication.accessToken}`}}
            );
            setEmployeePeriod(cyclesRes?.data);
        } catch (error: any) {
            toast.error(error.response?.data?.errorMessage || `Error fetching employee period information for year: ${selectedYear}`);
        } finally {
            setLoading(false);
        }
    }, [selectedYear, authentication.userId, authentication.accessToken]);

    const fetchData = useCallback(async () => {
        if (!authentication?.accessToken) return;

        try {
            setLoading(true);

            const [employeeRes, yearsRes] = await Promise.all([
                axios.get<Employee>("http://localhost:8082/api/employee/me", {
                    headers: {Authorization: `${authentication.accessToken}`},
                }),
                axios.get<number[]>(
                    `http://localhost:8082/api/employeePeriod/getAllEligibleYears/${authentication.userId}`,
                    {
                        headers: {Authorization: `${authentication.accessToken}`},
                    }
                ),
            ]);

            if (employeeRes?.data) {
                setEmployee(employeeRes.data);
                if (!employeeRes.data.managerUuid) {
                    toast.info("You do not have a Line Manager.");
                }
                if (employeeRes.data.leavingDate && new Date(employeeRes.data.leavingDate) <= new Date()) {
                    toast.warning("Employee is Leaving");
                }
            }

            if (yearsRes?.data?.length) {
                setYears(yearsRes.data);
                const year = yearsRes.data[0];
                setSelectedYear(year);
                await findEmployeePeriodByYear(year);
            } else {
                toast.warning("Colleague not assigned with cycle.");
            }
        } catch (error: any) {
            toast.error(error.response?.data?.errorMessage || 'Error fetching employee information');
        } finally {
            setLoading(false);
        }
    }, [authentication.accessToken, authentication.userId, findEmployeePeriodByYear]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const formatDate = (dateString?: string): string => {
        return dateString ? new Date(dateString).toDateString() : "N/A";
    };

    const viewReview = (employeePeriodUuid?: string, reviewType?: string, year?: number) => {
        if (employeePeriodUuid && reviewType) {
            navigate(`/review/${reviewType}/reviewUuid/${employeePeriodUuid}`, {
                state: {employeePeriodUuid, reviewType, year},
            });
        } else {
            toast.error("Review details are missing.");
        }
    };

    if (loading) return <div className="text-center mt-5">Loading...</div>;

    const getManagerName = (): string =>
        employee?.managerUuid ? `${employee.managerFirstName} ${employee.managerLastName}` : "";
    return (
        <div className="dashboard">
            <div className="profile-section bg-gradient p-5">
                <Container>
                    <h2 className="mb-4">My Profile</h2>
                    <Row className="gy-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="fw-bold">Full Name</Form.Label>
                                <Form.Control value={`${employee.firstName} ${employee.lastName}`} disabled/>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="fw-bold">Email</Form.Label>
                                <Form.Control value={employee.email || "N/A"} disabled/>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row className="gy-3 mt-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="fw-bold">Line Manager</Form.Label>
                                <Form.Control value={getManagerName()} disabled/>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="fw-bold">Phone Number</Form.Label>
                                <Form.Control value={employee.phoneNumber || "N/A"} disabled/>
                            </Form.Group>
                        </Col>
                    </Row>
                </Container>
            </div>

            {years.length > 0 && (
                <Container fluid className="bg-light min-vh-100 py-5">
                    <h3 className="text-center mb-4">Quarterly Reviews</h3>
                    <Box display="flex" justifyContent="center" alignItems="center" gap={2} flexWrap="wrap">
                        {years.map((year, index) => (
                            <Button key={index} onClick={() => findEmployeePeriodByYear(year)}
                                    variant="contained">{year === new Date().getFullYear() ? year + " (Current Year)" : year}</Button>
                        ))}
                    </Box>
                    <Container className="mt-5">
                        <Row className="g-4 justify-content-center">
                            {["Q1", "Q2", "Q3", "Q4"].map((quarter, index) => {
                                const data = employeePeriod?.[quarter.toLowerCase()];
                                const buttonLabel =
                                    data?.status === "COMPLETED" || data?.status === "LOCKED"
                                        ? "View"
                                        : data?.status === "STARTED" || data?.status === "OVERDUE"
                                            ? "Submit" : null;
                                return (
                                    <Col key={index} xs={12} md={6}>
                                        <Card className="p-4 shadow-sm text-center">
                                            <h5>{quarter} Review - {selectedYear}</h5>
                                            <p className="text-muted">
                                                {data?.status === "STARTED" || data?.status === "OVERDUE"
                                                    ? `Please complete your ${quarter} review.`
                                                    : data?.status === "SCHEDULED" || data?.status === "NOT_STARTED"
                                                        ? `${quarter} review not started, will start on ${formatDate(data?.startTime)}`
                                                        : data?.status === "LOCKED"
                                                            ? `${quarter} review is locked`
                                                            : `${quarter} review is completed.`}
                                            </p>
                                            {buttonLabel ? <Button
                                                    onClick={() => viewReview(employeePeriod?.employeeCycleId, quarter, selectedYear)}
                                                    variant="contained">{buttonLabel}</Button> :
                                                <div style={{height: "36px"}}></div>}
                                        </Card>
                                    </Col>
                                );
                            })}
                        </Row>
                    </Container>
                </Container>
            )}
        </div>
    );
};

export default Dashboard;
