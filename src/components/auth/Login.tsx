import * as React from "react";
import {useState, ChangeEvent, FormEvent} from "react";
import {AuthState} from "../config/AuthContext";
import {useNavigate} from "react-router-dom";
import {Button, Col, Container, FloatingLabel, Form, Row} from "react-bootstrap";
import {toast} from "react-toastify";
import {Login} from "../types/types.d";
import FullPageLoader from "../Loader/FullPageLoader";
import useValidateToken from "./ValidateToken";
import {LOGIN_API} from "../../api/auth";

const LoginPage: React.FC = () => {
    const {setAuthentication} = AuthState();
    const navigate = useNavigate();

    const [formData, setFormData] = useState<Login>({
        email: "",
        password: ""
    });

    useValidateToken();

    const [loading, setLoading] = useState<boolean>(false);

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
        setLoading(true);

        try {
            const response = await LOGIN_API(formData);
            if (response !== null) {
                console.log(response);
                setAuthentication({
                    userId: response.employeeId,
                    accessToken: `${response.tokenType} ${response.accessToken}`,
                    roles: response.roles
                });
                toast.success("Login successful as " + response.email);
                navigate("/dashboard");
            }
        } catch (error) {

        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <FullPageLoader loading={loading}/>
            {!loading &&
                <Container className="d-flex justify-content-center align-items-center bg-light min-vh-100">
                    <Row className="w-100 justify-content-center">
                        <Col xs={12} sm={8} md={6} lg={5}>
                            <Form onSubmit={handleLogin} className="border p-4 text-center rounded" noValidate>l
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
            }
        </>

    )
        ;
};

export default LoginPage;
