import express from 'express';
import cors from 'cors';
import { calculate } from './controllers/calculate.controller';


const app = express();

app.use(cors({
  origin: 'http://localhost:4200'
}));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});
app.post('/calculate', calculate);


const PORT = 8080;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
