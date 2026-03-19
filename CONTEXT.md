# CONTEXT — Projet AD5 Préparation Concours EPSO
## À coller au début de toute session Claude Code pour récupérer le contexte complet

---

## PROJET

Application web de préparation au concours AD5 (EPSO) — administrateurs généraux.
- **URL déployée** : https://romaricponcin.github.io/AD5/
- **Stack** : HTML/CSS/JS single-file SPA + JSON dans `/data/` sur GitHub Pages
- **Stockage** : localStorage par utilisateur (multi-profils)

---

## ARCHITECTURE — 5 épreuves dans `EXAM_PARAMS` de `index.html`

| Épreuve | Questions | Durée | Options |
|---|---|---|---|
| Verbal | 20 | 35 min | 4 |
| Numérique | 10 | 20 min | 5 |
| Abstrait | 10 | 10 min | 5 SVG |
| Connaissances UE | 30 | 40 min | 4 |
| Compétences Numériques | 40 | 30 min | 4 |

---

## FICHIERS DE QUESTIONS — dossier `data/`

### Compétences Numériques DigComp 3.0 — 267 questions, 5 batches ✅ COMPLETS

| Fichier | Questions | Statut |
|---|---|---|
| `questions_digital_batch1.json` | 52 Q | ✅ Validé |
| `questions_digital_batch2.json` | 45 Q | ✅ Validé |
| `questions_digital_batch3.json` | 40 Q | ✅ Validé |
| `questions_digital_batch4.json` | 40 Q | ✅ Validé |
| `questions_digital_batch5.json` | 90 Q | ✅ Validé |

### Connaissances UE — 320 questions, 4 batches ✅ COMPLETS

| Fichier | Questions | Style | Langue |
|---|---|---|---|
| `questions_eu_batch1.json` | 80 Q | Cours | Français |
| `questions_eu_batch2.json` | 80 Q | Cours | Français |
| `questions_eu_batch3.json` | 80 Q | Cours/Mixte | Français |
| `questions_eu_batch4.json` | 80 Q | **EPSO officiel** | **Anglais** |

> ⚠️ Le batch 4 est en anglais (erreur de contexte). Les nouveaux batches doivent être en **français, style EPSO** (questions courtes, options concises 3-6 mots, distracteurs plausibles).

### À générer encore

