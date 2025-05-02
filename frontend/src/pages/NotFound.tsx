import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle, Home } from "lucide-react"; // Using AlertTriangle for visual cue

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    // Keep the console error for debugging purposes
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center bg-gradient-to-b from-sky-50 via-white to-white dark:from-slate-950 dark:via-slate-950 dark:to-slate-950 p-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md"
      >
        <Card className="border-red-200 dark:border-red-800/50 shadow-lg bg-white dark:bg-slate-900">
          <CardHeader className="text-center bg-red-50 dark:bg-red-900/30 p-6 border-b border-red-200 dark:border-red-800/50">
            <div className="flex justify-center mb-4">
              <AlertTriangle className="h-16 w-16 text-red-500 dark:text-red-400" />
            </div>
            <CardTitle className="text-3xl font-bold text-red-800 dark:text-red-200">
              404 - Page Not Found
            </CardTitle>
            <CardDescription className="text-red-600 dark:text-red-300 mt-1">
              Oops! The page you're looking for doesn't seem to exist.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 text-center">
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              It might have been moved, deleted, or maybe you mistyped the URL. Let's get you back on track.
            </p>
            <Link to="/">
              <Button
                size="lg"
                className="bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white text-base px-6 py-2.5 h-auto rounded-md shadow-md transition-transform transform hover:scale-105"
              >
                <Home className="mr-2 h-5 w-5" />
                Return to Homepage
              </Button>
            </Link>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-4">
              Attempted path: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-slate-600 dark:text-slate-300">{location.pathname}</code>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default NotFound;