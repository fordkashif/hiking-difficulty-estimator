"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Trail } from "@/types/trail"
import {
  AlertTriangle,
  Award,
  Clock,
  Dumbbell,
  Footprints,
  Trash2,
  Edit,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useState } from "react"
// Import the ConfirmationDialog component
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { toast } from "@/components/ui/use-toast"

// Update the interface to include onRestore
interface SavedTrailsListProps {
  trails: Trail[]
  onLoad: (trail: Trail, restore?: boolean) => void
  onDelete: (id: string) => void
  onRestore: (trail: Trail) => void
  isHistory?: boolean
}

// Update the function signature
export function SavedTrailsList({ trails, onLoad, onDelete, onRestore, isHistory = false }: SavedTrailsListProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5 // Changed from 10 to 5 items per page
  const totalPages = Math.ceil(trails.length / itemsPerPage)

  // Add these state variables inside the SavedTrailsList component
  const [trailToDelete, setTrailToDelete] = useState<string | null>(null)
  const [deletedTrails, setDeletedTrails] = useState<Record<string, Trail>>({})

  // Get current page items
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = trails.slice(indexOfFirstItem, indexOfLastItem)

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  }

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }

  const difficultyIcons = {
    easy: <Footprints className="h-4 w-4" />,
    moderate: <Clock className="h-4 w-4" />,
    challenging: <Dumbbell className="h-4 w-4" />,
    difficult: <AlertTriangle className="h-4 w-4" />,
    extreme: <Award className="h-4 w-4" />,
  }

  const difficultyColors = {
    easy: "bg-green-100 text-green-800 border-green-200",
    moderate: "bg-yellow-100 text-yellow-800 border-yellow-200",
    challenging: "bg-orange-100 text-orange-800 border-orange-200",
    difficult: "bg-red-100 text-red-800 border-red-200",
    extreme: "bg-purple-100 text-purple-800 border-purple-200",
  }

  // Add these functions inside the SavedTrailsList component
  const handleConfirmDelete = () => {
    if (!trailToDelete) return

    // Find the trail before deleting it
    const trailToDeleteObj = trails.find((t) => t.id === trailToDelete)
    if (trailToDeleteObj) {
      // Store the trail in local state
      const trailCopy = { ...trailToDeleteObj }
      setDeletedTrails((prev) => ({ ...prev, [trailToDelete]: trailCopy }))

      // Delete the trail
      onDelete(trailToDelete)

      // Show toast with undo button
      toast({
        title: isHistory ? "Calculation removed" : "Trail deleted",
        description: `${trailCopy.name} has been ${isHistory ? "removed" : "deleted"}.`,
        action: (
          <Button variant="outline" size="sm" onClick={() => handleUndoDelete(trailToDelete, trailCopy)}>
            Undo
          </Button>
        ),
      })
    }

    // Close the dialog
    setTrailToDelete(null)
  }

  // Update the handleUndoDelete function to properly restore the trail
  const handleUndoDelete = (id: string, trail: Trail) => {
    // Call the onRestore function to restore the trail
    onRestore(trail)

    // Remove from deleted trails
    setDeletedTrails((prev) => {
      const newDeletedTrails = { ...prev }
      delete newDeletedTrails[id]
      return newDeletedTrails
    })
  }

  if (trails.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          {isHistory ? "No calculation history yet." : "You haven't saved any trails yet."}
        </p>
        {!isHistory && (
          <p className="text-sm text-muted-foreground mt-2">
            Calculate a trail difficulty and click "Save This Trail" to add it to your list.
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">
          Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, trails.length)} of {trails.length}{" "}
          {isHistory ? "calculations" : "trails"}
        </p>

        {totalPages > 1 && (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {currentItems.map((trail) => (
        <Card key={trail.id}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">{trail.name}</CardTitle>
              <Badge className={`${difficultyColors[trail.difficulty]}`} variant="outline">
                <span className="flex items-center gap-1">
                  {difficultyIcons[trail.difficulty]}
                  {trail.difficulty.charAt(0).toUpperCase() + trail.difficulty.slice(1)}
                </span>
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Elevation:</span> {trail.elevationGain}{" "}
                {trail.units === "imperial" ? "ft" : "m"}
              </div>
              <div>
                <span className="text-muted-foreground">Distance:</span> {trail.distance}{" "}
                {trail.units === "imperial" ? "mi" : "km"}
              </div>
              <div>
                <span className="text-muted-foreground">Terrain:</span>{" "}
                {trail.terrain.charAt(0).toUpperCase() + trail.terrain.slice(1)}
              </div>
              <div>
                <span className="text-muted-foreground">Fitness Level:</span> {trail.fitnessLevel}/5
              </div>
            </div>
            {trail.timestamp && (
              <div className="text-xs text-muted-foreground mt-2">
                {isHistory ? "Calculated" : "Saved"}{" "}
                {formatDistanceToNow(new Date(trail.timestamp), { addSuffix: true })}
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-0">
            <div className="flex justify-between w-full">
              <Button variant="outline" size="sm" onClick={() => onLoad(trail)}>
                <Edit className="h-4 w-4 mr-1" />
                {isHistory ? "Use Again" : "Load"}
              </Button>
              {/* Replace the onDelete button click handler with this */}
              <Button variant="ghost" size="sm" onClick={() => setTrailToDelete(trail.id)}>
                <Trash2 className="h-4 w-4 mr-1" />
                {isHistory ? "Remove" : "Delete"}
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}

      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="px-3"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                // Show first page, last page, current page, and pages around current
                let pageToShow: number
                if (totalPages <= 5) {
                  // If 5 or fewer pages, show all
                  pageToShow = i + 1
                } else if (currentPage <= 3) {
                  // If near start, show first 5 pages
                  pageToShow = i + 1
                } else if (currentPage >= totalPages - 2) {
                  // If near end, show last 5 pages
                  pageToShow = totalPages - 4 + i
                } else {
                  // Otherwise show current page and 2 on each side
                  pageToShow = currentPage - 2 + i
                }

                return (
                  <Button
                    key={pageToShow}
                    variant={currentPage === pageToShow ? "default" : "outline"}
                    size="sm"
                    className="w-8 h-8 p-0"
                    onClick={() => setCurrentPage(pageToShow)}
                  >
                    {pageToShow}
                  </Button>
                )
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="px-3"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
      {/* Add the ConfirmationDialog component at the end of the component, before the final closing bracket */}
      {trailToDelete && (
        <ConfirmationDialog
          isOpen={!!trailToDelete}
          onClose={() => setTrailToDelete(null)}
          onConfirm={handleConfirmDelete}
          title={isHistory ? "Remove Calculation" : "Delete Trail"}
          description={`Are you sure you want to ${isHistory ? "remove" : "delete"} this ${isHistory ? "calculation" : "trail"}? This action cannot be undone.`}
        />
      )}
    </div>
  )
}

