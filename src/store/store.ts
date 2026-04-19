export interface AppSettings {
  adminPassword: string;
  vipPassword?: string;
  externalApiKey?: string;
  webhookUrl?: string;
}

export interface BanReason {
  id: string;
  name: string;
}

export interface Device {
  id: string;
  name: string;
}

export interface Language {
  id: string;
  name: string;
}

export interface MessageTemplate {
  id: string;
  languageId: string;
  reasonId: string;
  targetDevice?: string; // If specified, applies only to this device specifically
  template: string; // contains placeholders like {{PHONE}}, {{DEVICE}}
}

export interface RequestStat {
  id: string;
  phone: string;
  reasonId: string;
  deviceId: string;
  timestamp: number;
}

// Initial default data
const DEFAULT_REASONS: BanReason[] = [
  { id: '1', name: 'سبام (Spam)' },
  { id: '2', name: 'تطبيق غير رسمي (Unofficial App)' },
  { id: '3', name: 'انتهاك الشروط (TOS Violation)' },
  { id: '4', name: 'غير معروف (Unknown)' },
];

const generateExpandedDevices = (): Device[] => {
  const mfgs = [
    { name: 'Samsung', models: ['Galaxy S24 Ultra', 'Galaxy S24+', 'Galaxy S24', 'Galaxy S23 Ultra', 'Galaxy S23', 'Galaxy A54', 'Galaxy A55', 'Galaxy A73', 'Galaxy A34', 'Galaxy Z Fold 5', 'Galaxy Z Flip 5'] },
    { name: 'Xiaomi', models: ['14 Pro', '14', '13 Pro', '13T', '12T Pro', 'Redmi Note 13 Pro+', 'Redmi Note 13', 'Redmi Note 12', 'Poco F5', 'Poco X6 Pro', 'Poco M6'] },
    { name: 'Huawei', models: ['P60 Pro', 'Mate 60 Pro', 'Nova 11', 'P50 Pro', 'Mate 50', 'Nova Y91'] },
    { name: 'Oppo', models: ['Find X7 Ultra', 'Find X6 Pro', 'Reno 11 Pro', 'Reno 10', 'A78'] },
    { name: 'Vivo', models: ['X100 Pro', 'X90 Pro', 'V30 Pro', 'V29', 'Y200'] },
    { name: 'Realme', models: ['12 Pro+', '11 Pro', 'GT 5 Pro', 'GT Neo 5', 'C67'] },
    { name: 'Google', models: ['Pixel 8 Pro', 'Pixel 8', 'Pixel 7 Pro', 'Pixel 7a', 'Pixel Fold'] },
    { name: 'OnePlus', models: ['12', '11', '12R', 'Nord 3', 'Nord CE 3'] },
    { name: 'Motorola', models: ['Edge 40 Pro', 'Edge 40', 'Moto G84', 'Moto G54', 'Razr 40 Ultra'] },
    { name: 'TECNO', models: ['Camon 20 Pro', 'Phantom V Fold', 'Spark 20 Pro', 'Pova 5 Pro'] },
    { name: 'Infinix', models: ['Zero 30 5G', 'Note 30 Pro', 'Hot 40 Pro', 'Smart 8'] },
    { name: 'Apple', models: ['iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 14 Pro Max', 'iPhone 13'] },
  ];

  const result: Device[] = [];
  let idCounter = 1;
  const addDev = (name: string) => result.push({ id: `dev${idCounter++}`, name });
  
  mfgs.forEach(mfg => {
    mfg.models.forEach(model => addDev(`${mfg.name} ${model}`));
  });

  ['A', 'M', 'S', 'F'].forEach(series => {
    for(let i = 10; i <= 75; i += 2) {
       addDev(`Samsung Galaxy ${series}${i}`);
    }
  });

  for(let i = 8; i <= 13; i++) {
     addDev(`Xiaomi Redmi Note ${i}`);
     addDev(`Xiaomi Redmi Note ${i} Pro`);
     addDev(`Xiaomi Poco X${i} Pro`);
  }
  
  for(let i = 20; i <= 60; i += 10) {
      addDev(`Huawei Mate ${i} Pro`);
      addDev(`Huawei P${i} Pro`);
      addDev(`Huawei Nova ${i/10 + 3}`);
  }

  for(let i = 50; i <= 90; i += 10) {
      addDev(`Honor ${i}`);
      addDev(`Honor ${i} Pro`);
      addDev(`Honor Magic ${i/10}`);
  }
  
  return result.slice(0, 300).sort((a,b) => a.name.localeCompare(b.name));
};

