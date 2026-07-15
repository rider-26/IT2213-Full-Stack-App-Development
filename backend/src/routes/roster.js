// roster.js
// this is just a placeholder!! andre's real roster route file should already
// exist somewhere in the repo since the roster sync page actually works in
// the screenshot he sent. swap this out, dont actually use this version

const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.status(501).json({
    error: 'NOT_IMPLEMENTED',
    message: 'placeholder - use the real roster route file instead',
  });
});

module.exports = router;
