/**
 * Default announcements, social initiatives and grievances for a village
 * chapter.
 *
 * These exist so a freshly seeded deployment shows what each section is *for* —
 * an empty grievance list tells a visitor nothing about what may be reported,
 * and an empty notice board looks broken rather than quiet.
 *
 * Written in Hindi, which is what the village site defaults to; the English
 * title accompanies it the way the rest of the content is paired. Deliberately
 * generic — no real names, no real mobile numbers beyond the chapter helpline
 * placeholder — because this is scaffolding a chapter replaces, not a record of
 * anything that happened.
 *
 * Dates are relative to the seed run (see `daysAgo` / `daysAhead`) so the lists
 * never look abandoned, however long after release the seed is run.
 */

export interface AnnouncementSeed {
  title: string;
  content: string;
  publishedBy: string;
  isUrgent: boolean;
  /** Days before today; 0 is today. */
  daysAgo: number;
}

export interface SocialWorkSeed {
  title: string;
  description: string;
  location: string;
  submitterName: string;
  submitterMobile: string;
  status: 'pending' | 'approved' | 'published';
  daysAgo: number;
}

export interface ComplaintSeed {
  title: string;
  category:
    | 'Water'
    | 'Road'
    | 'Electricity'
    | 'Cleanliness'
    | 'Environment'
    | 'Education'
    | 'Health'
    | 'Sanitation'
    | 'Animal-related'
    | 'Social Issue'
    | 'Government Service'
    | 'Other';
  description: string;
  location: string;
  reporterName: string;
  reporterMobile: string;
  status: 'NEW' | 'ACTION IN PROGRESS' | 'RESOLVED';
  daysAgo: number;
}

const HELPLINE = '9506072678';

export const ANNOUNCEMENT_SEEDS: AnnouncementSeed[] = [
  {
    title: 'ग्राम सभा की मासिक बैठक',
    content:
      'इस माह की ग्राम सभा बैठक पंचायत भवन में आयोजित की जाएगी। बैठक में पेयजल व्यवस्था, नालियों की सफाई तथा आगामी विकास कार्यों की प्राथमिकता पर चर्चा होगी। गांव के प्रत्येक परिवार से एक सदस्य की उपस्थिति अपेक्षित है — जो बात बैठक में रखी जाती है, वही प्रस्ताव में दर्ज होती है।',
    publishedBy: 'ग्रामोदय यूथ मंच',
    isUrgent: false,
    daysAgo: 2,
  },
  {
    title: 'छात्रवृत्ति आवेदन की अंतिम तिथि निकट',
    content:
      'राष्ट्रीय छात्रवृत्ति पोर्टल पर इस सत्र के आवेदन की अवधि चल रही है। जिन विद्यार्थियों ने अभी आवेदन नहीं किया है, वे शिक्षा पृष्ठ पर दी गई सूची देखकर अपनी पात्रता जांच लें। फॉर्म भरने अथवा दस्तावेज़ जुटाने में सहायता हेतु मंच के स्वयंसेवक से संपर्क करें।',
    publishedBy: 'शिक्षा हेल्पडेस्क',
    isUrgent: true,
    daysAgo: 5,
  },
  {
    title: 'स्वच्छता अभियान — रविवार प्रातः',
    content:
      'आगामी रविवार को प्रातः सात बजे से गांव के मुख्य मार्ग एवं तालाब परिसर की सफाई की जाएगी। झाड़ू, तसला एवं दस्ताने मंच की ओर से उपलब्ध कराए जाएंगे। जो सदस्य सम्मिलित होना चाहें, वे एक दिन पूर्व अपना नाम लिखवा दें ताकि सामग्री की व्यवस्था उसी अनुसार हो।',
    publishedBy: 'ग्रामोदय यूथ मंच',
    isUrgent: false,
    daysAgo: 8,
  },
  {
    title: 'निःशुल्क स्वास्थ्य जांच शिविर',
    content:
      'प्राथमिक स्वास्थ्य केंद्र के सहयोग से गांव में निःशुल्क जांच शिविर लगाया जा रहा है, जिसमें रक्तचाप, मधुमेह एवं सामान्य जांच की सुविधा रहेगी। वरिष्ठ नागरिकों एवं गर्भवती महिलाओं को प्राथमिकता दी जाएगी। आधार कार्ड तथा पुराना पर्चा साथ लाएं।',
    publishedBy: 'ग्रामोदय यूथ मंच',
    isUrgent: false,
    daysAgo: 14,
  },
];

