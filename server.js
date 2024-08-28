const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const path = require('path');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = 3000;

// Configuración de SerialPort
const arduinoPort = new SerialPort({ path: '/dev/ttyUSB0', baudRate: 9600 });
const parser = arduinoPort.pipe(new ReadlineParser({ delimiter: '\n' }));

// Servir archivos estáticos desde la carpeta 'assets'
app.use(express.static(path.join(__dirname, 'assets')));

// Ruta principal que sirve el archivo HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'assets', 'index.html'));
});

// Configuración de WebSocket
io.on('connection', (socket) => {
    console.log('Un cliente se ha conectado');
});

// Leer datos del Arduino y enviarlos a través de WebSocket
parser.on('data', (data) => {
    console.log('Datos recibidos del Arduino:', data);
    
    // Parsear los datos
    const lines = data.split('\n');
    const potData = {};
    
    lines.forEach(line => {
        if (line.startsWith('Maceta')) {
            const [potInfo, ...rest] = line.split(':');
            const potNumber = potInfo.split(' ')[1];
            potData[potNumber] = rest.join(':').trim();
        }
    });
    
    // Enviar datos parseados
    io.emit('arduino-data', potData);
});

// Iniciar el servidor
server.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});

// Manejo de errores de SerialPort
arduinoPort.on('error', function(err) {
    console.log('Error en SerialPort: ', err.message);
});