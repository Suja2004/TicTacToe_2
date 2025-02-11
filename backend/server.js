const express = require('express');
const cors = require('cors');
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
            return board[a]; 
        }
    }
    if (!board.includes("")) {
        return "draw"; 
    }
    return null;
}

// Minimax algorithm for AI decision-making
function minimax(board, player) {
    const winner = checkWinner(board);
    if (winner === "O") return { score: 10 }; // AI wins
    if (winner === "X") return { score: -10 }; // Human wins
    if (winner === "draw") return { score: 0 }; // Draw

    const moves = [];
    for (let i = 0; i < board.length; i++) {
        if (board[i] === "") {
            const newBoard = [...board];
            newBoard[i] = player;
            const move = {};
            move.index = i;
            const result = minimax(newBoard, player === "O" ? "X" : "O");
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
    const aiSymbol = req.query.aiSymbol; 

    if (!boardJson || !boardJson.length || !aiSymbol) {
        return res.status(400).json({ error: "Invalid input" });
    }

    try {
        const board = JSON.parse(boardJson).flat(); 

        if (board.every(cell => cell === "")) {
            const firstMoveIndex = 4;
            board[firstMoveIndex] = aiSymbol;
        } else {
            const bestMove = minimax(board, aiSymbol);
            board[bestMove.index] = aiSymbol;
        }

        const updatedBoard = [board.slice(0, 3), board.slice(3, 6), board.slice(6, 9)];
        res.json({ aiResponse: { board: updatedBoard } });
    } catch (error) {
        console.error("Error processing board:", error);
        res.status(400).json({ error: "Invalid board format" });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));