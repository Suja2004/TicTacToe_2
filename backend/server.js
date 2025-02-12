const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 3001;

app.use(cors());

// Function to check for a winner or draw
function checkWinner(board) {
  const lines = [
    [0, 1, 2], // Rows
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6], // Columns
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8], // Diagonals
    [2, 4, 6],
  ];
  for (let line of lines) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a]; // "X" or "O" wins
    }
  }
  if (!board.includes("")) {
    return "draw"; // Draw if no empty cells left
  }
  return null; // Game ongoing
}

// Minimax algorithm for AI decision-making
function minimax(board, player, depth = 0, maxDepth = Infinity) {
  const winner = checkWinner(board);
  if (winner === "O") return { score: 10 - depth }; // AI wins
  if (winner === "X") return { score: -10 + depth }; // Human wins
  if (winner === "draw" || depth >= maxDepth) return { score: 0 }; // Draw or max depth reached

  const moves = [];
  for (let i = 0; i < board.length; i++) {
    if (board[i] === "") {
      const newBoard = [...board];
      newBoard[i] = player;
      const move = {};
      move.index = i;
      const result = minimax(
        newBoard,
        player === "O" ? "X" : "O",
        depth + 1,
        maxDepth
      );
      move.score = result.score;
      moves.push(move);
    }
  }

  let bestMove;
  if (player === "O") {
    let bestScore = -Infinity;
    for (let move of moves) {
      if (move.score > bestScore) {
        bestScore = move.score;
        bestMove = move;
      }
    }
  } else {
    let bestScore = Infinity;
    for (let move of moves) {
      if (move.score < bestScore) {
        bestScore = move.score;
        bestMove = move;
      }
    }
  }

  return bestMove;
}

// API endpoint for AI move
app.get("/api/game", (req, res) => {
  const boardJson = req.query.board;
  const aiSymbol = req.query.aiSymbol; // Get the AI's symbol from the query parameters
  const difficulty = req.query.difficulty || "hard"; // Default to "hard"
  if (!boardJson || !boardJson.length || !aiSymbol) {
    return res.status(400).json({ error: "Invalid input" });
  }

  try {
    const board = JSON.parse(boardJson).flat(); // Flatten the 2D array into a 1D array

    // If the board is completely empty, the AI makes the first move
    if (board.every((cell) => cell === "")) {
      let firstMoveIndex;

      if (difficulty === "easy") {
        // Easy mode: Randomly select any empty cell
        const emptyCells = board.map((cell, index) => index); // All indices are empty
        firstMoveIndex =
          emptyCells[Math.floor(Math.random() * emptyCells.length)];
      } else if (difficulty === "medium") {
        // Medium mode: Prefer corners or edges over the center
        const preferredMoves = [0, 2, 6, 8]; // Corners
        firstMoveIndex =
          preferredMoves[Math.floor(Math.random() * preferredMoves.length)];
      } else {
        // Hard mode: Always play in the center (optimal first move)
        firstMoveIndex = 4;
      }

      board[firstMoveIndex] = aiSymbol;
    } else {
      let bestMove;

      if (difficulty === "easy") {
        // Easy mode: Random move
        const emptyCells = board
          .map((cell, index) => (cell === "" ? index : null))
          .filter((index) => index !== null);
        const randomIndex =
          emptyCells[Math.floor(Math.random() * emptyCells.length)];
        bestMove = { index: randomIndex };
      } else if (difficulty === "medium") {
        // Medium mode: Use Minimax with limited depth
        bestMove = minimax(board, aiSymbol, 0, 3); // Limit depth to 3
      } else {
        // Hard mode: Use full Minimax
        bestMove = minimax(board, aiSymbol);
      }

      board[bestMove.index] = aiSymbol;
    }

    // Reshape the board back into a 2D array
    const updatedBoard = [
      board.slice(0, 3),
      board.slice(3, 6),
      board.slice(6, 9),
    ];
    res.json({ aiResponse: { board: updatedBoard } });
  } catch (error) {
    console.error("Error processing board:", error);
    res.status(400).json({ error: "Invalid board format" });
  }
});

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
