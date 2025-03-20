"use client"

import * as React from "react"
import NextImage, { type ImageProps as NextImageProps } from "next/image"

interface ImageProps extends Omit<NextImageProps, "alt"> {
  alt: string // Make alt required
}

const Image = React.forwardRef<HTMLImageElement, ImageProps>(({ alt, ...props }, ref) => {
  return <NextImage ref={ref} alt={alt} {...props} />
})
Image.displayName = "Image"

export { Image }

