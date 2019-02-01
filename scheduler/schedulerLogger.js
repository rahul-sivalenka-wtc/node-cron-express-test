const {
  createLogger,
  format,
  transports
} = require('winston');
const {
  combine,
  timestamp,
  printf,
  simple
} = format;

const schedulerLogFormat = printf((o) => {
  const {
    level,
    message,
    domain,
    service,
    timestamp
  } = o;

  dom = domain ? `:${domain}` : message.domain ? `:${message.domain}` : '';
  console.log(o);

  if (typeof message === 'object') {
    const {
      message: msg,
      error
    } = message;

    if (error) {
      return `${timestamp} [${service}${dom}] ${level}: ${error.stack}`;
    }
    return `${timestamp} [${service}:${dom}] ${level}: ${msg}`;
  }

  return `${timestamp} [${service}${dom}] ${level}: ${message}`;
});

const logger = createLogger({
  level: 'info',
  format: combine(
    timestamp(),
    schedulerLogFormat
  ),
  defaultMeta: {
    service: 'scheduler'
  },
  transports: [
    //
    // - Write to all logs with level `info` and below to `combined.log` 
    // - Write all logs error (and below) to `error.log`.
    //
    new transports.File({
      filename: 'scheduler-error.log',
      level: 'error'
    }),
    new transports.File({
      filename: 'scheduler.log'
    }),
    new transports.Console({
      format: simple()
    })
  ]
});


module.exports = logger;