import { FormEvent, useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';

type SavedQR = {
  id: string;
  label?: string;
  url: string;
  image?: string;
  created_at?: string;
};

function buildSlug() {
  return Math.random().toString(36).slice(2, 10);
}

function App() {
  const [qrImage, setQrImage] = useState("");
  const [label, setLabel] = useState('Menu QR');
  const [url, setUrl] = useState('https://example.com');
  const [preview, setPreview] = useState('');
  const [savedQRs, setSavedQRs] = useState<SavedQR[]>([]);
  const [status, setStatus] = useState('Ready to generate a QR code.');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const previewApiUrl = '/create-qr';

  const canGenerate = useMemo(() => url.trim().length > 0, [url]);

  const fetchQrs = async () => {
    try {
      const response = await fetch("/api/qrs");

      const data = await response.json();

      setSavedQRs(data);

    } catch (error) {
      setStatus("Failed to load QR history.");
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('eliteqr_theme') as 'light' | 'dark' | null;

    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  useEffect(() => {
    fetchQrs();
  }, []);

  useEffect(() => {
    localStorage.setItem('eliteqr_saved_qrs', JSON.stringify(savedQRs));
  }, [savedQRs]);

  const generateLocalQR = async (value: string) => {
    return QRCode.toDataURL(value, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
    });
  };

  

  const handleGenerate = async (event: FormEvent) => {
    event.preventDefault();

    if (!canGenerate) {
      setStatus('Please enter a valid URL first.');
      return;
    }

    setStatus('Generating QR code...');

    try {
      const response = await fetch(previewApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url.trim(),
          width: 300
        }),
      });

      if (!response.ok) {
        throw new Error('Backend preview request failed');
      }

      const data = await response.json();

      if (
        typeof data.image !== 'string' ||
        !data.image.startsWith('data:image/png;base64,')
      ) {
        throw new Error('Unexpected backend preview response');
      }

      setPreview(data.image);
      setQrImage(data.image);


      await fetchQrs();

      setStatus('QR code generated successfully.');

    } catch (backendError) {

      try {
        const qrData = await generateLocalQR(url.trim());

        setPreview(qrData);

        setStatus('Backend preview unavailable. Generated locally instead.');

      } catch (localError) {

        setStatus('Failed to generate QR code. Check the URL and try again.');
      }
    }
  };

  const downloadQR = () => {
    if (!preview) {
      alert("Generate a QR first");
      return;
    }

    const link = document.createElement("a");

    link.href = preview;

    link.download = "qr.png";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  };

  const handleDownload = () => {
    if (!preview) {
      setStatus('Generate the QR code before downloading.');
      return;
    }

    const link = document.createElement('a');

    link.href = preview;

    link.download = `${label.trim() || 'qrcode'}.png`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    setStatus('QR code downloaded successfully.');
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';

    setTheme(newTheme);

    localStorage.setItem('eliteqr_theme', newTheme);

    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <div className="app-shell">

      <header className="hero">
        <div className="header-top">
          <h1>EliteQR</h1>

          <button
            className="theme-toggle"
            onClick={toggleTheme}
            title="Toggle theme"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>

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
                type="text"
                placeholder="Enter URL"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
              />
            </label>

            

            {qrImage && (
              <img
                src={qrImage}
                alt="QR Code"
                width="300"
              />
            )}

            <div className="button-row">

              <button type="submit">
                Generate Preview
              </button>

              <button
                type="button"
                onClick={downloadQR}
                className="secondary"
              >
                Download QR
              </button>

            </div>

          </form>

          <div className="status-box">
            {status}
          </div>
        </section>

        <section className="card preview-card">
          <h2>Preview</h2>

          {preview ? (
            <img src={preview} alt="QR code preview" />
          ) : (
            <div className="placeholder">
              Your generated QR will appear here.
            </div>
          )}
        </section>

        <section className="card saved-card">

          <h2>Saved QR Codes</h2>

          {savedQRs.length === 0 ? (

            <p>No saved QR codes yet. Generate one to start.</p>

          ) : (

            <div className="saved-grid">

              {savedQRs.map((item) => (

                <article
                  key={item.id}
                  className="saved-item"
                >

                  {item.image && (
                    <img
                      src={item.image}
                      alt="Saved QR"
                      width="80"
                    />
                  )}

                  <div>
                    <strong>{item.url}</strong>

                    <p>{item.created_at}</p>
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