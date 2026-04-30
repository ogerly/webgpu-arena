// arena-prompts.js
// Kategorien und Beispiel-Prompts für den Blind-Test

export const promptCategories = [
  {
    id: 'math',
    label: 'Mathe 🔢',
    prompts: [
      'Was ist 17 × 24?',
      'Ein Zug fährt 120 km/h. Wie lange braucht er für 450 km?',
      'Was ist die Quadratwurzel aus 144?',
      'Löse nach x auf: 2x + 10 = 20',
    ]
  },
  {
    id: 'language_de',
    label: 'Deutsch 🇩🇪',
    prompts: [
      'Schreibe einen kurzen Witz.',
      'Erkläre den Begriff "Weltanschauung" einfach.',
      'Verbessere diesen Satz: "Ich hat gestern viel gelernt."',
      'Schreibe eine formelle E-Mail-Einleitung für eine Bewerbung.',
    ]
  },
  {
    id: 'language_en',
    label: 'English 🇬🇧',
    prompts: [
      'Explain quantum entanglement like I am five.',
      'Write a short poem about rain.',
      'What is the difference between affect and effect?',
      'Summarize the plot of Romeo and Juliet in two sentences.',
    ]
  },
  {
    id: 'reasoning',
    label: 'Logik 🧩',
    prompts: [
      'Alle Katzen haben Fell. Luna ist eine Katze. Was folgt daraus?',
      'Wenn A größer als B ist und B größer als C – was weißt du über A und C?',
      'Welches Wort passt nicht in die Reihe: Apfel, Birne, Auto, Banane?',
    ]
  },
  {
    id: 'creative',
    label: 'Kreativ 🎨',
    prompts: [
      'Schreibe den Anfang einer Geschichte über eine KI, die träumt.',
      'Erfinde einen Namen für eine neue Farbe und beschreibe sie.',
      'Schreibe einen Werbeslogan für ein fliegendes Fahrrad.',
    ]
  },
  {
    id: 'custom',
    label: 'Eigener Prompt ✍️',
    prompts: []
  }
];
