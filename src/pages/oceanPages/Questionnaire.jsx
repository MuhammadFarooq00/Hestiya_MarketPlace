import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import Stepper from '../../components/ocean-components/Stepper';

const initialTones = 2.4; // Initial tones value
const questions = [
  {
    id: 1,
    question: "What is your favorite color?",
    options: [
      { option: "Red", value: 0.1 },
      { option: "Green", value: 0.2 },
      { option: "Blue", value: 0.3 },
      { option: "Yellow", value: 0.4 },
    ],
  },
  {
    id: 2,
    question: "What is your preferred mode of transport?",
    options: [
      { option: "Car", value: 0.5 },
      { option: "Bike", value: 0.3 },
      { option: "Bus", value: 0.2 },
      { option: "Walk", value: 0.1 },
    ],
  },
  {
    id: 3,
    question: "What type of cuisine do you like?",
    options: [
      { option: "Italian", value: 0.4 },
      { option: "Chinese", value: 0.3 },
      { option: "Indian", value: 0.2 },
      { option: "Mexican", value: 0.1 },
    ],
  },
  {
    id: 4,
    question: "What is your hobby?",
    options: [
      { option: "Reading", value: 0.2 },
      { option: "Traveling", value: 0.3 },
      { option: "Gaming", value: 0.4 },
      { option: "Cooking", value: 0.1 },
    ],
  },
];

const Questionnaire = () => {
  const navigate = useNavigate(); // Initialize navigate
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState(Array(questions.length).fill(""));
  const [tones, setTones] = useState(initialTones);
  const [selectedOption, setSelectedOption] = useState(""); // State for currently selected option
  const [error, setError] = useState(""); // State for error message

  const handleNext = () => {
    // Reset error message
    setError("");

    // Proceed to the next question only if an option is selected
    if (!selectedOption) {
      setError("Please select an option."); // Set error message
      return; // Prevent proceeding to the next step
    }

    const updatedAnswers = [...answers];
    updatedAnswers[currentStep] = selectedOption; // Update the answer for the current question
    setAnswers(updatedAnswers);

    // Update tones based on the selected option value
    const selectedQuestionIndex = currentStep;

    if (selectedQuestionIndex < questions.length) {
      const selected = questions[selectedQuestionIndex].options.find(option => option.option === selectedOption);
      if (selected) {
        setTones(prev => prev + selected.value); // Update tones
      }
    }

    // Move to the next step
    setCurrentStep(prev => Math.min(prev + 1, questions.length + 1));
    setSelectedOption(""); // Reset the selected option
  };

  const handleBack = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prev => Math.max(prev - 1, 0)); // Move to the previous step

      // Adjust tones when going back
      if (prevStep >= 0) {
        const prevAnswer = answers[prevStep];
        if (prevAnswer) {
          const selected = questions[prevStep].options.find(option => option.option === prevAnswer);
          if (selected) {
            setTones(prev => prev - selected.value); // Adjust tones
          }
        }
      }
      setSelectedOption(answers[prevStep]); // Set the selected option to the previous answer
    }
  };

  const handleSkip = () => {
    setCurrentStep(prev => Math.min(prev + 1, questions.length + 1)); // Skip to the next step
    setSelectedOption(""); // Reset the selected option
  };

  const handleSubmit = () => {
    // Log the final answers along with their respective questions and the total tones
    // console.log("Final Answers and Questions:");
    questions.forEach((question, index) => {
      console.log(`Question ${question.id}: ${question.question}`);
      console.log(`Your answer: ${answers[index] || "No answer selected"}`);
    });
    // console.log("Total Tones:", tones?.toFixed(2));

    // Navigate to the result page
    // navigate('/result');
  };

  const handleClose = () => {
    navigate('/ocean'); // Navigate back to the instruction page
  };

  const handleReset = () => {
    // Reset all states to initial values
    setCurrentStep(0);
    setAnswers(Array(questions.length).fill(""));
    setTones(initialTones);
    setSelectedOption(""); // Reset the selected option
    navigate('/ocean'); // Navigate back to the instruction page
  };

  return (
    <div className="p-4">
      <button onClick={handleClose} className="top-4 right-4 p-2 bg-red-500 text-white rounded absolute">
        Close
      </button>
      <Stepper currentStep={currentStep + 1} />
      {currentStep === 0 ? (
        <div>
          <h1 className="text-2xl font-semibold">Initial Value of Tones</h1>
          <p className="mt-2">The initial value of tones is: {tones?.toFixed(2)}</p>
          <button onClick={() => setCurrentStep(1)} className="mt-4 p-2 bg-blue-500 text-white rounded">
            Next
          </button>
        </div>
      ) : currentStep <= questions.length ? (
        <div>
          <h1 className="text-2xl font-semibold">Question {currentStep}</h1>
          <p className="mt-2">{questions[currentStep - 1].question}</p>
          {questions[currentStep - 1].options.map((option) => (
            <div key={option.option}>
              <label className="block mt-2">
                <input
                  type="radio"
                  name="answer"
                  value={option.option}
                  checked={selectedOption === option.option} // Manage the checked state
                  onChange={() => setSelectedOption(option.option)} // Update selected option
                />
                {option.option}
              </label>
            </div>
          ))}
          {error && <p className="text-red-500">{error}</p>} {/* Show error message */}
          <div className="flex space-x-2 mt-4">
            <button type="button" onClick={handleBack} disabled={currentStep === 0} className="p-2 bg-gray-400 text-white rounded">
              Back
            </button>
            <button type="button" onClick={handleNext} className="p-2 bg-blue-500 text-white rounded">
              Next
            </button>
            <button type="button" onClick={handleSkip} className="p-2 bg-yellow-500 text-white rounded">
              Skip
            </button>
          </div>
        </div>
      ) : (
        // Remove "Your Selections" section from UI
        <div>
          <h1 className="text-2xl font-semibold">Thank you for completing the questionnaire!</h1>
          <div className="flex space-x-2 mt-4">
            <button onClick={handleSubmit} className="p-2 bg-green-500 text-white rounded">
              Submit
            </button>
            <button onClick={handleReset} className="p-2 bg-red-500 text-white rounded">
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Questionnaire;