export const SOCIAL_WORK_SEEDS: SocialWorkSeed[] = [
  {
    title: 'तालाब परिसर की सफाई एवं वृक्षारोपण',
    description:
      'गांव के तालाब के चारों ओर जमा कचरा एवं झाड़-झंखाड़ हटाकर परिसर को साफ किया गया, तथा किनारे पर छायादार एवं फलदार कुल चालीस पौधे लगाए गए। प्रत्येक पौधे की देखरेख हेतु एक-एक सदस्य की जिम्मेदारी तय की गई है, क्योंकि पौधा लगाना सरल है और उसे जीवित रखना कठिन।',
    location: 'ग्राम तालाब परिसर',
    submitterName: 'ग्रामोदय यूथ मंच',
    submitterMobile: HELPLINE,
    status: 'published',
    daysAgo: 12,
  },
  {
    title: 'विद्यालय जाने वाले मार्ग की मरम्मत',
    description:
      'प्राथमिक विद्यालय तक जाने वाले कच्चे मार्ग पर वर्षा के बाद पानी भर जाता था, जिससे छोटे बच्चों का आना-जाना कठिन हो गया था। श्रमदान से मिट्टी एवं गिट्टी डालकर मार्ग ऊंचा किया गया तथा दोनों ओर पानी निकासी हेतु नाली बनाई गई।',
    location: 'विद्यालय मार्ग',
    submitterName: 'ग्रामोदय यूथ मंच',
    submitterMobile: HELPLINE,
    status: 'published',
    daysAgo: 26,
  },
  {
    title: 'शीतकालीन वस्त्र वितरण',
    description:
      'गांव के वरिष्ठ नागरिकों एवं जरूरतमंद परिवारों के बीच कंबल तथा ऊनी वस्त्रों का वितरण किया गया। सूची आंगनवाड़ी कार्यकर्ता के सहयोग से तैयार की गई थी, ताकि सहायता उन तक पहुंचे जिन्हें उसकी सर्वाधिक आवश्यकता थी।',
    location: 'पंचायत भवन',
    submitterName: 'ग्रामोदय यूथ मंच',
    submitterMobile: HELPLINE,
    status: 'published',
    daysAgo: 40,
  },
  {
    title: 'रक्तदान शिविर का आयोजन',
    description:
      'जिला अस्पताल की रक्त-संग्रह इकाई के सहयोग से गांव में रक्तदान शिविर लगाया गया, जिसमें अट्ठाईस युवाओं ने रक्तदान किया। शिविर से पूर्व एक बैठक कर रक्तदान से जुड़ी भ्रांतियों पर बात की गई थी — प्रश्न पूछे जाने के बाद सहभागिता स्वयं बढ़ गई।',
    location: 'सामुदायिक भवन',
    submitterName: 'ग्रामोदय यूथ मंच',
    submitterMobile: HELPLINE,
    status: 'approved',
    daysAgo: 6,
  },
  {
    title: 'बालिकाओं हेतु साइकिल मरम्मत शिविर',
    description:
      'विद्यालय जाने वाली बालिकाओं की साइकिलों की निःशुल्क मरम्मत की गई — पंचर, ब्रेक एवं चेन की जांच सहित। तैंतीस साइकिलें ठीक की गईं। प्रस्ताव यह है कि ऐसा शिविर प्रत्येक तिमाही में लगाया जाए।',
    location: 'ग्राम चौपाल',
    submitterName: 'ग्रामोदय यूथ मंच',
    submitterMobile: HELPLINE,
    status: 'pending',
    daysAgo: 3,
  },
];

