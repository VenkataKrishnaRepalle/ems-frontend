import * as React from "react";
import { useEffect, useState } from "react";
import { AuthState } from "../config/AuthContext";
import { useNavigate } from "react-router-dom";
import {
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Button,
    Menu,
    MenuItem,
    Box,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

interface HeaderProps {
    role: React.AriaRole | undefined;
}

const Header: React.FC<HeaderProps> = ({ role }: HeaderProps) => {
    const navigate = useNavigate();
    const { authentication } = AuthState();
    const [isManager, setIsManager] = useState<boolean>(false);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    useEffect(() => {
        setIsAdmin(authentication.roles.includes("ADMIN"));
        setIsManager(authentication.roles.includes("MANAGER"));
    }, [authentication]);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleNavigation = (path: string) => {
        navigate(path);
        handleMenuClose();
    };

    return (
        <AppBar position="sticky" color="primary">
            <Toolbar>
                {/* Mobile Menu Button */}
                <IconButton
                    edge="start"
                    color="inherit"
                    aria-label="menu"
                    onClick={handleMenuOpen}
                    sx={{ mr: 2, display: { xs: "flex", md: "none" } }}
                >
                    <MenuIcon />
                </IconButton>

                {/* App Title */}
                <Typography
                    variant="h6"
                    component="div"
                    sx={{ flexGrow: 1, cursor: "pointer" }}
                    onClick={() => navigate("/dashboard")}
                >
                    Dashboard
                </Typography>

                {/* Desktop Menu Buttons */}
                <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2 }}>
                    <Button color="inherit" onClick={() => navigate("/dashboard")}>
                        My View
                    </Button>
                    {isManager && (
                        <Button color="inherit" onClick={() => navigate("/team-view")}>
                            My Team
                        </Button>
                    )}
                    {isAdmin && (
                        <Button color="inherit" onClick={() => navigate("/register")}>
                            Add Employee
                        </Button>
                    )}
                    <Button color="inherit" onClick={() => navigate("/attendance")}>
                        Attendance
                    </Button>
                    <Button color="inherit" onClick={() => navigate("/leaves")}>
                        Leave
                    </Button>
                    <Button color="inherit" onClick={handleMenuOpen}>
                        More
                    </Button>
                </Box>

                {/* Dropdown Menu */}
                <Menu
                    id="menu-appbar"
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    transformOrigin={{ vertical: "top", horizontal: "right" }}
                >
                    <MenuItem onClick={() => handleNavigation("/profile")}>Profile</MenuItem>
                    <MenuItem onClick={() => handleNavigation("/education")}>Education</MenuItem>
                    <MenuItem onClick={() => handleNavigation("/settings")}>Settings</MenuItem>
                    <MenuItem onClick={() => handleNavigation("/reset-password")}>
                        Reset Password
                    </MenuItem>
                    <MenuItem divider />
                    <MenuItem
                        onClick={() => handleNavigation("/logout")}
                        sx={{ color: "error.main" }}
                    >
                        Logout
                    </MenuItem>
                </Menu>
            </Toolbar>
        </AppBar>
    );
};

export default Header;
