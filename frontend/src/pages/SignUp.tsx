import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// Label might not be explicitly used if relying solely on FormLabel from react-hook-form integration
// import { Label } from '@/components/ui/label';
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
import { toast } from 'sonner'; // Using sonner for notifications
import { Loader2 } from 'lucide-react'; // Import Loader icon

// Define the validation schema using Zod
// Ensure this matches the fields expected by your backend's /api/auth/register route
const formSchema = z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
    email: z.string().email({ message: 'Invalid email address.' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

// Define the type for form data based on the schema
type FormData = z.infer<typeof formSchema>;

const SignUp: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    // Removed local error state, relying on toast notifications for feedback

    // Initialize react-hook-form
    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
        },
    });

    // Handle form submission
    const onSubmit = async (values: FormData) => {
        setIsLoading(true);

        // Construct the correct API endpoint URL from environment variables
        const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/auth/register`;
        console.log(`Attempting to register at: ${apiUrl}`); // Log the URL for debugging

        try {
            // Send POST request to the backend
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // Send form values as JSON string
                body: JSON.stringify(values),
            });

            // Attempt to parse the response body
            // Handle potential non-JSON responses (like HTML error pages)
            let data;
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                data = await response.json(); // Parse as JSON if header indicates it
            } else {
                // If not JSON, read as text to avoid JSON parse error
                const textResponse = await response.text();
                console.error("Received non-JSON response:", response.status, textResponse);
                 // If the request failed, throw an error with the text response
                 if (!response.ok) {
                      throw new Error(`Server responded with ${response.status}. Response: ${textResponse.substring(0, 150)}...`);
                 } else {
                     // If the request succeeded but wasn't JSON (unexpected), treat as an error
                     console.warn("Received unexpected non-JSON success response:", textResponse);
                     throw new Error("Received unexpected response format from server.");
                 }
            }

            // Check if the response status indicates success (e.g., 200, 201)
            if (!response.ok) {
                // Use error message from parsed JSON data if available, otherwise use a generic message
                const errorMessage = data?.errors?.[0]?.msg || data?.msg || `Registration failed (HTTP ${response.status})`;
                throw new Error(errorMessage);
            }

            // Registration successful (backend handles setting the cookie)
            toast.success('Registration successful! Redirecting to login...');
            // Redirect to login page after a short delay
            setTimeout(() => navigate('/login'), 1500);

        } catch (err: unknown) {
            // Catch any errors during fetch or processing
            console.error('Registration process failed:', err);
            let message = 'An unexpected error occurred during registration.';
            // Extract message from Error objects
            if (err instanceof Error) {
                message = err.message;
            } else if (typeof err === 'string') {
                 message = err; // Handle plain string errors
            }
            // Display error to the user using toast notification
            toast.error(`Registration failed: ${message}`);
        } finally {
            // Ensure loading state is turned off regardless of success or failure
            setIsLoading(false);
        }
    };

    // Render the SignUp component UI
    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted/30 p-4"> {/* Added subtle gradient */}
            <Card className="w-full max-w-md shadow-xl border border-border/20"> {/* Enhanced shadow and border */}
                <CardHeader className="space-y-2 text-center"> {/* Increased spacing */}
                    <CardTitle className="text-3xl font-bold tracking-tight">Create Your Account</CardTitle> {/* Larger title */}
                    <CardDescription className="text-muted-foreground">
                        Join us! Enter your details below to get started.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6"> {/* Added top padding */}
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5"> {/* Increased spacing */}
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="e.g., John Doe"
                                                {...field}
                                                disabled={isLoading}
                                                className="h-10" // Standard input height
                                            />
                                        </FormControl>
                                        <FormMessage /> {/* Displays validation errors */}
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email Address</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                placeholder="you@example.com"
                                                {...field}
                                                disabled={isLoading}
                                                className="h-10"
                                            />
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
                                            <Input
                                                type="password"
                                                placeholder="•••••••• (min. 6 characters)" // Placeholder hint
                                                {...field}
                                                disabled={isLoading}
                                                className="h-10"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {/* Error display is handled by toast notifications */}
                            <Button type="submit" className="w-full h-10 text-base font-semibold" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> {/* Slightly larger loader */}
                                        Creating Account...
                                    </>
                                ) : (
                                    'Sign Up'
                                )}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="flex justify-center pt-4 text-sm text-muted-foreground"> {/* Added top padding */}
                    Already have an account?
                    <Link
                        to="/login"
                        className="font-medium text-primary underline underline-offset-4 transition-colors hover:text-primary/80" // Added transition
                    >
                        Log In Here
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
};

export default SignUp;