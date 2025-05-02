import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  Save,
  User,
  FileEdit,
  Clock,
  Heart,
  Shield,
  X,
  Eye,
  Loader2,
  RefreshCcw,
  Image as ImageIcon // Import ImageIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { format, isValid, parseISO } from 'date-fns'; // Import isValid and parseISO for robust date handling

// Import the modal component
import AnalysisViewModal from '@/components/AnalysisViewModal'; // Adjust path if necessary

// --- Type Definitions ---

// User Profile Data structure
interface UserProfileData {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string; // Keep as string, format for input type="date"
  gender: string;
  address: string;
  skinType: string;
  allergies: string;
  medications: string;
  skinConditions: string;
  familyHistory: string;
  previousTreatments: string;
  recentChanges: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  dataSharing: boolean;
  reminders: boolean;
  twoFactorAuth: boolean;
}

// Analysis Result Object structure (matching modal and backend)
interface AnalysisResultObject {
  generatedAnalysis?: string;
  potentialDiagnosis?: string | null;
  modelUsed?: string;
  analysisTimestamp?: string;
  conditionDetected?: string; // Legacy field
  confidence?: number; // Legacy field
  recommendation?: string; // Legacy field
  _simulation?: boolean; // Legacy field
  error?: string;
  rawData?: string;
  [key: string]: unknown;
}

// Analysis History Item structure
// IMPORTANT: Update this to match the modal's definition
interface AnalysisHistoryItem {
  _id: string;
  analysisDate: string; // ISO string
  results: AnalysisResultObject | string | null; // Can be object or string
  imagePath: string; // Relative path
}

// Initial empty state for the profile form
const initialProfileState: UserProfileData = {
    _id: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '', // Initialize as empty string for date input
    gender: 'prefer-not-to-say',
    skinType: 'normal',
    address: '',
    allergies: '',
    medications: '',
    skinConditions: '',
    familyHistory: '',
    previousTreatments: '',
    recentChanges: '',
    emailNotifications: true,
    smsNotifications: false,
    dataSharing: false,
    reminders: true,
    twoFactorAuth: false,
};

