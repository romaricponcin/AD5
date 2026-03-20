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
    default: return `<circle cx="${cx}" cy="${cy}" r="${r}" ${fa}/>`;
  }
}

export function svgRenderCell(props, size=80) {
  const { shape, color, sz, rotation, fill, count } = props;
  const radii = [sz === 1 ? 12 : sz === 2 ? 18 : 24];
  const r = radii[0];
  const cx = size/2, cy = size/2;
  const rot = rotation ? `transform="rotate(${rotation},${cx},${cy})"` : '';

  let content = '';
  if (count === 1) {
    content = `<g ${rot}>${svgDrawShape(shape,cx,cy,r,fill,color)}</g>`;
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

function getPropValues(prop, n) {
  const maps = {
    shape: () => shuffle(SVG_CONST.SHAPES).slice(0,n),
    color: () => shuffle(SVG_CONST.COLORS).slice(0,n),
    sz: () => [1,2,3].slice(0,n),
    rotation: () => [0,90,180].slice(0,n),
    fill: () => ['filled','outline','filled'].slice(0,n),
    count: () => [1,2,3].slice(0,n)
  };
  return (maps[prop] || (() => [0,1,2]))();
}

function makeDistractors(correct, n=3) {
  const props = ['shape','color','sz','rotation','fill','count'];
  return shuffle(props).slice(0,n).map(prop => {
    const d = {...correct};
    switch(prop) {
      case 'shape': d.shape = rnd(SVG_CONST.SHAPES.filter(s=>s!==correct.shape)); break;
      case 'color': d.color = rnd(SVG_CONST.COLORS.filter(c=>c!==correct.color)); break;
      case 'sz': d.sz = [1,2,3].find(s=>s!==correct.sz) ?? (correct.sz===3?1:correct.sz+1); break;
      case 'rotation': d.rotation = (correct.rotation+90)%360; break;
      case 'fill': d.fill = correct.fill==='filled'?'outline':'filled'; break;
      case 'count': d.count = correct.count===3?1:correct.count+1; break;
    }
    return d;
  });
}

export function generateMatrixQuestion() {
  const allProps = ['shape','color','sz','rotation','fill','count'];
  const [colProp, rowProp] = shuffle(allProps).slice(0,2);
  const base = {
    shape: rnd(SVG_CONST.SHAPES), color: rnd(SVG_CONST.COLORS),
    sz: 2, rotation: 0, fill: 'filled', count: 1
  };
  const colVals = getPropValues(colProp, 3);
  const rowVals = getPropValues(rowProp, 3);

  const cells = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      if (row===2 && col===2) { cells.push(null); continue; }
      cells.push({...base, [colProp]: colVals[col], [rowProp]: rowVals[row]});
    }
  }
  const correct = {...base, [colProp]: colVals[2], [rowProp]: rowVals[2]};
  const opts = shuffle([correct, ...makeDistractors(correct,3)]);

  const pLabels = {shape:'la forme',color:'la couleur',sz:'la taille',rotation:'la rotation',fill:'le remplissage',count:'le nombre'};
  return {
    id:'abs_m_'+Date.now()+'_'+Math.round(Math.random()*999),
    category:'abstract', categoryLabel:'Raisonnement Abstrait',
    type:'svg', patternType:'matrix', cells, options:opts,
    correct: opts.indexOf(correct),
    explanation:`Dans cette matrice, ${pLabels[colProp]} varie selon les colonnes et ${pLabels[rowProp]} varie selon les lignes. Trouvez la combinaison qui complète logiquement la grille.`
  };
}

export function generateSequenceQuestion() {
  const changeProp = rnd(['rotation','sz','color','fill','count','shape']);
  const base = {shape:rnd(SVG_CONST.SHAPES),color:rnd(SVG_CONST.COLORS),sz:2,rotation:0,fill:'filled',count:1};

  const seqVals = {
    rotation: [0,45,90,135,180,225],
    sz: [1,1,2,2,3,3],
    color: Array.from({length:6},(_,i)=>SVG_CONST.COLORS[i%SVG_CONST.COLORS.length]),
    fill: Array.from({length:6},(_,i)=>i%2===0?'filled':'outline'),
    count: [1,1,2,2,3,3],
    shape: Array.from({length:6},(_,i)=>SVG_CONST.SHAPES[i%SVG_CONST.SHAPES.length])
  };
  const vals = seqVals[changeProp];
  const cells6 = vals.map(v => ({...base,[changeProp]:v}));

  const correct = cells6[5];
  const opts = shuffle([correct,...makeDistractors(correct,3)]);
  const pLabels = {rotation:'la rotation (+45° par étape)',sz:'la taille qui augmente',color:'la couleur qui change',fill:"l'alternance plein/contour",count:'le nombre qui augmente',shape:'la forme qui change'};
  return {
    id:'abs_s_'+Date.now()+'_'+Math.round(Math.random()*999),
    category:'abstract', categoryLabel:'Raisonnement Abstrait',
    type:'svg', patternType:'sequence', cells:cells6.slice(0,5), options:opts,
    correct: opts.indexOf(correct),
    explanation:`Observez ${pLabels[changeProp]}. La 6ème figure complète logiquement la progression.`
  };
}

export function generateAbstractQuestion() {
  return Math.random() > 0.5 ? generateMatrixQuestion() : generateSequenceQuestion();
}
