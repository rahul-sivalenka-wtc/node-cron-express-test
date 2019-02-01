const path = require('path');

const jobsConfig = require('./schedulerJobs.json');

const {
  fork
} = require('child_process');

const jobs = {};

const logger = require('./schedulerLogger');

const log = (message) => {
  // args.unshift(`info`, `Scheduler`, `:`, `pid(${process.pid})`, `::`);
  // console.log.apply(console, args);
  // logger.log.apply(logger, args);
  logger.info({
    message
  });
};

module.exports.stopAll = () => {
  Object.values(jobs).forEach(job => {
    job.send('stop');
  });
};


module.exports.stop = (domain) => {
  const job = jobs[domain];
  if (job) {
    job.send('stop');
  } else {
    log(`Scheduler for ${domain} does not exist`);
  }
};

module.exports.start = (domain) => {
  const job = jobs[domain];
  if (job) {
    job.send('start');
  } else {
    log(`Scheduler for ${domain} does not exist`);
  }
};

module.exports.init = (schedulerUrl) => {
  Object.entries(jobsConfig).forEach(([domain, config]) => {
    if (config.enabled) {
      log(`Initializing a scheduler for ${domain}`);
      let job = jobs[domain];
      if (job) {
        log(`A job is already running for ${domain}`);
        job.send('stop');
      }

      jobs[domain] = fork(path.join(__dirname, './schedulerCron'));
      jobs[domain].send({
        interval: '*/5 * * * * *',
        domain,
        url: schedulerUrl
      });
    } else {
      log(`Scheduler for ${domain} is disabled`);
    }
  });
}