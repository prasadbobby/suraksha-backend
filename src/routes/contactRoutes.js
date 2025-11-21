const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const {
  getContacts,
  createContact,
  updateContact,
  deleteContact
} = require('../controllers/contactController');

const router = express.Router();

router.use(authenticateToken);

router.get('/', getContacts);
router.post('/', createContact);
router.put('/:id', updateContact);
router.delete('/:id', deleteContact);

module.exports = router;