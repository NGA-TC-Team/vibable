import Image from "next/image"

import { cn } from "@/lib/utils"

type VibableLogoProps = Omit<
  React.ComponentProps<typeof Image>,
  "src" | "alt"
> & {
  alt?: string
}

function VibableLogo({
  alt = "Vibable",
  width = 40,
  height = 40,
  className,
  ...props
}: VibableLogoProps) {
  return (
    <Image
      src="/vibable-logo.png"
      alt={alt}
      width={width}
      height={height}
      className={cn("shrink-0", className)}
      {...props}
    />
  )
}

export { VibableLogo }
