import express from 'express';
import cors from 'cors';
import { calculate } from './controllers/calculate.controller';


const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});
app.post('/calculate', calculate);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
