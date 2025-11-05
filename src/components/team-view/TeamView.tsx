import React, {useCallback, useEffect, useState} from "react";
import {useAppDispatch, useAppSelector} from "../../redux/hooks";
import {useNavigate} from "react-router-dom";
import {GET_EMPLOYEES_BY_MANAGER_API, GET_FULL_TEAM_API, ME_API} from "../../api/Employee";
import {setEmployee} from "../../redux/employeeSlice";
import {Employee} from "../types/types.d";
import {ValidateLogin} from "../auth/ValidateLogin";
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Avatar,
    Chip,
    Paper,
    useTheme,
    CircularProgress,
    Container, IconButton,
    Collapse,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import WorkIcon from "@mui/icons-material/Work";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {toast} from "react-toastify";

const TeamView: React.FC = () => {
    ValidateLogin();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const theme = useTheme();

    const employee = useAppSelector(state => state.employee.employee);
    const [myManagerReportees, setMyManagerReportees] = useState<Employee[]>([]);
    const [myReportees, setMyReportees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedManagers, setExpandedManagers] = useState<Record<string, boolean>>({});
    const [managerReporteesMap, setManagerReporteesMap] = useState<Record<string, Employee[]>>({});
    const [managerLoadingMap, setManagerLoadingMap] = useState<Record<string, boolean>>({});
    const [managerErrorMap, setManagerErrorMap] = useState<Record<string, string>>({});

    const fetchEmployee = useCallback(async () => {
        try {
            const employee = await ME_API();
            if (employee) {
                dispatch(setEmployee(employee));
            }
        } catch (error) {
            navigate("/");
        }
    }, [dispatch, navigate]);

    const getFullTeam = useCallback(async () => {
        if (!employee?.uuid) return;

        try {
            setLoading(true);
            const team = await GET_FULL_TEAM_API(employee.uuid);
            if (team) {
                if(team?.myManagerReportees) {
                    setMyManagerReportees(team.myManagerReportees);
                }
                if(team?.myReportees) {
                    setMyReportees(team.myReportees);
                }
            }
        } catch (error) {
            toast.error("Failed to load team data");
        } finally {
            setLoading(false);
        }
    }, [employee?.uuid]);

    useEffect(() => {
        if (!employee) {
            fetchEmployee();
        }
    }, [employee, fetchEmployee]);

    useEffect(() => {
        if (employee?.uuid) {
            getFullTeam();
        }
    }, [employee?.uuid, getFullTeam]);

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
    };

    const handleToggleManager = useCallback(async (managerId: string) => {
        const shouldExpand = !expandedManagers[managerId];

        setExpandedManagers(prev => ({
            ...prev,
            [managerId]: shouldExpand,
        }));

        if (shouldExpand && !managerReporteesMap[managerId] && !managerLoadingMap[managerId]) {
            setManagerLoadingMap(prev => ({ ...prev, [managerId]: true }));
            setManagerErrorMap(prev => {
                const { [managerId]: _removed, ...rest } = prev;
                return rest;
            });

            try {
                const reportees = await GET_EMPLOYEES_BY_MANAGER_API(managerId);
                setManagerReporteesMap(prev => ({ ...prev, [managerId]: reportees }));
            } catch (error) {
                setManagerErrorMap(prev => ({
                    ...prev,
                    [managerId]: "Failed to load manager details",
                }));
            } finally {
                setManagerLoadingMap(prev => ({ ...prev, [managerId]: false }));
            }
        }
    }, [expandedManagers, managerLoadingMap, managerReporteesMap]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    const MemberCard = ({ member }: { member: Employee }) => {
        const isExpanded = !!expandedManagers[member.uuid];
        const reportees = managerReporteesMap[member.uuid] || [];
        const isLoading = !!managerLoadingMap[member.uuid];
        const errorMessage = managerErrorMap[member.uuid];

        return (
        <Card elevation={3} sx={{ borderRadius: 2, height: '100%' }}>
            <CardContent>
                <Box display="flex" alignItems="flex-start" mb={2}>
                    <Avatar
                        sx={{
                            bgcolor: theme.palette.primary.main,
                            width: { xs: 56, md: 40 },
                            height: { xs: 56, md: 40 },
                            mr: 2,
                            mt: { xs: 0, md: 1 }
                        }}
                    >
                        {getInitials(member.firstName, member.lastName)}
                    </Avatar>
                    <Box flex={1}>
                        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} alignItems={{ md: 'center' }}>
                            <Box display="flex" alignItems="center">
                                <Typography variant="h6" fontWeight="bold" mr={{ md: 2 }}>
                                    {member.firstName} {member.lastName}
                                </Typography>
                                {member.isManager && (
                                    <IconButton
                                        aria-label={isExpanded ? "Collapse manager reportees" : "Expand manager reportees"}
                                        size="small"
                                        onClick={() => handleToggleManager(member.uuid)}
                                    >
                                        {isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                                    </IconButton>
                                )}
                            </Box>
                            <Box display="flex" mt={{ xs: 0.5, md: 0 }}>
                                <Chip
                                    label={"EMPLOYEE"}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                    sx={{ mr: 1 }}
                                />
                                {member.isManager && (
                                    <Chip
                                        label={"MANAGER"}
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                    />
                                )}
                            </Box>
                        </Box>

                        <Box display={{ xs: 'block', md: 'none' }} mt={2}>
                            <Box display="flex" alignItems="center" mb={1}>
                                <EmailIcon sx={{ mr: 1, color: "text.secondary", fontSize: 20, minWidth: 24 }} />
                                <Typography variant="body2" color="text.secondary" noWrap>
                                    {member.email}
                                </Typography>
                            </Box>

                            <Box display="flex" alignItems="center" mb={1}>
                                <PhoneIcon sx={{ mr: 1, color: "text.secondary", fontSize: 20, minWidth: 24 }} />
                                <Typography variant="body2" color="text.secondary">
                                    {member.phoneNumber || '-'}
                                </Typography>
                            </Box>

                            <Box display="flex" alignItems="center">
                                <WorkIcon sx={{ mr: 1, color: "text.secondary", fontSize: 20, minWidth: 24 }} />
                                <Typography variant="body2" color="text.secondary">
                                    {member.department}
                                </Typography>
                            </Box>

                            {member.managerFirstName && member.managerLastName && (
                                <Box mt={2} pt={2} borderTop={1} borderColor="divider">
                                    <Typography variant="caption" color="text.secondary">
                                        Reports to: {member.managerFirstName} {member.managerLastName}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Box>
                </Box>

                <Box display={{ xs: 'none', md: 'grid' }} gridTemplateColumns="repeat(4, 1fr)" gap={2} mt={2}>
                    <Box>
                        <Typography variant="caption" color="text.secondary" display="block">Email</Typography>
                        <Typography noWrap>{member.email}</Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption" color="text.secondary" display="block">Phone</Typography>
                        <Typography>{member.phoneNumber || '-'}</Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption" color="text.secondary" display="block">Department</Typography>
                        <Typography>{member.department}</Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption" color="text.secondary" display="block">Reports To</Typography>
                        <Typography>
                            {member.managerFirstName && member.managerLastName
                                ? `${member.managerFirstName} ${member.managerLastName}`
                                : '-'}
                        </Typography>
                    </Box>
                </Box>

                {member.isManager && (
                    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                        <Box mt={2} p={2} borderRadius={2} bgcolor="action.hover">
                            {isLoading ? (
                                <Box display="flex" alignItems="center" gap={1}>
                                    <CircularProgress size={20} />
                                    <Typography variant="body2">Loading team members...</Typography>
                                </Box>
                            ) : errorMessage ? (
                                <Typography variant="body2" color="error">
                                    {errorMessage}
                                </Typography>
                            ) : reportees.length === 0 ? (
                                <Typography variant="body2" color="text.secondary">
                                    No direct reports found.
                                </Typography>
                            ) : (
                                <Box>
                                    <Grid container spacing={2}>
                                        {reportees.map((reportee) => (
                                            <Grid item xs={12} key={reportee.uuid}>
                                                <MemberCard member={reportee} />
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Box>
                            )}
                        </Box>
                    </Collapse>
                )}
            </CardContent>
        </Card>
    );
    };
    
    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box mb={4}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    My Team
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    {myReportees.length} team member{myReportees.length !== 1 ? 's' : ''}
                </Typography>
            </Box>

            {myReportees.length === 0 ? (
                <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
                    <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                        No team members found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        You don't have any direct reports yet.
                    </Typography>
                </Paper>
            ) : (
                <Box>
                    <Grid container spacing={2}>
                        {myReportees.map((member) => (
                            <Grid item xs={12} key={member.uuid}>
                                <MemberCard member={member} />
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}
        </Container>
    );
};

export default TeamView;
