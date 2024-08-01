import Rollbar from 'rollbar';
import 'dotenv/config';

const rollbar = new Rollbar({
  accessToken: process.env.ROLLBAR_ACCESS_TOKEN!,
  captureUncaught: true,
  captureUnhandledRejections: true,
  environment: process.env.ROLLBAR_ENVIRONMENT,
});

export default rollbar;
