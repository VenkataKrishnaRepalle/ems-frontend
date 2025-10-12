import * as React from "react";
import {Education} from "../types/types.d";
import {useCallback, useEffect, useState, useMemo, memo} from "react";
import {useAppSelector} from "../../redux/hooks";
import {toast} from "react-toastify";
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
    Tooltip,
    Box,
    Card,
    CardContent,
    Typography,
    Stack,
    useMediaQuery,
    useTheme
} from "@mui/material";
import {ADD_EDUCATION, DELETE_EDUCATION, GET_ALL_EDUCATIONS, UPDATE_EDUCATION} from "../../api/Education";

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
    const employee = useAppSelector((state) => state.employee.employee);
    const [educations, setEducations] = useState<Education[]>([]);
    const [editMode, setEditMode] = useState<string | null>(null);
    const [editedEducation, setEditedEducation] = useState<Partial<Education>>({});
    const [newUuid, setNewUuid] = useState<string | null>(null);
    const [openDialogueBox, setOpenDialogueBox] = useState(false);
    const [selectedEducation, setSelectedEducation] = useState<Education | null>(null);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // Memoize existing degrees to prevent recalculation
    const existingDegrees = useMemo(() =>
            educations.map((education) => education.degree),
        [educations]
    );

    const getEducations = useCallback(async () => {
        try {
            const response = await GET_ALL_EDUCATIONS(employee?.uuid);
            if (null !== response) {
                setEducations(response);
            }
        } catch (error) {
            toast.error("Something went wrong, Failed to save education details");
        }
    }, [employee?.uuid]);

    useEffect(() => {
        getEducations();
    }, [getEducations]);

    const handleEdit = useCallback((education: Education) => {
        setEditMode(education.uuid);
        setEditedEducation({...education});
    }, []);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: keyof Education) => {
        setEditedEducation((prev) => ({
            ...prev,
            [field]: e.target.value,
        }));
    }, []);

    const validateDate = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const date = new Date(Date.parse(e.target.value));
        const isValid = !isNaN(date.getTime());
        if (!isValid) {
            toast.error(`Invalid input of ${e.target.name} values ${e.target.value}`);
        }
        return isValid;
    }, []);


    const handleSave = async (uuid: string) => {
        try {
            if (uuid === newUuid) {
                await ADD_EDUCATION(editedEducation);
                toast.success(`Education degree ${editedEducation.degree} with ${editedEducation.schoolName} added successfully`);
            } else {
                await UPDATE_EDUCATION(uuid, editedEducation);
                toast.success("Education details updated successfully!");
            }
            await getEducations();

            setEditMode(null);
            setEditedEducation({});
            setNewUuid(null);
        } catch (error) {
            toast.error("Failed to update education details.");
        }
    };

    const handleAddEducation = useCallback(() => {
        const generatedUuid = crypto.randomUUID();

        const newEdu: Education = {
            uuid: generatedUuid,
            employeeUuid: employee?.uuid || "",
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
    }, [employee?.uuid]);

    const handleOpenDialogueBox = useCallback((education: Education) => {
        setSelectedEducation(education);
        setOpenDialogueBox(true);
    }, []);

    const handleCloseDialogueBox = useCallback(() => {
        setSelectedEducation(null);
        setOpenDialogueBox(false);
    }, []);

    const handleCancel = useCallback((educationUuid: string) => {
        if (educationUuid === newUuid) {
            setEducations((prev) => prev.filter((edu) => edu.uuid !== newUuid));
            setNewUuid(null);
        }
        setEditMode(null);
        setEditedEducation({});
    }, [newUuid]);

    const handleDelete = async () => {
        if (!selectedEducation) return;
        try {
            await DELETE_EDUCATION(selectedEducation.uuid);
            toast.success(`Education ${selectedEducation.degree} deleted successfully`);
            await getEducations();
        } catch (error) {
            toast.error("Failed to delete education details.");
        } finally {
            handleCloseDialogueBox();
        }
    };

    // Memoize filtered degree list
    const getAvailableDegrees = useCallback((currentDegree: string) => {
        return DEGREE_LIST.filter(({key}) =>
            !existingDegrees.includes(key) || key === currentDegree
        );
    }, [existingDegrees]);

    // Mobile Card View Component
    const EducationCard = memo(({education}: {education: Education}) => {
        const isEditing = editMode === education.uuid;
        const degreeDisplay = DEGREE_LIST.find(item => item.key === education.degree)?.value || education.degree;

        return (
            <Card sx={{mb: 2, boxShadow: 2}}>
                <CardContent>
                    <Stack spacing={2}>
                        <Box>
                            <Typography variant="caption" color="text.secondary">School Name</Typography>
                            {isEditing ? (
                                <TextField
                                    type="text"
                                    required
                                    fullWidth
                                    size="small"
                                    value={editedEducation.schoolName || ""}
                                    onChange={(e) => handleChange(e, "schoolName")}
                                />
                            ) : (
                                <Typography variant="body1" fontWeight="bold">{education.schoolName}</Typography>
                            )}
                        </Box>

                        <Box>
                            <Typography variant="caption" color="text.secondary">Degree</Typography>
                            {isEditing ? (
                                <TextField
                                    select
                                    fullWidth
                                    size="small"
                                    value={editedEducation.degree || ""}
                                    onChange={(e) => handleChange(e, "degree")}
                                >
                                    {getAvailableDegrees(education.degree).map(({key, value}) => (
                                        <MenuItem key={key} value={key}>{value}</MenuItem>
                                    ))}
                                </TextField>
                            ) : (
                                <Typography variant="body1">{degreeDisplay}</Typography>
                            )}
                        </Box>

                        <Box display="flex" gap={2}>
                            <Box flex={1}>
                                <Typography variant="caption" color="text.secondary">Grade</Typography>
                                {isEditing ? (
                                    <TextField
                                        type="text"
                                        required
                                        fullWidth
                                        size="small"
                                        value={editedEducation.grade || ""}
                                        onChange={(e) => handleChange(e, "grade")}
                                    />
                                ) : (
                                    <Typography variant="body1">{education.grade}</Typography>
                                )}
                            </Box>
                        </Box>

                        <Box display="flex" gap={2}>
                            <Box flex={1}>
                                <Typography variant="caption" color="text.secondary">Start Date</Typography>
                                {isEditing ? (
                                    <TextField
                                        type="date"
                                        fullWidth
                                        size="small"
                                        value={editedEducation.startDate || ""}
                                        onChange={(e) => {
                                            if (validateDate(e)) {
                                                handleChange(e, "startDate");
                                            }
                                        }}
                                    />
                                ) : (
                                    <Typography variant="body1">{education.startDate}</Typography>
                                )}
                            </Box>
                            <Box flex={1}>
                                <Typography variant="caption" color="text.secondary">End Date</Typography>
                                {isEditing ? (
                                    <TextField
                                        type="date"
                                        fullWidth
                                        size="small"
                                        value={editedEducation.endDate || ""}
                                        onChange={(e) => {
                                            if (validateDate(e)) {
                                                handleChange(e, "endDate");
                                            }
                                        }}
                                    />
                                ) : (
                                    <Typography variant="body1">{education.endDate}</Typography>
                                )}
                            </Box>
                        </Box>

                        <Box display="flex" gap={1} justifyContent="flex-end">
                            {isEditing ? (
                                <>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        size="small"
                                        startIcon={<SaveIcon />}
                                        onClick={() => handleSave(education.uuid)}
                                    >
                                        Save
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="secondary"
                                        size="small"
                                        startIcon={<CancelIcon />}
                                        onClick={() => handleCancel(education.uuid)}
                                    >
                                        Cancel
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        size="small"
                                        startIcon={<UpdateIcon />}
                                        onClick={() => handleEdit(education)}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        size="small"
                                        startIcon={<DeleteIcon />}
                                        onClick={() => handleOpenDialogueBox(education)}
                                    >
                                        Delete
                                    </Button>
                                </>
                            )}
                        </Box>
                    </Stack>
                </CardContent>
            </Card>
        );
    });

    return (
        <Box sx={{p: {xs: 2, md: 3}}}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" component="h1">Education List</Typography>
                <Tooltip title="Add Education">
                    <IconButton color="success" onClick={handleAddEducation} size="large">
                        <AddIcon/>
                    </IconButton>
                </Tooltip>
            </Box>

            {educations.length > 0 ? (
                isMobile ? (
                    // Mobile Card View
                    <Box>
                        {educations.map((education) => (
                            <EducationCard key={education.uuid} education={education} />
                        ))}
                    </Box>
                ) : (
                    // Desktop Table View
                    <TableContainer component={Paper} sx={{boxShadow: 2}}>
                        <Table sx={{minWidth: 650}} aria-label="education table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>School Name</TableCell>
                                    <TableCell>Degree</TableCell>
                                    <TableCell>Grade</TableCell>
                                    <TableCell>Start Date</TableCell>
                                    <TableCell>End Date</TableCell>
                                    <TableCell align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {educations.map((education) => (
                                    <TableRow key={education.uuid} hover>
                                        <TableCell component="th" scope="row">
                                            {editMode === education.uuid ? (
                                                <TextField
                                                    type="text"
                                                    required
                                                    size="small"
                                                    value={editedEducation.schoolName || ""}
                                                    onChange={(e) => handleChange(e, "schoolName")}
                                                />
                                            ) : (
                                                education.schoolName
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {editMode === education.uuid ? (
                                                <TextField
                                                    select
                                                    size="small"
                                                    value={editedEducation.degree || ""}
                                                    onChange={(e) => handleChange(e, "degree")}
                                                    sx={{minWidth: 180}}
                                                >
                                                    {getAvailableDegrees(education.degree).map(({key, value}) => (
                                                        <MenuItem key={key} value={key}>{value}</MenuItem>
                                                    ))}
                                                </TextField>
                                            ) : (
                                                DEGREE_LIST.find(item => item.key === education.degree)?.value || education.degree
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {editMode === education.uuid ? (
                                                <TextField
                                                    type="text"
                                                    required
                                                    size="small"
                                                    value={editedEducation.grade || ""}
                                                    onChange={(e) => handleChange(e, "grade")}
                                                />
                                            ) : (
                                                education.grade
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {editMode === education.uuid ? (
                                                <TextField
                                                    type="date"
                                                    size="small"
                                                    value={editedEducation.startDate || ""}
                                                    onChange={(e) => {
                                                        if (validateDate(e)) {
                                                            handleChange(e, "startDate");
                                                        }
                                                    }}
                                                />
                                            ) : (
                                                education.startDate
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {editMode === education.uuid ? (
                                                <TextField
                                                    type="date"
                                                    size="small"
                                                    value={editedEducation.endDate || ""}
                                                    onChange={(e) => {
                                                        if (validateDate(e)) {
                                                            handleChange(e, "endDate");
                                                        }
                                                    }}
                                                />
                                            ) : (
                                                education.endDate
                                            )}
                                        </TableCell>
                                        <TableCell align="center">
                                            <Box display="flex" gap={0.5} justifyContent="center">
                                                {editMode === education.uuid ? (
                                                    <>
                                                        <Tooltip title="Save">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleSave(education.uuid)}
                                                                color="primary"
                                                            >
                                                                <SaveIcon/>
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Cancel">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleCancel(education.uuid)}
                                                                color="secondary"
                                                            >
                                                                <CancelIcon/>
                                                            </IconButton>
                                                        </Tooltip>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Tooltip title="Update">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleEdit(education)}
                                                                color="primary"
                                                            >
                                                                <UpdateIcon/>
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Delete">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleOpenDialogueBox(education)}
                                                                color="error"
                                                            >
                                                                <DeleteIcon/>
                                                            </IconButton>
                                                        </Tooltip>
                                                    </>
                                                )}
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )
            ) : (
                <Paper sx={{p: 4, textAlign: "center"}}>
                    <Typography variant="body1" color="text.secondary">
                        No education records found. Click the + button to add one.
                    </Typography>
                </Paper>
            )}

            <Dialog
                open={openDialogueBox}
                onClose={handleCloseDialogueBox}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete <strong>{selectedEducation?.schoolName}</strong>?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialogueBox} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleDelete} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default EducationPage;
