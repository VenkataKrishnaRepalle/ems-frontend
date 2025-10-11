import { ChangeEvent, FormEvent, useRef, useState } from "react";
import { ForgotPasswordRequest } from "../types/types.d";
import FullPageLoader from "../loader/FullPageLoader";
import * as React from "react";
import { FORGOT_PASSWORD_API, SEND_OTP_API, VERIFY_EMAIL_API } from "../../api/Auth";
import { toast } from "react-toastify";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { isValidEmail } from "../common/CommonUtils";
import {
    Container,
    Box,
    TextField,
    Button,
    Typography,
    Link as MuiLink,
    Paper
} from "@mui/material";

const ForgotPassword: React.FC = () => {
    const [forgotPasswordData, setForgotPasswordData] = useState<ForgotPasswordRequest>({
        email: "",
        otp: "",
        password: "",
        confirmPassword: ""
    });

    const navigate = useNavigate();
    const [loading, setLoading] = useState<boolean>(false);
    const [verifyEmail, setVerifyEmail] = useState<boolean>(false);
    const [sentOtp, setSentOtp] = useState<boolean>(false);
    const [otpCooldown, setOtpCooldown] = useState(false);
    const [timer, setTimer] = useState(60);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setForgotPasswordData((prevFormData) => ({ ...prevFormData, [name]: value }));
    };

    const handleForgotPassword = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (
            !forgotPasswordData.email ||
            !forgotPasswordData.otp ||
            !forgotPasswordData.password ||
            !forgotPasswordData.confirmPassword
        ) {
            toast.error("Please fill out all required fields.");
            return;
        }

        if (forgotPasswordData.password !== forgotPasswordData.confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const response = await FORGOT_PASSWORD_API(forgotPasswordData);
            if (response !== null) {
                toast.success("Password updated successfully. Please login with your new password.");
                navigate("/");
            }
        } catch (error) {
            toast.error("Failed to update password. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyEmail = async () => {
        try {
            const response = await VERIFY_EMAIL_API(forgotPasswordData.email);
            if (response?.success === true) {
                toast.success("Email verified successfully. You can now send OTP.");
                setVerifyEmail(true);
            }
        } catch (error) {
            toast.error("Failed to verify email.");
        }
    };

    const handleSendOtp = async () => {
        try {
            const response = await SEND_OTP_API(forgotPasswordData.email, "FORGOT_PASSWORD");
            if (response !== null) {
                toast.success("OTP sent successfully to your email: " + forgotPasswordData.email);
                setSentOtp(true);
                setOtpCooldown(true);
                setTimer(60);
                intervalRef.current = setInterval(() => {
                    setTimer((prev) => {
                        if (prev <= 1) {
                            clearInterval(intervalRef.current!);
                            setOtpCooldown(false);
                            return 60;
                        }
                        return prev - 1;
                    });
                }, 1000);
            }
        } catch (error) {
            toast.error("Failed to send OTP. Please try again.");
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
                        backgroundColor: "#f5f5f5"
                    }}
                >
                    <Paper
                        elevation={3}
                        sx={{
                            padding: 4,
                            borderRadius: 3,
                            width: "100%",
                            maxWidth: 420,
                            textAlign: "center"
                        }}
                    >
                        <Typography variant="h4" gutterBottom>
                            Forgot Password
                        </Typography>

                        <Box
                            component="form"
                            onSubmit={handleForgotPassword}
                            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                            noValidate
                        >
                            <TextField
                                label="Email"
                                name="email"
                                type="email"
                                value={forgotPasswordData.email}
                                onChange={handleInputChange}
                                fullWidth
                                required
                                disabled={verifyEmail}
                                error={!!forgotPasswordData.email && !isValidEmail(forgotPasswordData.email)}
                                helperText={
                                    !!forgotPasswordData.email && !isValidEmail(forgotPasswordData.email)
                                        ? "Please enter a valid email"
                                        : ""
                                }
                            />

                            {!verifyEmail ? (
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    onClick={handleVerifyEmail}
                                    disabled={!forgotPasswordData.email || !isValidEmail(forgotPasswordData.email)}
                                >
                                    Verify Email
                                </Button>
                            ) : (
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    onClick={handleSendOtp}
                                    disabled={otpCooldown}
                                >
                                    {otpCooldown ? `Resend OTP in ${timer}s` : "Send OTP"}
                                </Button>
                            )}

                            {sentOtp && (
                                <>
                                    <TextField
                                        label="OTP"
                                        name="otp"
                                        type="text"
                                        value={forgotPasswordData.otp}
                                        onChange={handleInputChange}
                                        inputProps={{ maxLength: 6 }}
                                        required
                                        fullWidth
                                    />

                                    <TextField
                                        label="New Password"
                                        name="password"
                                        type="password"
                                        value={forgotPasswordData.password}
                                        onChange={handleInputChange}
                                        inputProps={{ minLength: 8, maxLength: 25 }}
                                        required
                                        fullWidth
                                    />

                                    <TextField
                                        label="Confirm Password"
                                        name="confirmPassword"
                                        type="password"
                                        value={forgotPasswordData.confirmPassword}
                                        onChange={handleInputChange}
                                        inputProps={{ minLength: 8, maxLength: 25 }}
                                        required
                                        fullWidth
                                    />

                                    <Button type="submit" variant="contained" fullWidth>
                                        Update Password
                                    </Button>
                                </>
                            )}
                        </Box>

                        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                            Back to Login Page?{" "}
                            <MuiLink component={RouterLink} to="/">
                                Click here
                            </MuiLink>
                        </Typography>
                    </Paper>
                </Container>
            )}
        </>
    );
};

export default ForgotPassword;
