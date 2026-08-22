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
  titleHindi: string;
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
  descriptionHindi: string;
  location: string;
  locationHindi: string;
  ward?: string;
  wardHindi?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  photoUrl?: string;
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
    title: 'Contaminated muddy water from public handpump',
    titleHindi: 'हैंडपंप से गंदा पानी आ रहा है',
    category: 'Water',
    priority: 'urgent',
    photoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=800&auto=format&fit=crop&q=80',
    description:
      'The public handpump in the Eastern Tola has been discharging muddy and unpotable water for several days. As a result, local families are forced to fetch clean drinking water from distant sources. A broken platform foundation is likely allowing surface runoff to seep inside. Immediate inspection and repair or re-boring is required.',
    descriptionHindi:
      'पूर्वी टोले के हैंडपंप से कुछ दिनों से मटमैला पानी निकल रहा है, जिससे आसपास के परिवारों को पीने का पानी दूर से लाना पड़ रहा है। संभवतः प्लेटफॉर्म टूटा होने के कारण ऊपर का पानी भीतर जा रहा है। मरम्मत अथवा बोरिंग की जांच आवश्यक है।',
    location: 'Eastern Tola',
    locationHindi: 'पूर्वी टोला',
    ward: 'Ward 3',
    wardHindi: 'वार्ड 3',
    reporterName: 'Village Resident',
    reporterMobile: HELPLINE,
    status: 'ACTION IN PROGRESS',
    daysAgo: 4,
  },
  {
    title: 'Main road streetlights non-functional for weeks',
    titleHindi: 'मुख्य मार्ग पर स्ट्रीट लाइट बंद',
    category: 'Electricity',
    priority: 'high',
    photoUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&auto=format&fit=crop&q=80',
    description:
      'Four solar street lights installed between the Panchayat Bhavan and the Primary School have been non-functional for multiple weeks. After dusk, this key stretch becomes completely dark, posing safety risks for school girls, commuters, and elderly villagers.',
    descriptionHindi:
      'पंचायत भवन से विद्यालय तक के मार्ग पर लगी चार स्ट्रीट लाइटें कई सप्ताह से बंद हैं। संध्या के बाद यह मार्ग पूर्णतः अंधेरे में रहता है, जिससे छात्राओं एवं वरिष्ठ नागरिकों के आवागमन में कठिनाई होती है।',
    location: 'Main Road',
    locationHindi: 'मुख्य मार्ग',
    ward: 'Ward 1',
    wardHindi: 'वार्ड 1',
    reporterName: 'Village Resident',
    reporterMobile: HELPLINE,
    status: 'NEW',
    daysAgo: 2,
  },
  {
    title: 'Drainage water overflowing onto village pathway',
    titleHindi: 'नाली का पानी मार्ग पर बह रहा है',
    category: 'Sanitation',
    priority: 'high',
    photoUrl: 'https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?w=800&auto=format&fit=crop&q=80',
    description:
      'A major blockage and broken wall in the southern lane drainage channel is causing filthy wastewater to flood directly onto the road. This has created a severe stench and increased mosquito breeding. Desilting and mason repairs are urgently requested.',
    descriptionHindi:
      'दक्षिणी टोले में नाली अवरुद्ध होने के कारण गंदा पानी मार्ग पर फैल रहा है, जिससे दुर्गंध एवं मच्छरों की समस्या बढ़ गई है। नाली की सफाई तथा जहां वह टूटी है वहां मरम्मत अपेक्षित है।',
    location: 'Southern Tola',
    locationHindi: 'दक्षिणी टोला',
    ward: 'Ward 4',
    wardHindi: 'वार्ड 4',
    reporterName: 'Village Resident',
    reporterMobile: HELPLINE,
    status: 'NEW',
    daysAgo: 1,
  },
  {
    title: 'Continuous teacher absence in Primary School classes 4 and 5',
    titleHindi: 'विद्यालय में शिक्षक की अनुपस्थिति',
    category: 'Education',
    priority: 'medium',
    photoUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&auto=format&fit=crop&q=80',
    description:
      'The assigned teacher for grades 4 and 5 at the Primary School has been absent without notice for several consecutive days, forcing students of both classes to sit together in a single room. We request the chapter to escalate this matter to the Block Education Officer (BEO).',
    descriptionHindi:
      'प्राथमिक विद्यालय में कक्षा चार एवं पांच के लिए नियुक्त शिक्षक कई दिनों से अनुपस्थित हैं, जिससे दोनों कक्षाएं एक साथ बैठाई जा रही हैं। खंड शिक्षा अधिकारी तक बात पहुंचाई जाए, यह अनुरोध है।',
    location: 'Primary School Campus',
    locationHindi: 'प्राथमिक विद्यालय',
    ward: 'Ward 2',
    wardHindi: 'वार्ड 2',
    reporterName: 'Parent Group',
    reporterMobile: HELPLINE,
    status: 'ACTION IN PROGRESS',
    daysAgo: 9,
  },
  {
    title: 'Irregular maintenance and lack of water at Community Toilet',
    titleHindi: 'सामुदायिक शौचालय की सफाई नहीं हो रही',
    category: 'Cleanliness',
    priority: 'medium',
    photoUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80',
    description:
      'Due to irregular cleaning and empty overhead water tanks, the community toilet complex had become unusable. Following GYM representation to the Gram Pradhan, a designated sanitation worker has been assigned and the water pump repaired.',
    descriptionHindi:
      'सामुदायिक शौचालय की नियमित सफाई न होने से उसका उपयोग कठिन हो गया था तथा पानी की टंकी भी प्रायः खाली रहती थी। ग्राम प्रधान से समन्वय के बाद सफाईकर्मी की नियमित ड्यूटी एवं जल आपूर्ति की व्यवस्था पूर्ण कर दी गई है।',
    location: 'Community Toilet Complex',
    locationHindi: 'सामुदायिक शौचालय',
    ward: 'Ward 2',
    wardHindi: 'वार्ड 2',
    reporterName: 'Village Resident',
    reporterMobile: HELPLINE,
    status: 'RESOLVED',
    daysAgo: 21,
  },
  {
    title: 'Stray cattle damaging standing crops at village border',
    titleHindi: 'आवारा पशुओं से फसल की क्षति',
    category: 'Animal-related',
    priority: 'high',
    photoUrl: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=800&auto=format&fit=crop&q=80',
    description:
      'Herds of stray cattle enter the agricultural fields along the village periphery during late night hours, inflicting heavy damage on standing wheat and vegetable crops. We collectively urge authorities to arrange transport to the nearby Gaushala shelter.',
    descriptionHindi:
      'आवारा पशुओं के झुंड रात्रि में खेतों में घुसकर खड़ी फसल को क्षति पहुंचा रहे हैं। कई किसानों ने अलग-अलग शिकायत की है; गोवंश आश्रय स्थल तक इनकी व्यवस्था कराई जाए, यह सामूहिक अनुरोध है।',
    location: 'Village Border Fields',
    locationHindi: 'ग्राम सीमा के खेत',
    ward: 'Ward 5',
    wardHindi: 'वार्ड 5',
    reporterName: 'Farmer Group',
    reporterMobile: HELPLINE,
    status: 'NEW',
    daysAgo: 6,
  },
];
