import React from 'react';

const Stepper = ({ currentStep, totalSteps = 5 }) => {
  return (
    <div className="flex flex-col items-center mb-4">
      <p className="mt-2 text-gray-700 font-semibold">
        {currentStep} of {totalSteps}
      </p>
    </div>
  );
};

export default Stepper;
