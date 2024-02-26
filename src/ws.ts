import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 3000 });

export default wss;
