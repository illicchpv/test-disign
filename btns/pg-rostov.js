function stringToDomElement(str) {
  const el = (new DOMParser()).parseFromString(str, "text/html");
  const d = el.body.firstChild;
  return d;
}
/* templFill пример использования:
  const rez = templFill("a[$\{a}] b[$\{b}] c.cc[$\{c.cc}]", params);
*/
const templFill = (templ, p) => {
  if (!(typeof p === 'object' && p !== null && !Array.isArray(p))) {console.error("templFill -- parameter is not a object!"); return templ;}
  let body = 'const {' + Object.keys(p).reduce((acc, key) => acc += key + ',', '') + '} = p;' + '\r\n';
  body += 'return `' + templ + '`;' + '\r\n';
  const f = new Function('p', body);
  return f(p);
};

const testJson = [
  {id: 12, type: "alarm", num: 1, date: "01.01.2024"},
  {id: 14, type: "alert", num: 2, date: "01.01.2024"},
  {id: 16, type: "disabled", num: 3, date: "01.01.2024"},
  {id: 18, type: "ok", num: 4, date: "01.01.2024"},
];
const contentBlock$ = document.querySelector('.contentBlock');
const contentLoading$ = document.querySelector('.content .loading');

// ------------------
loadTestData();

function loadTestData() {
  const blockButtons = createBlokButtons(contentBlock$, contentLoading$, testJson,
    (e, id) => {
      console.log(`blockButton id:'${id}' click`);
    }
  );

  const type14 = blockButtons.getType("14");
  console.log('type14: ', type14);
  blockButtons.setType("14", "disabled");
  const type16 = blockButtons.getType("16");
  console.log('type16: ', type16);
  blockButtons.setType("16", "alert");

  const num14 = blockButtons.getNum("14");
  console.log('num14: ', num14);
  blockButtons.setNum("14", "9");

  const date14 = blockButtons.getDate("14");
  console.log('date14: ', date14);
  blockButtons.setDate("14", "02.02.2024");

  // blockButtons.setButtonsWidth(50);
  blockButtons.setButtonsHeight(150);
  blockButtons.setKSZ(0.3);
  blockButtons.setColumnCount(3);
}

function createBlokButtons(contentBlockEl, contentLoadingEl, json,
  clickCb
) {
  const template = '\
    <button id="abtn_${id}" class="abtn abtn_${type}" title="состояние: ${type}">\
      <div class="num">${num}</div>\
      <span class="date">${date}&nbsp;</span>\
    </button>\
  ';
  const root = contentBlockEl;
  const types = ["ok", "alarm", "alert", "disabled",];

  contentBlockEl.innerHTML = '';
  for (const el of json) {
    const d = stringToDomElement(templFill(template, el));
    contentBlockEl.append(d);
    if (clickCb) d.addEventListener('click', (e) => {clickCb(e, el.id);});
  }
  contentLoadingEl.style.display = 'none';

  function getClearRootStyle(v) {
    if (!root.style.cssText) return '';
    const sArr = root.style.cssText.split(';');
    const sArr2 = sArr.filter(e => e.indexOf(v) < 0 && e.length > 0);
    return sArr2.join(';') + ';';
  }

  return {
    kWidthHeight: (685 / 432),

    setButtonsWidth(v) {
      const hVar = v * this.kWidthHeight;
      const styleText = getClearRootStyle('--h:') + `--h:${hVar}px;`;
      root.style.cssText = styleText;
    },
    setButtonsHeight(v) {
      const hVar = v;
      const styleText = getClearRootStyle('--h:') + `--h:${hVar}px;`;
      console.log('styleText: ', styleText);
      root.style.cssText = styleText;
    },

    setKSZ(v) {
      const styleText = getClearRootStyle('--ksz:') + `--ksz:${v};`;
      console.log('styleText: ', styleText);
      root.style.cssText = styleText;
    },

    setColumnCount(v) {
      if(!v || v < 1) {
        console.error('Error setColumnCount -- v < 1'); return;
      }
      let st = "grid-template-columns:";
      for (let i = 0; i < v; i++) st += "auto ";
      const styleText = getClearRootStyle('grid-template-columns:') + st;
      root.style.cssText = styleText;
    },

    getType(id) { // "num", "date", "type"
      const el$ = root.querySelector(`#abtn_${id}`);
      if (el$.classList.contains('abtn_alarm')) return 'alarm';
      if (el$.classList.contains('abtn_alert')) return 'alert';
      if (el$.classList.contains('abtn_disabled')) return 'disabled';
      return 'ok';
    },
    setType(id, val) { // "num", "date", "type"
      if (types.findIndex(e => e === val) < 0) {
        console.error(`Error setType -- unknown type: ${val} ["ok", "alarm", "alert", "disabled"]`);
        return;
      }
      const el$ = root.querySelector(`#abtn_${id}`);
      el$.classList.remove('abtn_alarm');
      el$.classList.remove('abtn_alert');
      el$.classList.remove('abtn_disabled');
      el$.classList.remove('abtn_ok');
      el$.classList.add(`abtn_${val}`);
    },

    getNum(id) { // "num", "date", "type"
      return root.querySelector(`#abtn_${id} .num`).innerText;
    },
    setNum(id, val) { // "num", "date", "type"
      root.querySelector(`#abtn_${id} .num`).innerText = val;
    },

    getDate(id) { // "num", "date", "type"
      return root.querySelector(`#abtn_${id} .date`).innerText.replaceAll('&nbsp;', '');
    },
    setDate(id, val) { // "num", "date", "type"
      root.querySelector(`#abtn_${id} .date`).innerHTML = val.replaceAll('&nbsp;', '') + '&nbsp;';
    },
  };
}