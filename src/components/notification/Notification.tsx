import {useEffect, useState, useRef} from "react";
import SockJS from "sockjs-client";
import {Client} from "@stomp/stompjs";
import {Notification} from "../types/types.d";
import {useAppDispatch, useAppSelector} from "../../redux/hooks";
import {Box, Typography, List, ListItem, ListItemText, Paper, Button} from "@mui/material";
import {ME_API} from "../../api/Employee";
import {setEmployee} from "../../redux/employeeSlice";
import {
    DELETE_NOTIFICATION_BY_EMPLOYEE,
    DELETE_NOTIFICATION_BY_ID,
    GET_NOTIFICATION_BY_EMPLOYEE_PAGINATION,
    UPDATE_NOTIFICATION_BY_EMPLOYEE,
    UPDATE_NOTIFICATION_BY_ID
} from "../../api/Notification";

export default function NotificationComponent() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const employee = useAppSelector((state) => state.employee.employee);
    const dispatch = useAppDispatch();
    const stompClientRef = useRef<Client | null>(null);

    useEffect(() => {
        const fetchEmployee = async () => {
            if (!employee) {
                try {
                    const employeeData = await ME_API();
                    dispatch(setEmployee(employeeData));
                } catch (error) {
                    console.error("Failed to fetch employee data:", error);
                }
            }
        };
        fetchEmployee();
    }, [employee, dispatch]);

    useEffect(() => {
        if (employee?.uuid) {
            const fetchNotifications = async () => {
                try {
                    const response = await GET_NOTIFICATION_BY_EMPLOYEE_PAGINATION(employee.uuid);
                    if (response.data) {
                        setNotifications(response.data);
                    }
                } catch (error) {
                    console.error("Failed to fetch notifications:", error);
                }
            };
            fetchNotifications();
        }
    }, [employee?.uuid]);

    useEffect(() => {
        if (employee?.uuid) {
            const client = new Client({
                webSocketFactory: () => new SockJS("http://localhost:8082/ws"),
                onConnect: () => {
                    console.log("Connected to WebSocket");
                    client.subscribe(`/topic/notifications/${employee.uuid}`, (msg) => {
                        try {
                            const newNotification = JSON.parse(msg.body) as Notification;
                            setNotifications((prevNotifications) => [newNotification, ...prevNotifications]);
                        } catch (error) {
                            console.error("Error parsing notification message:", error);
                        }
                    });
                },
                onStompError: (frame) => {
                    console.error("Broker reported error: " + frame.headers["message"]);
                    console.error("Additional details: " + frame.body);
                },
            });

            stompClientRef.current = client;
            client.activate();

            return () => {
                if (client.active) {
                    client.deactivate();
                    console.log("Disconnected WebSocket");
                }
            };
        }
    }, [employee?.uuid]);

    const handleUpdateNotification = async (uuid: string, status: string, type: string) => {
        try {
            if (type === 'id') {
                await UPDATE_NOTIFICATION_BY_ID(uuid, status);
            } else if (type === 'employeeUuid') {
                await UPDATE_NOTIFICATION_BY_EMPLOYEE(uuid, status);
            }
            setNotifications(prev => prev.map(n => n.uuid === uuid ? {...n, status: status as 'READ' | 'UNREAD'} : n));
        } catch (error) {
            console.error('Failed to update notification', error);
        }
    };
    const handleDeleteNotification = async (uuid: string, type: string) => {
        try {
            if (type === 'id') {
                await DELETE_NOTIFICATION_BY_ID(uuid);
            } else if (type === 'employeeUuid') {
                await DELETE_NOTIFICATION_BY_EMPLOYEE(uuid);
            }
            setNotifications(notifications.filter(n => n.uuid !== uuid));
        } catch (error) {
            console.error('Failed to delete notification', error);
        }
    };

    return (
        <Box sx={{p: 3}}>
            <Typography variant="h4" gutterBottom>
                Notifications
            </Typography>
            <Paper elevation={3}>
                <List>
                    {notifications.length > 0 ? (
                        notifications.map((n) => (
                            <ListItem key={n.uuid} divider>
                                <ListItemText
                                    primary={n.title}
                                    secondary={n.message}
                                />
                                <Box sx={{display: 'flex', gap: 1, alignItems: 'center'}}>
                                    {n.status === 'UNREAD' && (
                                        <Button variant="contained"
                                                onClick={() => handleUpdateNotification(n.uuid, "READ", 'id')}>
                                            Mark as read
                                        </Button>
                                    )}
                                    <Button variant="outlined"
                                            color="secondary"
                                            onClick={() => handleDeleteNotification(n.uuid, 'id')}>
                                        Delete
                                    </Button>
                                </Box>
                            </ListItem>
                        ))
                    ) : (
                        <ListItem>
                            <ListItemText primary="No notifications"/>
                        </ListItem>
                    )}
                </List>
            </Paper>
        </Box>
    );
}