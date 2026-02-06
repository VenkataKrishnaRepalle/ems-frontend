import * as React from "react";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import FullPageLoader from "../loader/FullPageLoader";
import { Typography, Container, Box, TextField, Button, Link as MuiLink, Paper, Divider } from "@mui/material";
import { ME_API } from "../../api/Employee";
import { useAuth } from "../../auth/AuthContext";
import { LOGIN_API } from "../../api/Auth";
import { Login } from "../types/types.d";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { setEmployee } from "../../redux/employeeSlice";

const LoginPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { configured, initialized, authenticated, login } = useAuth();
    const employee = useAppSelector((state) => state.employee.employee);

    const [formData, setFormData] = useState<Login>({
        email: "",
        password: "",
        requestQuery: null,
    });
    const [loading, setLoading] = useState<boolean>(false);

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
    };

    const handleKeycloakLogin = async () => {
        if (!configured) {
            toast.error("Keycloak is not configured. Set REACT_APP_KEYCLOAK_URL/REALM/CLIENT_ID.");
            return;
        }
        setLoading(true);
        try {
            login();
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordLogin = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!formData.email || !formData.password) {
            toast.error("Please fill out all required fields.");
            return;
        }

        setLoading(true);
        try {
            const { requestQuery, ...restFormData } = formData;
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
                    navigate("/sessions", { state: { maxLoginAttempts: true, email: formData?.email } });
                }, 0);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (employee?.uuid) {
            navigate("/dashboard");
            return;
        }

        const redirect = async () => {
            try {
                const me = await ME_API();
                if (me?.uuid) {
                    dispatch(setEmployee(me));
                    navigate("/dashboard");
                }
            } catch {
                // not authenticated
            }
        };

        if ((configured && initialized && authenticated) || !configured) {
            redirect();
        }
    }, [authenticated, configured, dispatch, employee?.uuid, initialized, navigate]);

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

                    <Button
                        variant="contained"
                        size="large"
                        fullWidth
                        onClick={handleKeycloakLogin}
                        disabled={!configured}
                        sx={{ mb: 2 }}
                    >
                        Login with Keycloak
                    </Button>

                    <Divider sx={{ my: 2 }}>or</Divider>

                    <Box
                        component="form"
                        onSubmit={handlePasswordLogin}
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

                        <Button type="submit" variant="outlined" size="large" fullWidth>
                            Login with Email & Password
                        </Button>
                    </Box>

                    {!configured && (
                        <Typography variant="body2" align="center" sx={{mt: 2}} color="text.secondary">
                            Keycloak disabled: missing env vars REACT_APP_KEYCLOAK_URL, REACT_APP_KEYCLOAK_REALM,
                            REACT_APP_KEYCLOAK_CLIENT_ID
                        </Typography>
                    )}

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
