import {Container} from "@mui/material";
import {Col, Form, Row} from "react-bootstrap";
import {useCallback, useEffect, useState} from "react";
import {AuthState} from "../config/AuthContext";
import axios from "axios";
import {useNavigate} from "react-router-dom";

const Profile = () => {
    const navigate = useNavigate();
    const {authentication} = AuthState();
    const [employee, setEmployee] = useState(null);

    useEffect(() => {
        if (!authentication?.accessToken) {
            navigate("/");
        }
    }, [authentication, navigate]);

    const getProfile = useCallback(async () => {
        if (!authentication?.accessToken) return;

        try {
            const profile = await axios.get("http://localhost:8082/api/employee/me", {
                headers: {Authorization: `${authentication?.accessToken}`},
            });

            if (profile.status === 200) {
                setEmployee(profile.data);
            }
        } catch (error) {
            if (error.response?.data?.errorCode === "TOKEN_EXPIRED") {
                navigate("/");
            }
        }
    }, [authentication?.accessToken, navigate]);

    useEffect(() => {
        getProfile();
    }, [getProfile]);

    return (
        <div className="bg-gradient p-4">
            <Container>
                <h2 className="mb-4">My Profile</h2>
                <Row className="gy-3">
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label className="fw-bold">Full Name</Form.Label>
                            <Form.Control
                                value={employee ? `${employee.firstName} ${employee.lastName}` : ""}
                                disabled/>
                        </Form.Group>
                        {employee?.managerUuid && employee?.managerFirstName && employee?.managerLastName &&
                            <Form.Group className={"mt-3"}>
                                <Form.Label className={"fw-bold"}>Manager Name</Form.Label>
                                <Form.Control
                                    value={employee?.managerUuid ? `${employee.managerFirstName} ${employee.managerLastName}` : ""}
                                    disabled/>
                            </Form.Group>}
                        <Form.Group className={"mt-3"}>
                            <Form.Label className={"fw-bold"}>Department</Form.Label>
                            <Form.Control
                                value={employee?.department ? `${employee.department}` : ""}
                                disabled/>
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label className={"fw-bold"}>Email</Form.Label>
                            <Form.Control
                                value={employee ? `${employee.email}` : ""}
                                disabled/>
                        </Form.Group>
                        <Form.Group className={"mt-3"}>
                            <Form.Label className={"fw-bold"}>Phone Number</Form.Label>
                            <Form.Control
                                value={employee?.phoneNumber ? `${employee.phoneNumber}` : ""}
                                disabled/>
                        </Form.Group>
                    </Col>
                </Row>

                <h2 className="mb-4 mt-3">Effective Dates</h2>
                <Row className={"gy-3"}>
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label className={"fw-bold"}>Joining Date</Form.Label>
                            <Form.Control
                                value={employee?.joiningDate ? `${new Date(employee.joiningDate).toDateString()}` : ""}
                                disabled/>
                        </Form.Group>
                    </Col>
                    {employee?.leavingDate &&
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className={"fw-bold"}>Leaving Date(Last working Date)</Form.Label>
                                <Form.Control
                                    value={`${new Date(employee.leavingDate).toDateString()}`}
                                    disabled/>
                            </Form.Group>
                        </Col>
                    }
                </Row>
            </Container>
        </div>
    );
};

export default Profile;
