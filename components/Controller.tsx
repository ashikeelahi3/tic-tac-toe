"use client"

interface ControllerProps {
  currentPlayer: string
  onReset: () => void
}

function Controller({ currentPlayer, onReset }: ControllerProps) {
  return (
    <div className="w-full p-4 bg-white rounded-lg shadow-lg text-center">
      <div className="text-lg font-bold text-gray-800 mb-3">
        {currentPlayer}
      </div>
      <button 
        onClick={onReset}
        className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
      >
        New Game
      </button>
    </div>
  )
}

export default Controller