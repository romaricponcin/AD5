/* ============================================================
   SVG ENGINE — Génération de questions de raisonnement abstrait
   ============================================================ */
import { SVG_CONST } from './config.js';

export function svgDrawShape(shape, cx, cy, r, fill, color) {
  const fa = fill === 'filled'
    ? `fill="${color}"`
    : `fill="none" stroke="${color}" stroke-width="2.5" stroke-linejoin="round"`;

  switch(shape) {
    case 'circle':
      return `<circle cx="${cx}" cy="${cy}" r="${r}" ${fa}/>`;
    case 'square': {
      const s = r * 1.55;
      return `<rect x="${cx-s/2}" y="${cy-s/2}" width="${s}" height="${s}" ${fa}/>`;
    }
    case 'triangle': {
      const pts = `${cx},${cy-r} ${cx-r*0.9},${cy+r*0.55} ${cx+r*0.9},${cy+r*0.55}`;
      return `<polygon points="${pts}" ${fa}/>`;
    }
    case 'diamond': {
      const pts = `${cx},${cy-r} ${cx+r*0.85},${cy} ${cx},${cy+r} ${cx-r*0.85},${cy}`;
      return `<polygon points="${pts}" ${fa}/>`;
    }
    case 'cross': {
      const t = r * 0.35, h = r * 0.9;
      return `<g>
        <rect x="${cx-t}" y="${cy-h}" width="${t*2}" height="${h*2}" ${fa}/>
        <rect x="${cx-h}" y="${cy-t}" width="${h*2}" height="${t*2}" ${fa}/>
      </g>`;
    }
    case 'star': {
      const pts = Array.from({length:10}, (_,i) => {
        const rad = i%2===0 ? r : r*0.42;
        const a = (i*36 - 90) * Math.PI/180;
        return `${cx + rad*Math.cos(a)},${cy + rad*Math.sin(a)}`;
      }).join(' ');
      return `<polygon points="${pts}" ${fa}/>`;
    }
    case 'pentagon': {
      const pts = Array.from({length:5}, (_,i) => {
        const a = (i*72 - 90) * Math.PI/180;
        return `${cx + r*Math.cos(a)},${cy + r*Math.sin(a)}`;
      }).join(' ');
      return `<polygon points="${pts}" ${fa}/>`;
    }
    case 'hexagon': {
      const pts = Array.from({length:6}, (_,i) => {
        const a = (i*60 - 90) * Math.PI/180;
        return `${cx + r*Math.cos(a)},${cy + r*Math.sin(a)}`;
      }).join(' ');
      return `<polygon points="${pts}" ${fa}/>`;
    }
    case 'arrow': {
      // Flèche pointant vers le haut — la rotation SVG gère les autres directions
      const hw = r*0.52, mid = cy - r*0.1, sw = r*0.22, sb = cy + r*0.75;
      const pts = [
        `${cx},${cy-r}`,
        `${cx+hw},${mid}`,
        `${cx+sw},${mid}`,
        `${cx+sw},${sb}`,
        `${cx-sw},${sb}`,
        `${cx-sw},${mid}`,
        `${cx-hw},${mid}`
      ].join(' ');
      return `<polygon points="${pts}" ${fa}/>`;
    }
    default: return `<circle cx="${cx}" cy="${cy}" r="${r}" ${fa}/>`;
  }
}

