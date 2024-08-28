const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

const port = new SerialPort({ path: '/dev/ttyUSB0', baudRate: 9600 });
const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

// Abre una conexión al puerto serie
port.on("open", () => {
  console.log('Puerto serie abierto');
});

// Lee los datos
parser.on('data', data => {
  console.log('Datos recibidos:', data);
  // Aquí puedes procesar los datos como necesites
});

// Manejo de errores
port.on('error', function(err) {
  console.log('Error: ', err.message);
});