
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

const MedicalDisclaimer = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Alert variant="destructive" className="my-4 border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle className="text-red-600">Medical Disclaimer</AlertTitle>
        <AlertDescription className="text-gray-700">
          This tool is for informational purposes only and should not be used as a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
        </AlertDescription>
      </Alert>
    </motion.div>
  );
};

export default MedicalDisclaimer;
