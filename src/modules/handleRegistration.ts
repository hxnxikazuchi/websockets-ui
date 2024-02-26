import { ExtendedWebSocket } from '../types';
import { players } from '../initialData';
import sendJSON from '../utils/sendJson';
import updateScoreboard from './updateScoreboard';

const handleRegistration = (ws: ExtendedWebSocket, data: string) => {
  const { name, password } = JSON.parse(data);
  ws.playerName = name;
  ws.playerIndex = Object.keys(players).length;

  if (!players[name]) {
    players[name] = { password, wins: 0 };
    sendJSON(ws, {
      type: 'reg',
      data: JSON.stringify({
        name,
        index: Object.keys(players).length,
        error: false,
      }),
      id: 0,
    });
    updateScoreboard(name);
  } else {
    sendJSON(ws, {
      type: 'reg',
      data: JSON.stringify({
        name,
        index: name,
        error: true,
        errorText: 'Invalid password',
      }),
      id: 0,
    });
  }
};

export default handleRegistration;
