import React, {useEffect, useState} from "react";
import {Container, Form, Row, Col, Navbar, Nav, NavDropdown} from "react-bootstrap";
import axios from "axios";
import {AuthState} from "../config/AuthContext";
import {useNavigate} from "react-router-dom";
import {toast} from "react-toastify";
import {Box, Button} from "@mui/material";

const Dashboard = () => {
    const navigate = useNavigate();
    const [isAdmin, setIsAdmin] = useState(false);
    const [isManager, setIsManager] = useState(false);
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

    const {authentication} = AuthState();
    const [loading, setLoading] = useState(true);
    const [employeePeriod, setEmployeePeriod] = useState({});
    const [years, setYears] = useState([]);

    useEffect(() => {
        if (!authentication?.accessToken) {
            navigate("/");
        }
        if (authentication.roles.includes('ADMIN')) {
            setIsAdmin(true);
        }
        if (authentication.roles.includes('MANAGER')) {
            setIsManager(true);
        }
    }, [authentication, navigate]);

    useEffect(() => {
        const fetchEmployeeDetails = async () => {
            try {
                const response = await axios.get("http://localhost:8082/api/employee/me", {
                    headers: {'Authorization': `${authentication?.accessToken}`}
                });

                if (response?.data) {
                    setEmployee(response.data);
                    setLoading(false);

                    if (!response.data.managerUuid) {
                        toast.success('You do not have a Line Manager', 'noManager');
                    }

                    if (new Date(response.data.leavingDate) >= new Date()) {
                        toast.warning('Employee is Leaving');
                    }
                }
            } catch (error) {
                const errorMessage = error.response?.data?.error?.message || "An unexpected error occurred. Please try again.";
                toast.error(errorMessage);
                console.error("Error fetching employee details:", error.message);
                setLoading(false);
            }
        };

        if (authentication?.accessToken) {
            fetchEmployeeDetails();
        } else {
            toast.error("Authentication token is missing. Please log in again.");
        }
    }, [authentication]);

    useEffect(() => {
        const fetchEmployeeCycles = async () => {
            if (!authentication?.accessToken || !authentication?.userId) {
                toast.error("Authentication token or user ID is missing. Please log in again.");
                return;
            }

            try {
                const response = await axios.get(
                    `http://localhost:8082/api/employeePeriod/getAll/${authentication.userId}`,
                    { headers: { Authorization: `${authentication.accessToken}` } }
                );

                if (response?.data && typeof response.data === "object") {
                    // Ensure it's an array before mapping
                    const periodKeys = Object.keys(response.data);
                    const yearList = periodKeys.map(key => Number(key)).sort((a, b) => b - a);

                    setEmployeePeriod(response.data);
                    setYears(yearList);
                    console.log(yearList);
                } else {
                    console.error("Unexpected response format:", response.data);
                }
            } catch (error) {
                const errorMessage = error.response?.data?.error?.message || "An unexpected error occurred. Please try again.";
                toast.error(errorMessage);
                console.error("Error fetching employee period details:", error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchEmployeeCycles();
    }, [authentication]);



    if (loading) return <div className="text-center mt-5">Loading...</div>;

    const getManagerName = () => {
        if (!employee.managerUuid) return "";
        return `${employee.managerFirstName} ${employee.managerLastName}`;
    };

    return (
        <div className="dashboard">
            {/* Navbar */}
            <Navbar expand="lg" className="sticky-top bg-dark navbar-dark shadow">
                <Container>
                    <Navbar.Brand href="/dashboard" className="fw-bold">Dashboard</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav"/>
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="ms-auto">
                            <Nav.Link href="#MyView">My View</Nav.Link>
                            {isManager && <Nav.Link href="/team-view">My Team</Nav.Link>}
                            {isAdmin && <Nav.Link href="/register">Add Employee</Nav.Link>}
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

            {/* Review Cards Section */}
            <Container fluid className="bg-light min-vh-100 py-5">
                <h3 className="text-center mb-4">Quarterly Reviews</h3>
                <Box display="flex" justifyContent="center" alignItems="center" gap={2} flexWrap="wrap">
                    {years.map((x, index) => (
                        <Button key={index} variant="contained">
                            {x}
                        </Button>
                    ))}
                </Box>
                <Row className="mb-3 gx-3">
                    <Col md={6}>
                        <div className="review-card shadow-sm p-4 rounded text-center bg-white">
                            <h6>Q1 Review</h6>
                            <p className="text-muted">Please complete your Q1 review.</p>
                        </div>
                    </Col>
                    <Col md={6}>
                        <div className="review-card shadow-sm p-4 rounded text-center bg-white">
                            <h6>Q2 Review</h6>
                            <p className="text-muted">Please complete your Q2 review.</p>
                        </div>
                    </Col>
                </Row>
                <Row className="gx-3">
                    <Col md={6}>
                        <div className="review-card shadow-sm p-4 rounded text-center bg-white">
                            <h6>Q3 Review</h6>
                            <p className="text-muted">Please complete your Q3 review.</p>
                        </div>
                    </Col>
                    <Col md={6}>
                        <div className="review-card shadow-sm p-4 rounded text-center bg-white">
                            <h6>Q4 Review</h6>
                            <p className="text-muted">Please complete your Q4 review.</p>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Dashboard;
