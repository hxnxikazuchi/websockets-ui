import { httpServer } from './src/http_server/index';
import wss from './src/ws';
import handleRegistration from './src/modules/handleRegistration';
import createRoom from './src/modules/createRoom';
import handleAddShips from './src/modules/handleAddShips';
import handleAddUserToRoom from './src/modules/handleAddUserToRoom';
import { handleAttack, handleRandomAttack } from './src/modules/handleAttacks';
import updateRoomsList from './src/modules/updateRoomsList';

const HTTP_PORT = 8181;

wss.on('connection', (ws) => {
  ws.on('error', console.error);

  ws.on('message', (msg) => {
    const { type, data } = JSON.parse(msg as any);
    console.log('received', data, type);

    switch (type) {
      case 'reg':
        handleRegistration(ws, data);
        updateRoomsList();
        break;
      case 'create_room':
        createRoom(ws);
        updateRoomsList();
        break;
      case 'add_user_to_room':
        handleAddUserToRoom(ws, data);
        break;
      case 'add_ships':
        handleAddShips(ws, data);
        break;
      case 'attack':
        handleAttack(ws, data);
        break;
      case 'randomAttack':
        handleRandomAttack(ws, data);
        break;
      default:
        break;
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

process.on('exit', () => {
  wss.close();
});
