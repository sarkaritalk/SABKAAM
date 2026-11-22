import React, { cloneElement, isValidElement, type ReactNode } from 'react'

export type Language = 'hi' | 'en' | 'hinglish'

const copy: Record<string, [string, string]> = {
  'हर काम, हर इंसान के लिए।': ['Every job, for everyone.', 'Har kaam, har insaan ke liye.'],
  '← वापस': ['← Back', '← Wapas'],
  '🛡️ सुरक्षा और शिकायत': ['🛡️ Safety & reports', '🛡️ Safety aur complaint'],
  'नौकरी देने वाले?': ['Hiring?', 'Naukri dene wale?'],
  'यहाँ जाएँ ↗': ['Go here ↗', 'Yahan jaayein ↗'],
  'पूरे भारत में काम के अवसर': ['Work opportunities across India', 'Poore India mein kaam ke mauke'],
  'काम की तलाश अब': ['Finding work is now', 'Kaam ki talaash ab'],
  'आसान होगी।': ['easier.', 'aasaan hogi.'],
  'अपने आसपास नौकरी, रोज़गार और काम के मौके खोजें। छोटी दुकान से लेकर बड़ी कंपनी तक — सब एक जगह।': ['Find nearby jobs and work opportunities—from small shops to large companies, all in one place.', 'Apne aas-paas jobs aur kaam ke mauke dhoondhein—chhoti dukaan se badi company tak, sab ek jagah.'],
  'आपका अगला': ['Your next', 'Aapka agla'],
  'मौका यहीं है': ['opportunity is here', 'mauka yahin hai'],
  'काम खोजें · आगे बढ़ें': ['Find work · Move forward', 'Kaam dhoondhein · Aage badhein'],
  'अपना अगला काम खोजें': ['Find your next job', 'Apna agla kaam dhoondhein'],
  'आप क्या काम ढूँढ रहे हैं?': ['What kind of work are you looking for?', 'Aap kaisa kaam dhoondh rahe hain?'],
  'राज्य': ['State / UT', 'State / UT'],
  'जिला': ['District', 'Zila'],
  'सभी जिले': ['All districts', 'Sabhi zile'],
  'काम खोजें': ['Search jobs', 'Kaam search karein'],
  'में अवसर खोजें': ['opportunities', 'mein mauke'],
  'बोलकर खोजें': ['Search by voice', 'Bolkar search karein'],
  'जल्द आ रहा है': ['Coming soon', 'Jald aa raha hai'],
  'काम, पद या दुकान का नाम लिखें...': ['Enter a job, role, or business name...', 'Kaam, role ya dukaan ka naam likhein...'],
  'हर तरह के काम': ['All kinds of work', 'Har tarah ke kaam'],
  'आप किस क्षेत्र में काम चाहते हैं?': ['Which field would you like to work in?', 'Aap kis field mein kaam chahte hain?'],
  'सभी श्रेणियाँ': ['All categories', 'Sabhi categories'],
  'उदाहरण के लिए': ['For illustration', 'Example ke liye'],
  'काम के नमूने': ['Sample jobs', 'Kaam ke sample'],
  'डेमो डेटा · असली नौकरी नहीं': ['Demo data · Not real jobs', 'Demo data · Asli job nahi'],
  'इस फ़िल्टर के लिए अभी कोई डेमो उदाहरण नहीं है। फ़िल्टर बदलकर देखें।': ['There are no sample listings for this filter yet. Try changing the filters.', 'Is filter ke liye abhi demo listing nahi hai. Filter badal kar dekhein.'],
  'ये केवल स्क्रीन समझाने के लिए काल्पनिक उदाहरण हैं। SABKAAM पर अभी वास्तविक नौकरी की लिस्टिंग उपलब्ध नहीं है।': ['These are fictional examples for demonstration only. Real job listings are not available on SABKAAM yet.', 'Ye sirf demo ke fictional examples hain. SABKAAM par abhi real job listings nahi hain.'],
  'नौकरी का विवरण · डेमो': ['Job details · Demo', 'Job details · Demo'],
  'बंद करें': ['Close', 'Band karein'],
  'वेतन': ['Pay', 'Salary'],
  'काम': ['Work type', 'Kaam'],
  'श्रेणी': ['Category', 'Category'],
  'यह एक काल्पनिक उदाहरण है, वास्तविक नौकरी या नियोक्ता नहीं। यहाँ आवेदन भेजने से किसी कंपनी को जानकारी नहीं जाएगी।': ['This is a fictional example, not a real job or employer. Submitting here will not send information to any company.', 'Ye fictional demo hai, real job ya employer nahi. Yahan apply karne se company ko details nahi jayengi.'],
  'आवेदन का नमूना': ['Sample application', 'Application ka sample'],
  'आपका नाम *': ['Your name *', 'Aapka naam *'],
  'मोबाइल नंबर *': ['Mobile number *', 'Mobile number *'],
  'आपके बारे में (वैकल्पिक)': ['About you (optional)', 'Aapke baare mein (optional)'],
  'पूरा नाम': ['Full name', 'Poora naam'],
  '10 अंकों का नंबर': ['10-digit number', '10 digit number'],
  'अनुभव या काम की जानकारी लिखें': ['Describe your experience or skills', 'Experience ya skills likhein'],
  'डेमो आवेदन देखें →': ['Preview demo application →', 'Demo application dekhein →'],
  'डेमो आवेदन तैयार हुआ।': ['Demo application prepared.', 'Demo application ready hai.'],
  'आपका विवरण केवल इस स्क्रीन पर दिखाया गया है; कहीं सेव या भेजा नहीं गया।': ['Your details are shown only on this screen; they were not saved or sent.', 'Aapki details sirf is screen par hain; save ya send nahi hui.'],
  'सही जानकारी, सुरक्षित शुरुआत': ['Clear information, safer start', 'Sahi jaankari, safe shuruaat'],
  'हमारा लक्ष्य है कि हर नौकरी में वेतन, समय और जगह की जानकारी साफ़ दिखाई दे।': ['Our goal is to show pay, hours, and location clearly for every job.', 'Hamari koshish hai ki har job ka pay, timing aur location saaf dikhe.'],
  'मेरे आवेदन': ['My applications', 'Mere applications'],
  'सूचनाएँ': ['Notifications', 'Notifications'],
  'प्रोफ़ाइल': ['Profile', 'Profile'],
  'होम': ['Home', 'Home'],
  'भारत · शुरुआती संस्करण': ['India · Early version', 'India · Early version'],
  '← वापस होम पर': ['← Back to home', '← Home par wapas'],
  'प्रारंभिक संस्करण': ['Early version', 'Initial version'],
  'नियोक्ता डैशबोर्ड': ['Employer dashboard', 'Employer dashboard'],
  'अपनी टीम के लिए': ['For your team', 'Apni team ke liye'],
  'सही लोग खोजें।': ['Find the right people.', 'Sahi log dhoondhein.'],
  'अपने यहाँ खाली पद की जानकारी भरें। अभी यह केवल फॉर्म का डेमो है; नौकरी ऑनलाइन प्रकाशित नहीं होगी।': ['Enter your vacancy details. This is currently a form demo; the job will not be published online.', 'Apni vacancy details bharein. Abhi ye form demo hai; job online publish nahi hogi.'],
  'आसान भर्ती': ['Easy hiring', 'Aasaan hiring'],
  'स्थानीय लोगों तक पहुँचने का लक्ष्य': ['Reach local candidates', 'Local logon tak pahunchne ka goal'],
  'नया अवसर': ['New opportunity', 'Naya mauka'],
  'नौकरी की जानकारी भरें': ['Enter job details', 'Job details bharein'],
  '* जरूरी जानकारी': ['* Required information', '* Zaroori jaankari'],
  'आपकी दुकान / कंपनी': ['Your shop / company', 'Aapki dukaan / company'],
  'दुकान / कंपनी का नाम *': ['Shop / company name *', 'Dukaan / company ka naam *'],
  'संपर्क व्यक्ति का नाम *': ['Contact person name *', 'Contact person ka naam *'],
  'काम / पद का नाम *': ['Job / role title *', 'Kaam / role ka naam *'],
  'काम की श्रेणी': ['Job category', 'Kaam ki category'],
  'काम का प्रकार': ['Work type', 'Kaam ka type'],
  'फुल टाइम': ['Full time', 'Full time'],
  'पार्ट टाइम': ['Part time', 'Part time'],
  'दैनिक मजदूरी': ['Daily wage', 'Daily wage'],
  'वर्क फ्रॉम होम': ['Work from home', 'Work from home'],
  'कॉन्ट्रैक्ट': ['Contract', 'Contract'],
  'मासिक वेतन / मजदूरी': ['Monthly salary / wage', 'Monthly salary / mazdoori'],
  'कुल पद': ['Total vacancies', 'Total posts'],
  'काम और योग्यता का विवरण': ['Job and qualification details', 'Kaam aur qualification details'],
  'डेमो पोस्ट का प्रीव्यू देखें': ['Preview demo post', 'Demo post preview dekhein'],
  'प्रीव्यू तैयार है — अभी प्रकाशित नहीं हुआ।': ['Preview ready — not published.', 'Preview ready hai — abhi publish nahi hua.'],
  'यह जानकारी केवल इस स्क्रीन पर दिखाई गई है; सर्वर पर सेव नहीं हुई।': ['This information is shown only on this screen; it has not been saved to a server.', 'Ye details sirf is screen par dikh rahi hain; server par save nahi hui.'],
  'अच्छी नौकरी पोस्ट कैसी हो?': ['What makes a good job post?', 'Achhi job post kaisi ho?'],
  'वेतन साफ-साफ लिखें': ['State the pay clearly', 'Salary saaf likhein'],
  'काम के घंटे बताएँ': ['Mention working hours', 'Working hours batayein'],
  'सही जगह और संपर्क दें': ['Provide the correct location and contact', 'Sahi location aur contact dein'],
  'जरूरी योग्यता ही माँगें': ['Ask only for necessary qualifications', 'Sirf zaroori qualification maangein'],
  'कोई फीस या सिक्योरिटी जमा न माँगें': ['Never ask candidates for fees or deposits', 'Koi fees ya security deposit na maangein'],
  'उम्मीदवार का भरोसा जरूरी है': ['Candidate trust matters', 'Candidate ka bharosa zaroori hai'],
  'आपकी नौकरी की यात्रा': ['Your job journey', 'Aapki job journey'],
  'आपने जिन नौकरियों के लिए आवेदन किया है, उनकी स्थिति यहाँ देख सकेंगे।': ['Track the status of jobs you have applied for here.', 'Aapne jin jobs ke liye apply kiya, unka status yahan dekhein.'],
  'यह केवल UI डेमो है। नीचे दिए गए आवेदन काल्पनिक हैं; किसी वास्तविक नियोक्ता को नहीं भेजे गए।': ['This is a UI demo. The applications below are fictional and were not sent to any employer.', 'Ye UI demo hai. Neeche diye gaye applications fictional hain; kisi employer ko nahi bheje gaye.'],
  'अगला कदम': ['Next step', 'Agla step'],
  'नौकरी खोजें और आवेदन करें। वास्तविक आवेदन सुविधा लाइव जॉब सिस्टम बनने के बाद जोड़ी जाएगी।': ['Search for jobs and apply. Real applications will be enabled after the live job system is connected.', 'Job search karein aur apply karein. Real applications live job system ke baad shuru hongi.'],
  'काम की खबर': ['Work updates', 'Kaam ki khabar'],
  'नौकरी और आवेदन से जुड़ी जरूरी जानकारी एक जगह।': ['Important job and application updates in one place.', 'Job aur application ki zaroori updates ek jagah.'],
  'अभी नोटिफिकेशन सेवा कनेक्ट नहीं है। ये उदाहरण सिर्फ स्क्रीन का नमूना हैं।': ['Notifications are not connected yet. These are sample items only.', 'Notifications abhi connect nahi hain. Ye sirf sample hain.'],
  'अपनी प्रोफ़ाइल पूरी करें': ['Complete your profile', 'Apni profile complete karein'],
  'अपनी स्किल और पसंदीदा काम जोड़ें ताकि सही अवसर ढूँढना आसान हो।': ['Add your skills and preferred work to find suitable opportunities.', 'Apni skills aur pasand ka kaam jodein taaki sahi mauke mil sakein.'],
  'अपना जिला चुनें': ['Choose your district', 'Apna zila chunein'],
  'स्थानीय अवसरों के लिए अपना जिला और क्षेत्र सही रखें।': ['Set your district and area correctly for local opportunities.', 'Local maukon ke liye apna zila aur area sahi rakhein.'],
  'आपकी पहचान, आपकी पसंद': ['Your identity, your choice', 'Aapki pehchaan, aapki pasand'],
  'मेरी प्रोफ़ाइल': ['My profile', 'Meri profile'],
  'बिना रिज़्यूमे के भी अपनी बुनियादी जानकारी तैयार रखें।': ['Keep your basic details ready—even without a resume.', 'Resume ke bina bhi apni basic details ready rakhein.'],
  'आपको कौन-सा काम आता है?': ['What skills do you have?', 'Aapko kaun sa kaam aata hai?'],
  'घर से काम': ['Work from home', 'Ghar se kaam'],
  'फ्रीलांस': ['Freelance', 'Freelance'],
  'प्रोफ़ाइल सेव करें →': ['Save profile →', 'Profile save karein →'],
  'डेमो प्रोफ़ाइल इस स्क्रीन पर तैयार हुई। जानकारी सर्वर पर सेव नहीं हुई है।': ['Demo profile prepared on this screen. Details were not saved to a server.', 'Demo profile is screen par ready hui. Details server par save nahi hui.'],
  'आपका नाम': ['Your name', 'Aapka naam'],
  'अपना नाम लिखें': ['Enter your name', 'Apna naam likhein'],
  'जैसे: दुकान संभालना, ड्राइविंग, सिलाई...': ['e.g. shop work, driving, tailoring...', 'Jaise: shop sambhalna, driving, silai...'],
  'आपकी स्किल यहाँ दिखाई देंगी।': ['Your skills will appear here.', 'Aapki skills yahan dikhenge.'],
  'प्रोफ़ाइल प्रीव्यू · केवल इसी स्क्रीन पर': ['Profile preview · This screen only', 'Profile preview · Sirf isi screen par'],
  'आपकी सहमति के बिना मोबाइल नंबर या निजी जानकारी किसी नियोक्ता के साथ साझा नहीं की जानी चाहिए।': ['Your phone number or personal information should not be shared with an employer without your consent.', 'Aapki permission ke bina mobile ya personal details employer ke saath share nahi honi chahiye.'],
  'सुरक्षित तरीके से काम खोजें': ['Find work safely', 'Safe tareeke se kaam dhoondhein'],
  'धोखाधड़ी के संकेत पहचानें': ['Recognize fraud warning signs', 'Fraud ke signs pehchanein'],
  'नौकरी जाँचने की आदत': ['How to verify a job', 'Job verify karne ki aadat'],
  'नियोक्ता सत्यापन': ['Employer verification', 'Employer verification'],
  'नियोक्ता सत्यापन के लिए अनुरोध': ['Request employer verification', 'Employer verification request'],
  'शिकायत या संदिग्ध नौकरी की सूचना दें': ['Report a problem or suspicious job', 'Complaint ya suspicious job report karein'],
  'क्या हुआ?': ['What happened?', 'Kya hua?'],
  'शिकायत का कारण': ['Reason for report', 'Complaint ka reason'],
  'संपर्क नंबर (वैकल्पिक)': ['Contact number (optional)', 'Contact number (optional)'],
  'डेमो शिकायत तैयार करें →': ['Prepare demo report →', 'Demo complaint ready karein →'],
  'डेमो शिकायत तैयार हुई।': ['Demo report prepared.', 'Demo complaint ready hui.'],
  'नई शिकायत लिखें': ['Write a new report', 'Nayi complaint likhein'],
  'जानकारी संपादित करें': ['Edit details', 'Details edit karein'],
  'व्यवसाय / कंपनी का नाम': ['Business / company name', 'Business / company ka naam'],
  'व्यवसाय का प्रकार': ['Business type', 'Business ka type'],
  'संपर्क मोबाइल नंबर': ['Contact mobile number', 'Contact mobile number'],
  'व्यवसाय का पता': ['Business address', 'Business ka address'],
  'डेमो सत्यापन अनुरोध बनाएँ →': ['Create demo verification request →', 'Demo verification request banayein →'],
  'हिंदी': ['Hindi', 'Hindi'],
  'English': ['English', 'English'],
  'Hinglish': ['Hinglish', 'Hinglish'],
}

