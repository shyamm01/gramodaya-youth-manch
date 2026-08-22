/**
 * The full detail sheet for each seeded scheme, keyed by resource slug.
 *
 * Kept apart from ./educationContent (which holds the catalogue — identity,
 * summary, icon, ordering) because the two change on different cadences: the
 * catalogue is stable, while eligibility rules, portals and document lists are
 * revised as schemes are amended, and are edited here without touching the
 * structure of the module.
 *
 * Deliberately free of figures that change every year — award amounts, income
 * ceilings and application windows are stated in general terms and pointed at
 * the official portal, because a stale number on a village noticeboard is worse
 * than no number at all.
 *
 * Every field is optional: a slug with no entry seeds exactly as before.
 */
import type { EducationLinkType } from '../types';

export interface EducationSeedLink {
  label: string;
  labelHindi: string;
  url: string;
  type: EducationLinkType;
}

export interface EducationSeedResourceDetail {
  provider?: string;
  providerHindi?: string;
  externalUrl?: string;
  eligibility?: string;
  eligibilityHindi?: string;
  benefits?: string;
  benefitsHindi?: string;
  howToApply?: string;
  howToApplyHindi?: string;
  documentsRequired?: string[];
  documentsRequiredHindi?: string[];
  tags?: string[];
  /** Label for the card's action button; blank keeps the default "Learn more". */
  ctaLabel?: string;
  ctaLabelHindi?: string;
  links?: EducationSeedLink[];
}

