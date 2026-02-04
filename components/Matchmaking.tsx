"use client"
import { useState, useEffect } from 'react'
import { io, Socket } from 'socket.io-client'
import OnlineBoard from './OnlineBoard'

interface MatchmakingProps {
  onBackToMenu: () => void
}

function Matchmaking({ onBackToMenu }: MatchmakingProps) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [status, setStatus] = useState('Connecting...')
  const [matchFound, setMatchFound] = useState(false)
  const [gameData, setGameData] = useState<any>(null)

  useEffect(() => {
    const newSocket = io()
    setSocket(newSocket)

    newSocket.on('waiting-for-match', () => {
      setStatus('Looking for opponent...')
    })

    newSocket.on('match-found', (data) => {
      setMatchFound(true)
      setGameData({ ...data, socket: newSocket })
      setStatus('Match found!')
    })

    newSocket.emit('find-match')

    return () => {
      newSocket.emit('cancel-match')
      newSocket.close()
    }
  }, [])

  const cancelSearch = () => {
    if (socket) {
      socket.emit('cancel-match')
    }
    onBackToMenu()
  }

  if (matchFound && gameData) {
    return (
      <OnlineBoard 
        mode="matchmaking"
        roomCode={gameData.roomCode}
        onBackToMenu={onBackToMenu}
        initialGameData={gameData}
      />
    )
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-lg p-6 text-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Matchmaking</h2>
      
      <div className="mb-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
        <p className="text-gray-600">{status}</p>
      </div>
      
      <button
        onClick={cancelSearch}
        className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
      >
        Cancel
      </button>
    </div>
  )
}

export default Matchmaking