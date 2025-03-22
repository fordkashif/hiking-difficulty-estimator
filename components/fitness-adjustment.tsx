"use client"

import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { User } from "lucide-react"

interface FitnessAdjustmentProps {
  value: number
  onChange: (value: number) => void
}

export function FitnessAdjustment({ value, onChange }: FitnessAdjustmentProps) {
  const fitnessLabels = ["Beginner", "Occasional Hiker", "Regular Hiker", "Experienced", "Very Fit"]

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <User className="h-5 w-5 text-green-600" />
        <Label>Your Fitness Level</Label>
      </div>
      <Slider
        min={1}
        max={5}
        step={1}
        value={[value]}
        onValueChange={(values) => onChange(values[0])}
        className="mb-2"
      />
      <div className="flex justify-between text-xs text-muted-foreground px-1">
        {fitnessLabels.map((label, index) => (
          <div
            key={index}
            className={`text-center ${value === index + 1 ? "font-medium text-green-600" : ""}`}
            style={{ width: "20%" }}
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  )
}

