import './App.css';
import React, { useState, useEffect } from 'react';

function App() {
  const [board, setBoard] = useState([
    ["", "", ""],
    ["", "", ""],
    ["", "", ""]
  ]);
  const [currentPlayer, setCurrentPlayer] = useState("X");
  const [status, setStatus] = useState("ongoing");
  const [loading, setLoading] = useState(false);
  const [winningCells, setWinningCells] = useState([]); 
  const [isTwoPlayerMode, setIsTwoPlayerMode] = useState(false); 

  // Reset the game state
  const resetGame = () => {
    setBoard([
      ["", "", ""],
      ["", "", ""],
      ["", "", ""]
    ]);
    setCurrentPlayer("X");
    setStatus("ongoing");
    setWinningCells([]); 
  };

  // Check game status after every board update
  useEffect(() => {
    checkGameStatus();
  }, [board]);

  // Trigger AI move if it's the AI's turn
  useEffect(() => {
    if (!isTwoPlayerMode && currentPlayer === "O" && status === "ongoing") {
      makeAIMove();
    }
  }, [currentPlayer, status, isTwoPlayerMode]);

  // Function to check the game status
  const checkGameStatus = () => {
    const isBoardFull = board.every(row => row.every(cell => cell !== ""));
    const lines = [
      [[0, 0], [0, 1], [0, 2]], // Rows
      [[1, 0], [1, 1], [1, 2]],
      [[2, 0], [2, 1], [2, 2]],
      [[0, 0], [1, 0], [2, 0]], // Columns
      [[0, 1], [1, 1], [2, 1]],
      [[0, 2], [1, 2], [2, 2]],
      [[0, 0], [1, 1], [2, 2]], // Diagonals
      [[0, 2], [1, 1], [2, 0]],
    ];

    for (let line of lines) {
      const [[x1, y1], [x2, y2], [x3, y3]] = line;
      if (
        board[x1][y1] &&
        board[x1][y1] === board[x2][y2] &&
        board[x1][y1] === board[x3][y3]
      ) {
        setStatus(`${board[x1][y1]} wins`);
        setWinningCells(line);
        return;
      }
    }

    // Check for a draw
    if (isBoardFull) {
      setStatus("Draw");
    }
  };

  // Function to make AI move
  const makeAIMove = () => {
    setLoading(true);
    setTimeout(() => {
      fetch(`https://tic-tac-toe-2-tbys.vercel.app/api/game?board=${encodeURIComponent(JSON.stringify(board))}`)
        .then((res) => res.json())
        .then((data) => {
          console.log(data.aiResponse);
          setBoard(data.aiResponse.board);
          setCurrentPlayer("X");
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching AI Response: ", error);
          setLoading(false);
        });
    }, 2000);
  };

  // Handle cell click
  const handleCellClick = (row, col) => {
    if (board[row][col] === "" && status === "ongoing") {
      const newBoard = [...board];
      newBoard[row][col] = currentPlayer;
      setBoard(newBoard);

      // Switch player
      setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
    }
  };

  // Render a single cell
  const renderCell = (row, col) => {
    const isWinningCell = winningCells.some(([x, y]) => x === row && y === col);
    return (
      <button
        key={`${row}-${col}`}
        className={`cell ${isWinningCell ? "winning-cell" : ""}`} 
        onClick={() => handleCellClick(row, col)}
        disabled={loading || status !== "ongoing" || board[row][col] !== ""}
      >
        {board[row][col]}
      </button>
    );
  };

  return (
    <div className="main">
      <h1>Tic Tac Toe</h1>
      <div className="mode-toggle">
        <label>
          <input
            type="checkbox"
            checked={isTwoPlayerMode}
            onChange={() => setIsTwoPlayerMode(!isTwoPlayerMode)}
          />
          Two Player Mode
        </label>
      </div>
      <div className="status">
        Status: {status}
      </div>
      <div className="board-container">
        <div className="board">
          {board.map((row, i) => (
            <div className="row" key={i}>
              {row.map((_, j) => renderCell(i, j))}
            </div>
          ))}
        </div>
      </div>
      {loading && <div className="loading">AI is thinking...</div>}
      {status !== "ongoing" && (
        <button className="retry-btn" onClick={resetGame}>
          Play Again
        </button>
      )}
    </div>
  );
}

export default App;
