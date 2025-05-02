// src/pages/Index.tsx (or wherever your Index component resides)
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Added CardHeader, CardTitle
import { ShieldCheck, UploadCloud, GaugeCircle, HeartPulse, CheckCircle, AlertTriangle, Microscope, MessageSquareQuote } from "lucide-react"; // Changed/Added Icons
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import ThreeDSphere from "@/components/ThreeDSphere"; // Import the fixed component

const Index = () => {
    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                delayChildren: 0.2,
                staggerChildren: 0.15 // Slightly faster stagger
            }
        }
    };

    const itemVariants = {
        hidden: { y: 30, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.6, ease: "easeOut" }
        }
    };

    const cardHoverVariant = {
        hover: {
            y: -6,
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)", // Enhanced shadow
            transition: { duration: 0.2, ease: "easeOut" }
        }
    };

    return (
        <div className="bg-gradient-to-b from-sky-50 via-white to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-950 text-slate-800 dark:text-slate-200">
            {/* === Hero Section === */}
            <section className="relative overflow-hidden min-h-[85vh] md:min-h-[75vh] flex items-center justify-center">
                {/* Background Sphere Container */}
                <div className="absolute inset-0 -z-10 opacity-60 dark:opacity-40">
                    <ThreeDSphere />
                </div>

                {/* Content Overlay */}
                <motion.div
                    className="text-center space-y-6 md:space-y-8 px-4 relative z-10" // Ensure content is above sphere
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                >
                    <motion.h1
                        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight"
                        variants={itemVariants}
                    >
                        <span className="block text-sky-600 dark:text-sky-400 mb-2">
                            Intelligent Skin Analysis
                        </span>
                        <span className="block text-slate-900 dark:text-slate-100">
                            Powered by AI
                        </span>
                    </motion.h1>

                    <motion.p
                        className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-xl lg:max-w-2xl mx-auto leading-relaxed"
                        variants={itemVariants}
                    >
                        Upload an image and get instant, AI-driven insights into potential skin conditions. Fast, private, and informative.
                        <span className="font-semibold text-sky-700 dark:text-sky-300"> (Experimental Tool)</span>
                    </motion.p>

                    <motion.div variants={itemVariants}>
                        <Link to="/analyser">
                            <Button
                                size="lg"
                                className="bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white text-lg px-8 py-3 h-auto rounded-full shadow-lg transform hover:scale-105 transition-transform duration-200"
                            >
                                <Microscope className="mr-2 h-5 w-5" />
                                Analyze Your Skin Now
                            </Button>
                        </Link>
                        <motion.p className="text-xs text-slate-500 dark:text-slate-500 mt-3" variants={itemVariants}>
                            Free analysis available. Always consult a doctor for diagnosis.
                        </motion.p>
                    </motion.div>
                </motion.div>
            </section>

            {/* === How It Works Section === */}
            <section className="py-16 md:py-24 px-4 bg-white dark:bg-slate-950">
                <motion.div
                    className="max-w-6xl mx-auto text-center"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    variants={containerVariants}
                >
                    <motion.h2 className="text-3xl md:text-4xl font-bold text-sky-800 dark:text-sky-300 mb-4" variants={itemVariants}>
                        Simple Steps to Insight
                    </motion.h2>
                    <motion.p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-12 md:mb-16" variants={itemVariants}>
                        Get AI-powered suggestions in just a few clicks. Our process is designed for ease of use and privacy.
                    </motion.p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
                        {/* Step 1 */}
                        <motion.div variants={itemVariants}>
                            <Card className="h-full text-center border dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow duration-200 bg-slate-50 dark:bg-slate-900">
                                <CardHeader>
                                    <div className="mx-auto bg-sky-100 dark:bg-sky-900/50 p-4 rounded-full w-fit mb-3">
                                        <UploadCloud className="h-10 w-10 text-sky-600 dark:text-sky-400" />
                                    </div>
                                    <CardTitle className="text-xl font-semibold text-slate-800 dark:text-slate-200">1. Secure Upload</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-slate-600 dark:text-slate-400">
                                        Take a clear photo of the affected skin area and upload it securely through our encrypted platform.
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Step 2 */}
                        <motion.div variants={itemVariants}>
                           <Card className="h-full text-center border dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow duration-200 bg-slate-50 dark:bg-slate-900">
                                <CardHeader>
                                    <div className="mx-auto bg-sky-100 dark:bg-sky-900/50 p-4 rounded-full w-fit mb-3">
                                        <GaugeCircle className="h-10 w-10 text-sky-600 dark:text-sky-400" />
                                    </div>
                                    <CardTitle className="text-xl font-semibold text-slate-800 dark:text-slate-200">2. AI Analysis</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-slate-600 dark:text-slate-400">
                                        Our advanced AI analyzes the image patterns against a vast database of dermatological cases.
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Step 3 */}
                         <motion.div variants={itemVariants}>
                           <Card className="h-full text-center border dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow duration-200 bg-slate-50 dark:bg-slate-900">
                                <CardHeader>
                                    <div className="mx-auto bg-sky-100 dark:bg-sky-900/50 p-4 rounded-full w-fit mb-3">
                                        <HeartPulse className="h-10 w-10 text-sky-600 dark:text-sky-400" />
                                    </div>
                                    <CardTitle className="text-xl font-semibold text-slate-800 dark:text-slate-200">3. Informative Results</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-slate-600 dark:text-slate-400">
                                        Receive an experimental suggestion, visual analysis details, and general information. <b className="dark:text-slate-300">Not a diagnosis.</b>
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </motion.div>
            </section>

            {/* === Key Features Section === */}
            <section className="py-16 md:py-24 px-4 bg-gradient-to-b from-sky-50 to-white dark:from-slate-900 dark:to-slate-950">
                <motion.div
                    className="max-w-6xl mx-auto"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={containerVariants}
                >
                    <motion.h2 className="text-3xl md:text-4xl font-bold text-center text-sky-800 dark:text-sky-300 mb-12 md:mb-16" variants={itemVariants}>
                        Core Features
                    </motion.h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <motion.div variants={itemVariants} whileHover="hover">
                            <motion.div variants={cardHoverVariant}>
                                <Card className="h-full border dark:border-slate-800 shadow-sm transition-shadow duration-200 bg-white dark:bg-slate-900">
                                    <CardContent className="pt-8 text-center flex flex-col items-center space-y-3">
                                        <GaugeCircle className="h-12 w-12 text-sky-500 dark:text-sky-400 mb-2" />
                                        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Instant Analysis</h3>
                                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                                            Get results in seconds. Our AI processes your image quickly to provide immediate visual feedback.
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </motion.div>

                        {/* Feature 2 */}
                        <motion.div variants={itemVariants} whileHover="hover">
                           <motion.div variants={cardHoverVariant}>
                               <Card className="h-full border dark:border-slate-800 shadow-sm transition-shadow duration-200 bg-white dark:bg-slate-900">
                                    <CardContent className="pt-8 text-center flex flex-col items-center space-y-3">
                                        <ShieldCheck className="h-12 w-12 text-sky-500 dark:text-sky-400 mb-2" />
                                        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Privacy Focused</h3>
                                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                                            Your images and data are encrypted and processed securely. We prioritize your confidentiality.
                                        </p>
                                    </CardContent>
                                </Card>
                           </motion.div>
                        </motion.div>

                        {/* Feature 3 */}
                        <motion.div variants={itemVariants} whileHover="hover">
                            <motion.div variants={cardHoverVariant}>
                                <Card className="h-full border dark:border-slate-800 shadow-sm transition-shadow duration-200 bg-white dark:bg-slate-900">
                                    <CardContent className="pt-8 text-center flex flex-col items-center space-y-3">
                                        <Microscope className="h-12 w-12 text-sky-500 dark:text-sky-400 mb-2" />
                                        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Detailed Insights</h3>
                                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                                           Receive analysis of visual features and general information about potential conditions (for educational purposes).
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </motion.div>
                    </div>
                </motion.div>
            </section>

            {/* === Why Choose Us Section === */}
            <section className="py-16 md:py-24 px-4 bg-slate-50 dark:bg-slate-900">
                <motion.div
                    className="max-w-4xl mx-auto"
                     initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    variants={containerVariants}
                >
                    <motion.h2 className="text-3xl md:text-4xl font-bold text-center text-sky-800 dark:text-sky-300 mb-12 md:mb-16" variants={itemVariants}>
                        Why Use DermaScan?
                    </motion.h2>

                    <div className="grid md:grid-cols-2 gap-x-8 gap-y-8">
                        {/* Benefit 1 */}
                        <motion.div className="flex items-start space-x-4" variants={itemVariants}>
                            <div className="flex-shrink-0 bg-sky-100 dark:bg-sky-900/50 p-2 rounded-full mt-1">
                                <CheckCircle className="h-6 w-6 text-sky-600 dark:text-sky-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200">Clinically Informed AI</h3>
                                <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm leading-relaxed">
                                    Our models learn from vast datasets, guided by dermatological knowledge (but do not replace expert diagnosis).
                                </p>
                            </div>
                        </motion.div>

                        {/* Benefit 2 */}
                        <motion.div className="flex items-start space-x-4" variants={itemVariants}>
                           <div className="flex-shrink-0 bg-sky-100 dark:bg-sky-900/50 p-2 rounded-full mt-1">
                                <CheckCircle className="h-6 w-6 text-sky-600 dark:text-sky-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200">Rapid Visual Feedback</h3>
                                <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm leading-relaxed">
                                   Get quick insights based on visual patterns, helping you decide on next steps, like consulting a doctor.
                                </p>
                            </div>
                        </motion.div>

                         {/* Benefit 3 */}
                        <motion.div className="flex items-start space-x-4" variants={itemVariants}>
                            <div className="flex-shrink-0 bg-sky-100 dark:bg-sky-900/50 p-2 rounded-full mt-1">
                                <CheckCircle className="h-6 w-6 text-sky-600 dark:text-sky-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200">Educational Purpose</h3>
                                <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm leading-relaxed">
                                   Learn more about visual characteristics associated with different skin conditions (for informational use only).
                                </p>
                            </div>
                        </motion.div>

                         {/* Benefit 4 */}
                        <motion.div className="flex items-start space-x-4" variants={itemVariants}>
                            <div className="flex-shrink-0 bg-sky-100 dark:bg-sky-900/50 p-2 rounded-full mt-1">
                                <CheckCircle className="h-6 w-6 text-sky-600 dark:text-sky-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200">Accessible & Convenient</h3>
                                <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm leading-relaxed">
                                   Use our web-based tool anytime, anywhere, on your preferred device. No app installation required.
                                </p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Final CTA */}
                    <motion.div className="text-center mt-16" variants={itemVariants}>
                        <Link to="/analyser">
                            <Button
                                size="lg"
                                className="bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white text-lg px-8 py-3 h-auto rounded-full shadow-lg transform hover:scale-105 transition-transform duration-200"
                            >
                                <Microscope className="mr-2 h-5 w-5" />
                                Start Your Analysis
                            </Button>
                        </Link>
                    </motion.div>
                </motion.div>
            </section>

             {/* === Testimonials Section === */}
             <section className="py-16 md:py-24 px-4 bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900">
                <motion.div
                    className="max-w-6xl mx-auto" // Wider container for grid
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }} // Trigger animation a bit earlier
                    variants={containerVariants}
                >
                    <motion.div className="text-center mb-12 md:mb-16" variants={itemVariants}>
                        <h2 className="text-3xl md:text-4xl font-bold text-sky-800 dark:text-sky-300 mb-3">
                            What Users Are Saying
                        </h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400">
                            Feedback on the DermaScan experience (Illustrative Examples)
                        </p>
                    </motion.div>

                    {/* Testimonial Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
                        {/* Testimonial Card 1 */}
                        <motion.div variants={itemVariants} whileHover="hover">
                            <motion.div variants={cardHoverVariant}> {/* Use hover variant from previous example */}
                                <Card className="h-full border dark:border-slate-800 shadow-md hover:shadow-lg transition-shadow duration-200 bg-white dark:bg-slate-900 flex flex-col">
                                    <CardContent className="pt-6 p-6 flex-grow">
                                        <MessageSquareQuote className="h-8 w-8 text-sky-400 dark:text-sky-600 mb-4" />
                                        <blockquote className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed italic mb-4">
                                            "The visual analysis helped me understand what I was seeing and prompted me to see my dermatologist faster. Very helpful tool!"
                                        </blockquote>
                                    </CardContent>
                                    <footer className="px-6 pb-6 text-right text-sm font-medium text-slate-600 dark:text-slate-400">
                                        - Satisfied User A
                                    </footer>
                                </Card>
                            </motion.div>
                        </motion.div>

                        {/* Testimonial Card 2 */}
                        <motion.div variants={itemVariants} whileHover="hover">
                           <motion.div variants={cardHoverVariant}>
                                <Card className="h-full border dark:border-slate-800 shadow-md hover:shadow-lg transition-shadow duration-200 bg-white dark:bg-slate-900 flex flex-col">
                                     <CardContent className="pt-6 p-6 flex-grow">
                                        <MessageSquareQuote className="h-8 w-8 text-sky-400 dark:text-sky-600 mb-4" />
                                        <blockquote className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed italic mb-4">
                                            "Easy to use and provides interesting visual details. Remember it's not a diagnosis, but great for initial insights before a doctor's visit."
                                        </blockquote>
                                    </CardContent>
                                    <footer className="px-6 pb-6 text-right text-sm font-medium text-slate-600 dark:text-slate-400">
                                        - Informed User B
                                    </footer>
                                </Card>
                           </motion.div>
                        </motion.div>
                        {/* Add more testimonial cards here if needed */}
                    </div>
                </motion.div>
            </section>

            {/* === Disclaimer Section === */}
            <section className="py-16 md:py-20 px-4 bg-amber-50 dark:bg-amber-900/30 border-y border-amber-200 dark:border-amber-800/50">
                <motion.div
                    className="max-w-4xl mx-auto"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    variants={containerVariants}
                >
                    {/* Using a Card for structure and visual separation */}
                    <motion.div variants={itemVariants}>
                        <Card className="bg-white dark:bg-slate-900 border-amber-300 dark:border-amber-700 shadow-lg border-l-4 md:border-l-8">
                             <CardHeader className="flex flex-row items-center space-x-4 pt-6 px-6">
                                <AlertTriangle className="h-10 w-10 text-amber-500 dark:text-amber-400 flex-shrink-0"/>
                                <CardTitle className="text-2xl md:text-3xl font-bold text-amber-800 dark:text-amber-200">
                                    Important Usage Disclaimer
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-6 pb-6 pt-4">
                                <p className="text-base text-amber-900 dark:text-amber-200 leading-relaxed">
                                    DermaScan Insight provides <b className="font-semibold text-amber-950 dark:text-amber-100">experimental AI-generated suggestions</b> based solely on visual analysis for informational and educational purposes. It is <b className="font-semibold text-amber-950 dark:text-amber-100">NOT a medical diagnosis</b> and <b className="font-semibold text-amber-950 dark:text-amber-100">NOT a substitute</b> for professional medical advice, diagnosis, or treatment from a qualified healthcare provider (e.g., a dermatologist).
                                </p>
                                <p className="mt-3 text-base text-amber-900 dark:text-amber-200 leading-relaxed">
                                    Accuracy is not guaranteed. <b className="font-semibold text-amber-950 dark:text-amber-100">Always consult a qualified healthcare professional</b> for any health concerns or before making decisions about your health or treatment. Reliance on information from this tool is solely at your own risk.
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>
            </section>
            {/* === Footer === */}
            <footer className="py-8 px-4 bg-slate-100 dark:bg-slate-900 border-t dark:border-slate-800">
                <div className="max-w-6xl mx-auto text-center text-sm text-slate-500 dark:text-slate-400">
                    <p>© {new Date().getFullYear()} DermaScan (Experimental Project). All Rights Reserved.</p>
                    <p className="mt-2">This tool does not provide medical advice.</p>
                    {/* Add links to Privacy Policy, Terms of Service if applicable */}
                    {/* <div className="mt-3 space-x-4">
                        <Link to="/privacy" className="hover:text-sky-600 dark:hover:text-sky-400">Privacy Policy</Link>
                        <Link to="/terms" className="hover:text-sky-600 dark:hover:text-sky-400">Terms of Service</Link>
                    </div> */}
                </div>
            </footer>

        </div>
    );
};

export default Index;