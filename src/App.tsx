import { useMemo, useState } from 'react'
import EmployerDashboard from './EmployerDashboard'

type StateName = 'Bihar' | 'Jharkhand'
type Category = { name: string; icon: string; count: string }

const districts: Record<StateName, string[]> = {
  Bihar: [
    'सभी जिले', 'अररिया', 'अरवल', 'औरंगाबाद', 'बांका', 'बेगूसराय', 'भागलपुर',
    'भोजपुर', 'बक्सर', 'दरभंगा', 'पूर्वी चंपारण', 'गया', 'गोपालगंज', 'जमुई',
    'जहानाबाद', 'कैमूर', 'कटिहार', 'खगड़िया', 'किशनगंज', 'लखीसराय', 'मधेपुरा',
    'मधुबनी', 'मुंगेर', 'मुजफ्फरपुर', 'नालंदा', 'नवादा', 'पटना', 'पूर्णिया',
    'रोहतास', 'सहरसा', 'समस्तीपुर', 'सारण', 'शेखपुरा', 'शिवहर', 'सीतामढ़ी',
    'सीवान', 'सुपौल', 'वैशाली', 'पश्चिमी चंपारण'
  ],
  Jharkhand: [
    'सभी जिले', 'बोकारो', 'चतरा', 'देवघर', 'धनबाद', 'दुमका', 'पूर्वी सिंहभूम',
    'गढ़वा', 'गिरिडीह', 'गोड्डा', 'गुमला', 'हजारीबाग', 'जामताड़ा', 'खूंटी',
    'कोडरमा', 'लातेहार', 'लोहरदगा', 'पाकुड़', 'पलामू', 'रामगढ़', 'रांची',
    'साहिबगंज', 'सरायकेला-खरसावां', 'सिमडेगा', 'पश्चिमी सिंहभूम'
  ],
}

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

const demoJobs = [
  { title: 'दुकान में सेल्स हेल्पर', company: 'डेमो किराना स्टोर', place: 'मधुबनी', pay: '₹8,000–₹10,000 / माह', type: 'फुल टाइम', category: 'दुकान और रिटेल' },
  { title: 'रेस्टोरेंट में किचन हेल्पर', company: 'डेमो फूड कॉर्नर', place: 'दरभंगा', pay: '₹9,000–₹12,000 / माह', type: 'फुल टाइम', category: 'होटल और रेस्टोरेंट' },
  { title: 'डिलीवरी पार्टनर', company: 'डेमो लोकल सर्विस', place: 'पटना', pay: 'काम के अनुसार', type: 'पार्ट टाइम', category: 'ड्राइवर और डिलीवरी' },
]

function App() {
  const [stateName, setStateName] = useState<StateName>('Bihar')
  const [district, setDistrict] = useState('मधुबनी')
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [activeTab, setActiveTab] = useState('होम')
  const [showDemo, setShowDemo] = useState(false)
  const [showEmployer, setShowEmployer] = useState(false)

  const visibleJobs = useMemo(() => demoJobs.filter((job) => {
    const matchesQuery = !query || `${job.title} ${job.company} ${job.place} ${job.category}`.toLowerCase().includes(query.toLowerCase())
    const matchesCategory = !selectedCategory || job.category === selectedCategory
    return matchesQuery && matchesCategory
  }), [query, selectedCategory])

  if (showEmployer) return <EmployerDashboard onBack={() => setShowEmployer(false)} />

  function changeState(next: StateName) {
    setStateName(next)
    setDistrict('सभी जिले')
  }

  function searchJobs() {
    setShowDemo(true)
    setActiveTab('खोज')
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="SABKAAM होम">
          <span className="brand-mark">स</span>
          <span><strong>SABKAAM</strong><small>हर काम, हर इंसान के लिए।</small></span>
        </a>
        <button className="employer-link" onClick={() => setShowEmployer(true)}>नौकरी देने वाले? <span>यहाँ जाएँ ↗</span></button>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow"><span className="live-dot" /> बिहार और झारखंड से शुरुआत</span>
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
            <label className="select-field"><span>राज्य</span><select value={stateName} onChange={(event) => changeState(event.target.value as StateName)}><option value="Bihar">बिहार</option><option value="Jharkhand">झारखंड</option></select></label>
            <label className="select-field"><span>जिला</span><select value={district} onChange={(event) => setDistrict(event.target.value)}>{districts[stateName].map((item) => <option key={item}>{item}</option>)}</select></label>
            <button className="search-button" onClick={searchJobs}>काम खोजें <span>→</span></button>
          </div>
          <div className="search-foot"><span>⌖ {stateName === 'Bihar' ? 'बिहार' : 'झारखंड'} में अवसर खोजें</span><button onClick={() => alert('Voice search सुविधा आगे जोड़ी जाएगी।')}>🎙️ बोलकर खोजें <small>जल्द आ रहा है</small></button></div>
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
          <div className="section-heading"><div><span className="section-kicker">उदाहरण के लिए</span><h2>काम के नमूने</h2></div><span className="demo-label">डेमो डेटा · असली नौकरी नहीं</span></div>
          {visibleJobs.length ? <div className="job-list">{visibleJobs.map((job) => <article className="job-card" key={job.title}><div><span className="job-type">{job.type}</span><h3>{job.title}</h3><p>{job.company} · 📍 {job.place}</p></div><div className="job-pay">{job.pay}<small>वेतन का डेमो उदाहरण</small></div></article>)}</div> : <p className="empty-state">इस फ़िल्टर के लिए अभी कोई डेमो उदाहरण नहीं है। फ़िल्टर बदलकर देखें।</p>}
          <p className="demo-note">ये केवल स्क्रीन समझाने के लिए काल्पनिक उदाहरण हैं। SABKAAM पर अभी वास्तविक नौकरी की लिस्टिंग उपलब्ध नहीं है।</p>
        </section>}

        <section className="trust-strip"><span className="trust-icon">✓</span><div><strong>सही जानकारी, सुरक्षित शुरुआत</strong><p>हमारा लक्ष्य है कि हर नौकरी में वेतन, समय और जगह की जानकारी साफ़ दिखाई दे।</p></div><span className="trust-side">SABKAAM <b>01</b></span></section>
      </main>

      <nav className="bottom-nav" aria-label="मुख्य नेविगेशन">
        {['होम', 'मेरे आवेदन', 'सूचनाएँ', 'प्रोफ़ाइल'].map((tab, index) => <button key={tab} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}><span>{['⌂', '▤', '♧', '◉'][index]}</span>{tab}</button>)}
      </nav>
      <footer><span>© SABKAAM · Jobs, Work & Opportunities</span><span>बिहार + झारखंड · शुरुआती संस्करण</span></footer>
    </div>
  )
}

export default App