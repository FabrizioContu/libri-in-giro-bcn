import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[#EAF3DE] text-[#3B6D11]",
        secondary: "bg-gray-100 text-gray-600",
        destructive: "bg-red-100 text-[#A32D2D]",
        outline: "border border-gray-200 text-gray-600",
        orange: "bg-orange-100 text-[#BA7517]",
        green: "bg-[#EAF3DE] text-[#3B6D11]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
