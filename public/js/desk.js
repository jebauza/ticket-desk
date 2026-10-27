import { HttpClient } from "./adapters/http-client.js";
import { SocketClient } from "./adapters/socket-client.js";

const lblPending = document.getElementById('lbl-pending');
const deskHeader = document.querySelector('h1');
const noMoreAlert = document.querySelector('.alert');
const btnNext = document.querySelector('#btn-next');
const btnDone = document.querySelector('#btn-done');
const lblCurrentTicket = document.querySelector('small');

const searchParams = new URLSearchParams(window.location.search);
if (!searchParams.has('desk_name')) {
  window.location.href = 'index.html';
  throw new Error('El parámetro escritorio es obligatorio');
}
const deskName = searchParams.get('desk_name');
deskHeader.innerHTML = deskName;
let workingTicket = null;

const socketClient = new SocketClient('ws://localhost:3000/ws');
socketClient.connect();
socketClient.on('message', (raw) => {
  const { event, payload } = JSON.parse(raw);
  if (event !== 'on-ticket-number-changed') return;
  checkTicketCount(payload);
});

function checkTicketCount(currentCount = 0) {
  if (currentCount === 0 ) {
    noMoreAlert.classList.remove('d-none');
    lblPending.innerHTML = '';
  } else {
    noMoreAlert.classList.add('d-none');
    lblPending.innerHTML = currentCount;
  }
}

async function loadInitial() {
  workingTicket = (await getCurrentTicket()) || (await getNextTicket());
  lblCurrentTicket.innerHTML = workingTicket?.number || 'NINGUNO';

  try {
    const { body } = await HttpClient.get('/api/tickets', {status: 'pending'});
    checkTicketCount(body.meta.total);
  } catch (error) {
    console.error(error);
  }
}

async function getCurrentTicket() {
  try {
    const { body } = await HttpClient.get(`/api/tickets/desk/current`, {desk: deskName});
    return Object.keys(body.data).length !== 0 ? body.data : null;
  } catch (error) {
    console.log(error);
    return null;
  }
}

async function ticketDone() {
  if (workingTicket) {
    try {
        const { body } = await HttpClient.put(`/api/tickets/done/${workingTicket.id}`, {desk: deskName});
        workingTicket = null;
        lblCurrentTicket.innerHTML = 'NINGUNO';
      } catch (error) {
        console.log(error);
      }
  }
}

async function getNextTicket() {
  try {
    const { body } = await HttpClient.post(`/api/tickets/desk/next-ticket`, {desk: deskName});
    return Object.keys(body.data).length !== 0 ? body.data : null;
  } catch (error) {
    console.log(error);
    return null;
  }
}

btnDone.addEventListener('click', async () => {
  await ticketDone();
});

btnNext.addEventListener('click', async () => {
  await ticketDone();
  workingTicket = await getNextTicket();
  lblCurrentTicket.innerHTML = workingTicket?.number || 'NINGUNO';
});


// Init
loadInitial();