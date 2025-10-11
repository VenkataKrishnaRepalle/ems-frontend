import { Box, Container, Grid, TextField, Typography } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Employee } from "../types/types.d";
import { ME_API } from "../../api/Employee";

const Profile = () => {
    const navigate = useNavigate();
    const [employee, setEmployee] = useState<Employee | null>(null);

    const getProfile = useCallback(async () => {
        try {
            const profile = await ME_API();
            setEmployee(profile);
        } catch (error: any) {
            if (error.response?.data?.errorCode === "TOKEN_EXPIRED") {
                navigate("/");
            }
        }
    }, [navigate]);

    useEffect(() => {
        getProfile();
    }, [getProfile]);

    return (
        <Box className="bg-gradient" p={4}>
            <Container>
                <Typography variant="h5" fontWeight="bold" mb={3}>
                    My Profile
                </Typography>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            label="Full Name"
                            value={employee ? `${employee.firstName} ${employee.lastName}` : ""}
                            fullWidth
                            disabled
                        />

                        {employee?.managerUuid && employee.managerFirstName && employee.managerLastName && (
                            <Box mt={2}>
                                <TextField
                                    label="Manager Name"
                                    value={`${employee.managerFirstName} ${employee.managerLastName}`}
                                    fullWidth
                                    disabled
                                />
                            </Box>
                        )}

                        <Box mt={2}>
                            <TextField
                                label="Department"
                                value={employee?.department || ""}
                                fullWidth
                                disabled
                            />
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            label="Email"
                            value={employee?.email || ""}
                            fullWidth
                            disabled
                        />
                        <Box mt={2}>
                            <TextField
                                label="Phone Number"
                                value={employee?.phoneNumber || ""}
                                fullWidth
                                disabled
                            />
                        </Box>
                    </Grid>
                </Grid>

                <Typography variant="h5" fontWeight="bold" mt={4} mb={2}>
                    Effective Dates
                </Typography>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            label="Joining Date"
                            value={employee?.joiningDate ? new Date(employee.joiningDate).toDateString() : ""}
                            fullWidth
                            disabled
                        />
                    </Grid>

                    {employee?.leavingDate && (
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Leaving Date (Last Working Date)"
                                value={new Date(employee.leavingDate).toDateString()}
                                fullWidth
                                disabled
                            />
                        </Grid>
                    )}
                </Grid>
            </Container>
        </Box>
    );
};

export default Profile;
