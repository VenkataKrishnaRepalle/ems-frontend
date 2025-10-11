import React, { ChangeEvent, FormEvent, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { ResetPasswordRequest } from "../types/types.d";
import FullPageLoader from "../loader/FullPageLoader";
import { RESET_PASSWORD_API, VERIFY_EMAIL_API } from "../../api/Auth";
import { toast } from "react-toastify";
import { isValidEmail } from "../common/CommonUtils";
import {
    Box,
    Button,
    Container,
    TextField,
    Typography,
    Grid,
    Link as MuiLink,
    Paper,
} from "@mui/material";

const ResetPassword: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = React.useState<boolean>(false);
    const [resetPasswordData, setResetPasswordData] = useState<ResetPasswordRequest>({
        email: "",
        oldPassword: "",
        newPassword: "",
        confirmNewPassword: "",
    });
    const [verifyEmail, setVerifyEmail] = useState<boolean>(false);

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setResetPasswordData((prevFormData) => ({ ...prevFormData, [name]: value }));
    };

    const handleResetPassword = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (resetPasswordData.newPassword !== resetPasswordData.confirmNewPassword) {
            toast.error("New password and confirmation do not match.");
            return;
        }

        setLoading(true);
        try {
            const response = await RESET_PASSWORD_API(resetPasswordData);
            if (response !== null) {
                toast.success("Password updated successfully. Please login with your new password.");
                navigate("/");
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Something went wrong!");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyEmail = async () => {
        try {
            const response = await VERIFY_EMAIL_API(resetPasswordData.email);
            if (response?.success === true) {
                toast.success("Email verified successfully.");
                setVerifyEmail(true);
            } else {
                toast.error("Email verification failed.");
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Error verifying email.");
        }
    };

    return (
        <>
            <FullPageLoader loading={loading} />
            {!loading && (
                <Container
                    maxWidth="sm"
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        minHeight: "100vh",
                    }}
                >
                    <Paper elevation={4} sx={{ p: 4, width: "100%", borderRadius: 3 }}>
                        <Typography variant="h4" align="center" gutterBottom>
                            Reset Password
                        </Typography>

                        <Box component="form" onSubmit={handleResetPassword} noValidate>
                            {/* Email Field */}
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Email"
                                type="email"
                                name="email"
                                value={resetPasswordData.email}
                                onChange={handleInputChange}
                                required
                            />

                            {/* Verify Email Button */}
                            {!verifyEmail && (
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    fullWidth
                                    sx={{ mt: 2 }}
                                    onClick={handleVerifyEmail}
                                    disabled={!resetPasswordData.email || !isValidEmail(resetPasswordData.email)}
                                >
                                    Verify Email
                                </Button>
                            )}

                            {/* Password Fields */}
                            {verifyEmail && (
                                <>
                                    <TextField
                                        fullWidth
                                        margin="normal"
                                        label="Old Password"
                                        type="password"
                                        name="oldPassword"
                                        value={resetPasswordData.oldPassword}
                                        onChange={handleInputChange}
                                        required
                                        inputProps={{ minLength: 8, maxLength: 25, autoComplete: "off" }}
                                    />
                                    <TextField
                                        fullWidth
                                        margin="normal"
                                        label="New Password"
                                        type="password"
                                        name="newPassword"
                                        value={resetPasswordData.newPassword}
                                        onChange={handleInputChange}
                                        required
                                        inputProps={{ minLength: 8, maxLength: 25, autoComplete: "off" }}
                                    />
                                    <TextField
                                        fullWidth
                                        margin="normal"
                                        label="Confirm New Password"
                                        type="password"
                                        name="confirmNewPassword"
                                        value={resetPasswordData.confirmNewPassword}
                                        onChange={handleInputChange}
                                        required
                                        inputProps={{ minLength: 8, maxLength: 25, autoComplete: "off" }}
                                    />

                                    <Button
                                        type="submit"
                                        fullWidth
                                        variant="contained"
                                        color="primary"
                                        sx={{ mt: 3 }}
                                        disabled={loading}
                                    >
                                        {loading ? "Resetting..." : "Reset Password"}
                                    </Button>
                                </>
                            )}

                            {/* Back to Login */}
                            <Grid container justifyContent="center" sx={{ mt: 3 }}>
                                <Grid item>
                                    <Typography variant="body2">
                                        Back to Login Page?{" "}
                                        <MuiLink component={RouterLink} to="/" underline="hover">
                                            Click here
                                        </MuiLink>
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Box>
                    </Paper>
                </Container>
            )}
        </>
    );
};

export default ResetPassword;
