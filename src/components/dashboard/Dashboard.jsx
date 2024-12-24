import React, {useEffect, useState} from "react";
import {Container, Form, Row, Col, Navbar, Nav, NavDropdown} from "react-bootstrap";
import axios from "axios";
import {AuthState} from "../config/AuthContext";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";

const Dashboard = () => {
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
    const mySwal = withReactContent(Swal);

    const {authentication} = AuthState(); // Adjust based on your context implementation
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios.get("http://localhost:8080/api/employee/me", {
            headers: {
                'Authorization': `${authentication.accessToken}`
            }
        })
            .then(response => {
                setEmployee(response.data);
                setLoading(false);

                // First alert for no manager assigned
                if (response.data.managerUuid == null) {
                    mySwal.fire({
                        icon: 'info',
                        title: 'No Manager Assigned',
                        text: 'This employee has no assigned manager.',
                        showCloseButton: true,
                        showConfirmButton: true,
                    }).then(() => {
                        // Second alert for employee leaving, triggered after first alert is closed
                        if (new Date(response.data.leavingDate) >= new Date()) {
                            console.log(employee.leavingDate);
                            mySwal.fire({
                                icon: 'warning',
                                title: 'Employee is Leaving',
                                text: 'This employee is currently leaving the organization.',
                                showCloseButton: true
                            })
                        }
                    });
                } else {
                    // If no manager alert, check and show the leaving alert directly
                    if (new Date(response.data.leavingDate) >= new Date()) {
                        console.log(employee.leavingDate);
                        mySwal.fire({
                            icon: 'warning',
                            title: 'Employee is Leaving',
                            text: 'This employee is currently leaving the organization.',
                            showCloseButton: true
                        });
                    }
                }
            })
            .catch(error => {
                setError(error.response.data);
                setLoading(false);
            })
    }, [authentication.accessToken]);


    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <Navbar expand="lg" className="sticky-top">
                <Container>
                    <Navbar.Brand href="#home">Home</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav"/>
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <Nav.Link href="#home">Home</Nav.Link>
                            <Nav.Link href="#MyView">My View</Nav.Link>
                            <Nav.Link href="#TeamView">My Team</Nav.Link>
                            <NavDropdown title="Drop Down" id="basic-nav-dropdown">
                                <NavDropdown.Item href="/dashboard">My View</NavDropdown.Item>
                                <NavDropdown.Item href="#MyView1">My View</NavDropdown.Item>
                            </NavDropdown>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            <div className="h-25 bg-light">
                <Container className="h-100">
                    <h1>My Profile</h1>
                    <Row className="mb-1">
                        <Col>
                            <Form.Group className="mb-1">
                                <Form.Label column="fullName">Full Name</Form.Label>
                                <Form.Control value={employee.firstName + ' ' + employee.lastName} disabled/>
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group className="mb-1">
                                <Form.Label column="email">Email</Form.Label>
                                <Form.Control value={employee.email} disabled/>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row className="mb-3">
                        <Col>
                            <Form.Group className="mb-3">
                                <Form.Label column="lineManager">Line Manager</Form.Label>
                                <Form.Control value={employee.managerFirstName + ' ' + employee.managerLastName}
                                              disabled/>
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group className="mb-3">
                                <Form.Label column="phoneNumber">Phone Number</Form.Label>
                                <Form.Control value={employee.phoneNumber} disabled/>
                            </Form.Group>
                        </Col>
                    </Row>
                </Container>
            </div>
            <div className="container mt-3 h-75">
                <div className=""></div>
            </div>
        </div>
    );
}

export default Dashboard;
