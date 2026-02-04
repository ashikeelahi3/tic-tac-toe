"use client"
import { useState } from 'react'
import Board from "@/components/Board"
import OnlineBoard from "@/components/OnlineBoard"
import GameMode from "@/components/GameMode"
import Matchmaking from "@/components/Matchmaking"

type GameState = 
  | { mode: 'menu' }
  | { mode: 'local' }
  | { mode: 'matchmaking' }
  | { mode: 'online'; type: 'create' | 'join'; roomCode?: string }

export default function Home() {
  const [gameState, setGameState] = useState<GameState>({ mode: 'menu' })

  const handleModeSelect = (mode: 'local' | 'create' | 'join' | 'matchmaking', roomCode?: string) => {
    if (mode === 'local') {
      setGameState({ mode: 'local' })
    } else if (mode === 'matchmaking') {
      setGameState({ mode: 'matchmaking' })
    } else {
      setGameState({ mode: 'online', type: mode, roomCode })
    }
  }

  const backToMenu = () => setGameState({ mode: 'menu' })

  return (
    <div className="min-h-screen bg-gray-800 flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold text-white mb-8 text-center">
        Tic Tac Toe
      </h1>
      
      {gameState.mode === 'menu' && (
        <GameMode onModeSelect={handleModeSelect} />
      )}
      
      {gameState.mode === 'local' && (
        <div>
          <div className="mb-4 text-center">
            <button
              onClick={backToMenu}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to Menu
            </button>
          </div>
          <Board />
        </div>
      )}
      
      {gameState.mode === 'matchmaking' && (
        <Matchmaking onBackToMenu={backToMenu} />
      )}
      
      {gameState.mode === 'online' && (
        <OnlineBoard 
          mode={gameState.type}
          roomCode={gameState.roomCode}
          onBackToMenu={backToMenu}
        />
      )}
    </div>
  )
}