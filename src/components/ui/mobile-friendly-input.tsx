import * as React from "react";
import { cn } from "@/lib/utils";

export interface MobileFriendlyInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const MobileFriendlyInput = React.forwardRef<HTMLInputElement, MobileFriendlyInputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-lg border border-input bg-background px-4 py-3 text-base font-medium text-foreground placeholder:text-muted-foreground transition-all duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 sm:h-10 sm:text-sm sm:px-3 sm:py-2.5 file:border-0 file:bg-transparent file:text-sm file:font-medium hover:border-primary/50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
MobileFriendlyInput.displayName = "MobileFriendlyInput";

export { MobileFriendlyInput };