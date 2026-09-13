import { HttpClient } from "./adapters/http-client.js";
import { SocketClient } from "./adapters/socket-client.js";

const lblPending = document.getElementById('lbl-pending');
const deskHeader = document.querySelector('h1');
const noMoreAlert = document.querySelector('.alert');
const btnDraw = document.querySelector('#btn-draw');
const btnDone = document.querySelector('#btn-done');

const searchParams = new URLSearchParams(window.location.search);
if (!searchParams.has('desk_name')) {
  window.location.href = 'index.html';
  throw new Error('El parámetro escritorio es obligatorio');
}
deskHeader.innerHTML = searchParams.get('desk_name');
let workingTicket = null;

const socketClient = new SocketClient('ws://localhost:3000/ws');
socketClient.on('message', (raw) => {
  const { event, payload } = JSON.parse(raw);
  if (event !== 'on-ticket-number-changed') return;
  checkTicketCount(payload);
});

async function loadInitialCount() {
  socketClient.connect();
  getTicket();

  try {
    const { body } = await HttpClient.get('/api/tickets/pending');
    checkTicketCount(body.data.length);
  } catch (error) {
    console.error(error);
  }
}

function checkTicketCount(currentCount = 0) {
  if (currentCount === 0 ) {
    noMoreAlert.classList.remove('d-none');
    lblPending.innerHTML = '';
  } else {
    noMoreAlert.classList.add('d-none');
    lblPending.innerHTML = currentCount;
  }
}

async function getTicket() {
  try {
    const { body } = await HttpClient.get(`/api/tickets/working-by-desk`, {desk: searchParams.get('desk_name')});
  } catch (error) {
    
  }
  
}

// Init
loadInitialCount();

console.log('Escritorio HTMLf');