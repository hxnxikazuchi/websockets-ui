import startGame from './startGame';
import sendJSON from '../utils/sendJson';
import { rooms } from '../initialData';
import { ExtendedWebSocket } from '../types';

const handleAddShips = (ws: ExtendedWebSocket, data: string) => {
  const { gameId, ships, indexPlayer } = JSON.parse(data);
  const room = rooms[gameId];

  if (!room || room.players.length !== 2) {
    sendJSON(ws, {
      type: 'error',
      data: { message: 'Invalid game or game not ready' },
      id: 0,
    });
    return;
  }

  if (!room.gameState.ships) {
    room.gameState.ships = [];
  }
  room.gameState.ships[indexPlayer] = ships;

  if (room.gameState.ships[0] && room.gameState.ships[1]) {
    startGame(gameId);
  }
};

export default handleAddShips;
