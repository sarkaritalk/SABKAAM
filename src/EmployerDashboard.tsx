import { useEffect, useState, type FormEvent } from 'react'
import './employer-dashboard.css'
import { LanguageSelect, Localized, type Language } from './i18n'
import { stateNames, getStateLabel, getDistrictOptions, getStateCode, getDistrictCode, getDistrictEnglishName, type StateName } from './locations'
import { backendConfigured, createEmployer, createJobDraft, getMyEmployer, getEmployerApplications, updateApplicationStatus, submitJobForReview, type AuthSession, type EmployerApplication } from './lib/backend'

type Props = { onBack: () => void; language: Language; onLanguageChange: (language: Language) => void; session: AuthSession | null; onSignIn: () => void; onSignOut: () => void }


export default function EmployerDashboard({ onBack, language, onLanguageChange, session, onSignIn, onSignOut }: Props) {
  const [company, setCompany] = useState('')
  const [contact, setContact] = useState('')
  const [phone, setPhone] = useState('')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('दुकान और रिटेल')
  const [stateName, setStateName] = useState<StateName>('Bihar')
  const [district, setDistrict] = useState('मधुबनी')
  const [townOrMarket, setTownOrMarket] = useState('')
  const [workType, setWorkType] = useState('फुल टाइम')
  const [salary, setSalary] = useState('')
  const [vacancies, setVacancies] = useState('1')
  const [description, setDescription] = useState('')
  const [success, setSuccess] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')
  const [applications, setApplications] = useState<EmployerApplication[]>([])
  const [applicationsError, setApplicationsError] = useState('')
  const [applicationBusy, setApplicationBusy] = useState('')
  const [refreshApplications, setRefreshApplications] = useState(0)
  useEffect(() => { const options = getDistrictOptions(stateName, language); if (!options.includes(district)) setDistrict(options[0] ?? '') }, [stateName, language])

  useEffect(() => { if (!session || session.user.user_metadata?.account_type !== 'employer') { setApplications([]); return } getMyEmployer(session.access_token, session.user.id).then(employer => employer ? getEmployerApplications(session.access_token, employer.id) : []).then(setApplications).catch(error => setApplicationsError(error instanceof Error ? error.message : 'आवेदन लोड नहीं हुए')) }, [session?.access_token, refreshApplications])

  async function changeApplicationStatus(applicationId: string, status: 'viewed' | 'shortlisted' | 'interview' | 'hired' | 'rejected') { setApplicationBusy(applicationId); setApplicationsError(''); try { await updateApplicationStatus(session!.access_token, applicationId, status); setRefreshApplications(value => value + 1) } catch (error) { setApplicationsError(error instanceof Error ? error.message : 'स्थिति अपडेट नहीं हुई') } finally { setApplicationBusy('') } }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSuccess(false)
    setSubmitMessage('')
    if (!backendConfigured) { setSuccess(true); setSubmitMessage('Backend अभी connect नहीं है। यह केवल preview है; जानकारी सेव या प्रकाशित नहीं हुई।'); return }
    if (!session) { setSubmitMessage('पोस्ट भेजने के लिए employer account से लॉगिन करें।'); onSignIn(); return }
    if (session.user.user_metadata?.account_type !== 'employer') { setSubmitMessage('इस खाते का प्रकार candidate है। Employer खाता बनाकर लॉगिन करें।'); return }
    try {
      let employer = await getMyEmployer(session.access_token, session.user.id)
      if (!employer) {
        const created = await createEmployer(session.access_token, { owner_id: session.user.id, business_name: company, business_type: category, contact_person: contact, contact_phone: phone, state_lgd_code: getStateCode(stateName), district_lgd_code: getDistrictCode(stateName, district, language) ?? 0, district: getDistrictEnglishName(stateName, district, language) ?? district })
        employer = created[0]
      }
      if (!employer?.id) throw new Error('Employer profile could not be created.')
      const numbers = salary.replace(/,/g, '').match(/[0-9]+/g)?.map(Number) ?? []
      const workTypes: Record<string, string> = { 'फुल टाइम': 'full_time', 'पार्ट टाइम': 'part_time', 'दैनिक मजदूरी': 'daily_wage', 'वर्क फ्रॉम होम': 'work_from_home', 'कॉन्ट्रैक्ट': 'contract' }
      const draft = await createJobDraft(session.access_token, { employer_id: employer.id, employer_display_name: company, title, category, description: description || title, work_type: workTypes[workType] ?? 'full_time', state_lgd_code: getStateCode(stateName), district_lgd_code: getDistrictCode(stateName, district, language) ?? 0, district: getDistrictEnglishName(stateName, district, language) ?? district, town_or_market: townOrMarket.trim(), locality: townOrMarket.trim(), salary_min: numbers[0], salary_max: numbers[1] ?? numbers[0], salary_period: workType === 'दैनिक मजदूरी' ? 'day' : 'month', vacancies: Number(vacancies) || 1 })
      if (!draft[0]?.id) throw new Error('Job draft could not be created.')
      await submitJobForReview(session.access_token, draft[0].id)
      setSuccess(true)
      setRefreshApplications(value => value + 1)
      setSubmitMessage('नौकरी समीक्षा के लिए भेज दी गई है। स्वीकृति से पहले यह सार्वजनिक नहीं होगी।')
    } catch (error) { setSubmitMessage(error instanceof Error ? error.message : 'नौकरी भेजी नहीं जा सकी।') }
  }

  return (
    <Localized language={language}><div className="employer-page">
      <header className="employer-header">
        <button className="back-button" onClick={onBack}>← वापस होम पर</button>
        <div className="employer-brand"><span>स</span><strong>SABKAAM <small>EMPLOYER DESK</small></strong></div>
        <LanguageSelect language={language} onChange={onLanguageChange} />{session ? <button className="back-button" onClick={onSignOut}>लॉगआउट</button> : backendConfigured ? <button className="back-button" onClick={onSignIn}>लॉगिन</button> : <span className="preview-pill">Preview mode</span>}<span className="preview-pill">प्रारंभिक संस्करण</span>
      </header>
      <main className="employer-main">
        <section className="employer-welcome">
          <div><span className="employer-kicker">नियोक्ता डैशबोर्ड</span><h1>अपनी टीम के लिए<br /><em>सही लोग खोजें।</em></h1><p>{backendConfigured ? 'खाली पद की जानकारी भरें। पोस्ट समीक्षा के लिए जाएगी और स्वीकृति के बाद ही प्रकाशित होगी।' : 'अपने यहाँ खाली पद की जानकारी भरें। यह फॉर्म अभी preview mode में है; नौकरी ऑनलाइन प्रकाशित नहीं होगी।'}</p></div>
          <div className="employer-stat"><span>✦</span><strong>आसान भर्ती</strong><small>स्थानीय लोगों तक पहुँचने का लक्ष्य</small></div>
        </section>
        <div className="employer-layout">
          <form className="job-form" onSubmit={submit}>
            <div className="form-heading"><div><span className="employer-kicker">नया अवसर</span><h2>नौकरी की जानकारी भरें</h2></div><span className="required-note">* जरूरी जानकारी</span></div>
            <div className="form-section-title"><b>01</b><span>आपकी दुकान / कंपनी</span></div>
            <div className="form-grid">
              <label>दुकान / कंपनी का नाम *<input required value={company} onChange={e => setCompany(e.target.value)} placeholder="जैसे: अपना बिजनेस नाम" /></label>
              <label>संपर्क व्यक्ति का नाम *<input required value={contact} onChange={e => setContact(e.target.value)} placeholder="आपका नाम" /></label>
              <label className="full-field">मोबाइल नंबर *<input required type="tel" inputMode="numeric" pattern="[0-9]{10}" maxLength={10} value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="10 अंकों का मोबाइल नंबर" /><small>यह नंबर उम्मीदवार आपसे संपर्क करने के लिए देख सकेंगे (लाइव संस्करण में)।</small></label>
            </div>
            <div className="form-section-title"><b>02</b><span>खाली पद की जानकारी</span></div>
            <div className="form-grid">
              <label className="full-field">काम / पद का नाम *<input required value={title} onChange={e => setTitle(e.target.value)} placeholder="जैसे: सेल्समैन, ड्राइवर, कुक, हेल्पर" /></label>
              <label>काम की श्रेणी<select value={category} onChange={e => setCategory(e.target.value)}>{['दुकान और रिटेल','होटल और रेस्टोरेंट','अस्पताल और क्लिनिक','फैक्ट्री और गोदाम','ड्राइवर और डिलीवरी','ऑफिस और कंपनी','टेक्निकल काम','खेती और मजदूरी','घर और घरेलू काम','निर्माण और सिक्योरिटी','शिक्षा और ट्रेनिंग','ऑनलाइन और फ्रीलांस'].map(x => <option key={x}>{x}</option>)}</select></label>
              <label>काम का प्रकार<select value={workType} onChange={e => setWorkType(e.target.value)}>{['फुल टाइम','पार्ट टाइम','दैनिक मजदूरी','वर्क फ्रॉम होम','कॉन्ट्रैक्ट'].map(x => <option key={x}>{x}</option>)}</select></label>
              <label>राज्य<select value={stateName} onChange={e => { const nextState = e.target.value as StateName; setStateName(nextState); setDistrict(getDistrictOptions(nextState, language)[0] ?? '') }}>{stateNames.map(state => <option key={state} value={state}>{getStateLabel(state, language)}</option>)}</select></label>
              <label>जिला<select value={district} onChange={e => setDistrict(e.target.value)}>{getDistrictOptions(stateName, language).map(x => <option key={x}>{x}</option>)}</select></label>
              <label className="full-field">शहर / इलाका / सेक्टर / गली / मेट्रो / PIN *<input required value={townOrMarket} onChange={e => setTownOrMarket(e.target.value)} placeholder="जैसे: द्वारका सेक्टर 12, उत्तम नगर, लेबर चौक, MIDC या गाँव का नाम" /><small>सही इलाका लिखें ताकि उम्मीदवार उसी जगह की नौकरी खोज सकें।</small></label>
              <label>मासिक वेतन / मजदूरी<input value={salary} onChange={e => setSalary(e.target.value)} placeholder="जैसे: ₹8,000–10,000" /></label>
              <label>कुल पद<input type="number" min="1" max="500" value={vacancies} onChange={e => setVacancies(e.target.value)} /></label>
              <label className="full-field">काम और योग्यता का विवरण<textarea rows={4} value={description} onChange={e => setDescription(e.target.value)} placeholder="काम क्या होगा? अनुभव या योग्यता चाहिए? खाना/रहना मिलेगा? काम के घंटे क्या होंगे?" /></label>
            </div>
            <div className="form-actions"><p>{backendConfigured ? 'पोस्ट पहले समीक्षा कतार में जाएगी। स्वीकृति के बाद ही उम्मीदवार इसे देख पाएँगे।' : 'यह preview mode है। Backend connect होने पर वास्तविक पोस्टिंग शुरू होगी।'}</p><button type="submit">{backendConfigured ? 'नौकरी समीक्षा के लिए भेजें' : 'डेमो पोस्ट का प्रीव्यू देखें'} <span>→</span></button></div>
            {submitMessage && <div className="form-success" role="status"><strong>{submitMessage}</strong></div>}{success && <div className="form-success" role="status"><strong>{backendConfigured ? 'पोस्ट समीक्षा के लिए भेजी गई — अभी प्रकाशित नहीं हुई।' : 'प्रीव्यू तैयार है — अभी प्रकाशित नहीं हुआ।'}</strong><p>{title || 'नया पद'} · {company || 'आपकी कंपनी'} · {district}, {getStateLabel(stateName, language)}</p><small>{backendConfigured ? 'यह जानकारी सुरक्षित रूप से सेव हुई है और समीक्षा के बाद ही प्रकाशित होगी।' : 'यह जानकारी केवल preview में दिखाई गई है; सेव नहीं हुई।'}</small></div>}
          </form>
          <aside className="employer-aside"><div className="aside-card"><span className="aside-icon">✓</span><h3>अच्छी नौकरी पोस्ट कैसी हो?</h3><ul><li>वेतन साफ-साफ लिखें</li><li>काम के घंटे बताएँ</li><li>सही जगह और संपर्क दें</li><li>जरूरी योग्यता ही माँगें</li><li>कोई फीस या सिक्योरिटी जमा न माँगें</li></ul></div><div className="aside-note"><strong>उम्मीदवार का भरोसा जरूरी है</strong><p>SABKAAM पर संदिग्ध पोस्ट की रिपोर्ट और नियोक्ता सत्यापन की सुविधा उपलब्ध है।</p></div></aside>
        </div>
        {session?.user.user_metadata?.account_type === 'employer' && backendConfigured && <section className="employer-applicants">
          <div className="applicants-heading"><div><span className="employer-kicker">CANDIDATE PIPELINE</span><h2>आपके पास आए आवेदन</h2><p>उम्मीदवारों की जानकारी केवल आपके employer खाते में दिखाई जाती है।</p></div><span className="applicant-count">{applications.length} आवेदन</span></div>
          {applicationsError && <p className="applicant-error" role="alert">{applicationsError}</p>}
          {applications.length ? <div className="applicant-list">{applications.map(application => <article className="applicant-card" key={application.id}>
            <div className="applicant-details"><strong>{application.full_name}</strong><span>{application.job_posts?.title || 'आपकी नौकरी'} · {new Date(application.created_at).toLocaleDateString()}</span><a href={`tel:${application.phone}`}>{application.phone}</a>{application.message && <p>{application.message}</p>}<small>Status: {application.status}</small></div>
            <div className="applicant-actions"><button disabled={applicationBusy === application.id} onClick={() => void changeApplicationStatus(application.id, 'shortlisted')}>Shortlist</button><button disabled={applicationBusy === application.id} onClick={() => void changeApplicationStatus(application.id, 'interview')}>Interview</button><button className="reject" disabled={applicationBusy === application.id} onClick={() => void changeApplicationStatus(application.id, 'rejected')}>Reject</button></div>
          </article>)}</div> : <p className="applicant-empty">अभी आपकी नौकरियों पर कोई आवेदन नहीं आया है।</p>}
        </section>}
      </main>
    </div></Localized>
  )
}
