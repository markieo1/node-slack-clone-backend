import express = require('express');
import routesV1 from './v1';

const router = express.Router();

router.use('/v1', routesV1);

export = router;
