import express from 'express';
import cors from 'cors';
import { setupRoutes } from './routes';
import { startPayoutsCron } from './payouts';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

setupRoutes(app);

startPayoutsCron();

app.listen(PORT, () => {
  console.log(`[PayPal Server] Running on port ${PORT}`);
  console.log(`[PayPal Server] Environment: ${process.env.NODE_ENV || 'development'}`);
});