export function translateText(value: string, language: Language): string {
  if (language === 'hi') return value
  const trimmed = value.trim()
  const translated = copy[trimmed]?.[language === 'en' ? 0 : 1]
  return translated ? value.replace(trimmed, translated) : value
}

function translateTree(node: ReactNode, language: Language): ReactNode {
  if (typeof node === 'string') return translateText(node, language)
  if (Array.isArray(node)) return node.map((child) => translateTree(child, language))
  if (!isValidElement(node)) return node

  const props = node.props as Record<string, unknown>
  const next: Record<string, unknown> = {}
  for (const key of ['placeholder', 'title', 'aria-label']) {
    if (typeof props[key] === 'string') next[key] = translateText(props[key] as string, language)
  }
  if ('children' in props) next.children = translateTree(props.children as ReactNode, language)
  return cloneElement(node, next)
}

export function Localized({ language, children }: { language: Language; children: ReactNode }) {
  return <>{translateTree(children, language)}</>
}

export function LanguageSelect({ language, onChange }: { language: Language; onChange: (language: Language) => void }) {
  return (
    <label className="language-picker">
      <span className="sr-only">Website language</span>
      <select aria-label="Website language" value={language} onChange={(event) => onChange(event.target.value as Language)}>
        <option value="hi">हिंदी</option>
        <option value="en">English</option>
        <option value="hinglish">Hinglish</option>
      </select>
    </label>
  )
}
