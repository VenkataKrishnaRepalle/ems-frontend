import {Container, Nav, Navbar, NavDropdown} from "react-bootstrap";
import * as React from "react";
import {useEffect, useState} from "react";
import {AuthState} from "../config/AuthContext";
import {useNavigate} from "react-router-dom";

interface HeaderProps {
    role: React.AriaRole | undefined
}

const Header: React.FC<HeaderProps> = ({role}: HeaderProps) => {
    const navigate = useNavigate();
    const {authentication} = AuthState();
    const [isManager, setIsManager] = useState<boolean>(false);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);

    useEffect(() => {
        if (!authentication?.accessToken) {
            return;
        }
        setIsAdmin(authentication.roles.includes("ADMIN"));
        setIsManager(authentication.roles.includes("MANAGER"));
    }, [authentication, navigate]);

    return (
        <div className="dashboard">
            <Navbar expand="lg" className="sticky-top bg-dark navbar-dark shadow">
                <Container>
                    <Navbar.Toggle aria-controls="basic-navbar-nav"/>
                    <Navbar.Collapse role={role} id="basic-navbar-nav">
                        <Nav>
                            <Nav.Link href="/dashboard">My View</Nav.Link>
                            {isManager && <Nav.Link href="/team-view">My Team</Nav.Link>}
                            {isAdmin && <Nav.Link href="/register">Add Employee</Nav.Link>}
                            <Nav.Link href="/attendance">Attendance</Nav.Link>
                            <Nav.Link href="/leaves">Leave</Nav.Link>
                            <NavDropdown title="More" id="basic-nav-dropdown">
                                <NavDropdown.Item href="/profile">Profile</NavDropdown.Item>
                                <NavDropdown.Item href="/education">Education</NavDropdown.Item>
                                <NavDropdown.Item href="/settings">Settings</NavDropdown.Item>
                                <NavDropdown.Item href="/reset-password">Reset Password</NavDropdown.Item>
                                <NavDropdown.Divider/>
                                <NavDropdown.Item href="/logout" className="text-danger">Logout</NavDropdown.Item>
                            </NavDropdown>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </div>
    );
};

export default Header;
