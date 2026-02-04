"use client"

interface SquareProps {
  value: string | null;
  onClick: () => void;
}

function Square({ value, onClick }: SquareProps) {
  const isX = value === 'X';
  const isO = value === 'O';

  return (
    <button
      onClick={onClick}
      className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-xl shadow-md flex items-center justify-center text-4xl sm:text-5xl font-bold transition-all duration-200 ease-in-out transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-primary-dark"
    >
      <span
        className={`transition-all duration-300 ease-in-out ${
          isX ? 'text-[var(--primary)]' : isO ? 'text-[var(--accent)]' : ''
        }`}
      >
        {value}
      </span>
    </button>
  );
}

export default Square;
