import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ShieldAlert, Users, Database, Edit, Info } from "lucide-react"; // Added icons

const Terms = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const termsSections = [
    {
      id: 1,
      title: "Introduction",
      icon: <Info className="h-6 w-6 text-sky-600 dark:text-sky-400" />,
      content: "Welcome to DermaScan. By accessing or using our website and services, you agree to be bound by these Terms and Conditions. If you disagree with any part of these terms, you may not access the service. These terms govern your use of the DermaScan website and its AI-powered skin analysis tool (the \"Service\")."
    },
    {
      id: 2,
      title: "Medical Disclaimer",
      icon: <ShieldAlert className="h-6 w-6 text-red-600 dark:text-red-400" />,
      content: [
        "The information provided by DermaScan (\"we,\" \"us,\" or \"our\") on our website is for general informational and educational purposes ONLY. All information on the site is provided in good faith, however we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information on the site.",
        "The analysis provided by our AI technology is EXPERIMENTAL and NOT intended to replace professional medical advice, diagnosis, or treatment. It is based solely on visual patterns and cannot account for medical history, symptoms, or other factors a healthcare professional would consider.",
        "ALWAYS seek the advice of your physician or other qualified healthcare provider (e.g., a dermatologist) with any questions you may have regarding a medical condition or treatment and before undertaking a new healthcare regimen.",
        "NEVER disregard professional medical advice or delay in seeking it because of information obtained from the DermaScan service. Reliance on any information provided by this service is solely at your own risk."
      ]
    },
    {
      id: 3,
      title: "User Data and Privacy",
      icon: <Database className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
      content: "Any images or data uploaded to our service for analysis are handled according to our Privacy Policy (link if available). We take reasonable measures to ensure the security of your data, including encryption during transmission and storage. However, no method of transmission over the internet or electronic storage is 100% secure. By using our service, you acknowledge these inherent risks and limitations."
    },
    {
      id: 4,
      title: "User Conduct",
      icon: <Users className="h-6 w-6 text-green-600 dark:text-green-400" />,
      content: "You agree not to use the Service for any unlawful purpose or in any way that could damage, disable, overburden, or impair the Service. You agree not to upload images that are not related to skin conditions or that contain illegal, offensive, or inappropriate content. You must be 18 years or older to create an account, though parents/guardians may use the service for minors under their care, understanding the tool's limitations for pediatric conditions."
    },
    {
      id: 5,
      title: "Limitations of Liability",
      icon: <FileText className="h-6 w-6 text-gray-600 dark:text-gray-400" />,
      content: "To the maximum extent permitted by applicable law, DermaScan and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from (a) your access to or use of or inability to access or use the service; (b) any conduct or content of any third party on the service; (c) any content obtained from the service; and (d) unauthorized access, use, or alteration of your transmissions or content. Nothing in these terms will limit or exclude liability for fraud, death or personal injury caused by negligence, or any liability which cannot be legally limited."
    },
    {
      id: 6,
      title: "Changes to Terms",
      icon: <Edit className="h-6 w-6 text-purple-600 dark:text-purple-400" />,
      content: "We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion. It is your responsibility to check these Terms periodically for changes. Your continued use of the Service following the posting of any changes to these Terms constitutes acceptance of those changes."
    }
  ];


  return (
    <div className="bg-gradient-to-b from-sky-50 via-white to-white dark:from-slate-950 dark:via-slate-950 dark:to-slate-950 min-h-screen">
        <div className="max-w-4xl mx-auto py-16 md:py-24 px-4 sm:px-6 lg:px-8">
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
                    Terms and <span className="text-sky-600 dark:text-sky-400">Conditions</span>
                </motion.h1>
                <motion.p
                    variants={itemVariants}
                    className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto"
                >
                    Please read these terms carefully before using the DermaScan service. Your access to and use of the Service is conditioned upon your acceptance of and compliance with these Terms.
                </motion.p>
            </motion.div>

            {/* Terms Sections */}
            <motion.div
                className="space-y-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {termsSections.map((section) => (
                    <motion.div key={section.id} variants={itemVariants}>
                        <Card className="border dark:border-slate-800 shadow-lg transition-shadow duration-200 hover:shadow-xl bg-white dark:bg-slate-900 overflow-hidden">
                            <CardHeader className="p-6 flex flex-row items-center space-x-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 border-b dark:border-slate-800">
                                <div className="flex-shrink-0">
                                    {section.icon}
                                </div>
                                <CardTitle className="text-xl md:text-2xl font-semibold text-slate-800 dark:text-slate-200">
                                    {section.id}. {section.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 md:p-8 text-slate-700 dark:text-slate-300 text-base leading-relaxed space-y-4">
                                {Array.isArray(section.content) ? (
                                    section.content.map((paragraph, index) => (
                                        <p key={index}>{paragraph}</p>
                                    ))
                                ) : (
                                    <p>{section.content}</p>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>

            {/* Last Updated */}
            <motion.div
                className="text-center mt-16 text-sm text-slate-500 dark:text-slate-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + termsSections.length * 0.1, duration: 0.5 }}
            >
                <p>Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p>If you have any questions about these Terms, please contact us.</p>
            </motion.div>
        </div>
    </div>
  );
};

export default Terms;