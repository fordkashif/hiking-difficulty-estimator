import type { DifficultyLevel, TerrainType } from "@/lib/difficulty-calculator"

export interface Trail {
  id: string
  name: string
  elevationGain: number
  distance: number
  terrain: TerrainType
  units: "imperial" | "metric"
  fitnessLevel: number
  difficulty: DifficultyLevel
  timestamp: string
}

