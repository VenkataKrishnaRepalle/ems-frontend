import {useCallback, useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {AuthState} from "../config/AuthContext";
import axios from "axios";
import {Box, Container, TextField, Typography} from "@mui/material";
import {Form} from "react-bootstrap";

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
    const [errors, setErrors] = useState({});


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
            console.log(response?.data);
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

    return <div>
        <Container maxWidth="sm">
            <Typography variant="h4" align="center" gutterBottom>{reviewType} Review</Typography>
            <Form noValidate>
                <Box sx={{display: "grid", gap: 2}}>
                    <TextField label="What went well"
                               name={"whatWentWell"}
                               type="text"
                               fullWidth
                               multiline
                               minRows={3}
                               maxRows={4}
                               required
                               sx={{width: "750px"}}
                               onChange={handleInputChange}/>
                    <TextField label="What Done Better"
                               name={"whatDoneBetter"}
                               type="text"
                               fullWidth={true}
                               multiline
                               minRows={1}
                               maxRows={4}
                               required
                               onChange={handleInputChange}/>

                    <TextField label="Way Forward"
                               name={"wayForward"}
                               type="text"
                               fullWidth={true}
                               multiline
                               minRows={1}
                               maxRows={4}
                               required
                               onChange={handleInputChange}/>

                    <TextField label="Comments"
                               name="comments"
                               type="text"
                               fullWidth={true}
                               multiline
                               minRows={1}
                               maxRows={4}
                               onChange={handleInputChange}/>

                </Box>
            </Form>
        </Container>
    </div>
};

export default Review;