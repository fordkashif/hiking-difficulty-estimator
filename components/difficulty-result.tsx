import { Badge } from "@/components/ui/badge"
import { type DifficultyLevel, type TerrainType, getTerrainFactor } from "@/lib/difficulty-calculator"
import { AlertTriangle, Award, Clock, Dumbbell, Footprints } from "lucide-react"

interface DifficultyResultProps {
  difficulty: DifficultyLevel
  parameters: {
    elevationGain: number
    distance: number
    terrain: TerrainType
    units: "imperial" | "metric"
  }
}

export function DifficultyResult({ difficulty, parameters }: DifficultyResultProps) {
  const { elevationGain, distance, terrain, units } = parameters

  const difficultyColors = {
    easy: "bg-green-100 text-green-800 border-green-200",
    moderate: "bg-yellow-100 text-yellow-800 border-yellow-200",
    challenging: "bg-orange-100 text-orange-800 border-orange-200",
    difficult: "bg-red-100 text-red-800 border-red-200",
    extreme: "bg-purple-100 text-purple-800 border-purple-200",
  }

  const difficultyIcons = {
    easy: <Footprints className="h-5 w-5" />,
    moderate: <Clock className="h-5 w-5" />,
    challenging: <Dumbbell className="h-5 w-5" />,
    difficult: <AlertTriangle className="h-5 w-5" />,
    extreme: <Award className="h-5 w-5" />,
  }

  const difficultyDescriptions = {
    easy: "Suitable for beginners with minimal hiking experience. Mostly flat with gentle slopes.",
    moderate: "Suitable for occasional hikers with some experience. Moderate slopes and some elevation gain.",
    challenging: "Suitable for regular hikers with good fitness. Significant elevation gain and longer distances.",
    difficult: "Suitable for experienced hikers with excellent fitness. Steep sections, challenging terrain.",
    extreme: "Suitable only for very experienced hikers with exceptional fitness. Very steep, technical sections.",
  }

  // Calculate estimated time (rough estimate)
  const speedFactor = {
    easy: units === "imperial" ? 2.5 : 4.0,
    moderate: units === "imperial" ? 2.0 : 3.2,
    challenging: units === "imperial" ? 1.5 : 2.4,
    difficult: units === "imperial" ? 1.0 : 1.6,
    extreme: units === "imperial" ? 0.75 : 1.2,
  }

  const elevationFactor = elevationGain / (units === "imperial" ? 1000 : 300)
  const terrainMultiplier = getTerrainFactor(terrain)

  // Time in hours
  const estimatedTime = distance / speedFactor[difficulty] + elevationFactor * 0.5 * terrainMultiplier

  // Convert to hours and minutes
  const hours = Math.floor(estimatedTime)
  const minutes = Math.round((estimatedTime - hours) * 60)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Trail Difficulty</h3>
        <Badge
          className={`text-sm px-3 py-1 ${difficultyColors[difficulty]} hover:bg-opacity-100 hover:text-opacity-100`}
          variant="outline"
        >
          <span className="flex items-center gap-1">
            {difficultyIcons[difficulty]}
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          </span>
        </Badge>
      </div>

      <p className="text-gray-600">{difficultyDescriptions[difficulty]}</p>

      <div className="grid grid-cols-2 gap-4 pt-2">
        <div>
          <p className="text-sm text-gray-500">Estimated Time</p>
          <p className="font-medium">
            {hours > 0 ? `${hours} hr${hours !== 1 ? "s" : ""} ` : ""}
            {minutes > 0 ? `${minutes} min` : hours === 0 ? "< 30 min" : ""}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Difficulty Score</p>
          <p className="font-medium">
            {calculateDifficultyScore(elevationGain, distance, terrain, units).toFixed(1)}/10
          </p>
        </div>
      </div>
    </div>
  )
}

function calculateDifficultyScore(
  elevationGain: number,
  distance: number,
  terrain: TerrainType,
  units: "imperial" | "metric",
): number {
  // Normalize values to a 0-10 scale
  const maxElevation = units === "imperial" ? 5000 : 1500
  const maxDistance = units === "imperial" ? 20 : 30

  const elevationScore = (elevationGain / maxElevation) * 10
  const distanceScore = (distance / maxDistance) * 10
  const terrainScore = {
    easy: 2.5,
    moderate: 5,
    difficult: 7.5,
    "very-difficult": 10,
  }[terrain]

  // Weight the factors
  const weightedScore = elevationScore * 0.4 + distanceScore * 0.3 + terrainScore * 0.3

  return Math.min(Math.max(weightedScore, 1), 10)
}

