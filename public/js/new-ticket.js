const currentTicketLbl = document.querySelector('span');
const createTiketBtn = document.getElementById('btn-new-ticket');

async function getLastTicket() {
  const lastTicket = await fetch('/api/tickets/last').then(res => res.json());
  currentTicketLbl.innerText = lastTicket.number;
}

async function createTicket() {
  const res = await fetch('/api/tickets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  const newTicket = await res.json();
}

createTiketBtn.addEventListener('click', (event) => {
  createTicket();
  getLastTicket();
});

getLastTicket();