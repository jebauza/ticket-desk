import { HttpClient } from './adapters/http-client.js';

const currentTicketLbl = document.querySelector('span');
const createTiketBtn = document.getElementById('btn-new-ticket');

async function getLastTicket() {
  try {
    const { body } = await HttpClient.get('/api/tickets/last');
    currentTicketLbl.innerText = body.data.number;
  } catch (err) {
    currentTicketLbl.innerText = '—';
    console.error('No se pudo obtener el último ticket:', err);
  }
}

async function createTicket() {
  return HttpClient.post('/api/tickets');
}

createTiketBtn.addEventListener('click', async () => {
  try {
    await createTicket();
    await getLastTicket();
  } catch (err) {
    console.error('No se pudo crear el ticket:', err);
  }
});

getLastTicket();
