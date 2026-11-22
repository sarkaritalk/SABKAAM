import { useCallback, useEffect, useState } from 'react'
import './admin-dashboard.css'
import { LanguageSelect, Localized, type Language } from './i18n'
import { getOpenReports, getPendingJobs, getPendingVerifications, reviewJob, reviewReport, reviewVerification, type AuthSession, type OpenReport, type ReviewJob, type ReviewRequest } from './lib/backend'

type Props = { session: AuthSession; language: Language; onBack: () => void; onLanguageChange: (language: Language) => void }

export default function AdminDashboard({ session, language, onBack, onLanguageChange }: Props) {
  const [jobs, setJobs] = useState<ReviewJob[]>([])
  const [verifications, setVerifications] = useState<ReviewRequest[]>([])
  const [reports, setReports] = useState<OpenReport[]>([])
  const [tab, setTab] = useState<'jobs' | 'verifications' | 'reports'>('jobs')
  const [busyId, setBusyId] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    setError('')
    try {
      const [jobRows, verificationRows, reportRows] = await Promise.all([
        getPendingJobs(session.access_token),
        getPendingVerifications(session.access_token),
        getOpenReports(session.access_token),
      ])
      setJobs(jobRows)
      setVerifications(verificationRows)
      setReports(reportRows)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Review queues could not be loaded.')
    }
  }, [session.access_token])

  useEffect(() => { void refresh() }, [refresh])

  async function act(id: string, action: () => Promise<unknown>, success: string) {
    setBusyId(id)
    setMessage('')
    setError('')
    try { await action(); setMessage(success); await refresh() }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Action failed.') }
    finally { setBusyId('') }
  }

  return <Localized language={language}>
    <main className="admin-page">
      <header className="admin-header">
        <button type="button" onClick={onBack}>← वापस SABKAAM</button>
        <div><span className="section-kicker">SABKAAM TRUST OPERATIONS</span><h1>समीक्षा और मॉडरेशन</h1></div>
        <div className="admin-header-actions"><LanguageSelect language={language} onChange={onLanguageChange} /><span className="admin-role">Staff access</span></div>
      </header>
      <div className="admin-tabs">
        <button className={tab === 'jobs' ? 'active' : ''} onClick={() => setTab('jobs')}>नौकरी पोस्ट ({jobs.length})</button>
        <button className={tab === 'verifications' ? 'active' : ''} onClick={() => setTab('verifications')}>नियोक्ता सत्यापन ({verifications.length})</button>
        <button className={tab === 'reports' ? 'active' : ''} onClick={() => setTab('reports')}>शिकायतें ({reports.length})</button>
        <button className="refresh-button" onClick={() => void refresh()}>↻ Refresh</button>
      </div>
      {message && <p className="admin-message" role="status">{message}</p>}
      {error && <p className="admin-error" role="alert">{error}</p>}
      {tab === 'jobs' && <section className="admin-list">
        {jobs.length ? jobs.map(job => <article className="admin-card" key={job.id}><div><span className="admin-status">Pending review</span><h2>{job.title}</h2><p>{job.employers?.business_name || 'Employer'} · {job.district}</p><p>{job.description}</p></div><div className="admin-actions"><button disabled={busyId === job.id} onClick={() => void act(job.id, () => reviewJob(session.access_token, job.id, true), 'नौकरी प्रकाशित कर दी गई।')}>Approve & publish</button><button className="danger" disabled={busyId === job.id} onClick={() => void act(job.id, () => reviewJob(session.access_token, job.id, false), 'नौकरी अस्वीकृत कर दी गई।')}>Reject</button></div></article>) : <p className="admin-empty">कोई नौकरी समीक्षा के लिए लंबित नहीं है।</p>}
      </section>}
      {tab === 'verifications' && <section className="admin-list">
        {verifications.length ? verifications.map(item => <article className="admin-card" key={item.id}><div><span className="admin-status">Pending verification</span><h2>{item.business_name}</h2><p>{item.business_type} · {item.district}</p><p>{item.contact_phone || 'No phone'} · {item.address || 'No address'}</p></div><div className="admin-actions"><button disabled={busyId === item.id} onClick={() => void act(item.id, () => reviewVerification(session.access_token, session.user.id, item.id, item.employer_id, true), 'नियोक्ता सत्यापित कर दिया गया।')}>Approve</button><button className="danger" disabled={busyId === item.id} onClick={() => void act(item.id, () => reviewVerification(session.access_token, session.user.id, item.id, item.employer_id, false), 'सत्यापन अनुरोध अस्वीकृत हुआ।')}>Reject</button></div></article>) : <p className="admin-empty">कोई सत्यापन अनुरोध लंबित नहीं है।</p>}
      </section>}
      {tab === 'reports' && <section className="admin-list">
        {reports.length ? reports.map(item => <article className="admin-card" key={item.id}><div><span className="admin-status">Open report</span><h2>{item.reason}</h2><p>{item.details || 'No details provided'}</p><p>{item.contact_phone || 'No callback number'}</p></div><div className="admin-actions"><button disabled={busyId === item.id} onClick={() => void act(item.id, () => reviewReport(session.access_token, item.id, true), 'शिकायत हल के रूप में दर्ज हुई।')}>Resolve</button><button className="danger" disabled={busyId === item.id} onClick={() => void act(item.id, () => reviewReport(session.access_token, item.id, false), 'शिकायत बंद कर दी गई।')}>Dismiss</button></div></article>) : <p className="admin-empty">कोई खुली शिकायत नहीं है।</p>}
      </section>}
      <p className="admin-footnote">हर निर्णय रिकॉर्ड करें और आवश्यकतानुसार समीक्षा नोट्स सुरक्षित रखें। गलत पोस्ट को प्रकाशित न करें।</p>
    </main>
  </Localized>
}
