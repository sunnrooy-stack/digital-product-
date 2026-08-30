import { Router } from 'express';
import {
  getAllTickets,
  getTicketById,
  getTicketsByUserEmail,
  createTicket,
  replyTicket,
  updateTicketStatus,
  deleteTicket
} from '../controllers/ticket.controller';

const router = Router();

router.get('/', getAllTickets);
router.get('/user/:email', getTicketsByUserEmail);
router.get('/:id', getTicketById);
router.post('/', createTicket);
router.post('/:id/reply', replyTicket);
router.patch('/:id/status', updateTicketStatus);
router.delete('/:id', deleteTicket);

export default router;
