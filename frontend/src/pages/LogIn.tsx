import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth'; // Assuming useAuth is in hooks

const formSchema = z.object({
    email: z.string().email({ message: 'Invalid email address.' }),
    password: z.string().min(1, { message: 'Password is required.' }), // Keep password validation simple for login
});

// Explicitly define FormData to ensure alignment with the expected LoginCredentials type
type FormData = {
    email: string;
    password: string;
};


const LogIn: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { login } = useAuth(); // Get login function from context

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit = async (values: FormData) => {
        setIsLoading(true);
        setError(null);

        try {
            // Call the context login function. It handles the API call and updates auth state via fetchUser on success.
            // It returns the user object on success or throws an error on failure.
            const loggedInUser = await login(values);

            // If login was successful (didn't throw), loggedInUser will contain user data.
            // The AuthContext already updated isAuthenticated state via fetchUser.
            if (loggedInUser) {
                toast.success('Login successful! Redirecting...');
                // Navigate after login is processed by context
                // Use replace to prevent going back to login page
                setTimeout(() => navigate('/profile', { replace: true }), 500); // Redirect to profile or dashboard
            } else {
                 // This case might not be reached if login throws, but handle defensively
                 // The error is likely caught in the catch block below.
                 throw new Error('Login process completed but no user data was returned.');
            }

        } catch (err: unknown) {
            console.error('Login page submit error:', err);
            let message = 'An unexpected error occurred during login.';
            if (err instanceof Error) {
                // Use the error message thrown by the AuthContext login function
                message = err.message;
            } else if (typeof err === 'string') {
                message = err;
            }
            setError(message);
            toast.error(`Login failed: ${message}`);
        } finally {
            setIsLoading(false);
        }
    };

     return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold">Log In</CardTitle>
                    <CardDescription>
                        Enter your email and password to access your account.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="you@example.com" {...field} disabled={isLoading} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="••••••••" {...field} disabled={isLoading} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {error && <p className="text-sm text-red-500">{error}</p>}
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? 'Logging In...' : 'Log In'}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="text-center text-sm">
                    Don't have an account?{' '}
                    <Link to="/signup" className="underline ml-1">
                        Sign Up
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
};

export default LogIn;