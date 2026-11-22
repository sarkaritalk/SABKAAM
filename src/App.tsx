import { useEffect, useMemo, useState } from 'react'
import './job-apply.css'
import CandidateArea from './CandidateArea'
import SafetyCenter from './safety-center'
import EmployerDashboard from './EmployerDashboard'
import AuthPanel from './AuthPanel'
import { LanguageSelect, Localized, type Language } from './i18n'

import { stateNames, getStateLabel, getDistrictOptions, getStateCode, getDistrictCode, type StateName } from './locations'
import { backendConfigured, listPublishedJobs, readAuthSession, clearAuthSession, submitApplication, type AuthSession, type PublishedJob } from './lib/backend'

type Category = { name: string; icon: string; count: string }
type JobListing = { id?: string; title: string; state: string; district?: string; company: string; place: string; pay: string; type: string; category: string; description?: string; isDemo?: boolean }
type SpeechRecognitionLike = { lang: string; interimResults: boolean; maxAlternatives: number; onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null; onerror: (() => void) | null; onend: (() => void) | null; start: () => void }

const categories: Category[] = [
  { name: 'दुकान और रिटेल', icon: '🛍️', count: 'दुकान, सेल्स, काउंटर' },
  { name: 'होटल और रेस्टोरेंट', icon: '🍽️', count: 'कुक, वेटर, हेल्पर' },
  { name: 'अस्पताल और क्लिनिक', icon: '🏥', count: 'स्टाफ, अटेंडेंट' },
  { name: 'फैक्ट्री और गोदाम', icon: '🏭', count: 'पैकिंग, मशीन, लोडिंग' },
  { name: 'ड्राइवर और डिलीवरी', icon: '🚚', count: 'ड्राइवर, डिलीवरी' },
  { name: 'ऑफिस और कंपनी', icon: '💼', count: 'ऑफिस, कंप्यूटर, अकाउंट' },
  { name: 'टेक्निकल काम', icon: '🛠️', count: 'इलेक्ट्रीशियन, रिपेयर' },
  { name: 'खेती और मजदूरी', icon: '🌾', count: 'खेती, दैनिक काम' },
  { name: 'घर और घरेलू काम', icon: '🏠', count: 'हाउसकीपिंग, देखभाल' },
  { name: 'निर्माण और सिक्योरिटी', icon: '🦺', count: 'निर्माण, सुरक्षा' },
  { name: 'शिक्षा और ट्रेनिंग', icon: '📚', count: 'टीचर, ट्यूटर' },
  { name: 'ऑनलाइन और फ्रीलांस', icon: '💻', count: 'रिमोट, ऑनलाइन काम' },
]

const demoJobs: JobListing[] = [
  { title: 'दुकान में सेल्स हेल्पर', state: 'Bihar', company: 'डेमो किराना स्टोर', place: 'मधुबनी', pay: '₹8,000–₹10,000 / माह', type: 'फुल टाइम', category: 'दुकान और रिटेल' },
  { title: 'रेस्टोरेंट में किचन हेल्पर', state: 'Bihar', company: 'डेमो फूड कॉर्नर', place: 'दरभंगा', pay: '₹9,000–₹12,000 / माह', type: 'फुल टाइम', category: 'होटल और रेस्टोरेंट' },
  { title: 'डिलीवरी पार्टनर', state: 'Bihar', company: 'डेमो लोकल सर्विस', place: 'पटना', pay: 'काम के अनुसार', type: 'पार्ट टाइम', category: 'ड्राइवर और डिलीवरी' },
]

