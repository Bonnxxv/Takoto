import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/*
  Notion button system:
  - default (primary CTA): pill-shaped rounded-full, Notion blue fill
  - secondary: pill-shaped rounded-full, white surface + ink text
  - outline (utility): rounded-md (8px), hairline border — nav & utility actions
  - destructive: rounded-md
  - ghost: rounded-md, no border
  - link: text only
*/
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        /* Primary pill CTA */
        default:
          "rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 shadow-apple-sm",
        destructive:
          "rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-apple-sm",
        /* Utility / nav button — tighter radius per DESIGN.md button-utility */
        outline:
          "rounded-lg border border-border bg-card hover:bg-secondary/60 shadow-apple-sm",
        /* Secondary surface button — pill when used as CTA, md otherwise handled by caller */
        secondary:
          "rounded-lg bg-card text-foreground border border-border hover:bg-secondary/60 shadow-apple-sm",
        ghost:
          "rounded-lg hover:bg-secondary/60 active:bg-secondary/80",
        link:
          "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm:      "h-8 px-3 text-xs",
        lg:      "h-10 px-6 text-base",
        icon:    "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
