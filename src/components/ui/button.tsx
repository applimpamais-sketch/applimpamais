import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "btn-premium",
        destructive: "bg-gradient-to-r from-destructive to-red-600 text-destructive-foreground shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300",
        outline: "border border-border/50 bg-background/50 backdrop-blur-sm hover:bg-accent/50 hover:text-accent-foreground hover:shadow-md hover:border-primary/20 active:scale-[0.98] transition-all duration-300",
        secondary: "bg-gradient-to-r from-secondary to-gray-100 text-secondary-foreground border border-border/30 hover:from-accent hover:to-gray-50 hover:shadow-md active:scale-[0.98] transition-all duration-300",
        ghost: "hover:bg-accent/50 hover:text-accent-foreground rounded-xl active:scale-[0.95] transition-all duration-200 hover:shadow-sm",
        link: "text-primary underline-offset-4 hover:underline active:scale-[0.98] transition-all duration-200",
        premium: "btn-premium shadow-glow",
        glass: "btn-glass",
        gradient: "bg-gradient-to-r from-primary via-blue-600 to-blue-700 text-primary-foreground shadow-lg hover:shadow-xl hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:via-transparent before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300",
      },
      size: {
        default: "h-10 px-4 py-2.5 text-sm sm:text-base",
        sm: "h-9 px-3 py-2 text-xs sm:text-sm",
        lg: "h-11 sm:h-12 px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold",
        xl: "h-12 sm:h-14 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold",
        icon: "h-9 w-9 sm:h-10 sm:w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-11 w-11 sm:h-12 sm:w-12",
        "icon-xl": "h-12 w-12 sm:h-14 sm:w-14",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
