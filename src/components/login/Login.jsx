import React, {useState} from "react";
import {AuthState} from "../config/AuthContext";
import {useNavigate} from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import {Button, Col, Container, FloatingLabel, Form, Row} from "react-bootstrap";
import axios from "axios";

const Login = () => {
    const {setAuthentication} = AuthState();

    const navigate = useNavigate();
    const mySwal = withReactContent(Swal);

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleInputChange = (event) => {
        const {name, value} = event.target;
        setFormData({...formData, [name]: value});
    };

    const handleLogin = (event) => {
        event.preventDefault();
        const form = event.currentTarget;

        if (form.checkValidity() === false) {
            event.stopPropagation();
        } else {
            axios.post('http://localhost:8080/api/auth/login', formData)
                .then(response => {
                    setAuthentication({
                        userId: response.data.employeeId,
                        accessToken: response.data.tokenType + ' ' + response.data.accessToken
                    });
                    navigate("/dashboard");
                })
                .catch(error => {
                    mySwal.fire({
                        icon: 'error',
                        title: error.response.data.error.code,
                        text: error.response.data.error.message
                    });
                });
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center bg-light min-vh-100">
            <Row className="w-100 justify-content-center">
                <Col xs={12} sm={8} md={6} lg={5}>
                    <Form onSubmit={handleLogin} className="border p-4 text-center rounded">
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

export default Login;
