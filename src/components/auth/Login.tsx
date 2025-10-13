import * as React from "react";
import {ChangeEvent, FormEvent, useEffect, useState} from "react";
import {useAppDispatch, useAppSelector} from "../../redux/hooks";
import {setEmployee} from "../../redux/employeeSlice";
import {useNavigate} from "react-router-dom";
import {toast} from "react-toastify";
import {Login} from "../types/types.d";
import FullPageLoader from "../loader/FullPageLoader";
import {LOGIN_API} from "../../api/Auth";
import {Typography, Container, Box, TextField, Button, Link as MuiLink, Paper} from "@mui/material";
import {ME_API} from "../../api/Employee";

const LoginPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const employee = useAppSelector((state) => state.employee.employee);
    const [formData, setFormData] = useState<Login>({
        email: "",
        password: "",
        requestQuery: null,
    });

    const [loading, setLoading] = useState<boolean>(false);

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const {name, value} = event.target;
        setFormData((prevFormData) => ({...prevFormData, [name]: value}));
    };

    const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!formData.email || !formData.password) {
            toast.error("Please fill out all required fields.");
            return;
        }

        setLoading(true);
        try {
            const {requestQuery, ...restFormData} = formData;
            const payload = requestQuery
                ? {
                    ...restFormData,
                    requestQuery: Object.fromEntries(
                        Object.entries(requestQuery).filter(([_, value]) => value !== null)
                    ),
                }
                : restFormData;

            const response = await LOGIN_API(payload);
            if (response !== null) {
                dispatch(setEmployee(response));
                toast.success("Login successful as " + response.email);
                navigate("/dashboard");
            }
        } catch (error: any) {
            if (error?.response?.data?.error?.code === "MAX_LOGIN_ATTEMPT_REACHED") {
                toast.info(`Navigating to sessions page for ${formData?.email}`);
                setTimeout(() => {
                    navigate("/sessions", {state: {maxLoginAttempts: true, email: formData?.email}});
                }, 0);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const redirect = async () => {
            try {
                const response = await ME_API();
                if(response){
                    navigate("/dashboard");
                }
            } catch (error) {
                console.log("Not authenticated");
            }
        };
        redirect();
    }, [employee, navigate]);

    return (
        <>
            <FullPageLoader loading={loading}/>
            <Container
                maxWidth="sm"
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "100vh",
                    backgroundColor: "#f5f5f5",
                }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        padding: 4,
                        borderRadius: 3,
                        width: "100%",
                        maxWidth: 420,
                        textAlign: "center",
                    }}
                >
                    <Typography variant="h4" gutterBottom>
                        Login
                    </Typography>

                    <Box
                        component="form"
                        onSubmit={handleLogin}
                        sx={{display: "flex", flexDirection: "column", gap: 2}}
                        noValidate
                    >
                        <TextField
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            fullWidth
                            required
                        />

                        <TextField
                            label="Password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            fullWidth
                            inputProps={{minLength: 8, maxLength: 25}}
                            required
                        />

                        <Button type="submit" variant="contained" size="large" fullWidth>
                            Login
                        </Button>
                    </Box>

                    <Typography variant="body2" align="center" sx={{mt: 2}}>
                        Forgot your password?{" "}
                        <MuiLink component="button" onClick={() => navigate("/forgot-password")}>
                            Click here
                        </MuiLink>
                    </Typography>

                    <Typography variant="body2" align="center" sx={{mt: 2}}>
                        Reset your password?{" "}
                        <MuiLink component="button" onClick={() => navigate("/reset-password")}>
                            Click here
                        </MuiLink>
                    </Typography>
                </Paper>
            </Container>
        </>
    );
};

export default LoginPage;
