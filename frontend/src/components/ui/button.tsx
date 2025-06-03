import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-base font-medium transition-all disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-5 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:scale-[1.02] active:opacity-90 active:shadow-inner",
        destructive:
          "bg-destructive text-white shadow-sm hover:bg-destructive/90 hover:scale-[1.02] active:opacity-90 active:shadow-inner focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline:
          "border-[1.5px] border-primary bg-background text-primary shadow-sm hover:bg-accent hover:text-accent-foreground hover:scale-[1.02] active:opacity-90 active:shadow-inner dark:bg-transparent dark:border-primary dark:hover:bg-accent/20",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 hover:scale-[1.02] active:opacity-90 active:shadow-inner",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/20",
        link: "text-primary underline-offset-4 hover:underline",
        mint: "bg-[#10D9A0] text-white shadow-sm hover:bg-[#10D9A0]/90 hover:scale-[1.02] active:opacity-90 active:shadow-inner",
        sky: "bg-[#0EA5E9] text-white shadow-sm hover:bg-[#0EA5E9]/90 hover:scale-[1.02] active:opacity-90 active:shadow-inner",
        sunset: "bg-[#F59E0B] text-white shadow-sm hover:bg-[#F59E0B]/90 hover:scale-[1.02] active:opacity-90 active:shadow-inner",
        coral: "bg-[#F472B6] text-white shadow-sm hover:bg-[#F472B6]/90 hover:scale-[1.02] active:opacity-90 active:shadow-inner",
      },
      size: {
        default: "h-12 px-6 py-3.5 has-[>svg]:px-4", /* 48px height, 24px horizontal padding */
        sm: "h-10 rounded-lg gap-1.5 px-4 py-2.5 has-[>svg]:px-3", /* 40px height */
        lg: "h-14 rounded-xl px-8 py-4 has-[>svg]:px-6", /* 56px height */
        icon: "size-14 rounded-full", /* 56px diameter for FAB */
        badge: "h-6 px-3 py-1 text-xs font-medium rounded-full", /* For status badges */
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
