import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { number: 1, label: "Basic Info" },
  { number: 2, label: "LGBTQ+" },
  { number: 3, label: "Experience" },
  { number: 4, label: "Pricing" },
  { number: 5, label: "Availability" },
  { number: 6, label: "ID" },
  { number: 7, label: "Review" },
];

interface ProgressIndicatorProps {
  currentStep: number;
}

export function ProgressIndicator({ currentStep }: ProgressIndicatorProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.number;
          const isCurrent = currentStep === step.number;
          const isUpcoming = currentStep < step.number;

          return (
            <div key={step.number} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all",
                    isCompleted &&
                      "bg-brand text-white shadow-md",
                    isCurrent &&
                      "bg-brand text-white ring-4 ring-brand/20",
                    isUpcoming &&
                      "bg-slate-200 text-slate-500"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    step.number
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium hidden sm:block",
                    isCurrent && "text-ink",
                    !isCurrent && "text-ink-soft"
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-2">
                  <div
                    className={cn(
                      "h-full transition-all",
                      isCompleted ? "bg-brand" : "bg-slate-200"
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

