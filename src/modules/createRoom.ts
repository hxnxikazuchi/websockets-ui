import { rooms } from '../initialData';
import sendJSON from '../utils/sendJson';
import { ExtendedWebSocket } from '../types';

const createRoom = (ws: ExtendedWebSocket) => {
  const roomId = Object.keys(rooms).length + 1;
  rooms[roomId] = { players: [ws], gameState: { ships: [] } };

  sendJSON(ws, {
    type: 'update_room',
    data: JSON.stringify([{ roomId, roomUsers: [{ name: ws.playerName, index: ws.playerIndex }] }]),
    id: 0,
  });
};

export default createRoom;
