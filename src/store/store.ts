export interface AppSettings {
  adminPassword: string;
  vipPassword?: string;
  externalApiKey?: string;
  webhookUrl?: string;
  supportInfoTemplate?: string;
}

export interface ProxySettings {
  host: string;
  port: string;
  protocol: 'HTTP' | 'SOCKS5';
  isEnabled: boolean;
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
    const defaultTemplate = `App: com.whatsapp.w5b
Architecture: aarch64
AutoConf status: null
Board: {{BOARD}}
Build: {{BUILD}}
CCode: YE
CPU ABI: arm64-v8a
Carrier: {{CARRIER}}
Description: 2.25.29.77
Device: {{MODEL}}
Device ID: {{RANDOM_ID}}
Device ISO8601: {{ISO_DATE}}
Embeddings Index: state: NOT_STARTED, progress: 0, finished: --, last updated: --
FAQ Results Read: 10
FAQ Results Returned: 10
Is Foldable: false
Is Tablet: false
Kernel: Unknown release unknown version
LC: IN
LG: ar
Manufacturer: {{MFG}}
Missing Permissions: android.permission.READ_EXTERNAL_STORAGE, android.permission.NEARBY_WIFI_DEVICES, android.permission.BLUETOOTH_SCAN, android.permission.BLUETOOTH_ADVERTISE, android.permission.SYSTEM_ALERT_WINDOW, android.permission.MANAGE_EXTERNAL_STORAGE, android.permission.BLUETOOTH_CONNECT, com.whatsapp.permission.MIGRATION_CONTENT_PROVIDER, android.permission.ACCESS_COARSE_LOCATION, android.permission.ACCESS_FINE_LOCATION, android.permission.FOREGROUND_SERVICE_MICROPHONE, android.permission.FOREGROUND_SERVICE_CAMERA, android.permission.FOREGROUND_SERVICE_MEDIA_PROJECTION, android.permission.FOREGROUND_SERVICE_PHONE_CALL, android.permission.FOREGROUND_SERVICE_DATA_SYNC, android.permission.DETECT_SCREEN_CAPTURE, android.permission.CALL_PHONE, android.permission.WRITE_EXTERNAL_STORAGE, android.permission.RUN_USER_INITIATED_JOBS, android.permission.ACCESS_MEDIA_LOCATION, android.permission.FOREGROUND_SERVICE_LOCATION, android.permission.INSTALL_SHORTCUT, android.permission.READ_PHONE_NUMBERS
Model: {{MODEL}}
Network Type: L.T.E.
OS: {{OS}}
PSI abprops:: ai_psi_enabled:false, semantic_search_enabled:false
Phone Type: G.S.M.
Product: {{MODEL}}
Radio MCC-MNC: {{MCC_MNC}}
SIM MCC-MNC: {{MCC_MNC}}
Target: release
Version: 2.25.29.77
Debug info: unregistered
MDEnabled: true
HasMdCompanion: true
Context: register-phone-invalid
useragent: {{USER_AGENT}}
Socket Conn: DN
Free Space Built-In: 9321644032 (٩٫٣٢ غ.ب)
Free Space Removable: 9321644032 (٩٫٣٢ غ.ب)
Smb count: 0
Ent count: 0
Connection: W.I.F.I.
Diagnostic Codes: FE-GDE FE-GDC FE-VIDC
Sim: null 5
Network metered: 100:false;186:false
Network restricted: 100:true;186:false
Data roaming: false
Tel roaming: false
ABprops hash state: unregistered
Serverprops hash state: unregistered
anid: {{UUID}}
XPMigrated: no
backup-restore: backup:0
Screen reader: false
Fingerprint eligible: true
pn: {{PHONE}}`;
    
    return data ? JSON.parse(data) : { 
      adminPassword: '716023560', 
      vipPassword: 'vip', 
      externalApiKey: '', 
      webhookUrl: '',
      supportInfoTemplate: defaultTemplate
    };
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
  },
  
  getProxySettings: (): ProxySettings => {
    const data = localStorage.getItem('proxySettings');
    return data ? JSON.parse(data) : { host: '', port: '', protocol: 'HTTP', isEnabled: false };
  },
  saveProxySettings: (settings: ProxySettings) => {
    localStorage.setItem('proxySettings', JSON.stringify(settings));
    // Dispatch event to notify services of change
    window.dispatchEvent(new CustomEvent('proxyChanged', { detail: settings }));
  }
};
