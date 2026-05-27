/* ============================================================
   CONFIG — Constantes globales de l'application
   ============================================================ */

export const CFG = {
  USER_PREFIX: 'eu_ad5_user_',
  DATA_SUFFIX: '_data',
  LAST_USER_KEY: 'eu_ad5_last_user',
  VERSION: 2,

  /* ── Liste des utilisateurs connus (personnaliser ici) ──
     id    : clé de stockage stable (minuscules, sans espace)
     name  : nom affiché dans l'interface                    */
  KNOWN_USERS: [
    { id: 'Tamina', name: 'Tamina' },
    { id: 'Romaric', name: 'Romaric' },
    { id: 'Julie', name: 'Julie' },
	{ id: 'Milan', name: 'Milan' },
  ],
  JSON_SOURCES: [
    'data/questions_verbal.json',
    'data/questions_verbal_advanced.json',
    'data/questions_numerique.json',
    'data/questions_numerique_advanced.json',
    'data/questions_numerique_batch1.json',
    'data/questions_eu.json',
    'data/questions_eu_avance.json',
    'data/questions_eu_batch1.json',
    'data/questions_eu_batch2.json',
    'data/questions_eu_batch3.json',
    'data/questions_eu_batch4.json',
    'data/questions_eu_batch5.json',
    'data/questions_eu_batch6.json',
    'data/questions_digital_batch1.json',
    'data/questions_digital_batch2.json',
    'data/questions_digital_batch3.json',
    'data/questions_digital_batch4.json',
    'data/questions_digital_batch5.json'
  ],

  /* Paramètres officiels du concours AD5 par épreuve */
  EXAM_PARAMS: {
    verbal:      { questions: 20, minutes: 35, secPerQ: 105, options: 4, label: 'Raisonnement Verbal' },
    numerical:   { questions: 10, minutes: 12, secPerQ:  72, options: 5, label: 'Raisonnement Numérique' },
    abstract:    { questions: 10, minutes: 20, secPerQ: 120, options: 5, label: 'Raisonnement Abstrait' },
    eu_knowledge:{ questions: 30, minutes: 40, secPerQ:  80, options: 4, label: 'Connaissances UE' },
    digital:     { questions: 42, minutes: 30, secPerQ:  43, options: 4, label: 'Compétences Numériques' }
  },
  IMPORT_URL_KEY: 'eu_ad5_import_url'
};

// SVG Engine constants
export const SVG_CONST = {
  SHAPES: ['circle','square','triangle','diamond','cross','star','pentagon','hexagon','arrow'],
  COLORS: ['#003399','#cc2222','#1a7a4a','#cc8800','#666666'],
  COLOR_NAMES: ['bleu','rouge','vert','orange','gris'],
  FILLS: ['filled','outline'],
  SIZES: [1,2,3],
  ROTATIONS: [0,45,90,135,180,225,270,315]
};

// Seed questions (fallback si les JSON ne sont pas disponibles)
export const SEED_QUESTIONS = [
  {id:'sv001',category:'verbal',categoryLabel:'Raisonnement Verbal',text:"LIBRAIRIE → LIVRE, BOULANGERIE → PAIN, PHARMACIE → ?",options:["Médecin","Médicament","Ordonnance","Santé"],correct:1,explanation:"La relation est : lieu de vente → produit principal vendu."},
  {id:'sv002',category:'verbal',categoryLabel:'Raisonnement Verbal',text:"Si tous les A sont des B et certains B sont des C, que peut-on conclure avec certitude ?",options:["Tous les A sont des C","Certains A sont des C","Aucun A n'est un C","On ne peut rien conclure avec certitude"],correct:3,explanation:"On ne peut pas déduire que les A appartiennent aux 'certains B' qui sont aussi C."},
  {id:'sn001',category:'numerical',categoryLabel:'Raisonnement Numérique',text:"Suite : 2, 5, 11, 23, … Quel est le terme suivant ?",options:["35","45","47","46"],correct:2,explanation:"Chaque terme = terme précédent × 2 + 1. 23×2+1 = 47."},
  {id:'sn002',category:'numerical',categoryLabel:'Raisonnement Numérique',text:"Un projet a coûté 240 000 € avec une dérive de +20 %. Quel était le budget initial ?",options:["192 000 €","200 000 €","208 000 €","216 000 €"],correct:1,explanation:"Budget initial × 1,20 = 240 000. Budget = 200 000 €."},
  {id:'seu001',category:'eu_knowledge',categoryLabel:'Connaissances UE',text:"Quel traité a conféré la personnalité juridique internationale à l'UE ?",options:["Traité de Maastricht","Traité d'Amsterdam","Traité de Lisbonne","Traité de Nice"],correct:2,explanation:"Le Traité de Lisbonne (2009) a fusionné l'UE et la CE, conférant une personnalité juridique unique."},
  {id:'seu002',category:'eu_knowledge',categoryLabel:'Connaissances UE',text:"Quelle institution de l'UE détient le droit d'initiative législative exclusive ?",options:["Le Parlement européen","Le Conseil de l'UE","La Commission européenne","La Cour de justice"],correct:2,explanation:"La Commission européenne (art. 17 TUE) détient le droit d'initiative exclusif."},
  {id:'seu003',category:'eu_knowledge',categoryLabel:'Connaissances UE',text:"Combien d'États membres compte actuellement l'UE ?",options:["25","27","28","30"],correct:1,explanation:"Depuis le Brexit (31 janvier 2020), l'UE compte 27 États membres."},
  {id:'sm001',category:'managerial',categoryLabel:'Situations Managériales',text:"Deux membres de votre équipe ont un conflit ouvert. Quelle est votre première action ?",options:["Ignorer la situation","Sanctionner immédiatement","Rencontrer chaque agent séparément puis organiser une médiation","Transférer l'un des agents"],correct:2,explanation:"L'écoute individuelle puis la médiation structurée est la démarche appropriée selon les principes RH de l'UE."}
];

export const SEED_WIKI = [
  {id:'w001',title:"Les 7 institutions de l'UE",content:`**Les 7 institutions officielles** (art. 13 TUE) :\n\n1. **Parlement européen** — Élu au suffrage universel (720 membres depuis 2024).\n2. **Conseil européen** — Chefs d'État. Donne les impulsions politiques.\n3. **Conseil de l'UE** — Ministres des États membres. Co-législateur.\n4. **Commission européenne** — 27 commissaires. Droit d'initiative législative.\n5. **CJUE** — Cour de justice + Tribunal.\n6. **BCE** — Politique monétaire zone euro.\n7. **Cour des comptes** — Contrôle financier.`,tags:['institutions'],updatedAt:new Date().toISOString()},
  {id:'w002',title:"Traités — Chronologie essentielle",content:`- **1957** : Traités de Rome → CEE + Euratom\n- **1992** : Maastricht → UE, citoyenneté, euro\n- **2009** : Lisbonne → Personnalité juridique, SEAE\n\n**Textes en vigueur** : TUE (55 articles) + TFUE (358 articles) + Charte des droits fondamentaux`,tags:['traités'],updatedAt:new Date().toISOString()}
];
