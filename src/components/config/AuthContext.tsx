import * as React from "react";
import {createContext, useContext, useEffect, useState, ReactNode} from 'react';

interface AuthContextType {
    authentication: Authentication | null;
    setAuthentication: React.Dispatch<React.SetStateAction<Authentication | null>>;
}

interface Authentication {
    accessToken: string;
    userId: string;
    roles: [string];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
    const [authentication, setAuthentication] = useState<Authentication | null>(() => {
        const storedAuthentication = localStorage.getItem('authentication');
        return storedAuthentication ? JSON.parse(storedAuthentication) as Authentication : null;
    });

    useEffect(() => {
        if (authentication) {
            localStorage.setItem('authentication', JSON.stringify(authentication));
        } else {
            localStorage.removeItem('authentication');
        }
    }, [authentication]);

    return (
        <AuthContext.Provider value={{authentication, setAuthentication}}>
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
