const { createServer } = require('http')
const { Server } = require('socket.io')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = 3000

const app = next({ dev, hostname, port })
const handler = app.getRequestHandler()

const games = new Map()
let waitingPlayer = null

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

app.prepare().then(() => {
  const httpServer = createServer(handler)
  const io = new Server(httpServer)

  io.on('connection', (socket) => {
    socket.on('find-match', () => {
      if (waitingPlayer && waitingPlayer !== socket.id) {
        const roomCode = generateRoomCode()
        const players = [waitingPlayer, socket.id]
        const currentPlayerIndex = Math.floor(Math.random() * 2)
        const firstPlayerSymbol = Math.random() < 0.5 ? 'X' : 'O'
        const gameState = {
          board: Array(9).fill(null),
          players,
          currentPlayer: currentPlayerIndex,
          playerSymbols: {
            [players[0]]: firstPlayerSymbol,
            [players[1]]: firstPlayerSymbol === 'X' ? 'O' : 'X'
          }
        }
        
        games.set(roomCode, gameState)
        
        const waitingSocket = io.sockets.sockets.get(waitingPlayer)
        if (waitingSocket) {
          waitingSocket.join(roomCode)
          socket.join(roomCode)
          
          waitingSocket.emit('match-found', {
            roomCode,
            board: gameState.board,
            currentPlayer: players[currentPlayerIndex],
            playerSymbols: gameState.playerSymbols,
            myTurn: currentPlayerIndex === 0,
            mySymbol: gameState.playerSymbols[players[0]]
          })
          
          socket.emit('match-found', {
            roomCode,
            board: gameState.board,
            currentPlayer: players[currentPlayerIndex],
            playerSymbols: gameState.playerSymbols,
            myTurn: currentPlayerIndex === 1,
            mySymbol: gameState.playerSymbols[players[1]]
          })
        }
        waitingPlayer = null
      } else {
        waitingPlayer = socket.id
        socket.emit('waiting-for-match')
      }
    })

    socket.on('cancel-match', () => {
      if (waitingPlayer === socket.id) {
        waitingPlayer = null
      }
    })

    socket.on('create-room', () => {
      const roomCode = generateRoomCode()
      const gameState = {
        board: Array(9).fill(null),
        players: [socket.id],
        currentPlayer: 0,
        playerSymbols: { [socket.id]: Math.random() < 0.5 ? 'X' : 'O' }
      }
      games.set(roomCode, gameState)
      socket.join(roomCode)
      socket.emit('room-created', { roomCode, symbol: gameState.playerSymbols[socket.id] })
    })

    socket.on('join-room', (roomCode) => {
      const game = games.get(roomCode)
      if (!game) {
        socket.emit('error', 'Room not found')
        return
      }
      if (game.players.length >= 2) {
        socket.emit('error', 'Room is full')
        return
      }
      
      game.players.push(socket.id)
      const symbols = Object.values(game.playerSymbols)
      game.playerSymbols[socket.id] = symbols.includes('X') ? 'O' : 'X'
      
      socket.join(roomCode)
      io.to(roomCode).emit('game-start', {
        board: game.board,
        currentPlayer: game.players[game.currentPlayer],
        playerSymbols: game.playerSymbols
      })
    })

    socket.on('make-move', ({ roomCode, index }) => {
      const game = games.get(roomCode)
      if (!game || game.players[game.currentPlayer] !== socket.id || game.board[index]) return

      game.board[index] = game.playerSymbols[socket.id]
      game.currentPlayer = 1 - game.currentPlayer

      io.to(roomCode).emit('game-update', {
        board: game.board,
        currentPlayer: game.players[game.currentPlayer]
      })
    })

    socket.on('reset-game', (roomCode) => {
      const game = games.get(roomCode)
      if (!game) return

      game.board = Array(9).fill(null)
      game.currentPlayer = Math.floor(Math.random() * 2)
      
      io.to(roomCode).emit('game-reset', {
        board: game.board,
        currentPlayer: game.players[game.currentPlayer]
      })
    })

    socket.on('disconnect', () => {
      if (waitingPlayer === socket.id) {
        waitingPlayer = null
      }
      for (const [roomCode, game] of games.entries()) {
        if (game.players.includes(socket.id)) {
          io.to(roomCode).emit('player-disconnected')
          games.delete(roomCode)
        }
      }
    })
  })

  httpServer.listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://${hostname}:${port}`)
  })
})