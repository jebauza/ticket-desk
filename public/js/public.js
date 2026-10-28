import { HttpClient } from './adapters/http-client.js';
import { SocketClient } from './adapters/socket-client.js';

const lblTicket01 = document.getElementById('lbl-ticket-01');
const lblTicket02 = document.getElementById('lbl-ticket-02');
const lblTicket03 = document.getElementById('lbl-ticket-03');
const lblTicket04 = document.getElementById('lbl-ticket-04');
const lblDesk01 = document.getElementById('lbl-desk-01');
const lblDesk02 = document.getElementById('lbl-desk-02');
const lblDesk03 = document.getElementById('lbl-desk-03');
const lblDesk04 = document.getElementById('lbl-desk-04');

let workingTickets = [];

const socketClient = new SocketClient('ws://localhost:3000/ws');
socketClient.connect();
socketClient.on('message', (raw) => {
  const { event, payload } = JSON.parse(raw);
  if (event !== 'on-ticket-working-changed') return;
  const data = JSON.parse(payload);
  workingTickets = data.tickets;
  updateScreen();
});

async function loadInitial() {
  try {
    const { body } = await HttpClient.get('/api/tickets/working-on');
    workingTickets = body.data;
    updateScreen();
  } catch (error) {
    console.error(error);
  }
}

function updateScreen() {
  const [t1, t2, t3, t4] = workingTickets;

  lblTicket01.innerHTML = `Ticket ${t1?.number || 'N/A'}`;
  lblTicket02.innerHTML = `Ticket ${t2?.number || 'N/A'}`;
  lblTicket03.innerHTML = `Ticket ${t3?.number || 'N/A'}`;
  lblTicket04.innerHTML = `Ticket ${t4?.number || 'N/A'}`;

  lblDesk01.innerHTML = `${t1?.handleAtDesk || ''}`;
  lblDesk02.innerHTML = `${t2?.handleAtDesk || ''}`;
  lblDesk03.innerHTML = `${t3?.handleAtDesk || ''}`;
  lblDesk04.innerHTML = `${t4?.handleAtDesk || ''}`;
}

loadInitial();
