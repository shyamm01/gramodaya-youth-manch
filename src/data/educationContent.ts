/**
 * Default education content for the module.
 *
 * These are the categories and schemes the education pages shipped with as
 * hard-coded arrays; seeding them makes the same content editable through the
 * API. Every row keeps its i18n key (nameKey / titleKey / descriptionKey), so
 * the UI can keep calling t() for the seeded rows and fall back to the stored
 * literal text for anything an admin adds later.
 *
 * Adding a category or scheme here and re-running the seed is idempotent —
 * rows are matched on slug.
 */
import type { EducationResourceType, EducationScope } from '../types';

export interface EducationSeedResource {
  slug: string;
  titleKey: string;
  descriptionKey: string;
  title: string;
  titleHindi: string;
  description: string;
  descriptionHindi: string;
  icon: string;
  scope: EducationScope;
  type: EducationResourceType;
  displayOrder: number;
}

export interface EducationSeedCategory {
  slug: string;
  nameKey: string;
  overviewKey: string;
  name: string;
  nameHindi: string;
  overview: string;
  overviewHindi: string;
  icon: string;
  displayOrder: number;
  resources: EducationSeedResource[];
}

export const EDUCATION_SEED_CATEGORIES: EducationSeedCategory[] = [
  {
    slug: "digital",
    nameKey: "education.cat.digital",
    overviewKey: "education.cat.digital.overview",
    name: "Learning Platforms",
    nameHindi: "डिजिटल अध्ययन अवसर",
    overview: "A student in the village no longer has to reach a coaching centre to get good teaching material. The platforms listed here are run by the government and are free to use: lessons mapped to the NCERT and state board syllabus, video classes, practice questions, and full courses running up to postgraduate level. Most work on an ordinary smartphone, and the PM eVIDYA television and radio channels cover the days when the internet does not. What they ask of the student is routine — a fixed hour each day is worth more than an occasional long session.",
    overviewHindi: "अच्छी अध्ययन सामग्री पाने के लिए अब गांव के विद्यार्थी को किसी कोचिंग केंद्र तक पहुंचना आवश्यक नहीं है। यहां दिए गए मंच सरकार द्वारा संचालित एवं पूर्णतः निःशुल्क हैं — इनमें एनसीईआरटी व राज्य बोर्ड के पाठ्यक्रम के अनुरूप पाठ, वीडियो कक्षाएं, अभ्यास प्रश्न तथा स्नातकोत्तर स्तर तक के पूर्ण पाठ्यक्रम उपलब्ध हैं। अधिकांश सामान्य स्मार्टफोन पर चलते हैं, और जिन दिनों इंटरनेट साथ न दे, उन दिनों PM eVIDYA के टीवी व रेडियो चैनल सहारा बनते हैं। इनसे लाभ लेने हेतु विद्यार्थी से केवल नियमितता अपेक्षित है — प्रतिदिन एक निश्चित घंटा, कभी-कभार की लंबी पढ़ाई से अधिक उपयोगी सिद्ध होता है।",
    icon: "Laptop",
    displayOrder: 1,
    resources: [
      {
        slug: "diksha",
        titleKey: "education.diksha.title",
        descriptionKey: "education.diksha.desc",
        title: "DIKSHA",
        titleHindi: "दीक्षा (DIKSHA)",
        description: "The national digital platform for school education, offering textbook-linked lessons, practice questions and teacher resources. Content follows the NCERT and state board syllabus and is available in several Indian languages, on web and mobile.",
        descriptionHindi: "विद्यालय शिक्षा हेतु राष्ट्रीय डिजिटल मंच, जहां पाठ्यपुस्तक आधारित पाठ, अभ्यास प्रश्न एवं शिक्षक संसाधन उपलब्ध हैं। सामग्री एनसीईआरटी व राज्य बोर्ड के पाठ्यक्रम के अनुरूप है तथा कई भारतीय भाषाओं में वेब एवं मोबाइल दोनों पर उपलब्ध है।",
        icon: "Smartphone",
        scope: "government",
        type: "course",
        displayOrder: 1,
      },
      {
        slug: "swayam",
        titleKey: "education.swayam.title",
        descriptionKey: "education.swayam.desc",
        title: "SWAYAM",
        titleHindi: "स्वयं (SWAYAM)",
        description: "Free online courses run by the Ministry of Education, spanning school subjects through postgraduate level. Courses combine video lectures, reading material and assessments, and many offer a certificate on completion.",
        descriptionHindi: "शिक्षा मंत्रालय द्वारा संचालित निःशुल्क ऑनलाइन पाठ्यक्रम, जो विद्यालय स्तर से स्नातकोत्तर स्तर तक फैले हैं। इनमें वीडियो व्याख्यान, पठन सामग्री एवं मूल्यांकन शामिल हैं, और कई पाठ्यक्रम पूर्ण करने पर प्रमाणपत्र का विकल्प भी देते हैं।",
        icon: "Laptop",
        scope: "government",
        type: "course",
        displayOrder: 2,
      },
      {
        slug: "epathshala",
        titleKey: "education.epathshala.title",
        descriptionKey: "education.epathshala.desc",
        title: "e-Pathshala / PM eVIDYA",
        titleHindi: "ई-पाठशाला / PM eVIDYA",
        description: "Digital textbooks and study material from NCERT, delivered alongside the PM eVIDYA television and radio channels. Together they let students keep studying where internet access is limited or unavailable.",
        descriptionHindi: "एनसीईआरटी की डिजिटल पाठ्यपुस्तकें एवं अध्ययन सामग्री, जो PM eVIDYA के टीवी व रेडियो चैनलों के साथ उपलब्ध कराई जाती हैं। इनकी सहायता से विद्यार्थी वहां भी पढ़ाई जारी रख सकते हैं जहां इंटरनेट सीमित या उपलब्ध नहीं है।",
        icon: "Tv",
        scope: "government",
        type: "course",
        displayOrder: 3,
      },
    ],
  },
  {
    slug: "career-guidance",
    nameKey: "education.cat.careerGuidance",
    overviewKey: "education.cat.careerGuidance.overview",
    name: "Career Guidance",
    nameHindi: "करियर मार्गदर्शन",
    overview: "The decision a student makes after Class 10 or Class 12 shapes the next several years, and it is usually made with very little information in hand. This page sets out the routes that are genuinely open — academic streams, ITI trades and polytechnic diplomas, degree courses, and the entrance and recruitment examinations that lead to government employment. For each one it covers where the path leads, what the entry requirements are, and when applications open. Where a decision needs a longer conversation, the village helpline offers one-to-one counselling for students and parents together.",
    overviewHindi: "कक्षा 10 या 12 के बाद विद्यार्थी जो निर्णय लेता है, वह आगे के कई वर्षों की दिशा तय करता है, और प्रायः यह निर्णय बहुत कम जानकारी के साथ लिया जाता है। इस पृष्ठ पर वे मार्ग स्पष्ट रूप से दिए गए हैं जो वास्तव में उपलब्ध हैं — शैक्षणिक स्ट्रीम, आईटीआई ट्रेड एवं पॉलिटेक्निक डिप्लोमा, डिग्री पाठ्यक्रम तथा सरकारी नौकरी तक ले जाने वाली प्रवेश एवं भर्ती परीक्षाएं। प्रत्येक के लिए बताया गया है कि वह मार्ग कहां ले जाता है, प्रवेश की क्या शर्तें हैं और आवेदन कब खुलते हैं। जहां निर्णय हेतु अधिक विस्तार से बात करना आवश्यक हो, वहां ग्राम हेल्पलाइन विद्यार्थी एवं अभिभावक दोनों के लिए व्यक्तिगत परामर्श उपलब्ध कराती है।",
    icon: "Compass",
    displayOrder: 2,
    resources: [
      {
        slug: "after-ten-twelve",
        titleKey: "education.afterTenTwelve.title",
        descriptionKey: "education.afterTenTwelve.desc",
        title: "Options After 10th & 12th",
        titleHindi: "10वीं व 12वीं के बाद विकल्प",
        description: "Guidance on choosing a stream and subjects after Class 10, and on degree, diploma and vocational routes after Class 12. Covers where each path leads, what the entrance requirements are, and which deadlines to watch.",
        descriptionHindi: "कक्षा 10 के बाद स्ट्रीम एवं विषय चुनने तथा कक्षा 12 के बाद डिग्री, डिप्लोमा व व्यावसायिक मार्गों पर मार्गदर्शन। इसमें बताया जाता है कि प्रत्येक मार्ग कहां ले जाता है, प्रवेश की क्या शर्तें हैं और किन तिथियों का ध्यान रखना आवश्यक है।",
        icon: "Compass",
        scope: "government",
        type: "guidance",
        displayOrder: 1,
      },
      {
        slug: "iti-polytechnic",
        titleKey: "education.itiPolytechnic.title",
        descriptionKey: "education.itiPolytechnic.desc",
        title: "ITI & Polytechnic Pathways",
        titleHindi: "आईटीआई एवं पॉलिटेक्निक मार्ग",
        description: "Information on Industrial Training Institutes and polytechnic diplomas for students heading towards a skilled trade or technical career. Includes the trades on offer, admission requirements, and the apprenticeship and job routes that follow.",
        descriptionHindi: "कुशल ट्रेड या तकनीकी करियर की ओर बढ़ रहे विद्यार्थियों हेतु औद्योगिक प्रशिक्षण संस्थान एवं पॉलिटेक्निक डिप्लोमा की जानकारी। इसमें उपलब्ध ट्रेड, प्रवेश की शर्तें तथा उसके बाद के अप्रेंटिसशिप एवं नौकरी के मार्ग शामिल हैं।",
        icon: "Wrench",
        scope: "government",
        type: "guidance",
        displayOrder: 2,
      },
      {
        slug: "exam-prep",
        titleKey: "education.examPrep.title",
        descriptionKey: "education.examPrep.desc",
        title: "Competitive Exam Preparation",
        titleHindi: "प्रतियोगी परीक्षा तैयारी",
        description: "Details of the entrance and recruitment examinations that matter most to village students — from board and college entrance tests to state and central government job exams. Covers eligibility, the application calendar and free preparation resources.",
        descriptionHindi: "गांव के विद्यार्थियों के लिए सर्वाधिक उपयोगी प्रवेश एवं भर्ती परीक्षाओं का विवरण — बोर्ड व कॉलेज प्रवेश परीक्षाओं से लेकर राज्य एवं केंद्र सरकार की नौकरी परीक्षाओं तक। इसमें पात्रता, आवेदन कैलेंडर तथा निःशुल्क तैयारी संसाधन शामिल हैं।",
        icon: "ClipboardList",
        scope: "government",
        type: "guidance",
        displayOrder: 3,
      },
      {
        slug: "counseling",
        titleKey: "education.counseling.title",
        descriptionKey: "education.counseling.desc",
        title: "One-on-One Career Counselling",
        titleHindi: "व्यक्तिगत करियर परामर्श",
        description: "One-to-one guidance from the village helpline for students and parents weighing an education or career decision. Bring your marksheet and your interests, and a volunteer will talk through the options that realistically fit.",
        descriptionHindi: "शिक्षा या करियर संबंधी निर्णय ले रहे विद्यार्थियों एवं अभिभावकों हेतु ग्राम हेल्पलाइन से व्यक्तिगत मार्गदर्शन। अपनी अंकतालिका एवं रुचियों के साथ संपर्क करें, स्वयंसेवक आपके लिए व्यावहारिक विकल्पों पर विस्तार से चर्चा करेंगे।",
        icon: "MessageCircle",
        scope: "gramodaya",
        type: "guidance",
        displayOrder: 4,
      },
    ],
  },
  {
    slug: "scholarships",
    nameKey: "education.cat.scholarships",
    overviewKey: "education.cat.scholarships.overview",
    name: "Scholarships & Financial Opportunities",
    nameHindi: "छात्रवृत्ति एवं वित्तीय अवसर",
    overview: "Cost is one of the most common reasons a student in the village stops studying, and a large part of that cost is already covered by schemes the student is entitled to. This page brings together the scholarship portals and financial support programmes available from Class 1 through college and professional courses, including central, state and merit-based awards. Most are applied for online and need only the student's own papers — a bank account, Aadhaar, the previous year's marksheet, and a caste or income certificate where the scheme asks for one. If it is not clear which scheme fits, the village helpline can work through the options with you before you apply.",
    overviewHindi: "पढ़ाई का खर्च गांव में विद्यार्थियों के स्कूल छोड़ने के सबसे आम कारणों में से एक है, जबकि इस खर्च का बड़ा हिस्सा उन योजनाओं से पूरा हो सकता है जिनके विद्यार्थी पहले से पात्र हैं। इस पृष्ठ पर कक्षा 1 से लेकर कॉलेज एवं व्यावसायिक पाठ्यक्रमों तक उपलब्ध छात्रवृत्ति पोर्टल तथा आर्थिक सहायता कार्यक्रम एक साथ दिए गए हैं, जिनमें केंद्रीय, राज्य एवं मेधा आधारित छात्रवृत्तियां शामिल हैं। अधिकांश आवेदन ऑनलाइन होते हैं और इनके लिए विद्यार्थी के अपने ही दस्तावेज़ पर्याप्त हैं — बैंक खाता, आधार, पिछले वर्ष की अंकतालिका तथा जहां आवश्यक हो वहां जाति या आय प्रमाणपत्र। यदि यह स्पष्ट न हो कि कौन सी योजना उपयुक्त है, तो आवेदन से पहले ग्राम हेल्पलाइन आपके साथ विकल्पों पर चर्चा कर सकती है।",
    icon: "Award",
    displayOrder: 3,
    resources: [
      {
        slug: "nsp",
        titleKey: "education.nsp.title",
        descriptionKey: "education.nsp.desc",
        title: "National Scholarship Portal (NSP)",
        titleHindi: "राष्ट्रीय छात्रवृत्ति पोर्टल (NSP)",
        description: "The Government of India's single-window portal for pre-matric, post-matric and merit-based scholarships. Students register once, apply to every central and state scheme they are eligible for, and track the status of each application online.",
        descriptionHindi: "प्री-मैट्रिक, पोस्ट-मैट्रिक एवं मेधा आधारित छात्रवृत्तियों हेतु भारत सरकार का एकल पोर्टल। विद्यार्थी एक बार पंजीकरण कर पात्रता के अनुसार केंद्र व राज्य की सभी योजनाओं में आवेदन कर सकते हैं तथा प्रत्येक आवेदन की स्थिति ऑनलाइन देख सकते हैं।",
        icon: "FileText",
        scope: "government",
        type: "scholarship",
        displayOrder: 1,
      },
      {
        slug: "pre-post-matric",
        titleKey: "education.prePostMatric.title",
        descriptionKey: "education.prePostMatric.desc",
        title: "Pre-Matric & Post-Matric Scholarship Schemes",
        titleHindi: "प्री-मैट्रिक एवं पोस्ट-मैट्रिक छात्रवृत्ति योजनाएं",
        description: "Central and state scholarships that cover tuition, examination fees and maintenance costs for SC, ST, OBC and minority students. Pre-matric schemes support students up to Class 10; post-matric schemes continue through higher secondary, college and professional courses.",
        descriptionHindi: "अनुसूचित जाति, अनुसूचित जनजाति, अन्य पिछड़ा वर्ग एवं अल्पसंख्यक विद्यार्थियों की शिक्षण शुल्क, परीक्षा शुल्क एवं निर्वाह लागत में सहायता करने वाली केंद्र व राज्य छात्रवृत्तियां। प्री-मैट्रिक योजनाएं कक्षा 10 तक तथा पोस्ट-मैट्रिक योजनाएं उच्चतर माध्यमिक, कॉलेज एवं व्यावसायिक पाठ्यक्रमों तक सहायता देती हैं।",
        icon: "BookOpen",
        scope: "government",
        type: "scholarship",
        displayOrder: 2,
      },
      {
        slug: "beti-bachao",
        titleKey: "education.betiBachao.title",
        descriptionKey: "education.betiBachao.desc",
        title: "Beti Bachao Beti Padhao",
        titleHindi: "बेटी बचाओ बेटी पढ़ाओ",
        description: "A national programme to improve the survival, protection and education of girls. It funds enrolment drives, awareness campaigns and district-level action aimed at keeping girls in school and reducing dropout.",
        descriptionHindi: "बालिकाओं के जीवन, संरक्षण एवं शिक्षा को बेहतर बनाने हेतु राष्ट्रीय कार्यक्रम। इसके अंतर्गत नामांकन अभियान, जागरूकता कार्यक्रम तथा जिला स्तरीय प्रयास चलाए जाते हैं ताकि बालिकाएं विद्यालय में बनी रहें और ड्रॉपआउट घटे।",
        icon: "HeartHandshake",
        scope: "government",
        type: "scholarship",
        displayOrder: 3,
      },
      {
        slug: "mid-day-meal",
        titleKey: "education.midDayMeal.title",
        descriptionKey: "education.midDayMeal.desc",
        title: "Mid-Day Meal Scheme (PM POSHAN)",
        titleHindi: "मध्याह्न भोजन योजना (PM POSHAN)",
        description: "A cooked midday meal provided free to every child in government and government-aided schools. The scheme is designed to improve both nutrition and attendance, and covers children from pre-primary through Class 8.",
        descriptionHindi: "सरकारी एवं सरकारी सहायता प्राप्त विद्यालयों के प्रत्येक बच्चे को निःशुल्क पका हुआ दोपहर का भोजन। यह योजना पोषण एवं उपस्थिति दोनों सुधारने हेतु बनाई गई है और पूर्व-प्राथमिक से कक्षा 8 तक के बच्चों को शामिल करती है।",
        icon: "Utensils",
        scope: "government",
        type: "scholarship",
        displayOrder: 4,
      },
    ],
  },
  {
    slug: "institutions",
    nameKey: "education.cat.institutions",
    overviewKey: "education.cat.institutions.overview",
    name: "Schools, Literacy & Rights",
    nameHindi: "विद्यालय, साक्षरता एवं अधिकार",
    overview: "Every child in the village has a legal right to free schooling, and several national programmes exist to make sure that right is available in practice — through classrooms, teachers, learning material and support for children who would otherwise be left out. This page explains those rights and the schemes behind them, from admission under the Right to Education Act to the integrated funding that keeps government schools running. It also covers help for adults who missed school the first time and want to return to learning. Where a school refuses admission or a child has dropped out, volunteers from the Manch can help take the matter up locally.",
    overviewHindi: "गांव के प्रत्येक बच्चे को निःशुल्क शिक्षा का कानूनी अधिकार है, और कई राष्ट्रीय कार्यक्रम यह सुनिश्चित करने के लिए बनाए गए हैं कि यह अधिकार व्यवहार में भी उपलब्ध रहे — कक्षा-कक्ष, शिक्षक, अध्ययन सामग्री तथा उन बच्चों के लिए सहायता के रूप में जो अन्यथा छूट जाते। इस पृष्ठ पर वे अधिकार एवं उनसे जुड़ी योजनाएं समझाई गई हैं, शिक्षा का अधिकार अधिनियम के तहत प्रवेश से लेकर सरकारी विद्यालयों को संचालित रखने वाली एकीकृत सहायता तक। इसमें उन वयस्कों हेतु सहायता भी शामिल है जो पहले पढ़ाई पूरी नहीं कर सके और अब लौटना चाहते हैं। यदि कोई विद्यालय प्रवेश देने से मना करे अथवा कोई बच्चा पढ़ाई छोड़ दे, तो मंच के स्वयंसेवक स्थानीय स्तर पर मामला उठाने में सहायता कर सकते हैं।",
    icon: "School",
    displayOrder: 4,
    resources: [
      {
        slug: "rte",
        titleKey: "education.rte.title",
        descriptionKey: "education.rte.desc",
        title: "Right to Education Act (RTE)",
        titleHindi: "शिक्षा का अधिकार अधिनियम (RTE)",
        description: "The Right of Children to Free and Compulsory Education Act guarantees free schooling for every child aged 6 to 14. It reserves seats in private schools for children from weaker sections and bars schools from refusing admission for want of documents.",
        descriptionHindi: "निःशुल्क एवं अनिवार्य बाल शिक्षा का अधिकार अधिनियम 6 से 14 वर्ष के प्रत्येक बच्चे को निःशुल्क शिक्षा की गारंटी देता है। यह निजी विद्यालयों में कमजोर वर्ग के बच्चों हेतु सीटें आरक्षित करता है तथा दस्तावेजों के अभाव में प्रवेश से इनकार करने पर रोक लगाता है।",
        icon: "ShieldCheck",
        scope: "government",
        type: "scheme",
        displayOrder: 1,
      },
      {
        slug: "samagra-shiksha",
        titleKey: "education.samagraShiksha.title",
        descriptionKey: "education.samagraShiksha.desc",
        title: "Samagra Shiksha Abhiyan",
        titleHindi: "समग्र शिक्षा अभियान",
        description: "The government's integrated scheme for school education, covering pre-school to Class 12 under a single programme. It funds teacher training, classrooms, libraries, and dedicated support for girls and children with special needs.",
        descriptionHindi: "पूर्व-प्राथमिक से कक्षा 12 तक की विद्यालय शिक्षा को एक ही कार्यक्रम में समेटने वाली सरकार की एकीकृत योजना। इसके अंतर्गत शिक्षक प्रशिक्षण, कक्षा-कक्ष, पुस्तकालय तथा बालिकाओं एवं विशेष आवश्यकता वाले बच्चों हेतु सहायता उपलब्ध कराई जाती है।",
        icon: "School",
        scope: "government",
        type: "scheme",
        displayOrder: 2,
      },
      {
        slug: "adult-literacy",
        titleKey: "education.adultLiteracy.title",
        descriptionKey: "education.adultLiteracy.desc",
        title: "Adult Literacy & Enrollment Support",
        titleHindi: "वयस्क साक्षरता एवं नामांकन सहायता",
        description: "Village-level assistance with school admission, attendance follow-up and adult literacy classes. Volunteers help families complete enrolment paperwork and connect out-of-school children and adult learners to the nearest centre.",
        descriptionHindi: "विद्यालय प्रवेश, उपस्थिति की निगरानी एवं प्रौढ़ साक्षरता कक्षाओं हेतु ग्राम स्तरीय सहायता। स्वयंसेवक परिवारों को नामांकन के कागज़ात पूरे करने में मदद करते हैं तथा विद्यालय से बाहर बच्चों एवं वयस्क शिक्षार्थियों को निकटतम केंद्र से जोड़ते हैं।",
        icon: "BookOpen",
        scope: "gramodaya",
        type: "scheme",
        displayOrder: 3,
      },
    ],
  },
];
