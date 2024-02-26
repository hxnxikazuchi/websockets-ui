import { rooms } from '../initialData';
import sendJSON from '../utils/sendJson';

const notifyTurn = (gameId: number) => {
  const room = rooms[gameId];

  if (!room) {
    console.error(`Game room with ID ${gameId} does not exist.`);
    return;
  }

  const { currentPlayerIndex } = room.gameState;
  const message = {
    type: 'turn',
    data: JSON.stringify({
      currentPlayer: currentPlayerIndex,
    }),
    id: 0,
  };

  room.players.forEach((playerWs) => {
    sendJSON(playerWs, message);
  });
};

export default notifyTurn;
