const express = require('express');
const router = express.Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if(username === 'admin' && password === 'admin123'){
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: "Invalid username or password" });
  }
});

module.exports = router;
