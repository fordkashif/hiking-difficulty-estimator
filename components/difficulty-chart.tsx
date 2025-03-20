"use client"

export function DifficultyChart() {
  return (
    <div className="space-y-6">
      <div className="prose max-w-none space-y-4 leading-relaxed">
        <p className="text-base">The difficulty rating is calculated based on three main factors:</p>
        <ul className="space-y-3">
          <li className="text-base">
            <strong>Elevation Gain:</strong> The total climb in feet/meters
          </li>
          <li className="text-base">
            <strong>Distance:</strong> The total length of the trail
          </li>
          <li className="text-base">
            <strong>Terrain:</strong> The type of surface and technical challenges
          </li>
        </ul>
        <p className="text-base">These factors are weighted and combined to determine the overall difficulty level.</p>
      </div>
    </div>
  )
}

