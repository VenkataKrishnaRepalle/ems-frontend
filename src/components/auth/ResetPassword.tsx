import React, {ChangeEvent, FormEvent, useState} from "react";
import {Link as RouterLink, useNavigate} from "react-router-dom";
import {ResetPasswordRequest} from "../types/types.d";
import FullPageLoader from "../loader/FullPageLoader";
import {Button, Col, Container, FloatingLabel, Form, InputGroup, Row} from "react-bootstrap";
import {RESET_PASSWORD_API, VERIFY_EMAIL_API} from "../../api/Auth";
import {toast} from "react-toastify";
import {isValidEmail} from "../common/CommonUtils";
import {Link as MuiLink, Typography} from "@mui/material";

const ResetPassword: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = React.useState<boolean>(false);
    const [resetPasswordData, setResetPasswordData] = useState<ResetPasswordRequest>({
        "email": "",
        "oldPassword": "",
        "newPassword": "",
        "confirmNewPassword": ""
    });
    const [verifyEmail, setVerifyEmail] = useState<boolean>(false);

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const {name, value} = event.target;
        setResetPasswordData((prevFormData) => ({...prevFormData, [name]: value}));
    };

    const handleResetPassword = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;

        if (!form.checkValidity()) {
            event.stopPropagation();
            return;
        }

        setLoading(true);

        try {
            const response = await RESET_PASSWORD_API(resetPasswordData);
            if (response !== null) {
                toast.success("Password updated successfully. Please login with your new password.");
                navigate("/");
            }
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyEmail = async () => {
        try {
            const response = await VERIFY_EMAIL_API(resetPasswordData.email);
            if (response?.success === true) {
                toast.success("Email verified successfully.");
            }
            setVerifyEmail(true);
        } catch (error) {
        }
    };

    return (
        <>
            <FullPageLoader loading={loading}/>
            {!loading &&
                <Container className="d-flex justify-content-center align-items-center bg-light min-vh-100">
                    <Row className="w-100 justify-content-center">
                        <Col xs={12} sm={8} md={6} lg={5}>
                            <Form onSubmit={handleResetPassword} className="border p-4 text-center rounded" noValidate>
                                <h1 className="mb-4">Reset Password</h1>
                                <FloatingLabel className="mb-3" controlId="email" label="Email">
                                    <Form.Control
                                        type="email"
                                        placeholder="email"
                                        name="email"
                                        value={resetPasswordData.email}
                                        onChange={handleInputChange}
                                        autoFocus
                                        required
                                    />
                                    <Form.Control.Feedback className="text-start" type="invalid">
                                        Please enter a valid email
                                    </Form.Control.Feedback>
                                </FloatingLabel>
                                {!verifyEmail &&
                                    <InputGroup.Text className="p-0 mt-2">
                                        <Button
                                            variant="outline-secondary"
                                            onClick={handleVerifyEmail}
                                            disabled={!resetPasswordData.email || !isValidEmail(resetPasswordData.email)}
                                            style={{width: "100%"}}
                                        >
                                            Verify Email
                                        </Button>
                                    </InputGroup.Text>
                                }
                                {verifyEmail &&
                                    <><FloatingLabel className="mb-3" controlId="Old Password" label="Old Password">
                                        <Form.Control
                                            type="password"
                                            placeholder="Enter Old Password"
                                            name="oldPassword"
                                            value={resetPasswordData.oldPassword}
                                            onChange={handleInputChange}
                                            minLength={8}
                                            maxLength={25}
                                            required/>
                                        <Form.Control.Feedback className="text-start" type="invalid">
                                            Please enter a valid old password
                                        </Form.Control.Feedback>
                                    </FloatingLabel><FloatingLabel className="mb-3" controlId="New Password"
                                                                   label="New Password">
                                        <Form.Control
                                            type="password"
                                            placeholder="Enter New Password"
                                            name="newPassword"
                                            value={resetPasswordData.newPassword}
                                            onChange={handleInputChange}
                                            minLength={8}
                                            maxLength={25}
                                            required/>
                                        <Form.Control.Feedback className="text-start" type="invalid">
                                            Please enter a valid New password
                                        </Form.Control.Feedback>
                                    </FloatingLabel><FloatingLabel className="mb-3" controlId="Confirm New Password"
                                                                   label="Confirm New Password">
                                        <Form.Control
                                            type="password"
                                            placeholder="Enter New Confirmation Password"
                                            name="confirmNewPassword"
                                            value={resetPasswordData.confirmNewPassword}
                                            onChange={handleInputChange}
                                            minLength={8}
                                            maxLength={25}
                                            required/>
                                        <Form.Control.Feedback className="text-start" type="invalid">
                                            Please enter a valid Confirmation password
                                        </Form.Control.Feedback>
                                    </FloatingLabel><Button className="mb-3 w-100" variant="primary" type="submit">Reset
                                        Password</Button></>
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
                </Container>
            }
        </>
    )
};

export default ResetPassword;