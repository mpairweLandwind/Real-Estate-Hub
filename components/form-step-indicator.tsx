import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface Step {
  title: string
  description?: string
}

interface FormStepIndicatorProps {
  steps: Step[]
  currentStep: number
}

export function FormStepIndicator({ steps, currentStep }: FormStepIndicatorProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                  index < currentStep && "bg-primary border-primary text-primary-foreground",
                  index === currentStep && "border-primary text-primary",
                  index > currentStep && "border-muted-foreground/30 text-muted-foreground",
                )}
              >
                {index < currentStep ? <Check className="h-5 w-5" /> : <span>{index + 1}</span>}
              </div>
              <div className="mt-2 text-center">
                <p
                  className={cn(
                    "text-sm font-medium",
                    index === currentStep ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {step.title}
                </p>
                {step.description && <p className="text-xs text-muted-foreground mt-1">{step.description}</p>}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-4 transition-colors",
                  index < currentStep ? "bg-primary" : "bg-muted-foreground/30",
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
