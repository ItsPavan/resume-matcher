import { useState } from 'react'
import './index.css'

function App() {
  const [file, setFile] = useState(null)
  const [jd, setJd] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  const handleAnalyze = async () => {
    if (!file || !jd) return

    setLoading(true)
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
    } catch (error) {
      console.error(error)
      alert("Failed to analyze resume")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-container">
      <h1>Resume Matcher & Optimizer</h1>

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

        <button onClick={handleAnalyze} disabled={loading || !file || !jd} style={{ width: '100%' }}>
          {loading ? 'Analyzing with AI...' : 'Analyze Match'}
        </button>
      </div>

      {result && (
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

            {result.customized_resume && (
              <div style={{ marginTop: '2rem', textAlign: 'left', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                <h3>Preview: Customized Resume</h3>
                <p style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  {result.customized_resume}
                </p>
              </div>
            )}
          </div>

          <div className="glass-panel">
            <h2>Raw Analysis Data</h2>
            <pre style={{ overflow: 'auto', maxHeight: '400px', textAlign: 'left' }}>
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
