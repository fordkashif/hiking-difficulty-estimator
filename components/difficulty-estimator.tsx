"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { calculateDifficulty, type DifficultyLevel, type TerrainType } from "@/lib/difficulty-calculator"
import { DifficultyResult } from "./difficulty-result"
import { SavedTrailsList } from "./saved-trails-list"
import { ElevationProfile } from "./elevation-profile"
import { FitnessAdjustment } from "./fitness-adjustment"
import { Mountain, Ruler, Compass, Save, History } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { useLocalStorage } from "@/hooks/use-local-storage"
import type { Trail } from "@/types/trail"

export function DifficultyEstimator() {
  // Current input values
  const [trailName, setTrailName] = useState<string>("")
  const [elevationGain, setElevationGain] = useState<number>(500)
  const [elevationInputValue, setElevationInputValue] = useState<string>("500")
  const [distance, setDistance] = useState<number>(5)
  const [distanceInputValue, setDistanceInputValue] = useState<string>("5")
  const [terrain, setTerrain] = useState<TerrainType>("moderate")
  const [units, setUnits] = useState<"imperial" | "metric">("imperial")
  const [fitnessLevel, setFitnessLevel] = useState<number>(3)
  const [activeTab, setActiveTab] = useState<string>("calculator")

  // Saved trails
  const [savedTrails, setSavedTrails] = useLocalStorage<Trail[]>("saved-trails", [])

  // History of calculations
  const [calculationHistory, setCalculationHistory] = useLocalStorage<Trail[]>("calculation-history", [])

  // Submitted values (only updated when Calculate button is clicked)
  const [submittedValues, setSubmittedValues] = useState<{
    trailName: string
    elevationGain: number
    distance: number
    terrain: TerrainType
    units: "imperial" | "metric"
    fitnessLevel: number
  } | null>(null)

  const [result, setResult] = useState<DifficultyLevel | null>(null)

  // Get max values based on units
  const maxElevation = units === "imperial" ? 5000 : 1500
  const maxDistance = units === "imperial" ? 20 : 30

  const handleCalculate = useCallback(() => {
    // Update submitted values
    const newSubmittedValues = {
      trailName: trailName || "Unnamed Trail",
      elevationGain,
      distance,
      terrain,
      units,
      fitnessLevel,
    }

    setSubmittedValues(newSubmittedValues)

    // Calculate difficulty based on current values
    const difficulty = calculateDifficulty({
      elevationGain,
      distance,
      terrain,
      units,
      fitnessLevel,
    })
    setResult(difficulty)

    // Add to calculation history
    const historyEntry: Trail = {
      id: Date.now().toString(),
      name: trailName || "Unnamed Trail",
      elevationGain,
      distance,
      terrain,
      units,
      fitnessLevel,
      difficulty,
      timestamp: new Date().toISOString(),
    }

    setCalculationHistory((prev) => {
      // Keep all history items now that we have pagination
      return [historyEntry, ...prev]
    })
  }, [trailName, elevationGain, distance, terrain, units, fitnessLevel, setCalculationHistory])

  const handleSaveTrail = useCallback(() => {
    if (!result || !submittedValues) return

    const newTrail: Trail = {
      id: Date.now().toString(),
      name: trailName || "Unnamed Trail",
      elevationGain: submittedValues.elevationGain,
      distance: submittedValues.distance,
      terrain: submittedValues.terrain,
      units: submittedValues.units,
      fitnessLevel: submittedValues.fitnessLevel,
      difficulty: result,
      timestamp: new Date().toISOString(),
    }

    setSavedTrails((prev) => [...prev, newTrail])
    toast({
      title: "Trail saved",
      description: `${newTrail.name} has been saved to your list.`,
    })
  }, [result, submittedValues, trailName, setSavedTrails])

  // Update the handleDeleteTrail function to store the deleted trail before removing it
  const handleDeleteTrail = useCallback(
    (id: string) => {
      // Find the trail before deleting it
      const trailToDelete = savedTrails.find((trail) => trail.id === id)
      if (trailToDelete) {
        // Store the deleted trail in localStorage or state if needed
        // Then remove it from savedTrails
        setSavedTrails((prev) => prev.filter((trail) => trail.id !== id))
      }
    },
    [savedTrails, setSavedTrails],
  )

  // Update the handleRestoreTrail function to properly add the trail back
  const handleRestoreTrail = useCallback(
    (trail: Trail) => {
      // Add the trail back to savedTrails
      setSavedTrails((prev) => {
        // Check if the trail already exists to avoid duplicates
        const exists = prev.some((t) => t.id === trail.id)
        if (!exists) {
          return [...prev, trail]
        }
        return prev
      })

      toast({
        title: "Trail restored",
        description: `${trail.name} has been restored to your saved list.`,
      })
    },
    [setSavedTrails],
  )

  // Update the handleLoadTrail function to optionally restore a trail
  const handleLoadTrail = useCallback(
    (trail: Trail, restore = false) => {
      setTrailName(trail.name)
      setElevationGain(trail.elevationGain)
      setElevationInputValue(trail.elevationGain.toString())
      setDistance(trail.distance)
      setDistanceInputValue(trail.distance.toString())
      setTerrain(trail.terrain)
      setUnits(trail.units)
      setFitnessLevel(trail.fitnessLevel)
      setActiveTab("calculator")

      if (restore) {
        handleRestoreTrail(trail)
      } else {
        toast({
          title: "Trail loaded",
          description: `${trail.name} has been loaded into the calculator.`,
        })
      }
    },
    [handleRestoreTrail],
  )

  const handleElevationChange = useCallback((value: number) => {
    setElevationGain(value)
    setElevationInputValue(value.toString())
  }, [])

  const handleElevationInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setElevationInputValue(value)

      if (value === "") {
        setElevationGain(0)
      } else {
        // Enforce min/max limits
        const numValue = Number(value)
        const limitedValue = Math.min(Math.max(0, numValue), maxElevation)
        setElevationGain(limitedValue)

        // Update input value if it was limited
        if (numValue !== limitedValue) {
          setElevationInputValue(limitedValue.toString())
        }
      }
    },
    [maxElevation],
  )

  const handleDistanceChange = useCallback((value: number) => {
    setDistance(value)
    setDistanceInputValue(value.toString())
  }, [])

  const handleDistanceInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setDistanceInputValue(value)

      if (value === "") {
        setDistance(0)
      } else {
        // Enforce min/max limits
        const numValue = Number(value)
        const limitedValue = Math.min(Math.max(0, numValue), maxDistance)
        setDistance(limitedValue)

        // Update input value if it was limited
        if (numValue !== limitedValue) {
          setDistanceInputValue(limitedValue.toString())
        }
      }
    },
    [maxDistance],
  )

  // Update input values when units change
  useEffect(() => {
    // Update elevation input when max changes due to unit change
    if (elevationGain > maxElevation) {
      setElevationGain(maxElevation)
      setElevationInputValue(maxElevation.toString())
    }

    // Update distance input when max changes due to unit change
    if (distance > maxDistance) {
      setDistance(maxDistance)
      setDistanceInputValue(maxDistance.toString())
    }
  }, [maxElevation, maxDistance, elevationGain, distance])

  const elevationUnit = units === "imperial" ? "ft" : "m"
  const distanceUnit = units === "imperial" ? "mi" : "km"

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="calculator" className="flex items-center gap-1">
            <Mountain className="h-4 w-4" />
            <span>Calculator</span>
          </TabsTrigger>
          <TabsTrigger value="saved" className="flex items-center gap-1">
            <Save className="h-4 w-4" />
            <span>Saved Trails</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-1">
            <History className="h-4 w-4" />
            <span>History</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-6 pt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="trail-name">Trail Name</Label>
              <Input
                id="trail-name"
                value={trailName}
                onChange={(e) => setTrailName(e.target.value)}
                placeholder="Enter trail name (optional)"
              />
            </div>

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
                  max={maxElevation}
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
                  min={0}
                  max={maxElevation}
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
                  max={maxDistance}
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
                  min={0}
                  max={maxDistance}
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

            <FitnessAdjustment value={fitnessLevel} onChange={setFitnessLevel} />

            <Button onClick={handleCalculate} className="w-full bg-green-600 hover:bg-green-700">
              Calculate Difficulty
            </Button>
          </div>

          {result && submittedValues && (
            <div className="space-y-4">
              <Card className="p-4">
                <DifficultyResult
                  difficulty={result}
                  parameters={{
                    elevationGain: submittedValues.elevationGain,
                    distance: submittedValues.distance,
                    terrain: submittedValues.terrain,
                    units: submittedValues.units,
                    fitnessLevel: submittedValues.fitnessLevel,
                  }}
                />
              </Card>

              <ElevationProfile
                elevationGain={submittedValues.elevationGain}
                distance={submittedValues.distance}
                units={submittedValues.units}
              />

              <Button onClick={handleSaveTrail} className="w-full" variant="outline">
                <Save className="mr-2 h-4 w-4" />
                Save This Trail
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="saved" className="pt-4">
          <SavedTrailsList
            trails={savedTrails}
            onLoad={handleLoadTrail}
            onDelete={handleDeleteTrail}
            onRestore={handleRestoreTrail}
          />
        </TabsContent>

        <TabsContent value="history" className="pt-4">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Recent Calculations</h3>
            {calculationHistory.length === 0 ? (
              <p className="text-muted-foreground">No calculation history yet.</p>
            ) : (
              <SavedTrailsList
                trails={calculationHistory}
                onLoad={handleLoadTrail}
                onDelete={(id) => setCalculationHistory((prev) => prev.filter((trail) => trail.id !== id))}
                onRestore={(trail) => {
                  // For history items, we need to add it back to the calculation history
                  setCalculationHistory((prev) => {
                    // Check if it already exists
                    const exists = prev.some((t) => t.id === trail.id)
                    if (!exists) {
                      return [trail, ...prev]
                    }
                    return prev
                  })

                  toast({
                    title: "Calculation restored",
                    description: `${trail.name} has been restored to your history.`,
                  })
                }}
                isHistory
              />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

