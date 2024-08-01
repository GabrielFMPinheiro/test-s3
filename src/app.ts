import express from 'express';
import serverless from 'serverless-http';
import 'dotenv/config';
import './config/rollbar';
import uploadRoutes from './routes/upload';

const app = express();

app.use('/billing', uploadRoutes);

export default app;
module.exports.handler = serverless(app);
