# Product Overview

## Purpose
Ticket Desk is a real-time queue management system. Customers generate numbered tickets, service desks attend them sequentially, and a public display shows live status via WebSockets.

## Key Features
- Numbered ticket generation with auto-incrementing sequence
- Desk assignment: draws the next pending ticket atomically (SKIP LOCKED)
- Mark tickets as done when service is complete
- Real-time public display board updated via WebSockets
- Seed command for populating test data

## Target Users
- **Customers**: generate tickets via `/new-ticket.html`
- **Desk agents**: call and close tickets via `/desk.html`
- **Public**: view current service state via `/public.html`

## Web Views
| Route | Description |
|---|---|
| `/` | Main menu |
| `/public.html` | Live display of tickets being attended |
| `/new-ticket.html` | Generate a new ticket |
| `/desk.html` | Desk agent view — call and finish tickets |

## REST API (base: `/api/tickets`)
| Method | Route | Description |
|---|---|---|
| GET | `/` | All tickets |
| GET | `/pending` | Pending tickets |
| GET | `/last` | Last created ticket number |
| GET | `/working-on` | Last 4 tickets being attended |
| POST | `/` | Create new ticket |
| GET | `/draw/:desk` | Assign next pending ticket to a desk |
| PUT | `/done/:ticketId` | Mark ticket as done |
