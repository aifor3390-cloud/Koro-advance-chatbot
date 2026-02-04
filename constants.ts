
import { ModelSpecs, Language } from './types';

export const KORO_SPECS: ModelSpecs = {
  name: "Koro",
  version: "2.6.0-Flash-Lite",
  parameters: "1.8T Flash Pathways",
  architecture: "Low-Latency Multimodal Transformer",
  author: "Usama"
};

export const INITIAL_MESSAGE = {
  en: "Koro Flash-Lite Online. Ultra-low latency pathways active. Developed by Usama. How can I assist your objectives at speed?",
  es: "Koro Flash-Lite en línea. Vías de latencia ultra baja activas. Desarrollado por Usama. ¿Cómo puedo asistir sus objetivos con rapidez?",
  fr: "Koro Flash-Lite en ligne. Voies à ultra-faible latence activées. Développé par Usama. Comment puis-je vous aider rapidement?",
  ur: "کورو فلیش لائٹ آن لائن۔ انتہائی کم تاخیر والے راستے فعال۔ اسامہ کا تیار کردہ۔ میں تیزی سے آپ کے مقاصد میں کیسے مدد کر سکتا ہوں؟",
  ar: "كورو فلاش لايت متصل. مسارات زمن الوصول المنخفض للغاية نشطة. تم تطويره بواسطة أسامة. كيف يمكنني مساعدتك في أهدافك بسرعة؟"
};

export const UI_STRINGS: Record<Language, any> = {
  en: {
    thinking: "Koro is flashing logic...",
    inputPlaceholder: "Engage with Flash-Lite Engine...",
    newChat: "New Flash Sync",
    history: "Speed Archives",
    developedBy: "Handcrafted by Usama",
    specs: "Flash Architecture",
    modelName: "Fast Designation",
    version: "Active Revision",
    architecture: "Logic Framework",
    settings: "System Config"
  },
  es: {
    thinking: "Koro está procesando...",
    inputPlaceholder: "Interactuar con el motor Flash-Lite...",
    newChat: "Nueva sincronización rápida",
    history: "Archivos rápidos",
    developedBy: "Creado por Usama",
    specs: "Arquitectura Flash",
    modelName: "Designación rápida",
    version: "Revisión activa",
    architecture: "Marco lógico",
    settings: "Configuración"
  },
  fr: {
    thinking: "Koro flashe la logique...",
    inputPlaceholder: "Interagir avec le moteur Flash-Lite...",
    newChat: "Nouvelle synchro flash",
    history: "Archives rapides",
    developedBy: "Conçu par Usama",
    specs: "Architecture Flash",
    modelName: "Désignation rapide",
    version: "Révision active",
    architecture: "Cadre logique",
    settings: "Configuration"
  },
  ur: {
    thinking: "کورو تیزی سے سوچ رہا ہے...",
    inputPlaceholder: "فلیش لائٹ انجن کے ساتھ بات کریں...",
    newChat: "نیا تیز سیشن",
    history: "تاریخی ریکارڈ",
    developedBy: "اسامہ کی تخلیق",
    specs: "فلیش فن تعمیر",
    modelName: "تیز نام",
    version: "فعال ورژن",
    architecture: "منطقی فریم ورک",
    settings: "ترتیبات"
  },
  ar: {
    thinking: "كورو يفكر بسرعة...",
    inputPlaceholder: "تواصل مع محرك فلاش لايت...",
    newChat: "مزامنة سريعة جديدة",
    history: "الأرشيفات السريعة",
    developedBy: "صنع يدويا بواسطة أسامة",
    specs: "هندسة الفلاش",
    modelName: "التسمية السريعة",
    version: "المراجعة النشطة",
    architecture: "إطار المنطق",
    settings: "الإعدادات"
  }
};
