const express = require('express');
const router = express.Router();
const { getComments, addComment, deleteComment, getAllComments } = require('../controllers/commentController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/all', protect, adminOnly, getAllComments);
router.get('/:newsId', getComments);
router.post('/:newsId', protect, addComment);
router.delete('/:id', protect, deleteComment);

module.exports = router;
