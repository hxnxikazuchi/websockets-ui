import { rooms } from '../initialData';
import { ExtendedWebSocket } from '../types';
import wss from '../ws';
import WebSocket from 'ws';
import sendJSON from '../utils/sendJson';

const updateRoomsList = () => {
  const availableRooms = Object.keys(rooms)
    .filter((roomId) => rooms[roomId]?.players.length === 1)
    .map((roomId) => ({
      roomId,
      roomUsers: rooms[roomId]?.players.map((ws: ExtendedWebSocket, index) => ({
        name: ws.playerName,
        index,
      })),
    }));
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      sendJSON(client, {
        type: 'update_room',
        data: JSON.stringify(availableRooms),
        id: 0,
      });
    }
  });
};

export default updateRoomsList;
