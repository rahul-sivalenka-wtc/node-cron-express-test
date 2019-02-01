const log = console.log;
const express = require('express');
const morgan = require('morgan');
const app = express();
const port = 3000;
const schedulerRoute = `http://localhost:${port}/runScheduler`;

log('pid', process.pid);

const scheduler = require('./scheduler');
scheduler.init(schedulerRoute);
// setTimeout(_ => scheduler.stopAll(), 5000);
// setTimeout(_ => scheduler.start('cura'), 7000);

process.on('exit', () => {
  log(`pid:${process.pid}: Exit`);
  // scheduler.stopAll();
});

app.use(express.urlencoded({
  extended: true
}));
app.use(express.json());

app.use(morgan('dev'));

app.post('/runScheduler', (req, res) => {
  const {
    domainName
  } = req.body;

  console.log(`Running Scheduler API for ${domainName}`);

  setTimeout(() => res.json({
    status: 'Done'
  }), domainName === 'cura' ? 1000 : 5000);
});

app.listen(port, () => {
  log(`App listening on ${port}`);
});