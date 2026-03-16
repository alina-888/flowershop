import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ username: '', password: '', password2: '' })
  const [error, setError] = useState('')

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const data = await api.register(form)
      login(data)
      navigate('/')
    } catch (err) {
      setError(err.error || 'Greska pri registraciji.')
    }
  }

  return (
    <div className="page">
      <div className="auth-card card">
        <div className="card-body" style={{ padding: 28 }}>
          <h2 style={{ fontWeight: 600, textAlign: 'center', marginBottom: 24 }}>Registracija</h2>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Korisnicko ime</label>
              <input className="form-input" name="username" value={form.username} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Lozinka</label>
              <input className="form-input" type="password" name="password" value={form.password} onChange={handleChange} required />
              <span className="form-hint">Minimum 8 karaktera</span>
            </div>
            <div className="form-group">
              <label className="form-label">Ponovite lozinku</label>
              <input className="form-input" type="password" name="password2" value={form.password2} onChange={handleChange} required />
            </div>
            <button type="submit" className="btn btn-accent" style={{ width: '100%', marginTop: 8 }}>Registruj se</button>
          </form>
          <p className="muted small" style={{ textAlign: 'center', marginTop: 16 }}>
            Vec imate nalog? <Link to="/login" style={{ color: 'var(--accent)' }}>Prijavite se</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
