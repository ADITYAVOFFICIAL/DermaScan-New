import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Home,
  FileQuestion,
  Phone,
  FileText,
  Menu,
  X,
  Microscope,
  BadgeIndianRupee,
  User,
  LogIn, // Added LogIn icon
  LogOut, // Added LogOut icon
  UserPlus, // Added UserPlus icon
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth"; // Import useAuth

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout, isLoading } = useAuth(); // Get auth state and functions

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  // Define base navigation items
  const baseNavItems = [
    { to: "/", icon: <Home className="h-4 w-4" />, text: "Home", requiresAuth: false },
    { to: "/analyser", icon: <Upload className="h-4 w-4" />, text: "Skin Analyser", requiresAuth: true }, // Requires auth
    { to: "/profile", icon: <User className="h-4 w-4" />, text: "Profile", requiresAuth: true }, // Requires auth
    { to: "/faq", icon: <FileQuestion className="h-4 w-4" />, text: "FAQ", requiresAuth: false },
    { to: "/pricing", icon: <BadgeIndianRupee className="h-4 w-4" />, text: "Pricing", requiresAuth: false },
    { to: "/contact", icon: <Phone className="h-4 w-4" />, text: "Contact", requiresAuth: false },
    { to: "/terms", icon: <FileText className="h-4 w-4" />, text: "Terms", requiresAuth: false },
  ];

  // Filter nav items based on authentication status
  const navItems = baseNavItems.filter(item => !item.requiresAuth || isAuthenticated);

  // Define auth action items
  const authActionItems = isAuthenticated
    ? [
        {
          onClick: logout,
          icon: <LogOut className="h-4 w-4" />,
          text: "Logout",
          isButton: true,
        },
      ]
    : [
        { to: "/login", icon: <LogIn className="h-4 w-4" />, text: "Log In", isButton: false },
        { to: "/signup", icon: <UserPlus className="h-4 w-4" />, text: "Sign Up", isButton: false },
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
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Link to="/" className="flex items-center text-sky-700 font-bold text-xl group">
              <Microscope className="h-6 w-6 mr-2 text-sky-600 group-hover:text-sky-800 transition-colors" />
              <span className="group-hover:text-sky-800 transition-colors">DermaScan</span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex sm:items-center sm:space-x-1">
            {/* Render standard nav items */}
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} icon={item.icon} text={item.text} />
            ))}

            {/* Render Auth Actions - Show only after loading check */}
            {!isLoading && authActionItems.map((item, index) =>
              item.isButton ? (
                <motion.div key="logout-btn" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    variant="ghost"
                    onClick={item.onClick}
                    className="text-sm px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50/70 transition-colors duration-150 flex items-center"
                  >
                    <span className="mr-2 h-4 w-4">{item.icon}</span>
                    {item.text}
                  </Button>
                </motion.div>
              ) : (
                <NavLink key={item.to || `auth-${index}`} to={item.to!} icon={item.icon} text={item.text} />
              )
            )}
             {/* Placeholder during loading */}
             {isLoading && <div className="h-8 w-20 animate-pulse bg-gray-200 rounded-md"></div>}
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
              {/* Render standard nav items */}
              {navItems.map((item) => (
                <motion.li key={item.to} variants={mobileItemVariants}>
                  <NavLink to={item.to} icon={item.icon} text={item.text} isMobile onClick={toggleMobileMenu} />
                </motion.li>
              ))}

              {/* Divider */}
              {!isLoading && <hr className="my-2 border-gray-200" />}

              {/* Render Auth Actions - Show only after loading check */}
              {!isLoading && authActionItems.map((item, index) => (
                <motion.li key={item.to || `auth-mobile-${index}`} variants={mobileItemVariants}>
                  {item.isButton ? (
                     <Button
                        variant="ghost"
                        onClick={() => { item.onClick?.(); toggleMobileMenu(); }} // Close menu on click
                        className="w-full justify-start text-base px-3 py-3 h-auto text-gray-600 hover:text-red-600 hover:bg-red-50/70 transition-colors duration-150 flex items-center"
                      >
                        <span className="mr-2 h-5 w-5">{item.icon}</span>
                        {item.text}
                      </Button>
                  ) : (
                    <NavLink to={item.to!} icon={item.icon} text={item.text} isMobile onClick={toggleMobileMenu} />
                  )}
                </motion.li>
              ))}
               {/* Placeholder during loading */}
               {isLoading && (
                 <motion.li variants={mobileItemVariants}>
                    <div className="h-10 w-full animate-pulse bg-gray-200 rounded-md mt-2"></div>
                 </motion.li>
               )}
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

// NavLink component remains the same
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