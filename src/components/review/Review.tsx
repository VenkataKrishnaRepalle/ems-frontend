import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthState } from "../config/AuthContext";
import { Box, Button, Container, TextField, Typography } from "@mui/material";
import { toast } from "react-toastify";
import { TimelineAndReview, Review } from "../types/types.d";
import { GET_EMPLOYEE_PERIOD_BY_TYPE } from "../../api/Timeline";
import { ADD_REVIEW_API } from "../../api/Review";

const AddReview = () => {
    const location = useLocation();
    const state = location.state as { employeePeriodUuid?: string; reviewType?: string; year?: string } || {};
    const navigate = useNavigate();
    const { authentication } = AuthState();
    const [review, setReview] = useState<Review | null>(null);
    const [timeline, setTimeline] = useState<TimelineAndReview | null>(null);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isCompleted, setIsCompleted] = useState(false);

    const fetchReview = useCallback(async () => {
        try {
            const response = await GET_EMPLOYEE_PERIOD_BY_TYPE(state.employeePeriodUuid, state.reviewType);
            setTimeline(response.data);
            setReview({ ...response.data.review, timelineUuid: response.data.uuid, type: response.data.type });
            if (response.data.status === "COMPLETED") {
                setIsCompleted(true);
            }
        } catch (error: any) {
            if (error.response?.data?.errorCode === "TOKEN_EXPIRED") {
                navigate("/");
            } else {
                console.error("Error fetching review:", error);
            }
        }
    }, [navigate, state.reviewType, state.employeePeriodUuid]);

    useEffect(() => {
        fetchReview();
    }, [fetchReview]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setReview((prevReview) => (prevReview ? { ...prevReview, [name]: value } : null));

        setErrors((prevErrors) => {
            const newErrors = { ...prevErrors };
            if (value.trim() === "") {
                newErrors[name] = `${name.replace(/([A-Z])/g, " $1")} is required.`;
            } else {
                delete newErrors[name];
            }
            return newErrors;
        });
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!review || !authentication?.userId) return;

        try {
            const submitReview = await ADD_REVIEW_API(authentication.userId, review);

            if (submitReview.status === 201) {
                toast.success("Review submitted successfully");
                navigate("/dashboard");
            } else {
                toast.error(submitReview.data?.error?.message);
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error?.response?.data?.message || "An error occurred");
        }
    };

    return (
        <Box className="bg-gradient" p={3}>
            <Container maxWidth="sm">
                <Typography variant="h4" align="center" gutterBottom>
                    {state.reviewType} Review - {state.year}
                </Typography>
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: "grid", gap: 2 }}>
                    <TextField
                        label="What went well"
                        name="whatWentWell"
                        value={review?.whatWentWell || ""}
                        fullWidth
                        multiline
                        minRows={3}
                        maxRows={4}
                        required
                        disabled={isCompleted}
                        onChange={handleInputChange}
                        error={!!errors.whatWentWell}
                        helperText={errors.whatWentWell}
                    />
                    <TextField
                        label="What Done Better"
                        name="whatDoneBetter"
                        value={review?.whatDoneBetter || ""}
                        fullWidth
                        multiline
                        minRows={1}
                        maxRows={4}
                        required
                        disabled={isCompleted}
                        onChange={handleInputChange}
                        error={!!errors.whatDoneBetter}
                        helperText={errors.whatDoneBetter}
                    />
                    <TextField
                        label="Way Forward"
                        name="wayForward"
                        value={review?.wayForward || ""}
                        fullWidth
                        multiline
                        minRows={1}
                        maxRows={4}
                        required
                        disabled={isCompleted}
                        onChange={handleInputChange}
                        error={!!errors.wayForward}
                        helperText={errors.wayForward}
                    />
                    <TextField
                        label="Comments"
                        name="overallComments"
                        value={review?.overallComments || ""}
                        fullWidth
                        multiline
                        minRows={1}
                        maxRows={4}
                        disabled={isCompleted}
                        onChange={handleInputChange}
                        error={!!errors.overallComments}
                        helperText={errors.overallComments}
                    />
                    <Button variant="contained" color="primary" type="submit" fullWidth disabled={isCompleted}>
                        Submit {state.reviewType} Review
                    </Button>
                    <Button
                        variant="outlined"
                        color="error"
                        type="reset"
                        fullWidth
                        sx={{ mt: 1 }}
                        disabled={isCompleted}
                        onClick={() =>
                            setReview(
                                timeline?.review
                                    ? { ...timeline.review, timelineUuid: timeline.uuid, type: timeline.type }
                                    : null
                            )
                        }
                    >
                        Reset
                    </Button>
                </Box>
            </Container>
        </Box>
    );
};

export default AddReview;