export const COMPLAINT_SEEDS: ComplaintSeed[] = [
  {
    title: 'हैंडपंप से गंदा पानी आ रहा है',
    category: 'Water',
    description:
      'पूर्वी टोले के हैंडपंप से कुछ दिनों से मटमैला पानी निकल रहा है, जिससे आसपास के परिवारों को पीने का पानी दूर से लाना पड़ रहा है। संभवतः प्लेटफॉर्म टूटा होने के कारण ऊपर का पानी भीतर जा रहा है। मरम्मत अथवा बोरिंग की जांच आवश्यक है।',
    location: 'पूर्वी टोला',
    reporterName: 'ग्रामवासी',
    reporterMobile: HELPLINE,
    status: 'ACTION IN PROGRESS',
    daysAgo: 4,
  },
  {
    title: 'मुख्य मार्ग पर स्ट्रीट लाइट बंद',
    category: 'Electricity',
    description:
      'पंचायत भवन से विद्यालय तक के मार्ग पर लगी चार स्ट्रीट लाइटें कई सप्ताह से बंद हैं। संध्या के बाद यह मार्ग पूर्णतः अंधेरे में रहता है, जिससे छात्राओं एवं वरिष्ठ नागरिकों के आवागमन में कठिनाई होती है।',
    location: 'मुख्य मार्ग',
    reporterName: 'ग्रामवासी',
    reporterMobile: HELPLINE,
    status: 'NEW',
    daysAgo: 2,
  },
  {
    title: 'नाली का पानी मार्ग पर बह रहा है',
    category: 'Sanitation',
    description:
      'दक्षिणी टोले में नाली अवरुद्ध होने के कारण गंदा पानी मार्ग पर फैल रहा है, जिससे दुर्गंध एवं मच्छरों की समस्या बढ़ गई है। नाली की सफाई तथा जहां वह टूटी है वहां मरम्मत अपेक्षित है।',
    location: 'दक्षिणी टोला',
    reporterName: 'ग्रामवासी',
    reporterMobile: HELPLINE,
    status: 'NEW',
    daysAgo: 1,
  },
  {
    title: 'विद्यालय में शिक्षक की अनुपस्थिति',
    category: 'Education',
    description:
      'प्राथमिक विद्यालय में कक्षा चार एवं पांच के लिए नियुक्त शिक्षक कई दिनों से अनुपस्थित हैं, जिससे दोनों कक्षाएं एक साथ बैठाई जा रही हैं। खंड शिक्षा अधिकारी तक बात पहुंचाई जाए, यह अनुरोध है।',
    location: 'प्राथमिक विद्यालय',
    reporterName: 'अभिभावक',
    reporterMobile: HELPLINE,
    status: 'ACTION IN PROGRESS',
    daysAgo: 9,
  },
  {
    title: 'सामुदायिक शौचालय की सफाई नहीं हो रही',
    category: 'Cleanliness',
    description:
      'सामुदायिक शौचालय की नियमित सफाई न होने से उसका उपयोग कठिन हो गया है तथा पानी की टंकी भी प्रायः खाली रहती है। सफाईकर्मी की नियुक्ति एवं जल आपूर्ति की व्यवस्था की जाए।',
    location: 'सामुदायिक शौचालय',
    reporterName: 'ग्रामवासी',
    reporterMobile: HELPLINE,
    status: 'RESOLVED',
    daysAgo: 21,
  },
  {
    title: 'आवारा पशुओं से फसल की क्षति',
    category: 'Animal-related',
    description:
      'आवारा पशुओं के झुंड रात्रि में खेतों में घुसकर खड़ी फसल को क्षति पहुंचा रहे हैं। कई किसानों ने अलग-अलग शिकायत की है; गोवंश आश्रय स्थल तक इनकी व्यवस्था कराई जाए, यह सामूहिक अनुरोध है।',
    location: 'ग्राम सीमा के खेत',
    reporterName: 'किसान समूह',
    reporterMobile: HELPLINE,
    status: 'NEW',
    daysAgo: 6,
  },
];
