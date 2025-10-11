import React, { useEffect, useState, useCallback } from "react";
import { AuthState } from "../config/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Box, Button, Card, Container, Grid, TextField, Typography } from "@mui/material";
import FullPageLoader from "../loader/FullPageLoader";
import { Employee, EmployeePeriodAndTimeline } from "../types/types.d";
import { ME_API } from "../../api/Employee";
import { GET_ALL_ELIGIBLE_YEARS, GET_EMPLOYEE_PERIOD_BY_YEAR } from "../../api/EmployeePeriod";

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { authentication } = AuthState();
    const [loading, setLoading] = useState<boolean>(true);
    const [years, setYears] = useState<number[]>([]);
    const [employeePeriod, setEmployeePeriod] = useState<EmployeePeriodAndTimeline>({
        employeeId: "",
        employeeCycleId: "",
        period: undefined,
        Q1: undefined,
        Q2: undefined,
        Q3: undefined,
        Q4: undefined,
    });
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [selectedYear, setSelectedYear] = useState<number>();

    const findEmployeePeriodByYear = useCallback(
        async (year: number) => {
            if (year === selectedYear) return;

            try {
                setSelectedYear(year);
                const cyclesRes = await GET_EMPLOYEE_PERIOD_BY_YEAR(authentication.userId, year);
                setEmployeePeriod(cyclesRes);
            } catch (error: any) {
                toast.error(`Error fetching employee period information for year: ${selectedYear}`);
            }
        },
        [selectedYear, authentication.userId]
    );

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const employeeRes = await ME_API();
            if (employeeRes) {
                setEmployee(employeeRes);

                if (!employeeRes.managerUuid) toast.info("You do not have a Line Manager.");
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
            toast.error("Error fetching employee information");
        } finally {
            setLoading(false);
        }
    }, [findEmployeePeriodByYear]);

    useEffect(() => {
        if (authentication && authentication.userId) fetchData();
    }, [authentication, fetchData]);

    const formatDate = (dateString?: string): string => {
        return dateString ? new Date(dateString).toDateString() : "N/A";
    };

    const viewReview = (employeePeriodUuid?: string, reviewType?: string, year?: number) => {
        if (employeePeriodUuid && reviewType) {
            navigate(`/review/${reviewType}/reviewUuid/${employeePeriodUuid}`, {
                state: { employeePeriodUuid, reviewType, year },
            });
        } else {
            toast.error("Review details are missing.");
        }
    };

    if (loading) return <FullPageLoader loading={loading} />;

    return (
        <div className="dashboard">
            {employee && (
                <Box sx={{ background: "linear-gradient(to right, #f3f4f6, #e5e7eb)", p: 5 }}>
                    <Container>
                        <Typography variant="h4" gutterBottom>
                            My Profile
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Full Name"
                                    value={`${employee.firstName} ${employee.lastName}`}
                                    fullWidth
                                    disabled
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField label="Email" value={employee.email || "N/A"} fullWidth disabled />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Line Manager"
                                    value={
                                        employee?.managerUuid
                                            ? `${employee.managerFirstName} ${employee.managerLastName}`
                                            : ""
                                    }
                                    fullWidth
                                    disabled
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField label="Phone Number" value={employee.phoneNumber || "N/A"} fullWidth disabled />
                            </Grid>
                        </Grid>
                    </Container>
                </Box>
            )}

            {years.length > 0 && (
                <Box sx={{ backgroundColor: "#f9fafb", minHeight: "100vh", py: 5 }}>
                    <Container>
                        <Typography variant="h5" align="center" gutterBottom>
                            Quarterly Reviews
                        </Typography>
                        <Box display="flex" justifyContent="center" flexWrap="wrap" gap={2} mb={5}>
                            {years.map((year, index) => (
                                <Button
                                    key={index}
                                    variant="contained"
                                    onClick={() => findEmployeePeriodByYear(year)}
                                >
                                    {year === new Date().getFullYear() ? `${year} (Current Year)` : year}
                                </Button>
                            ))}
                        </Box>
                        <Grid container spacing={4} justifyContent="center">
                            {["Q1", "Q2", "Q3", "Q4"].map((quarter, index) => {
                                const data = employeePeriod?.[quarter.toLowerCase()];
                                const buttonLabel =
                                    data?.status === "COMPLETED" || data?.status === "LOCKED"
                                        ? "View"
                                        : data?.status === "STARTED" || data?.status === "OVERDUE"
                                            ? "Submit"
                                            : null;
                                return (
                                    <Grid item xs={12} md={6} key={index}>
                                        <Card sx={{ p: 4, textAlign: "center", boxShadow: 3 }}>
                                            <Typography variant="h6" gutterBottom>
                                                {quarter} Review - {selectedYear}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary" gutterBottom>
                                                {data?.status === "STARTED" || data?.status === "OVERDUE"
                                                    ? `Please complete your ${quarter} review.`
                                                    : data?.status === "SCHEDULED" || data?.status === "NOT_STARTED"
                                                        ? `${quarter} review not started, will start on ${formatDate(data?.startTime)}`
                                                        : data?.status === "LOCKED"
                                                            ? `${quarter} review is locked`
                                                            : `${quarter} review is completed.`}
                                            </Typography>
                                            {buttonLabel ? (
                                                <Button
                                                    variant="contained"
                                                    onClick={() =>
                                                        viewReview(employeePeriod?.employeeCycleId, quarter, selectedYear)
                                                    }
                                                >
                                                    {buttonLabel}
                                                </Button>
                                            ) : (
                                                <Box sx={{ height: "36px" }} />
                                            )}
                                        </Card>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    </Container>
                </Box>
            )}
        </div>
    );
};

export default Dashboard;
