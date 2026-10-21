export function tokenize(text) {
  return text.match(/\s+|[^\s]+/gu) || [];
}

function myers(a, b, maxD = 1200) {
  const n = a.length, m = b.length, trace = [];
  let frontier = new Map([[1, 0]]);
  for (let d = 0; d <= Math.min(n + m, maxD); d++) {
    const current = new Map();
    for (let k = -d; k <= d; k += 2) {
      let x;
      if (k === -d || (k !== d && (frontier.get(k - 1) ?? -1) < (frontier.get(k + 1) ?? -1))) x = frontier.get(k + 1) ?? 0;
      else x = (frontier.get(k - 1) ?? 0) + 1;
      let y = x - k;
      while (x < n && y < m && a[x] === b[y]) { x++; y++; }
      current.set(k, x);
      if (x >= n && y >= m) {
        trace.push(current);
        const edits = [];
        let cx = n, cy = m;
        for (let step = trace.length - 1; step > 0; step--) {
          const previous = trace[step - 1], diagonal = cx - cy;
          let priorK;
          if (diagonal === -step || (diagonal !== step && (previous.get(diagonal - 1) ?? -1) < (previous.get(diagonal + 1) ?? -1))) priorK = diagonal + 1;
          else priorK = diagonal - 1;
          const priorX = previous.get(priorK) ?? 0, priorY = priorX - priorK;
          while (cx > priorX && cy > priorY) { edits.push({type:'equal',text:a[--cx]}); cy--; }
          if (cx === priorX) edits.push({type:'insert',text:b[--cy]});
          else edits.push({type:'delete',text:a[--cx]});
        }
        while (cx > 0 && cy > 0) { edits.push({type:'equal',text:a[--cx]}); cy--; }
        return edits.reverse();
      }
    }
    trace.push(current);
    frontier = current;
  }
  return [...a.map(text => ({type:'delete',text})), ...b.map(text => ({type:'insert',text}))];
}

export function diff(before, after) {
  const a = tokenize(before), b = tokenize(after);
  let prefix = 0, suffix = 0;
  while (prefix < a.length && prefix < b.length && a[prefix] === b[prefix]) prefix++;
  while (suffix < a.length - prefix && suffix < b.length - prefix &&
         a[a.length - suffix - 1] === b[b.length - suffix - 1]) suffix++;
  return [
    ...a.slice(0,prefix).map(text=>({type:'equal',text})),
    ...myers(a.slice(prefix,a.length-suffix),b.slice(prefix,b.length-suffix)),
    ...a.slice(a.length-suffix).map(text=>({type:'equal',text}))
  ];
}

export function changes(edits) {
  const groups = [];
  let current = null;
  for (let i=0;i<edits.length;i++) {
    const edit = edits[i];
    if (edit.type !== 'equal') {
      if (!current) current = {start:i,end:i,deleted:'',inserted:''};
      current.end = i;
      current[edit.type === 'delete' ? 'deleted' : 'inserted'] += edit.text;
    } else if (current && /[.!?]\s*$/u.test(edit.text) || current && edit.text.includes('\n\n')) {
      groups.push(current); current=null;
    } else if (current && edit.text.trim()) {
      groups.push(current); current=null;
    }
  }
  if (current) groups.push(current);
  return groups;
}

