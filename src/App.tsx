import { FormEvent, useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';

type SavedQR = {
  id: string;
  label: string;
  url: string;
  image: string;
};

function buildSlug() {
  return Math.random().toString(36).slice(2, 10);
}

function App() {
  const [label, setLabel] = useState('Menu QR');
  const [url, setUrl] = useState('https://example.com');
  const [preview, setPreview] = useState('');
  const [savedQRs, setSavedQRs] = useState<SavedQR[]>([]);
  const [status, setStatus] = useState('Ready to generate a QR code.');

  useEffect(() => {
    const stored = localStorage.getItem('eliteqr_saved_qrs');
    if (stored) {
      setSavedQRs(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('eliteqr_saved_qrs', JSON.stringify(savedQRs));
  }, [savedQRs]);

  const canGenerate = useMemo(() => url.trim().length > 0, [url]);

  const handleGenerate = async (event: FormEvent) => {
    event.preventDefault();
    if (!canGenerate) {
      setStatus('Please enter a valid URL first.');
      return;
    }

    setStatus('Generating QR code...');
    try {
      const qrData = await QRCode.toDataURL(url.trim(), {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        width: 300,
      });
      setPreview(qrData);
      setStatus('QR code generated successfully.');
    } catch (error) {
      setStatus('Failed to generate QR code. Check the URL and try again.');
    }
  };

  const handleSave = () => {
    if (!preview) {
      setStatus('Generate the QR code before saving.');
      return;
    }

    const newQR: SavedQR = {
      id: buildSlug(),
      label: label.trim() || 'QR Code',
      url: url.trim(),
      image: preview,
    };
    setSavedQRs([newQR, ...savedQRs]);
    setStatus('QR code saved locally.');
  };

  return (
    <div className="app-shell">
      <header className="hero">
        <h1>EliteQR</h1>
        <p>Create, preview, and manage your QR codes from the browser.</p>
      </header>

      <main>
        <section className="card form-card">
          <h2>Create QR Code</h2>
          <form onSubmit={handleGenerate}>
            <label>
              Label
              <input
                value={label}
                onChange={(event) => setLabel(event.target.value)}
                placeholder="Name this QR code"
              />
            </label>

            <label>
              Destination URL
              <input
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://your-destination.com"
              />
            </label>

            <div className="button-row">
              <button type="submit">Generate Preview</button>
              <button type="button" onClick={handleSave} className="secondary">
                Save QR
              </button>
            </div>
          </form>
          <div className="status-box">{status}</div>
        </section>

        <section className="card preview-card">
          <h2>Preview</h2>
          {preview ? (
            <img src={preview} alt="QR code preview" />
          ) : (
            <div className="placeholder">Your generated QR will appear here.</div>
          )}
        </section>

        <section className="card saved-card">
          <h2>Saved QR Codes</h2>
          {savedQRs.length === 0 ? (
            <p>No saved QR codes yet. Generate one to start.</p>
          ) : (
            <div className="saved-grid">
              {savedQRs.map((item) => (
                <article key={item.id} className="saved-item">
                  <img src={item.image} alt={`${item.label} QR code`} />
                  <div>
                    <strong>{item.label}</strong>
                    <p>{item.url}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
