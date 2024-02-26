import { ExtendedWebSocket, Room, Ship } from '../types';
import { rooms } from '../initialData';
import sendJSON from '../utils/sendJson';
import notifyTurn from './notifyTurn';
import updateScoreboard from './updateScoreboard';

const handleAttack = (ws: ExtendedWebSocket, data: string) => {
  const { gameId, x, y, indexPlayer } = JSON.parse(data);
  const room = rooms[gameId];
  
  console.log(
    `Attack received from player ${indexPlayer} at position (${x}, ${y}) in game ${gameId}`
  );

  if (room?.gameState.currentPlayerIndex !== indexPlayer) {
    sendJSON(ws, { type: 'error', data: { message: 'Not your turn' }, id: 0 });
    return;
  }

  const attackOutcome = processAttack(gameId, x, y, indexPlayer);

  console.log(`Attack result for game ${gameId}: ${JSON.stringify(attackOutcome)}`);

  if (!attackOutcome.repeatTurn) {
    (room as Room).gameState.currentPlayerIndex = (indexPlayer + 1) % 2;

    console.log(
      `Turn switched to player ${(room as Room).gameState.currentPlayerIndex} in game ${gameId}`
    );
  }

  room?.players.forEach((playerWs) => {
    const responseData = {
      position: { x, y },
      currentPlayer: room.gameState.currentPlayerIndex,
      status: attackOutcome.status,
    };
    sendJSON(playerWs, {
      type: 'attack',
      data: JSON.stringify(responseData),
      id: 0,
    });
  });

  if (attackOutcome.status === 'killed') {
    const killedShip = attackOutcome.killedShip as Ship;

    for (let i = 0; i < killedShip.length; i++) {
      const partX = killedShip.direction ? killedShip.position.x : killedShip.position.x + i;
      const partY = killedShip.direction ? killedShip.position.y + i : killedShip.position.y;

      room?.players.forEach((playerWs) => {
        sendJSON(playerWs, {
          type: 'attack',
          data: JSON.stringify({
            position: { x: partX, y: partY },
            currentPlayer: room.gameState.currentPlayerIndex,
            status: 'killed',
          }),
          id: 0,
        });
      });
    }
    const surroundingCells = revealSurroundingCells(killedShip);
    surroundingCells.forEach((cell) => {
      room?.players.forEach((playerWs) => {
        sendJSON(playerWs, {
          type: 'attack',
          data: JSON.stringify({
            position: cell,
            currentPlayer: room.gameState.currentPlayerIndex,
            status: 'miss',
          }),
          id: 0,
        });
      });
    });
  }

  if (!attackOutcome.gameOver && !attackOutcome.repeatTurn) {
    (room as Room).gameState.currentPlayerIndex = (indexPlayer + 1) % 2;
    notifyTurn(gameId);
  } else if (attackOutcome.gameOver) {
    const winnerIdx = indexPlayer;
    const winnerName = room?.players[winnerIdx]?.playerName;

    room?.players.forEach((playerWs) => {
      sendJSON(playerWs, {
        type: 'finish',
        data: JSON.stringify({ winPlayer: winnerIdx }),
        id: 0,
      });
    });

    updateScoreboard(winnerName as string);
  }
};

function processAttack(gameId: number, x: number, y: number, indexPlayer: number) {
  const room = rooms[gameId];
  const opponentIndex = (indexPlayer + 1) % 2;

  let attackResult = {
    status: 'miss',
    gameOver: false,
    repeatTurn: false,
    killedShip: {},
    surroundingCells: [],
  };

  console.log(
    `Processing attack for game ${gameId} by player ${indexPlayer} on opponent ${opponentIndex}`
  );
  const opponentShips = room?.gameState.ships[opponentIndex];

  opponentShips?.forEach((ship) => {
    const shipEndX = ship.direction ? ship.position.x : ship.position.x + ship.length - 1;
    const shipEndY = ship.direction ? ship.position.y + ship.length - 1 : ship.position.y;

    if (x >= ship.position.x && x <= shipEndX && y >= ship.position.y && y <= shipEndY) {
      if (!ship.hits) {
        ship.hits = [];
      }

      const hitExists = ship.hits.some((hit) => hit.x === x && hit.y === y);
      if (!hitExists) {
        ship.hits.push({ x, y });
        attackResult.status = ship.hits.length === ship.length ? 'killed' : 'hit';
        attackResult.repeatTurn = true;

        if (attackResult.status === 'killed') {
          ship.sunk = true;
          attackResult.killedShip = ship;
          (attackResult.surroundingCells as { x: number; y: number }[]) =
            revealSurroundingCells(ship);
        }
      }
    }
  });

  attackResult.gameOver = opponentShips?.every((ship) => ship.sunk) as boolean;

  if (!attackResult.repeatTurn) {
    (room as Room).gameState.currentPlayerIndex = opponentIndex;
  }

  return attackResult;
}

const revealSurroundingCells = (ship: Ship) => {
  const surroundingCells = [];
  const shipStartX = ship.position.x;
  const shipStartY = ship.position.y;
  const shipEndX = ship.direction ? shipStartX : shipStartX + ship.length - 1;
  const shipEndY = ship.direction ? shipStartY + ship.length - 1 : shipStartY;

  for (let x = shipStartX - 1; x <= shipEndX + 1; x++) {
    for (let y = shipStartY - 1; y <= shipEndY + 1; y++) {
      if (x < 0 || x >= 10 || y < 0 || y >= 10) continue;
      if (x >= shipStartX && x <= shipEndX && y >= shipStartY && y <= shipEndY) continue;

      surroundingCells.push({ x, y });
    }
  }

  return surroundingCells;
};

const handleRandomAttack = (ws: ExtendedWebSocket, data: string) => {
  const { gameId, indexPlayer } = JSON.parse(data);
  const room = rooms[gameId];

  if (room?.gameState.currentPlayerIndex !== indexPlayer) {
    sendJSON(ws, { type: 'error', data: { message: 'Not your turn' }, id: 0 });
    return;
  }

  const x = Math.floor(Math.random() * 10);
  const y = Math.floor(Math.random() * 10);

  console.log(
    `Random attack generated for game ${gameId} by player ${indexPlayer} at (${x}, ${y})`
  );

  const attackOutcome = processAttack(gameId, x, y, indexPlayer);

  room?.players.forEach((playerWs) => {
    sendJSON(playerWs, {
      type: 'attack',
      data: JSON.stringify({
        position: { x, y },
        currentPlayer: room.gameState.currentPlayerIndex,
        status: attackOutcome.status,
      }),
      id: 0,
    });
  });

  if (!attackOutcome.gameOver && !attackOutcome.repeatTurn) {
    (room as Room).gameState.currentPlayerIndex = (indexPlayer + 1) % 2;

    notifyTurn(gameId);
  } else if (attackOutcome.gameOver) {
    const winnerIdx = indexPlayer;
    const winnerName = room?.players[winnerIdx]?.playerName;

    room?.players.forEach((playerWs) => {
      sendJSON(playerWs, {
        type: 'finish',
        data: JSON.stringify({ winPlayer: winnerIdx }),
        id: 0,
      });
    });

    updateScoreboard(winnerName as string);
  }
};

export { handleAttack, handleRandomAttack };
