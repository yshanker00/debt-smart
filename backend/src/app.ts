import express from 'express';
import cors from 'cors';
import { calculate } from './controllers/calculate.controller';

const app = express();

// Allow requests from frontend (GitHub Pages, etc.)
app.use(cors());

// Parse JSON body
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Main API
app.post('/calculate', calculate);

// Cloud Run uses injected PORT
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
