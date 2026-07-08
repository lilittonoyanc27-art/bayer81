export interface Question {
  id: number;
  sentence: string; // e.g. "Es importante que tú ___ temprano."
  options: string[]; // e.g. ["llegas", "llegues", "llegarás", "llegaste"]
  correctIndex: number; // index of correct option
  translation: string; // Armenian translation
  explanation: string; // Explaining the rule in Armenian & Spanish
  indicativoSubjuntivoRule: string; // e.g. "Impersonal expression + que -> Subjuntivo"
}

export interface DialoguePart {
  speaker: 'A' | 'B';
  sentenceWithBlank: string; // "Creo que Pablo ___ a venir con nosotros a Madrid."
  options: string[]; // ["viene", "venga"]
  correctIndex: number;
  translation: string; // Armenian translation of this specific sentence
  explanation: string;
}

export interface Dialogue {
  id: number;
  title: string;
  translationTitle: string;
  parts: DialoguePart[];
}

export const round1Questions: Question[] = [
  {
    id: 1,
    sentence: "Es importante que tú ___ temprano.",
    options: ["llegas", "llegues", "llegarás", "llegaste"],
    correctIndex: 1, // llegues (B)
    translation: "Կարևոր է, որ դու շուտ հասնես։",
    explanation: "«Es importante que»-ն անդեմ արտահայտություն է (expresión impersonal), որն արտահայտում է անհրաժեշտություն, ուստի պահանջում է Subjuntivo (llegues):",
    indicativoSubjuntivoRule: "Impersonal Expression -> Subjuntivo"
  },
  {
    id: 2,
    sentence: "Quiero que ella ___ feliz.",
    options: ["es", "sea", "será", "fue"],
    correctIndex: 1, // sea (B)
    translation: "Ես ուզում եմ, որ նա երջանիկ լինի։",
    explanation: "Կամքի կամ ցանկության արտահայտումը (Quiero que...) պահանջում է Subjuntivo-ի կիրառում (sea):",
    indicativoSubjuntivoRule: "Voluntad/Deseo -> Subjuntivo"
  },
  {
    id: 3,
    sentence: "No creo que ellos ___ la verdad.",
    options: ["saben", "sepan", "sabrán", "supieron"],
    correctIndex: 1, // sepan (B)
    translation: "Ես չեմ կարծում, որ նրանք գիտեն ճշմարտությունը։",
    explanation: "Ժխտական կարծիքը (No creo que...) կասկած է առաջացնում, ուստի պահանջում է Subjuntivo (sepan):",
    indicativoSubjuntivoRule: "Duda/Negación -> Subjuntivo"
  },
  {
    id: 4,
    sentence: "Es posible que nosotros ___ mañana.",
    options: ["viajamos", "viajemos", "viajaremos", "viajábamos"],
    correctIndex: 1, // viajemos (B)
    translation: "Հնարավոր է, որ մենք վաղը ճանապարհորդենք։",
    explanation: "Հավանականություն արտահայտող անդեմ կառույցը (Es posible que...) միշտ պահանջում է Subjuntivo (viajemos):",
    indicativoSubjuntivoRule: "Posibilidad -> Subjuntivo"
  },
  {
    id: 5,
    sentence: "Dudo que él ___ español.",
    options: ["habla", "hable", "hablará", "habló"],
    correctIndex: 1, // hable (B)
    translation: "Ես կասկածում եմ, որ նա իսպաներեն է խոսում։",
    explanation: "Կասկածի բայերը (Dudo que...) անմիջապես պահանջում են Subjuntivo-ի գործածում (hable):",
    indicativoSubjuntivoRule: "Duda -> Subjuntivo"
  },
  {
    id: 6,
    sentence: "Busco un hotel que ___ cerca del mar.",
    options: ["está", "esté", "estará", "estuvo"],
    correctIndex: 1, // esté (B)
    translation: "Ես փնտրում եմ հյուրանոց, որը ծովի մոտ է (որևէ հյուրանոց, որ դեռ չգիտեմ՝ կա թե ոչ)։",
    explanation: "Երբ փնտրում ենք անորոշ կամ դեռևս անհայտ հատկանիշներով օբյեկտ (antecedente no existente/indefinido), օգտագործում ենք Subjuntivo (esté):",
    indicativoSubjuntivoRule: "Antecedente indefinido -> Subjuntivo"
  },
  {
    id: 7,
    sentence: "Es necesario que tú ___ más agua.",
    options: ["bebes", "bebas", "beberás", "bebiste"],
    correctIndex: 1, // bebas (B)
    translation: "Անհրաժեշտ է, որ դու ավելի շատ ջուր խմես։",
    explanation: "«Es necesario que»-ն պարտադրանք կամ կարիք արտահայտող անդեմ կառույց է, որն իրենից հետո պահանջում է Subjuntivo (bebas):",
    indicativoSubjuntivoRule: "Necesidad -> Subjuntivo"
  },
  {
    id: 8,
    sentence: "No pienso que ella ___ razón.",
    options: ["tiene", "tenga", "tendrá", "tuvo"],
    correctIndex: 1, // tenga (B)
    translation: "Ես չեմ կարծում, որ նա ճիշտ է։",
    explanation: "Ժխտված մտածողության բայը (No pienso que...) ստեղծում է անորոշություն, ինչի պատճառով օգտագործվում է Subjuntivo (tenga):",
    indicativoSubjuntivoRule: "Opinión Negativa -> Subjuntivo"
  },
  {
    id: 9,
    sentence: "Ojalá que nosotros ___ suerte.",
    options: ["tememos", "tengamos", "tendremos", "tuvimos"],
    correctIndex: 1, // tengamos (B)
    translation: "Թող որ մենք հաջողություն ունենանք։",
    explanation: "«Ojalá (que)» բառը միշտ հարուցում է Subjuntivo (tengamos)՝ արտահայտելով բարեմաղթանք կամ ուժգին ցանկություն։",
    indicativoSubjuntivoRule: "Ojalá -> Subjuntivo"
  },
  {
    id: 10,
    sentence: "Quiero que tú me ___ la verdad.",
    options: ["dices", "digas", "dirás", "dijiste"],
    correctIndex: 1, // digas (B)
    translation: "Ես ուզում եմ, որ դու ինձ ասես ճշմարտությունը։",
    explanation: "Ցանկություն արտահայտող կառույցը (Quiero que...) պահանջում է, որ երկրորդ դեմքի գործողությունը լինի Subjuntivo-ով (digas):",
    indicativoSubjuntivoRule: "Influencia/Deseo -> Subjuntivo"
  },
  {
    id: 11,
    sentence: "Es mejor que ustedes ___ aquí.",
    options: ["están", "estén", "estarán", "estuvieron"],
    correctIndex: 1, // estén (B)
    translation: "Ավելի լավ է, որ դուք այստեղ լինեք։",
    explanation: "Գնահատողական անդեմ արտահայտությունները (Es mejor que...) պահանջում են Subjuntivo (estén):",
    indicativoSubjuntivoRule: "Valoración -> Subjuntivo"
  },
  {
    id: 12,
    sentence: "No es seguro que él ___ venir.",
    options: ["puede", "pueda", "podrá", "pudo"],
    correctIndex: 1, // pueda (B)
    translation: "Վստահ չէ, որ նա կարող է գալ։",
    explanation: "Անվստահություն կամ ժխտված համոզմունք արտահայտող «No es seguro que» կառույցը պահանջում է Subjuntivo (pueda):",
    indicativoSubjuntivoRule: "Falta de certeza -> Subjuntivo"
  },
  {
    id: 13,
    sentence: "Me alegra que tú ___ bien.",
    options: ["estás", "estés", "estarás", "estuviste"],
    correctIndex: 1, // estés (B)
    translation: "Ես ուրախ եմ, որ դու լավ ես։",
    explanation: "Հուզական վերաբերմունք արտահայտող բայերը (Me alegra que...) միշտ պահանջում են Subjuntivo (estés) երկրորդական նախադասության մեջ։",
    indicativoSubjuntivoRule: "Emoción -> Subjuntivo"
  },
  {
    id: 14,
    sentence: "Espero que ellos ___ pronto.",
    options: ["llegan", "lleguen", "llegarán", "llegaron"],
    correctIndex: 1, // lleguen (B)
    translation: "Հուսով եմ, որ նրանք շուտ կգան։",
    explanation: "Հույս և ակնկալիք արտահայտող «Esperar que...» կառույցը պահանջում է Subjuntivo (lleguen):",
    indicativoSubjuntivoRule: "Esperanza -> Subjuntivo"
  },
  {
    id: 15,
    sentence: "Es posible que yo ___ tarde.",
    options: ["llego", "llegue", "llegaré", "llegué"],
    correctIndex: 1, // llegue (B)
    translation: "Հնարավոր է, որ ես ուշ գամ։",
    explanation: "Հավանականություն (Es posible que...) արտահայտող դեպքում գործածվում է Subjuntivo (llegue):",
    indicativoSubjuntivoRule: "Posibilidad -> Subjuntivo"
  },
  {
    id: 16,
    sentence: "No creo que tú ___ eso.",
    options: ["haces", "hagas", "harás", "hiciste"],
    correctIndex: 1, // hagas (B)
    translation: "Ես չեմ կարծում, որ դու դա անում ես։",
    explanation: "Կասկածամտություն և կարծիքի ժխտում (No creo que...) -> Subjuntivo (hagas):",
    indicativoSubjuntivoRule: "Incredulidad -> Subjuntivo"
  },
  {
    id: 17,
    sentence: "Es bueno que ella ___ con nosotros.",
    options: ["viene", "venga", "vendrá", "vino"],
    correctIndex: 1, // venga (B)
    translation: "Լավ է, որ նա գալիս է մեզ հետ։",
    explanation: "Գնահատողական կառույցը (Es bueno que...) իրենից հետո պահանջում է Subjuntivo (venga):",
    indicativoSubjuntivoRule: "Valoración positiva -> Subjuntivo"
  },
  {
    id: 18,
    sentence: "Quiero que nosotros ___ juntos.",
    options: ["trabajamos", "trabajemos", "trabajaremos", "trabajábamos"],
    correctIndex: 1, // trabajemos (B)
    translation: "Ես ուզում եմ, որ մենք միասին աշխատենք։",
    explanation: "Ցանկության կատարում այլոց կողմից (Quiero que nosotros...) -> Subjuntivo (trabajemos):",
    indicativoSubjuntivoRule: "Deseo colectivo -> Subjuntivo"
  },
  {
    id: 19,
    sentence: "Es importante que él ___ atención.",
    options: ["presta", "preste", "prestará", "prestó"],
    correctIndex: 1, // preste (B)
    translation: "Կարևոր է, որ նա ուշադրություն դարձնի։",
    explanation: "Անդեմ կարևորություն (Es importante que...) -> Subjuntivo (preste):",
    indicativoSubjuntivoRule: "Importancia -> Subjuntivo"
  },
  {
    id: 20,
    sentence: "Dudo que ustedes ___ la respuesta.",
    options: ["conocen", "conozcan", "conocerán", "conocieron"],
    correctIndex: 1, // conozcan (B)
    translation: "Ես կասկածում եմ, որ դուք գիտեք պատասխանը։",
    explanation: "Կասկածի արտահայտումը (Dudo que...) ուղղակիորեն պահանջում է Subjuntivo (conozcan):",
    indicativoSubjuntivoRule: "Duda manifiesta -> Subjuntivo"
  }
];

