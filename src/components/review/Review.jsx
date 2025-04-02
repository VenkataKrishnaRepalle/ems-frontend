import React, {useCallback, useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {AuthState} from "../config/AuthContext";
import axios from "axios";
import {Box, Button, Container, TextField, Typography} from "@mui/material";
import {Form} from "react-bootstrap";
import {toast} from "react-toastify";

const Review = () => {
    const location = useLocation();
    const state = location.state || {};
    const navigate = useNavigate();
    const {authentication} = AuthState();
    const [review, setReview] = useState({
        uuid: "",
        timelineUuid: "",
        type: "",
        whatWentWell: "",
        whatDoneBetter: "",
        wayForward: "",
        overallComments: "",
        managerWhatWentWell: "",
        managerWhatDoneBetter: "",
        managerWayForward: "",
        managerOverallComments: "",
        rating: "",
        status: "",
        createdTime: "",
        updatedTime: "",
    });
    const [timeline, setTimeline] = useState([]);
    const employeePeriodUuid = state?.employeePeriodUuid || "";
    const reviewType = state?.reviewType || "";
    const year = state?.year || "";
    const [errors, setErrors] = useState({});
    const [isCompleted, setIsCompleted] = useState(false);


    useEffect(() => {
        if (!authentication?.accessToken) {
            navigate("/");
        }
    }, [authentication, navigate]);

    const fetchReview = useCallback(async () => {
        if (!authentication?.accessToken || !employeePeriodUuid || !reviewType) return;

        try {
            const response = await axios.get(
                `http://localhost:8082/api/timeline/getByEmployeePeriodId/${employeePeriodUuid}/type/${reviewType}`,
                {headers: {Authorization: `${authentication.accessToken}`}}
            );
            setTimeline(response?.data || []);
            setReview(response?.data?.review || []);
            setReview((prevReview) => ({
                ...prevReview,
                timelineUuid: response?.data?.uuid,
                type: response?.data?.type,
            }));
            if (response?.data?.status === "COMPLETED") {
                setIsCompleted(true);
            }
        } catch (error) {
            if (error.response?.data?.errorCode === "TOKEN_EXPIRED") {
                navigate("/");
            }
        }
    }, [authentication.accessToken, navigate]);

    useEffect(() => {
        fetchReview();
    }, [fetchReview]);

    const handleInputChange = (event) => {
        const {name, value} = event.target;
        setReview({...review, [name]: value});
        setErrors((prevErrors) => {
            const newErrors = {...prevErrors};
            if (value.trim() === "") {
                newErrors[name] = `${name.replace(/([A-Z])/g, " $1")} is required.`;
            } else {
                delete newErrors[name];
            }
            return newErrors;
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const submitReview = await axios.post(`http://localhost:8082/api/reviews/add/${authentication?.userId}`, review, {
                headers: {
                    Authorization: `${authentication.accessToken}`,
                },
            });
            if (submitReview.status === 201) {
                toast.success("Review submitted successfully");
                navigate("/dashboard");
            } else {
                toast.error(submitReview?.data?.error?.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error?.error?.message);
        }
    };

    return <div className="bg-gradient p-3">
        <Container maxWidth="sm">
            <Typography variant="h4" align="center" gutterBottom>{reviewType} Review - {year}</Typography>
            <Form onSubmit={handleSubmit} noValidate>
                <Box sx={{display: "grid", gap: 2}}>
                    <TextField label="What went well"
                               name={"whatWentWell"}
                               value={review.whatWentWell}
                               type="text"
                               fullWidth
                               multiline
                               minRows={3}
                               maxRows={4}
                               required
                               sx={{width: "750px"}}
                               disabled={isCompleted}
                               onChange={handleInputChange}/>
                    <TextField label="What Done Better"
                               name={"whatDoneBetter"}
                               type="text"
                               value={review.whatDoneBetter}
                               fullWidth={true}
                               multiline
                               minRows={1}
                               maxRows={4}
                               required
                               disabled={isCompleted}
                               onChange={handleInputChange}/>

                    <TextField label="Way Forward"
                               name={"wayForward"}
                               type="text"
                               value={review.wayForward}
                               fullWidth={true}
                               multiline
                               minRows={1}
                               maxRows={4}
                               required
                               disabled={isCompleted}
                               onChange={handleInputChange}/>

                    <TextField label="Comments"
                               name="overallComments"
                               type="text"
                               value={review.overallComments}
                               fullWidth={true}
                               multiline
                               minRows={1}
                               maxRows={4}
                               disabled={isCompleted}
                               onChange={handleInputChange}/>
                    <Button variant="contained" color="primary" type="submit" fullWidth disabled={isCompleted}>
                        Submit {reviewType} Review
                    </Button>
                    <Button variant="outlined" color="error" type="reset" fullWidth sx={{mt: 1}} disabled={isCompleted}>
                        Reset
                    </Button>

                </Box>
            </Form>
        </Container>
    </div>
};

export default Review;