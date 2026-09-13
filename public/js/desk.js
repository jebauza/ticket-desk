import { HttpClient } from "./adapters/http-client.js";
import { SocketClient } from "./adapters/socket-client.js";

const lblPending = document.getElementById('lbl-pending');
const deskHeader = document.querySelector('h1');
const noMoreAlert = document.querySelector('.alert');

const searchParams = new URLSearchParams(window.location.search);
if (!searchParams.has('desk_name')) {
  window.location.href = 'index.html';
  throw new Error('El parámetro escritorio es obligatorio');
}
deskHeader.innerHTML = searchParams.get('desk_name');

const socketClient = new SocketClient('ws://localhost:3000/ws');
socketClient.on('message', (raw) => {
  const { event, payload } = JSON.parse(raw);
  if (event !== 'on-ticket-number-changed') return;
  checkTicketCount(payload);
});

async function loadInitialCount() {
  socketClient.connect();

  try {
    const pendingTickets = await HttpClient.get('/api/tickets/pending');
    checkTicketCount(pendingTickets.length);
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

// Init
loadInitialCount();

console.log('Escritorio HTMLf');