export const round2Questions: Question[] = [
  {
    id: 1,
    sentence: "Creo que él ___ la verdad.",
    options: ["sabe", "sepa"],
    correctIndex: 0, // sabe (A)
    translation: "Ես կարծում եմ, որ նա գիտի ճշմարտությունը։",
    explanation: "Հաստատական կարծիքը (Creo que...) արտահայտում է համոզմունք, ուստի պահանջում է Indicativo (sabe):",
    indicativoSubjuntivoRule: "Creo que -> Indicativo"
  },
  {
    id: 2,
    sentence: "No creo que él ___ la verdad.",
    options: ["sabe", "sepa"],
    correctIndex: 1, // sepa (B)
    translation: "Ես չեմ կարծում, որ նա գիտի ճշմարտությունը։",
    explanation: "Կարծիքի ժխտումը (No creo que...) առաջացնում է անվստահություն, ինչի պատճառով պահանջվում է Subjuntivo (sepa):",
    indicativoSubjuntivoRule: "No creo que -> Subjuntivo"
  },
  {
    id: 3,
    sentence: "Es verdad que ella ___ aquí.",
    options: ["está", "esté"],
    correctIndex: 0, // está (A)
    translation: "Ճշմարիտ է, որ նա այստեղ է։",
    explanation: "Հաստատուն իրողություն արտահայտող «Es verdad que» կառույցը պահանջում է Indicativo (está):",
    indicativoSubjuntivoRule: "Es verdad que -> Indicativo"
  },
  {
    id: 4,
    sentence: "Es posible que ella ___ aquí.",
    options: ["está", "esté"],
    correctIndex: 1, // esté (B)
    translation: "Հնարավոր է, որ նա այստեղ լինի։",
    explanation: "Հնարավորություն կամ հավանականություն (Es posible que...) -> Subjuntivo (esté):",
    indicativoSubjuntivoRule: "Es posible que -> Subjuntivo"
  },
  {
    id: 5,
    sentence: "Pienso que tú ___ razón.",
    options: ["tienes", "tengas"],
    correctIndex: 0, // tienes (A)
    translation: "Ես կարծում եմ, որ դու ճիշտ ես։",
    explanation: "Հաստատական կարծիքը (Pienso que...) արտահայտում է մտավոր համոզմունք -> Indicativo (tienes):",
    indicativoSubjuntivoRule: "Pienso que -> Indicativo"
  },
  {
    id: 6,
    sentence: "No pienso que tú ___ razón.",
    options: ["tienes", "tengas"],
    correctIndex: 1, // tengas (B)
    translation: "Ես չեմ կարծում, որ դու ճիշտ ես։",
    explanation: "Մտածողության բայի ժխտումը (No pienso que...) պահանջում է Subjuntivo (tengas):",
    indicativoSubjuntivoRule: "No pienso que -> Subjuntivo"
  },
  {
    id: 7,
    sentence: "Sé que ellos ___ en Madrid.",
    options: ["viven", "vivan"],
    correctIndex: 0, // viven (A)
    translation: "Ես գիտեմ, որ նրանք ապրում են Մադրիդում։",
    explanation: "Հաստատուն գիտելիքը (Sé que...) արտահայտում է բացարձակ վստահություն -> Indicativo (viven):",
    indicativoSubjuntivoRule: "Saber que -> Indicativo"
  },
  {
    id: 8,
    sentence: "Dudo que ellos ___ en Madrid.",
    options: ["viven", "vivan"],
    correctIndex: 1, // vivan (B)
    translation: "Ես կասկածում եմ, որ նրանք ապրում են Մադրիդում։",
    explanation: "Կասկած արտահայտող բայը (Dudo que...) միանշանակ պահանջում է Subjuntivo (vivan):",
    indicativoSubjuntivoRule: "Dudar que -> Subjuntivo"
  },
  {
    id: 9,
    sentence: "Me alegra que tú ___ bien.",
    options: ["estás", "estés"],
    correctIndex: 1, // estés (B)
    translation: "Ես ուրախ եմ, որ դու լավ ես։",
    explanation: "Զգացմունքային վերաբերմունքը (Me alegra que...) պահանջում է Subjuntivo (estés):",
    indicativoSubjuntivoRule: "Emoción -> Subjuntivo"
  },
  {
    id: 10,
    sentence: "Es cierto que tú ___ bien.",
    options: ["estás", "estés"],
    correctIndex: 0, // estás (A)
    translation: "Ճիշտ է, որ դու լավ ես (համոզմունք)։",
    explanation: "Համոզմունք և հաստատում (Es cierto que...) -> Indicativo (estás):",
    indicativoSubjuntivoRule: "Es cierto que -> Indicativo"
  },
  {
    id: 11,
    sentence: "No creo que ella ___ venir.",
    options: ["puede", "pueda"],
    correctIndex: 1, // pueda (B)
    translation: "Ես չեմ կարծում, որ նա կարող է գալ։",
    explanation: "Ժխտական կարծիք (No creo que...) -> Subjuntivo (pueda):",
    indicativoSubjuntivoRule: "No creo que -> Subjuntivo"
  },
  {
    id: 12,
    sentence: "Creo que ella ___ venir.",
    options: ["puede", "pueda"],
    correctIndex: 0, // puede (A)
    translation: "Ես կարծում եմ, որ նա կարող է գալ։",
    explanation: "Դրական կարծիք (Creo que...) -> Indicativo (puede):",
    indicativoSubjuntivoRule: "Creo que -> Indicativo"
  },
  {
    id: 13,
    sentence: "Es importante que tú ___ temprano.",
    options: ["llegas", "llegues"],
    correctIndex: 1, // llegues (B)
    translation: "Կարևոր է, որ դու շուտ հասնես։",
    explanation: "Անդեմ գնահատում և կարևորություն (Es importante que...) -> Subjuntivo (llegues):",
    indicativoSubjuntivoRule: "Es importante que -> Subjuntivo"
  },
  {
    id: 14,
    sentence: "Sé que tú ___ temprano.",
    options: ["llegas", "llegues"],
    correctIndex: 0, // llegas (A)
    translation: "Ես գիտեմ, որ դու շուտ ես գալիս։",
    explanation: "Գիտելիք և փաստի արձանագրում (Sé que...) -> Indicativo (llegas):",
    indicativoSubjuntivoRule: "Sé que -> Indicativo"
  },
  {
    id: 15,
    sentence: "Ojalá que él ___ suerte.",
    options: ["tiene", "tenga"],
    correctIndex: 1, // tenga (B)
    translation: "Թող որ նա հաջողություն ունենա։",
    explanation: "Իղձ և ցանկություն «Ojalá»-ով -> միշտ Subjuntivo (tenga):",
    indicativoSubjuntivoRule: "Ojalá -> Subjuntivo"
  },
  {
    id: 16,
    sentence: "Es verdad que él ___ suerte.",
    options: ["tiene", "tenga"],
    correctIndex: 0, // tiene (A)
    translation: "Ճիշտ է, որ նա հաջողություն ունի։",
    explanation: "Օբյեկտիվ իրողություն (Es verdad que...) -> Indicativo (tiene):",
    indicativoSubjuntivoRule: "Es verdad que -> Indicativo"
  },
  {
    id: 17,
    sentence: "Busco un hotel que ___ barato.",
    options: ["es", "sea"],
    correctIndex: 1, // sea (B)
    translation: "Ես փնտրում եմ հյուրանոց, որը էժան է (ցանկացած էժան հյուրանոց, դեռ չգիտեմ որն է)։",
    explanation: "Անհայտ կամ փնտրվող հատկանիշներով օբյեկտ -> Subjuntivo (sea):",
    indicativoSubjuntivoRule: "Antecedente desconocido -> Subjuntivo"
  },
  {
    id: 18,
    sentence: "Este hotel ___ barato.",
    options: ["es", "sea"],
    correctIndex: 0, // es (A)
    translation: "Այս հյուրանոցը էժան է։",
    explanation: "Կոնկրետ հայտնի օբյեկտի փաստացի նկարագրություն -> Indicativo (es):",
    indicativoSubjuntivoRule: "Hecho real -> Indicativo"
  },
  {
    id: 19,
    sentence: "No pienso que ellos ___ listos.",
    options: ["están", "estén"],
    correctIndex: 1, // estén (B)
    translation: "Ես չեմ կարծում, որ նրանք պատրաստ են։",
    explanation: "Կարծիքի ժխտում (No pienso que...) -> Subjuntivo (estén):",
    indicativoSubjuntivoRule: "No pienso que -> Subjuntivo"
  },
  {
    id: 20,
    sentence: "Pienso que ellos ___ listos.",
    options: ["están", "estén"],
    correctIndex: 0, // están (A)
    translation: "Ես կարծում եմ, որ նրանք պատրաստ են։",
    explanation: "Կարծիքի հաստատում (Pienso que...) -> Indicativo (están):",
    indicativoSubjuntivoRule: "Pienso que -> Indicativo"
  }
];