// --- Profile Component ---
const Profile = () => {
  const { toast } = useToast();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ""; // Get from .env, provide default empty string

  // --- State Variables ---
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Loading profile data
  const [isSaving, setIsSaving] = useState(false); // Saving profile/settings
  const [error, setError] = useState<string | null>(null); // Primary fetch/save error

  // Profile form data
  const [profileData, setProfileData] = useState<UserProfileData>(initialProfileState);
  // Store original data for cancellation
  const [originalProfileData, setOriginalProfileData] = useState<UserProfileData>(initialProfileState);

  // Analysis history data
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false); // Loading history specifically

  // State for the Analysis View Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisHistoryItem | null>(null);

  // --- Data Fetching Callbacks ---

  // Fetch main profile data (user + profile combined)
  const fetchProfileData = useCallback(async () => {
    if (!API_BASE_URL) {
      setError("API URL not configured. Cannot fetch profile.");
      setIsLoading(false);
      toast({ variant: "destructive", title: "Configuration Error", description: "API Base URL is missing." });
      return;
    }
    setIsLoading(true);
    setError(null);
    console.log("Fetching profile data...");
    try {
      const response = await fetch(`${API_BASE_URL}/api/profile/me`, {
        method: 'GET',
        credentials: 'include', // Send cookies
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error("Unauthorized. Please log in again.");
        const errorData = await response.json().catch(() => ({ msg: `HTTP error ${response.status}` }));
        throw new Error(errorData.msg || `Failed to fetch profile (${response.status})`);
      }

      const data: UserProfileData = await response.json();
      console.log("Profile data received:", data);

      // Format dateOfBirth for the input field (YYYY-MM-DD)
      // Ensure robust parsing and handle invalid dates
      if (data.dateOfBirth) {
          try {
              const parsedDate = parseISO(data.dateOfBirth); // Try parsing ISO string
              if (isValid(parsedDate)) {
                  data.dateOfBirth = format(parsedDate, 'yyyy-MM-dd');
              } else {
                   // Attempt to parse potentially different formats if needed, or default
                   const directDate = new Date(data.dateOfBirth);
                   if (isValid(directDate)) {
                       data.dateOfBirth = format(directDate, 'yyyy-MM-dd');
                   } else {
                       console.warn("Could not parse dateOfBirth:", data.dateOfBirth);
                       data.dateOfBirth = ''; // Reset if invalid
                   }
              }
          } catch (e) {
              console.warn("Error formatting dateOfBirth:", data.dateOfBirth, e);
              data.dateOfBirth = ''; // Reset on error
          }
      } else {
           data.dateOfBirth = ''; // Ensure it's empty string if null/undefined
      }

      setProfileData(data);
      setOriginalProfileData(data); // Store original data for cancel functionality

    } catch (err) {
      console.error("Fetch profile error:", err);
      const errorMsg = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMsg);
      toast({ variant: "destructive", title: "Error Fetching Profile", description: errorMsg });
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE_URL, toast]);

  // Fetch analysis history
   const fetchAnalysisHistory = useCallback(async () => {
    if (!API_BASE_URL) {
        // Don't show toast here, as profile fetch might handle it
        console.warn("API URL not configured. Cannot fetch history.");
        return;
    }

    setIsLoadingHistory(true);
    console.log("Fetching analysis history...");
    try {
       const response = await fetch(`${API_BASE_URL}/api/analysis`, {
         method: 'GET',
         credentials: 'include', // Send cookies
         headers: { 'Accept': 'application/json' }
       });

       if (!response.ok) {
         if (response.status === 401) throw new Error("Unauthorized fetching history.");
         const errorData = await response.json().catch(() => ({ msg: `HTTP error ${response.status}` }));
         throw new Error(errorData.msg || `Failed to fetch analysis history (${response.status})`);
       }

       const historyData: AnalysisHistoryItem[] = await response.json();
       console.log("Analysis history received:", historyData);
       setAnalysisHistory(historyData);

     } catch (err) {
       console.error("Fetch history error:", err);
       // Show toast for history fetch errors, but don't set the main page error state
       toast({ variant: "destructive", title: "Error Fetching History", description: err instanceof Error ? err.message : "Unknown error" });
     } finally {
       setIsLoadingHistory(false);
     }
   }, [API_BASE_URL, toast]);


  // --- Initial Data Fetch Effect ---
  useEffect(() => {
    fetchProfileData();
    fetchAnalysisHistory();
  }, [fetchProfileData, fetchAnalysisHistory]); // Re-run if callbacks change (due to API_BASE_URL change, though unlikely)

  // --- Event Handlers ---

  // Handle changes in text inputs and textareas
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle changes in Select components
  const handleSelectChange = (name: keyof UserProfileData, value: string) => {
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle changes in Switch components
  const handleSwitchChange = (name: keyof UserProfileData, checked: boolean) => {
    setProfileData((prev) => ({ ...prev, [name]: checked }));
  };

  // Handle saving changes for Profile or Preferences sections
  const handleSaveChanges = async (section: 'Profile' | 'Preferences') => {
    if (!API_BASE_URL) {
        toast({ variant: "destructive", title: "Configuration Error", description: "API URL not configured." });
        return;
    }
    setIsSaving(true);
    setError(null); // Clear previous errors

    let url = '';
    let method = '';
    let body: Partial<UserProfileData> = {}; // Use Partial<> as we only send relevant fields

    // Determine API endpoint and request body based on the section being saved
    if (section === 'Profile') {
      url = `${API_BASE_URL}/api/profile/me`;
      method = 'POST'; // Backend uses POST for profile updates
      // Include all fields managed in Personal and Medical tabs
      body = {
        firstName: profileData.firstName, lastName: profileData.lastName,
        email: profileData.email, phone: profileData.phone,
        dateOfBirth: profileData.dateOfBirth || null, // Send null if empty string for backend flexibility
        gender: profileData.gender, address: profileData.address,
        skinType: profileData.skinType, allergies: profileData.allergies,
        medications: profileData.medications, skinConditions: profileData.skinConditions,
        familyHistory: profileData.familyHistory, previousTreatments: profileData.previousTreatments,
        recentChanges: profileData.recentChanges,
      };
    } else if (section === 'Preferences') {
      url = `${API_BASE_URL}/api/settings`;
      method = 'PUT'; // Backend uses PUT for settings updates
      // Include only fields managed in the Settings tab
      body = {
        emailNotifications: profileData.emailNotifications,
        smsNotifications: profileData.smsNotifications,
        dataSharing: profileData.dataSharing,
        reminders: profileData.reminders,
        twoFactorAuth: profileData.twoFactorAuth,
      };
    } else {
        console.error("Invalid section passed to handleSaveChanges:", section);
        setIsSaving(false);
        return; // Should not happen
    }

    console.log(`Saving ${section} data to ${url} with method ${method}...`);
    try {
      const response = await fetch(url, {
        method: method,
        credentials: 'include', // Send cookies
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(body),
      });

      const responseData = await response.json(); // Always try to parse JSON

      if (!response.ok) {
        // Throw error with message from backend if available
        throw new Error(responseData.msg || `Failed to save ${section.toLowerCase()} (${response.status})`);
      }

      console.log(`${section} save successful:`, responseData);

      // Update local state with the response from the server
      // The response might contain the fully updated profile or just the updated settings
      // Use functional update to ensure we're working with the latest state
      setProfileData(prev => {
          const updatedData = { ...prev, ...responseData };
           // Re-format dateOfBirth after update if necessary (backend might return ISO string)
           if (updatedData.dateOfBirth) {
             try {
               const parsedDate = parseISO(updatedData.dateOfBirth);
               if (isValid(parsedDate)) {
                 updatedData.dateOfBirth = format(parsedDate, 'yyyy-MM-dd');
               } else {
                 updatedData.dateOfBirth = ''; // Reset if invalid
               }
             } catch { updatedData.dateOfBirth = ''; }
           } else {
             updatedData.dateOfBirth = '';
           }
          return updatedData;
      });
      // Also update the original data state to reflect the successful save
      setOriginalProfileData(prev => {
          const updatedData = { ...prev, ...responseData };
          // Re-format date here too
          if (updatedData.dateOfBirth) {
             try {
               const parsedDate = parseISO(updatedData.dateOfBirth);
               if (isValid(parsedDate)) {
                 updatedData.dateOfBirth = format(parsedDate, 'yyyy-MM-dd');
               } else { updatedData.dateOfBirth = ''; }
             } catch { updatedData.dateOfBirth = ''; }
           } else { updatedData.dateOfBirth = ''; }
          return updatedData;
      });


      toast({
        title: `${section} Updated`,
        description: `Your ${section.toLowerCase()} information has been saved successfully.`,
        className: "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700",
      });
      setIsEditing(false); // Exit editing mode on successful save

    } catch (err) {
      console.error(`Save ${section} error:`, err);
      const errorMsg = err instanceof Error ? err.message : `An unknown error occurred while saving ${section.toLowerCase()}.`;
      setError(errorMsg); // Display error message near the save button
      toast({ variant: "destructive", title: `Error Saving ${section}`, description: errorMsg });
      // Do NOT exit editing mode on error, allow user to retry
    } finally {
      setIsSaving(false); // Stop saving indicator
    }
  };

   // --- Cancel Edit Handler ---
   const handleCancelEdit = () => {
       console.log("Cancelling edit, reverting to original data.");
       setProfileData(originalProfileData); // Revert form data to last saved state
       setIsEditing(false); // Exit editing mode
       setError(null); // Clear any errors shown during editing
   };

   // --- Modal Control Handlers ---
   const handleOpenModal = (analysisItem: AnalysisHistoryItem) => {
       console.log("Opening modal for analysis:", analysisItem._id);
       setSelectedAnalysis(analysisItem);
       setIsModalOpen(true);
   };

   const handleCloseModal = () => {
       console.log("Closing modal.");
       setIsModalOpen(false);
       setSelectedAnalysis(null); // Clear selected item when closing
   };

  // --- Animation Variants ---
  const containerVariants = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.08, when: "beforeChildren" } } };
  const itemVariants = { hidden: { y: 10, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.3, ease: "easeOut" } } };
  const buttonVariants = { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1, transition: { duration: 0.2 } }, exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } } };

  // --- Input/Textarea Styling ---
  const inputStyles = "bg-slate-50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 focus-visible:ring-sky-500 dark:focus-visible:ring-sky-400 disabled:opacity-70 disabled:cursor-not-allowed";
  const labelStyles = "text-sm font-medium text-slate-700 dark:text-slate-300";

  // --- Loading State UI ---
  if (isLoading) {
      return (
          <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
              <Loader2 className="h-12 w-12 animate-spin text-sky-600" />
              <span className="ml-4 text-lg text-slate-600 dark:text-slate-400">Loading Profile...</span>
          </div>
      );
  }

  // --- Error State UI (for initial load failure) ---
   if (error && !isEditing && !isLoading) { // Show primary fetch error only when not loading/editing
       return (
           <div className="max-w-2xl mx-auto py-12 px-4 text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
                <h2 className="mt-4 text-xl font-semibold text-slate-800 dark:text-slate-200">Failed to Load Profile</h2>
                <p className="mt-2 text-slate-600 dark:text-slate-400">{error}</p>
                <Button onClick={fetchProfileData} className="mt-6" variant="outline">
                    <RefreshCcw className="mr-2 h-4 w-4" /> Try Again
                </Button>
           </div>
       );
   }

  // --- Main Component JSX ---
  return (
    <div className="max-w-7xl mx-auto py-12 md:py-16 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 md:mb-12"
      >
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">User Profile</h1>
          <p className="mt-1 text-base text-slate-600 dark:text-slate-400">Manage your personal details, medical information, analysis history, and preferences.</p>
        </div>
        {/* Edit/Cancel Button */}
        <Button
          onClick={isEditing ? handleCancelEdit : () => setIsEditing(true)}
          variant={isEditing ? "destructive" : "outline"}
          className={cn(
              "mt-4 sm:mt-0 transition-all duration-200 ease-in-out",
              isEditing
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "border-sky-400 dark:border-sky-600 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/30 hover:border-sky-500 dark:hover:border-sky-500",
              isSaving && "opacity-50 cursor-not-allowed" // Style when saving
          )}
          size="sm"
          disabled={isSaving} // Disable while saving operation is in progress
        >
          {isEditing ? <X className="mr-2 h-4 w-4" /> : <FileEdit className="mr-2 h-4 w-4" />}
          {isEditing ? "Cancel Editing" : "Edit Profile"}
        </Button>
      </motion.div>

      {/* Display Save Error Message (only when editing) */}
       {error && isEditing && (
           <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 rounded-md text-sm text-red-700 dark:text-red-300 flex items-center gap-2"
            >
               <AlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
           </motion.div>
       )}

      {/* Tabs Navigation */}
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="mb-8 grid grid-cols-2 sm:grid-cols-4 gap-1 bg-sky-100/80 dark:bg-slate-800 p-1 rounded-lg w-full max-w-2xl mx-auto h-auto">
          <TabsTrigger value="personal" className="py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:shadow-sm data-[state=active]:text-sky-700 dark:data-[state=active]:text-sky-300 text-slate-600 dark:text-slate-300 transition-colors"> <User className="mr-2 h-4 w-4 inline-block" /> Personal </TabsTrigger>
          <TabsTrigger value="medical" className="py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:shadow-sm data-[state=active]:text-sky-700 dark:data-[state=active]:text-sky-300 text-slate-600 dark:text-slate-300 transition-colors"> <Heart className="mr-2 h-4 w-4 inline-block" /> Medical </TabsTrigger>
          <TabsTrigger value="history" className="py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:shadow-sm data-[state=active]:text-sky-700 dark:data-[state=active]:text-sky-300 text-slate-600 dark:text-slate-300 transition-colors"> <Clock className="mr-2 h-4 w-4 inline-block" /> History </TabsTrigger>
          <TabsTrigger value="settings" className="py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:shadow-sm data-[state=active]:text-sky-700 dark:data-[state=active]:text-sky-300 text-slate-600 dark:text-slate-300 transition-colors"> <Shield className="mr-2 h-4 w-4 inline-block" /> Settings </TabsTrigger>
        </TabsList>

        {/* --- Tab Content Panels --- */}

        {/* Personal Info Tab Panel */}
        <TabsContent value="personal">
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <Card className="border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-slate-800/50 mb-6 bg-white dark:bg-slate-900/80 backdrop-blur-sm">
              <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b dark:border-slate-700/50">
                <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center"> <User className="mr-2 h-5 w-5 text-sky-600 dark:text-sky-400" /> Personal Information </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {/* Form Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                  {/* Input Fields */}
                  <motion.div variants={itemVariants} className="space-y-1.5">
                    <Label htmlFor="firstName" className={labelStyles}>First Name</Label>
                    <Input id="firstName" name="firstName" value={profileData.firstName} onChange={handleInputChange} disabled={!isEditing || isSaving} className={inputStyles} autoComplete="given-name" />
                  </motion.div>
                  <motion.div variants={itemVariants} className="space-y-1.5">
                    <Label htmlFor="lastName" className={labelStyles}>Last Name</Label>
                    <Input id="lastName" name="lastName" value={profileData.lastName} onChange={handleInputChange} disabled={!isEditing || isSaving} className={inputStyles} autoComplete="family-name" />
                  </motion.div>
                  <motion.div variants={itemVariants} className="space-y-1.5">
                    <Label htmlFor="email" className={labelStyles}>Email</Label>
                    <Input id="email" name="email" type="email" value={profileData.email} onChange={handleInputChange} disabled={!isEditing || isSaving} className={inputStyles} autoComplete="email" />
                  </motion.div>
                  <motion.div variants={itemVariants} className="space-y-1.5">
                    <Label htmlFor="phone" className={labelStyles}>Phone</Label>
                    <Input id="phone" name="phone" type="tel" value={profileData.phone} onChange={handleInputChange} disabled={!isEditing || isSaving} className={inputStyles} placeholder="Optional" autoComplete="tel" />
                  </motion.div>
                  <motion.div variants={itemVariants} className="space-y-1.5">
                    <Label htmlFor="dateOfBirth" className={labelStyles}>Date of Birth</Label>
                    <Input id="dateOfBirth" name="dateOfBirth" type="date" value={profileData.dateOfBirth} onChange={handleInputChange} disabled={!isEditing || isSaving} className={inputStyles} max={format(new Date(), 'yyyy-MM-dd')} /> {/* Prevent future dates */}
                  </motion.div>
                  <motion.div variants={itemVariants} className="space-y-1.5">
                    <Label htmlFor="gender" className={labelStyles}>Gender</Label>
                    <Select disabled={!isEditing || isSaving} value={profileData.gender} onValueChange={(value) => handleSelectChange("gender", value)}>
                      <SelectTrigger className={inputStyles}><SelectValue placeholder="Select gender" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="nonbinary">Non-binary</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>
                  <motion.div variants={itemVariants} className="space-y-1.5 md:col-span-2">
                    <Label htmlFor="address" className={labelStyles}>Address</Label>
                    <Textarea id="address" name="address" value={profileData.address} onChange={handleInputChange} disabled={!isEditing || isSaving} className={cn("min-h-[80px]", inputStyles)} placeholder="Optional address details" />
                  </motion.div>
                </div>
                {/* Save Button (Visible only when editing) */}
                <AnimatePresence>
                  {isEditing && (
                    <motion.div className="mt-6 flex justify-end" variants={buttonVariants} initial="initial" animate="animate" exit="exit">
                      <Button onClick={() => handleSaveChanges("Profile")} disabled={isSaving} className="bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white min-w-[120px]">
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        {isSaving ? 'Saving...' : 'Save Profile'}
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Medical Info Tab Panel */}
        <TabsContent value="medical">
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <Card className="border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-slate-800/50 mb-6 bg-white dark:bg-slate-900/80 backdrop-blur-sm">
              <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b dark:border-slate-700/50">
                <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center"> <Heart className="mr-2 h-5 w-5 text-red-500 dark:text-red-400" /> Medical Information </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                 {/* Form Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                  {/* Input Fields */}
                  <motion.div variants={itemVariants} className="space-y-1.5">
                    <Label htmlFor="skinType" className={labelStyles}>Skin Type</Label>
                    <Select disabled={!isEditing || isSaving} value={profileData.skinType} onValueChange={(value) => handleSelectChange("skinType", value)}>
                      <SelectTrigger className={inputStyles}><SelectValue placeholder="Select skin type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="dry">Dry</SelectItem>
                        <SelectItem value="oily">Oily</SelectItem>
                        <SelectItem value="combination">Combination</SelectItem>
                        <SelectItem value="sensitive">Sensitive</SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>
                  <motion.div variants={itemVariants} className="space-y-1.5">
                    <Label htmlFor="allergies" className={labelStyles}>Known Allergies</Label>
                    <Textarea id="allergies" name="allergies" value={profileData.allergies} onChange={handleInputChange} disabled={!isEditing || isSaving} placeholder="e.g., Penicillin, Latex, specific cosmetic ingredients" className={cn("min-h-[80px]", inputStyles)} />
                  </motion.div>
                  <motion.div variants={itemVariants} className="space-y-1.5 md:col-span-2">
                    <Label htmlFor="medications" className={labelStyles}>Current Medications</Label>
                    <Textarea id="medications" name="medications" value={profileData.medications} onChange={handleInputChange} disabled={!isEditing || isSaving} placeholder="List all medications (prescription and over-the-counter), including dosages" className={cn("min-h-[80px]", inputStyles)} />
                  </motion.div>
                  <motion.div variants={itemVariants} className="space-y-1.5 md:col-span-2">
                    <Label htmlFor="skinConditions" className={labelStyles}>Pre-existing Skin Conditions</Label>
                    <Textarea id="skinConditions" name="skinConditions" value={profileData.skinConditions} onChange={handleInputChange} disabled={!isEditing || isSaving} placeholder="e.g., Diagnosed Eczema, Psoriasis, Acne, Rosacea" className={cn("min-h-[80px]", inputStyles)} />
                  </motion.div>
                  <motion.div variants={itemVariants} className="space-y-1.5 md:col-span-2">
                    <Label htmlFor="familyHistory" className={labelStyles}>Family History of Skin Conditions</Label>
                    <Textarea id="familyHistory" name="familyHistory" value={profileData.familyHistory} onChange={handleInputChange} disabled={!isEditing || isSaving} placeholder="e.g., Mother diagnosed with Psoriasis, Father with Melanoma" className={cn("min-h-[80px]", inputStyles)} />
                  </motion.div>
                  <motion.div variants={itemVariants} className="space-y-1.5 md:col-span-2">
                    <Label htmlFor="previousTreatments" className={labelStyles}>Previous Skin Treatments</Label>
                    <Textarea id="previousTreatments" name="previousTreatments" value={profileData.previousTreatments} onChange={handleInputChange} disabled={!isEditing || isSaving} placeholder="e.g., Topical steroids for eczema, Accutane for acne (include dates if possible)" className={cn("min-h-[80px]", inputStyles)} />
                  </motion.div>
                   <motion.div variants={itemVariants} className="space-y-1.5 md:col-span-2">
                    <Label htmlFor="recentChanges" className={labelStyles}>Recent Lifestyle or Product Changes</Label>
                    <Textarea id="recentChanges" name="recentChanges" value={profileData.recentChanges} onChange={handleInputChange} disabled={!isEditing || isSaving} placeholder="e.g., Started new diet, moved location, increased stress, using new skincare products" className={cn("min-h-[80px]", inputStyles)} />
                  </motion.div>
                </div>
                {/* Informational Note */}
                <motion.div variants={itemVariants} className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800/50 rounded-md">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-200">Important Note</h4>
                      <p className="text-sm text-amber-700 dark:text-amber-300 mt-1 leading-relaxed"> Providing accurate medical information helps the AI provide more relevant (though still experimental) analysis context. This data is kept confidential and is <strong className="font-medium">not</strong> used for diagnosis. </p>
                    </div>
                  </div>
                </motion.div>
                {/* Save Button (Visible only when editing) */}
                <AnimatePresence>
                  {isEditing && (
                    <motion.div className="mt-6 flex justify-end" variants={buttonVariants} initial="initial" animate="animate" exit="exit">
                      <Button onClick={() => handleSaveChanges("Profile")} disabled={isSaving} className="bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white min-w-[120px]">
                         {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                         {isSaving ? 'Saving...' : 'Save Profile'}
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Analysis History Tab Panel */}
        <TabsContent value="history">
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <Card className="border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-slate-800/50 mb-6 bg-white dark:bg-slate-900/80 backdrop-blur-sm">
              <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b dark:border-slate-700/50">
                <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center"> <Clock className="mr-2 h-5 w-5 text-indigo-600 dark:text-indigo-400" /> Analysis History </CardTitle>
                 <CardDescription>Review your past skin analysis records.</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {/* Loading State for History */}
                {isLoadingHistory ? (
                     <div className="flex justify-center items-center py-10 text-slate-500 dark:text-slate-400">
                         <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mr-3" />
                         <span>Loading analysis history...</span>
                     </div>
                /* History Items List */
                ) : analysisHistory.length > 0 ? (
                  <div className="space-y-5">
                    {analysisHistory.map((analysis) => {
                        // Extract potential diagnosis for display, handle different result types
                        let displayDiagnosis = "Analysis Details"; // Default title
                        let displayType = "Details"; // Default tag text
                        let typeColor = "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300"; // Default color

                        if (typeof analysis.results === 'object' && analysis.results !== null) {
                            if (analysis.results.potentialDiagnosis) {
                                displayDiagnosis = String(analysis.results.potentialDiagnosis);
                                displayType = "Gemini 2.0 Flash";
                                // Example coloring based on diagnosis term (customize as needed)
                                if (displayDiagnosis.toLowerCase().includes('acne')) typeColor = "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300";
                                else if (displayDiagnosis.toLowerCase().includes('eczema') || displayDiagnosis.toLowerCase().includes('dermatitis')) typeColor = "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300";
                                else typeColor = "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300";
                            } else if (analysis.results.conditionDetected) { // Fallback to legacy field
                                displayDiagnosis = String(analysis.results.conditionDetected);
                                displayType = "Detected";
                                typeColor = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300";
                            } else if (analysis.results.error) {
                                displayDiagnosis = "Analysis Error";
                                displayType = "Error";
                                typeColor = "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300";
                            }
                        } else if (typeof analysis.results === 'string') {
                             displayDiagnosis = "Raw Analysis";
                             displayType = "Text";
                        }

                        const analysisDateFormatted = analysis.analysisDate
                            ? format(new Date(analysis.analysisDate), 'MMM d, yyyy h:mm a') // More concise date format
                            : 'Date Unknown';

                        const imageUrl = analysis.imagePath ? `${API_BASE_URL}${analysis.imagePath.startsWith('/') ? '' : '/'}${analysis.imagePath}` : null;

                        return (
                            <motion.div
                                key={analysis._id}
                                variants={itemVariants}
                                className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 transition-shadow duration-200 hover:shadow-md dark:hover:border-slate-600"
                            >
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                                    {/* Image Thumbnail */}
                                    {imageUrl ? (
                                         <img src={imageUrl} alt="Analysis thumbnail" className="w-16 h-16 object-cover rounded border dark:border-slate-600 flex-shrink-0 mb-2 sm:mb-0" onError={(e) => e.currentTarget.style.display = 'none'} />
                                    ) : (
                                         <div className="w-16 h-16 rounded border dark:border-slate-600 flex items-center justify-center bg-slate-100 dark:bg-slate-800 flex-shrink-0 mb-2 sm:mb-0">
                                             <ImageIcon className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                                         </div>
                                    )}
                                    {/* Main Info */}
                                    <div className="flex-grow sm:ml-4">
                                        <h3 className="font-semibold text-base text-slate-800 dark:text-slate-200 leading-tight">
                                            {displayDiagnosis}
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                            {analysisDateFormatted}
                                        </p>
                                    </div>
                                    {/* Tag & View Button */}
                                    <div className="flex flex-col sm:items-end items-start gap-2 mt-2 sm:mt-0">
                                        <div className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium w-fit", typeColor)}>
                                            {displayType}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-xs h-7 text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-900/50 px-2"
                                            onClick={() => handleOpenModal(analysis)} // Call handler to open modal
                                        >
                                            <Eye className="mr-1.5 h-3.5 w-3.5" /> View Details
                                        </Button>
                                    </div>
                                </div>
                                {/* Optional: Add a small snippet of recommendations or observations here if needed */}
                            </motion.div>
                        );
                    })}
                  </div>
                /* Empty State for History */
                ) : (
                  <motion.div variants={itemVariants} className="text-center py-10">
                    <Clock className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" />
                    <p className="mt-4 text-slate-500 dark:text-slate-400">No skin analyses found in your history.</p>
                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Analyses you perform will appear here.</p>
                    {/* Optional: Link to Analyser page - requires routing setup */}
                    {/* <Button asChild variant="link" className="mt-2 text-sky-600 dark:text-sky-400"><Link to="/analyser">Start New Analysis</Link></Button> */}
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Settings Tab Panel */}
        <TabsContent value="settings">
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <Card className="border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-slate-800/50 mb-6 bg-white dark:bg-slate-900/80 backdrop-blur-sm">
              <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b dark:border-slate-700/50">
                <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center"> <Shield className="mr-2 h-5 w-5 text-green-600 dark:text-green-400" /> Account Settings & Preferences </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {/* Settings List */}
                <div className="space-y-6 divide-y divide-slate-200 dark:divide-slate-700">
                  {[
                    { id: "emailNotifications", label: "Email Notifications", description: "Receive email updates about your analyses and account.", state: profileData.emailNotifications },
                    { id: "smsNotifications", label: "SMS Notifications", description: "Receive text updates (requires verified phone number).", state: profileData.smsNotifications },
                    { id: "dataSharing", label: "Data Sharing for Research", description: "Allow anonymized analysis data (image excluded) to be used for AI model improvement.", state: profileData.dataSharing },
                    { id: "reminders", label: "Follow-up Reminders", description: "Get occasional reminders to track skin condition progress (feature pending).", state: profileData.reminders },
                    { id: "twoFactorAuth", label: "Two-Factor Authentication", description: "Enhance your account security (requires setup - feature pending).", state: profileData.twoFactorAuth },
                  ].map(item => (
                    <motion.div key={item.id} variants={itemVariants} className="flex items-center justify-between pt-6 first:pt-0">
                      <div className="mr-4 flex-1"> {/* Allow text to wrap */}
                        <Label htmlFor={item.id} className="text-base font-medium text-slate-800 dark:text-slate-200 cursor-pointer"> {item.label} </Label>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5"> {item.description} </p>
                      </div>
                      <Switch
                        id={item.id}
                        checked={item.state}
                        onCheckedChange={(checked) => handleSwitchChange(item.id as keyof UserProfileData, checked)}
                        disabled={!isEditing || isSaving || ['reminders', 'twoFactorAuth'].includes(item.id)} // Disable pending features
                        aria-label={item.label}
                        className={cn(['reminders', 'twoFactorAuth'].includes(item.id) && "opacity-50 cursor-not-allowed")} // Style disabled pending features
                      />
                    </motion.div>
                  ))}
                </div>
                 {/* Save Button (Visible only when editing) */}
                <AnimatePresence>
                  {isEditing && (
                    <motion.div className="mt-8 flex justify-end border-t dark:border-slate-700 pt-6" variants={buttonVariants} initial="initial" animate="animate" exit="exit">
                      <Button onClick={() => handleSaveChanges("Preferences")} disabled={isSaving} className="bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white min-w-[160px]">
                         {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                         {isSaving ? 'Saving...' : 'Save Preferences'}
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Render the Analysis View Modal */}
      {/* It will only be visible when isModalOpen is true */}
      <AnalysisViewModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        analysis={selectedAnalysis}
        apiBaseUrl={API_BASE_URL} // Pass the base URL for image loading
      />
    </div>
  );
};

export default Profile;