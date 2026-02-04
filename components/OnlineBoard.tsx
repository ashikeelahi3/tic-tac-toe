"use client"
import { useState, useEffect } from 'react'
import { io, Socket } from 'socket.io-client'
import Controller from './Controller'

interface OnlineBoardProps {
  mode: 'create' | 'join' | 'matchmaking'
  roomCode?: string
  onBackToMenu: () => void
  initialGameData?: any
}

function OnlineBoard({ mode, roomCode: initialRoomCode, onBackToMenu, initialGameData }: OnlineBoardProps) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [board, setBoard] = useState(Array(9).fill(null))
  const [roomCode, setRoomCode] = useState(initialRoomCode || '')
  const [playerSymbol, setPlayerSymbol] = useState<'X' | 'O' | null>(null)
  const [currentPlayer, setCurrentPlayer] = useState<string | null>(null)
  const [gameStatus, setGameStatus] = useState('Connecting...')
  const [isMyTurn, setIsMyTurn] = useState(false)

  useEffect(() => {
    let newSocket: Socket
    
    if (mode === 'matchmaking' && initialGameData?.socket) {
      newSocket = initialGameData.socket
      setSocket(newSocket)
      
      setRoomCode(initialGameData.roomCode)
      setBoard(initialGameData.board)
      setCurrentPlayer(initialGameData.currentPlayer)
      setPlayerSymbol(initialGameData.mySymbol)
      setIsMyTurn(initialGameData.myTurn)
      setGameStatus('Match found! Game started!')
    } else {
      newSocket = io(process.env.NODE_ENV === 'production' ? 'https://YOUR-ACTUAL-RAILWAY-URL.railway.app' : 'http://localhost:3000')
      setSocket(newSocket)
    }

    newSocket.on('room-created', ({ roomCode, symbol }) => {
      setRoomCode(roomCode)
      setPlayerSymbol(symbol)
      setGameStatus(`Room created! Code: ${roomCode}. Waiting for player...`)
    })

    newSocket.on('match-found', ({ roomCode, board, currentPlayer, playerSymbols, myTurn, mySymbol }) => {
      setRoomCode(roomCode)
      setBoard(board)
      setCurrentPlayer(currentPlayer)
      setPlayerSymbol(mySymbol)
      setIsMyTurn(myTurn)
      setGameStatus('Match found! Game started!')
    })

    newSocket.on('game-start', ({ board, currentPlayer, playerSymbols }) => {
      setBoard(board)
      setCurrentPlayer(currentPlayer)
      if (newSocket.id) {
        setPlayerSymbol(playerSymbols[newSocket.id])
        setIsMyTurn(currentPlayer === newSocket.id)
      }
      setGameStatus('Game started!')
    })

    newSocket.on('game-update', ({ board, currentPlayer }) => {
      setBoard(board)
      setCurrentPlayer(currentPlayer)
      if (newSocket.id) {
        setIsMyTurn(currentPlayer === newSocket.id)
      }
    })

    newSocket.on('game-reset', ({ board, currentPlayer }) => {
      setBoard(board)
      setCurrentPlayer(currentPlayer)
      if (newSocket.id) {
        setIsMyTurn(currentPlayer === newSocket.id)
      }
      setGameStatus('Game reset!')
    })

    newSocket.on('player-disconnected', () => {
      setGameStatus('Player disconnected')
    })

    newSocket.on('error', (message) => {
      setGameStatus(`Error: ${message}`)
    })

    if (mode === 'create') {
      newSocket.emit('create-room')
    } else if (mode === 'join' && initialRoomCode) {
      newSocket.emit('join-room', initialRoomCode)
    }

    return () => {
      if (mode !== 'matchmaking') {
        newSocket.close()
      }
    }
  }, [mode, initialRoomCode, initialGameData])

  const checkWinner = (squares: (string | null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ]
    for (let line of lines) {
      const [a, b, c] = line
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a]
      }
    }
    return null
  }

  const winner = checkWinner(board)
  const isDraw = !winner && board.every(cell => cell !== null)

  const handleClick = (index: number) => {
    if (!socket || !isMyTurn || board[index] || winner || !roomCode) return
    socket.emit('make-move', { roomCode, index })
  }

  const resetGame = () => {
    if (socket) {
      socket.emit('reset-game', roomCode)
    }
  }

  const getDisplayStatus = () => {
    if (winner) return `${winner} Wins!`
    if (isDraw) return 'Draw!'
    if (!currentPlayer) return gameStatus
    return isMyTurn ? `Your turn (${playerSymbol})` : `Opponent's turn`
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-4 text-center">
        <button
          onClick={onBackToMenu}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Back to Menu
        </button>
        {roomCode && (
          <div className="mt-2 text-white">
            Room Code: <span className="font-bold text-yellow-300">{roomCode}</span>
          </div>
        )}
      </div>

      <Controller 
        currentPlayer={getDisplayStatus()} 
        onReset={resetGame} 
      />
      
      <div className="mt-6 grid grid-cols-3 gap-2 p-3 bg-white rounded-xl shadow-lg mx-auto w-fit">
        {board.map((cell, index) => (
          <button
            key={index}
            onClick={() => handleClick(index)}
            className={`w-20 h-20 bg-gray-50 border border-gray-300 flex items-center justify-center text-4xl font-bold rounded-lg transition-colors ${
              isMyTurn && !cell && !winner ? 'hover:bg-gray-100 cursor-pointer' : 'cursor-not-allowed'
            }`}
          >
            <span className={cell === 'X' ? 'text-blue-600' : 'text-red-500'}>{cell}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default OnlineBoard