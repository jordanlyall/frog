const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

let gameState = {
  position: 0,
  message: "Choose your play: Run, Pass, Kick",
  options: ["Run", "Pass", "Kick"]
};

const updateGameState = (play) => {
  switch (play) {
    case "Run":
      gameState.position += Math.floor(Math.random() * 10);
      gameState.message = gameState.position >= 100 ? "Touchdown! You win!" : "Nice run! Choose your next play.";
      break;
    case "Pass":
      gameState.position += Math.floor(Math.random() * 20);
      gameState.message = gameState.position >= 100 ? "Touchdown! You win!" : "Great pass! Choose your next play.";
      break;
    case "Kick":
      gameState.message = gameState.position >= 100 ? "Field goal! You win!" : "Missed the kick! Choose your next play.";
      break;
    default:
      gameState.message = "Invalid play. Choose again: Run, Pass, Kick";
  }
};

app.post('/play', (req, res) => {
  const { play } = req.body;
  updateGameState(play);
  res.status(200).json(gameState);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
