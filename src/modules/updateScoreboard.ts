import { scoreboard } from '../initialData';
import WebSocket from 'ws';
import wss from '../ws';
import sendJSON from '../utils/sendJson';

const updateScoreboard = (winnerName: string) => {
  if (scoreboard.hasOwnProperty(winnerName)) {
    scoreboard[winnerName] += 1;
  } else {
    scoreboard[winnerName] = 0;
  }

  broadcastWinners();
};

const broadcastWinners = () => {
  const winnersData = Object.entries(scoreboard).map(([name, wins]) => ({
    name,
    wins,
  }));
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      sendJSON(client, {
        type: 'update_winners',
        data: JSON.stringify(winnersData),
        id: 0,
      });
    }
  });
};

export default updateScoreboard;