export const dialogues: Dialogue[] = [
  {
    id: 1,
    title: "Ճամփորդություն (Viaje)",
    translationTitle: "Դիալոգ 1 — Ճամփորդություն",
    parts: [
      {
        speaker: 'A',
        sentenceWithBlank: "Creo que Pablo ___ a venir con nosotros a Madrid.",
        options: ["viene", "venga"],
        correctIndex: 0, // viene
        translation: "Ես կարծում եմ, որ Պաբլոն մեզ հետ Մադրիդ է գալու։",
        explanation: "«Creo que»-ն հաստատական կարծիք է, ուստի պահանջում է Indicativo (viene):"
      },
      {
        speaker: 'B',
        sentenceWithBlank: "No estoy seguro… no creo que él ___ tiempo.",
        options: ["tiene", "tenga"],
        correctIndex: 1, // tenga
        translation: "Վստահ չեմ… չեմ կարծում, որ նա ժամանակ ունի։",
        explanation: "«No creo que»-ն ժխտական կարծիք է (կասկած), ուստի պահանջում է Subjuntivo (tenga):"
      },
      {
        speaker: 'A',
        sentenceWithBlank: "Es posible que esté ocupado, pero espero que ___ con nosotros.",
        options: ["viene", "venga"],
        correctIndex: 1, // venga
        translation: "Հնարավոր է, որ զբաղված է, բայց հուսով եմ, որ նա մեզ հետ կգա։",
        explanation: "«Espero que»-ն հույս կամ ցանկություն է արտահայտում, ուստի պահանջում է Subjuntivo (venga):"
      },
      {
        speaker: 'B',
        sentenceWithBlank: "Sí, ojalá que todo ___ bien al final.",
        options: ["sale", "salga"],
        correctIndex: 1, // salga
        translation: "Այո, թող ամեն ինչ վերջում լավ ստացվի։",
        explanation: "«Ojalá que»-ն միշտ պահանջում է Subjuntivo (salga):"
      }
    ]
  },
  {
    id: 2,
    title: "Աշխատանք (Trabajo)",
    translationTitle: "Դիալոգ 2 — Աշխատանք",
    parts: [
      {
        speaker: 'A',
        sentenceWithBlank: "Pienso que el jefe ___ contento con el proyecto.",
        options: ["está", "esté"],
        correctIndex: 0, // está
        translation: "Ես կարծում եմ, որ ղեկավարը գոհ է նախագծից։",
        explanation: "«Pienso que»-ն հաստատում է կարծիքը -> Indicativo (está):"
      },
      {
        speaker: 'B',
        sentenceWithBlank: "No pienso que él ___ muy contento… siempre critica todo.",
        options: ["está", "esté"],
        correctIndex: 1, // esté
        translation: "Ես չեմ կարծում, որ նա շատ գոհ է… նա միշտ ամեն ինչ քննադատում է։",
        explanation: "«No pienso que»-ն ժխտում է կարծիքը -> Subjuntivo (esté):"
      },
      {
        speaker: 'A',
        sentenceWithBlank: "Es importante que nosotros ___ el informe hoy.",
        options: ["terminamos", "terminemos"],
        correctIndex: 1, // terminemos
        translation: "Կարևոր է, որ մենք այսօր ավարտենք զեկույցը։",
        explanation: "«Es importante que»-ն անդեմ արտահայտություն է (անհրաժեշտություն) -> Subjuntivo (terminemos):"
      },
      {
        speaker: 'B',
        sentenceWithBlank: "Sí, aunque dudo que él lo ___ sin cambios.",
        options: ["acepta", "acepte"],
        correctIndex: 1, // acepte
        translation: "Այո, բայց կասկածում եմ, որ նա այն կընդունի առանց փոփոխությունների։",
        explanation: "«Dudo que»-ն կասկած է արտահայտում -> Subjuntivo (acepte):"
      }
    ]
  },
  {
    id: 3,
    title: "Ընկերներ (Amigos)",
    translationTitle: "Դիալոգ 3 — Ընկերներ",
    parts: [
      {
        speaker: 'A',
        sentenceWithBlank: "Ojalá que Ana ___ a la fiesta mañana.",
        options: ["viene", "venga"],
        correctIndex: 1, // venga
        translation: "Թող Անան վաղը գա խնջույքին։",
        explanation: "«Ojalá que»-ն միշտ հարուցում է Subjuntivo (venga):"
      },
      {
        speaker: 'B',
        sentenceWithBlank: "No creo que ella ___ porque está enferma.",
        options: ["viene", "venga"],
        correctIndex: 1, // venga
        translation: "Չեմ կարծում, որ նա կգա, որովհետև հիվանդ է։",
        explanation: "«No creo que»-ն ժխտում է համոզմունքը -> Subjuntivo (venga):"
      },
      {
        speaker: 'A',
        sentenceWithBlank: "Qué lástima… pero es bueno que ella ___ en casa y descanse.",
        options: ["está", "esté"],
        correctIndex: 1, // esté
        translation: "Ափսոս… բայց լավ է, որ նա տանն է և հանգստանում է։",
        explanation: "«Es bueno que»-ն գնահատական է տալիս իրավիճակին -> Subjuntivo (esté):"
      },
      {
        speaker: 'B',
        sentenceWithBlank: "Sí, espero que se ___ pronto.",
        options: ["mejora", "mejore"],
        correctIndex: 1, // mejore
        translation: "Այո, հուսով եմ, որ նա շուտ կլավանա։",
        explanation: "«Espero que»-ն հույս կամ բարեմաղթանք է -> Subjuntivo (mejore):"
      }
    ]
  }
];
