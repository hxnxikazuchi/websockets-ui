import WebSocket from 'ws';

interface Player {
  password: string;
  wins: number;
}

interface Ship {
  position: { x: number; y: number };
  direction: boolean;
  length: number;
  hits?: { x: number; y: number }[];
  sunk?: boolean;
}

interface Room {
  players: ExtendedWebSocket[];
  gameState: {
    ships: Ship[][];
    currentPlayerIndex?: number;
  };
}

interface Scoreboard {
  [playerName: string]: number;
}

interface ExtendedWebSocket extends WebSocket {
  playerName?: string;
  playerIndex?: number;
  roomId?: number;
}

export type { Player, Ship, Room, Scoreboard, ExtendedWebSocket };
