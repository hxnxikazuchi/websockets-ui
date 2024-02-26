import { rooms } from '../initialData';
import sendJSON from '../utils/sendJson';
import { ExtendedWebSocket } from '../types';
import updateRoomsList from './updateRoomsList';

const handleAddUserToRoom = (ws: ExtendedWebSocket, data: string) => {
  const { indexRoom } = JSON.parse(data);

  if (!rooms[indexRoom] || 
    rooms[indexRoom]?.players.length as number >= 2) {
    sendJSON(ws, {
      type: 'error',
      data: { message: 'Room does not exist or is full' },
      id: 0,
    });
    return;
  }

  rooms[indexRoom]?.players.push(ws);

  ws.roomId = indexRoom;

  if (rooms[indexRoom]?.players.length === 2) {
    rooms[indexRoom]?.players.forEach((playerWs, index) => {
      sendJSON(playerWs, {
        type: 'create_game',
        data: JSON.stringify({ idGame: indexRoom, idPlayer: index }),
        id: 0,
      });
    });

    updateRoomsList();
  } else {
    updateRoomsList();
  }
};

export default handleAddUserToRoom;
