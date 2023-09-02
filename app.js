const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.use(bodyParser.json());

let players = [];

// Create
app.post('/players', (req, res) => {
  const newPlayer = req.body;
  players.push(newPlayer);
  res.status(201).json(newPlayer);
});

// Read (List all players)
app.get('/players', (req, res) => {
  res.json(players);
});

// Read (Get a single player by ID)
app.get('/players/:id', (req, res) => {
  const playerId = req.params.id;
  const player = players.find((player) => player.id === playerId);
  if (!player) {
    res.status(404).send('Player not found');
  } else {
    res.json(player);
  }
});

// Update (Edit a player by ID)
app.put('/players/:id', (req, res) => {
  const playerId = req.params.id;
  const updatedPlayer = req.body;
  const playerIndex = players.findIndex((player) => player.id === playerId);
  if (playerIndex === -1) {
    res.status(404).send('Player not found');
  } else {
    players[playerIndex] = updatedPlayer;
    res.json(updatedPlayer);
  }
});

// Delete (Remove a player by ID)
app.delete('/players/:id', (req, res) => {
  const playerId = req.params.id;
  const playerIndex = players.findIndex((player) => player.id === playerId);
  if (playerIndex === -1) {
    res.status(404).send('Player not found');
  } else {
    const deletedPlayer = players.splice(playerIndex, 1)[0];
    res.json(deletedPlayer);
  }
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
