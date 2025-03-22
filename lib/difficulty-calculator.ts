export type TerrainType = "easy" | "moderate" | "difficult" | "very-difficult"
export type DifficultyLevel = "easy" | "moderate" | "challenging" | "difficult" | "extreme"

interface DifficultyParams {
  elevationGain: number
  distance: number
  terrain: TerrainType
  units: "imperial" | "metric"
  fitnessLevel?: number
}

export function getTerrainFactor(terrain: TerrainType): number {
  switch (terrain) {
    case "easy":
      return 1.0
    case "moderate":
      return 1.5
    case "difficult":
      return 2.0
    case "very-difficult":
      return 3.0
    default:
      return 1.0
  }
}

export function calculateDifficulty(params: DifficultyParams): DifficultyLevel {
  const { elevationGain, distance, terrain, units, fitnessLevel = 3 } = params

  // Convert to imperial if needed for consistent calculation
  const normalizedElevation = units === "metric" ? elevationGain * 3.28084 : elevationGain
  const normalizedDistance = units === "metric" ? distance * 0.621371 : distance

  // Calculate elevation gain per mile
  const elevationPerMile = normalizedDistance > 0 ? normalizedElevation / normalizedDistance : 0

  // Get terrain factor
  const terrainFactor = getTerrainFactor(terrain)

  // Calculate base difficulty score
  let difficultyScore = 0

  // Elevation component (0-5 points)
  if (elevationPerMile < 300) {
    difficultyScore += 1
  } else if (elevationPerMile < 500) {
    difficultyScore += 2
  } else if (elevationPerMile < 700) {
    difficultyScore += 3
  } else if (elevationPerMile < 1000) {
    difficultyScore += 4
  } else {
    difficultyScore += 5
  }

  // Distance component (0-3 points)
  if (normalizedDistance < 3) {
    difficultyScore += 1
  } else if (normalizedDistance < 7) {
    difficultyScore += 2
  } else {
    difficultyScore += 3
  }

  // Apply terrain factor
  difficultyScore = difficultyScore * terrainFactor

  // Apply fitness adjustment (higher fitness = lower difficulty)
  const fitnessAdjustment = (fitnessLevel - 3) * 0.5 // 0.5 points per level from baseline of 3
  difficultyScore = Math.max(difficultyScore - fitnessAdjustment, 1)

  // Determine difficulty level
  if (difficultyScore < 4) {
    return "easy"
  } else if (difficultyScore < 7) {
    return "moderate"
  } else if (difficultyScore < 10) {
    return "challenging"
  } else if (difficultyScore < 14) {
    return "difficult"
  } else {
    return "extreme"
  }
}

