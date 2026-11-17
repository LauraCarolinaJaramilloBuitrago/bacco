import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "group/btn relative inline-flex select-none items-center justify-center gap-2 overflow-hidden rounded-full font-semibold text-white transition-[transform,box-shadow,background-color,border-color] duration-300 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-[1.1em] [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Verde hoja profundo: blanco sobre #17723a = 6.0:1
        leaf: "bg-leaf-deep shadow-[0_0_0_1px_rgb(63_191_90/0.5),0_10px_40px_-10px_rgb(63_191_90/0.7)] hover:bg-[#1c8a46] hover:shadow-[0_0_0_1px_rgb(63_191_90/0.9),0_14px_50px_-8px_rgb(63_191_90/0.9)]",
        ghost: "glass hover:border-river/60 hover:shadow-[0_0_30px_-6px_rgb(25_211_197/0.6)]",
        outline: "border border-white/25 bg-transparent hover:border-firefly/80 hover:shadow-[0_0_30px_-8px_rgb(245_184_65/0.7)]",
      },
      size: {
        sm: "h-10 px-4 text-sm",
        md: "h-12 px-6 text-[15px]",
        lg: "h-14 px-8 text-base",
      },
    },
    defaultVariants: { variant: "leaf", size: "md" },
  },
);
