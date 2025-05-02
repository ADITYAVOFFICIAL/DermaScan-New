import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react'; // Example loading spinner

const ProtectedRoute: React.FC = () => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        // Show a loading indicator while checking authentication
        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!isAuthenticated) {
        // Redirect to login page if not authenticated
        // Pass the current location to redirect back after login (optional)
        return <Navigate to="/login" replace />;
    }

    // Render the child route component if authenticated
    return <Outlet />;
};

export default ProtectedRoute;