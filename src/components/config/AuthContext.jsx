import React, {createContext, useContext, useEffect, useState} from 'react';

const AuthContext = createContext({});

export const AuthProvider = ({children}) => {
    const [authentication, setAuthentication] = useState(() => {
        const storedAuthentication = localStorage.getItem('authentication');
        return storedAuthentication ? JSON.parse(storedAuthentication) : null;

    });

    useEffect(() => {
        // Save authentication data to local storage when it changes
        if (authentication) {
            localStorage.setItem('authentication', JSON.stringify(authentication));
        } else {
            // Clear local storage when authentication is null (user logs out)
            localStorage.removeItem('authentication');
        }
    }, [authentication]);

    return (
        <AuthContext.Provider value={{authentication, setAuthentication}}>
            {children}
        </AuthContext.Provider>
    );
};

export const AuthState = () => {
    return useContext(AuthContext);
}