export function svgRenderCell(props, size=80) {
  const { shape, color, sz, rotation, fill, count, inner } = props;
  const r = sz === 1 ? 12 : sz === 2 ? 18 : 24;
  const cx = size/2, cy = size/2;
  const rot = rotation ? `transform="rotate(${rotation},${cx},${cy})"` : '';

  // Forme intérieure (uniquement visible pour count=1 pour éviter la surcharge visuelle)
  const innerSvg = (inner && count === 1)
    ? svgDrawShape(inner, cx, cy, Math.max(5, r * 0.38), 'outline', color)
    : '';

  let content = '';
  if (count === 1) {
    content = `<g ${rot}>${svgDrawShape(shape,cx,cy,r,fill,color)}${innerSvg}</g>`;
  } else if (count === 2) {
    const r2 = Math.max(9, r - 5);
    const x1 = size*0.3, x2 = size*0.7;
    content = `<g ${rot}>${svgDrawShape(shape,x1,cy,r2,fill,color)}${svgDrawShape(shape,x2,cy,r2,fill,color)}</g>`;
  } else {
    const r2 = Math.max(9, r - 6);
    const positions = [[cx,size*0.3],[size*0.27,size*0.7],[size*0.73,size*0.7]];
    content = `<g ${rot}>${positions.map(([px,py]) => svgDrawShape(shape,px,py,r2,fill,color)).join('')}</g>`;
  }

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" fill="white"/>
    ${content}
  </svg>`;
}

function rnd(arr) { return arr[Math.floor(Math.random()*arr.length)]; }
function shuffle(arr) { return [...arr].sort(()=>Math.random()-.5); }

const P_LABELS = {
  shape:'la forme', color:'la couleur', sz:'la taille',
  rotation:'la rotation', fill:'le remplissage', count:'le nombre',
  inner:'la figure intérieure'
};

/* 3 valeurs distinctes pour une propriété donnée dans une matrice */
function getPropValues(prop, inverse=false) {
  const maps = {
    shape:    () => shuffle(SVG_CONST.SHAPES).slice(0,3),
    color:    () => shuffle(SVG_CONST.COLORS).slice(0,3),
    sz:       () => inverse ? [3,2,1] : [1,2,3],
    rotation: () => inverse ? [270,180,90] : [0,90,180],
    fill:     () => ['filled','outline','filled'],
    count:    () => inverse ? [3,2,1] : [1,2,3],
    inner:    () => [null, 'circle', 'square']
  };
  return (maps[prop] || (() => [0,1,2]))();
}

/* 6 valeurs pour une séquence linéaire */
function getSeqVals(prop) {
  return {
    rotation: [0, 45, 90, 135, 180, 225],
    sz:       [1, 2, 3, 1, 2, 3],
    color:    Array.from({length:6}, (_,i) => SVG_CONST.COLORS[i % SVG_CONST.COLORS.length]),
    fill:     Array.from({length:6}, (_,i) => i%2===0 ? 'filled' : 'outline'),
    count:    [1, 2, 3, 1, 2, 3],
    shape:    Array.from({length:6}, (_,i) => SVG_CONST.SHAPES[i % SVG_CONST.SHAPES.length]),
    inner:    [null, 'circle', 'square', null, 'circle', 'square']
  }[prop] || [0,1,2,3,4,5];
}

/* ── Distracteurs ──────────────────────────────────────────────
   n=4 par défaut → 4 distracteurs + 1 bonne réponse = 5 options (format EPSO)
   difficulty 1 : change 1 propriété quelconque
   difficulty 2 : change 1 propriété « clé » (shape/color) + autres détails
   difficulty 3 : change 1 seule propriété subtile (rotation ±45°, fill, count, sz, inner)
   ────────────────────────────────────────────────────────────── */
function makeDistractors(correct, n=4, difficulty=1) {
  const ALL = ['shape','color','sz','rotation','fill','count','inner'];

  function mutate(base, prop) {
    const d = {...base};
    switch(prop) {
      case 'shape':    d.shape    = rnd(SVG_CONST.SHAPES.filter(s=>s!==base.shape)); break;
      case 'color':    d.color    = rnd(SVG_CONST.COLORS.filter(c=>c!==base.color)); break;
      case 'sz':       d.sz       = base.sz===3 ? 1 : base.sz===2 ? 3 : 2; break;
      case 'rotation': d.rotation = (base.rotation + (difficulty>=3 ? 45 : 90)) % 360; break;
      case 'fill':     d.fill     = base.fill==='filled' ? 'outline' : 'filled'; break;
      case 'count':    d.count    = base.count===3 ? 1 : base.count+1; break;
      case 'inner':    d.inner    = d.inner===null ? 'circle' : d.inner==='circle' ? 'square' : null; break;
    }
    return d;
  }

  if (difficulty >= 3) {
    const subtle = shuffle(['rotation','fill','count','sz','inner']).slice(0,n);
    return subtle.map(p => mutate(correct, p));
  }
  if (difficulty === 2) {
    const key   = shuffle(['shape','color']).slice(0,1);
    const other = shuffle(ALL.filter(p=>!key.includes(p))).slice(0,n-1);
    return [...key,...other].map(p => mutate(correct, p));
  }
  return shuffle(ALL).slice(0,n).map(p => mutate(correct, p));
}

/* ── Matrice 3×3 ───────────────────────────────────────────────
   difficulty 1 : 1 prop colonne + 1 prop ligne
   difficulty 2 : idem avec possible progression inverse
   difficulty 3 : 1 prop suit la diagonale (Latin square) + 1 prop suit les lignes
                  → inner peut être l'une des propriétés, ajoutant une couche visuelle
   ────────────────────────────────────────────────────────────── */
export function generateMatrixQuestion(difficulty=1) {
  const allProps = difficulty >= 3
    ? ['shape','color','sz','rotation','fill','count','inner']
    : ['shape','color','sz','rotation','fill','count'];

  const base = {
    shape: rnd(SVG_CONST.SHAPES), color: rnd(SVG_CONST.COLORS),
    sz: 2, rotation: 0, fill: 'filled', count: 1, inner: null
  };

  if (difficulty >= 3) {
    let [diagProp, rowProp] = shuffle(allProps).slice(0,2);
    // Éviter la combinaison inner+count (inner invisible pour count>1)
    if ((diagProp==='inner'&&rowProp==='count')||(diagProp==='count'&&rowProp==='inner')) {
      rowProp = rnd(allProps.filter(p=>p!=='inner'&&p!=='count'));
    }
    const diagVals = getPropValues(diagProp);
    const rowVals  = getPropValues(rowProp);
    const cells = [];
    for (let row=0; row<3; row++)
      for (let col=0; col<3; col++) {
        if (row===2 && col===2) { cells.push(null); continue; }
        cells.push({...base, [diagProp]: diagVals[(row+col)%3], [rowProp]: rowVals[row]});
      }
    const correct = {...base, [diagProp]: diagVals[(2+2)%3], [rowProp]: rowVals[2]};
    const opts = shuffle([correct, ...makeDistractors(correct, 4, 3)]);
    return {
      id: 'abs_m_'+Date.now()+'_'+Math.round(Math.random()*999),
      category:'abstract', categoryLabel:'Raisonnement Abstrait',
      type:'svg', patternType:'matrix', cells, options:opts, difficulty:3,
      correct: opts.indexOf(correct),
      explanation:`${P_LABELS[diagProp]} suit une règle diagonale (carré latin) ; ${P_LABELS[rowProp]} varie selon les lignes.`
    };
  }

  // difficulty 1 & 2
  let [colProp, rowProp] = shuffle(allProps).slice(0,2);
  const inverse  = difficulty===2 && Math.random()>0.5;
  const colVals  = getPropValues(colProp, inverse);
  const rowVals  = getPropValues(rowProp);
  const cells = [];
  for (let row=0; row<3; row++)
    for (let col=0; col<3; col++) {
      if (row===2 && col===2) { cells.push(null); continue; }
      cells.push({...base, [colProp]: colVals[col], [rowProp]: rowVals[row]});
    }
  const correct = {...base, [colProp]: colVals[2], [rowProp]: rowVals[2]};
  const opts = shuffle([correct, ...makeDistractors(correct, 4, difficulty)]);
  return {
    id: 'abs_m_'+Date.now()+'_'+Math.round(Math.random()*999),
    category:'abstract', categoryLabel:'Raisonnement Abstrait',
    type:'svg', patternType:'matrix', cells, options:opts, difficulty,
    correct: opts.indexOf(correct),
    explanation:`${P_LABELS[colProp]} varie selon les colonnes${inverse?' (décroissant)':''} ; ${P_LABELS[rowProp]} varie selon les lignes.`
  };
}

/* ── Séquence linéaire ─────────────────────────────────────────
   difficulty 1 : 1 propriété progresse (rotation par +45°)
   difficulty 2 & 3 : 2 propriétés progressent simultanément
   ────────────────────────────────────────────────────────────── */
export function generateSequenceQuestion(difficulty=1) {
  const allProps = ['rotation','sz','color','fill','count','shape','inner'];
  const base = {shape:rnd(SVG_CONST.SHAPES), color:rnd(SVG_CONST.COLORS), sz:2, rotation:0, fill:'filled', count:1, inner:null};

  if (difficulty >= 2) {
    let [prop1, prop2] = shuffle(allProps).slice(0,2);
    // Éviter inner+count (inner invisible pour count>1)
    if ((prop1==='inner'&&prop2==='count')||(prop1==='count'&&prop2==='inner')) {
      prop2 = rnd(allProps.filter(p=>p!=='inner'&&p!=='count'&&p!==prop1));
    }
    const vals1 = getSeqVals(prop1);
    const vals2 = getSeqVals(prop2);
    const cells6 = vals1.map((v,i) => ({...base, [prop1]:v, [prop2]:vals2[i]}));
    const correct = cells6[5];
    const opts = shuffle([correct, ...makeDistractors(correct, 4, difficulty)]);
    return {
      id: 'abs_s_'+Date.now()+'_'+Math.round(Math.random()*999),
      category:'abstract', categoryLabel:'Raisonnement Abstrait',
      type:'svg', patternType:'sequence', cells:cells6.slice(0,5), options:opts, difficulty,
      correct: opts.indexOf(correct),
      explanation:`Deux propriétés évoluent simultanément : ${P_LABELS[prop1]} et ${P_LABELS[prop2]}.`
    };
  }

  // difficulty 1
  const changeProp = rnd(allProps);
  const vals = getSeqVals(changeProp);
  const cells6 = vals.map(v => ({...base, [changeProp]:v}));
  const correct = cells6[5];
  const opts = shuffle([correct, ...makeDistractors(correct, 4, 1)]);
  const desc = {
    rotation:"la rotation (+45° à chaque étape)",
    sz:"la taille (cycle 1→2→3)",
    color:"la couleur (séquence cyclique)",
    fill:"l'alternance plein / contour",
    count:"le nombre de formes (cycle 1→2→3)",
    shape:"la forme (séquence)",
    inner:"la figure intérieure (séquence)"
  };
  return {
    id: 'abs_s_'+Date.now()+'_'+Math.round(Math.random()*999),
    category:'abstract', categoryLabel:'Raisonnement Abstrait',
    type:'svg', patternType:'sequence', cells:cells6.slice(0,5), options:opts, difficulty:1,
    correct: opts.indexOf(correct),
    explanation:`Observez ${desc[changeProp]||'la progression'}. La 6ème figure complète la séquence.`
  };
}

/* Point d'entrée — difficulty null = aléatoire 1-3 */
export function generateAbstractQuestion(difficulty=null) {
  const d = difficulty ?? Math.ceil(Math.random()*3);
  return Math.random() > 0.5 ? generateMatrixQuestion(d) : generateSequenceQuestion(d);
}
