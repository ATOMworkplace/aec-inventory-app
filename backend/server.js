const express = require('express');
const cors = require('cors');
const app = express();
const db = require('./config/db');

app.use(cors());
app.use(express.json());

app.use('/api/analysis', require('./routes/analysis'));
app.use('/api/inv', require('./routes/inv'));
app.use('/api/site', require('./routes/site'));

app.listen(process.env.PORT, () => console.log('Server is running on port:',process.env.PORT));