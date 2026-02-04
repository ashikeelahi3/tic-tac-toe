"use client"

interface GameInfoProps {
  history: { board: (string | null)[] }[];
  jumpTo: (move: number) => void;
}

function GameInfo({ history, jumpTo }: GameInfoProps) {
  return (
    <div className="mt-6 w-full max-w-sm p-4 bg-white rounded-xl shadow-md">
      <h3 className="text-lg font-bold text-gray-800 mb-2 text-center">Game History</h3>
      <ol className="space-y-2 text-center">
        {history.map((_, move) => (
          <li key={move}>
            <button
              onClick={() => jumpTo(move)}
              className="w-full px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {move === 0 ? 'Go to game start' : `Go to move #${move}`}
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default GameInfo;
