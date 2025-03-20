"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { calculateDifficulty, type DifficultyLevel, type TerrainType } from "@/lib/difficulty-calculator"
import { DifficultyResult } from "./difficulty-result"
import { Mountain, Ruler, Compass } from "lucide-react"

export function DifficultyEstimator() {
  const [elevationGain, setElevationGain] = useState<number>(500)
  const [elevationInputValue, setElevationInputValue] = useState<string>("500")
  const [distance, setDistance] = useState<number>(5)
  const [distanceInputValue, setDistanceInputValue] = useState<string>("5")
  const [terrain, setTerrain] = useState<TerrainType>("moderate")
  const [units, setUnits] = useState<"imperial" | "metric">("imperial")
  const [result, setResult] = useState<DifficultyLevel | null>(null)

  const handleCalculate = () => {
    const difficulty = calculateDifficulty({
      elevationGain,
      distance,
      terrain,
      units,
    })
    setResult(difficulty)
  }

  const handleElevationChange = (value: number) => {
    setElevationGain(value)
    setElevationInputValue(value.toString())
  }

  const handleElevationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setElevationInputValue(value)
    if (value === "") {
      setElevationGain(0)
    } else {
      setElevationGain(Number(value))
    }
  }

  const handleDistanceChange = (value: number) => {
    setDistance(value)
    setDistanceInputValue(value.toString())
  }

  const handleDistanceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setDistanceInputValue(value)
    if (value === "") {
      setDistance(0)
    } else {
      setDistance(Number(value))
    }
  }

  const elevationUnit = units === "imperial" ? "ft" : "m"
  const distanceUnit = units === "imperial" ? "mi" : "km"

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-green-700">Trail Parameters</h2>

      <div className="space-y-4">
        <div className="flex justify-end">
          <div className="flex items-center space-x-2">
            <Label htmlFor="units">Units:</Label>
            <Select value={units} onValueChange={(value) => setUnits(value as "imperial" | "metric")}>
              <SelectTrigger id="units" className="w-[120px]">
                <SelectValue placeholder="Select units" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="imperial">Imperial</SelectItem>
                <SelectItem value="metric">Metric</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Mountain className="h-5 w-5 text-green-600" />
            <Label htmlFor="elevation-gain">Elevation Gain ({elevationUnit})</Label>
          </div>
          <div className="flex items-center space-x-4">
            <Slider
              id="elevation-slider"
              min={0}
              max={units === "imperial" ? 5000 : 1500}
              step={units === "imperial" ? 100 : 50}
              value={[elevationGain]}
              onValueChange={(value) => handleElevationChange(value[0])}
              className="flex-1"
            />
            <Input
              id="elevation-gain"
              type="number"
              value={elevationInputValue}
              onChange={handleElevationInputChange}
              className="w-20"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Ruler className="h-5 w-5 text-green-600" />
            <Label htmlFor="distance">Distance ({distanceUnit})</Label>
          </div>
          <div className="flex items-center space-x-4">
            <Slider
              id="distance-slider"
              min={0}
              max={units === "imperial" ? 20 : 30}
              step={0.5}
              value={[distance]}
              onValueChange={(value) => handleDistanceChange(value[0])}
              className="flex-1"
            />
            <Input
              id="distance"
              type="number"
              value={distanceInputValue}
              onChange={handleDistanceInputChange}
              className="w-20"
              step={0.1}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Compass className="h-5 w-5 text-green-600" />
            <Label htmlFor="terrain">Terrain Type</Label>
          </div>
          <Select value={terrain} onValueChange={(value) => setTerrain(value as TerrainType)}>
            <SelectTrigger id="terrain">
              <SelectValue placeholder="Select terrain type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy (well-maintained, even surface)</SelectItem>
              <SelectItem value="moderate">Moderate (some obstacles, varied surface)</SelectItem>
              <SelectItem value="difficult">Difficult (rocky, steep sections, obstacles)</SelectItem>
              <SelectItem value="very-difficult">Very Difficult (scrambling, exposure, technical)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleCalculate} className="w-full bg-green-600 hover:bg-green-700">
          Calculate Difficulty
        </Button>
      </div>

      {result && (
        <Card className="mt-6 p-4">
          <DifficultyResult
            difficulty={result}
            parameters={{
              elevationGain,
              distance,
              terrain,
              units,
            }}
          />
        </Card>
      )}
    </div>
  )
}

