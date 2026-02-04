"use client"
import { useState, useEffect } from 'react'
import Controller from './Controller'

function Board() {
  const [board, setBoard] = useState(Array(9).fill(null))
  const [isXNext, setIsXNext] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    setIsXNext(Math.random() < 0.5)
    setIsInitialized(true)
  }, [])

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
    if (board[index] || winner) return
    const newBoard = [...board]
    newBoard[index] = isXNext ? 'X' : 'O'
    setBoard(newBoard)
    setIsXNext(!isXNext)
  }

  const resetGame = () => {
    setBoard(Array(9).fill(null))
    setIsXNext(Math.random() < 0.5)
  }

  if (!isInitialized) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="w-full p-4 bg-white rounded-lg shadow-lg text-center">
          <div className="text-lg font-bold text-gray-800 mb-3">Starting...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Controller 
        currentPlayer={winner ? `${winner} Wins!` : isDraw ? 'Draw!' : isXNext ? 'X' : 'O'} 
        onReset={resetGame} 
      />
      <div className="mt-6 grid grid-cols-3 gap-2 p-3 bg-white rounded-xl shadow-lg mx-auto w-fit">
        {board.map((cell, index) => (
          <button
            key={index}
            onClick={() => handleClick(index)}
            className="w-20 h-20 bg-gray-50 hover:bg-gray-100 border border-gray-300 flex items-center justify-center text-4xl font-bold rounded-lg transition-colors"
          >
            <span className={cell === 'X' ? 'text-blue-600' : 'text-red-500'}>{cell}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default Board