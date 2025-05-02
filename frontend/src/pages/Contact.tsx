import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription, // Import CardDescription
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label"; // Import Label
import { useToast } from "@/hooks/use-toast";
import { Check, MapPin, Phone, Mail, Clock, Send, Loader2, Info } from "lucide-react"; // Added Send, Loader2, Info

const Contact = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const { toast } = useToast();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitted(false); // Reset submitted state on new submission attempt

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            // --- Mock Success ---
            setSubmitted(true);
            toast({
                title: "Message Sent Successfully!",
                description: "Thank you for reaching out. We'll respond shortly.",
                className: "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700", // Custom success toast style
                action: <Check className="h-5 w-5 text-green-600 dark:text-green-400" />,
            });

            // Reset form after a short delay to show success state on button
            setTimeout(() => {
                setFormData({ name: "", email: "", subject: "", message: "" });
                 // Keep the 'submitted' state true for a bit longer for the button visual
                setTimeout(() => setSubmitted(false), 4000);
            }, 500);

        } catch (error) {
             // --- Mock Error ---
            console.error("Form submission error:", error);
            toast({
                variant: "destructive", // Use destructive variant for error
                title: "Submission Error",
                description: "Something went wrong. Please check your connection and try again.",
                action: <Info className="h-5 w-5" />, // Use Info or AlertTriangle for error
            });
            setSubmitted(false); // Ensure submitted is false on error
        } finally {
            setIsSubmitting(false);
        }
    };

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.2 },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
    };

     const cardHoverVariant = {
        hover: {
            y: -5,
            boxShadow: "0 8px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
            transition: { duration: 0.2, ease: "easeOut" }
        }
    };


    return (
        <div className="bg-gradient-to-b from-sky-50 via-white to-white dark:from-slate-950 dark:via-slate-950 dark:to-slate-950 min-h-screen">
            <div className="max-w-7xl mx-auto py-16 md:py-24 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="text-center mb-16 md:mb-20"
                >
                    <motion.h1
                        variants={itemVariants}
                        className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 mb-4"
                    >
                        Get In <span className="text-sky-600 dark:text-sky-400">Touch</span>
                    </motion.h1>
                    <motion.p
                        variants={itemVariants}
                        className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto"
                    >
                        We're here to help! Whether you have questions about our AI analyzer, need support, or want to provide feedback, reach out to us.
                    </motion.p>
                </motion.div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 md:gap-12">

                    {/* Contact Information Column */}
                    <motion.div
                        className="lg:col-span-2"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                        variants={containerVariants}
                    >
                         <motion.div variants={itemVariants} whileHover="hover">
                             <motion.div variants={cardHoverVariant}>
                                <Card className="h-full border dark:border-slate-800 shadow-lg bg-white dark:bg-slate-900 overflow-hidden">
                                    <CardHeader className="bg-gradient-to-br from-sky-100 to-indigo-100 dark:from-sky-900/50 dark:to-indigo-900/50 p-6">
                                        <CardTitle className="text-2xl font-semibold text-sky-900 dark:text-sky-200">
                                            Contact Information
                                        </CardTitle>
                                        <CardDescription className="text-sky-700 dark:text-sky-400">
                                            Find us or reach out directly.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-6">
                                        {/* Location */}
                                        <motion.div variants={itemVariants} className="flex items-start space-x-4 group">
                                            <div className="flex-shrink-0 bg-sky-100 dark:bg-sky-900/50 p-3 rounded-full transition-colors duration-200 group-hover:bg-sky-200 dark:group-hover:bg-sky-800/60">
                                                <MapPin className="h-6 w-6 text-sky-700 dark:text-sky-400" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200">Our Office</h3>
                                                <address className="not-italic text-slate-600 dark:text-slate-400 mt-1 text-sm leading-relaxed">
                                                    INDIA
                                                </address>
                                            </div>
                                        </motion.div>
                                        <hr className="dark:border-slate-700"/>
                                        {/* Phone */}
                                        <motion.div variants={itemVariants} className="flex items-start space-x-4 group">
                                            <div className="flex-shrink-0 bg-sky-100 dark:bg-sky-900/50 p-3 rounded-full transition-colors duration-200 group-hover:bg-sky-200 dark:group-hover:bg-sky-800/60">
                                                <Phone className="h-6 w-6 text-sky-700 dark:text-sky-400" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200">Call Us</h3>
                                                <p className="text-slate-600 dark:text-slate-400 mt-1">
                                                    <a href="tel:+919999999999" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors duration-200">+91 9999999999</a>
                                                </p>
                                                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Mon-Fri, 9am - 5pm PST</p>
                                            </div>
                                        </motion.div>
                                        <hr className="dark:border-slate-700"/>
                                        {/* Email */}
                                        <motion.div variants={itemVariants} className="flex items-start space-x-4 group">
                                            <div className="flex-shrink-0 bg-sky-100 dark:bg-sky-900/50 p-3 rounded-full transition-colors duration-200 group-hover:bg-sky-200 dark:group-hover:bg-sky-800/60">
                                                <Mail className="h-6 w-6 text-sky-700 dark:text-sky-400" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200">Email Support</h3>
                                                <p className="text-slate-600 dark:text-slate-400 mt-1 break-words">
                                                    <a href="mailto:support@dermascan.com" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors duration-200">
                                                        support@dermascan.com
                                                    </a>
                                                </p>
                                                 <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Expect a response within 24 hours</p>
                                            </div>
                                        </motion.div>
                                         <hr className="dark:border-slate-700"/>
                                        {/* Business Hours */}
                                        <motion.div variants={itemVariants} className="flex items-start space-x-4 group">
                                            <div className="flex-shrink-0 bg-sky-100 dark:bg-sky-900/50 p-3 rounded-full transition-colors duration-200 group-hover:bg-sky-200 dark:group-hover:bg-sky-800/60">
                                                <Clock className="h-6 w-6 text-sky-700 dark:text-sky-400" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200">Working Hours</h3>
                                                <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">Monday - Friday: 9:00 AM - 5:00 PM PST</p>
                                                <p className="text-slate-600 dark:text-slate-400 text-sm">Saturday - Sunday: Closed</p>
                                            </div>
                                        </motion.div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                         </motion.div>
                    </motion.div>

                    {/* Contact Form Column */}
                    <motion.div
                        className="lg:col-span-3"
                         initial={{ opacity: 0, x: 30 }}
                         whileInView={{ opacity: 1, x: 0 }}
                         viewport={{ once: true, amount: 0.2 }}
                         transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                    >
                         <motion.div whileHover="hover">
                             <motion.div variants={cardHoverVariant}>
                                <Card className="border dark:border-slate-800 shadow-lg bg-white dark:bg-slate-900 overflow-hidden">
                                    <CardHeader className="bg-gradient-to-br from-sky-100 to-indigo-100 dark:from-sky-900/50 dark:to-indigo-900/50 p-6">
                                        <CardTitle className="text-2xl font-semibold text-sky-900 dark:text-sky-200">
                                            Send Us a Message
                                        </CardTitle>
                                        <CardDescription className="text-sky-700 dark:text-sky-400">
                                            Fill out the form below and we'll get back to you.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-6 md:p-8">
                                        <form onSubmit={handleSubmit} className="space-y-6">
                                            {/* Name and Email Row */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label htmlFor="name" className="font-medium text-slate-700 dark:text-slate-300">Your Name</Label>
                                                    <Input
                                                        id="name" name="name" placeholder="e.g., Jane Doe"
                                                        value={formData.name} onChange={handleChange} required
                                                        className="bg-slate-50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 focus-visible:ring-sky-500 dark:focus-visible:ring-sky-400"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="email" className="font-medium text-slate-700 dark:text-slate-300">Email Address</Label>
                                                    <Input
                                                        id="email" name="email" type="email" placeholder="e.g., jane.doe@example.com"
                                                        value={formData.email} onChange={handleChange} required
                                                        className="bg-slate-50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 focus-visible:ring-sky-500 dark:focus-visible:ring-sky-400"
                                                    />
                                                </div>
                                            </div>

                                            {/* Subject */}
                                            <div className="space-y-2">
                                                <Label htmlFor="subject" className="font-medium text-slate-700 dark:text-slate-300">Subject</Label>
                                                <Input
                                                    id="subject" name="subject" placeholder="What is your message about?"
                                                    value={formData.subject} onChange={handleChange} required
                                                    className="bg-slate-50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 focus-visible:ring-sky-500 dark:focus-visible:ring-sky-400"
                                                />
                                            </div>

                                            {/* Message */}
                                            <div className="space-y-2">
                                                <Label htmlFor="message" className="font-medium text-slate-700 dark:text-slate-300">Your Message</Label>
                                                <Textarea
                                                    id="message" name="message" placeholder="Please provide details here..."
                                                    value={formData.message} onChange={handleChange} required
                                                    className="min-h-[180px] bg-slate-50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 focus-visible:ring-sky-500 dark:focus-visible:ring-sky-400"
                                                    rows={6} // Suggest rows
                                                />
                                            </div>

                                            {/* Submit Button */}
                                            <div className="pt-2">
                                                <Button
                                                    type="submit"
                                                    disabled={isSubmitting || submitted} // Disable if submitting or already successfully submitted
                                                    size="lg" // Use size prop
                                                    className={`w-full text-lg px-8 py-3 h-auto rounded-md shadow-md font-semibold transition-all duration-300 ease-in-out transform hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900
                                                        ${isSubmitting
                                                            ? "bg-slate-400 dark:bg-slate-600 cursor-not-allowed"
                                                            : submitted
                                                                ? "bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white cursor-not-allowed"
                                                                : "bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white focus-visible:ring-sky-500"
                                                        }`}
                                                >
                                                    <AnimatePresence mode="wait">
                                                        {isSubmitting ? (
                                                            <motion.span
                                                                key="submitting"
                                                                initial={{ opacity: 0, y: -10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                exit={{ opacity: 0, y: 10 }}
                                                                className="flex items-center justify-center"
                                                            >
                                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                                Sending...
                                                            </motion.span>
                                                        ) : submitted ? (
                                                            <motion.span
                                                                key="submitted"
                                                                initial={{ opacity: 0, scale: 0.8 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                exit={{ opacity: 0, scale: 0.8 }}
                                                                className="flex items-center justify-center"
                                                            >
                                                                <Check className="mr-2 h-6 w-6" />
                                                                Message Sent!
                                                            </motion.span>
                                                        ) : (
                                                            <motion.span
                                                                key="idle"
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                exit={{ opacity: 0 }}
                                                                className="flex items-center justify-center"
                                                            >
                                                                <Send className="mr-2 h-5 w-5" />
                                                                Send Your Message
                                                            </motion.span>
                                                        )}
                                                    </AnimatePresence>
                                                </Button>
                                            </div>
                                        </form>
                                    </CardContent>
                                </Card>
                             </motion.div>
                         </motion.div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Contact;