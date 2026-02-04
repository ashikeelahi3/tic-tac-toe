import Board from "@/components/Board";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-800 flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold text-white mb-8 text-center">
        Tic Tac Toe
      </h1>
      <Board />
    </div>
  );
}