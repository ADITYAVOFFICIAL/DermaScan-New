import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface User {
    _id: string;
    name: string;
    email: string;
    // date field might not be needed if it's just creation date
}

// Define a type for login credentials
interface LoginCredentials {
    email: string;
    password: string;
}

// Remove token from context state
interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    // Use the specific type for credentials
    login: (credentials: LoginCredentials) => Promise<User | null>; // Takes credentials, returns user or null on failure
    logout: () => Promise<void>;
    fetchUser: () => Promise<void>; // fetchUser doesn't need token arg
}

// Export AuthContext and AuthContextType (assuming useAuth hook is separate)
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
// Use 'export type' for re-exporting types with isolatedModules
export type { AuthContextType };

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Remove token state
    // const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    // fetchUser: No longer needs token argument, relies on cookie
    const fetchUser = useCallback(async () => {
        const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/auth/me`;
        try {
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // <<< MAKE SURE THIS IS PRESENT
            });
            const data = await response.json();
            if (!response.ok) {
                // If /me fails (e.g., 401), user is not authenticated
                throw new Error(data.msg || 'Failed to fetch user');
            }
            setUser(data);
            setIsAuthenticated(true);
        } catch (error) {
            // If fetching user fails, ensure state reflects unauthenticated
            console.error('Fetch user error:', error);
            setUser(null);
            setIsAuthenticated(false);
            // Don't necessarily navigate here, let ProtectedRoute handle it
        }
    }, []); // No dependencies needed now

    // useEffect: Check auth status on initial load by calling fetchUser
    useEffect(() => {
        fetchUser().finally(() => setIsLoading(false));
    }, [fetchUser]); // fetchUser is stable due to useCallback

    // login: Calls backend login, then fetches user data if successful
    // Use the specific type for credentials
    const login = async (credentials: LoginCredentials): Promise<User | null> => {
        setIsLoading(true);
        const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/auth/login`;
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
                credentials: 'include', // Send cookies
            });
            const data = await response.json(); // Backend now returns user data on success
            if (!response.ok) {
                throw new Error(data.errors?.[0]?.msg || data.msg || 'Login failed');
            }
            // Login successful, backend set cookie. Now fetch user data to confirm & update state.
            await fetchUser(); // Update user state
            setIsLoading(false);
            return data as User; // Return user data on success
        } catch (error) {
            console.error('Login context error:', error);
            setUser(null);
            setIsAuthenticated(false);
            setIsLoading(false);
            throw error; // Re-throw error for the component to handle (e.g., show message)
        }
    };

    // logout: Calls backend logout endpoint, then updates state
    const logout = useCallback(async () => {
        const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/auth/logout`;
        try {
            await fetch(apiUrl, {
                method: 'POST',
                credentials: 'include', // Send cookies
            });
        } catch (error) {
            console.error('Logout API call failed:', error);
            // Proceed with frontend logout even if API fails
        } finally {
            // Clear frontend state regardless of API call success
            setUser(null);
            setIsAuthenticated(false);
            toast.info('You have been logged out.');
            navigate('/login'); // Redirect to login on logout
        }
    }, [navigate]);

    return (
        // Provide updated context value (no token)
        <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout, fetchUser }}>
            {children}
        </AuthContext.Provider>
    );
};

