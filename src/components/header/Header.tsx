import * as React from "react";
import {useEffect, useState} from "react";
import {useAppSelector} from "../../redux/hooks";
import {useNavigate} from "react-router-dom";
import {
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Button,
    Menu,
    MenuItem,
    Box,
    Divider,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import GroupIcon from "@mui/icons-material/Group";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import EventIcon from "@mui/icons-material/Event";
import BeachAccessIcon from "@mui/icons-material/BeachAccess";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SchoolIcon from "@mui/icons-material/School";
import SettingsIcon from "@mui/icons-material/Settings";
import LockResetIcon from "@mui/icons-material/LockReset";
import LogoutIcon from "@mui/icons-material/Logout";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PeopleIcon from '@mui/icons-material/People';


interface HeaderProps {
    role: React.AriaRole | undefined;
}

const Header: React.FC<HeaderProps> = ({role}: HeaderProps) => {
    const navigate = useNavigate();
    const employee = useAppSelector((state) => state.employee.employee);
    const [isManager, setIsManager] = useState<boolean>(false);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
    const [anchorElDesktop, setAnchorElDesktop] = useState<null | HTMLElement>(null);

    useEffect(() => {
        if (employee?.roles) {
            setIsAdmin(employee.roles.includes("ADMIN"));
            setIsManager(employee.roles.includes("MANAGER"));
        }
    }, [employee]);

    const handleMobileDrawerToggle = () => {
        setMobileDrawerOpen(!mobileDrawerOpen);
    };

    const handleDesktopMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElDesktop(event.currentTarget);
    };

    const handleDesktopMenuClose = () => {
        setAnchorElDesktop(null);
    };

    const handleNavigation = (path: string) => {
        navigate(path);
        setMobileDrawerOpen(false);
        handleDesktopMenuClose();
    };

    // Mobile Drawer Content
    const drawer = (
        <Box
            sx={{width: 250}}
            role="presentation"
            onClick={handleMobileDrawerToggle}
            onKeyDown={handleMobileDrawerToggle}
        >
            <Box sx={{p: 2, backgroundColor: "primary.main", color: "white"}}>
                <Typography variant="h6" noWrap>
                    {employee?.firstName || "Menu"}
                </Typography>
                <Typography variant="body2" sx={{opacity: 0.8}}>
                    {employee?.email}
                </Typography>
            </Box>
            <Divider/>
            <List>
                <ListItem disablePadding>
                    <ListItemButton onClick={() => handleNavigation("/dashboard")}>
                        <HomeIcon sx={{mr: 2}}/>
                        <ListItemText primary="My View"/>
                    </ListItemButton>
                </ListItem>
                {isManager && (
                    <ListItem disablePadding>
                        <ListItemButton onClick={() => handleNavigation("/team-view")}>
                            <GroupIcon sx={{mr: 2}}/>
                            <ListItemText primary="My Team"/>
                        </ListItemButton>
                    </ListItem>
                )}
                {isAdmin && (
                    <ListItem disablePadding>
                        <ListItemButton onClick={() => handleNavigation("/all-employees")}>
                            <PersonAddIcon sx={{mr: 2}}/>
                            <ListItemText primary="All Employees"/>
                        </ListItemButton>
                    </ListItem>
                )}
                {isAdmin && (
                    <ListItem disablePadding>
                        <ListItemButton onClick={() => handleNavigation("/register")}>
                            <PersonAddIcon sx={{mr: 2}}/>
                            <ListItemText primary="Add Employee"/>
                        </ListItemButton>
                    </ListItem>
                )}
                <ListItem disablePadding>
                    <ListItemButton onClick={() => handleNavigation("/attendance")}>
                        <EventIcon sx={{mr: 2}}/>
                        <ListItemText primary="Attendance"/>
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton onClick={() => handleNavigation("/leaves")}>
                        <BeachAccessIcon sx={{mr: 2}}/>
                        <ListItemText primary="Leave"/>
                    </ListItemButton>
                </ListItem>
            </List>
            <Divider/>
            <List>
                <ListItem disablePadding>
                    <ListItemButton onClick={() => handleNavigation("/profile")}>
                        <AccountCircleIcon sx={{mr: 2}}/>
                        <ListItemText primary="Profile"/>
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton onClick={() => handleNavigation("/education")}>
                        <SchoolIcon sx={{mr: 2}}/>
                        <ListItemText primary="Education"/>
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton onClick={() => handleNavigation("/settings")}>
                        <SettingsIcon sx={{mr: 2}}/>
                        <ListItemText primary="Settings"/>
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton onClick={() => handleNavigation("/reset-password")}>
                        <LockResetIcon sx={{mr: 2}}/>
                        <ListItemText primary="Reset Password"/>
                    </ListItemButton>
                </ListItem>
            </List>
            <Divider/>
            <List>
                <ListItem disablePadding>
                    <ListItemButton onClick={() => handleNavigation("/logout")} sx={{color: "error.main"}}>
                        <LogoutIcon sx={{mr: 2}}/>
                        <ListItemText primary="Logout"/>
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    );

    return (
        <>
        <AppBar position="sticky" color="primary" elevation={2}>
            <Toolbar>
                {/* Mobile Menu Button */}
                <IconButton
                    edge="start"
                    color="inherit"
                    aria-label="menu"
                    onClick={handleMobileDrawerToggle}
                    sx={{mr: 2, display: {xs: "flex", md: "none"}}}
                >
                    <MenuIcon/>
                </IconButton>

                {/* App Title */}
                <Typography
                    variant="h6"
                    component="div"
                    sx={{
                        flexGrow: 1,
                        cursor: "pointer",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                    }}
                    onClick={() => navigate("/dashboard")}
                >
                    <HomeIcon sx={{mr: 1, display: {xs: "none", sm: "block"}}}/>
                    <Box component="span" sx={{display: {xs: "none", sm: "block"}}}>
                        Employee Management
                    </Box>
                    <Box component="span" sx={{display: {xs: "block", sm: "none"}}}>
                        EMS
                    </Box>
                </Typography>

                {/* Desktop Menu Buttons */}
                <Box sx={{display: {xs: "none", md: "flex"}, gap: 1}}>
                    <Button color="inherit" onClick={() => navigate("/dashboard")} startIcon={<HomeIcon/>}>
                        My View
                    </Button>
                    {isManager && (
                        <Button color="inherit" onClick={() => navigate("/team-view")} startIcon={<GroupIcon/>}>
                            My Team
                        </Button>
                    )}
                    {isAdmin && (
                        <Button color="inherit" onClick={() => navigate("/all-employees")} startIcon={<PeopleIcon/>}>
                            All employees
                            </Button>
                            )}
                            {isAdmin && (
                                <Button color="inherit" onClick={() => navigate("/register")}
                                        startIcon={<PersonAddIcon/>}>
                                    Add Employee
                                </Button>
                            )}
                        <Button color="inherit" onClick={() => navigate("/attendance")} startIcon={<EventIcon />}>
                        Attendance
                        </Button>
                        <Button color="inherit" onClick={() => navigate("/leaves")} startIcon={<BeachAccessIcon/>}>
                    Leave
                </Button>
                <Button color="inherit" onClick={handleDesktopMenuOpen} startIcon={<MoreVertIcon/>}>
                    More
                </Button>
            </Box>

            {/* Desktop Dropdown Menu */}
            <Menu
                id="menu-appbar-desktop"
                anchorEl={anchorElDesktop}
                open={Boolean(anchorElDesktop)}
                onClose={handleDesktopMenuClose}
                anchorOrigin={{vertical: "bottom", horizontal: "right"}}
                transformOrigin={{vertical: "top", horizontal: "right"}}
            >
                <MenuItem onClick={() => handleNavigation("/profile")}>
                    <AccountCircleIcon sx={{mr: 1}} fontSize="small"/>
                    Profile
                </MenuItem>
                <MenuItem onClick={() => handleNavigation("/education")}>
                    <SchoolIcon sx={{mr: 1}} fontSize="small"/>
                    Education
                </MenuItem>
                <MenuItem onClick={() => handleNavigation("/settings")}>
                    <SettingsIcon sx={{mr: 1}} fontSize="small"/>
                    Settings
                </MenuItem>
                <MenuItem onClick={() => handleNavigation("/reset-password")}>
                    <LockResetIcon sx={{mr: 1}} fontSize="small"/>
                    Reset Password
                </MenuItem>
                <Divider/>
                <MenuItem onClick={() => handleNavigation("/logout")} sx={{color: "error.main"}}>
                    <LogoutIcon sx={{mr: 1}} fontSize="small"/>
                    Logout
                </MenuItem>
            </Menu>
        </Toolbar>
        </AppBar>

{/* Mobile Drawer */
}
    <Drawer
        variant="temporary"
        anchor="left"
        open={mobileDrawerOpen}
        onClose={handleMobileDrawerToggle}
        ModalProps={{
            keepMounted: true, // Better performance on mobile
        }}
        sx={{
            display: {xs: "block", md: "none"},
            "& .MuiDrawer-paper": {boxSizing: "border-box", width: 250},
        }}
    >
        {drawer}
    </Drawer>
</>
)
    ;
};

export default Header;
