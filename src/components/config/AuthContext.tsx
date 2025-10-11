import * as React from "react";
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import {ME_API} from "../../api/Employee";

interface AuthContextType {
    authentication: Authentication | null;
    setAuthentication: React.Dispatch<React.SetStateAction<Authentication | null>>;
    checkAuth: () => Promise<void>;
}

interface Authentication {
    userId: string;
    roles: string[] | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [authentication, setAuthentication] = useState<Authentication | null>(null);
    const location = useLocation();

    const publicRoutes = ['/', '/login', '/forgot-password', '/reset-password'];

    const checkAuth = async () => {
        try {
            const response = await ME_API();
            if (response) {
                setAuthentication({ userId: response.uuid, roles: response.roles });
            } else {
                setAuthentication(null);
            }
        } catch {
            setAuthentication(null);
        }
    };

    useEffect(() => {
        // If we don't have auth info and we are not on a public route, try to get it from the session
        if (!authentication && !publicRoutes.includes(location.pathname)) {
            checkAuth();
        }
    }, [authentication, location.pathname, publicRoutes]);

    return (
        <AuthContext.Provider value={{ authentication, setAuthentication, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const AuthState = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("AuthState must be used within an AuthProvider");
    }
    return context;
};
