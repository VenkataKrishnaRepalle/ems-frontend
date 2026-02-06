import React, {ChangeEvent, FormEvent, useEffect, useState} from "react";
import {
    Button,
    Container,
    TextField,
    Typography,
    Box,
    Autocomplete, InputAdornment, IconButton,
} from "@mui/material";
import {useNavigate} from "react-router-dom";
import {useAppDispatch, useAppSelector} from "../../redux/hooks";
import {Visibility, VisibilityOff} from "@mui/icons-material";
import {toast} from "react-toastify";
import {Department, EmployeeRequest, Manager} from "../types/types.d";
import {GET_ALL_DEPARTMENTS_API} from "../../api/Department";
import {ADD_EMPLOYEE, GET_ACTIVE_MANAGERS, ME_API} from "../../api/Employee";
import {setEmployee} from "../../redux/employeeSlice";


const Register: React.FC = () => {
    const currentUser = useAppSelector((state) => state.employee.employee);
    const navigate = useNavigate();
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const dispatch = useAppDispatch();

    const [employee, setEmployeeData] = useState<EmployeeRequest>({
        firstName: "",
        lastName: "",
        gender: "",
        dateOfBirth: "",
        phoneNumber: "",
        email: "",
        joiningDate: "",
        leavingDate: "",
        departmentName: "",
        isManager: "",
        managerUuid: "",
        jobTitle: "",
        password: "",
        confirmPassword: "",
    });

    const [departments, setDepartments] = useState<Department[]>([]);
    const [loadingDepartments, setLoadingDepartments] = useState<boolean>(false);
    const [managers, setManagers] = useState<Manager[]>([]);
    const [loadingManagers, setLoadingManagers] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        const fetchAndSetUser = async () => {
            if (currentUser == null) {
                try {
                    const employeeDetails = await ME_API();
                    dispatch(setEmployee(employeeDetails));
                } catch (error) {
                    console.error("Failed to fetch user details:", error);
                }
            } else {
                setIsAdmin(currentUser?.roles?.includes("ADMIN") ?? false);
            }
        };

        fetchAndSetUser();
    }, [currentUser, dispatch]);

    const fetchDepartments = async () => {
        if (departments.length > 0) return;
        setLoadingDepartments(true);
        try {
            const response = await GET_ALL_DEPARTMENTS_API();
            setDepartments(response);
        } catch (error) {
            handleAuthError(error);
        } finally {
            setLoadingDepartments(false);
        }
    };

    const fetchManagers = async () => {
        if (managers.length > 0) return;
        setLoadingManagers(true);
        try {
            const response = await GET_ACTIVE_MANAGERS();
            setManagers(response);
        } catch (error) {
            handleAuthError(error);
        } finally {
            setLoadingManagers(false);
        }
    };

    const handleAuthError = (error: any) => {
        const errorCode = error.response?.data?.errorCode;
        if (errorCode === "TOKEN_NOT_PROVIDED" || errorCode === "TOKEN_EXPIRED") {
            navigate("/", {replace: true});
        }
    };

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const {name, value} = event.target;
        setEmployeeData((prev) => ({...prev, [name]: value}));
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!employee.firstName) newErrors.firstName = "First name is required.";
        if (!employee.lastName) newErrors.lastName = "Last name is required.";
        if (!employee.gender) newErrors.gender = "Gender is required.";
        if (!employee.email || !/\S+@\S+\.\S+/.test(employee.email)) newErrors.email = "Valid email is required.";
        if (!employee.phoneNumber || !/^\d{10}$/.test(employee.phoneNumber)) newErrors.phoneNumber = "Valid phone number is required (10 digits).";
        if (!employee.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required.";
        if (!employee.joiningDate) newErrors.joiningDate = "Joining date is required.";
        if (!employee.isManager) newErrors.isManager = "Manager status is required.";
        if (!employee.password || employee.password.length < 6) newErrors.password = "Password must be at least 6 characters.";
        if (employee.password !== employee.confirmPassword) newErrors.confirmPassword = "Passwords do not match.";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        if (!validateForm()) return;

        try {
            const response = await ADD_EMPLOYEE(employee);
            if (response.status === 201) {
                toast.success("Employee added successfully");
                navigate("/dashboard");
            } else {
                toast.error("Failed to add new employee");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred while adding the employee.");
        }
    };

    const handleTogglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleToggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    if (!isAdmin) {
        return <Typography variant="h4" align="center">You are not authorized to access this page</Typography>;
    }

    return (
        <Container maxWidth="sm">
            <Box sx={{p: 4, boxShadow: 3, borderRadius: 2, mt: 5, bgcolor: "background.paper"}}>
                <Typography variant="h4" align="center" gutterBottom>
                    Register
                </Typography>
                <form onSubmit={handleSubmit} noValidate>
                    <Box sx={{display: "grid", gap: 2}}>
                        <TextField
                            label="First Name"
                            name="firstName"
                            type="text"
                            fullWidth={true}
                            required={true}
                            onChange={handleInputChange}
                            error={!!errors.firstName}
                            helperText={errors.firstName}/>
                        <TextField
                            label="Last Name"
                            name="lastName"
                            type="text"
                            fullWidth={true}
                            required={true}
                            onChange={handleInputChange}
                            error={!!errors.lastName}
                            helperText={errors.lastName}/>
                        <Autocomplete
                            options={[
                                {label: "Male", value: "MALE"},
                                {label: "Female", value: "FEMALE"},
                                {label: "Others", value: "OTHERS"},
                            ]}
                            getOptionLabel={(option) => option.label}
                            onChange={(_event, newValue) => {
                                setEmployeeData({
                                    ...employee,
                                    gender: newValue ? newValue.value : ""
                                });
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label={"Gender"}
                                    name={"gender"}
                                    placeholder={"Select gender"}
                                    required={true}
                                    fullWidth={true}
                                />
                            )}
                        />
                        < TextField
                            label="Email"
                            name="email"
                            type="email"
                            fullWidth={true}
                            required={true}
                            onChange={handleInputChange}
                            error={!!errors.email}
                            helperText={errors.email}/>
                        <TextField
                            label="Phone Number"
                            name="phoneNumber"
                            type="text"
                            fullWidth={true}
                            required={true}
                            onChange={handleInputChange}
                            error={!!errors.phoneNumber}
                            helperText={errors.phoneNumber}/>
                        <TextField
                            label="Date of Birth"
                            name="dateOfBirth"
                            type="date"
                            slotProps={{inputLabel: {shrink: true}}}
                            fullWidth={true}
                            required={true}
                            onChange={handleInputChange}
                            error={!!errors.dateOfBirth}
                            helperText={errors.dateOfBirth}/>
                        <TextField
                            label="Joining Date"
                            name="joiningDate"
                            type="date"
                            slotProps={{inputLabel: {shrink: true}}}
                            fullWidth={true}
                            required={true}
                            onChange={handleInputChange}
                            error={!!errors.joiningDate}
                            helperText={errors.joiningDate}/>
                        <TextField
                            label="Leaving Date"
                            name="leavingDate"
                            type="date"
                            slotProps={{inputLabel: {shrink: true}}}
                            fullWidth={true}
                            onChange={handleInputChange}/>
                        <Autocomplete
                            options={departments}
                            loading={loadingDepartments}
                            onFocus={fetchDepartments}
                            getOptionLabel={(dept) => dept.name}
                            onChange={(_event, newValue) => {
                                const departmentValid = newValue && newValue.value;

                                setEmployeeData({
                                    ...employee,
                                    departmentName: departmentValid ? newValue.value : "",
                                });
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Department"
                                    name="departmentName"
                                    placeholder="Select a department"
                                    fullWidth={true}
                                    required={true}
                                />
                            )}
                        />

                        <Autocomplete
                            options={[
                                {label: "Yes", value: "true"},
                                {label: "No", value: "false"}
                            ]}
                            getOptionLabel={(option) => option.label}
                            onChange={(_event, newValue) => {
                                setEmployeeData({
                                    ...employee,
                                    isManager: newValue ? newValue.value : ""
                                });

                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Is Manager"
                                    name={"isManager"}
                                    placeholder="Select an option"
                                    fullWidth={true}
                                    required={true}
                                />
                            )}
                        />

                        <Autocomplete
                            options={managers}
                            getOptionLabel={(manager) =>
                                `${manager.firstName} ${manager.lastName} ${manager.email}`
                            }
                            loading={loadingManagers}
                            onFocus={fetchManagers}
                            onChange={(_event, newValue) => {
                                setEmployeeData({
                                    ...employee,
                                    managerUuid: newValue ? newValue.uuid : "",
                                });
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Manager"
                                    name={"managerUuid"}
                                    placeholder="Select a manager"
                                    fullWidth={true}
                                    required={true}
                                />
                            )}
                        />
                        <Autocomplete
                            options={[
                                {label: "Engineer Trainee", value: "ENGINEER_TRAINEE"},
                                {label: "Software Engineer", value: "SOFTWARE_ENGINEER"},
                                {label: "Senior Software Engineer", value: "SENIOR_SOFTWARE_ENGINEER"},
                                {label: "Module Lead", value: "MODULE_LEAD"},
                                {label: "Technical Lead", value: "TECHNICAL_LEAD"},
                                {label: "Project Lead", value: "PROJECT_LEAD"},
                                {label: "Project Manager", value: "PROJECT_MANAGER"},
                                {label: "Senior Project Manager", value: "SENIOR_PROJECT_MANAGER"},
                                {label: "Principal Delivery Manager", value: "PRINCIPAL_DELIVERY_MANAGER"},
                                {label: "Associative Director", value: "ASSOCIATIVE_DIRECTOR"},
                                {label: "Senior Director", value: "SENIOR_DIRECTOR"},
                                {label: "Chief Delivery Officer", value: "CHIEF_DELIVERY_OFFICER"},
                                {label: "Deputy CEO", value: "DEPUTY_CEO"},
                                {label: "CEO", value: "CEO"},
                            ]}
                            getOptionLabel={(option) => option.label}
                            onChange={(_event, newValue) => {
                                setEmployeeData({
                                    ...employee,
                                    jobTitle: newValue ? newValue.value : ""
                                });
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label={"Job Title"}
                                    name={"jobTitle"}
                                    placeholder={"Select Job Title"}
                                    required={true}
                                    fullWidth={true}
                                />
                            )}
                        />
                        <TextField
                            label="Password"
                            name={"password"}
                            type={showPassword ? "text" : "password"}
                            fullWidth
                            variant="outlined"
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={handleTogglePasswordVisibility}
                                                edge="end"
                                                aria-label="toggle password visibility"
                                            >
                                                {showPassword ? <VisibilityOff/> : <Visibility/>}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                            onChange={handleInputChange}
                            error={!!errors.password}
                            helperText={errors.password}
                        />
                        < TextField
                            label="Confirm Password"
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            fullWidth
                            variant="outlined"
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={handleToggleConfirmPasswordVisibility}
                                                edge="end"
                                                aria-label="toggle confirm password visibility"
                                            >
                                                {showConfirmPassword ? <VisibilityOff/> : <Visibility/>}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                            onChange={handleInputChange}
                            error={!!errors.confirmPassword}
                            helperText={errors.confirmPassword}
                        />
                    </Box>
                    <Box sx={{mt: 3}}>
                        <Button variant="contained" color="primary" type="submit" fullWidth>
                            Add New
                        </Button>
                        <Button variant="outlined" color="error" type="reset" fullWidth sx={{mt: 1}}>
                            Reset
                        </Button>
                    </Box>
                </form>
            </Box>
        </Container>
    );
};

export default Register;
