
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

const FAQ = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const faqItems = [
    {
      question: "What skin conditions can the AI detect?",
      answer: "Our AI system is trained to recognize a wide variety of common skin conditions including acne, rosacea, eczema, psoriasis, melanoma, basal cell carcinoma, squamous cell carcinoma, dermatitis, hives, ringworm, and many other dermatological conditions. The system is continually improving through machine learning to recognize more conditions with greater accuracy."
    },
    {
      question: "How accurate is the AI skin analysis?",
      answer: "While our AI system has been trained on thousands of dermatological images and achieves high accuracy, it's important to understand that no AI system is perfect. For serious or concerning skin issues, we always recommend consulting with a dermatologist. The tool is meant to provide preliminary information, not to replace professional medical diagnosis."
    },
    {
      question: "Is my personal medical data secure?",
      answer: "Yes, we take data privacy very seriously. All uploaded images are encrypted during transmission and storage. We comply with health information privacy regulations, and your data is never shared with third parties without explicit consent. Images are only used for providing you with analysis results and, if you opt in, for improving our AI model's accuracy."
    },
    {
      question: "How should I prepare my skin for the photo?",
      answer: "For best results, take the photo in good lighting (natural daylight is ideal), ensure the affected area is clearly visible, clean the area beforehand if possible, don't apply makeup or creams before taking the photo, and use a neutral background. Take multiple photos if needed to capture different angles or lighting conditions."
    },
    {
      question: "Can the AI analyze skin conditions for all skin types and colors?",
      answer: "Yes, our AI has been specifically trained on diverse skin tones and types to ensure equitable analysis across different populations. We've made conscious efforts to include training data representing various ethnicities to reduce potential bias in our recognition algorithms."
    },
    {
      question: "What information should I have ready before using the skin analyzer?",
      answer: "It's helpful to note when the condition first appeared, whether it's changing or spreading, if it's painful or itchy, any treatments you've already tried, your relevant medical history, and if you have any known allergies. While not required, this information can help you better interpret the results."
    },
    {
      question: "How long does the analysis take?",
      answer: "The analysis typically takes just a few seconds after image upload. However, during periods of high traffic, it may take slightly longer. The system will always provide real-time feedback on the status of your analysis."
    },
    {
      question: "Can I track changes in my skin condition over time?",
      answer: "Yes, creating a profile allows you to save your analysis history, making it easier to track changes in your skin condition over time. This feature is particularly useful for monitoring the effectiveness of treatments or tracking the progression of chronic skin conditions."
    },
    {
      question: "What should I do after receiving the analysis?",
      answer: "After receiving your analysis, you should review the information provided about the potential condition. For any concerning conditions or if you're experiencing significant discomfort, we recommend consulting with a healthcare provider. The analysis results can be helpful to share with your doctor."
    },
    {
      question: "Are there any age restrictions for using the service?",
      answer: "Users must be 18 years or older to create their own account. Parents or legal guardians may use the service to analyze skin conditions for their children, but should be aware that the system is primarily trained on adult skin conditions and may have limitations when analyzing pediatric skin issues."
    },
    {
      question: "How does the AI-generated description work?",
      answer: "After the AI identifies a potential skin condition, our system uses Google's Gemini API to generate a human-readable description of the condition. This description includes common symptoms, typical treatments, and guidance on when to seek medical attention. The information is sourced from medical literature but is presented in accessible language."
    },
    {
      question: "Can the system detect skin cancer?",
      answer: "While our system can flag patterns consistent with various types of skin cancer, including melanoma, basal cell carcinoma, and squamous cell carcinoma, it should NEVER be used as the sole method for skin cancer diagnosis. Early detection is critical for skin cancer treatment, so any concerning lesions should be evaluated by a dermatologist promptly, regardless of the AI analysis results."
    },
    {
      question: "Does the service cost anything to use?",
      answer: "We currently offer a free basic service that allows a limited number of analyses per month. We also offer premium subscription plans for users who need more frequent analyses or additional features like detailed reports and priority processing."
    },
    {
      question: "Can I use this tool on someone else's behalf?",
      answer: "Yes, you can use the tool to analyze images for family members or those under your care. However, you should have their permission when appropriate, and remember that the tool's effectiveness may vary depending on image quality and the specific condition being analyzed."
    },
    {
      question: "What are the limitations of the AI system?",
      answer: "The AI has several limitations: it cannot diagnose conditions that require blood tests or biopsies, it may have difficulty with very rare conditions, image quality significantly affects accuracy, some conditions look similar and may require additional tests to distinguish, and it cannot assess factors like temperature or texture that a doctor could evaluate in person."
    },
  ];
  
  const filteredFAQs = faqItems.filter(
    (item) =>
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <h1 className="text-4xl font-bold text-sky-800 mb-4">Frequently Asked Questions</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Find answers to common questions about our skin condition analyzer, data privacy, and best practices for getting accurate results.
        </p>
      </motion.div>

      <motion.div 
        className="relative mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search questions or keywords..."
            className="pl-10 w-full p-3 border border-sky-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        <Card className="border border-sky-100 shadow-sm overflow-hidden">
          <Accordion type="single" collapsible className="w-full">
            {filteredFAQs.map((item, index) => (
              <motion.div key={index} variants={itemVariants}>
                <AccordionItem value={`item-${index}`} className="border-b border-sky-100 last:border-0">
                  <AccordionTrigger className="px-6 py-4 text-left text-sky-900 hover:text-sky-700 hover:bg-sky-50 transition-colors">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-6 py-4 text-gray-600">
                    <p className="leading-relaxed">{item.answer}</p>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </Card>
        
        {filteredFAQs.length === 0 && (
          <motion.div 
            className="text-center py-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-gray-500">No results found for "{searchTerm}". Try a different search term.</p>
          </motion.div>
        )}
      </motion.div>

      <motion.div 
        className="mt-12 p-6 bg-sky-50 rounded-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <h2 className="text-xl font-semibold text-sky-800 mb-3">Still have questions?</h2>
        <p className="text-gray-600 mb-4">
          If you couldn't find the answer you were looking for, our support team is here to help.
        </p>
        <a 
          href="/contact" 
          className="inline-block bg-sky-600 hover:bg-sky-700 text-white font-medium py-2 px-4 rounded-md shadow-sm transition-colors"
        >
          Contact Us
        </a>
      </motion.div>
    </div>
  );
};

export default FAQ;
