const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

let players = {};
let currentPlayer = 'X';
let board = Array(9).fill(null);

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);
    
    if (Object.keys(players).length < 2) {
        players[socket.id] = Object.keys(players).length === 0 ? 'X' : 'O';
        socket.emit('player', players[socket.id]);
    } else {
        socket.emit('full');
    }

    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
        delete players[socket.id];
        board = Array(9).fill(null);
        io.emit('reset');
    });

    socket.on('move', (index) => {
        if (players[socket.id] === currentPlayer && !board[index]) {
            board[index] = currentPlayer;
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            io.emit('update', { board, currentPlayer });
            checkWinner();
        }
    });

    const checkWinner = () => {
        const winningCombinations = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ];

        for (let combination of winningCombinations) {
            const [a, b, c] = combination;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                io.emit('winner', board[a]);
                board = Array(9).fill(null);
                return;
            }
        }

        if (!board.includes(null)) {
            io.emit('winner', 'Draw');
            board = Array(9).fill(null);
        }
    };
});

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
