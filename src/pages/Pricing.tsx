import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Check, Star, Zap, Building } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const pricingTiers = [
    {
        name: "Free",
        price: "₹0",
        frequency: "/month",
        description: "Get started with basic analysis.",
        features: [
            "10 Analyses per month",
            "Basic AI Model",
            "Standard Support",
            "Limited History",
        ],
        cta: "Get Started Free",
        link: "/analyser",
        icon: <Zap className="h-6 w-6 mb-4 text-gray-500" />,
        recommended: false,
    },
    {
        name: "Pro",
        price: "₹499",
        frequency: "/month",
        description: "For individuals needing more power.",
        features: [
            "100 Analyses per month",
            "Advanced AI Model",
            "Priority Support",
            "Full Analysis History",
            "Early Access to New Features",
        ],
        cta: "Upgrade to Pro",
        link: "/profile?plan=pro", // Example link
        icon: <Star className="h-6 w-6 mb-4 text-yellow-500" />,
        recommended: true,
    },
    {
        name: "Enterprise",
        price: "Custom",
        frequency: "",
        description: "Tailored solutions for businesses.",
        features: [
            "Unlimited Analyses",
            "Custom AI Model Integration",
            "Dedicated Account Manager",
            "API Access",
            "Team Collaboration Tools",
        ],
        cta: "Contact Sales",
        link: "/contact?subject=Enterprise", // Example link
        icon: <Building className="h-6 w-6 mb-4 text-blue-600" />,
        recommended: false,
    },
];

const Pricing = () => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15, delayChildren: 0.2 },
        },
    };

    const itemVariants = {
        hidden: { y: 30, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.5, ease: "easeOut" },
        },
    };

     const cardHoverVariant = {
        hover: {
            y: -8,
            boxShadow: "0 12px 30px -8px rgba(0, 0, 0, 0.15), 0 5px 8px -6px rgba(0, 0, 0, 0.1)",
            transition: { duration: 0.25, ease: "easeOut" }
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
                        Choose Your <span className="text-sky-600 dark:text-sky-400">Plan</span>
                    </motion.h1>
                    <motion.p
                        variants={itemVariants}
                        className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto"
                    >
                        Select the perfect plan that fits your needs, offering powerful AI skin analysis.
                    </motion.p>
                </motion.div>

                {/* Pricing Grid */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 items-stretch" // items-stretch makes cards same height
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {pricingTiers.map((tier) => (
                        <motion.div
                            key={tier.name}
                            variants={itemVariants}
                            whileHover="hover"
                            className="h-full" // Ensure motion div takes full height
                        >
                            <motion.div variants={cardHoverVariant} className="h-full">
                                <Card className={cn(
                                    "flex flex-col h-full border dark:border-slate-800 shadow-lg transition-shadow duration-200 bg-white dark:bg-slate-900 overflow-hidden",
                                    tier.recommended && "border-sky-500 border-2 relative"
                                )}>
                                    {tier.recommended && (
                                        <div className="absolute top-0 right-0 bg-sky-600 text-white text-xs font-semibold px-3 py-1 rounded-bl-lg shadow-md">
                                            Recommended
                                        </div>
                                    )}
                                    <CardHeader className="p-6 text-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50">
                                        {tier.icon}
                                        <CardTitle className="text-2xl font-semibold text-slate-800 dark:text-slate-200">{tier.name}</CardTitle>
                                        <CardDescription className="text-slate-600 dark:text-slate-400 mt-1">{tier.description}</CardDescription>
                                        <div className="mt-4">
                                            <span className="text-4xl font-bold text-slate-900 dark:text-slate-100">{tier.price}</span>
                                            {tier.frequency && <span className="text-sm text-slate-500 dark:text-slate-400">{tier.frequency}</span>}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-6 flex-grow">
                                        <ul className="space-y-3 text-slate-700 dark:text-slate-300">
                                            {tier.features.map((feature, index) => (
                                                <li key={index} className="flex items-center">
                                                    <Check className="h-5 w-5 text-sky-500 mr-3 flex-shrink-0" />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                    <CardFooter className="p-6 mt-auto">
                                        <Link to={tier.link} className="w-full">
                                            <Button
                                                size="lg"
                                                className={cn(
                                                    "w-full text-lg h-auto py-3",
                                                    tier.recommended
                                                        ? "bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white"
                                                        : "bg-slate-100 hover:bg-slate-200 text-sky-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800"
                                                )}
                                            >
                                                {tier.cta}
                                            </Button>
                                        </Link>
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        </motion.div>
                    ))}
                </motion.div>

                 {/* Disclaimer */}
                 <motion.div
                    className="text-center mt-16 text-sm text-slate-500 dark:text-slate-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                 >
                    <p>All prices are in Indian Rupees (INR) and exclude applicable taxes.</p>
                    <p>Plans and features are subject to change. Please refer to the <Link to="/terms" className="text-sky-600 hover:underline">Terms of Service</Link> for details.</p>
                 </motion.div>
            </div>
        </div>
    );
};

export default Pricing;