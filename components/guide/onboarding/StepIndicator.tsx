"use client";

import { Check } from "lucide-react";

type StepIndicatorProps = {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
};

export function StepIndicator({ currentStep, totalSteps, stepTitles }: StepIndicatorProps) {
  return (
    <div className="w-full mb-8">
      {/* Progress Bar */}
      <div className="relative">
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-200">
          <div
            className="h-full bg-brand transition-all duration-500 ease-out"
            style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
          />
        </div>

        {/* Step Circles */}
        <div className="relative flex justify-between">
          {stepTitles.map((title, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;

            return (
              <div key={stepNumber} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    isCompleted
                      ? "bg-brand border-brand text-white"
                      : isCurrent
                      ? "bg-white border-brand text-brand shadow-lg scale-110"
                      : "bg-white border-slate-200 text-slate-400"
                  }`}
                >
                  {isCompleted ? (
                    <Check size={20} strokeWidth={3} />
                  ) : (
                    <span className="text-sm font-bold">{stepNumber}</span>
                  )}
                </div>
                <span
                  className={`mt-2 text-xs font-medium text-center max-w-[80px] transition-colors ${
                    isCurrent ? "text-slate-900" : "text-slate-400"
                  }`}
                >
                  {title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Counter */}
      <div className="mt-6 text-center">
        <p className="text-sm text-slate-600">
          Step <span className="font-bold text-brand">{currentStep}</span> of {totalSteps}
        </p>
      </div>
    </div>
  );
}
