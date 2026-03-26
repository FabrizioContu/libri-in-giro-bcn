import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-[#3B6D11] text-white hover:bg-[#2e5609] focus-visible:ring-[#3B6D11] shadow-sm hover:shadow-md active:scale-[0.98]",
        destructive:
          "bg-[#A32D2D] text-white hover:bg-[#8a2424] focus-visible:ring-[#A32D2D] shadow-sm hover:shadow-md",
        outline:
          "border-2 border-[#3B6D11] text-[#3B6D11] bg-transparent hover:bg-[#EAF3DE] focus-visible:ring-[#3B6D11]",
        secondary:
          "bg-gray-100 text-gray-800 hover:bg-gray-200 focus-visible:ring-gray-400",
        ghost:
          "text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-400",
        link: "text-[#3B6D11] underline-offset-4 hover:underline focus-visible:ring-[#3B6D11]",
        orange:
          "bg-[#BA7517] text-white hover:bg-[#9e6313] focus-visible:ring-[#BA7517] shadow-sm hover:shadow-md",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
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
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
