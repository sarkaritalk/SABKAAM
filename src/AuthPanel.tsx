import { useState, type FormEvent } from 'react'
import './auth-panel.css'
import { Localized, type Language } from './i18n'
import { saveAuthSession, signInWithEmail, signUpWithEmail, type AuthSession } from './lib/backend'

type Props = {
  language: Language
  onClose: () => void
  onSuccess: (session: AuthSession) => void
}

export default function AuthPanel({ language, onClose, onSuccess }: Props) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [accountType, setAccountType] = useState<'candidate' | 'employer'>('candidate')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    setError('')
    try {
      if (mode === 'signin') {
        const session = await signInWithEmail(email, password)
        saveAuthSession(session)
        onSuccess(session)
      } else {
        const result = await signUpWithEmail(email, password, fullName, accountType)
        if ('access_token' in result) {
          saveAuthSession(result)
          onSuccess(result)
        } else {
          setMessage('Signup request received. Check your email to confirm your account, then sign in.')
        }
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Authentication failed. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return <Localized language={language}>
    <div className="auth-overlay" role="presentation" onClick={onClose}>
      <section className="auth-dialog" role="dialog" aria-modal="true" aria-labelledby="auth-title" onClick={event => event.stopPropagation()}>
        <button className="auth-close" type="button" onClick={onClose} aria-label="बंद करें">×</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}><img src={`${import.meta.env.BASE_URL}sabkaam-mark.svg`} alt="" aria-hidden="true" style={{ width: 38, height: 38, objectFit: 'contain', background: '#123B3A', borderRadius: 11, padding: 4, boxSizing: 'border-box' }} /><strong style={{ color: '#123B3A', letterSpacing: 1.2 }}>SABKAAM</strong></div>
        <h2 id="auth-title">{mode === 'signin' ? 'अपने खाते में लॉगिन करें' : 'SABKAAM पर खाता बनाएँ'}</h2>
        <p>ईमेल और पासवर्ड से सुरक्षित रूप से प्रवेश करें। ईमेल पुष्टि आपके Supabase Auth सेटअप पर निर्भर करेगी।</p>
        <form onSubmit={submit}>
          {mode === 'signup' && <>
            <label>आपका पूरा नाम<input required value={fullName} onChange={event => setFullName(event.target.value)} autoComplete="name" /></label>
            <label>खाता किसके लिए है?<select value={accountType} onChange={event => setAccountType(event.target.value as 'candidate' | 'employer')}><option value="candidate">काम खोजने वाला</option><option value="employer">नौकरी देने वाला</option></select></label>
          </>}
          <label>ईमेल पता<input required type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" /></label>
          <label>पासवर्ड<input required type="password" minLength={8} value={password} onChange={event => setPassword(event.target.value)} autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} /></label>
          {error && <p className="auth-error" role="alert">{error}</p>}
          {message && <p className="auth-message" role="status">{message}</p>}
          <button className="auth-submit" type="submit" disabled={busy}>{busy ? 'कृपया प्रतीक्षा करें...' : mode === 'signin' ? 'लॉगिन करें' : 'खाता बनाएँ'}</button>
        </form>
        <button className="auth-switch" type="button" onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setMessage(''); setError('') }}>{mode === 'signin' ? 'नया खाता बनाएँ' : 'पहले से खाता है? लॉगिन करें'}</button>
      </section>
    </div>
  </Localized>
}