export const EDUCATION_RESOURCE_DETAILS: Record<string, EducationSeedResourceDetail> = {
  // ── Learning platforms ────────────────────────────────────────────────────
  diksha: {
    provider: 'Ministry of Education, Government of India',
    providerHindi: 'शिक्षा मंत्रालय, भारत सरकार',
    externalUrl: 'https://diksha.gov.in',
    eligibility:
      'Open to every school student, teacher and parent from Class 1 to Class 12. There is no fee, no eligibility test and no registration needed to read or watch the material — an account is only required to save progress.',
    eligibilityHindi:
      'कक्षा 1 से कक्षा 12 तक के प्रत्येक विद्यार्थी, शिक्षक एवं अभिभावक हेतु उपलब्ध। कोई शुल्क, कोई पात्रता परीक्षा तथा सामग्री पढ़ने या देखने हेतु किसी पंजीकरण की आवश्यकता नहीं — खाता केवल अपनी प्रगति सुरक्षित रखने के लिए आवश्यक है।',
    benefits:
      'Lessons mapped to the NCERT and state board syllabus, video explanations, practice questions and previous papers, in several Indian languages. The QR code printed in state textbooks opens the lesson for that page. Content can be downloaded and used offline, and the app runs on an ordinary Android phone.',
    benefitsHindi:
      'एनसीईआरटी व राज्य बोर्ड के पाठ्यक्रम के अनुरूप पाठ, वीडियो व्याख्या, अभ्यास प्रश्न एवं पिछले वर्षों के प्रश्नपत्र, कई भारतीय भाषाओं में उपलब्ध। राज्य की पाठ्यपुस्तकों पर छपा क्यूआर कोड उसी पृष्ठ का पाठ खोल देता है। सामग्री डाउनलोड कर ऑफलाइन भी पढ़ी जा सकती है तथा ऐप सामान्य एंड्रॉयड फोन पर चलता है।',
    howToApply:
      'Install the DIKSHA app from the Play Store or open diksha.gov.in in a browser, choose your state board and class, and begin. To open a specific lesson, scan the QR code printed beside the chapter in your textbook.',
    howToApplyHindi:
      'प्ले स्टोर से दीक्षा ऐप इंस्टॉल करें अथवा ब्राउज़र में diksha.gov.in खोलें, अपना राज्य बोर्ड एवं कक्षा चुनें और आरंभ करें। किसी विशेष पाठ को खोलने हेतु अपनी पाठ्यपुस्तक में अध्याय के पास छपे क्यूआर कोड को स्कैन करें।',
    tags: ['class-1-12', 'free', 'ncert', 'mobile', 'offline'],
    ctaLabel: 'Start learning',
    ctaLabelHindi: 'सीखना शुरू करें',
    links: [
      { label: 'DIKSHA portal', labelHindi: 'दीक्षा पोर्टल', url: 'https://diksha.gov.in', type: 'portal' },
      {
        label: 'Android app',
        labelHindi: 'एंड्रॉयड ऐप',
        url: 'https://play.google.com/store/apps/details?id=in.gov.diksha.app',
        type: 'portal',
      },
    ],
  },

  swayam: {
    provider: 'Ministry of Education, Government of India',
    providerHindi: 'शिक्षा मंत्रालय, भारत सरकार',
    externalUrl: 'https://swayam.gov.in',
    eligibility:
      'Open to anyone — school students from Class 9 upward, college students, and working adults. Studying a course is free; only the optional proctored examination taken at a test centre carries a fee.',
    eligibilityHindi:
      'सभी के लिए खुला — कक्षा 9 से ऊपर के विद्यार्थी, महाविद्यालय के छात्र तथा कार्यरत वयस्क। पाठ्यक्रम पढ़ना निःशुल्क है; शुल्क केवल वैकल्पिक प्रोक्टर्ड परीक्षा का है, जो परीक्षा केंद्र पर दी जाती है।',
    benefits:
      'Free video lectures, reading material, weekly assignments and discussion forums, taught by faculty from the IITs, IIMs, UGC and NCERT. Courses that are completed with the examination carry a certificate, and many universities accept the credit towards a degree.',
    benefitsHindi:
      'निःशुल्क वीडियो व्याख्यान, पठन सामग्री, साप्ताहिक असाइनमेंट एवं चर्चा मंच, जिन्हें आईआईटी, आईआईएम, यूजीसी तथा एनसीईआरटी के प्राध्यापक पढ़ाते हैं। परीक्षा सहित पूर्ण किए गए पाठ्यक्रम पर प्रमाणपत्र मिलता है, तथा कई विश्वविद्यालय इस क्रेडिट को डिग्री में स्वीकार करते हैं।',
    howToApply:
      'Register free with a mobile number or email at swayam.gov.in, browse the catalogue and enrol in a course while its window is open. New semesters generally begin in January and July, so a course that is closed today usually reopens in the next cycle.',
    howToApplyHindi:
      'swayam.gov.in पर मोबाइल नंबर अथवा ईमेल से निःशुल्क पंजीकरण करें, सूची देखें और खुली अवधि में पाठ्यक्रम हेतु नामांकन करें। नए सत्र प्रायः जनवरी एवं जुलाई में आरंभ होते हैं, अतः आज बंद पाठ्यक्रम अगले चक्र में पुनः खुल जाता है।',
    tags: ['college', 'certificate', 'free', 'online-course'],
    ctaLabel: 'Browse courses',
    ctaLabelHindi: 'पाठ्यक्रम देखें',
    links: [
      { label: 'SWAYAM portal', labelHindi: 'स्वयं पोर्टल', url: 'https://swayam.gov.in', type: 'portal' },
      { label: 'NPTEL courses', labelHindi: 'एनपीटीईएल पाठ्यक्रम', url: 'https://nptel.ac.in', type: 'portal' },
    ],
  },

  epathshala: {
    provider: 'NCERT, Ministry of Education',
    providerHindi: 'एनसीईआरटी, शिक्षा मंत्रालय',
    externalUrl: 'https://epathshala.nic.in',
    eligibility:
      'Open to every student, teacher and parent, Class 1 to Class 12. Nothing is charged and no registration is required. The television and radio channels need no internet connection at all.',
    eligibilityHindi:
      'कक्षा 1 से 12 तक के प्रत्येक विद्यार्थी, शिक्षक एवं अभिभावक हेतु उपलब्ध। कोई शुल्क नहीं तथा पंजीकरण आवश्यक नहीं। टीवी एवं रेडियो चैनलों के लिए इंटरनेट की बिल्कुल आवश्यकता नहीं होती।',
    benefits:
      'Every NCERT textbook in digital form in Hindi, English and Urdu, along with audio and video material. Under PM eVIDYA, classes are broadcast on dedicated television channels and community radio, so study continues on the days the internet does not work.',
    benefitsHindi:
      'प्रत्येक एनसीईआरटी पाठ्यपुस्तक डिजिटल रूप में हिंदी, अंग्रेज़ी एवं उर्दू में, साथ ही ऑडियो व वीडियो सामग्री। PM eVIDYA के अंतर्गत कक्षाएं समर्पित टीवी चैनलों एवं सामुदायिक रेडियो पर प्रसारित होती हैं, जिससे इंटरनेट न चलने वाले दिनों में भी पढ़ाई जारी रहती है।',
    howToApply:
      'Install the e-Pathshala app or open epathshala.nic.in, pick your class and subject, and download the book. For the broadcast classes, tune to the PM eVIDYA channel for your class on any free DTH service.',
    howToApplyHindi:
      'ई-पाठशाला ऐप इंस्टॉल करें अथवा epathshala.nic.in खोलें, अपनी कक्षा एवं विषय चुनकर पुस्तक डाउनलोड करें। प्रसारित कक्षाओं हेतु किसी भी निःशुल्क डीटीएच सेवा पर अपनी कक्षा का PM eVIDYA चैनल लगाएं।',
    tags: ['ncert', 'textbooks', 'tv', 'radio', 'offline'],
    ctaLabel: 'Open textbooks',
    ctaLabelHindi: 'पाठ्यपुस्तकें खोलें',
    links: [
      { label: 'e-Pathshala', labelHindi: 'ई-पाठशाला', url: 'https://epathshala.nic.in', type: 'portal' },
      { label: 'NCERT books', labelHindi: 'एनसीईआरटी पुस्तकें', url: 'https://ncert.nic.in/textbook.php', type: 'pdf' },
    ],
  },

  // ── Career guidance ───────────────────────────────────────────────────────
  'after-ten-twelve': {
    provider: 'Gramodaya Youth Manch education helpdesk',
    providerHindi: 'ग्रामोदय यूथ मंच शिक्षा हेल्पडेस्क',
    externalUrl: 'https://www.ncs.gov.in',
    eligibility:
      'For students in Classes 9 to 12 and their parents. There is nothing to qualify for — this is guidance, and it is free.',
    eligibilityHindi:
      'कक्षा 9 से 12 तक के विद्यार्थियों एवं उनके अभिभावकों हेतु। इसमें पात्रता जैसी कोई शर्त नहीं — यह मार्गदर्शन है और पूर्णतः निःशुल्क है।',
    benefits:
      'A clear map of what is actually open after Class 10 and Class 12: the science, commerce and arts streams, ITI trades and polytechnic diplomas, degree courses, and the government recruitment routes. For each one, where it leads, what it costs, and how long it takes.',
    benefitsHindi:
      'कक्षा 10 एवं 12 के बाद वास्तव में कौन-कौन से मार्ग खुले हैं, इसका स्पष्ट चित्र: विज्ञान, वाणिज्य एवं कला संकाय, आईटीआई ट्रेड व पॉलिटेक्निक डिप्लोमा, डिग्री पाठ्यक्रम तथा सरकारी भर्ती के मार्ग। प्रत्येक के बारे में — वह कहां ले जाता है, उसमें कितना व्यय होता है और कितना समय लगता है।',
    howToApply:
      'Read through the options here, then send a request from this page or call the village helpline to talk it over. Bring last year’s marksheet — the honest advice depends on the marks in hand, not on the marks one hopes for.',
    howToApplyHindi:
      'यहां दिए विकल्प पढ़ें, फिर इसी पृष्ठ से अनुरोध भेजें अथवा ग्राम हेल्पलाइन पर बात करें। पिछले वर्ष की अंकतालिका साथ लाएं — उचित सलाह प्राप्त अंकों के आधार पर दी जाती है, अपेक्षित अंकों के आधार पर नहीं।',
    documentsRequired: ['Previous year marksheet', 'School identity card'],
    documentsRequiredHindi: ['पिछले वर्ष की अंकतालिका', 'विद्यालय पहचान पत्र'],
    tags: ['class-10', 'class-12', 'counselling', 'streams'],
    ctaLabel: 'See the options',
    ctaLabelHindi: 'विकल्प देखें',
    links: [
      { label: 'National Career Service', labelHindi: 'राष्ट्रीय करियर सेवा', url: 'https://www.ncs.gov.in', type: 'portal' },
    ],
  },

  'iti-polytechnic': {
    provider: 'Directorate General of Training, Ministry of Skill Development',
    providerHindi: 'प्रशिक्षण महानिदेशालय, कौशल विकास मंत्रालय',
    externalUrl: 'https://dgt.gov.in',
    eligibility:
      'ITI trades ask for Class 8 or Class 10 depending on the trade; polytechnic diplomas ask for Class 10. Admission is generally on Class 10 marks, and some states hold an entrance test for polytechnic seats. There are reserved seats for SC, ST, OBC and girl candidates.',
    eligibilityHindi:
      'आईटीआई ट्रेड में ट्रेड के अनुसार कक्षा 8 अथवा कक्षा 10 अपेक्षित है; पॉलिटेक्निक डिप्लोमा हेतु कक्षा 10 आवश्यक है। प्रवेश प्रायः कक्षा 10 के अंकों पर होता है तथा कुछ राज्यों में पॉलिटेक्निक सीटों हेतु प्रवेश परीक्षा होती है। अनुसूचित जाति, जनजाति, अन्य पिछड़ा वर्ग एवं छात्राओं हेतु आरक्षित सीटें उपलब्ध हैं।',
    benefits:
      'Short, job-oriented training of one to three years with a recognised NCVT or state certificate. An apprenticeship after the course pays a stipend, and a polytechnic diploma allows lateral entry into the second year of an engineering degree, so it is a step forward rather than a step aside.',
    benefitsHindi:
      'एक से तीन वर्ष का संक्षिप्त, रोज़गारोन्मुखी प्रशिक्षण, जिसमें एनसीवीटी अथवा राज्य का मान्यता प्राप्त प्रमाणपत्र मिलता है। पाठ्यक्रम के बाद अप्रेंटिसशिप में वजीफा मिलता है, तथा पॉलिटेक्निक डिप्लोमा के उपरांत इंजीनियरिंग डिग्री के द्वितीय वर्ष में सीधे प्रवेश मिल जाता है — अर्थात यह मार्ग आगे बढ़ाता है, रोकता नहीं।',
    howToApply:
      'Apply on your state’s ITI or polytechnic admission portal when the counselling round opens, usually soon after the Class 10 results. Fill the trade preferences carefully — seats are allotted in that order and a preference cannot be changed after allotment.',
    howToApplyHindi:
      'काउंसलिंग चक्र आरंभ होने पर अपने राज्य के आईटीआई अथवा पॉलिटेक्निक प्रवेश पोर्टल पर आवेदन करें, जो प्रायः कक्षा 10 के परिणाम के तुरंत बाद खुलता है। ट्रेड की वरीयता सोच-समझकर भरें — सीटें उसी क्रम में आवंटित होती हैं और आवंटन के बाद वरीयता बदली नहीं जा सकती।',
    documentsRequired: [
      'Class 10 marksheet and certificate',
      'School transfer certificate',
      'Aadhaar card',
      'Caste certificate, where a reserved seat is claimed',
      'Income certificate, where a fee concession is claimed',
      'Passport size photographs',
    ],
    documentsRequiredHindi: [
      'कक्षा 10 की अंकतालिका एवं प्रमाणपत्र',
      'विद्यालय स्थानांतरण प्रमाणपत्र',
      'आधार कार्ड',
      'जाति प्रमाणपत्र, यदि आरक्षित सीट का दावा हो',
      'आय प्रमाणपत्र, यदि शुल्क में छूट का दावा हो',
      'पासपोर्ट आकार के फोटोग्राफ',
    ],
    tags: ['iti', 'polytechnic', 'diploma', 'apprenticeship', 'after-10th'],
    ctaLabel: 'Check admission',
    ctaLabelHindi: 'प्रवेश जानकारी',
    links: [
      { label: 'NCVT MIS', labelHindi: 'एनसीवीटी एमआईएस', url: 'https://www.ncvtmis.gov.in', type: 'portal' },
      { label: 'Apprenticeship portal', labelHindi: 'अप्रेंटिसशिप पोर्टल', url: 'https://www.apprenticeshipindia.gov.in', type: 'portal' },
    ],
  },

  'exam-prep': {
    provider: 'Gramodaya Youth Manch education helpdesk',
    providerHindi: 'ग्रामोदय यूथ मंच शिक्षा हेल्पडेस्क',
    externalUrl: 'https://www.ncs.gov.in',
    eligibility:
      'Conditions differ from one examination to the next — age, qualifying marks and the number of attempts are set by the body conducting it. Fee concessions for SC, ST, women and candidates with disabilities apply to most government examinations.',
    eligibilityHindi:
      'प्रत्येक परीक्षा की शर्तें भिन्न होती हैं — आयु, न्यूनतम अंक तथा प्रयासों की संख्या संचालक संस्था द्वारा निर्धारित की जाती है। अधिकांश सरकारी परीक्षाओं में अनुसूचित जाति, जनजाति, महिलाओं एवं दिव्यांग अभ्यर्थियों को शुल्क में छूट प्राप्त है।',
    benefits:
      'A single place to see which examinations matter and when they open — board and college entrance tests, and state and central recruitment. Free preparation material, previous papers and mock tests are available on the government platforms, so coaching fees are not a precondition for trying.',
    benefitsHindi:
      'कौन-सी परीक्षाएं उपयोगी हैं और कब आवेदन खुलते हैं, यह सब एक ही स्थान पर — बोर्ड व महाविद्यालय प्रवेश परीक्षाएं तथा राज्य एवं केंद्र की भर्तियां। सरकारी मंचों पर निःशुल्क तैयारी सामग्री, पिछले प्रश्नपत्र एवं मॉक टेस्ट उपलब्ध हैं, अतः प्रयास करने के लिए कोचिंग शुल्क आवश्यक नहीं है।',
    howToApply:
      'Register once on the portal of the conducting body — NTA for most entrance tests, SSC for central recruitment, and your state commission for state posts — and apply within the notified window. Keep one email address and one mobile number for every application; a change midway is what most often loses a candidate their admit card.',
    howToApplyHindi:
      'संचालक संस्था के पोर्टल पर एक बार पंजीकरण करें — अधिकांश प्रवेश परीक्षाओं हेतु एनटीए, केंद्रीय भर्ती हेतु एसएससी तथा राज्य पदों हेतु अपने राज्य आयोग पर — और अधिसूचित अवधि में आवेदन करें। सभी आवेदनों के लिए एक ही ईमेल एवं एक ही मोबाइल नंबर रखें; बीच में बदलाव के कारण ही प्रायः अभ्यर्थी का प्रवेश पत्र छूट जाता है।',
    documentsRequired: [
      'Class 10 and Class 12 marksheets',
      'Aadhaar card',
      'Caste or category certificate, where claimed',
      'Scanned photograph and signature',
    ],
    documentsRequiredHindi: [
      'कक्षा 10 एवं कक्षा 12 की अंकतालिकाएं',
      'आधार कार्ड',
      'जाति अथवा श्रेणी प्रमाणपत्र, यदि दावा हो',
      'स्कैन किया हुआ फोटोग्राफ एवं हस्ताक्षर',
    ],
    tags: ['entrance-exam', 'government-job', 'free-material', 'mock-test'],
    ctaLabel: 'See exam list',
    ctaLabelHindi: 'परीक्षा सूची देखें',
    links: [
      { label: 'National Testing Agency', labelHindi: 'राष्ट्रीय परीक्षा एजेंसी', url: 'https://nta.ac.in', type: 'portal' },
      { label: 'Staff Selection Commission', labelHindi: 'कर्मचारी चयन आयोग', url: 'https://ssc.gov.in', type: 'portal' },
      { label: 'National Career Service', labelHindi: 'राष्ट्रीय करियर सेवा', url: 'https://www.ncs.gov.in', type: 'portal' },
    ],
  },

  counseling: {
    provider: 'Gramodaya Youth Manch',
    providerHindi: 'ग्रामोदय यूथ मंच',
    eligibility:
      'Any student or parent of the village, at any stage — before choosing a stream, before filling a form, or after a result that did not go as hoped. There is no fee and no membership requirement.',
    eligibilityHindi:
      'गांव का कोई भी विद्यार्थी अथवा अभिभावक, किसी भी स्थिति में — संकाय चुनने से पूर्व, फॉर्म भरने से पूर्व, अथवा अपेक्षा के विपरीत परिणाम आने के बाद। इसका कोई शुल्क नहीं तथा सदस्यता आवश्यक नहीं।',
    benefits:
      'A sitting with a volunteer who goes through the marks, the family’s means and the student’s interest together, and names the options that realistically fit. Help with filling forms and assembling documents, and a follow-up call after the application goes in.',
    benefitsHindi:
      'स्वयंसेवक के साथ बैठक, जिसमें अंक, परिवार की सामर्थ्य एवं विद्यार्थी की रुचि — तीनों को साथ रखकर व्यावहारिक विकल्प बताए जाते हैं। फॉर्म भरने एवं दस्तावेज़ जुटाने में सहायता, तथा आवेदन जमा होने के बाद अनुवर्ती संपर्क।',
    howToApply:
      'Send a request from this page with your mobile number, or call the village helpline. A volunteer will fix a time — students are asked to come with a parent wherever possible, since the decision is usually taken by both.',
    howToApplyHindi:
      'इसी पृष्ठ से अपना मोबाइल नंबर देकर अनुरोध भेजें अथवा ग्राम हेल्पलाइन पर संपर्क करें। स्वयंसेवक समय निर्धारित कर देंगे — विद्यार्थियों से अनुरोध है कि यथासंभव अभिभावक के साथ आएं, क्योंकि निर्णय प्रायः दोनों मिलकर लेते हैं।',
    documentsRequired: ['Latest marksheet', 'Aadhaar card', 'A list of courses already being considered'],
    documentsRequiredHindi: ['नवीनतम अंकतालिका', 'आधार कार्ड', 'विचाराधीन पाठ्यक्रमों की सूची'],
    tags: ['counselling', 'one-to-one', 'village-helpline'],
    ctaLabel: 'Book a session',
    ctaLabelHindi: 'परामर्श बुक करें',
  },

  // ── Scholarships ──────────────────────────────────────────────────────────
  nsp: {
    provider: 'Government of India — National Scholarship Portal',
    providerHindi: 'भारत सरकार — राष्ट्रीय छात्रवृत्ति पोर्टल',
    externalUrl: 'https://scholarships.gov.in',
    eligibility:
      'Students from Class 1 through postgraduate study, depending on the scheme applied for. Each scheme sets its own family income ceiling and category conditions. Two requirements are common to nearly all of them: an Aadhaar number, and a bank account in the student’s own name — not a parent’s.',
    eligibilityHindi:
      'योजना के अनुसार कक्षा 1 से स्नातकोत्तर तक के विद्यार्थी पात्र हैं। प्रत्येक योजना अपनी पारिवारिक आय सीमा एवं श्रेणी संबंधी शर्तें स्वयं निर्धारित करती है। दो शर्तें लगभग सभी में समान हैं: आधार संख्या, तथा विद्यार्थी के अपने नाम का बैंक खाता — अभिभावक के नाम का नहीं।',
    benefits:
      'One registration covers every central and several state scholarships the student is eligible for, so the same papers are not filed again scheme by scheme. Tuition and maintenance amounts are paid straight into the student’s account by direct benefit transfer, and the status of each application can be tracked online.',
    benefitsHindi:
      'एक ही पंजीकरण से विद्यार्थी उन सभी केंद्रीय एवं कई राज्य छात्रवृत्तियों हेतु आवेदन कर सकता है जिनके लिए वह पात्र है, अतः वही कागज़ात प्रत्येक योजना हेतु बार-बार नहीं लगाने पड़ते। शुल्क एवं निर्वाह राशि प्रत्यक्ष लाभ अंतरण द्वारा सीधे विद्यार्थी के खाते में आती है, तथा प्रत्येक आवेदन की स्थिति ऑनलाइन देखी जा सकती है।',
    howToApply:
      'Register as a fresh applicant when the window opens — usually around the middle of the academic year — complete the one-time registration and eKYC, fill the form and upload the documents. The application is not complete until the school or college verifies it online, so hand the reference number to the institution and confirm that it has been forwarded.',
    howToApplyHindi:
      'आवेदन अवधि खुलने पर — जो प्रायः शैक्षणिक वर्ष के मध्य में होती है — नए आवेदक के रूप में पंजीकरण करें, वन-टाइम रजिस्ट्रेशन एवं ई-केवाईसी पूर्ण करें, फॉर्म भरें तथा दस्तावेज़ अपलोड करें। जब तक विद्यालय अथवा महाविद्यालय ऑनलाइन सत्यापन न कर दे, आवेदन पूर्ण नहीं माना जाता — अतः संदर्भ संख्या संस्था को दें और अग्रसारित होने की पुष्टि अवश्य कर लें।',
    documentsRequired: [
      'Aadhaar card, or the Aadhaar enrolment number',
      'Bank passbook in the student’s own name',
      'Previous year marksheet',
      'Income certificate',
      'Caste certificate, where the scheme asks for one',
      'Bonafide certificate from the institution',
      'Fee receipt for the current year',
      'Passport size photograph',
    ],
    documentsRequiredHindi: [
      'आधार कार्ड अथवा आधार नामांकन संख्या',
      'विद्यार्थी के अपने नाम की बैंक पासबुक',
      'पिछले वर्ष की अंकतालिका',
      'आय प्रमाणपत्र',
      'जाति प्रमाणपत्र, यदि योजना में अपेक्षित हो',
      'संस्था द्वारा जारी बोनाफाइड प्रमाणपत्र',
      'चालू वर्ष की शुल्क रसीद',
      'पासपोर्ट आकार का फोटोग्राफ',
    ],
    tags: ['scholarship', 'dbt', 'class-1-pg', 'single-window'],
    ctaLabel: 'Apply on NSP',
    ctaLabelHindi: 'एनएसपी पर आवेदन करें',
    links: [
      { label: 'National Scholarship Portal', labelHindi: 'राष्ट्रीय छात्रवृत्ति पोर्टल', url: 'https://scholarships.gov.in', type: 'portal' },
      { label: 'List of schemes', labelHindi: 'योजनाओं की सूची', url: 'https://scholarships.gov.in/allSchemes', type: 'portal' },
    ],
  },

  'pre-post-matric': {
    provider: 'Ministry of Social Justice and Empowerment, and state welfare departments',
    providerHindi: 'सामाजिक न्याय एवं अधिकारिता मंत्रालय तथा राज्य कल्याण विभाग',
    externalUrl: 'https://scholarships.gov.in',
    eligibility:
      'Students of SC, ST, OBC and minority communities. Pre-matric schemes cover study up to Class 10, post-matric schemes cover Class 11 onwards through college and professional courses. Each scheme fixes a family income ceiling, and the student must not be holding another scholarship for the same year.',
    eligibilityHindi:
      'अनुसूचित जाति, अनुसूचित जनजाति, अन्य पिछड़ा वर्ग एवं अल्पसंख्यक समुदाय के विद्यार्थी पात्र हैं। प्री-मैट्रिक योजनाएं कक्षा 10 तक की पढ़ाई हेतु तथा पोस्ट-मैट्रिक योजनाएं कक्षा 11 से महाविद्यालय एवं व्यावसायिक पाठ्यक्रमों तक लागू होती हैं। प्रत्येक योजना में पारिवारिक आय की सीमा निर्धारित है, तथा विद्यार्थी उसी वर्ष कोई अन्य छात्रवृत्ति नहीं ले रहा हो।',
    benefits:
      'Reimbursement of tuition and examination fees, and a monthly maintenance allowance paid for the months the course actually runs. Students living in a hostel receive a higher rate than day scholars, and admission and other compulsory fees charged by the institution are covered separately.',
    benefitsHindi:
      'शिक्षण एवं परीक्षा शुल्क की प्रतिपूर्ति तथा मासिक निर्वाह भत्ता, जो पाठ्यक्रम के वास्तविक महीनों हेतु दिया जाता है। छात्रावास में रहने वाले विद्यार्थियों को दिवा छात्रों की तुलना में अधिक दर मिलती है, तथा संस्था द्वारा लिया गया प्रवेश एवं अन्य अनिवार्य शुल्क अलग से देय होता है।',
    howToApply:
      'Apply through the National Scholarship Portal, or through your state’s own scholarship portal where the state runs one — applying on both for the same year will have one application rejected. Renewal in later years is a shorter form, but it must be filed every year; it does not carry forward on its own.',
    howToApplyHindi:
      'राष्ट्रीय छात्रवृत्ति पोर्टल के माध्यम से आवेदन करें, अथवा जहां राज्य का अपना पोर्टल हो वहां उससे — एक ही वर्ष हेतु दोनों पर आवेदन करने से एक आवेदन निरस्त हो जाता है। आगामी वर्षों में नवीनीकरण का फॉर्म संक्षिप्त होता है, किंतु उसे प्रतिवर्ष भरना आवश्यक है; यह स्वतः आगे नहीं बढ़ता।',
    documentsRequired: [
      'Caste certificate issued by the competent authority',
      'Family income certificate',
      'Previous year marksheet',
      'Aadhaar card and bank passbook in the student’s name',
      'Bonafide certificate and fee receipt from the institution',
      'Hostel certificate, for students claiming the hosteller rate',
    ],
    documentsRequiredHindi: [
      'सक्षम अधिकारी द्वारा जारी जाति प्रमाणपत्र',
      'पारिवारिक आय प्रमाणपत्र',
      'पिछले वर्ष की अंकतालिका',
      'आधार कार्ड एवं विद्यार्थी के नाम की बैंक पासबुक',
      'संस्था का बोनाफाइड प्रमाणपत्र एवं शुल्क रसीद',
      'छात्रावास प्रमाणपत्र, छात्रावासी दर का दावा करने वालों हेतु',
    ],
    tags: ['scholarship', 'sc-st-obc', 'minority', 'fee-reimbursement'],
    ctaLabel: 'Check eligibility',
    ctaLabelHindi: 'पात्रता जांचें',
    links: [
      { label: 'Apply on NSP', labelHindi: 'एनएसपी पर आवेदन', url: 'https://scholarships.gov.in', type: 'portal' },
      { label: 'Ministry of Social Justice', labelHindi: 'सामाजिक न्याय मंत्रालय', url: 'https://socialjustice.gov.in', type: 'portal' },
    ],
  },

  'beti-bachao': {
    provider: 'Ministry of Women and Child Development',
    providerHindi: 'महिला एवं बाल विकास मंत्रालय',
    externalUrl: 'https://wcd.gov.in',
    eligibility:
      'A programme run at district and block level rather than one an individual applies to. Girls and their families are the intended beneficiaries; the schemes it converges with — Sukanya Samriddhi, scholarships, cycle and uniform schemes — each have their own conditions.',
    eligibilityHindi:
      'यह जिला एवं ब्लॉक स्तर पर संचालित कार्यक्रम है, ऐसी योजना नहीं जिसमें व्यक्ति स्वयं आवेदन करता हो। बालिकाएं एवं उनके परिवार इसके लक्षित लाभार्थी हैं; इससे जुड़ी योजनाओं — सुकन्या समृद्धि, छात्रवृत्तियां, साइकिल एवं गणवेश योजनाएं — की अपनी-अपनी शर्तें हैं।',
    benefits:
      'Enrolment drives and follow-up for girls who have dropped out, awareness work against early marriage, and district-level action to improve the sex ratio at birth. In practice the most useful part for a family is the link it provides to the Sukanya Samriddhi savings account and to girl-child scholarships.',
    benefitsHindi:
      'विद्यालय छोड़ चुकी बालिकाओं हेतु नामांकन अभियान एवं अनुवर्ती कार्रवाई, बाल विवाह के विरुद्ध जागरूकता कार्य, तथा जन्म के समय लिंगानुपात सुधारने हेतु जिला स्तरीय प्रयास। व्यवहार में परिवार के लिए सर्वाधिक उपयोगी पक्ष यह है कि इसके माध्यम से सुकन्या समृद्धि खाता एवं बालिका छात्रवृत्तियों तक पहुंच बनती है।',
    howToApply:
      'Approach the Anganwadi centre, the CDPO office or the district women and child development office. A Sukanya Samriddhi account can be opened at any post office or authorised bank with the girl’s birth certificate. A Manch volunteer can go along if the office is unfamiliar.',
    howToApplyHindi:
      'आंगनवाड़ी केंद्र, सीडीपीओ कार्यालय अथवा जिला महिला एवं बाल विकास कार्यालय से संपर्क करें। सुकन्या समृद्धि खाता किसी भी डाकघर अथवा अधिकृत बैंक में बालिका के जन्म प्रमाणपत्र के साथ खोला जा सकता है। यदि कार्यालय अपरिचित हो तो मंच का स्वयंसेवक साथ जा सकता है।',
    documentsRequired: [
      'Birth certificate of the girl',
      'Aadhaar card of the girl and a guardian',
      'School enrolment record, where admission help is sought',
      'Address proof',
    ],
    documentsRequiredHindi: [
      'बालिका का जन्म प्रमाणपत्र',
      'बालिका एवं एक अभिभावक का आधार कार्ड',
      'विद्यालय नामांकन का अभिलेख, यदि प्रवेश हेतु सहायता चाहिए',
      'निवास प्रमाण',
    ],
    tags: ['girl-child', 'enrolment', 'sukanya-samriddhi', 'district'],
    ctaLabel: 'Know the scheme',
    ctaLabelHindi: 'योजना जानें',
    links: [
      { label: 'Ministry of Women and Child Development', labelHindi: 'महिला एवं बाल विकास मंत्रालय', url: 'https://wcd.gov.in', type: 'portal' },
    ],
  },

  'mid-day-meal': {
    provider: 'Ministry of Education — PM POSHAN',
    providerHindi: 'शिक्षा मंत्रालय — पीएम पोषण',
    externalUrl: 'https://pmposhan.education.gov.in',
    eligibility:
      'Every child enrolled in a government or government-aided school, from the pre-primary Bal Vatika class through Class 8. There is nothing to qualify for and nothing to apply for — the entitlement follows enrolment, and it applies equally to every child in the classroom.',
    eligibilityHindi:
      'सरकारी एवं सरकारी सहायता प्राप्त विद्यालयों में नामांकित प्रत्येक बालक-बालिका, पूर्व-प्राथमिक बाल वाटिका कक्षा से कक्षा 8 तक। इसमें न कोई पात्रता शर्त है और न कोई आवेदन — यह अधिकार नामांकन के साथ ही मिल जाता है तथा कक्षा के प्रत्येक बच्चे पर समान रूप से लागू होता है।',
    benefits:
      'One free cooked hot meal on every school day, prepared to fixed calorie and protein norms for the age group. Beyond the nutrition, the meal is one of the strongest reasons attendance holds up, and it is served to all children together, which is the point of the scheme as much as the food is.',
    benefitsHindi:
      'प्रत्येक विद्यालय दिवस पर एक निःशुल्क पका हुआ गर्म भोजन, जो आयु वर्ग हेतु निर्धारित कैलोरी एवं प्रोटीन मानकों के अनुसार बनाया जाता है। पोषण के अतिरिक्त, उपस्थिति बनाए रखने के सबसे प्रभावी कारणों में यह भोजन एक है, तथा इसे सभी बच्चों को साथ बैठाकर परोसा जाता है — भोजन जितना ही महत्वपूर्ण योजना का यह उद्देश्य भी है।',
    howToApply:
      'No application is needed; a child enrolled in the school receives the meal. If the meal is not served, is short, or is of poor quality, raise it with the head teacher and the School Management Committee first, and send a request from this page if it is not set right — the Manch takes such complaints up with the block education office.',
    howToApplyHindi:
      'किसी आवेदन की आवश्यकता नहीं; विद्यालय में नामांकित बच्चे को भोजन मिलता है। यदि भोजन न परोसा जाए, कम हो अथवा गुणवत्ता ठीक न हो, तो पहले प्रधानाध्यापक एवं विद्यालय प्रबंधन समिति के समक्ष बात रखें, और समाधान न होने पर इसी पृष्ठ से अनुरोध भेजें — मंच ऐसी शिकायतें ब्लॉक शिक्षा कार्यालय तक पहुंचाता है।',
    tags: ['nutrition', 'class-1-8', 'no-application', 'attendance'],
    ctaLabel: 'How it works',
    ctaLabelHindi: 'यह कैसे काम करती है',
    links: [
      { label: 'PM POSHAN', labelHindi: 'पीएम पोषण', url: 'https://pmposhan.education.gov.in', type: 'portal' },
    ],
  },

  // ── Schools, literacy and rights ──────────────────────────────────────────
  rte: {
    provider: 'Department of School Education and Literacy, Ministry of Education',
    providerHindi: 'स्कूल शिक्षा एवं साक्षरता विभाग, शिक्षा मंत्रालय',
    externalUrl: 'https://www.education.gov.in',
    eligibility:
      'Every child between six and fourteen years of age, without exception. Private unaided schools must additionally keep a quarter of their entry-class seats for children from weaker sections and disadvantaged groups living in the neighbourhood.',
    eligibilityHindi:
      'छह से चौदह वर्ष आयु का प्रत्येक बालक-बालिका, बिना किसी अपवाद के। इसके अतिरिक्त निजी गैर-सहायता प्राप्त विद्यालयों को अपनी प्रवेश कक्षा की एक-चौथाई सीटें आस-पड़ोस के कमज़ोर वर्ग एवं वंचित समूह के बच्चों हेतु आरक्षित रखनी होती हैं।',
    benefits:
      'Free and compulsory schooling up to Class 8, with no capitation fee, no screening test of the child or the parents, and no child held back or expelled before Class 8. A child who has never been to school, or who left, has the right to admission in an age-appropriate class with special training to catch up.',
    benefitsHindi:
      'कक्षा 8 तक निःशुल्क एवं अनिवार्य शिक्षा — न कोई कैपिटेशन शुल्क, न बच्चे या अभिभावक की कोई छंटनी परीक्षा, तथा कक्षा 8 से पूर्व किसी बच्चे को न रोका जाएगा और न निष्कासित किया जाएगा। जो बच्चा कभी विद्यालय गया ही नहीं, अथवा बीच में छोड़ चुका है, उसे आयु के अनुरूप कक्षा में प्रवेश तथा पिछड़ी पढ़ाई पूरी करने हेतु विशेष प्रशिक्षण का अधिकार है।',
    howToApply:
      'Admission to a neighbourhood government school can be sought at any time in the year, not only at the start of session. For the 25 per cent quota in a private school, apply on the state’s RTE admission portal during its window. If a school refuses admission or demands documents you do not have, that refusal is not lawful — take it to the Block Education Officer, or send a request from this page and a volunteer will accompany you.',
    howToApplyHindi:
      'निकटवर्ती सरकारी विद्यालय में प्रवेश वर्ष में कभी भी मांगा जा सकता है, केवल सत्र के आरंभ में ही नहीं। निजी विद्यालय की 25 प्रतिशत आरक्षित सीटों हेतु राज्य के आरटीई प्रवेश पोर्टल पर निर्धारित अवधि में आवेदन करें। यदि कोई विद्यालय प्रवेश देने से मना करे अथवा ऐसे दस्तावेज़ मांगे जो आपके पास नहीं हैं, तो वह इनकार विधिसम्मत नहीं है — इसे खंड शिक्षा अधिकारी के समक्ष रखें, अथवा इसी पृष्ठ से अनुरोध भेजें, स्वयंसेवक आपके साथ चलेंगे।',
    documentsRequired: [
      'Proof of the child’s age — birth certificate, hospital record, or an affidavit from the parent',
      'Proof of residence in the school’s neighbourhood',
      'Income or caste certificate, only for the reserved quota in private schools',
      'Note that admission cannot lawfully be refused for want of any of these',
    ],
    documentsRequiredHindi: [
      'बच्चे की आयु का प्रमाण — जन्म प्रमाणपत्र, अस्पताल का अभिलेख अथवा अभिभावक का शपथ पत्र',
      'विद्यालय के आस-पड़ोस में निवास का प्रमाण',
      'आय अथवा जाति प्रमाणपत्र, केवल निजी विद्यालयों की आरक्षित सीटों हेतु',
      'ध्यान रहे — इनमें से किसी दस्तावेज़ के अभाव में प्रवेश से इनकार विधिसम्मत नहीं है',
    ],
    tags: ['right-to-education', 'admission', 'age-6-14', '25-percent-quota'],
    ctaLabel: 'Know your rights',
    ctaLabelHindi: 'अपने अधिकार जानें',
    links: [
      { label: 'Ministry of Education', labelHindi: 'शिक्षा मंत्रालय', url: 'https://www.education.gov.in', type: 'portal' },
    ],
  },

  'samagra-shiksha': {
    provider: 'Ministry of Education',
    providerHindi: 'शिक्षा मंत्रालय',
    externalUrl: 'https://samagra.education.gov.in',
    eligibility:
      'Government and government-aided schools from pre-primary to Class 12, and through them every child studying there. Funds go to the school rather than to the family, so there is no individual application.',
    eligibilityHindi:
      'पूर्व-प्राथमिक से कक्षा 12 तक के सरकारी एवं सरकारी सहायता प्राप्त विद्यालय, तथा उनके माध्यम से वहां पढ़ने वाला प्रत्येक बच्चा। धनराशि परिवार को नहीं, विद्यालय को दी जाती है, अतः इसमें व्यक्तिगत आवेदन नहीं होता।',
    benefits:
      'Teacher training and salaries, classrooms, libraries, science and computer labs, free textbooks and uniforms as per state norms, Kasturba Gandhi residential schools for girls, and dedicated support for children with special needs — the whole of school education under one programme instead of a dozen separate ones.',
    benefitsHindi:
      'शिक्षक प्रशिक्षण एवं वेतन, कक्षा-कक्ष, पुस्तकालय, विज्ञान व कंप्यूटर प्रयोगशालाएं, राज्य मानकों के अनुसार निःशुल्क पाठ्यपुस्तकें एवं गणवेश, बालिकाओं हेतु कस्तूरबा गांधी आवासीय विद्यालय, तथा विशेष आवश्यकता वाले बच्चों हेतु समर्पित सहायता — दर्जनों अलग-अलग योजनाओं के स्थान पर एक ही कार्यक्रम में संपूर्ण विद्यालयी शिक्षा।',
    howToApply:
      'Nothing to apply for as a family. What is worth doing is asking: the School Management Committee, on which parents sit, can ask the head teacher what the school has been sanctioned this year and whether it has arrived. Where an entitlement — textbooks, uniforms, a functioning lab — has not reached the children, the Manch will follow it up.',
    howToApplyHindi:
      'परिवार के स्तर पर आवेदन जैसा कुछ नहीं है। करने योग्य कार्य यह है कि पूछा जाए: विद्यालय प्रबंधन समिति, जिसमें अभिभावक भी सदस्य होते हैं, प्रधानाध्यापक से जान सकती है कि इस वर्ष विद्यालय को क्या स्वीकृत हुआ और वह प्राप्त हुआ या नहीं। जहां कोई अधिकार — पाठ्यपुस्तकें, गणवेश, चालू प्रयोगशाला — बच्चों तक न पहुंचा हो, मंच उसकी अनुवर्ती कार्रवाई करता है।',
    tags: ['school-education', 'infrastructure', 'kgbv', 'inclusive-education'],
    ctaLabel: 'About the scheme',
    ctaLabelHindi: 'योजना के बारे में',
    links: [
      { label: 'Samagra Shiksha', labelHindi: 'समग्र शिक्षा', url: 'https://samagra.education.gov.in', type: 'portal' },
    ],
  },

  'adult-literacy': {
    provider: 'Gramodaya Youth Manch, with the National Institute of Open Schooling',
    providerHindi: 'ग्रामोदय यूथ मंच, राष्ट्रीय मुक्त विद्यालयी शिक्षा संस्थान के सहयोग से',
    externalUrl: 'https://www.nios.ac.in',
    eligibility:
      'Adults of fifteen years and above who missed school or left it early, and children of any age who are out of school. No prior certificate is needed to begin, and there is no upper age limit — the oldest learner in the last batch was past sixty.',
    eligibilityHindi:
      'पंद्रह वर्ष एवं उससे अधिक आयु के वे वयस्क जिनकी पढ़ाई छूट गई अथवा बीच में रह गई, तथा किसी भी आयु के विद्यालय से बाहर बच्चे। आरंभ करने हेतु किसी पूर्व प्रमाणपत्र की आवश्यकता नहीं और अधिकतम आयु की कोई सीमा नहीं — पिछले बैच में सबसे वरिष्ठ शिक्षार्थी की आयु साठ वर्ष से अधिक थी।',
    benefits:
      'Literacy and numeracy classes held in the village at hours that suit working people, help with school admission and attendance follow-up for out-of-school children, and a route to a recognised Class 10 or Class 12 certificate through open schooling for anyone who wants to carry on.',
    benefitsHindi:
      'गांव में ही साक्षरता एवं गणना की कक्षाएं, जो कामकाजी लोगों के अनुकूल समय पर चलती हैं; विद्यालय से बाहर बच्चों हेतु प्रवेश में सहायता एवं उपस्थिति की अनुवर्ती देखभाल; तथा आगे पढ़ने के इच्छुक किसी भी व्यक्ति हेतु मुक्त विद्यालयी शिक्षा के माध्यम से मान्यता प्राप्त कक्षा 10 या 12 के प्रमाणपत्र तक का मार्ग।',
    howToApply:
      'Send a request from this page or speak to any Manch volunteer, and someone will come to the house to enrol the learner. For open schooling, admission runs in two blocks each year and a volunteer will fill the online form and arrange the study material.',
    howToApplyHindi:
      'इसी पृष्ठ से अनुरोध भेजें अथवा मंच के किसी भी स्वयंसेवक से बात करें, कोई घर आकर शिक्षार्थी का नामांकन कर देगा। मुक्त विद्यालयी शिक्षा में प्रवेश वर्ष में दो चरणों में होता है; स्वयंसेवक ऑनलाइन फॉर्म भर देंगे तथा अध्ययन सामग्री की व्यवस्था करा देंगे।',
    documentsRequired: [
      'Aadhaar card, where available',
      'Any previous marksheet, if the learner studied earlier',
      'A passport size photograph, for open schooling admission',
    ],
    documentsRequiredHindi: [
      'आधार कार्ड, यदि उपलब्ध हो',
      'कोई पिछली अंकतालिका, यदि शिक्षार्थी पहले पढ़ चुका हो',
      'पासपोर्ट आकार का फोटोग्राफ, मुक्त विद्यालयी प्रवेश हेतु',
    ],
    tags: ['adult-literacy', 'out-of-school', 'open-schooling', 'village'],
    ctaLabel: 'Ask for help',
    ctaLabelHindi: 'सहायता मांगें',
    links: [
      { label: 'NIOS', labelHindi: 'एनआईओएस', url: 'https://www.nios.ac.in', type: 'portal' },
    ],
  },
};
