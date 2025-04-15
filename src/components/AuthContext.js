import React, { useContext, useState, useEffect } from 'react';
import { auth } from '../config';

const AuthContext = React.createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            setCurrentUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const value = {
        currentUser,
        login: (email, password) => auth.signInWithEmailAndPassword(email, password),
        logout: () => auth.signOut(),
        signup: (email, password) => auth.createUserWithEmailAndPassword(email, password)
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