function App() {
  const [session, setSession] = useState<AuthSession | null>(() => readAuthSession())
  const [showAuth, setShowAuth] = useState(false)
  const [liveApplyBusy, setLiveApplyBusy] = useState(false)
  const [liveApplyMessage, setLiveApplyMessage] = useState('')
  const [language, setLanguage] = useState<Language>(() => { const saved = localStorage.getItem('sabkaam-language'); return saved === 'en' || saved === 'hinglish' ? saved : 'hi' })
  const [stateName, setStateName] = useState<StateName>('Bihar')
  const [district, setDistrict] = useState('सभी जिले')
  const [voiceStatus, setVoiceStatus] = useState<'idle' | 'listening' | 'unsupported' | 'error'>('idle')
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [activeTab, setActiveTab] = useState('होम')
  const [showDemo, setShowDemo] = useState(false)
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null)
  const [liveJobs, setLiveJobs] = useState<JobListing[]>([])
  const [jobsLoading, setJobsLoading] = useState(false)
  const [jobsError, setJobsError] = useState('')
  const [applicationSent, setApplicationSent] = useState(false)
  const [showSafety, setShowSafety] = useState(false)
  const [showEmployer, setShowEmployer] = useState(false)

  const visibleJobs = useMemo(() => (backendConfigured ? liveJobs : demoJobs).filter((job) => {
    const matchesQuery = !query || `${job.title} ${job.company} ${job.place} ${job.category}`.toLowerCase().includes(query.toLowerCase())
    const matchesCategory = !selectedCategory || job.category === selectedCategory
    const matchesState = job.state === stateName
    const matchesLocation = district === 'सभी जिले' || (job.district || job.place) === district
    return matchesQuery && matchesCategory && matchesState && matchesLocation
  }), [query, selectedCategory, stateName, district, liveJobs])

  useEffect(() => {
    if (!backendConfigured) { setLiveJobs([]); return }
    let cancelled = false
    setJobsLoading(true)
    setJobsError('')
    listPublishedJobs({ stateLgdCode: getStateCode(stateName), districtLgdCode: district === 'सभी जिले' ? undefined : getDistrictCode(stateName, district, language) })
      .then((rows: PublishedJob[]) => {
        if (cancelled) return
        setLiveJobs(rows.map((job) => {
          const number = new Intl.NumberFormat('en-IN')
          const salary = job.salary_min != null && job.salary_max != null ? '₹' + number.format(job.salary_min) + '–₹' + number.format(job.salary_max) + (job.salary_period ? ' / ' + job.salary_period : '') : job.salary_max != null ? 'Up to ₹' + number.format(job.salary_max) : 'वेतन विवरण उपलब्ध नहीं'
          const workTypes: Record<string, string> = { full_time: 'फुल टाइम', part_time: 'पार्ट टाइम', daily_wage: 'दैनिक मजदूरी', contract: 'कॉन्ट्रैक्ट', work_from_home: 'वर्क फ्रॉम होम', freelance: 'फ्रीलांस', internship: 'इंटर्नशिप' }
          return { id: job.id, title: job.title, state: stateName, district: job.district, company: 'नियोक्ता विवरण', place: job.town_or_market || job.district, pay: salary, type: workTypes[job.work_type] || job.work_type, category: job.category, description: job.description, isDemo: false }
        }))
      })
      .catch((error: unknown) => { if (!cancelled) setJobsError(error instanceof Error ? error.message : 'Jobs could not be loaded') })
      .finally(() => { if (!cancelled) setJobsLoading(false) })
    return () => { cancelled = true }
  }, [stateName, district, language])

  function changeLanguage(next: Language) { setLanguage(next); localStorage.setItem('sabkaam-language', next) }

  if (showEmployer) return <><EmployerDashboard onBack={() => setShowEmployer(false)} language={language} onLanguageChange={changeLanguage} session={session} onSignIn={() => setShowAuth(true)} onSignOut={() => { clearAuthSession(); setSession(null) }} />{showAuth && <AuthPanel language={language} onClose={() => setShowAuth(false)} onSuccess={(nextSession) => { setSession(nextSession); setShowAuth(false) }} />}</>


  function startVoiceSearch() {
    const speechWindow = window as Window & { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike }
    const SpeechRecognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition
    if (!SpeechRecognition) { setVoiceStatus('unsupported'); return }
    const recognition = new SpeechRecognition()
    recognition.lang = language === 'en' ? 'en-IN' : 'hi-IN'
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript ?? ''
      if (transcript) { setQuery(transcript); setShowDemo(true); setVoiceStatus('idle') }
    }
    recognition.onerror = () => setVoiceStatus('error')
    recognition.onend = () => setVoiceStatus((current) => current === 'listening' ? 'idle' : current)
    setVoiceStatus('listening')
    try { recognition.start() } catch { setVoiceStatus('error') }
  }

  function changeState(next: StateName) {
    setStateName(next)
    setDistrict('सभी जिले')
  }

  function searchJobs() {
    setShowDemo(true)
    setActiveTab('होम')
  }

  return (
    <Localized language={language}><div className="app-shell" data-active-tab={activeTab} data-safety-open={showSafety}>
      <header className="topbar">
        <a className="brand" href="#" aria-label="SABKAAM होम">
          <span className="brand-mark">स</span>
          <span><strong>SABKAAM</strong><small>हर काम, हर इंसान के लिए।</small></span>
        </a>
        <div className="topbar-actions">{session ? <button className="account-link" onClick={() => { clearAuthSession(); setSession(null) }}>लॉगआउट</button> : <button className="account-link" onClick={() => setShowAuth(true)}>लॉगिन</button>}<LanguageSelect language={language} onChange={changeLanguage} /><button className="safety-link" onClick={() => setShowSafety(!showSafety)}>{showSafety ? '← वापस' : '🛡️ सुरक्षा और शिकायत'}</button><button className="employer-link" onClick={() => setShowEmployer(true)}>नौकरी देने वाले? <span>यहाँ जाएँ ↗</span></button></div>
      </header>

      <main>{showSafety && <SafetyCenter language={language} />}
        {(activeTab === 'मेरे आवेदन' || activeTab === 'सूचनाएँ' || activeTab === 'प्रोफ़ाइल') && <CandidateArea mode={activeTab} language={language} />}
        {activeTab === 'होम' && <>
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow"><span className="live-dot" /> पूरे भारत में काम के अवसर</span>
            <h1>काम की तलाश अब<br /><em>आसान होगी।</em></h1>
            <p>अपने आसपास नौकरी, रोज़गार और काम के मौके खोजें। छोटी दुकान से लेकर बड़ी कंपनी तक — सब एक जगह।</p>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" />
            <div className="art-card"><span>✦</span><strong>आपका अगला<br />मौका यहीं है</strong><small>काम खोजें · आगे बढ़ें</small></div>
            <div className="art-bubble bubble-one">💼</div><div className="art-bubble bubble-two">📍</div>
          </div>
        </section>

        <section className="search-panel" aria-label="काम खोजें">
          <div className="search-heading"><div><span className="section-kicker">अपना अगला काम खोजें</span><h2>आप क्या काम ढूँढ रहे हैं?</h2></div><span className="search-step">01 <i>/</i> 03</span></div>
          <div className="search-controls">
            <label className="query-field"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="काम, पद या दुकान का नाम लिखें..." /></label>
            <label className="select-field"><span>राज्य</span><select value={stateName} onChange={(event) => changeState(event.target.value as StateName)}>{stateNames.map((state) => <option key={state} value={state}>{getStateLabel(state, language)}</option>)}</select></label>
            <label className="select-field"><span>जिला</span><select value={district} onChange={(event) => setDistrict(event.target.value)}><option value="सभी जिले">सभी जिले</option>{getDistrictOptions(stateName, language).map((item) => <option key={item}>{item}</option>)}</select></label>
            <button className="search-button" onClick={searchJobs}>काम खोजें <span>→</span></button>
          </div>
          <div className="search-foot"><span>⌖ {getStateLabel(stateName)} में अवसर खोजें</span><button onClick={startVoiceSearch} disabled={voiceStatus === 'listening'}>🎙️ {voiceStatus === 'listening' ? 'सुन रहा हूँ...' : 'बोलकर खोजें'} <small>{voiceStatus === 'unsupported' ? 'इस ब्राउज़र में उपलब्ध नहीं' : voiceStatus === 'error' ? 'माइक अनुमति जाँचें' : voiceStatus === 'listening' ? 'बोलिए' : 'हिंदी / English'}</small></button></div>
        </section>

        <section className="categories-section">
          <div className="section-heading"><div><span className="section-kicker">हर तरह के काम</span><h2>आप किस क्षेत्र में काम चाहते हैं?</h2></div><button className="text-link" onClick={() => { setSelectedCategory(''); setShowDemo(true); }}>सभी श्रेणियाँ <span>→</span></button></div>
          <div className="category-grid">
            {categories.map((category, index) => (
              <button className={`category-card ${selectedCategory === category.name ? 'selected' : ''}`} key={category.name} onClick={() => { setSelectedCategory(selectedCategory === category.name ? '' : category.name); setShowDemo(true); }} aria-pressed={selectedCategory === category.name}>
                <span className={`category-icon tone-${index % 4}`}>{category.icon}</span><strong>{category.name}</strong><small>{category.count}</small><span className="card-arrow">↗</span>
              </button>
            ))}
          </div>
        </section>

        {showDemo && <section className="jobs-section">
          <div className="section-heading"><div><span className="section-kicker">{backendConfigured ? "Live listings" : "उदाहरण के लिए"}</span><h2>{backendConfigured ? "उपलब्ध नौकरियाँ" : "काम के नमूने"}</h2></div><span className="demo-label">{backendConfigured ? "प्रकाशित नौकरी" : "डेमो डेटा · असली नौकरी नहीं"}</span></div>
          {jobsLoading && <p className="empty-state">नौकरियाँ लोड हो रही हैं...</p>}{jobsError && <p className="empty-state">नौकरी लोड नहीं हुई: {jobsError}</p>}{visibleJobs.length ? <div className="job-list">{visibleJobs.map((job) => <article className="job-card" key={job.title} onClick={() => { setSelectedJob(job); setApplicationSent(false) }}><div><span className="job-type">{job.type}</span><h3>{job.title}</h3><p>{job.company} · 📍 {job.place}</p></div><div className="job-pay">{job.pay}<small>वेतन का डेमो उदाहरण</small><button type="button" className="job-detail-button">विवरण देखें →</button></div></article>)}</div> : <p className="empty-state">इस फ़िल्टर के लिए अभी कोई डेमो उदाहरण नहीं है। फ़िल्टर बदलकर देखें।</p>}
          {!backendConfigured && <p className="demo-note">ये केवल स्क्रीन समझाने के लिए काल्पनिक उदाहरण हैं। SABKAAM पर अभी वास्तविक नौकरी की लिस्टिंग उपलब्ध नहीं है।</p>}
        </section>}

        {selectedJob && <div className="apply-overlay" role="presentation" onClick={() => setSelectedJob(null)}>
          <section className="apply-modal" role="dialog" aria-modal="true" aria-labelledby="apply-title" onClick={event => event.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedJob(null)} aria-label="बंद करें">×</button>
            <span className="section-kicker">नौकरी का विवरण · डेमो</span>
            <h2 id="apply-title">{selectedJob.title}</h2>
            <p className="modal-company">{selectedJob.company} · {selectedJob.place}</p>
            <div className="modal-facts"><span>वेतन <b>{selectedJob.pay}</b></span><span>काम <b>{selectedJob.type}</b></span><span>श्रेणी <b>{selectedJob.category}</b></span></div>
            <p className="modal-disclaimer">यह एक काल्पनिक उदाहरण है, वास्तविक नौकरी या नियोक्ता नहीं। यहाँ आवेदन भेजने से किसी कंपनी को जानकारी नहीं जाएगी।</p>
            {selectedJob.isDemo === false ? (session && selectedJob.id ? <form className="apply-form" onSubmit={async event => {
              event.preventDefault()
              const form = new FormData(event.currentTarget)
              setLiveApplyBusy(true)
              setLiveApplyMessage('')
              try {
                await submitApplication(session.access_token, { job_id: selectedJob.id, candidate_id: session.user.id, full_name: String(form.get('full_name') || ''), phone: String(form.get('phone') || ''), message: String(form.get('message') || '') })
                setLiveApplyMessage('आपका आवेदन सफलतापूर्वक भेजा गया।')
              } catch (error) {
                setLiveApplyMessage(error instanceof Error ? error.message : 'आवेदन नहीं भेजा जा सका।')
              } finally { setLiveApplyBusy(false) }
            }}>
              <h3>इस नौकरी के लिए आवेदन करें</h3>
              <label>आपका नाम *<input required name="full_name" defaultValue={session.user.email || ''} /></label>
              <label>मोबाइल नंबर *<input required name="phone" type="tel" inputMode="numeric" pattern="[0-9]{10}" maxLength={10} placeholder="10 अंकों का नंबर" /></label>
              <label>संदेश (वैकल्पिक)<textarea name="message" rows={3} placeholder="अपने अनुभव के बारे में लिखें" /></label>
              {liveApplyMessage && <p role="status">{liveApplyMessage}</p>}
              <button type="submit" disabled={liveApplyBusy}>{liveApplyBusy ? 'भेजा जा रहा है...' : 'आवेदन भेजें →'}</button>
            </form> : <div className="application-confirm"><strong>लॉगिन जरूरी है।</strong><p>वास्तविक नौकरी में आवेदन करने के लिए पहले उम्मीदवार खाते से लॉगिन करें।</p><button type="button" onClick={() => setShowAuth(true)}>लॉगिन करें</button></div>) : applicationSent ? <div className="application-confirm"><strong>डेमो आवेदन तैयार हुआ।</strong><p>आपका विवरण केवल इस स्क्रीन पर दिखाया गया है; कहीं सेव या भेजा नहीं गया।</p></div> : <form className="apply-form" onSubmit={event => { event.preventDefault(); setApplicationSent(true) }}>
              <h3>आवेदन का नमूना</h3>
              <label>आपका नाम *<input required placeholder="पूरा नाम" /></label>
              <label>मोबाइल नंबर *<input required type="tel" inputMode="numeric" pattern="[0-9]{10}" maxLength={10} placeholder="10 अंकों का नंबर" /></label>
              <label>आपके बारे में (वैकल्पिक)<textarea rows={3} placeholder="अनुभव या काम की जानकारी लिखें" /></label>
              <button type="submit">डेमो आवेदन देखें →</button>
            </form>}
          </section>
        </div>}
        <section className="trust-strip"><span className="trust-icon">✓</span><div><strong>सही जानकारी, सुरक्षित शुरुआत</strong><p>हमारा लक्ष्य है कि हर नौकरी में वेतन, समय और जगह की जानकारी साफ़ दिखाई दे।</p></div><span className="trust-side">SABKAAM <b>01</b></span></section>
        </>}
      </main>

      {showAuth && <AuthPanel language={language} onClose={() => setShowAuth(false)} onSuccess={(nextSession) => { setSession(nextSession); setShowAuth(false) }} />}
      <nav className="bottom-nav" aria-label="मुख्य नेविगेशन">
        {['होम', 'मेरे आवेदन', 'सूचनाएँ', 'प्रोफ़ाइल'].map((tab, index) => <button key={tab} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}><span>{['⌂', '▤', '♧', '◉'][index]}</span>{tab}</button>)}
      </nav>
      <footer><span>© SABKAAM · Jobs, Work & Opportunities</span><span>भारत · शुरुआती संस्करण</span></footer>
    </div></Localized>
  )
}

export default App