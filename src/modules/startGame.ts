import notifyTurn from './notifyTurn';
import sendJSON from '../utils/sendJson';
import { rooms } from '../initialData';
import { Room } from '../types';

const startGame = (gameId: number) => {
    const room = rooms[gameId];
  const startingPlayerIndex = Math.floor(Math.random() * 2);

  room?.players.forEach((playerWs, index) => {
    sendJSON(playerWs, {
      type: 'start_game',
      data: JSON.stringify({
        ships: room.gameState.ships[index],
        currentPlayerIndex: startingPlayerIndex,
      }),
      id: 0,
    });
  });

  (room as Room).gameState.currentPlayerIndex = startingPlayerIndex;

  notifyTurn(gameId);
};

export default startGame;
