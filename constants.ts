
import { ModelSpecs, Language } from './types';

export const KORO_SPECS: ModelSpecs = {
  name: "Koro",
  version: "2.7.0-Omni",
  parameters: "2.1T Omni Pathways",
  architecture: "Persistent Memory Transformer + Workshop",
  author: "Usama"
};

export const INITIAL_MESSAGE = {
  en: "Koro Omni Online. Brain pathways active. Developed by Usama. I can now generate logos and remember our conversation history. How can I assist?",
  es: "Koro Omni en línea. Vías cerebrales activas. Desarrollado por Usama. Ahora puedo generar logotipos y recordar nuestra historia. ¿Cómo puedo ayudar?",
  fr: "Koro Omni en ligne. Voies cérébrales actives. Développé par Usama. Je peux maintenant générer des logos et mémoriser notre histoire. Comment puis-je vous aider?",
  ur: "کورو اونی آن لائن۔ دماغی راستے فعال۔ اسامہ کا تیار کردہ۔ اب میں لوگو بنا سکتا ہوں اور ہماری گفتگو کی تاریخ یاد رکھ سکتا ہوں۔ میں کیسے مدد کر سکتا ہوں؟",
  ar: "كورو أومني متصل. المسارات الدماغية نشطة. تم تطويره بواسطة أسامة. يمكنني الآن إنشاء شعارات وتذكر تاريخنا. كيف يمكنني مساعدتك؟"
};

// Fixed: Added missing translations for es, fr, and ar to satisfy the Record<Language, any> type requirement
export const UI_STRINGS: Record<Language, any> = {
  en: {
    thinking: "Koro is accessing memory...",
    inputPlaceholder: "Ask to design a logo or just chat...",
    newChat: "New Omni Sync",
    history: "Neural Archives",
    developedBy: "Handcrafted by Usama",
    specs: "Omni Architecture",
    modelName: "Model Designation",
    version: "Active Revision",
    architecture: "Logic Framework",
    settings: "Brain Config"
  },
  es: {
    thinking: "Koro está accediendo a la memoria...",
    inputPlaceholder: "Pide diseñar un logo o simplemente chatea...",
    newChat: "Nueva Sincronización Omni",
    history: "Archivos Neurales",
    developedBy: "Hecho a mano por Usama",
    specs: "Arquitectura Omni",
    modelName: "Designación del Modelo",
    version: "Revisión Activa",
    architecture: "Marco Lógico",
    settings: "Configuración del Cerebro"
  },
  fr: {
    thinking: "Koro accède à la mémoire...",
    inputPlaceholder: "Demandez à concevoir un logo ou discutez simplement...",
    newChat: "Nouvelle Synchronisation Omni",
    history: "Archives Neurales",
    developedBy: "Fabriqué à la main par Usama",
    specs: "Architecture Omni",
    modelName: "Désignation du Modèle",
    version: "Révision Active",
    architecture: "Cadre Logique",
    settings: "Configuration du Cerveau"
  },
  ur: {
    thinking: "کورو دماغ سے معلومات نکال رہا ہے...",
    inputPlaceholder: "لوگو ڈیزائن کرنے کا کہیں یا بات کریں...",
    newChat: "نیا سیشن",
    history: "اعصابی ریکارڈ",
    developedBy: "اسامہ کی تخلیق",
    specs: "اونی فن تعمیر",
    modelName: "بنیادی نام",
    version: "فعال ورژن",
    architecture: "منطقی فریم ورک",
    settings: "دماغی ترتیبات"
  },
  ar: {
    thinking: "كورو يصل إلى الذاكرة...",
    inputPlaceholder: "اطلب تصميم شعار أو مجرد دردشة...",
    newChat: "مزامنة أومني جديدة",
    history: "الأرشيفات العصبية",
    developedBy: "صنع يدويا بواسطة أسامة",
    specs: "هندسة أومني",
    modelName: "تسمية النموذج",
    version: "المراجعة النشطة",
    architecture: "إطار المنطق",
    settings: "تكوين الدماغ"
  }
};
