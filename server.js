import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import QRCode from 'qrcode';

const app = express();
const PORT = Number(process.env.PORT) || 4000;
const dataDir = path.resolve('./data');
const dataFile = path.join(dataDir, 'qrs.json');

app.use(cors());
app.use(express.json());

async function ensureDataFile() {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(dataFile);
  } catch {
    await fs.writeFile(dataFile, '[]', 'utf8');
  }
}

async function readStorage() {
  await ensureDataFile();
  const raw = await fs.readFile(dataFile, 'utf8');
  return JSON.parse(raw || '[]');
}

async function writeStorage(items) {
  await ensureDataFile();
  await fs.writeFile(dataFile, JSON.stringify(items, null, 2), 'utf8');
}

app.get('/api/qrs', async (req, res) => {
  try {
    const items = await readStorage();
    res.json([...items].reverse());
  } catch (error) {
    res.status(500).json({ error: 'Unable to read saved QR codes.' });
  }
});

app.post('/api/qrs', async (req, res) => {
  const { id, label, url, image, createdAt } = req.body;
  if (!id || !label || !url) {
    return res.status(400).json({ error: 'id, label, and url are required.' });
  }

  try {
    const qrImage = image || (await QRCode.toDataURL(url.trim(), { errorCorrectionLevel: 'H', type: 'image/png', width: 300 }));
    const newQR = {
      id,
      label,
      url,
      image: qrImage,
      createdAt: createdAt || new Date().toISOString(),
    };

    const items = await readStorage();
    const existingIndex = items.findIndex((item) => item.id === id);
    if (existingIndex >= 0) {
      items[existingIndex] = newQR;
    } else {
      items.push(newQR);
    }

    await writeStorage(items);
    res.status(201).json(newQR);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save QR code.' });
  }
});

app.post('/api/generate', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL is required.' });
  }

  try {
    const image = await QRCode.toDataURL(url.trim(), { errorCorrectionLevel: 'H', type: 'image/png', width: 300 });
    res.json({ image });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate QR code.' });
  }
});

app.get('/api/qrs/:id/redirect', async (req, res) => {
  try {
    const items = await readStorage();
    const item = items.find((entry) => entry.id === req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'QR code not found.' });
    }

    res.redirect(item.url);
  } catch (error) {
    res.status(500).json({ error: 'Unable to process redirect.' });
  }
});

app.listen(PORT, () => {
  console.log(`EliteQR backend running at http://localhost:${PORT}`);
});
