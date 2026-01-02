import { useState } from 'react'
import './index.css'
import DiffViewer from './DiffViewer'

function App() {
  const [file, setFile] = useState(null)
  const [jd, setJd] = useState('')
  const [loading, setLoading] = useState(false)

  // Stages: 'upload', 'result', 'diff'
  const [view, setView] = useState('upload')
  const [result, setResult] = useState(null)
  const [customizationData, setCustomizationData] = useState(null) // { original, customized }
  const [notification, setNotification] = useState(null) // { message, type }

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  }

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  const handleAnalyze = async () => {
    if (!file || !jd) {
      showNotification("Please upload a file and enter a JD", "error");
      return;
    }

    setLoading(true);
    setView('upload'); // Keep showing upload while loading... or show spinner

    const formData = new FormData()
    formData.append('resume', file)
    formData.append('job_description', jd)

    try {
      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      setResult(data)
      setView('result')
    } catch (error) {
      console.error(error)
      showNotification("Failed to analyze resume", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleCustomize = async () => {
    if (!file || !jd) return;

    setLoading(true);
    showNotification("Generating optimized resume... This may take a minute.", "info");

    const formData = new FormData()
    formData.append('resume', file)
    formData.append('job_description', jd)

    try {
      const response = await fetch('http://localhost:8000/customize', {
        method: 'POST',
        body: formData,
      })
      const data = await response.json();
      setCustomizationData(data); // { original, customized }
      setView('diff');
    } catch (error) {
      console.error(error);
      showNotification("Failed to generate customization", "error");
    } finally {
      setLoading(false);
    }
  }

  const handleDownloadPdf = async (finalContent) => {
    try {
      // Prepare form data for text content
      const formData = new FormData();
      formData.append('content', finalContent);

      const response = await fetch('http://localhost:8000/generate_pdf', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'customized_resume.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      showNotification("PDF Downloaded successfully!", "success");
    } catch (error) {
      console.error(error);
      showNotification("Failed to download PDF", "error");
    }
  }

  return (
    <div className="app-container">
      <h1>Resume Matcher & Optimizer</h1>

      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* Upload View */}
      {view === 'upload' && !result && (
        <div className="glass-panel" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="input-group">
            <label>1. Upload Resume (PDF/DOCX)</label>
            <input type="file" onChange={handleFileChange} accept=".pdf,.docx,.txt" />
          </div>

          <div className="input-group">
            <label>2. Paste Job Description</label>
            <textarea
              placeholder="Paste the job description here..."
              value={jd}
              onChange={(e) => setJd(e.target.value)}
            />
          </div>

          <div style={{ marginTop: '1rem' }}>
            <button onClick={handleAnalyze} disabled={loading || !file || !jd} style={{ width: '100%' }}>
              {loading ? (
                <span>
                  Analyzing... <br />
                  <small style={{ fontWeight: 'normal', fontSize: '0.8em' }}>
                    (Running local 30B model. This can take 1-3 minutes...)
                  </small>
                </span>
              ) : 'Analyze Match'}
            </button>
          </div>
        </div>
      )}

      {/* Result View */}
      {view === 'result' && result && (
        <div className="results-grid">
          <div className="glass-panel">
            <h2>Match Score</h2>
            <div className="score-circle" style={{ '--score': result.score }} data-score={result.score}></div>

            <h3>Feedback</h3>
            <ul>
              {result.missing_skills && result.missing_skills.length > 0 && (
                <li><strong>Missing Skills:</strong> {result.missing_skills.join(", ")}</li>
              )}
              {result.matching_skills && result.matching_skills.length > 0 && (
                <li><strong>Matching Skills:</strong> {result.matching_skills.join(", ")}</li>
              )}
            </ul>
            {Array.isArray(result.suggestions) ? (
              <ul>{result.suggestions.map((s, i) => <li key={i}>{s}</li>)}</ul>
            ) : (
              <p>{result.suggestions}</p>
            )}

            <div style={{ marginTop: '2rem' }}>
              <button onClick={handleCustomize} disabled={loading}>
                {loading ? "Thinking..." : "Customize Resume for this Job"}
              </button>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <button onClick={() => { setView('upload'); setResult(null); }} style={{ background: '#333' }}>
                Start Over
              </button>
            </div>
          </div>

          <div className="glass-panel">
            <h2>Raw Analysis Data</h2>
            <pre style={{ overflow: 'auto', maxHeight: '400px', textAlign: 'left' }}>
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Diff View */}
      {view === 'diff' && customizationData && (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <button onClick={() => setView('result')} style={{ background: '#333' }}>Back to Analysis</button>
            <h2>Review & Finalize</h2>
          </div>

          <DiffViewer
            original={customizationData.original}
            customized={customizationData.customized}
            onComplete={handleDownloadPdf}
          />
        </div>
      )}
    </div>
  )
}

export default App
