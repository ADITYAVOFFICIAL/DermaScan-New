import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Home, FileQuestion, Phone, FileText, Menu, X, Microscope,BadgeIndianRupee, User } from "lucide-react"; // Added Menu, X, Microscope
import { Link, useLocation } from "react-router-dom"; // Added useLocation
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils"; // Import cn utility

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const navItems = [
    { to: "/", icon: <Home className="h-4 w-4" />, text: "Home" },
    { to: "/analyser", icon: <Upload className="h-4 w-4" />, text: "Skin Analyser" },
    { to: "/profile", icon: <User className="h-4 w-4" />, text: "Profile" },
    { to: "/faq", icon: <FileQuestion className="h-4 w-4" />, text: "FAQ" },
    { to: "/pricing", icon: <BadgeIndianRupee className="h-4 w-4" />, text: "Pricing" },
    { to: "/contact", icon: <Phone className="h-4 w-4" />, text: "Contact" },
    { to: "/terms", icon: <FileText className="h-4 w-4" />, text: "Terms" },
  ];

  const navVariants = {
    hidden: { y: -30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
  };

  const mobileMenuVariants = {
    closed: { opacity: 0, y: -20, transition: { duration: 0.3, ease: "easeOut" } },
    open: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeIn" } },
  };

  const mobileItemVariants = {
    closed: { opacity: 0, x: -20 },
    open: { opacity: 1, x: 0 },
  };

  return (
    <motion.nav
      className="sticky top-0 z-50 border-b border-sky-100/80 bg-white/95 backdrop-blur-sm shadow-sm"
      variants={navVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link to="/" className="flex items-center text-sky-700 font-bold text-xl group">
              <Microscope className="h-6 w-6 mr-2 text-sky-600 group-hover:text-sky-800 transition-colors" />
              <span className="group-hover:text-sky-800 transition-colors">
              DermaScan
              </span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex sm:items-center sm:space-x-1">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} icon={item.icon} text={item.text} />
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="sm:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMobileMenu} aria-label="Toggle menu">
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="sm:hidden absolute top-16 left-0 w-full bg-white shadow-lg border-t border-sky-100/80 pb-4"
            variants={mobileMenuVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            <motion.ul
              className="flex flex-col space-y-1 px-4 pt-2"
              variants={{ open: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } } }}
            >
              {navItems.map((item) => (
                <motion.li key={item.to} variants={mobileItemVariants}>
                  <NavLink to={item.to} icon={item.icon} text={item.text} isMobile onClick={toggleMobileMenu} />
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

// Updated NavLink with active state and mobile styling
const NavLink = ({ to, icon, text, isMobile = false, onClick }: { to: string; icon: React.ReactNode; text: string; isMobile?: boolean; onClick?: () => void }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <motion.div
      whileHover={{ scale: isMobile ? 1 : 1.05 }}
      whileTap={{ scale: 0.97 }}
      className={cn(isMobile && "w-full")}
    >
      <Link to={to} onClick={onClick}>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-gray-600 hover:text-sky-700 hover:bg-sky-50/70 transition-colors duration-150",
            isActive && "bg-sky-100/80 text-sky-800 font-medium",
            isMobile ? "text-base px-3 py-3 h-auto" : "text-sm px-3 py-2", // Adjusted padding/text size
            !isMobile && "flex items-center" // Ensure icon and text align on desktop
          )}
        >
          <span className={cn("mr-2", isMobile ? "h-5 w-5" : "h-4 w-4")}>{icon}</span>
          {text}
        </Button>
      </Link>
    </motion.div>
  );
};

export default Navbar;