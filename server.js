const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const USERS_FILE = path.join(__dirname, 'users.json');

app.use(express.static('public'));
app.use(bodyParser.json());

// Leer usuarios
function getUsers() {
    if (!fs.existsSync(USERS_FILE)) return [];
    const data = fs.readFileSync(USERS_FILE);
    return JSON.parse(data);
}

// Escribir usuarios
function saveUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// Registrar
app.post('/api/register', (req, res) => {
    const { name, email, password } = req.body;
    const users = getUsers();
    if (users.find(u => u.email === email)) {
        return res.status(400).json({ message: 'El correo ya está registrado' });
    }
    users.push({ name, email, password });
    saveUsers(users);
    res.json({ message: 'Registrado correctamente' });
});

// Login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return res.status(401).json({ message: 'Credenciales inválidas' });
    res.json({ message: 'Login exitoso', name: user.name });
});

// WebSockets
const userSockets = {};

io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');

    socket.on('register', (name) => {
        socket.userName = name;
        userSockets[name] = socket;
        updateUsers();
    });

    socket.on('chatMessage', (msg) => {
        io.emit('chatMessage', msg);
    });

    socket.on('privateMessage', ({ to, text }) => {
        if (userSockets[to]) {
            userSockets[to].emit('privateMessage', { from: socket.userName, text });
        }
    });

    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
        if (socket.userName) {
            delete userSockets[socket.userName];
            updateUsers();
        }
    });

    function updateUsers() {
        io.emit('userList', Object.keys(userSockets));
    }
});

server.listen(3000, () => {
    console.log('Servidor en línea en http://localhost:3000');
});
