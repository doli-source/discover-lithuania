import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

type Mode = 'default' | 'magic' | 'password' | 'magic_sent'

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" fillRule="evenodd">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </g>
  </svg>
)

export default function Login() {
  const { signIn, signInWithGoogle, signInWithMagicLink } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('default')
  const [email, setEmail] = useState('dolishimoni@gmail.com')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function reset() { setMode('default'); setError(null) }

  async function handleGoogle() {
    setLoading(true); setError(null)
    const { error } = await signInWithGoogle()
    if (error) { setError(error); setLoading(false) }
    // on success the browser redirects to Google — loading stays true
  }

  async function handleMagicLink(e: FormEvent) {
    e.preventDefault(); setLoading(true); setError(null)
    const { error } = await signInWithMagicLink(email)
    setLoading(false)
    if (error) { setError(error); return }
    setMode('magic_sent')
  }

  async function handlePassword(e: FormEvent) {
    e.preventDefault(); setLoading(true); setError(null)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) { setError(error); return }
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🇱🇹</div>
          <h1 className="text-white text-2xl font-bold">Lithuania Discovery</h1>
          <p className="text-gray-400 text-sm mt-1">Admin Panel</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6">
          {mode === 'magic_sent' ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-3">📬</div>
              <p className="font-semibold text-gray-900">Check your inbox</p>
              <p className="text-sm text-gray-500 mt-1">
                We sent a sign-in link to <strong>{email}</strong>
              </p>
              <button onClick={reset} className="mt-5 text-sm text-amber-700 hover:underline">
                ← Back to sign in
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Google OAuth */}
              <button
                onClick={handleGoogle}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-2.5 px-4 text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <GoogleIcon />
                {loading && mode === 'default' ? 'Redirecting…' : 'Sign in with Google'}
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-400">or</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              {/* Magic Link form */}
              {mode === 'magic' ? (
                <form onSubmit={handleMagicLink} className="space-y-3">
                  <div>
                    <label className="label">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="input"
                      required
                      autoFocus
                    />
                  </div>
                  {error && (
                    <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                      {error}
                    </div>
                  )}
                  <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
                    {loading ? 'Sending…' : 'Send Magic Link'}
                  </button>
                  <button type="button" onClick={reset} className="w-full text-center text-sm text-gray-400 hover:text-gray-600">
                    Cancel
                  </button>
                </form>

              ) : mode === 'password' ? (
                /* Password form */
                <form onSubmit={handlePassword} className="space-y-3">
                  <div>
                    <label className="label">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="input"
                      required
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="label">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="input"
                      required
                      placeholder="••••••••"
                    />
                  </div>
                  {error && (
                    <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                      {error}
                    </div>
                  )}
                  <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
                    {loading ? 'Signing in…' : 'Sign in'}
                  </button>
                  <button type="button" onClick={reset} className="w-full text-center text-sm text-gray-400 hover:text-gray-600">
                    Cancel
                  </button>
                </form>

              ) : (
                /* Default: two secondary options */
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setMode('magic')}
                    className="w-full border border-amber-500 text-amber-700 rounded-xl py-2.5 px-4 font-medium hover:bg-amber-50 transition-colors"
                  >
                    Send Magic Link
                  </button>
                  <button
                    onClick={() => setMode('password')}
                    className="w-full text-center text-xs text-gray-400 hover:text-gray-600 py-1"
                  >
                    Sign in with password
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
