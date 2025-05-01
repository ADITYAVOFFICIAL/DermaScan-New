import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion"; // Added AnimatePresence
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"; // Added CardDescription
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
  X, // Added X for Cancel button
  Eye, // Added Eye for View Details
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils"; // Import cn utility

const Profile = () => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  // --- State Definitions (Keep existing state logic) ---
  const [personalInfo, setPersonalInfo] = useState({
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@example.com",
    phone: "+1 555-123-4567",
    dateOfBirth: "1985-06-15",
    gender: "female",
    address: "123 Main Street, Apt 4B\nSan Francisco, CA 94103",
  });

  const [medicalHistory, setMedicalHistory] = useState({
    skinType: "combination",
    allergies: "Penicillin, Latex",
    medications: "Loratadine 10mg daily",
    skinConditions: "Occasional eczema, seasonal dermatitis",
    familyHistory: "Mother: Psoriasis, Father: Melanoma",
    previousTreatments: "Topical corticosteroids for eczema flare-ups",
    recentChanges: "Increased stress levels, dietary changes",
    // recentPhotos: [], // Assuming this might be used later
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    dataSharing: false,
    reminders: true,
    twoFactorAuth: true,
  });

  // --- Handlers (Keep existing handler logic) ---
  const handlePersonalInfoChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setPersonalInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleMedicalHistoryChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setMedicalHistory((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof typeof medicalHistory, value: string) => {
     // Correctly type the name parameter
    setMedicalHistory((prev) => ({ ...prev, [name]: value }));
  };

   const handleGenderSelectChange = (value: string) => {
     setPersonalInfo((prev) => ({ ...prev, gender: value }));
   };

  const handleSwitchChange = (name: keyof typeof preferences, checked: boolean) => {
    setPreferences((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSaveChanges = (section: string) => {
    toast({
      title: `${section} Updated`,
      description: `Your ${section.toLowerCase()} information has been saved.`,
      className: "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700",
    });
    setIsEditing(false);
    // Here you would typically also send the updated data to your backend API
  };

  // --- Mock Data (Keep existing mock data) ---
  const recentSkinAnalyses = [
    {
      id: 1,
      date: "April 10, 2025",
      condition: "Acne Vulgaris",
      severity: "Mild",
      recommendations: "Consider over-the-counter benzoyl peroxide treatments. Maintain a consistent cleansing routine.",
    },
    {
      id: 2,
      date: "March 2, 2025",
      condition: "Contact Dermatitis",
      severity: "Moderate",
      recommendations: "Identify and avoid suspected irritants. Use hypoallergenic moisturizers and cleansers.",
    },
    {
      id: 3,
      date: "January 15, 2025",
      condition: "Eczema",
      severity: "Mild",
      recommendations: "Apply prescribed emollients frequently, especially after bathing. Avoid known triggers.",
    },
  ];

  // --- Animation Variants ---
  const containerVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.08, // Slightly faster stagger
        when: "beforeChildren",
      },
    },
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.3, ease: "easeOut" } },
  };

  const buttonVariants = {
     initial: { opacity: 0, scale: 0.9 },
     animate: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
     exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
  }

  // --- Input/Textarea Styling ---
  const inputStyles = "bg-slate-50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 focus-visible:ring-sky-500 dark:focus-visible:ring-sky-400 disabled:opacity-70 disabled:cursor-not-allowed";
  const labelStyles = "text-sm font-medium text-slate-700 dark:text-slate-300";

  return (
    <div className="max-w-7xl mx-auto py-12 md:py-16 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 md:mb-12"
      >
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">User Profile</h1>
          <p className="mt-1 text-base text-slate-600 dark:text-slate-400">Manage your personal details, medical history, and preferences.</p>
        </div>
        <Button
          onClick={() => setIsEditing(!isEditing)}
          variant={isEditing ? "destructive" : "outline"}
          className={cn(
            "mt-4 sm:mt-0 transition-colors duration-200",
            isEditing
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "border-sky-300 dark:border-sky-700 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/50"
          )}
          size="sm"
        >
          {isEditing ? <X className="mr-2 h-4 w-4" /> : <FileEdit className="mr-2 h-4 w-4" />}
          {isEditing ? "Cancel Editing" : "Edit Profile"}
        </Button>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="mb-8 grid grid-cols-2 sm:grid-cols-4 gap-1 bg-sky-100/80 dark:bg-slate-800 p-1 rounded-lg w-full max-w-2xl mx-auto h-auto">
          <TabsTrigger value="personal" className="py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:shadow-sm data-[state=active]:text-sky-700 dark:data-[state=active]:text-sky-300 text-slate-600 dark:text-slate-300">
            <User className="mr-2 h-4 w-4 inline-block" /> Personal
          </TabsTrigger>
          <TabsTrigger value="medical" className="py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:shadow-sm data-[state=active]:text-sky-700 dark:data-[state=active]:text-sky-300 text-slate-600 dark:text-slate-300">
            <Heart className="mr-2 h-4 w-4 inline-block" /> Medical
          </TabsTrigger>
          <TabsTrigger value="history" className="py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:shadow-sm data-[state=active]:text-sky-700 dark:data-[state=active]:text-sky-300 text-slate-600 dark:text-slate-300">
            <Clock className="mr-2 h-4 w-4 inline-block" /> History
          </TabsTrigger>
          <TabsTrigger value="settings" className="py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:shadow-sm data-[state=active]:text-sky-700 dark:data-[state=active]:text-sky-300 text-slate-600 dark:text-slate-300">
            <Shield className="mr-2 h-4 w-4 inline-block" /> Settings
          </TabsTrigger>
        </TabsList>

        {/* Personal Info Tab */}
        <TabsContent value="personal">
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none mb-6 bg-white dark:bg-slate-900">
              <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b dark:border-slate-800">
                <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center">
                  <User className="mr-2 h-5 w-5 text-sky-600 dark:text-sky-400" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                  {/* Form Fields */}
                  <motion.div variants={itemVariants} className="space-y-1.5">
                    <Label htmlFor="firstName" className={labelStyles}>First Name</Label>
                    <Input id="firstName" name="firstName" value={personalInfo.firstName} onChange={handlePersonalInfoChange} disabled={!isEditing} className={inputStyles} />
                  </motion.div>
                  <motion.div variants={itemVariants} className="space-y-1.5">
                    <Label htmlFor="lastName" className={labelStyles}>Last Name</Label>
                    <Input id="lastName" name="lastName" value={personalInfo.lastName} onChange={handlePersonalInfoChange} disabled={!isEditing} className={inputStyles} />
                  </motion.div>
                  <motion.div variants={itemVariants} className="space-y-1.5">
                    <Label htmlFor="email" className={labelStyles}>Email</Label>
                    <Input id="email" name="email" type="email" value={personalInfo.email} onChange={handlePersonalInfoChange} disabled={!isEditing} className={inputStyles} />
                  </motion.div>
                  <motion.div variants={itemVariants} className="space-y-1.5">
                    <Label htmlFor="phone" className={labelStyles}>Phone</Label>
                    <Input id="phone" name="phone" type="tel" value={personalInfo.phone} onChange={handlePersonalInfoChange} disabled={!isEditing} className={inputStyles} />
                  </motion.div>
                  <motion.div variants={itemVariants} className="space-y-1.5">
                    <Label htmlFor="dateOfBirth" className={labelStyles}>Date of Birth</Label>
                    <Input id="dateOfBirth" name="dateOfBirth" type="date" value={personalInfo.dateOfBirth} onChange={handlePersonalInfoChange} disabled={!isEditing} className={inputStyles} />
                  </motion.div>
                  <motion.div variants={itemVariants} className="space-y-1.5">
                    <Label htmlFor="gender" className={labelStyles}>Gender</Label>
                    <Select disabled={!isEditing} value={personalInfo.gender} onValueChange={handleGenderSelectChange}>
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
                    <Textarea id="address" name="address" value={personalInfo.address} onChange={handlePersonalInfoChange} disabled={!isEditing} className={cn("min-h-[80px]", inputStyles)} />
                  </motion.div>
                </div>
                {/* Save Button */}
                <AnimatePresence>
                  {isEditing && (
                    <motion.div className="mt-6 flex justify-end" variants={buttonVariants} initial="initial" animate="animate" exit="exit">
                      <Button onClick={() => handleSaveChanges("Personal Info")} className="bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white">
                        <Save className="mr-2 h-4 w-4" /> Save Personal Info
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Medical History Tab */}
        <TabsContent value="medical">
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none mb-6 bg-white dark:bg-slate-900">
              <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b dark:border-slate-800">
                <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center">
                  <Heart className="mr-2 h-5 w-5 text-red-500 dark:text-red-400" />
                  Medical Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                  {/* Form Fields */}
                  <motion.div variants={itemVariants} className="space-y-1.5">
                    <Label htmlFor="skinType" className={labelStyles}>Skin Type</Label>
                    <Select disabled={!isEditing} value={medicalHistory.skinType} onValueChange={(value) => handleSelectChange("skinType", value)}>
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
                    <Textarea id="allergies" name="allergies" value={medicalHistory.allergies} onChange={handleMedicalHistoryChange} disabled={!isEditing} placeholder="e.g., Penicillin, Latex" className={cn("min-h-[80px]", inputStyles)} />
                  </motion.div>
                  <motion.div variants={itemVariants} className="space-y-1.5 md:col-span-2">
                    <Label htmlFor="medications" className={labelStyles}>Current Medications</Label>
                    <Textarea id="medications" name="medications" value={medicalHistory.medications} onChange={handleMedicalHistoryChange} disabled={!isEditing} placeholder="List medications and dosages" className={cn("min-h-[80px]", inputStyles)} />
                  </motion.div>
                  <motion.div variants={itemVariants} className="space-y-1.5 md:col-span-2">
                    <Label htmlFor="skinConditions" className={labelStyles}>Pre-existing Skin Conditions</Label>
                    <Textarea id="skinConditions" name="skinConditions" value={medicalHistory.skinConditions} onChange={handleMedicalHistoryChange} disabled={!isEditing} placeholder="e.g., Eczema, Psoriasis, Acne" className={cn("min-h-[80px]", inputStyles)} />
                  </motion.div>
                  <motion.div variants={itemVariants} className="space-y-1.5 md:col-span-2">
                    <Label htmlFor="familyHistory" className={labelStyles}>Family History of Skin Conditions</Label>
                    <Textarea id="familyHistory" name="familyHistory" value={medicalHistory.familyHistory} onChange={handleMedicalHistoryChange} disabled={!isEditing} placeholder="e.g., Mother: Psoriasis" className={cn("min-h-[80px]", inputStyles)} />
                  </motion.div>
                  <motion.div variants={itemVariants} className="space-y-1.5 md:col-span-2">
                    <Label htmlFor="previousTreatments" className={labelStyles}>Previous Skin Treatments</Label>
                    <Textarea id="previousTreatments" name="previousTreatments" value={medicalHistory.previousTreatments} onChange={handleMedicalHistoryChange} disabled={!isEditing} placeholder="e.g., Topical steroids, Accutane" className={cn("min-h-[80px]", inputStyles)} />
                  </motion.div>
                   <motion.div variants={itemVariants} className="space-y-1.5 md:col-span-2">
                    <Label htmlFor="recentChanges" className={labelStyles}>Recent Lifestyle Changes</Label>
                    <Textarea id="recentChanges" name="recentChanges" value={medicalHistory.recentChanges} onChange={handleMedicalHistoryChange} disabled={!isEditing} placeholder="e.g., New diet, increased stress, new skincare products" className={cn("min-h-[80px]", inputStyles)} />
                  </motion.div>
                </div>
                {/* Important Note */}
                <motion.div variants={itemVariants} className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800/50 rounded-md">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-200">Important Note</h4>
                      <p className="text-sm text-amber-700 dark:text-amber-300 mt-1 leading-relaxed">
                        This medical information helps personalize your analysis results. Your data is kept confidential and secure. It is not used for diagnosis but to provide context to the AI.
                      </p>
                    </div>
                  </div>
                </motion.div>
                {/* Save Button */}
                <AnimatePresence>
                  {isEditing && (
                    <motion.div className="mt-6 flex justify-end" variants={buttonVariants} initial="initial" animate="animate" exit="exit">
                      <Button onClick={() => handleSaveChanges("Medical Info")} className="bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white">
                        <Save className="mr-2 h-4 w-4" /> Save Medical Info
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Analysis History Tab */}
        <TabsContent value="history">
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none mb-6 bg-white dark:bg-slate-900">
              <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b dark:border-slate-800">
                <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  Recent Skin Analyses
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {recentSkinAnalyses.length > 0 ? (
                  <div className="space-y-5">
                    {recentSkinAnalyses.map((analysis) => (
                      <motion.div
                        key={analysis.id}
                        variants={itemVariants}
                        className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 transition-colors duration-200 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
                          <div className="mb-2 sm:mb-0">
                            <h3 className="font-semibold text-base text-slate-800 dark:text-slate-200">
                              {analysis.condition}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              {analysis.date}
                            </p>
                          </div>
                          <div className={cn(
                            "px-2.5 py-0.5 rounded-full text-xs font-medium w-fit",
                            analysis.severity === "Mild" && "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
                            analysis.severity === "Moderate" && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300",
                            analysis.severity === "Severe" && "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300" // Example for severe
                          )}>
                            {analysis.severity} Severity
                          </div>
                        </div>
                        <div className="mt-3 border-t dark:border-slate-800 pt-3">
                          <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                            AI Recommendations:
                          </h4>
                          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                            {analysis.recommendations}
                          </p>
                        </div>
                        <div className="mt-4 flex justify-end">
                          <Button variant="ghost" size="sm" className="text-xs h-7 text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-900/50">
                            <Eye className="mr-1.5 h-3.5 w-3.5" /> View Full Analysis
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <motion.div variants={itemVariants} className="text-center py-10">
                    <Clock className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-600" />
                    <p className="mt-4 text-slate-500 dark:text-slate-400">No skin analyses found.</p>
                    <Button variant="link" className="mt-2 text-sky-600 dark:text-sky-400">Start New Analysis</Button>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none mb-6 bg-white dark:bg-slate-900">
              <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b dark:border-slate-800">
                <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center">
                  <Shield className="mr-2 h-5 w-5 text-green-600 dark:text-green-400" />
                  Account Settings & Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6 divide-y divide-slate-200 dark:divide-slate-800">
                  {/* Settings Items */}
                  {[
                    { id: "emailNotifications", label: "Email Notifications", description: "Receive email updates about your analyses and account.", state: preferences.emailNotifications },
                    { id: "smsNotifications", label: "SMS Notifications", description: "Receive text updates (if phone provided).", state: preferences.smsNotifications },
                    { id: "dataSharing", label: "Data Sharing for Research", description: "Allow anonymized data use for AI model improvement.", state: preferences.dataSharing },
                    { id: "reminders", label: "Follow-up Reminders", description: "Get reminders to track skin condition progress.", state: preferences.reminders },
                    { id: "twoFactorAuth", label: "Two-Factor Authentication", description: "Enhance your account security (requires setup).", state: preferences.twoFactorAuth },
                  ].map(item => (
                    <motion.div key={item.id} variants={itemVariants} className="flex items-center justify-between pt-6 first:pt-0">
                      <div className="mr-4">
                        <Label htmlFor={item.id} className="text-base font-medium text-slate-800 dark:text-slate-200 cursor-pointer">
                          {item.label}
                        </Label>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                          {item.description}
                        </p>
                      </div>
                      <Switch
                        id={item.id}
                        checked={item.state}
                        onCheckedChange={(checked) => handleSwitchChange(item.id as keyof typeof preferences, checked)}
                        disabled={!isEditing}
                        aria-label={item.label}
                      />
                    </motion.div>
                  ))}
                </div>
                {/* Save Button */}
                <AnimatePresence>
                  {isEditing && (
                    <motion.div className="mt-8 flex justify-end border-t dark:border-slate-800 pt-6" variants={buttonVariants} initial="initial" animate="animate" exit="exit">
                      <Button onClick={() => handleSaveChanges("Preferences")} className="bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white">
                        <Save className="mr-2 h-4 w-4" /> Save Preferences
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;