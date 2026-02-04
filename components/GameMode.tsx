"use client"
import { useState } from 'react'

interface GameModeProps {
  onModeSelect: (mode: 'local' | 'create' | 'join' | 'matchmaking', roomCode?: string) => void
}

function GameMode({ onModeSelect }: GameModeProps) {
  const [joinCode, setJoinCode] = useState('')

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Choose Game Mode</h2>
      
      <div className="space-y-4">
        <button
          onClick={() => onModeSelect('local')}
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
        >
          Play Locally
        </button>
        
        <button
          onClick={() => onModeSelect('create')}
          className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors"
        >
          Create Online Room
        </button>
        
        <button
          onClick={() => onModeSelect('matchmaking')}
          className="w-full py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold transition-colors"
        >
          Find Random Match
        </button>
        
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Enter room code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            maxLength={6}
          />
          <button
            onClick={() => onModeSelect('join', joinCode)}
            disabled={!joinCode}
            className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 font-semibold transition-colors"
          >
            Join Room
          </button>
        </div>
      </div>
    </div>
  )
}

export default GameMode