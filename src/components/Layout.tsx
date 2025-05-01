
import { Toaster } from "@/components/ui/toaster";
import Navbar from "./Navbar";
import { motion } from "framer-motion";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-sky-50">
      <Navbar />
      <motion.main 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.main>
      <Toaster />
    </div>
  );
};

export default Layout;
