var express = require('express');
var router = express.Router();

router.use('/vendor', express.static( __dirname +'/../node_modules' ));

module.exports = router;