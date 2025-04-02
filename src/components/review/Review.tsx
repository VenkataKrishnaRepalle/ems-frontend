import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthState } from "../config/AuthContext";
import axios from "axios";
import { Box, Button, Container, TextField, Typography } from "@mui/material";
import { Form } from "react-bootstrap";
import { toast } from "react-toastify";

interface Review {
    uuid: string;
    timelineUuid: string;
    type: string;
    whatWentWell: string;
    whatDoneBetter: string;
    wayForward: string;
    overallComments: string;
    managerWhatWentWell: string;
    managerWhatDoneBetter: string;
    managerWayForward: string;
    managerOverallComments: string;
    rating: string;
    status: string;
    createdTime: string;
    updatedTime: string;
}

interface TimelineAndReview {
    uuid: string;
    employeePeriodUuid: string;
    type: string;
    startTime: string;
    overdueTime: string;
    lockTime: string;
    endTime: string;
    status: string;
    summaryStatus: string;
    review: Review;
    createdTime: string;
    updatedTime: string;
}

const Review = () => {
    const location = useLocation();
    const state = location.state as { employeePeriodUuid?: string; reviewType?: string; year?: string } || {};
    const navigate = useNavigate();
    const { authentication } = AuthState();
    const [review, setReview] = useState<Review | null>(null);
    const [timeline, setTimeline] = useState<TimelineAndReview | null>(null);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isCompleted, setIsCompleted] = useState(false);

    useEffect(() => {
        if (!authentication?.accessToken) {
            navigate("/");
        }
    }, [authentication, navigate]);

    const fetchReview = useCallback(async () => {
        if (!authentication?.accessToken || !state.employeePeriodUuid || !state.reviewType) return;

        try {
            const response = await axios.get<TimelineAndReview>(
                `http://localhost:8082/api/timeline/getByEmployeePeriodId/${state.employeePeriodUuid}/type/${state.reviewType}`,
                { headers: { Authorization: `${authentication.accessToken}` } }
            );
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
    }, [navigate, authentication?.accessToken]);

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
        if (!review) return;

        try {
            const submitReview = await axios.post(
                `http://localhost:8082/api/reviews/add/${authentication?.userId}`,
                review,
                { headers: { Authorization: `${authentication.accessToken}` } }
            );

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
        <div className="bg-gradient p-3">
            <Container maxWidth="sm">
                <Typography variant="h4" align="center" gutterBottom>
                    {state.reviewType} Review - {state.year}
                </Typography>
                <Form onSubmit={handleSubmit} noValidate>
                    <Box sx={{ display: "grid", gap: 2 }}>
                        <TextField
                            label="What went well"
                            name="whatWentWell"
                            value={review?.whatWentWell || ""}
                            type="text"
                            fullWidth
                            multiline
                            minRows={3}
                            maxRows={4}
                            required
                            disabled={isCompleted}
                            onChange={handleInputChange}
                        />
                        <TextField
                            label="What Done Better"
                            name="whatDoneBetter"
                            value={review?.whatDoneBetter || ""}
                            type="text"
                            fullWidth
                            multiline
                            minRows={1}
                            maxRows={4}
                            required
                            disabled={isCompleted}
                            onChange={handleInputChange}
                        />
                        <TextField
                            label="Way Forward"
                            name="wayForward"
                            value={review?.wayForward || ""}
                            type="text"
                            fullWidth
                            multiline
                            minRows={1}
                            maxRows={4}
                            required
                            disabled={isCompleted}
                            onChange={handleInputChange}
                        />
                        <TextField
                            label="Comments"
                            name="overallComments"
                            value={review?.overallComments || ""}
                            type="text"
                            fullWidth
                            multiline
                            minRows={1}
                            maxRows={4}
                            disabled={isCompleted}
                            onChange={handleInputChange}
                        />
                        <Button variant="contained" color="primary" type="submit" fullWidth disabled={isCompleted}>
                            Submit {state.reviewType} Review
                        </Button>
                        <Button variant="outlined" color="error" type="reset" fullWidth sx={{ mt: 1 }} disabled={isCompleted}>
                            Reset
                        </Button>
                    </Box>
                </Form>
            </Container>
        </div>
    );
};

export default Review;
