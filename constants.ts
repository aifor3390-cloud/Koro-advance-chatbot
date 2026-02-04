
import { ModelSpecs, Language } from './types';

export const KORO_SPECS: ModelSpecs = {
  name: "Koro",
  version: "2.5.0-Platinum",
  parameters: "1.2T Neural Pathways",
  architecture: "Quantum-Sync Multi-Headed Transformer",
  author: "Usama"
};

export const INITIAL_MESSAGE = {
  en: "Koro System Online. Developed by Usama. How can I assist your objectives today?",
  es: "Sistema Koro en línea. Desarrollado por Usama. ¿Cómo puedo asistir sus objetivos hoy?",
  fr: "Système Koro en ligne. Développé par Usama. Comment puis-je vous aider aujourd'hui?",
  ur: "کورو سسٹم آن لائن۔ اسامہ کا تیار کردہ۔ میں آج آپ کے مقاصد میں کیسے مدد کر سکتا ہوں؟",
  ar: "نظام كورو متصل. تم تطويره بواسطة أسامة. كيف يمكنني مساعدتك في أهدافك اليوم؟"
};

export const UI_STRINGS: Record<Language, any> = {
  en: {
    thinking: "Koro is synthesizing...",
    inputPlaceholder: "Engage with Koro Engine...",
    newChat: "New Synchronization",
    history: "Recent Archives",
    developedBy: "Handcrafted by Usama",
    specs: "Neural Architecture",
    modelName: "Core Designation",
    version: "Active Revision",
    architecture: "Logic Framework",
    settings: "System Config"
  },
  es: {
    thinking: "Koro está sintetizando...",
    inputPlaceholder: "Interactuar con el motor Koro...",
    newChat: "Nueva sincronización",
    history: "Archivos recientes",
    developedBy: "Creado por Usama",
    specs: "Arquitectura Neural",
    modelName: "Designación de núcleo",
    version: "Revisión activa",
    architecture: "Marco lógico",
    settings: "Configuración"
  },
  fr: {
    thinking: "Koro synthétise...",
    inputPlaceholder: "Interagir avec le moteur Koro...",
    newChat: "Nouvelle synchronisation",
    history: "Archives récentes",
    developedBy: "Conçu par Usama",
    specs: "Architecture neuronale",
    modelName: "Désignation principale",
    version: "Revisión active",
    architecture: "Cadre logique",
    settings: "Configuration"
  },
  ur: {
    thinking: "کورو سوچ رہا ہے...",
    inputPlaceholder: "کورو انجن کے ساتھ بات کریں...",
    newChat: "نیا سیشن",
    history: "حالیہ تاریخ",
    developedBy: "اسامہ کی تخلیق",
    specs: "اعصابی فن تعمیر",
    modelName: "بنیادی نام",
    version: "فعال ورژن",
    architecture: "منطقی فریم ورک",
    settings: "ترتیبات"
  },
  ar: {
    thinking: "كورو يقوم بالتحليل...",
    inputPlaceholder: "تواصل مع محرك كورو...",
    newChat: "مزامنة جديدة",
    history: "الأرشيفات الحديثة",
    developedBy: "صنع يدويا بواسطة أسامة",
    specs: "الهندسة العصبية",
    modelName: "التسمية الأساسية",
    version: "المراجعة النشطة",
    architecture: "إطار المنطق",
    settings: "الإعدادات"
  }
};
