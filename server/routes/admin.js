var express = require('express');
var router = express.Router();

router.use('/admin', express.static( __dirname +'/../admin' ));

module.exports = router;