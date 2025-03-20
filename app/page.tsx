import { DifficultyEstimator } from "@/components/difficulty-estimator"
import { DifficultyChart } from "@/components/difficulty-chart"

export default function Home() {
  return (
    <main className="min-h-screen p-6 md:p-12 bg-gradient-to-b from-green-50 to-blue-50">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-green-800">Hiking Trail Difficulty Estimator</h1>
          <p className="text-gray-600">
            Calculate how challenging a trail will be based on elevation, distance, and terrain
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <DifficultyEstimator />
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-green-700">How Difficulty Is Calculated</h2>
            <DifficultyChart />
          </div>
        </div>
      </div>
    </main>
  )
}

