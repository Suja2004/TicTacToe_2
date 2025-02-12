import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function Game() {
  const navigate = useNavigate();
  const location = useLocation();
  const [board, setBoard] = useState([
    ["", "", ""],
    ["", "", ""],
    ["", "", ""],
  ]);
  const [currentPlayer, setCurrentPlayer] = useState("X");
  const [status, setStatus] = useState("ongoing");
  const [loading, setLoading] = useState(false);
  const [winningCells, setWinningCells] = useState([]);
  const [isTwoPlayerMode] = useState(location.state?.isTwoPlayerMode || false);
  const [humanSymbol] = useState(location.state?.humanSymbol || "X");
  const [difficulty] = useState(location.state?.difficulty || "easy");
  const aiSymbol = humanSymbol === "X" ? "O" : "X";

  // Reset the game state
  const resetGame = () => {
    setBoard([
      ["", "", ""],
      ["", "", ""],
      ["", "", ""],
    ]);
    setCurrentPlayer("X");
    setStatus("ongoing");
    setWinningCells([]);
  };

  // Handle returning to the home page
  const handleReturn = () => {
    navigate("/");
  };

  // Check game status after every board update
  useEffect(() => {
    checkGameStatus();
  }, [board]);

  // Trigger AI move if it's the AI's turn
  useEffect(() => {
    if (
      !isTwoPlayerMode &&
      currentPlayer === aiSymbol &&
      status === "ongoing"
    ) {
      makeAIMove();
    }
  }, [currentPlayer, status, isTwoPlayerMode]);

  // Handle AI's first move if the user selects "O"
  useEffect(() => {
    if (
      !isTwoPlayerMode &&
      humanSymbol === "O" &&
      board.flat().every((cell) => cell === "")
    ) {
      makeAIMove();
    }
  }, []);

  // Function to check the game status
  const checkGameStatus = () => {
    const flatBoard = board.flat();
    const isBoardFull = flatBoard.every((cell) => cell !== "");
    const lines = [
      [
        [0, 0],
        [0, 1],
        [0, 2],
      ], // Rows
      [
        [1, 0],
        [1, 1],
        [1, 2],
      ],
      [
        [2, 0],
        [2, 1],
        [2, 2],
      ],
      [
        [0, 0],
        [1, 0],
        [2, 0],
      ], // Columns
      [
        [0, 1],
        [1, 1],
        [2, 1],
      ],
      [
        [0, 2],
        [1, 2],
        [2, 2],
      ],
      [
        [0, 0],
        [1, 1],
        [2, 2],
      ], // Diagonals
      [
        [0, 2],
        [1, 1],
        [2, 0],
      ],
    ];

    for (let line of lines) {
      const [[x1, y1], [x2, y2], [x3, y3]] = line;
      if (
        board[x1][y1] &&
        board[x1][y1] === board[x2][y2] &&
        board[x1][y1] === board[x3][y3]
      ) {
        const winnerSymbol = board[x1][y1];
        setStatus(
          !isTwoPlayerMode
            ? winnerSymbol === aiSymbol
              ? "AI wins"
              : "Player wins"
            : `Player ${winnerSymbol} wins`
        );
        setWinningCells(line);
        return;
      }
    }

    if (isBoardFull) {
      setStatus("Draw");
    }
  };

  // Function to make AI move
  const makeAIMove = () => {
    setLoading(true);

    // Adjust delay based on difficulty
    const delay =
      difficulty === "hard" ? 2000 : difficulty === "medium" ? 1000 : 500;

    setTimeout(() => {
      fetch(
        `http://localhost:3001/api/game?board=${encodeURIComponent(
          JSON.stringify(board)
        )}&aiSymbol=${aiSymbol}&difficulty=${difficulty}`
      )
        .then((res) => res.json())
        .then((data) => {
          setBoard(data.aiResponse.board);
          setCurrentPlayer(humanSymbol);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching AI Response: ", error);
          setLoading(false);
          setStatus("Error: Failed to fetch AI move");
        });
    }, delay);
  };

  // Handle cell click
  const handleCellClick = (row, col) => {
    if (board[row][col] === "" && status === "ongoing") {
      const newBoard = [...board];
      newBoard[row][col] = currentPlayer;
      setBoard(newBoard);

      // Switch player
      setCurrentPlayer(currentPlayer === humanSymbol ? aiSymbol : humanSymbol);
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
      <div className="status">
        Status: {status}
        {!isTwoPlayerMode && <span> (Difficulty: {difficulty})</span>}
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
        <div className="game-btns">
          <button className="retry-btn" onClick={resetGame}>
            Retry
          </button>
          <button className="return-btn" onClick={handleReturn}>
            Return
          </button>
        </div>
      )}
    </div>
  );
}

export default Game;