const DEFAULT_DEVICES: Device[] = generateExpandedDevices();

const DEFAULT_LANGUAGES: Language[] = [
  { id: 'ar', name: 'العربية (Arabic)' },
  { id: 'en', name: 'English' },
  { id: 'fr', name: 'Français (French)' },
];

const DEFAULT_MESSAGES: MessageTemplate[] = [
  {
    id: 'm1',
    languageId: 'ar',
    reasonId: '1',
    template: 'مرحباً فريق دعم واتساب، لقد تم حظر رقمي {{PHONE}} عن طريق الخطأ. لم أقم بإرسال رسائل مزعجة. أستخدم جهاز {{DEVICE}}. أرجو إعادة تفعيل حسابي.'
  },
  {
    id: 'm2',
    languageId: 'en',
    reasonId: '1',
    template: 'Hello WhatsApp Support, my number {{PHONE}} was banned by mistake. I did not send spam. I am using a {{DEVICE}} device. Please reactivate my account.'
  },
  {
    id: 'm3',
    languageId: 'ar',
    reasonId: '2',
    template: 'مرحباً، تم حظر حسابي {{PHONE}} بسبب استخدام تطبيق غير رسمي عن طريق الخطأ. لقد قمت بحذفه وتثبيت التطبيق الرسمي على جهازي {{DEVICE}}. الرجاء فك الحظر.'
  },
  {
    id: 'm4',
    languageId: 'en',
    reasonId: '2',
    template: 'Hello, my account {{PHONE}} was banned for using an unofficial app. I have uninstalled it and installed the official WhatsApp on my {{DEVICE}}. Please unban.'
  }
];

export const store = {
  getSettings: (): AppSettings => {
    const data = localStorage.getItem('appSettings');
    return data ? JSON.parse(data) : { adminPassword: '716023560', vipPassword: 'vip', externalApiKey: '', webhookUrl: '' };
  },
  saveSettings: (settings: AppSettings) => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
  },
  
  getReasons: (): BanReason[] => {
    const data = localStorage.getItem('banReasons');
    return data ? JSON.parse(data) : DEFAULT_REASONS;
  },
  saveReasons: (reasons: BanReason[]) => {
    localStorage.setItem('banReasons', JSON.stringify(reasons));
  },
  
  getDevices: (): Device[] => {
    const data = localStorage.getItem('devices');
    return data ? JSON.parse(data) : DEFAULT_DEVICES;
  },
  saveDevices: (devices: Device[]) => {
    localStorage.setItem('devices', JSON.stringify(devices));
  },
  
  getLanguages: (): Language[] => {
    const data = localStorage.getItem('languages');
    return data ? JSON.parse(data) : DEFAULT_LANGUAGES;
  },
  saveLanguages: (languages: Language[]) => {
    localStorage.setItem('languages', JSON.stringify(languages));
  },
  
  getMessages: (): MessageTemplate[] => {
    const data = localStorage.getItem('messages');
    return data ? JSON.parse(data) : DEFAULT_MESSAGES;
  },
  saveMessages: (messages: MessageTemplate[]) => {
    localStorage.setItem('messages', JSON.stringify(messages));
  },
  
  getStats: (): RequestStat[] => {
    const data = localStorage.getItem('stats');
    return data ? JSON.parse(data) : [];
  },
  addStat: (stat: Omit<RequestStat, 'id' | 'timestamp'>) => {
    const stats = store.getStats();
    stats.push({
      ...stat,
      id: Date.now().toString(),
      timestamp: Date.now()
    });
    localStorage.setItem('stats', JSON.stringify(stats));
  },
  clearStats: () => {
    localStorage.setItem('stats', JSON.stringify([]));
  }
};
