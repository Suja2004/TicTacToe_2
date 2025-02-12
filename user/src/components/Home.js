import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();
  const [selectedSymbol, setSelectedSymbol] = useState("X");
  const [isAIGame, setIsAIGame] = useState(false);
  const [difficulty, setDifficulty] = useState("easy");

  // Handle starting the game
  const handleStartGame = () => {
    if (isAIGame) {
      navigate("/game", {
        state: {
          isTwoPlayerMode: false,
          humanSymbol: selectedSymbol,
          difficulty,
        },
      });
    } else {
      navigate("/game", { state: { isTwoPlayerMode: true } });
    }
  };

  return (
    <div className="home-page">
      <h1>Tic Tac Toe</h1>
      <div className="options">
        <button onClick={() => setIsAIGame(true)}>AI</button>

        <button onClick={handleStartGame}>Two Players</button>
      </div>

      {isAIGame && (
        <div className="symbol-selection">
          <h3>Symbol</h3>
          <div className="symbol-buttons">
            <button
              className={selectedSymbol === "X" ? "active" : ""}
              onClick={() => setSelectedSymbol("X")}
              aria-pressed={selectedSymbol === "X"}
            >
              X
            </button>

            <button
              className={selectedSymbol === "O" ? "active" : ""}
              onClick={() => setSelectedSymbol("O")}
              aria-pressed={selectedSymbol === "O"}
            >
              O
            </button>
          </div>
          <h3>Difficulty</h3>
          <div className="difficulty-buttons">
            <button
              className={difficulty === "easy" ? "active" : ""}
              onClick={() => setDifficulty("easy")}
            >
              Easy
            </button>
            <button
              className={difficulty === "medium" ? "active" : ""}
              onClick={() => setDifficulty("medium")}
            >
              Medium
            </button>
            <button
              className={difficulty === "hard" ? "active" : ""}
              onClick={() => setDifficulty("hard")}
            >
              Hard
            </button>
          </div>
          <button className="start-game-btn" onClick={handleStartGame}>
            Start Game
          </button>
          <button
            className="return-home-btn"
            onClick={() => setIsAIGame(false)}
          >
            Return
          </button>
        </div>
      )}
    </div>
  );
}

export default Home;
