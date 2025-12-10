import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-brand text-white hover:bg-brand-dark shadow-lg hover:shadow-xl",
        secondary: "bg-slate-900 hover:bg-black text-white shadow-md",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md",
        outline: "border border-slate-200 hover:border-slate-900 text-slate-900 hover:bg-slate-50",
        ghost: "text-slate-700 hover:text-brand hover:bg-white/50 backdrop-blur-sm",
        link: "text-brand underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-7 py-3.5",
        sm: "h-9 px-5 py-2 text-sm",
        lg: "h-12 px-10 py-5 text-lg tracking-wide",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

