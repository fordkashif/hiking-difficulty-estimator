"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart } from "lucide-react"

interface ElevationProfileProps {
  elevationGain: number
  distance: number
  units: "imperial" | "metric"
}

export function ElevationProfile({ elevationGain, distance, units }: ElevationProfileProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Generate a simplified elevation profile
  const generateElevationProfile = (
    elevationGain: number,
    distance: number,
    width: number,
    height: number,
  ): number[] => {
    const points: number[] = []

    // Create a somewhat realistic profile with some randomness
    // This is just a visual approximation - real data would be better
    let currentElevation = 0
    const segments = Math.floor(width)
    const maxSegmentGain = elevationGain / (segments * 0.6) // Only use 60% of segments for gain

    // Use a fixed seed for random generation to prevent re-renders
    const randomValues = Array.from({ length: segments }, () => Math.random())

    for (let i = 0; i < segments; i++) {
      // Create some flat sections and some climbing sections
      const isClimbing = randomValues[i] > 0.4 || i > segments * 0.7

      if (isClimbing && currentElevation < elevationGain) {
        // Climbing section
        const gain = Math.min(randomValues[i] * maxSegmentGain, elevationGain - currentElevation)
        currentElevation += gain
      } else if (randomValues[i] > 0.8 && currentElevation > 0) {
        // Small descent
        currentElevation -= Math.min(currentElevation * 0.1, randomValues[i] * maxSegmentGain * 0.5)
      }

      // Scale to fit height
      const scaledElevation = (currentElevation / elevationGain) * height
      points.push(scaledElevation)
    }

    return points
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set dimensions
    const width = canvas.width
    const height = canvas.height
    const padding = 20

    // Generate a simple elevation profile
    const points = generateElevationProfile(elevationGain, distance, width - padding * 2, height - padding * 2)

    // Draw the profile
    ctx.beginPath()
    ctx.moveTo(padding, height - padding)

    // Add the base line (starting elevation)
    points.forEach((point, i) => {
      ctx.lineTo(padding + i, height - padding - point)
    })

    // Close the path to the bottom
    ctx.lineTo(width - padding, height - padding)
    ctx.closePath()

    // Fill with gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height)
    gradient.addColorStop(0, "rgba(34, 197, 94, 0.6)") // green-500 with opacity
    gradient.addColorStop(1, "rgba(34, 197, 94, 0.1)") // green-500 with low opacity

    ctx.fillStyle = gradient
    ctx.fill()

    // Draw the line on top
    ctx.beginPath()
    ctx.moveTo(padding, height - padding)

    points.forEach((point, i) => {
      ctx.lineTo(padding + i, height - padding - point)
    })

    ctx.strokeStyle = "#16a34a" // green-600
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw axes
    ctx.beginPath()
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, height - padding)
    ctx.lineTo(width - padding, height - padding)
    ctx.strokeStyle = "#d1d5db" // gray-300
    ctx.lineWidth = 1
    ctx.stroke()

    // Add labels
    ctx.fillStyle = "#6b7280" // gray-500
    ctx.font = "10px sans-serif"

    // Distance label
    const distanceLabel = `${distance} ${units === "imperial" ? "mi" : "km"}`
    ctx.fillText(distanceLabel, width - padding - ctx.measureText(distanceLabel).width, height - 5)

    // Elevation label
    ctx.save()
    ctx.translate(5, height / 2)
    ctx.rotate(-Math.PI / 2)
    const elevationLabel = `${elevationGain} ${units === "imperial" ? "ft" : "m"}`
    ctx.fillText(elevationLabel, 0, 0)
    ctx.restore()

    // This effect should only run when the props change
  }, [elevationGain, distance, units])

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center">
          <BarChart className="h-4 w-4 mr-2" />
          Elevation Profile
        </CardTitle>
      </CardHeader>
      <CardContent>
        <canvas ref={canvasRef} width={500} height={200} className="w-full h-[200px]" />
      </CardContent>
    </Card>
  )
}