| Épreuve | Statut |
|---|---|
| Raisonnement Verbal | ⏳ À créer (textes UE + questions d'inférence) |
| Raisonnement Numérique | ⏳ À refaire (5 options + graphiques/tableaux) |
| Raisonnement Abstrait | ⚠️ SVG généré mais vérifier passage à 5 options |

---

## FORMAT JSON STANDARD — Questions EU

```json
{
  "id": "eu5_001",
  "category": "eu",
  "categoryLabel": "Connaissances UE",
  "theme": "Institutions - Commission",
  "difficulty": 2,
  "text": "Quel organe détient le droit d'initiative législative dans l'UE ?",
  "options": ["Le Parlement européen", "La Commission européenne", "Le Conseil de l'UE", "Le Conseil européen"],
  "correct": 1,
  "explanation": "La Commission européenne détient le quasi-monopole du droit d'initiative législative (art. 17 TUE)."
}
```

---

## FORMAT JSON STANDARD — Questions DigComp

```json
{
  "id": "dcb5_001",
  "category": "digital",
  "categoryLabel": "Compétences Numériques",
  "digCompArea": "1",
  "proficiencyLevel": "intermediate",
  "aiLabel": "non-ai",
  "theme": "Littératie des données",
  "difficulty": 2,
  "text": "Qu'est-ce qu'un cookie de traçage ?",
  "options": ["Un fichier stockant vos préférences de navigation", "Un fichier permettant de suivre votre navigation entre sites", "Un programme antivirus intégré au navigateur", "Un certificat de sécurité HTTPS"],
  "correct": 1,
  "explanation": "..."
}
```

---

## CONTRAINTES PSYCHOMÉTRIQUES OBLIGATOIRES

Tout nouveau batch de 80 questions doit respecter :

1. **Distribution des positions** : exactement 20/20/20/20 (A=20, B=20, C=20, D=20)
2. **Ratio longueur max/min** : ≤ 1.40 pour toutes les options de chaque question
3. **Validation Python** :

```python
import json
with open('questions_eu_batchX.json') as f:
    data = json.load(f)

pos = {0:0,1:0,2:0,3:0}
biased = []
for q in data:
    pos[q['correct']] += 1
    lens = [len(o.split()) for o in q['options']]
    r = max(lens)/min(lens)
    if r > 1.4:
        biased.append(f"{q['id']} r={r:.2f} {lens}")

print(f"Positions: {pos}")
print(f"Biaisées: {len(biased)}")
for b in biased[:10]: print(b)
```

---

## STYLE EPSO — Règles de formulation

Basé sur les 5 questions officielles EPSO (PDF public eu-careers.europa.eu) :

| Critère | Règle |
|---|---|
| Question | Courte et directe (5-12 mots) |
| Options | Courtes (3-6 mots idéalement), noms propres ou courtes descriptions |
| Distracteurs | Plausibles — institutions voisines, dates proches, acronymes réels |
| Type | Fait précis, date, chiffre, nom exact, rôle institutionnel |
| Langue | **Français** (sauf batch 4 qui est anglais — à corriger à terme) |

### Exemples EPSO officiels
```
Q: "Quel accord a établi l'UE dans sa forme actuelle ?"
A: Traité de Maastricht  B: Traité de Lisbonne  C: Traité d'Amsterdam  D: Traité de Nice

Q: "Quelle institution interprète le droit de l'UE ?"
A: Parlement européen  B: Conseil européen  C: Commission  D: Cour de justice
```

---

## THÈMES DÉJÀ COUVERTS (320 Q existantes)

Batches 1-3 (français) — thèmes principaux :
- Acte Unique Européen, institutions, Conseil européen vs Conseil de l'UE
- Traité de Lisbonne, art. 50, SEAE, droits fondamentaux
- CJUE, Van Gend en Loos, Costa v ENEL, Cassis de Dijon, Dassonville
- Couple franco-allemand, AELE, PEV, groupe de Visegrád
- PAC, marché intérieur, Schengen, Dublin, Frontex
- Green Deal, ETS, Fit for 55, NextGenerationEU (750 Md€)
- RGPD, DSA, DMA, AI Act, Galileo, Copernicus
- BCE (objectif 2%), PSC (3%/60%), MES, PESCO, boussole stratégique
- Erasmus+ (26,2 Md€), Horizon Europe (95,5 Md€), ESF+
- EPPO, OLAF, Eurojust, Médiateur européen
- Élargissements (2004, 2007, 2013), Ukraine/Moldavie candidats (juin 2022)

Batch 4 (anglais EPSO) — mêmes thèmes, formulation officielle EPSO.

---

## DOCUMENTS SOURCE DISPONIBLES

Documents fournis par l'utilisateur (tous dans `/mnt/user-data/uploads/` sur claude.ai) :
- `Acte_unique_.docx` — Acte unique européen détaillé
- `COE_202021_QUESTION_COMPILATION.pdf` — Compilation questions Collège d'Europe
- `Connaissances_Europe_Russie.docx` — Relations UE-Russie
- `Couples_Franco-Allemand.docx` — Histoire du couple franco-allemand
- `Fiche_IUE.docx` — Fiche Institut Universitaire Européen
- `Fiche_Union_européenne_en_1_page.pdf` — Fiche synthèse UE
- `Fiches_Pierre.pdf` — Fiches de révision détaillées
- `Histoire_de_la_pensée_européenne.doc` — Pensée européenne
- `Institutions_de_l_UE.docx` — Cours institutions Rostane
- `Institutions_européennes.docx` — Fiches institutions
- `JRC144121_01.pdf` — **Non encore traité**

---

## PROCHAINES ÉTAPES

### Priorité 1 — Connaissances UE (en cours)
Générer des batches supplémentaires (batch 5, 6...) en **français style EPSO** à partir des nouveaux documents fournis par l'utilisateur.

### Priorité 2 — Corriger batch 4
Réécrire les 80 questions du batch 4 en **français** (actuellement en anglais).

### Priorité 3 — Raisonnement Verbal
- 20 questions / 35 min / 4 options
- Format : texte de référence (100-150 mots sur un sujet UE) + question d'inférence
- Textes tirés des publications officielles UE

### Priorité 4 — Raisonnement Numérique
- 10 questions / 20 min / **5 options** (A à E)
- Graphiques/tableaux obligatoires (générés en SVG ou HTML canvas)
- Fichiers actuels à refaire entièrement (format incompatible)

### Priorité 5 — Raisonnement Abstrait
- Vérifier que le mode 5 options est actif dans index.html
- SVG procédural déjà généré — vérifier la compatibilité

---

## COMMANDES UTILES POUR CLAUDE CODE

```bash
# Valider un batch
python3 -c "
import json
with open('data/questions_eu_batch5.json') as f:
    data=json.load(f)
pos={0:0,1:0,2:0,3:0}
for q in data: pos[q['correct']]+=1
print('Positions:',pos)
biased=[q['id'] for q in data if max(len(o.split()) for o in q['options'])/min(len(o.split()) for o in q['options'])>1.4]
print(f'Biaisées: {len(biased)}')
"

# Compter le total de questions par catégorie
python3 -c "
import json, glob
for cat in ['eu','digital']:
    total=0
    for f in glob.glob(f'data/questions_{cat}_batch*.json'):
        data=json.load(open(f))
        total+=len(data)
        print(f'{f}: {len(data)}Q')
    print(f'TOTAL {cat}: {total}Q\n')
"
```

---

## NOTE POUR CLAUDE CODE

Ce projet est géré **principalement sur claude.ai** pour la génération de contenu (questions, JSON).
Claude Code / VS Code est utilisé pour :
- Modifier `index.html` (UI, logique, EXAM_PARAMS)
- Intégrer les nouveaux fichiers JSON dans `data/`
- Déployer sur GitHub Pages (`git push`)
- Déboguer l'interface utilisateur

Pour générer de nouvelles questions EU, **continuer sur claude.ai** et importer les JSON générés.
