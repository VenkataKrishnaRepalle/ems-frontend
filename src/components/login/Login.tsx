import * as React from "react";
import {useState, ChangeEvent, FormEvent} from "react";
import {AuthState} from "../config/AuthContext";
import {useNavigate} from "react-router-dom";
import {Button, Col, Container, FloatingLabel, Form, Row} from "react-bootstrap";
import axios from "axios";
import {toast} from "react-toastify";
import {Login} from "../types/types.d";

const LoginPage: React.FC = () => {
    const {setAuthentication} = AuthState();
    const navigate = useNavigate();

    const [formData, setFormData] = useState<Login>({
        email: "",
        password: ""
    });

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const {name, value} = event.target;
        setFormData((prevFormData) => ({...prevFormData, [name]: value}));
    };

    const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;

        if (!form.checkValidity()) {
            event.stopPropagation();
            return;
        }

        try {
            const response = await axios.post("http://localhost:8082/api/auth/login", formData);
            if (response.status === 200) {
                setAuthentication({
                    userId: response.data.employeeId,
                    accessToken: `${response.data.tokenType} ${response.data.accessToken}`,
                    roles: response.data.roles
                });
                toast.success("Login successful as " + response.data.email);
                navigate("/dashboard");
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error?.message || "Login failed");
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center bg-light min-vh-100">
            <Row className="w-100 justify-content-center">
                <Col xs={12} sm={8} md={6} lg={5}>
                    <Form onSubmit={handleLogin} className="border p-4 text-center rounded" noValidate>
                        <h1 className="mb-4">Login</h1>
                        <FloatingLabel className="mb-3" controlId="email" label="Email">
                            <Form.Control
                                type="email"
                                placeholder="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                autoFocus
                                required
                            />
                            <Form.Control.Feedback className="text-start" type="invalid">
                                Please enter a valid email
                            </Form.Control.Feedback>
                        </FloatingLabel>
                        <FloatingLabel className="mb-3" controlId="Password" label="Password">
                            <Form.Control
                                type="password"
                                placeholder="Enter Password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                minLength={8}
                                maxLength={25}
                                required
                            />
                            <Form.Control.Feedback className="text-start" type="invalid">
                                Please enter a valid password
                            </Form.Control.Feedback>
                        </FloatingLabel>
                        <Button className="mb-3 w-100" variant="primary" type="submit">Login</Button>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
};

export default LoginPage;
