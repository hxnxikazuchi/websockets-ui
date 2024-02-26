import WebSocket from 'ws';

const sendJSON = (ws: WebSocket, data: object) => {
  ws.send(JSON.stringify(data));
};

export default sendJSON;
