import {ChangeEvent, FormEvent, useRef, useState} from "react";
import {ForgotPasswordRequest} from "../types/types.d";
import FullPageLoader from "../loader/FullPageLoader";
import {Button, Col, Container, FloatingLabel, Form, InputGroup, Row} from "react-bootstrap";
import * as React from "react";
import {FORGOT_PASSWORD_API, SEND_OTP_API, VERIFY_EMAIL_API} from "../../api/Auth";
import {toast} from "react-toastify";
import {Link as RouterLink, useNavigate} from "react-router-dom";
import {isValidEmail} from "../common/CommonUtils";
import {Link as MuiLink, Typography} from "@mui/material";

const ForgotPassword: React.FC = () => {
    const [forgotPasswordData, setForgotPasswordData] = useState<ForgotPasswordRequest>({
        "email": "",
        "otp": "",
        "password": "",
        "confirmPassword": ""
    });

    const navigate = useNavigate();
    const [loading, setLoading] = useState<boolean>(false);
    const [verifyEmail, setVerifyEmail] = useState<boolean>(false);
    const [sentOtp, setSentOtp] = useState<boolean>(false);
    const [otpCooldown, setOtpCooldown] = useState(false);
    const [timer, setTimer] = useState(60);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const {name, value} = event.target;
        setForgotPasswordData((prevFormData) => ({...prevFormData, [name]: value}));
    };

    const handleForgotPassword = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;

        if (!form.checkValidity()) {
            event.stopPropagation();
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
            toast.error("Failed to Update Password. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyEmail = async () => {
        try {
            const response = await VERIFY_EMAIL_API(forgotPasswordData.email);
            if (response?.success === true) {
                toast.success("Email verified successfully. You can now Send Otp.");
            }
            setVerifyEmail(true);
        } catch (error) {
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
            <FullPageLoader loading={loading}/>
            {!loading &&
                <Container className="d-flex justify-content-center align-items-center bg-light min-vh-100">
                    <Row className="w-100 justify-content-center">
                        <Col xs={12} sm={8} md={6} lg={5}>
                            <Form onSubmit={handleForgotPassword} className="border p-4 text-center rounded" noValidate>
                                <h1 className="mb-4">Forgot Password</h1>
                                <FloatingLabel className="mb-3" controlId="email" label="Email">
                                    <Form.Control
                                        type="email"
                                        placeholder="email"
                                        name="email"
                                        value={forgotPasswordData.email}
                                        onChange={handleInputChange}
                                        disabled={verifyEmail}
                                        autoFocus
                                        required
                                        isInvalid={!!forgotPasswordData.email && !isValidEmail(forgotPasswordData.email)}
                                    />
                                    {!verifyEmail &&
                                        <InputGroup.Text className="p-0 mt-2">
                                            <Button
                                                variant="outline-secondary"
                                                onClick={handleVerifyEmail}
                                                disabled={!forgotPasswordData.email || !isValidEmail(forgotPasswordData.email)}
                                                style={{width: "100%"}}
                                            >
                                                Verify Email
                                            </Button>
                                        </InputGroup.Text>
                                    }
                                    {verifyEmail && <Button
                                        className="mt-2"
                                        variant="outline-secondary"
                                        onClick={handleSendOtp}
                                        disabled={otpCooldown}
                                        style={{width: "100%"}}
                                    >
                                        {otpCooldown ? `Resend OTP in ${timer} sec` : "Send OTP"}
                                    </Button>
                                    }
                                    <Form.Control.Feedback className="text-start" type="invalid">
                                        Please enter a valid email
                                    </Form.Control.Feedback>
                                </FloatingLabel>
                                {sentOtp &&
                                    <><FloatingLabel className="mb-3" controlId="OTP" label="OTP">
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter OTP"
                                            name="otp"
                                            value={forgotPasswordData.otp}
                                            onChange={handleInputChange}
                                            minLength={6}
                                            maxLength={6}
                                            required/>
                                        <Form.Control.Feedback className="text-start" type="invalid">
                                            Please enter a valid otp
                                        </Form.Control.Feedback>
                                    </FloatingLabel>
                                        <FloatingLabel className="mb-3" controlId="Password"
                                                       label="Password">
                                            <Form.Control
                                                type="password"
                                                placeholder="Enter Password"
                                                name="password"
                                                value={forgotPasswordData.password}
                                                onChange={handleInputChange}
                                                minLength={8}
                                                maxLength={25}
                                                required/>
                                            <Form.Control.Feedback className="text-start" type="invalid">
                                                Please enter a valid password
                                            </Form.Control.Feedback>
                                        </FloatingLabel>
                                        <FloatingLabel className="mb-3" controlId="Confirm Password"
                                                       label="Confirm Password">
                                            <Form.Control
                                                type="password"
                                                placeholder="Enter Confirm Password"
                                                name="confirmPassword"
                                                value={forgotPasswordData.confirmPassword}
                                                onChange={handleInputChange}
                                                minLength={8}
                                                maxLength={25}
                                                required/>
                                            <Form.Control.Feedback className="text-start" type="invalid">
                                                Please enter a valid Confirm password
                                            </Form.Control.Feedback>
                                        </FloatingLabel>
                                        <Button className="mb-3 w-100" variant="primary" type="submit">
                                            Update Password
                                        </Button></>
                                }
                                <Typography variant="body2" align="center" sx={{mt: 2}}>
                                    Back to Login Page? {' '}
                                    <MuiLink component={RouterLink} to="/">
                                        Click here
                                    </MuiLink>
                                </Typography>
                            </Form>
                        </Col>
                    </Row>
                </Container>}
        </>
    );
};

export default ForgotPassword;