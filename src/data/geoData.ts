export interface StateItem {
  code: string;
  name: string;
  nameHindi: string;
  districts: { name: string; nameHindi: string }[];
}

export const INDIAN_STATES: StateItem[] = [
  {
    code: 'UP',
    name: 'Uttar Pradesh',
    nameHindi: 'उत्तर प्रदेश',
    districts: [
      { name: 'Hardoi', nameHindi: 'हरदोई' },
      { name: 'Lucknow', nameHindi: 'लखनऊ' },
      { name: 'Sitapur', nameHindi: 'सीतापुर' },
      { name: 'Unnao', nameHindi: 'उन्नाव' },
      { name: 'Kanpur Nagar', nameHindi: 'कानपुर नगर' },
      { name: 'Kanpur Dehat', nameHindi: 'कानपुर देहात' },
      { name: 'Bareilly', nameHindi: 'बरेली' },
      { name: 'Shahjahanpur', nameHindi: 'शाहजहांपुर' },
      { name: 'Lakhimpur Kheri', nameHindi: 'लखीमपुर खीरी' },
      { name: 'Ayodhya', nameHindi: 'अयोध्या' },
      { name: 'Varanasi', nameHindi: 'वाराणसी' },
      { name: 'Prayagraj', nameHindi: 'प्रयागराज' },
      { name: 'Agra', nameHindi: 'आगरा' },
      { name: 'Aligarh', nameHindi: 'अलीगढ़' },
      { name: 'Gorakhpur', nameHindi: 'गोरखपुर' },
      { name: 'Meerut', nameHindi: 'मेरठ' },
      { name: 'Ghaziabad', nameHindi: 'गाजियाबाद' },
      { name: 'Gautam Buddha Nagar', nameHindi: 'गौतम बुद्ध नगर' },
    ],
  },
  {
    code: 'MP',
    name: 'Madhya Pradesh',
    nameHindi: 'मध्य प्रदेश',
    districts: [
      { name: 'Bhopal', nameHindi: 'भोपाल' },
      { name: 'Indore', nameHindi: 'इंदौर' },
      { name: 'Gwalior', nameHindi: 'ग्वालियर' },
      { name: 'Jabalpur', nameHindi: 'जबलपुर' },
      { name: 'Ujjain', nameHindi: 'उज्जैन' },
      { name: 'Rewa', nameHindi: 'रीवा' },
      { name: 'Satna', nameHindi: 'सतना' },
    ],
  },
  {
    code: 'BR',
    name: 'Bihar',
    nameHindi: 'बिहार',
    districts: [
      { name: 'Patna', nameHindi: 'पटना' },
      { name: 'Gaya', nameHindi: 'गया' },
      { name: 'Muzaffarpur', nameHindi: 'मुजफ्फरपुर' },
      { name: 'Bhagalpur', nameHindi: 'भागलपुर' },
      { name: 'Darbhanga', nameHindi: 'दरभंगा' },
      { name: 'Purnia', nameHindi: 'पूर्णिया' },
    ],
  },
  {
    code: 'RJ',
    name: 'Rajasthan',
    nameHindi: 'राजस्थान',
    districts: [
      { name: 'Jaipur', nameHindi: 'जयपुर' },
      { name: 'Jodhpur', nameHindi: 'जोधपुर' },
      { name: 'Udaipur', nameHindi: 'उदयपुर' },
      { name: 'Kota', nameHindi: 'कोटा' },
      { name: 'Bikaner', nameHindi: 'बीकानेर' },
      { name: 'Ajmer', nameHindi: 'अजमेर' },
    ],
  },
  {
    code: 'HR',
    name: 'Haryana',
    nameHindi: 'हरियाणा',
    districts: [
      { name: 'Gurugram', nameHindi: 'गुरुग्राम' },
      { name: 'Faridabad', nameHindi: 'फरीदाबाद' },
      { name: 'Panipat', nameHindi: 'पानीपत' },
      { name: 'Ambala', nameHindi: 'अम्बाला' },
      { name: 'Hisar', nameHindi: 'हिसार' },
      { name: 'Karnal', nameHindi: 'करनाल' },
    ],
  },
  {
    code: 'DL',
    name: 'Delhi',
    nameHindi: 'दिल्ली',
    districts: [
      { name: 'Central Delhi', nameHindi: 'मध्य दिल्ली' },
      { name: 'East Delhi', nameHindi: 'पूर्वी दिल्ली' },
      { name: 'New Delhi', nameHindi: 'नई दिल्ली' },
      { name: 'North Delhi', nameHindi: 'उत्तर दिल्ली' },
      { name: 'South Delhi', nameHindi: 'दक्षिण दिल्ली' },
      { name: 'West Delhi', nameHindi: 'पश्चिम दिल्ली' },
    ],
  },
  {
    code: 'UK',
    name: 'Uttarakhand',
    nameHindi: 'उत्तराखंड',
    districts: [
      { name: 'Dehradun', nameHindi: 'देहरादून' },
      { name: 'Haridwar', nameHindi: 'हरिद्वार' },
      { name: 'Nainital', nameHindi: 'नैनीताल' },
      { name: 'Udham Singh Nagar', nameHindi: 'उधम सिंह नगर' },
    ],
  },
];

export const DEFAULT_PANCHAYATS: { name: string; nameHindi: string; district: string; villages: { name: string; nameHindi: string }[] }[] = [
  {
    name: 'Bahera',
    nameHindi: 'बहेरा',
    district: 'Hardoi',
    villages: [
      { name: 'Rasoolpur', nameHindi: 'रसूलपुर' },
      { name: 'Bahera Khas', nameHindi: 'बहेरा खास' },
      { name: 'Shivpur', nameHindi: 'शिवपुर' },
      { name: 'Durgapur', nameHindi: 'दुर्गापुर' },
    ],
  },
  {
    name: 'Kachhauna',
    nameHindi: 'कछौना',
    district: 'Hardoi',
    villages: [
      { name: 'Kachhauna Dehat', nameHindi: 'कछौना देहात' },
      { name: 'Gopalpur', nameHindi: 'गोपालपुर' },
    ],
  },
  {
    name: 'Sandila',
    nameHindi: 'संडीला',
    district: 'Hardoi',
    villages: [
      { name: 'Sandila Rural', nameHindi: 'संडीला ग्रामीण' },
      { name: 'Maholi', nameHindi: 'महोली' },
    ],
  },
];
