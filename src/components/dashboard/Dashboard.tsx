import React, {useEffect, useState, useCallback} from "react";
import {Container, Form, Row, Col} from "react-bootstrap";
import {AuthState} from "../config/AuthContext";
import {useNavigate} from "react-router-dom";
import {toast} from "react-toastify";
import {Box, Button, Card} from "@mui/material";
import {Employee, EmployeePeriodAndTimeline} from "../types/types.d";
import FullPageLoader from "../loader/FullPageLoader";
import {ME_API} from "../../api/Employee";
import {GET_ALL_ELIGIBLE_YEARS, GET_EMPLOYEE_PERIOD_BY_YEAR} from "../../api/EmployeePeriod";

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

    const findEmployeePeriodByYear = useCallback(async (year: number) => {
        if (year === selectedYear) {
            return;
        }
        try {
            setSelectedYear(year);
            const cyclesRes = await GET_EMPLOYEE_PERIOD_BY_YEAR(authentication.userId, year);
            setEmployeePeriod(cyclesRes);
        } catch (error: any) {
            toast.error(`Error fetching employee period information for year: ${selectedYear}`);
        }
    }, [selectedYear, authentication.userId]);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const employeeRes = await ME_API();
            if (employeeRes) {
                setEmployee(employeeRes);
                if (!employeeRes.managerUuid) {
                    toast.info("You do not have a Line Manager.");
                }
                if (employeeRes.leavingDate && new Date(employeeRes.leavingDate) <= new Date()) {
                    toast.warning("Employee is Leaving");
                }

                const yearsRes = await GET_ALL_ELIGIBLE_YEARS(employeeRes.uuid);
                if (yearsRes?.length) {
                    setYears(yearsRes);
                    const year = yearsRes[0];
                    setSelectedYear(year);
                    await findEmployeePeriodByYear(year);
                } else {
                    toast.warning("Colleague not assigned with cycle.");
                }
            }
        } catch (error: any) {
            toast.error('Error fetching employee information');
        } finally {
            setLoading(false);
        }
    }, [findEmployeePeriodByYear]);

    useEffect(() => {
        if (authentication && authentication.userId) {
            fetchData();
        }
    }, [authentication, fetchData]);

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

    if (loading) return <FullPageLoader loading={loading}/>;

    return (
        <div className="dashboard">
            {employee && (
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
                                    <Form.Control
                                        value={employee?.managerUuid ? `${employee.managerFirstName} ${employee.managerLastName}` : ""}
                                        disabled/>
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
            )}

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