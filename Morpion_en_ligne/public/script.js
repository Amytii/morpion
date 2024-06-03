const socket = io();
let player;
let currentPlayer;

const cells = document.querySelectorAll('[data-cell]');
const statusDisplay = document.getElementById('status');

socket.on('player', (assignedPlayer) => {
    player = assignedPlayer;
    statusDisplay.innerText = `Vous êtes le joueur ${player}`;
});

socket.on('full', () => {
    statusDisplay.innerText = 'La salle est pleine. Essayez plus tard.';
});

socket.on('update', ({ board, currentPlayer: newCurrentPlayer }) => {
    cells.forEach((cell, index) => {
        cell.innerText = board[index];
    });
    currentPlayer = newCurrentPlayer;
    statusDisplay.innerText = `C'est au tour du joueur ${currentPlayer}`;
});

socket.on('winner', (winner) => {
    if (winner === 'Draw') {
        statusDisplay.innerText = 'Égalité!';
    } else {
        statusDisplay.innerText = `Le joueur ${winner} a gagné!`;
    }
    cells.forEach(cell => cell.removeEventListener('click', handleClick));
});

socket.on('reset', () => {
    cells.forEach(cell => {
        cell.innerText = '';
        cell.addEventListener('click', handleClick, { once: true });
    });
    statusDisplay.innerText = `Vous êtes le joueur ${player}`;
});

const handleClick = (e) => {
    const index = e.target.getAttribute('data-cell');
    socket.emit('move', index);
};

cells.forEach(cell => {
    cell.addEventListener('click', handleClick, { once: true });
});
