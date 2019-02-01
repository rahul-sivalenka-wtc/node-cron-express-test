const CronJob = require('cron').CronJob;
const axios = require('axios');
const logger = require('./schedulerLogger');
let job = null;
let _options;
let inProcess = false;
let url;
// const log = (...args) => {
//   args.unshift(`pid(${process.pid})`, `:`, `domain(${_options.domain})`, `::`);
//   console.log.apply(console, args);
// };
const log = (message) => {
  logger.info({
    message,
    domain: _options.domain
  });
};
const logError = (error) => {
  logger.error({
    domain: _options.domain,
    error
  });
}

const runScheduler = () => {
  if (!inProcess) {
    const d = new Date();
    // log(d);
    // log('URL', _options.url);
    // log('Domain', _options.domain);
    inProcess = true;
    axios.post(_options.url, {
        domainName: _options.domain
      }).then(_ => {
        log(`Request sent`);
        inProcess = false;
      })
      .catch(err => {
        logError(err);
        inProcess = false;
      });
  }
};

// log('Before job instantiation');
// log('After job instantiation');
// job.start();

// process.on('exit', () => {
//   log(`pid(${process.pid}): Stopping the job`);
//   job.stop();
//   log(`pid(${process.pid}): exit`);
// });

process.on('message', options => {
  let action = options;
  if (typeof options === 'object') {
    _options = options;
    action = 'start';
    log(`Initializing Job`);
    job = new CronJob(options.interval, runScheduler, null, false);
  }

  switch (action) {
    case 'start':
      job && job.start();
      log(`Job started`);
      break;
    case 'stop':
      job && job.stop();
      log(`Job stopped`);
      break;
    default:
      log('no action');
  }
});


process.on('uncaughtException', (error) => {
  logError(error);
  job && job.stop();
});