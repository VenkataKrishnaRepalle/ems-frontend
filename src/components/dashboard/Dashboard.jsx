import React, {useEffect, useState, useCallback} from "react";
import {Container, Form, Row, Col, Navbar, Nav, NavDropdown} from "react-bootstrap";
import axios from "axios";
import {AuthState} from "../config/AuthContext";
import {useNavigate} from "react-router-dom";
import {toast} from "react-toastify";
import {Box, Button, Card} from "@mui/material";

const Dashboard = (callback, deps) => {
    const navigate = useNavigate();
    const {authentication} = AuthState();

    const [isAdmin, setIsAdmin] = useState(false);
    const [isManager, setIsManager] = useState(false);
    const [loading, setLoading] = useState(true);
    const [years, setYears] = useState([]);
    const [employeePeriod, setEmployeePeriod] = useState([]);
    const [employee, setEmployee] = useState({
        uuid: '',
        firstName: '',
        lastName: '',
        gender: '',
        dateOfBirth: '',
        phoneNumber: '',
        email: '',
        managerUuid: '',
        managerFirstName: '',
        managerLastName: '',
        isManager: '',
        joiningDate: '',
        leavingDate: '',
        status: '',
    });

    useEffect(() => {
        if (!authentication?.accessToken) {
            navigate("/");
            return;
        }

        setIsAdmin(authentication.roles.includes('ADMIN'));
        setIsManager(authentication.roles.includes('MANAGER'));
    }, [authentication, navigate]);

    const fetchEmployeeDetails = useCallback(async () => {
        if (!authentication?.accessToken) return;

        try {
            const response = await axios.get("http://localhost:8082/api/employee/me", {
                headers: {'Authorization': `${authentication.accessToken}`}
            });

            if (response?.data) {
                setEmployee(response.data);
                setLoading(false);

                if (!response.data.managerUuid) {
                    toast.info("You do not have a Line Manager.");
                }

                if (response.data.leavingDate && new Date(response.data.leavingDate) <= new Date()) {
                    toast.warning("Employee is Leaving");
                }
            }
        } catch (error) {
            if (error.response?.data?.errorCode === 'TOKEN_EXPIRED') {
                navigate('/');
            }
            toast.error(error.response?.data?.error?.message || "An unexpected error occurred.");
            console.error("Error fetching employee details:", error);
            setLoading(false);
        }
    }, [navigate, authentication?.accessToken]);

    useEffect(() => {
        if (authentication?.accessToken) {
            fetchEmployeeDetails();
        } else {
            toast.error("Authentication token is missing. Please log in again.");
        }
    }, [authentication, fetchEmployeeDetails]);

    const fetchEmployeeYears = useCallback(async () => {
        if (!authentication?.accessToken || !authentication?.userId) {
            toast.error("Authentication token or user ID is missing.");
            return;
        }

        try {
            const {data} = await axios.get(
                `http://localhost:8082/api/employeePeriod/getAllEligibleYears/${authentication.userId}`,
                {headers: {Authorization: `${authentication.accessToken}`}}
            );

            if (data?.length) {
                setYears(data);
            } else {
                toast.warning("Colleague not assigned with cycle.");
            }
        } catch (error) {
            toast.error(error.response?.data?.error?.message || "An unexpected error occurred.");
            console.error("Error fetching employee cycle details:", error);
        }
    }, [authentication?.accessToken, authentication?.userId]);

    const fetchEmployeeCycles = useCallback(async () => {
        if (!authentication?.accessToken || !authentication?.userId) {
            toast.error("Authentication token or user ID is missing.");
            return;
        }

        try {
            const {data} = await axios.get(
                `http://localhost:8082/api/employeePeriod/getByYear/${authentication.userId}?year=${years.at(0)}`,
                {headers: {Authorization: `${authentication.accessToken}`}});
            if (data) {
                setEmployeePeriod(data);
            }
        } catch (error) {
            toast.error(error.response?.data?.error?.message || "An unexpected error occured.");
        }
    }, [authentication.accessToken, authentication.userId, years]);

    useEffect(() => {
        if (authentication?.accessToken) {
            fetchEmployeeYears();
        }
    }, [authentication]); // Removed fetchEmployeeYears from dependencies

    useEffect(() => {
        if (authentication?.accessToken && years.length > 0) {
            fetchEmployeeCycles();
        }
    }, [authentication, years]); // Fetch cycles only after years are set


    if (loading) return <div className="text-center mt-5">Loading...</div>;

    const getManagerName = () => (employee.managerUuid ? `${employee.managerFirstName} ${employee.managerLastName}` : "N/A");

    return (
        <div className="dashboard">
            {/* Navbar */}
            <Navbar expand="lg" className="sticky-top bg-dark navbar-dark shadow">
                <Container>
                    <Navbar.Toggle aria-controls="basic-navbar-nav"/>
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav>
                            <Nav.Link href="#MyView">My View</Nav.Link>
                            {isManager && <Nav.Link href="/team-view">My Team</Nav.Link>}
                            {isAdmin && <Nav.Link href="/register">Add Employee</Nav.Link>}
                            <Nav.Link href="/attendance">Attendance</Nav.Link>
                            <Nav.Link href="/leaves">Leave</Nav.Link>
                            <NavDropdown title="More" id="basic-nav-dropdown">
                                <NavDropdown.Item href="/dashboard">Profile</NavDropdown.Item>
                                <NavDropdown.Item href="#MyView1">Settings</NavDropdown.Item>
                                <NavDropdown.Divider/>
                                <NavDropdown.Item href="/logout" className="text-danger">Logout</NavDropdown.Item>
                            </NavDropdown>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            {/* Profile Section */}
            <div className="profile-section bg-gradient p-5">
                <Container>
                    <h2 className="mb-4">My Profile</h2>
                    <Row className="gy-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="fw-bold">Full Name</Form.Label>
                                <Form.Control value={`${employee.firstName} ${employee.lastName}`} disabled/>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="fw-bold">Email</Form.Label>
                                <Form.Control value={employee.email || "N/A"} disabled/>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row className="gy-3 mt-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="fw-bold">Line Manager</Form.Label>
                                <Form.Control value={getManagerName()} disabled/>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="fw-bold">Phone Number</Form.Label>
                                <Form.Control value={employee.phoneNumber || "N/A"} disabled/>
                            </Form.Group>
                        </Col>
                    </Row>
                </Container>
            </div>

            {years.length > 0 && (
                <Container fluid className="bg-light min-vh-100 py-5">
                    <h3 className="text-center mb-4">Quarterly Reviews</h3>
                    <Box display="flex" justifyContent="center" alignItems="center" gap={2} flexWrap="wrap">
                        {years.map((year, index) => (
                            <Button key={index} variant="contained">{year}</Button>
                        ))}
                    </Box>
                    <Container className="mt-5">
                        <Row className="g-4">
                            {["Q1", "Q2", "Q3", "Q4"].map((quarter, index) => (
                                <Col md={6} key={index}>
                                    <Card className="p-4 shadow-sm text-center">
                                        <h5>{quarter} Review</h5>
                                        <p className="text-muted">Please complete your {quarter} review.</p>
                                        <Button variant="contained">View</Button>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </Container>
                </Container>
            )}
        </div>
    );
};

export default Dashboard;
