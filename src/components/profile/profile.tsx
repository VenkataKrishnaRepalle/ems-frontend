import { Container } from "@mui/material";
import { Col, Form, Row } from "react-bootstrap";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {Employee} from "../types/types.d";
import {ME_API} from "../../api/Employee";

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
        <div className="bg-gradient p-4">
            <Container>
                <h2 className="mb-4">My Profile</h2>
                <Row className="gy-3">
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label className="fw-bold">Full Name</Form.Label>
                            <Form.Control
                                value={employee ? `${employee.firstName} ${employee.lastName}` : ""}
                                disabled
                            />
                        </Form.Group>
                        {employee?.managerUuid && employee?.managerFirstName && employee?.managerLastName && (
                            <Form.Group className={"mt-3"}>
                                <Form.Label className={"fw-bold"}>Manager Name</Form.Label>
                                <Form.Control
                                    value={
                                        employee?.managerUuid
                                            ? `${employee.managerFirstName} ${employee.managerLastName}`
                                            : ""
                                    }
                                    disabled
                                />
                            </Form.Group>
                        )}
                        <Form.Group className={"mt-3"}>
                            <Form.Label className={"fw-bold"}>Department</Form.Label>
                            <Form.Control value={employee?.department || ""} disabled />
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label className={"fw-bold"}>Email</Form.Label>
                            <Form.Control value={employee?.email || ""} disabled />
                        </Form.Group>
                        <Form.Group className={"mt-3"}>
                            <Form.Label className={"fw-bold"}>Phone Number</Form.Label>
                            <Form.Control value={employee?.phoneNumber || ""} disabled />
                        </Form.Group>
                    </Col>
                </Row>

                <h2 className="mb-4 mt-3">Effective Dates</h2>
                <Row className={"gy-3"}>
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label className={"fw-bold"}>Joining Date</Form.Label>
                            <Form.Control
                                value={
                                    employee?.joiningDate
                                        ? new Date(employee.joiningDate).toDateString()
                                        : ""
                                }
                                disabled
                            />
                        </Form.Group>
                    </Col>
                    {employee?.leavingDate && (
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className={"fw-bold"}>Leaving Date (Last working Date)</Form.Label>
                                <Form.Control
                                    value={new Date(employee.leavingDate).toDateString()}
                                    disabled
                                />
                            </Form.Group>
                        </Col>
                    )}
                </Row>
            </Container>
        </div>
    );
};

export default Profile;
