import * as React from "react";
import {Education} from "../types/types.d";
import {useCallback, useEffect, useState} from "react";
import axios from "axios";
import {AuthState} from "../config/AuthContext";
import {toast} from "react-toastify";
import {useNavigate} from "react-router-dom";
import DeleteIcon from '@mui/icons-material/Delete';
import UpdateIcon from '@mui/icons-material/Update';
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';

import {
    Button,
    Dialog, DialogActions, DialogContent,
    DialogTitle,
    IconButton,
    MenuItem,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip
} from "@mui/material";

const DEGREE_LIST = [
    {key: "SSC_10TH", value: "SSC/CBSC/10"},
    {key: "INTERMEDIATE", value: "Intermediate/10+2"},
    {key: "DIPLOMA", value: "Diploma(3 Year)"},
    {key: "BTECH", value: "B.Tech(4 Years)"},
    {key: "MTECH", value: "M.Tech"},
    {key: "BCA", value: "BCA"},
    {key: "BSC", value: "BSC"},
];

const EducationPage: React.FC = () => {
    const {authentication} = AuthState();
    const navigate = useNavigate();
    const [educations, setEducations] = useState<Education[]>([]);
    const [editMode, setEditMode] = useState<string | null>(null);
    const [editedEducation, setEditedEducation] = useState<Partial<Education>>({});
    const [newUuid, setNewUuid] = useState<string | null>(null);
    const [openDialogueBox, setOpenDialogueBox] = useState(false);
    const [selectedEducation, setSelectedEducation] = useState<Education | null>(null);


    const [existingDegree, setExistingDegree] = useState([]);

    useEffect(() => {
        if (!authentication?.accessToken) {
            navigate("/");
        }
    }, [authentication, navigate]);

    const getEducations = useCallback(async () => {
        if (!authentication?.userId || !authentication?.accessToken) return;

        try {
            const response = await axios.get(
                `http://localhost:8082/api/education/getAll/${authentication.userId}`,
                {
                    headers: {Authorization: authentication.accessToken},
                }
            );
            if (response?.data) {
                setEducations(response.data);
                const degrees = response.data.map((education: Education) => education.degree);
                setExistingDegree(degrees);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong");
        }
    }, [authentication.userId, authentication.accessToken]);

    useEffect(() => {
        getEducations();
    }, [getEducations]);

    const handleEdit = (education: Education) => {
        setEditMode(education.uuid);
        setEditedEducation({...education});
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: keyof Education) => {
        setEditedEducation((prev) => ({
            ...prev,
            [field]: e.target.value,
        }));
    };


    const handleSave = async (uuid: string) => {
        try {
            if (uuid === newUuid) {
                await axios.post(
                    `http://localhost:8082/api/education/add`,
                    editedEducation,
                    {
                        headers: {Authorization: authentication.accessToken},
                    }
                );
                toast.success("New education added successfully!");
            } else {
                await axios.put(
                    `http://localhost:8082/api/education/update/${uuid}`,
                    editedEducation,
                    {
                        headers: {Authorization: authentication.accessToken},
                    }
                );
                toast.success("Education details updated successfully!");
            }
            await getEducations();

            setEditMode(null);
            setEditedEducation({});
            setNewUuid(null);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to save education details.");
        }
    };

    const handleAddEducation = () => {
        const generatedUuid = crypto.randomUUID();

        const newEdu: Education = {
            uuid: generatedUuid,
            employeeUuid: authentication.userId,
            schoolName: "",
            degree: "",
            grade: "",
            startDate: "",
            endDate: "",
            createdTime: new Date(),
            updatedTime: new Date()
        };
        setEducations((prev) => [...prev, newEdu]);
        setEditMode(newEdu.uuid);
        setEditedEducation(newEdu);
        setNewUuid(generatedUuid);
    };

    const handleOpenDialogueBox = (education: Education) => {
        setSelectedEducation(education);
        setOpenDialogueBox(true);
    };

    const handleCloseDialogueBox = () => {
        setSelectedEducation(null);
        setOpenDialogueBox(false);
    };

    const handleDelete = async () => {
        if (!selectedEducation) return;
        try {
            await axios.delete(`http://localhost:8082/api/education/delete/${selectedEducation.uuid}`, {
                headers: {Authorization: authentication.accessToken},
            });
            toast.success(`Education ${selectedEducation.degree} deleted successfully`);
            await getEducations();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete education details.");
        } finally {
            handleCloseDialogueBox();
        }
    };

    return (
        <div>
            <h1>Education List</h1>
            <div style={{display: "flex", justifyContent: "flex-end", marginBottom: "1rem"}}>
                <Tooltip title="Add Education">
                    <IconButton color="success" onClick={handleAddEducation}>
                        <AddIcon/>
                    </IconButton>
                </Tooltip>
            </div>

            {educations.length > 0 ? (
                <TableContainer component={Paper}>
                    <Table sx={{minWidth: 650}} aria-label="simple data">
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell align="right">Degree</TableCell>
                                <TableCell align="right">Grade</TableCell>
                                <TableCell align="right">Start Date</TableCell>
                                <TableCell align="right">End Date</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {educations.map((education) => (
                                <TableRow key={education.uuid}>
                                    <TableCell component="th" scope="row">
                                        {editMode === education.uuid ? (
                                            <TextField
                                                value={editedEducation.schoolName || ""}
                                                onChange={(e) => handleChange(e, "schoolName")}/>
                                        ) : (
                                            education.schoolName
                                        )}
                                    </TableCell>
                                    <TableCell align="right">
                                        {editMode === education.uuid ? (
                                            <TextField
                                                select
                                                value={editedEducation.degree || ""}
                                                onChange={(e) => handleChange(e, "degree")}
                                                fullWidth
                                            >
                                                {DEGREE_LIST.filter(({key}) => {
                                                    // Always show currently selected value when editing
                                                    return (
                                                        !existingDegree.includes(key) || key === education.degree
                                                    );
                                                }).map(({key, value}) => (
                                                    <MenuItem key={key} value={key}>
                                                        {value}
                                                    </MenuItem>
                                                ))}


                                            </TextField>
                                        ) : (
                                            DEGREE_LIST.find(item => item.key === education.degree)?.value || education.degree
                                        )}
                                    </TableCell>

                                    <TableCell align="right">
                                        {editMode === education.uuid ? (
                                            <TextField
                                                value={editedEducation.grade || ""}
                                                onChange={(e) => handleChange(e, "grade")}/>
                                        ) : (
                                            education.grade
                                        )}
                                    </TableCell>
                                    <TableCell align="right">
                                        {editMode === education.uuid ? (
                                            <TextField
                                                type="date"
                                                value={editedEducation.startDate || ""}
                                                onChange={(e) => handleChange(e, "startDate")}/>
                                        ) : (
                                            education.startDate
                                        )}
                                    </TableCell>
                                    <TableCell align="right">
                                        {editMode === education.uuid ? (
                                            <TextField
                                                type="date"
                                                value={editedEducation.endDate || ""}
                                                onChange={(e) => handleChange(e, "endDate")}
                                            />
                                        ) : (
                                            education.endDate
                                        )}
                                    </TableCell>
                                    <TableCell align="right">
                                        {editMode === education.uuid ? (
                                            <>
                                                <Tooltip title="Save">
                                                    <IconButton
                                                        onClick={() => handleSave(education.uuid)}
                                                        className="border-primary"
                                                        color="primary">
                                                        <SaveIcon/>
                                                    </IconButton>
                                                </Tooltip>
                                                <IconButton
                                                    onClick={() => {
                                                        if (education.uuid === newUuid) {
                                                            setEducations((prev) => prev.filter((edu) => edu.uuid !== newUuid));
                                                            setNewUuid(null);
                                                        }
                                                        setEditMode(null);
                                                        setEditedEducation({});
                                                    }}
                                                    className="btn-secondary"
                                                    color="secondary">
                                                    <CancelIcon/>
                                                </IconButton>

                                            </>
                                        ) : (
                                            <>
                                                <Tooltip title="Update">
                                                    <IconButton onClick={() => handleEdit(education)}
                                                                className="border-primary" color="primary">
                                                        <UpdateIcon/>
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete">
                                                    <IconButton onClick={() => handleOpenDialogueBox(education)}
                                                                color="error">
                                                        <DeleteIcon/>
                                                    </IconButton>
                                                </Tooltip>
                                            </>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <Dialog
                        open={openDialogueBox}
                        onClose={handleCloseDialogueBox}
                    >
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogContent>
                            Are you sure you want to
                            delete <strong>{selectedEducation?.schoolName}</strong>?
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseDialogueBox}
                                    color="primary">Cancel</Button>
                            <Button onClick={handleDelete} color="error">Delete</Button>
                        </DialogActions>
                    </Dialog>
                </TableContainer>
            ) : (
                <p>No education records found.</p>
            )}
        </div>
    );
};

export default EducationPage;
