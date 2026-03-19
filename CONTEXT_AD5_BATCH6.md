# CONTEXTE PROJET AD5 — À COLLER EN DÉBUT DE NOUVELLE CONVERSATION

## Résumé du projet
Application web de préparation au concours EPSO AD5 2026.
Déployée sur : https://romaricponcin.github.io/AD5/
Stack : HTML/CSS/JS single-file SPA + fichiers JSON dans /data/

## État actuel — Questions générées

### Compétences Numériques DigComp 3.0 — 267 questions ✅
- questions_digital_batch1.json (52Q)
- questions_digital_batch2.json (45Q)
- questions_digital_batch3.json (40Q)
- questions_digital_batch4.json (40Q)
- questions_digital_batch5.json (90Q)

### Connaissances UE — 480 questions ✅
- questions_eu_batch1.json — 80Q (AUE, institutions, traités, droit UE, couple franco-allemand)
- questions_eu_batch2.json — 80Q (CFP, MES, subsidiarité, Green Deal, transparence)
- questions_eu_batch3.json — 80Q (Commerce, Schengen, migration, numérique, RGPD, défense)
- questions_eu_batch4.json — 80Q (STYLE EPSO officiel — jurisprudence, traités, institutions)
- questions_eu_batch5.json — 80Q (Droit UE approfondi, élections 2024, budget, Frontex, Spitzenkandidat)
- questions_eu_batch6.json — 80Q (Rapport Draghi, Maastricht approfondi, Esprit européen, PAC, environnement, Lisbonne approfondi, défense/espace)

## Format JSON des questions EU
```json
{
  "id": "eu6_001",
  "category": "eu",
  "categoryLabel": "Connaissances UE",
  "theme": "Nom du thème",
  "difficulty": 2,
  "text": "Question courte et directe style EPSO ?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correct": 1,
  "explanation": "Explication de la bonne réponse."
}
```

## Standards psychométriques OBLIGATOIRES
1. Distribution positions : exactement 20/20/20/20 sur 80 questions (A=20, B=20, C=20, D=20)
2. Ratio longueur options : max/min ≤ 1.40 pour toutes les options d'une même question
3. Distracteurs plausibles du même domaine sémantique

## Style EPSO (à respecter impérativement)
- Questions courtes et directes (5-12 mots)
- Options concises (3-8 mots), noms propres ou courtes descriptions
- Distracteurs plausibles (institutions voisines, dates proches, noms similaires)
- Faits précis et testables (dates, chiffres, articles, noms exacts)
- Langue : FRANÇAIS

### Exemple de question style EPSO correct
```
"Quel arrêt de 1963 a établi l'effet direct du droit européen ?"
A. Costa c. ENEL (1964)
B. Cassis de Dijon (1979)
C. Van Gend en Loos (1963)  ← CORRECT
D. Dassonville (1974)
```

## Thèmes déjà couverts (à éviter les doublons)
Institutions UE (9Q), Marché intérieur (8Q), Procédure législative (9Q),
AUE (8Q), Histoire et traités (7Q), Couple franco-allemand (7Q),
UEM et euro (6Q), Transparence et lobbying (6Q), Green Deal (5Q),
Compétences de l'UE (7Q), Sources du droit UE (5Q), Traité de Lisbonne (5Q),
Espace Schengen (4Q), Élargissements successifs (5Q), PAC (5Q),
Citoyenneté européenne (5Q), PESC et défense (5Q), Politique numérique (5Q),
Droits fondamentaux (5Q), Europe sociale (5Q), Budget UE (7Q),
Effet direct du droit UE (4Q), Primauté du droit UE (4Q),
Recours en annulation (4Q), Renvoi préjudiciel (3Q), Spitzenkandidat (4Q),
Frontex (3Q), Élections européennes (6Q), Groupes politiques PE (3Q),
Théories de l'intégration (8Q), Agences européennes (6Q), Migration (3Q),
RGPD (3Q), Politique régionale et cohésion (4Q), Budget recettes/dépenses (7Q)...

## Documents sources déjà traités (NE PAS RE-TRAITER)
- Acte_unique_.docx
- COE_202021_QUESTION_COMPILATION.pdf
- Connaissances_Europe_Russie.docx
- Couples_Franco-Allemand.docx
- Fiche_IUE.docx
- Fiche_Union_européenne_en_1_page.pdf
- Fiches_Pierre.pdf (notes Collège d'Europe Pierre Minoves)
- Institutions_de_l_UE.docx (cours Rostane)
- Institutions_de_l_UE.png
- Institutions_européennes.docx
- INSTITUTIONS-DE-LUNION-EUROPÉENNE.pdf
- L_EUROPE_-_Fiche_Grand_O.pdf (fiche prépa Sciences Po complète)
- JRC144121_01.pdf (DigComp 3.0 — déjà utilisé pour les questions numériques)

## Documents traités dans le batch 6
- l_esprit europeģen.doc (esprit européen, identité, Mme de Staël, Husserl, Kundera)
- Le traité de Maastricht.docx (3 piliers, UEM, citoyenneté, PESC, JAI, Europol)
- Le traité de Lisbonne.docx (TFUE/TUE, majorité qualifiée, BCE, Art.50, initiative citoyenne)
- La Politique Agricole Commune.docx (piliers, éco-régimes, conditionnalité, subsidiarité)
- Les politiques environnementales de l.docx (LIFE, Green Deal, loi climat, principes)
- Note n° 1 Résumé rapport Draghi.pdf (compétitivité, énergie, défense, numérique, espace)

## Tâche à poursuivre
Générer le BATCH 6 (80 questions) à partir des nouveaux documents fournis.
Thèmes prioritaires non encore couverts ou sous-couverts :
- L'esprit européen / identité européenne approfondie
- Politique de sécurité intérieure (SIS, EURODAC, VIS)
- Union des marchés de capitaux (approfondi)
- Euro numérique (approfondi)
- Politique de santé (HERA, ECDC, EMA)
- Relations UE-Afrique (accords SAMOA)
- Démocratie européenne (dialogue social, CESE, Comité des régions)
- Politique de concurrence de l'UE
- Droits des citoyens (médiateur, initiative citoyenne, pétition)

## Commande pour démarrer
"Voici le contexte du projet AD5 (voir fichier joint).
Voici [N] nouveaux documents à traiter pour générer le batch 6 (80 questions).
Utilise le style EPSO français avec validation psychométrique 20/20/20/20."
