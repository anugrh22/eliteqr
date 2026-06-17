import { FormEvent, useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import Landing from "./Pages/Landing";

type SavedQR = {
  id: number | string;
  label?: string;
  url: string;
  image?: string;
  created_at?: string;
  scan_count: number;
};

function buildSlug() {
  return Math.random().toString(36).slice(2, 10);
}

function App() {
  const [qrImage, setQrImage] = useState("");
  const [label, setLabel] = useState("Menu QR");
  const [url, setUrl] = useState("https://example.com");
  const [preview, setPreview] = useState("");
  const [savedQRs, setSavedQRs] = useState<SavedQR[]>([]);
  const [status, setStatus] = useState("Ready to generate a QR code.");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [search, setSearch] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [selectedQR, setSelectedQR] = useState<SavedQR | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  const previewApiUrl = "/create-qr";

  const canGenerate = useMemo(() => url.trim().length > 0, [url]);

  const fetchQrs = async () => {
    try {
      const token = localStorage.getItem("token");
      

      if (!token) {
        setSavedQRs([]);
        return;
      }

      const response = await fetch("/api/qrs", {
        headers: getAuthHeaders(),
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        setToken("");
        setIsLoggedIn(false);
        setSavedQRs([]);
        setStatus("Session expired. Please login again.");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to load QR history");
      }

      const data = await response.json();

      setSavedQRs(Array.isArray(data) ? data : []);
    } catch (error) {
      setStatus("Failed to load QR history.");
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("eliteqr_theme") as
      | "light"
      | "dark"
      | null;

    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchQrs();
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("eliteqr_saved_qrs", JSON.stringify(savedQRs));
  }, [savedQRs]);

  const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const generateLocalQR = async (value: string) => {
    return QRCode.toDataURL(value, {
      errorCorrectionLevel: "H",
      type: "image/png",
      width: 300,
    });
  };

const deleteQr = async (qrId: number | string) => {
  try {
    

    const token = localStorage.getItem("token");
    if (!token) {
      setStatus("Please login first.");
      return;
    }

    const response = await fetch(`/api/qrs/${qrId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (response.status === 401) {
      localStorage.removeItem("token");
      setToken("");
      setIsLoggedIn(false);
      setSavedQRs([]);
      setStatus("Session expired. Please login again.");
      return;
    }

    if (!response.ok) {
      throw new Error("Failed to delete QR code.");
    }

    setSavedQRs((current) =>
      current.filter((item) => String(item.id) !== String(qrId))
    );

    setStatus("QR code deleted successfully.");

    
    await fetchQrs();
   

  } catch (error) {
    console.error("DELETE ERROR:", error);
    setStatus("Unable to delete QR code. Please try again.");
  }
};

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);

      setStatus("URL copied to clipboard.");
    } catch (error) {
      setStatus("Failed to copy URL.");
    }
  };

  const exportQrs = () => {
    const dataStr = JSON.stringify(savedQRs, null, 2);

    const blob = new Blob([dataStr], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = "exported_qrs.json";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    setStatus("QR history exported successfully.");
  };

  const clearAllQrs = () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete all QR history?",
    );

    if (!confirmDelete) return;

    setSavedQRs([]);

    localStorage.removeItem("eliteqr_saved_qrs");

    setStatus("All QR history cleared.");
  };

  const handleGenerate = async (event: FormEvent) => {
    event.preventDefault();

    if (!canGenerate) {
      setStatus("Please enter a valid URL first.");
      return;
    }

    setStatus("Generating QR code...");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setStatus("Please login first.");
        return;
      }

      const response = await fetch(previewApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          url: url.trim(),
          width: 300,
        }),
      });

      if (!response.ok) {
        throw new Error("Backend preview request failed");
      }

      const data = await response.json();

      if (
        typeof data.image !== "string" ||
        !data.image.startsWith("data:image/png;base64,")
      ) {
        throw new Error("Unexpected backend preview response");
      }

      setPreview(data.image);
      setQrImage(data.image);

      await fetchQrs();

      setStatus("QR code generated successfully.");
    } catch (backendError) {
      try {
        const qrData = await generateLocalQR(url.trim());

        setPreview(qrData);

        setStatus("Backend preview unavailable. Generated locally instead.");
      } catch (localError) {
        setStatus("Failed to generate QR code. Check the URL and try again.");
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
      setStatus("Generate the QR code before downloading.");
      return;
    }

    const link = document.createElement("a");

    link.href = preview;

    link.download = `${label.trim() || "qrcode"}.png`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    setStatus("QR code downloaded successfully.");
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";

    setTheme(newTheme);

    localStorage.setItem("eliteqr_theme", newTheme);

    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
    setIsLoggedIn(false);
    setSavedQRs([]);
    setQrImage("");
    setPreview("");
  };

  const handleLoginSuccess = () => {
    setToken(localStorage.getItem("token") || "");
    setIsLoggedIn(true);
    fetchQrs();
  };

  const editQr = async (qrId: number | string) => {
    const newUrl = prompt("Enter new URL");

    if (!newUrl) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setStatus("Please login first.");
      return;
    }

    const response = await fetch(`/api/qrs/${qrId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        url: newUrl,
      }),
    });

    if (response.ok) {
      alert("QR updated!");
      await fetchQrs();
    } else {
      alert("Update failed");
    }
  };

  if (!isLoggedIn) {
    return <Landing onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-shell">
      <header className="hero">
        <div className="header-top">
          <button
            onClick={handleLogout}
            className="logout-btn"
            title="Logout"
          >
            Logout
          </button>

          <h1>EliteQR</h1>

          <button
            className="theme-toggle"
            onClick={toggleTheme}
            title="Toggle theme"
          >
            {theme === "light" ? "🌙" : "☀️"}
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

            {qrImage && <img src={qrImage} alt="QR Code" width="300" />}

            <div className="button-row">
              <button type="submit">Generate Preview</button>

              <button type="button" onClick={downloadQR} className="secondary">
                Download QR
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
            <div className="placeholder">
              Your generated QR will appear here.
            </div>
          )}
        </section>

        <section className="card saved-card">
          <h2>Saved QR Codes</h2>

          <input
            type="text"
            placeholder="Search QR history..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "16px",
              borderRadius: "8px",
            }}
          />

          <div
            style={{
              display: "flex",
              gap: "10px",
              marginBottom: "16px",
            }}
          >
            <button type="button" onClick={exportQrs} className="secondary">
              Export History
            </button>

            <button type="button" onClick={clearAllQrs} className="delete-btn">
              Clear All
            </button>
          </div>

          {savedQRs.length === 0 ? (
            <p>No saved QR codes yet. Generate one to start.</p>
          ) : (
            <div className="saved-grid">
              {savedQRs
                .filter((item) =>
                  item.url.toLowerCase().includes(search.toLowerCase()),
                )
                .map((item) => (
                  <article
                    key={item.id}
                    className="saved-item"
                    onClick={() => setSelectedQR(item)}
                    style={{ cursor: "pointer" }}
                  >
                    {item.image && (
                      <img src={item.image} alt="Saved QR" width="80" />
                    )}

                    <div>
                      <strong>{item.url}</strong>

                      <p>{item.created_at}</p>
                    </div>


                    <p>Scans: {item.scan_count}</p>

                    <button
                      type="button"
                      onClick={() => deleteQr(item.id)}
                      className="delete-btn"
                      title="Delete QR"
                      aria-label="Delete QR"
                    >
                      Delete
                    </button>

                    <button
                      type="button"
                      onClick={() => copyUrl(item.url)}
                      className="copy-btn"
                    >
                      Copy URL
                    </button>



                    <button
                      type="button"
                      onClick={() => editQr(item.id)}
                      className="edit-btn"
                    >
                      Edit
                    </button>
                  </article>
                ))}
            </div>
          )}
        </section>
        {selectedQR && (
          <section className="card preview-card">
            <h2>QR Details</h2>

            {selectedQR.image && (
              <img src={selectedQR.image} alt="Selected QR" width="200" />
            )}

            <p>
              <strong>ID:</strong> {selectedQR.id}
            </p>

            <p>
              <strong>URL:</strong> {selectedQR.url}
            </p>

            <p>
              <strong>Created:</strong> {selectedQR.created_at}
            </p>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
