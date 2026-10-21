/* =========================================================
   应用主逻辑：路由 / 页面渲染 / 在线求解器
   ========================================================= */
(function () {
  'use strict';
  const ALGOS = window.ALGO_CONTENT;
  const MM = window.MM;

  const CATS = {
    eval: { name: '评价决策类', en: 'Evaluation & Decision', color: '#0ea5a4', desc: '对多个对象按多项指标进行主观/客观赋权、模糊评判与综合排序决策。' },
    reg: { name: '回归与时序预测类', en: 'Regression & Forecasting', color: '#f97316', desc: '建立自变量与因变量或历史序列的数量关系，结合 MAE / RMSE / MAPE 量化预测精度。' },
    opt: { name: '优化与运筹规划类', en: 'Optimization & Operations Research', color: '#2563eb', desc: '在资源与规则约束下求解目标极值，涵盖线性单纯形法、整数/0-1规划（分支定界法）与模拟退火元启发式寻优。' },
    ml: { name: '降维聚类与特征分析类', en: 'Multivariate & Unsupervised ML', color: '#d97706', desc: '面向高维多指标数据的无监督分群（K-Means++）与正交主成分特征降维（PCA）。' },
    sim: { name: '机理动力学与随机仿真类', en: 'Dynamical Systems & Stochastic Sim', color: '#8b5cf6', desc: '基于微分方程 RK4 连续机理演化、蒙特卡洛随机抽样与马尔可夫状态转移的系统仿真。' },
  };
  const TABS = [
    { k: 'overview', n: '模型概述', i: 'book' },
    { k: 'steps', n: '建模步骤', i: 'list' },
    { k: 'calc', n: '在线求解', i: 'calc' },
    { k: 'code', n: 'Python 实现', i: 'code' },
  ];

  /* ---------------- 工具函数 ---------------- */
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ICONS = {
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
    list: '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',
    calc: '<rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><path d="M16 14v4M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M8 18h.01M12 18h.01"/>',
    code: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
    bulb: '<path d="M9 18h6M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/>',
    target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    db: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>',
    up: '<path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>',
    alert: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    home: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    play: '<polygon points="6 4 20 12 6 20 6 4"/>',
    arrow: '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
    compass: '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>',
    flow: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><path d="M10 6.5h4a3 3 0 0 1 3 3V14"/>',
  };
  const ico = (n, cls = '') => `<svg class="ico ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[n]}</svg>`;

  function fmt(v, d = 4) {
    if (v === null || v === undefined || Number.isNaN(v)) return '—';
    if (!isFinite(v)) return v > 0 ? '∞' : '−∞';
    const a = Math.abs(v);
    if (a !== 0 && (a < 1e-4 || a >= 1e8)) return v.toExponential(3);
    return v.toFixed(d);
  }
  const fmtS = (v, d = 4) => (isFinite(v) ? String(+v.toFixed(d)) : fmt(v));
  const fmtP = p => (p < 0.0001 ? '&lt;0.0001' : p.toFixed(4));
  const stars = p => (p < 0.001 ? '***' : p < 0.01 ? '**' : p < 0.05 ? '*' : '');
  const texNum = (v, d = 4) => { const s = fmtS(v, d); return s.includes('e') ? s.replace(/e([+-]?\d+)/, '\\times10^{$1}') : s; };

  function renderMath(el) {
    if (window.renderMathInElement) {
      renderMathInElement(el, {
        delimiters: [{ left: '$$', right: '$$', display: true }, { left: '$', right: '$', display: false }],
        throwOnError: false,
      });
    }
  }

  /* ---------------- 数据解析 ---------------- */
  function parseTable(text, opt = {}) {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length && !l.startsWith('#'));
    if (!lines.length) throw new Error('请输入数据');
    let rows = lines.map(l => l.split(/[\s,，;；]+/).filter(s => s !== ''));
    const isNum = s => s !== '' && !isNaN(Number(s));
    let colNames = null, rowNames = null;
    if (rows[0].some(s => !isNum(s))) { colNames = rows[0]; rows = rows.slice(1); }
    if (!rows.length) throw new Error('除表头外没有数据行');
    if (rows.every(r => !isNum(r[0]))) {
      rowNames = rows.map(r => r[0]);
      rows = rows.map(r => r.slice(1));
      if (colNames && colNames.length === rows[0].length + 1) colNames = colNames.slice(1);
    }
    const n = rows[0].length;
    if (!n) throw new Error('未识别到数值列');
    rows.forEach((r, i) => {
      if (r.length !== n) throw new Error(`第 ${i + 1} 行数据有 ${r.length} 列，与第 1 行的 ${n} 列不一致`);
      r.forEach(s => { if (!isNum(s)) throw new Error(`无法识别的数值：“${esc(s)}”`); });
    });
    const data = rows.map(r => r.map(Number));
    if (!colNames || colNames.length !== n) colNames = Array.from({ length: n }, (_, j) => (opt.colNames && opt.colNames[j]) || `${opt.colPrefix || '指标'}${j + 1}`);
    if (!rowNames) rowNames = data.map((_, i) => `${opt.rowPrefix || '对象'}${i + 1}`);
    return { data, rowNames, colNames };
  }
  const parseList = s => s.split(/[\s,，;；]+/).filter(Boolean).map(Number);

  /* ---------------- 通用 UI 组件与学术导出工具 (SVG / PDF / LaTeX / CSV) ---------------- */
  let charts = [];
  let chartMap = {};
  let curAlgo = ALGOS[0];
  function destroyCharts() { charts.forEach(c => c.destroy()); charts = []; chartMap = {}; }
  function mkChart(id, cfg) {
    const el = document.getElementById(id);
    if (!el) return null;
    if (!window.Chart) { el.parentElement.innerHTML = '<div class="hint">图表库加载失败（请检查网络连接后刷新）</div>'; return null; }
    if (chartMap[id]) {
      chartMap[id].destroy();
      charts = charts.filter(x => x !== chartMap[id]);
    }
    const c = new Chart(el, cfg);
    c._canvasId = id;
    charts.push(c);
    chartMap[id] = c;
    return c;
  }
  const chartBox = (id, h = 320) => `<div class="chart-wrap"><div class="chart-export-bar"><span class="ce-tag">Publication-Ready</span><button type="button" class="ce-btn" data-chart-svg="${id}" title="导出无损矢量图 SVG（可导入 Illustrator / Inkscape / Visio）">📐 SVG 矢量图</button><button type="button" class="ce-btn" data-chart-pdf="${id}" title="导出出版级 PDF 图表（可直接用于 LaTeX \\includegraphics）">📄 PDF 导出</button></div><div class="chart-box" style="height:${h}px"><canvas id="${id}"></canvas></div></div>`;
  const PALETTE = ['#6366f1', '#14b8a6', '#f97316', '#ec4899', '#0ea5e9', '#a855f7', '#eab308', '#22c55e', '#ef4444', '#64748b'];
  const alpha = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };

  function showToast(msg) {
    let t = document.getElementById('mm-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'mm-toast';
      t.className = 'mm-toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._tm);
    t._tm = setTimeout(() => t.classList.remove('show'), 2400);
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { a.remove(); URL.revokeObjectURL(url); }, 200);
  }

  function xmlEsc(s) {
    return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function parseCssColor(col, defHex = '#6366f1', defOp = 1) {
    if (!col || typeof col !== 'string') return { color: defHex, opacity: defOp };
    const m = col.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)/i);
    if (m) {
      const hex = '#' + [m[1], m[2], m[3]].map(x => Math.max(0, Math.min(255, +x)).toString(16).padStart(2, '0')).join('');
      return { color: hex, opacity: m[4] !== undefined ? +m[4] : 1 };
    }
    return { color: col, opacity: defOp };
  }

  /** 将 Chart.js 实例序列化为出版级独立 SVG 矢量图 */
  function chartToVectorSVG(chart) {
    const cv = chart.canvas;
    const W = cv.clientWidth || cv.width || 640;
    const H = cv.clientHeight || cv.height || 340;
    const out = [];
    out.push(`<?xml version="1.0" encoding="UTF-8"?>`);
    out.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif">`);
    out.push(`<rect width="100%" height="100%" fill="#ffffff" rx="8"/>`);
    const type = chart.config.type;
    const scales = chart.scales || {};

    if (type === 'radar' && scales.r) {
      const r = scales.r;
      const cx = r.xCenter, cy = r.yCenter, rad = r.drawingArea;
      const labels = chart.data.labels || [];
      const N = labels.length;
      [0.2, 0.4, 0.6, 0.8, 1.0].forEach(f => {
        const pts = labels.map((_, i) => {
          const ang = -Math.PI / 2 + (2 * Math.PI * i) / N;
          return `${(cx + rad * f * Math.cos(ang)).toFixed(1)},${(cy + rad * f * Math.sin(ang)).toFixed(1)}`;
        }).join(' ');
        out.push(`<polygon points="${pts}" fill="${f === 1 ? 'none' : 'none'}" stroke="${f === 1 ? '#cbd5e1' : '#e2e8f0'}" stroke-width="${f === 1 ? 1.3 : 1}" ${f < 1 ? 'stroke-dasharray="3,3"' : ''}/>`);
      });
      labels.forEach((lb, i) => {
        const ang = -Math.PI / 2 + (2 * Math.PI * i) / N;
        const x2 = cx + rad * Math.cos(ang), y2 = cy + rad * Math.sin(ang);
        out.push(`<line x1="${cx.toFixed(1)}" y1="${cy.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#e2e8f0" stroke-width="1"/>`);
        const lx = cx + (rad + 20) * Math.cos(ang), ly = cy + (rad + 18) * Math.sin(ang);
        const anchor = Math.abs(Math.cos(ang)) < 0.15 ? 'middle' : Math.cos(ang) > 0 ? 'start' : 'end';
        out.push(`<text x="${lx.toFixed(1)}" y="${(ly + 4).toFixed(1)}" text-anchor="${anchor}" font-size="12.5" font-weight="700" fill="#1e293b">${xmlEsc(lb)}</text>`);
      });
      chart.data.datasets.forEach((ds, di) => {
        const meta = chart.getDatasetMeta(di);
        if (meta.hidden) return;
        const bCol = parseCssColor(typeof ds.borderColor === 'string' ? ds.borderColor : PALETTE[di % PALETTE.length]);
        const bgCol = parseCssColor(typeof ds.backgroundColor === 'string' ? ds.backgroundColor : alpha(bCol.color, 0.16), bCol.color, 0.16);
        const pts = (meta.data || []).map(pt => `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(' ');
        if (pts) {
          out.push(`<polygon points="${pts}" fill="${bgCol.color}" fill-opacity="${bgCol.opacity}" stroke="${bCol.color}" stroke-width="${ds.borderWidth || 2.2}"/>`);
          (meta.data || []).forEach(pt => {
            out.push(`<circle cx="${pt.x.toFixed(1)}" cy="${pt.y.toFixed(1)}" r="${ds.pointRadius || 3.5}" fill="#ffffff" stroke="${bCol.color}" stroke-width="2"/>`);
          });
        }
      });
    } else if (scales.x && scales.y) {
      const sx = scales.x, sy = scales.y;
      const area = chart.chartArea || { left: sx.left, right: sx.right, top: sy.top, bottom: sy.bottom };
      out.push(`<rect x="${area.left.toFixed(1)}" y="${area.top.toFixed(1)}" width="${(area.right - area.left).toFixed(1)}" height="${(area.bottom - area.top).toFixed(1)}" fill="none" stroke="#cbd5e1" stroke-width="1"/>`);
      (sy.ticks || []).forEach((tk, idx) => {
        const py = sy.getPixelForTick(idx);
        if (py >= area.top - 1 && py <= area.bottom + 1) {
          out.push(`<line x1="${area.left.toFixed(1)}" y1="${py.toFixed(1)}" x2="${area.right.toFixed(1)}" y2="${py.toFixed(1)}" stroke="#f1f5f9" stroke-width="1"/>`);
          out.push(`<text x="${(area.left - 8).toFixed(1)}" y="${(py + 4).toFixed(1)}" text-anchor="end" font-size="11" fill="#64748b">${xmlEsc(tk.label)}</text>`);
        }
      });
      const xTicks = sx.ticks || [];
      const maxXLabels = Math.max(1, Math.floor((area.right - area.left) / 52));
      const stepX = Math.max(1, Math.ceil(xTicks.length / maxXLabels));
      xTicks.forEach((tk, idx) => {
        if (idx % stepX !== 0 && idx !== xTicks.length - 1) return;
        const px = sx.getPixelForTick(idx);
        if (px >= area.left - 1 && px <= area.right + 1) {
          out.push(`<line x1="${px.toFixed(1)}" y1="${area.bottom.toFixed(1)}" x2="${px.toFixed(1)}" y2="${(area.bottom + 4).toFixed(1)}" stroke="#94a3b8" stroke-width="1"/>`);
          out.push(`<text x="${px.toFixed(1)}" y="${(area.bottom + 17).toFixed(1)}" text-anchor="middle" font-size="11" fill="#64748b">${xmlEsc(tk.label)}</text>`);
        }
      });
      if (sx.options && sx.options.title && sx.options.title.display && sx.options.title.text) {
        out.push(`<text x="${((area.left + area.right) / 2).toFixed(1)}" y="${(H - 6).toFixed(1)}" text-anchor="middle" font-size="12" font-weight="600" fill="#334155">${xmlEsc(sx.options.title.text)}</text>`);
      }
      if (sy.options && sy.options.title && sy.options.title.display && sy.options.title.text) {
        const my = (area.top + area.bottom) / 2;
        out.push(`<text x="14" y="${my.toFixed(1)}" text-anchor="middle" font-size="12" font-weight="600" fill="#334155" transform="rotate(-90 14 ${my.toFixed(1)})">${xmlEsc(sy.options.title.text)}</text>`);
      }
      chart.data.datasets.forEach((ds, di) => {
        const meta = chart.getDatasetMeta(di);
        if (meta.hidden) return;
        const mType = meta.type || type;
        const rawCol = Array.isArray(ds.borderColor) ? ds.borderColor[0] : (typeof ds.borderColor === 'string' ? ds.borderColor : (typeof ds.backgroundColor === 'string' ? ds.backgroundColor : PALETTE[di % PALETTE.length]));
        const bCol = parseCssColor(rawCol, PALETTE[di % PALETTE.length], 1);
        const bgCol = parseCssColor(typeof ds.backgroundColor === 'string' ? ds.backgroundColor : alpha(bCol.color, 0.78), bCol.color, 0.78);
        const elems = meta.data || [];
        if (mType === 'bar') {
          elems.forEach((el, ei) => {
            const p = el.getProps(['x', 'y', 'base', 'width', 'height'], true);
            const cFill = Array.isArray(ds.backgroundColor) ? parseCssColor(ds.backgroundColor[ei % ds.backgroundColor.length]) : bgCol;
            if (chart.options.indexAxis === 'y') {
              const x0 = Math.min(p.base, p.x), w = Math.abs(p.x - p.base), h = p.height || 16;
              out.push(`<rect x="${x0.toFixed(1)}" y="${(p.y - h / 2).toFixed(1)}" width="${Math.max(1, w).toFixed(1)}" height="${h.toFixed(1)}" rx="4" fill="${cFill.color}" fill-opacity="${cFill.opacity}"/>`);
            } else {
              const y0 = Math.min(p.base, p.y), h = Math.abs(p.base - p.y), w = p.width || 20;
              out.push(`<rect x="${(p.x - w / 2).toFixed(1)}" y="${y0.toFixed(1)}" width="${w.toFixed(1)}" height="${Math.max(1, h).toFixed(1)}" rx="4" fill="${cFill.color}" fill-opacity="${cFill.opacity}"/>`);
            }
          });
        } else {
          const validPts = elems.filter(pt => pt && isFinite(pt.x) && isFinite(pt.y) && !pt.skip);
          if ((mType === 'line' || ds.showLine) && validPts.length > 1) {
            const dPath = validPts.map((pt, i) => `${i === 0 ? 'M' : 'L'}${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(' ');
            if (ds.fill && validPts.length > 2) {
              const closePath = `${dPath} L${validPts[validPts.length - 1].x.toFixed(1)},${area.bottom.toFixed(1)} L${validPts[0].x.toFixed(1)},${area.bottom.toFixed(1)} Z`;
              out.push(`<path d="${closePath}" fill="${bgCol.color}" fill-opacity="0.12" stroke="none"/>`);
            }
            const dash = Array.isArray(ds.borderDash) && ds.borderDash.length ? ` stroke-dasharray="${ds.borderDash.join(',')}"` : '';
            out.push(`<path d="${dPath}" fill="none" stroke="${bCol.color}" stroke-opacity="${bCol.opacity}" stroke-width="${ds.borderWidth || 2.2}" stroke-linecap="round" stroke-linejoin="round"${dash}/>`);
          }
          validPts.forEach((pt, pi) => {
            const r = Array.isArray(ds.pointRadius) ? ds.pointRadius[pi] : (ds.pointRadius ?? (mType === 'scatter' ? 4.5 : 3));
            if (r > 0) {
              out.push(`<circle cx="${pt.x.toFixed(1)}" cy="${pt.y.toFixed(1)}" r="${r}" fill="${bgCol.color}" fill-opacity="${bgCol.opacity}" stroke="${bCol.color}" stroke-width="1.5"/>`);
            }
          });
        }
      });
    } else {
      const dataUrl = cv.toDataURL('image/png', 1.0);
      out.push(`<image href="${dataUrl}" width="${W}" height="${H}"/>`);
    }

    const legItems = (chart.data.datasets || []).filter((ds, i) => ds.label && !ds.label.startsWith('_') && !chart.getDatasetMeta(i).hidden);
    if (legItems.length > 0 && chart.options?.plugins?.legend?.display !== false) {
      let lx = 18;
      const ly = 18;
      legItems.forEach((ds, i) => {
        const rawC = typeof ds.borderColor === 'string' ? ds.borderColor : (typeof ds.backgroundColor === 'string' ? ds.backgroundColor : PALETTE[i % PALETTE.length]);
        const c = parseCssColor(rawC, PALETTE[i % PALETTE.length]).color;
        out.push(`<rect x="${lx}" y="${ly - 9}" width="10" height="10" rx="2.5" fill="${c}"/>`);
        out.push(`<text x="${lx + 14}" y="${ly}" font-size="11.5" font-weight="600" fill="#334155">${xmlEsc(ds.label)}</text>`);
        lx += 24 + String(ds.label).length * 7.8;
      });
    }
    out.push(`</svg>`);
    return out.join('\n');
  }

  /** 将 Canvas 或 SVG 打包为标准 PDF 1.4 独立文件并触发下载 */
  async function exportElementToPDF(sourceCanvasOrSvg, filename) {
    let canvas = sourceCanvasOrSvg;
    if (sourceCanvasOrSvg instanceof SVGElement) {
      const svgStr = new XMLSerializer().serializeToString(sourceCanvasOrSvg);
      const vb = sourceCanvasOrSvg.viewBox?.baseVal;
      const w = (vb && vb.width) || sourceCanvasOrSvg.clientWidth || 680;
      const h = (vb && vb.height) || sourceCanvasOrSvg.clientHeight || 280;
      canvas = document.createElement('canvas');
      canvas.width = w * 2;
      canvas.height = h * 2;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const img = new Image();
      const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      await new Promise((resolve, reject) => {
        img.onload = () => { ctx.drawImage(img, 0, 0, canvas.width, canvas.height); URL.revokeObjectURL(url); resolve(); };
        img.onerror = e => { URL.revokeObjectURL(url); reject(e); };
        img.src = url;
      });
    } else if (sourceCanvasOrSvg instanceof HTMLCanvasElement) {
      const tmp = document.createElement('canvas');
      tmp.width = sourceCanvasOrSvg.width;
      tmp.height = sourceCanvasOrSvg.height;
      const ctx = tmp.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, tmp.width, tmp.height);
      ctx.drawImage(sourceCanvasOrSvg, 0, 0);
      canvas = tmp;
    }
    const w = canvas.width, h = canvas.height;
    const jpegUrl = canvas.toDataURL('image/jpeg', 0.96);
    const binStr = atob(jpegUrl.split(',')[1]);
    const imgBytes = new Uint8Array(binStr.length);
    for (let i = 0; i < binStr.length; i++) imgBytes[i] = binStr.charCodeAt(i);

    const pdfW = 595.28;
    const margin = 36;
    const drawW = pdfW - margin * 2;
    const drawH = (h / w) * drawW;
    const pdfH = Math.max(260, drawH + margin * 2);

    const enc = new TextEncoder();
    const chunks = [];
    const offsets = [];
    let pos = 0;
    const pushStr = s => { const b = enc.encode(s); chunks.push(b); pos += b.length; };
    const pushBytes = b => { chunks.push(b); pos += b.length; };
    const startObj = id => { offsets[id] = pos; pushStr(`${id} 0 obj\n`); };

    pushStr('%PDF-1.4\n%\xFF\xFF\xFF\xFF\n');
    startObj(1); pushStr('<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
    startObj(2); pushStr('<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');
    startObj(3); pushStr(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pdfW.toFixed(2)} ${pdfH.toFixed(2)}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`);
    startObj(4); pushStr(`<< /Type /XObject /Subtype /Image /Width ${w} /Height ${h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imgBytes.length} >>\nstream\n`);
    pushBytes(imgBytes);
    pushStr('\nendstream\nendobj\n');
    const contentStream = `q\n${drawW.toFixed(2)} 0 0 ${drawH.toFixed(2)} ${margin.toFixed(2)} ${margin.toFixed(2)} cm\n/Im0 Do\nQ\n`;
    startObj(5); pushStr(`<< /Length ${contentStream.length} >>\nstream\n${contentStream}endstream\nendobj\n`);
    const xrefPos = pos;
    pushStr('xref\n0 6\n0000000000 65535 f \n');
    for (let i = 1; i <= 5; i++) pushStr(String(offsets[i]).padStart(10, '0') + ' 00000 n \n');
    pushStr(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF\n`);
    downloadBlob(new Blob(chunks, { type: 'application/pdf' }), filename);
  }

  /** 将 DOM <table> 转换为出版级 LaTeX booktabs 三线表源码 */
  function domTableToLatex(tableEl, captionTitle = '模型计算结果表') {
    const cleanCell = td => {
      const clone = td.cloneNode(true);
      clone.querySelectorAll('.sbar, svg, button').forEach(x => x.remove());
      let txt = clone.textContent.replace(/\s+/g, ' ').trim();
      txt = txt.replace(/([%&_#$])/g, '\\$1').replace(/≈/g, '$\\approx$').replace(/≤/g, '$\\le$').replace(/≥/g, '$\\ge$').replace(/×/g, '$\\times$').replace(/★/g, '$\\star$');
      return txt || '--';
    };
    const allRows = Array.from(tableEl.querySelectorAll('tr'));
    if (!allRows.length) return '';
    const keepCols = [];
    const firstCells = Array.from(allRows[0].children);
    firstCells.forEach((th, j) => {
      if (!th.classList.contains('bar-col') && th.textContent.trim() !== '可视化') keepCols.push(j);
    });
    const matrix = allRows.map(tr => {
      const cells = Array.from(tr.children);
      return keepCols.map(j => (cells[j] ? cleanCell(cells[j]) : '--'));
    });
    const colCount = keepCols.length;
    const align = 'l' + 'c'.repeat(Math.max(0, colCount - 1));
    const headRow = matrix[0].map(h => `\\textbf{${h}}`).join(' & ') + ' \\\\';
    const bodyRows = matrix.slice(1).map(r => '    ' + r.join(' & ') + ' \\\\').join('\n');
    return [
      '% 需在导言区引入 \\usepackage{booktabs}',
      '\\begin{table}[htbp]',
      '  \\centering',
      `  \\caption{${captionTitle.replace(/([%&_#$])/g, '\\$1')}}`,
      `  \\begin{tabular}{${align}}`,
      '    \\toprule',
      `    ${headRow}`,
      '    \\midrule',
      bodyRows,
      '    \\bottomrule',
      '  \\end{tabular}',
      '\\end{table}',
    ].join('\n');
  }

  function domTableToCSV(tableEl) {
    const allRows = Array.from(tableEl.querySelectorAll('tr'));
    return allRows.map(tr => {
      const cells = Array.from(tr.children).filter(td => !td.classList.contains('bar-col') && td.textContent.trim() !== '可视化');
      return cells.map(td => {
        const s = td.textContent.replace(/\s+/g, ' ').trim();
        return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
      }).join(',');
    }).join('\r\n');
  }

  function gradFill(horizontal) {
    const [c1, c2] = curAlgo.c;
    return ctx => {
      const { chart } = ctx, area = chart.chartArea;
      if (!area) return c1;
      const g = horizontal ? chart.ctx.createLinearGradient(area.left, 0, area.right, 0) : chart.ctx.createLinearGradient(0, area.bottom, 0, area.top);
      g.addColorStop(0, alpha(c1, 0.85)); g.addColorStop(1, alpha(c2, 0.95));
      return g;
    };
  }
  function barCfg(labels, data, { horizontal = false, label = '' } = {}) {
    return {
      type: 'bar',
      data: { labels, datasets: [{ label, data, backgroundColor: gradFill(horizontal), borderRadius: 8, maxBarThickness: 40 }] },
      options: {
        indexAxis: horizontal ? 'y' : 'x', responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ` ${label}: ${fmt(horizontal ? c.parsed.x : c.parsed.y, 4)}` } } },
        scales: { x: { grid: { display: horizontal }, beginAtZero: true }, y: { grid: { display: !horizontal }, beginAtZero: true } },
      },
    };
  }
  const baseScatterOpts = (xTitle, yTitle) => ({
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'top', labels: { usePointStyle: true, boxWidth: 8, filter: i => !i.text.startsWith('_') } } },
    scales: { x: { type: 'linear', title: { display: !!xTitle, text: xTitle }, grid: { color: '#f0f1f7' } }, y: { title: { display: !!yTitle, text: yTitle }, grid: { color: '#f0f1f7' } } },
  });

  const resCard = (title, body, tag = '') => `<div class="res-card fade-in"><div class="res-title">${title}${tag ? `<span class="res-tag">${tag}</span>` : ''}</div>${body}</div>`;
  const tblToolbarHTML = () => `<div class="tbl-toolbar"><span class="tt-badge">📑 论文表格工具</span><button type="button" class="tt-btn" data-tbl-act="copy-latex">📋 复制 LaTeX 三线表</button><button type="button" class="tt-btn" data-tbl-act="toggle-latex">👁️ LaTeX 源码</button><button type="button" class="tt-btn" data-tbl-act="export-csv">📥 导出 CSV</button></div>`;
  function tableHTML(M, rows, cols, d = 4, corner = '') {
    return `<div class="table-wrap">${tblToolbarHTML()}<table><thead><tr><th>${corner}</th>${cols.map(c => `<th>${c}</th>`).join('')}</tr></thead><tbody>${M.map((r, i) => `<tr><th>${rows[i]}</th>${r.map(v => `<td>${typeof v === 'number' ? fmt(v, d) : v}</td>`).join('')}</tr>`).join('')}</tbody></table><pre class="latex-preview" hidden></pre></div>`;
  }
  function rawTable(head, rows) {
    return `<div class="table-wrap">${tblToolbarHTML()}<table><thead><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map((c, j) => (j === 0 ? `<th>${c}</th>` : `<td>${c}</td>`)).join('')}</tr>`).join('')}</tbody></table><pre class="latex-preview" hidden></pre></div>`;
  }
  const metrics = list => `<div class="metrics">${list.map(m => `<div class="metric ${m.cls || ''}"><div class="mk">${m.k}</div><div class="mv">${m.v}</div>${m.s ? `<div class="ms">${m.s}</div>` : ''}</div>`).join('')}</div>`;
  const rankPill = r => `<span class="rk ${r <= 3 ? 'r' + r : ''}">${r}</span>`;
  const sortedIdx = rank => rank.map((_, i) => i).sort((a, b) => rank[a] - rank[b]);
  function rankTable(names, cols, score, rank, scoreName = '得分', objName = '对象') {
    const order = sortedIdx(rank), max = Math.max(...score.map(Math.abs));
    return `<div class="table-wrap">${tblToolbarHTML()}<table><thead><tr><th>排名</th><th>${objName}</th>${cols.map(c => `<th>${c.n}</th>`).join('')}<th>${scoreName}</th><th class="bar-col">可视化</th></tr></thead><tbody>${order.map(i => `<tr><td>${rankPill(rank[i])}</td><th>${esc(names[i])}</th>${cols.map(c => `<td>${fmt(c.v[i], c.d ?? 4)}</td>`).join('')}<td class="strong">${fmt(score[i], 4)}</td><td class="bar-col"><div class="sbar"><i style="width:${max > 0 ? Math.max(0, score[i] / max * 100) : 0}%"></i></div></td></tr>`).join('')}</tbody></table><pre class="latex-preview" hidden></pre></div>`;
  }
  const errBox = msg => `<div class="callout error fade-in"><b>计算出错</b><div>${msg}</div></div>`;

  const csvImportBtnHTML = () => `<label class="btn ghost sm csv-btn" title="点击选择本地 .csv / .tsv / .txt 数据文件，或直接将文件拖拽到输入框"><input type="file" accept=".csv,.tsv,.txt" hidden class="csv-file-inp">📂 导入 CSV</label>`;
  function inputPanel(num, title, hint, extra = '') {
    return `<div class="panel"><div class="panel-title"><span class="pt-num">${num}</span>${title}<span class="csv-drop-badge">支持拖拽 CSV</span></div><p class="hint">${hint}</p>
      <textarea id="din" class="data-input" spellcheck="false" placeholder="在此粘贴/输入数据，或直接将 .csv / .txt 文件拖拽至此处…"></textarea>
      <div class="btn-row"><button class="btn ghost sm" id="bex">${ico('db')}载入示例</button>${csvImportBtnHTML()}<button class="btn ghost sm" id="bclr">清空</button><span class="data-info" id="dinfo"></span></div>${extra}</div>`;
  }
  const runBar = (label = '开始计算') => `<div class="run-bar"><button class="btn primary lg" id="brun">${ico('play')}${label}</button></div><div id="out" class="out"></div>`;
  function seg(el, onChange) {
    el.addEventListener('click', e => {
      const b = e.target.closest('button');
      if (!b) return;
      $$('button', el).forEach(x => x.classList.toggle('on', x === b));
      onChange && onChange(b.dataset.v);
    });
    return () => $('button.on', el).dataset.v;
  }
  function runSafe(out, fn, scroll) {
    destroyCharts();
    try { fn(); renderMath(out); } catch (e) { console.error(e); out.innerHTML = errBox(esc(e.message)); }
    if (scroll) out.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /** 指标类型编辑器 */
  function TypeEditor(box) {
    let types = [], names = [];
    const OPTS = [['max', '极大型 ↑'], ['min', '极小型 ↓'], ['mid', '中间型 ◎'], ['int', '区间型 ⇔']];
    const params = t => {
      if (t.type === 'mid') return `<input class="inp sm" data-k="best" type="number" step="any" placeholder="最优值" value="${t.best ?? ''}">`;
      if (t.type === 'int') return `<input class="inp sm" data-k="a" type="number" step="any" placeholder="下限 a" value="${t.a ?? ''}"><span class="tilde">~</span><input class="inp sm" data-k="b" type="number" step="any" placeholder="上限 b" value="${t.b ?? ''}">`;
      return '';
    };
    function render(newNames) {
      if (newNames.length !== names.length) types = newNames.map((_, j) => types[j] || { type: 'max' });
      names = newNames;
      box.innerHTML = names.length
        ? names.map((nm, j) => `<div class="type-row" data-j="${j}"><span class="type-name" title="${esc(nm)}">${esc(nm)}</span><select class="sel">${OPTS.map(([v, l]) => `<option value="${v}" ${types[j].type === v ? 'selected' : ''}>${l}</option>`).join('')}</select><span class="type-params">${params(types[j])}</span></div>`).join('')
        : '<div class="hint">输入数据后将自动生成指标列表</div>';
    }
    const onEdit = e => {
      const row = e.target.closest('.type-row');
      if (!row) return;
      const j = +row.dataset.j;
      if (e.target.tagName === 'SELECT') {
        if (e.type !== 'change') return;
        types[j] = { type: e.target.value };
        $('.type-params', row).innerHTML = params(types[j]);
      } else if (e.target.dataset.k) {
        types[j][e.target.dataset.k] = e.target.value === '' ? undefined : Number(e.target.value);
      }
    };
    box.addEventListener('change', onEdit);
    box.addEventListener('input', onEdit);
    function get() {
      return types.map((t, j) => {
        if (t.type === 'mid' && !isFinite(t.best)) throw new Error(`指标「${esc(names[j])}」为中间型，请填写最优值`);
        if (t.type === 'int') {
          if (!isFinite(t.a) || !isFinite(t.b)) throw new Error(`指标「${esc(names[j])}」为区间型，请填写区间上下限`);
          if (t.a > t.b) throw new Error(`指标「${esc(names[j])}」的区间下限不能大于上限`);
        }
        return { ...t };
      });
    }
    return { render, get, set(n, t) { names = n; types = t.map(x => ({ ...x })); render(n); } };
  }

  /** 绑定矩阵数据输入（含示例、清空、自动识别） */
  function setupInput(opts) {
    const ta = $('#din'), info = $('#dinfo');
    const te = opts.types ? TypeEditor($('#types')) : null;
    const apply = (t, types) => {
      info.innerHTML = `<span class="ok-dot"></span>已识别 ${t.data.length} ${opts.rowUnit || '行'} × ${t.colNames.length} ${opts.colUnit || '列'}`;
      if (te) types ? te.set(t.colNames, types) : te.render(t.colNames);
      return t;
    };
    const tryParse = () => {
      try { return apply(parseTable(ta.value, opts.parse)); } catch (e) { info.innerHTML = `<span class="bad-dot"></span>${e.message}`; return null; }
    };
    let tm;
    ta.addEventListener('input', () => { clearTimeout(tm); tm = setTimeout(tryParse, 250); });
    const load = (ex, types) => { ta.value = ex; apply(parseTable(ex, opts.parse), types); };
    $('#bex').onclick = () => load(opts.example(), opts.exTypes && opts.exTypes());
    $('#bclr').onclick = () => { ta.value = ''; info.textContent = ''; if (te) te.render([]); ta.focus(); };
    load(opts.example(), opts.exTypes && opts.exTypes());
    return {
      get() { const t = parseTable(ta.value, opts.parse); apply(t); return t; },
      types: () => (te ? te.get() : null),
      load,
    };
  }

  /* =========================================================
     竞赛专栏数据与子页面渲染 (国赛 / 美赛 / 评审指标 / 优秀论文 / 选型指南)
     ========================================================= */
  const COMP_NAV = [
    { id: 'cumcm', name: '国赛 (CUMCM) 指南', icon: 'CN', c: ['#e11d48', '#f97316'], search: '国赛cumcm全国大学生数学建模竞赛abc题zhanwen' },
    { id: 'mcm', name: '美赛 (MCM/ICM) 指南', icon: 'US', c: ['#2563eb', '#06b6d4'], search: '美赛mcmicm美国大学生数学建模竞赛abcdef题o奖mathmodelhub' },
    { id: 'criteria', name: '评审标准与检验指标', icon: '评', c: ['#d97706', '#f59e0b'], search: '评审维度标准检验误差指标maemsermsemaper2轮廓系数aiccr' },
    { id: 'papers', name: '历年优秀论文精粹', icon: '文', c: ['#7c3aed', '#ec4899'], search: '优秀论文真题国一o奖20212022202320242025github' },
    { id: 'guide', name: '王炸组合与算法选型', icon: '导', c: ['#0d9488', '#3b82f6'], search: '王炸组合算法选择指南速查表流程七步法' },
  ];

  function algoLink(id, label) {
    const a = ALGOS.find(x => x.id === id);
    const name = label || (a ? a.short || a.name : id);
    const c1 = a ? a.c[0] : '#6366f1';
    return `<a class="comp-algo-chip" href="#/${id}" style="--chip-c:${c1}">${esc(name)} →</a>`;
  }

  const CUMCM_PROBLEMS = [
    {
      code: '国赛 · A 题',
      group: '连续机理与工程优化',
      color: '#e11d48',
      bg: '物理、光学、机械运动学、热传导、空间几何与连续优化',
      feature: '物理与工程机理深厚，需根据几何或守恒定律自行推导微分/代数方程，计算量大，常需结合数值积分与启发式搜索求解极值。',
      examples: '2024《“板凳龙”闹元宵》(螺线运动学+碰撞搜索)、2023《定日镜场的优化设计》(光学追踪+排布寻优)、2022《波浪能最大输出功率设计》(动力学微分方程+RK4)',
      algos: [['ode_sir', '微分方程 RK4'], ['sa_pso', '模拟退火寻优 SA'], ['monte_carlo', '蒙特卡洛仿真'], ['nonlinear', '非线性回归']],
    },
    {
      code: '国赛 · B 题',
      group: '离散运筹与工业决策',
      color: '#2563eb',
      bg: '工业生产调度、抽样检验、图论路径规划、通信与材料分类',
      feature: '离散与运筹色彩鲜明，常围绕制造流程、测线布设或资源排布展开，核心在于建立线性/整数规划或多阶段决策模型并设计启发式算法求解。',
      examples: '2024《生产过程中的决策问题》(抽样+0-1规划)、2023《多波束测线问题》(几何递推+路径规划)、2022《无人机遂行编队定位》&《古代玻璃成分鉴别》(PCA+K-Means)',
      algos: [['lp', '线性/整数规划 LP'], ['sa_pso', '模拟退火 TSP/排布'], ['kmeans', 'K-Means 聚类'], ['pca', '主成分分析 PCA'], ['markov', '马尔可夫决策']],
    },
    {
      code: '国赛 · C 题',
      group: '数据挖掘与经济决策（最热门）',
      color: '#0d9488',
      bg: '农林经济、商超零售定价、金融风控、供应链特征分析与预测',
      feature: '附带较大规模真实业务表格数据（选题率约占 50%+），典型建模链路为“数据清洗/聚类分群 → 回归/时序预测 → 线性/多目标规划决策 → 蒙特卡洛风险分析”。',
      examples: '2024《农作物的种植策略》(线性规划+蒙特卡洛风险模拟)、2023《蔬菜类商品自动定价与补货》(K-Means+ARIMA/回归+收益规划)、2021《生产企业原材料的订购与运输》(TOPSIS+规划)',
      algos: [['lp', '线性规划 LP'], ['arima', 'ARIMA 时序'], ['multiple', '多元线性回归'], ['kmeans', 'K-Means 聚类'], ['topsis', '熵权-TOPSIS'], ['monte_carlo', '蒙特卡洛模拟']],
    },
  ];

  const MCM_PROBLEMS = [
    {
      code: 'MCM · A 题',
      type: 'Continuous · 连续型问题',
      color: '#e11d48',
      rate: '选题率 ~12%',
      desc: '聚焦自然科学、物理工程与生态系统的连续动态演化。核心是建立常微分方程组 (ODEs) 或偏微分方程、开展相平面稳定性分析与 RK4 数值仿真。',
      examples: '2025 A《楼梯踏步磨损反演》、2024 A《七鳃鳗性别比例与生态种群演化》、2023 A《干旱下植物群落演化》',
      algos: [['ode_sir', '微分方程 RK4 (SEIR/LV)'], ['monte_carlo', '蒙特卡洛反演'], ['nonlinear', '非线性拟合'], ['sa_pso', '模拟退火寻优']],
    },
    {
      code: 'MCM · B 题',
      type: 'Discrete · 离散型问题',
      color: '#7c3aed',
      rate: '选题率 ~8%',
      desc: '聚焦离散数学、组合优化、图论搜索与应急调度。需要较强的算法设计能力，将搜索救援、资源配置转化为整数规划或元启发式路径优化。',
      examples: '2025 B《朱诺号过度旅游可持续管理》、2024 B《深海潜水器搜救定位》、2022 B《水资源电网上水分配》',
      algos: [['sa_pso', '模拟退火 SA'], ['lp', '线性/整数规划'], ['markov', '马尔可夫转移'], ['monte_carlo', '蒙特卡洛模拟']],
    },
    {
      code: 'MCM · C 题',
      type: 'Data Insights · 大数据洞察（最热门）',
      color: '#2563eb',
      rate: '选题率 ~35% ⭐',
      desc: '美赛参赛人数最多的题型（MathModelHub 核心收录）。官方提供真实数据集，考察探索性数据分析、时间序列预测、特征回归、无监督分群与敏感性检验。',
      examples: '2025 C《奥运会奖牌榜预测与伟大教练效应》、2024 C《网球中的势能动量分析》、2023 C《Wordle 游戏预测》、2022 C《黄金与比特币量化交易》',
      algos: [['multiple', '多元回归/Lasso'], ['arima', 'ARIMA 时间序列'], ['kmeans', 'K-Means++ 聚类'], ['pca', '主成分分析 PCA'], ['markov', '马尔可夫链']],
    },
    {
      code: 'ICM · D 题',
      type: 'Operations Research / Network · 运筹与网络科学',
      color: '#0284c7',
      rate: '选题率 ~10%',
      desc: '聚焦复杂网络拓扑、交通/物流基础设施规划与供应链运筹调度。核心在于建立多目标线性规划、网络关键节点评估与鲁棒优化模型。',
      examples: '2025 D《巴尔的摩城市交通网络优化》、2024 D《五大湖水网水位调度控制》、2023 D《联合国优先发展资源配置》',
      algos: [['lp', '线性规划单纯形'], ['sa_pso', '启发式路径优化'], ['topsis', 'TOPSIS 节点评价'], ['entropy', '熵权法']],
    },
    {
      code: 'ICM · E 题',
      type: 'Sustainability · 环境与可持续科学',
      color: '#059669',
      rate: '选题率 ~22% ⭐',
      desc: '围绕生态保护、气候变化、农业演化与碳汇机制。最经典的建模套路是“AHP+熵权-TOPSIS 构建可持续性指数 + 微分方程/GM(1,1) 预测未来情景”。',
      examples: '2025 E《森林转农业生态系统演化》、2024 E《财产保险可持续性与极端天气风险》、2023 E《光污染综合评估》',
      algos: [['ahp', '层次分析法 AHP'], ['entropy', '熵权法'], ['topsis', 'TOPSIS 法'], ['ode_sir', 'Lotka-Volterra 动力学'], ['gm11', '灰色预测 GM(1,1)']],
    },
    {
      code: 'ICM · F 题',
      type: 'Policy · 公共政策与社会治理',
      color: '#d97706',
      rate: '选题率 ~13%',
      desc: '开放度最高的人文社科与宏观政策题。需自己定义量化指标体系（PCA/FCE/TOPSIS），结合因果回归与灰色关联量化政策干预前后的效应并提供决策备忘录。',
      examples: '2025 F《网络犯罪国际治理政策分布》、2024 F《非法野生动物贸易消减方案》、2023 F《绿色 GDP 核算体系》',
      algos: [['pca', '主成分分析 PCA'], ['fce', '模糊综合评价'], ['topsis', 'TOPSIS 综合评价'], ['gra', '灰色关联分析'], ['multiple', '多元线性回归']],
    },
  ];

  const PAPERS_DATA = [
    {
      comp: 'cumcm',
      year: '2024 国赛 C 题',
      award: '国赛一等奖范式',
      title: '农作物的种植策略（乡村耕地最优种植与风险鲁棒规划）',
      summary: '针对未来 2024–2030 年乡村 54 块耕地与 41 种农作物的轮作、豆类重茬约束及销售不确定性，一等奖论文普遍采用“分阶段单目标/多目标混合整数线性规划 + 蒙特卡洛随机扰动仿真 + 相关性分析”构建鲁棒种植方案。',
      algos: [['lp', '线性规划 LP'], ['monte_carlo', '蒙特卡洛模拟'], ['multiple', '多元回归/相关'], ['topsis', 'TOPSIS 方案优选']],
      repoName: 'zhanwen/MathModel · 2024国赛试题与优秀论文',
      repoUrl: 'https://github.com/zhanwen/MathModel',
    },
    {
      comp: 'cumcm',
      year: '2024 国赛 A 题',
      award: '国赛一等奖范式',
      title: '“板凳龙”闹元宵（阿基米德螺线运动学递推与调头空间寻优）',
      summary: '建立等螺距阿基米德螺线与双圆弧调头路径的刚体几何约束方程，利用四阶龙格-库塔/二分牛顿法递推各把手位置与速度，并通过模拟退火算法搜索不发生碰撞的最小调头圆半径与最大龙头行进速度。',
      algos: [['ode_sir', '微分方程 RK4'], ['sa_pso', '模拟退火寻优 SA'], ['nonlinear', '非线性拟合']],
      repoName: 'zhanwen/MathModel · 2024国赛A题解析',
      repoUrl: 'https://github.com/zhanwen/MathModel',
    },
    {
      comp: 'cumcm',
      year: '2024 国赛 B 题',
      award: '国赛一等奖范式',
      title: '生产过程中的决策问题（零配件抽样检验与多工序 0-1 规划）',
      summary: '第一问基于二项分布/正态近似构建最小样本量抽样检验模型；第二、三问将多道工序的检测、拆解与调换抽象为 0-1 整数线性规划与马尔可夫状态转移过程，并用蒙特卡洛模拟验证抽样误差下的期望利润稳健性。',
      algos: [['lp', '线性/0-1规划'], ['monte_carlo', '蒙特卡洛抽样'], ['markov', '马尔可夫转移']],
      repoName: 'zhanwen/MathModel · 2024国赛B题专栏',
      repoUrl: 'https://github.com/zhanwen/MathModel',
    },
    {
      comp: 'cumcm',
      year: '2023 国赛 C 题',
      award: '国赛一等奖精选',
      title: '蔬菜类商品的自动定价与补货决策（商超生鲜收益最大化）',
      summary: '先对数万条流水做聚合，使用 K-Means++ 与灰色关联分析刻画 6 大蔬菜品类销售规律；再用非线性回归/ARIMA 拟合“成本加成定价—销量弹性曲线”，最终建立损耗约束下的每日补货与定价线性/非线性规划模型。',
      algos: [['kmeans', 'K-Means 聚类'], ['arima', 'ARIMA 预测'], ['nonlinear', '非线性价格弹性'], ['lp', '收益最大化规划'], ['gra', '灰色关联分析']],
      repoName: 'zhanwen/MathModel · 2023年优秀论文',
      repoUrl: 'https://github.com/zhanwen/MathModel',
    },
    {
      comp: 'cumcm',
      year: '2023 国赛 A 题',
      award: '国赛一等奖精选',
      title: '定日镜场的优化设计（塔式光热发电光学效率与排布优化）',
      summary: '采用蒙特卡洛光线追踪法计算大气透射率、阴影遮挡效率与截断效率，随后以单位镜面年平均输出热功率最大为目标，使用模拟退火（SA）/粒子群算法（PSO）协同优化吸收塔坐标、定日镜尺寸与非均匀径向交错排布参数。',
      algos: [['monte_carlo', '蒙特卡洛光线追踪'], ['sa_pso', '模拟退火排布优化'], ['nonlinear', '非线性曲面拟合']],
      repoName: 'zhanwen/MathModel · 2023年优秀论文',
      repoUrl: 'https://github.com/zhanwen/MathModel',
    },
    {
      comp: 'cumcm',
      year: '2022 国赛 B 题',
      award: '国赛一等奖精选',
      title: '古代玻璃制品的成分分析与鉴别（高钾与铅钡玻璃亚类划分）',
      summary: '针对风化前后化学成分的定和约束，先通过主成分分析 (PCA) 消除多重共线性并提取关键主成分，再利用 K-Means++ 聚类（结合肘部法则与轮廓系数）完成高钾玻璃与铅钡玻璃的亚类划分，最后通过灰色关联分析完成未知类别鉴别与敏感性检验。',
      algos: [['pca', '主成分分析 PCA'], ['kmeans', 'K-Means 亚类划分'], ['gra', '灰色关联分析'], ['multiple', '多元回归预测']],
      repoName: 'zhanwen/MathModel · 国赛论文集',
      repoUrl: 'https://github.com/zhanwen/MathModel',
    },
    {
      comp: 'mcm',
      year: '2025 美赛 C 题',
      award: 'O 奖 (Outstanding Winner) 示范',
      title: 'Models for Olympic Medal Tables（2028 洛杉矶奥运奖牌预测与伟大教练效应）',
      summary: 'MathModelHub 仓库内置完整复现案例：以滞后项 total_lag1、东道主效应 is_host 构建多元线性/Lasso 正则回归 (R²=0.9484) 与 ARIMA 预测各国奖牌榜及“首枚奖牌突破概率”；结合变点检测与 TOPSIS 定量证明郎平、贝拉等“伟大教练”带来的结构性跃升。',
      algos: [['multiple', '多元回归 (R²=0.948)'], ['arima', 'ARIMA 时间序列'], ['topsis', 'TOPSIS 教练效应评估'], ['monte_carlo', '蒙特卡洛置信区间']],
      repoName: 'Juccy-12/MathModelHub · 2025C示例与O奖论文',
      repoUrl: 'https://github.com/Juccy-12/MathModelHub/tree/main/past_problems',
    },
    {
      comp: 'mcm',
      year: '2024 美赛 C 题',
      award: 'O 奖 (Outstanding Winner) 双语集',
      title: 'Momentum in Tennis（温网男单决赛中的“势能/动量”量化与比赛转折预测）',
      summary: '收录于 MathModelHub（含 2 篇英文 O 奖原版 + 3 篇中文精译）：利用熵权-TOPSIS 与主成分分析合成实时“球员势能指数”，建立发球/破发状态空间的马尔可夫链转移模型验证动量存在性（卡方游程检验），并对比赛局势进行 K-Means 阶段分群。',
      algos: [['markov', '马尔可夫状态转移'], ['entropy', '熵权法'], ['topsis', 'TOPSIS 动量评分'], ['kmeans', 'K-Means 态势聚类']],
      repoName: 'Juccy-12/MathModelHub · past_problems/2024',
      repoUrl: 'https://github.com/Juccy-12/MathModelHub/tree/main/past_problems',
    },
    {
      comp: 'mcm',
      year: '2024 美赛 A 题 & 2025 美赛 E 题',
      award: 'O 奖连续机理范式',
      title: 'Resource Availability and Sex Ratios（七鳃鳗性别比例演化与农业生态系统动力学）',
      summary: '针对七鳃鳗随食物丰度调节雌雄比例的生态现象，O 奖论文将性别比定义为资源可利用性的内生动态函数，扩展经典的 Lotka-Volterra 捕食者-猎物耦合常微分方程组，采用四阶龙格-库塔法 (RK4) 仿真相平面极限环，并叠加上千次蒙特卡洛环境冲击测试生态系统稳定性。',
      algos: [['ode_sir', 'Lotka-Volterra 动力学 (RK4)'], ['monte_carlo', '蒙特卡洛环境冲击'], ['fce', '模糊生态稳定性评价']],
      repoName: 'Juccy-12/MathModelHub · 算法参考手册',
      repoUrl: 'https://github.com/Juccy-12/MathModelHub/blob/main/algorithms/algorithms_reference.md',
    },
    {
      comp: 'mcm',
      year: '2023 美赛 C 题',
      award: 'O 奖 (Outstanding Winner) 双语集',
      title: 'Predicting Wordle Results（Wordle 猜词游戏上报人数时序预测与单词难度分级）',
      summary: '收录于 MathModelHub 2023 专栏：第一问采用 ARIMA 时间序列与指数衰减非线性回归预测 2023 年 3 月 1 日报告人数区间；第二、三问提取元音占比、字母频次与重复度特征，采用多元回归预测 1~6 次尝试分布，并用 K-Means++（结合轮廓系数与肘部法则）将单词划分为简单、适中、困难三档。',
      algos: [['arima', 'ARIMA 时间序列'], ['nonlinear', '指数衰减回归'], ['multiple', '多元回归分布预测'], ['kmeans', 'K-Means++ 难度分群']],
      repoName: 'Juccy-12/MathModelHub · past_problems/2023',
      repoUrl: 'https://github.com/Juccy-12/MathModelHub/tree/main/past_problems',
    },
    {
      comp: 'mcm',
      year: '2022 美赛 C 题',
      award: 'O 奖 (Outstanding Winner) 双语集',
      title: 'Trading Strategies（仅凭历史价格的黄金与比特币动态量化投资组合策略）',
      summary: '收录于 MathModelHub 2022 专栏：以滚动窗口 ARIMA 与灰色预测 GM(1,1) 预判未来短期涨跌趋势与波动率风险，随后考虑 1%/2% 交易佣金约束，建立日度收益-风险权衡的线性规划/动态调仓模型，并对交易成本做灵敏度压力测试。',
      algos: [['arima', 'ARIMA 价格预测'], ['gm11', 'GM(1,1) 短期趋势'], ['lp', '线性规划仓位分配'], ['monte_carlo', '蒙特卡洛风险回撤']],
      repoName: 'Juccy-12/MathModelHub · past_problems/2022',
      repoUrl: 'https://github.com/Juccy-12/MathModelHub/tree/main/past_problems',
    },
    {
      comp: 'mcm',
      year: '2021 美赛 C / E / F 题',
      award: 'O 奖 (Outstanding Winner) 经典',
      title: '联合国可持续发展目标 (SDG) 网络评估与全球粮食系统多维优化',
      summary: '收录于 MathModelHub 2021 专栏：针对 17 项联合国可持续发展指标的高维共线性，先用主成分分析 (PCA) 提取经济、生态、社会三大主成分，再用 AHP + 熵权-TOPSIS 构建各国 SDG 综合绩效指数，最后用灰色关联分析 (GRA) 识别政策干预的核心杠杆点。',
      algos: [['pca', '主成分分析 PCA'], ['ahp', '层次分析法 AHP'], ['entropy', '熵权法'], ['topsis', 'TOPSIS 综合评价'], ['gra', '灰色关联分析']],
      repoName: 'Juccy-12/MathModelHub · past_problems/2021',
      repoUrl: 'https://github.com/Juccy-12/MathModelHub/tree/main/past_problems',
    },
  ];

  const CRITERIA_VS = [
    {
      dim: '1. 问题属性与答案导向',
      cumcm: '<b>半封闭靶向型</b>：前几问通常有明确的物理或数学标准数值范围，阅卷首先核对关键中间量与最终数值结果是否准确。',
      mcm: '<b>高度开放探索型</b>：无唯一标准答案，模型是“说服评委的工具”，重在假设合理性、分析框架深度与逻辑自洽。',
      tip: '使用本站在线求解器交叉核对中间矩阵与最终数值结果',
    },
    {
      dim: '2. 摘要 (Abstract / Summary)',
      cumcm: '<b>高度凝练（1 页以内）</b>：必须开门见山写明各问建立的具体数学模型名称、求解算法及算出的核心具体数值结论。',
      mcm: '<b>获奖生死线（初评全看摘要页）</b>：必须清晰回答“问题是什么、建了什么模型、得出什么定量结论与精度指标、给出什么政策建议”。',
      tip: '在摘要中明确列出模型精度指标（如 R²、RMSE、轮廓系数）',
    },
    {
      dim: '3. 模型假设与误差/灵敏度检验',
      cumcm: '<b>重推导与求解检验</b>：合理简化次要矛盾即可，重点放在方程建立严密性、残差检验与结果稳定性验证。',
      mcm: '<b>极度重视灵敏度与误差分析</b>：每个假设需有依据，且必须专设章节做<b>误差精度评估 (MAE/RMSE/MAPE)</b> 与<b>参数扰动灵敏度分析</b>。',
      tip: '本站所有回归/时序模块均内置 MAE、MSE、RMSE、MAPE 面板',
    },
    {
      dim: '4. 算法偏好与模型复杂度',
      cumcm: '<b>A 题重连续机理与数值解，B 题重运筹规划与启发式，C 题重数据统计与优化</b>；忌生搬硬套黑箱模型，重数学机理可解释性。',
      mcm: '<b>C/E/F 题占 70% 选题率</b>：高频青睐 AHP+熵权-TOPSIS、PCA、K-Means++、ARIMA、多元回归、微分方程动力学与蒙特卡洛模拟。',
      tip: '根据题型特征采用“主客观组合”或“预测+规划”串联建模',
    },
    {
      dim: '5. 图表可视化与政策文书',
      cumcm: '<b>规范严谨</b>：三线表规范、公式编号清晰、坐标轴量纲完整，附录或支撑材料附带完整可运行源码。',
      mcm: '<b>审美即生产力</b>：高信息密度组合图（相平面轨线图、肘部轮廓双轴图、置信带图）+ 1~2 页给决策者的<b>政策备忘录 (Memo)</b>。',
      tip: '所有在线求解器均自动生成可交互的高清可视化图表',
    },
  ];

  const METRIC_SPECS = [
    {
      name: '决定系数 R² (Coefficient of Determination)',
      cat: '回归与拟合优度',
      color: '#2563eb',
      formula: '$$R^2 = 1 - \\frac{\\sum_{i=1}^n (y_i - \\hat y_i)^2}{\\sum_{i=1}^n (y_i - \\bar y)^2} \\in [0, 1]$$',
      explain: '<b>公式解读：</b>分子是“模型预测不了的残差平方和”，分母是“原始数据自身的波动总平方和”；$1 - \\text{未解释占比}$ 就是模型成功解释的波动百分比。',
      std: 'R² > 0.8 拟合极佳；0.6 ~ 0.8 拟合良好；越接近 1 说明自变量对因变量方差的解释力越强。',
      desc: '衡量回归模型对观测数据总波动的解释比例。多元回归中需同时报告调整后决定系数 $\\bar R^2$ 以惩罚冗余特征。',
      algos: [['linear', '一元线性回归'], ['multiple', '多元线性回归'], ['nonlinear', '非线性回归'], ['gm11', '灰色预测 GM(1,1)']],
    },
    {
      name: '平均绝对误差 MAE & 均方根误差 RMSE',
      cat: '回归与时序预测核心误差',
      color: '#f97316',
      formula: '$$\\text{MAE}=\\frac{1}{n}\\sum_{i=1}^n|y_i-\\hat y_i|,\\quad \\text{RMSE}=\\sqrt{\\frac{1}{n}\\sum_{i=1}^n(y_i-\\hat y_i)^2}$$',
      explain: '<b>公式解读：</b>$|y_i-\\hat y_i|$ 是单次预测偏差；$\\text{MAE}$ 直接取绝对值平均，而 $\\text{RMSE}$ 先平方再平均最后开根号，因此对个别“偏离特别大”的极端失误惩罚更重。',
      std: '量纲与原数据一致，越小越优；RMSE 对极端大偏差（异常离群误差）赋予更高惩罚权重。',
      desc: '竞赛论文对比多个预测模型（如普通回归 vs. ARIMA）时的必选硬核指标，附带均方误差 $\\text{MSE}=\\text{RMSE}^2$。',
      algos: [['linear', '一元线性回归'], ['multiple', '多元线性回归'], ['nonlinear', '非线性回归'], ['arima', '时间序列 ARIMA']],
    },
    {
      name: '平均相对误差 MRE / MAPE (%)',
      cat: '无量纲相对精度评估',
      color: '#0d9488',
      formula: '$$\\text{MAPE} = \\frac{100\\%}{n}\\sum_{i=1}^n \\left|\\frac{y_i - \\hat y_i}{y_i}\\right|$$',
      explain: '<b>公式解读：</b>把每次预测的绝对误差 $|y_i-\\hat y_i|$ 除以当时的真实基数 $|y_i|$ 化为百分比，再对所有样本求平均，直观反映“平均偏离真实值百分之几”。',
      std: '< 5% 精度极高；5% ~ 10% 精度优秀；10% ~ 20% 拟合合格；> 20% 需改进模型。',
      desc: '消除了原始数据绝对数量级的影响，能够直观向评委展示“预测值平均偏离真实值百分之几”。',
      algos: [['gm11', '灰色预测 GM(1,1)'], ['arima', '时间序列 ARIMA'], ['multiple', '多元线性回归'], ['nonlinear', '非线性回归']],
    },
    {
      name: '轮廓系数 Silhouette & 肘部法则 SSE',
      cat: '无监督聚类有效性检验',
      color: '#e11d48',
      formula: '$$s(i) = \\frac{b(i) - a(i)}{\\max\\{a(i), b(i)\\}} \\in [-1, 1],\\quad \\text{SSE}=\\sum_{k=1}^K\\sum_{x\\in C_k}\\|x-\\mu_k\\|^2$$',
      explain: '<b>公式解读：</b>$a(i)$ 是样本到同簇内部的平均距离（越小越抱团），$b(i)$ 是到最近外簇的平均距离（越大越分明）；$\\text{SSE}$ 则是所有点到各自簇中心 $\\mu_k$ 的距离平方总和。',
      std: '平均轮廓系数 > 0.5 表明簇内紧凑、簇间分离良好；结合 SSE 下降速率拐点科学确定最佳分类数 K。',
      desc: '在论文中回答“为什么分为 K 类”的黄金判据，避免主观拍脑袋定分类数。',
      algos: [['kmeans', 'K-Means++ 聚类分析']],
    },
    {
      name: '灰色后验差比 C & 级比检验 λ(k)',
      cat: '小样本灰色系统专用检验',
      color: '#7c3aed',
      formula: '$$C = \\frac{S_2}{S_1} = \\frac{\\text{残差标准差}}{\\text{原序列标准差}},\\quad \\lambda(k)=\\frac{x^{(0)}(k-1)}{x^{(0)}(k)}$$',
      explain: '<b>公式解读：</b>$\\lambda(k)$ 是相邻两期数据的比值（检验增速是否平稳）；后验差比 $C$ 用“预测残差的波动 $S_2$”除以“原数据的波动 $S_1$”，比值越小说明残差越收敛。',
      std: 'C ≤ 0.35 为一级（好）；0.35 < C ≤ 0.50 为二级（合格）；0.50 < C ≤ 0.65 为三级（勉强）。',
      desc: 'GM(1,1) 建模前后必做的双重检验：事前级比检验判断序列光滑度，事后后验差比检验模型外推可靠性。',
      algos: [['gm11', '灰色预测 GM(1,1)']],
    },
    {
      name: '一致性比率 CR & 赤池信息准则 AIC/BIC',
      cat: '主观赋权与时序定阶检验',
      color: '#0284c7',
      formula: '$$\\text{CR} = \\frac{\\lambda_{\\max}-n}{(n-1)\\text{RI}} < 0.10,\\quad \\text{AIC} = 2k + n\\ln(\\text{SSE}/n)$$',
      explain: '<b>公式解读：</b>$\\lambda_{\\max}-n$ 度量判断矩阵偏离完全一致的程度，除以随机指标 $\\text{RI}$ 后小于 $0.10$ 即无逻辑矛盾；$\\text{AIC}$ 则用参数个数惩罚项 $2k$ 加误差项，越小越防过拟合。',
      std: 'AHP 判断矩阵必须满足 CR < 0.10 方可通过一致性检验；ARIMA 定阶选取使 AIC / BIC 最小的 (p,d,q)。',
      desc: 'CR 保障专家两两打分不出现逻辑矛盾；AIC/BIC 在模型拟合优度与参数复杂度之间取得最优平衡。',
      algos: [['ahp', '层次分析法 AHP'], ['arima', '时间序列 ARIMA']],
    },
  ];

  const GUIDE_DATA = [
    ['多方案综合优劣排序', '有可量化指标，需结合主客观权重', 'topsis', 'TOPSIS / 熵权-TOPSIS'],
    ['确定指标权重（主观）', '缺少样本数据，依赖专家两两判断', 'ahp', '层次分析法 (AHP)'],
    ['确定指标权重（客观）', '有客观统计数据，按离散度赋权', 'entropy', '熵权法 (EWM)'],
    ['多准则定性/模糊边界评价', '含好/中/差等级评语与隶属度转换', 'fce', '模糊综合评价 (FCE)'],
    ['小样本因素关联度排序', '样本少、时间序列曲线几何比对', 'gra', '灰色关联分析 (GRA)'],
    ['高维多指标降维与消除共线性', '指标多(>5个)且高度相关', 'pca', '主成分分析 (PCA)'],
    ['无标签样本自动分群与画像', '需划分群组并论证最佳分类数 K', 'kmeans', 'K-Means++ 聚类分析'],
    ['两变量之间的线性关系', '散点图呈直线趋势', 'linear', '一元线性回归 (含误差检验)'],
    ['多因素定量解释与预测', '多个自变量、需 VIF 共线性与精度评估', 'multiple', '多元线性回归 (含MAE/RMSE)'],
    ['曲线趋势、饱和增长或峰值', '散点图呈指数 / S 形 Logistic / 多项式', 'nonlinear', '非线性回归 (含误差评估)'],
    ['小样本单调序列预测', '4~15 个数据，近似指数变化趋势', 'gm11', '灰色预测 GM(1,1)'],
    ['中长期平稳/非平稳时序预测', '较长历史时间序列、含自相关性', 'arima', '时间序列 ARIMA(p,d,q)'],
    ['资源受限下的最优分配/排产', '线性目标函数与线性不等式/等式约束', 'lp', '线性规划与单纯形法'],
    ['选址/指派/0-1背包与离散排产', '决策变量须为整数或 0-1 二元逻辑值', 'ilp', '整数规划 (分支定界/0-1规划)'],
    ['旅行商路径规划/复杂非线性寻优', 'NP-Hard 组合优化或多峰函数极值', 'sa_pso', '模拟退火智能优化 (SA)'],
    ['传染病/舆论扩散与生态种群演化', '连续时间变化率机理与相平面分析', 'ode_sir', '微分方程动力学 (RK4)'],
    ['高维积分/风险量化/不确定性仿真', '含随机扰动、排队或无解析解系统', 'monte_carlo', '蒙特卡洛模拟 (MC)'],
    ['离散状态转移与长期稳态份额预测', '具有无后效性的状态转移概率矩阵', 'markov', '马尔可夫链模型'],
  ];

  const COMBOS_DATA = [
    ['综合评价“王炸组合”', 'AHP + 熵权法 + TOPSIS', '主客观组合赋权兼顾专家经验与数据信息量，TOPSIS 测算理想解贴近度，国赛 C 题与美赛 E/F 题标配。', ['ahp', 'entropy', 'topsis']],
    ['高维分群与画像组合', 'PCA 主成分降维 + K-Means++ 聚类', '先用 PCA 消除多重共线性并浓缩至正交主成分，再配合肘部法则与轮廓系数完成科学分群（2022 国赛 B / 2023 美赛 C）。', ['pca', 'kmeans']],
    ['多视角组合预测范式', '多元线性回归 + ARIMA / GM(1,1)', '同时从“多维特征因果解释”与“时间序列自相关演化”双视角建模，通过 MAE、RMSE、MAPE 对比择优或加权融合（2025 美赛 C）。', ['multiple', 'arima', 'gm11']],
    ['数据驱动运筹鲁棒决策', '预测模型 + 线性/整数规划 + 蒙特卡洛模拟', '先预测未来销量/单产，再代入线性规划或 0-1 混合整数规划求最优排产方案，最后用蒙特卡洛模拟参数随机波动下的收益分布（2024 国赛 C / 2023 国赛 C）。', ['lp', 'ilp', 'sa_pso', 'monte_carlo']],
    ['连续机理与状态演化组合', '微分方程 RK4 (SEIR/LV) + 马尔可夫链', '宏观连续过程用常微分方程组 RK4 刻画轨迹与相平面平衡点，微观离散状态转移用马尔可夫链求解长期稳态概率（2024 美赛 A/C）。', ['ode_sir', 'markov']],
  ];

  /* =========================================================
     简洁首页：Hero + 专栏快捷卡片入口 + 17大算法矩阵
     ========================================================= */
  function cardHTML(a) {
    return `<a class="algo-card" href="#/${a.id}" style="--c1:${a.c[0]};--c2:${a.c[1]}">
      <div class="ac-top"><span class="ac-ico">${a.icon}</span><span class="ac-arrow">${ico('arrow')}</span></div>
      <h3>${a.name}</h3><div class="ac-en">${a.en}</div><p>${a.summary}</p>
      <div class="ac-tags">${a.tags.map(t => `<span>${t}</span>`).join('')}</div></a>`;
  }

  function renderHome(main) {
    main.dataset.id = '';
    main.style.removeProperty('--c1'); main.style.removeProperty('--c2');
    const totalSteps = ALGOS.reduce((s, a) => s + a.steps.length, 0);

    main.innerHTML = `
    <section class="hero fade-in">
      <div class="hero-content">
        <span class="hero-badge">✦ CUMCM & MCM/ICM MATHEMATICAL MODELING STUDIO</span>
        <h1>数学建模算法工坊</h1>
        <p>集成 <b>5 大类别 ${ALGOS.length} 项竞赛核心算法</b>，涵盖原理推导、分步公式、在线交互求解与 Python 代码；同时在左侧边栏提供<b>国赛 (CUMCM)</b>、<b>美赛 (MCM/ICM)</b>、<b>评审标准与检验指标</b>及<b>历年优秀论文库</b>专栏。</p>
        <div class="hero-actions">
          <a class="btn white" href="#/cumcm">🇨🇳 国赛指南 ${ico('arrow')}</a>
          <a class="btn glass" href="#/mcm">🇺🇸 美赛指南</a>
          <a class="btn glass" href="#/criteria">⚖️ 评审与检验指标</a>
          <a class="btn glass" href="#/papers">🏆 历年优秀论文</a>
        </div>
        <div class="hero-stats">
          <div><b>${ALGOS.length}</b><span>核心建模算法</span></div>
          <div><b>${totalSteps}</b><span>LaTeX 步骤推导</span></div>
          <div><b>A–F</b><span>国赛/美赛题型映射</span></div>
          <div><b>100%</b><span>浏览器本地计算</span></div>
        </div>
      </div>
      <div class="hero-formulas">
        <div class="fchip f1">$S_i=\\dfrac{D_i^-}{D_i^++D_i^-}$</div>
        <div class="fchip f2">$\\max\\ z=\\mathbf c^\\top\\mathbf x\\ (A\\mathbf x\\le\\mathbf b)$</div>
        <div class="fchip f3">$P(\\Delta E)=\\exp(-\\Delta E/T)$</div>
        <div class="fchip f4">$\\Phi(B)\\nabla^d X_t=\\Theta(B)\\varepsilon_t$</div>
        <div class="fchip f5">$\\dfrac{\\mathrm d\\mathbf y}{\\mathrm dt}=\\mathbf f(t,\\mathbf y)\\ [\\text{RK4}]$</div>
      </div>
    </section>

    <section class="cat-section">
      <div class="quick-portal-grid">
        <a class="portal-card" href="#/cumcm" style="--pc:#e11d48">
          <div class="pt-head"><span class="pt-flag">🇨🇳</span><span class="pt-arrow">${ico('arrow')}</span></div>
          <h3>国赛 (CUMCM) 赛题指南</h3>
          <p>A 题（连续机理）、B 题（离散运筹）、C 题（大数据决策）题型区别、高频算法映射及 <b>zhanwen/MathModel</b> 开源库。</p>
        </a>
        <a class="portal-card" href="#/mcm" style="--pc:#2563eb">
          <div class="pt-head"><span class="pt-flag">🇺🇸</span><span class="pt-arrow">${ico('arrow')}</span></div>
          <h3>美赛 (MCM/ICM) 赛题指南</h3>
          <p>MCM (A/B/C) 与 ICM (D/E/F) 六大题型详解、选题策略、O 奖高频算法映射及 <b>Juccy-12/MathModelHub</b> 资源库。</p>
        </a>
        <a class="portal-card" href="#/criteria" style="--pc:#d97706">
          <div class="pt-head"><span class="pt-flag">⚖️</span><span class="pt-arrow">${ico('arrow')}</span></div>
          <h3>评审标准与检验指标</h3>
          <p>国赛与美赛五大评审维度直观对比，以及 $R^2$、MAE、RMSE、MAPE、轮廓系数等核心检验指标速查。</p>
        </a>
        <a class="portal-card" href="#/papers" style="--pc:#7c3aed">
          <div class="pt-head"><span class="pt-flag">🏆</span><span class="pt-arrow">${ico('arrow')}</span></div>
          <h3>历年优秀论文精粹 (2021–2025)</h3>
          <p>精选 12 篇近年国赛一等奖与美赛 O 奖代表论文建模链路，一键跳转站内算法复现与 GitHub 源码。</p>
        </a>
      </div>
    </section>

    <div id="sec-algos">
      ${Object.entries(CATS).map(([k, c]) => `
      <section class="cat-section">
        <div class="section-head"><span class="section-kicker" style="color:${c.color}">${c.en}</span><h2>${c.name}</h2><p>${c.desc}</p></div>
        <div class="card-grid">${ALGOS.filter(a => a.cat === k).map(cardHTML).join('')}</div>
      </section>`).join('')}
    </div>`;

    renderMath(main);
  }

  /* =========================================================
     侧边栏竞赛专栏子页面渲染 (#/cumcm, #/mcm, #/criteria, #/papers, #/guide)
     ========================================================= */
  function renderCompPage(main, pageId) {
    main.dataset.id = pageId;
    const item = COMP_NAV.find(x => x.id === pageId) || COMP_NAV[0];
    main.style.setProperty('--c1', item.c[0]);
    main.style.setProperty('--c2', item.c[1]);

    const idx = COMP_NAV.indexOf(item);
    const prev = COMP_NAV[idx - 1], next = COMP_NAV[idx + 1];
    const pagerHTML = `<nav class="pager">${prev ? `<a href="#/${prev.id}" class="pg prev"><small>← 上一专栏</small><b>${prev.name}</b></a>` : `<a href="#/" class="pg prev"><small>← 返回</small><b>首页总览</b></a>`}${next ? `<a href="#/${next.id}" class="pg next"><small>下一专栏 →</small><b>${next.name}</b></a>` : `<a href="#/topsis" class="pg next"><small>浏览算法工坊 →</small><b>TOPSIS 法</b></a>`}</nav>`;

    if (pageId === 'cumcm') {
      main.innerHTML = `<div class="algo-page fade-in">
        <nav class="crumbs"><a href="#/">首页</a><span>/</span><span>竞赛与备赛专栏</span><span>/</span><b>${item.name}</b></nav>
        <div class="comp-overview-card cumcm" style="margin-bottom:24px">
          <div class="coc-header">
            <span class="coc-flag">🇨🇳</span>
            <div>
              <div class="coc-tag">中国工业与应用数学学会 (CSIAM) 主办 · 每年 9 月上旬（3 天 72 小时）</div>
              <h3>全国大学生数学建模竞赛 (CUMCM)</h3>
            </div>
          </div>
          <p class="coc-desc">国内规模最大、认可度最高的基础学科竞赛（3 人组队，中文撰写）。竞赛设 <b>A 题（连续物理与工程优化）、B 题（离散运筹与工业决策）、C 题（大数据挖掘与经济决策）</b> 三道赛题。国赛极度看重<b>数学推导的严密性、问题转化求解的准确度以及最终数值结果的精确性</b>（通常设有标准参考答案区间或靶向评分点）。</p>
          <div class="coc-meta">
            <div><span>赛题结构</span><b>A 题(连续机理) · B 题(离散运筹) · C 题(大数据决策)</b></div>
            <div><span>核心考察</span><b>精确建模推导 + 编程算出具体数值答案</b></div>
            <div><span>获奖比例</span><b>国一 ~0.55% · 国二 ~2.2% · 各省一/二/三等奖</b></div>
          </div>
          <div class="coc-repo-bar">
            <div>
              <div class="crb-title">📦 国赛开源资源库：<b>zhanwen/MathModel</b></div>
              <div class="crb-sub">收录历年国赛真题、国家一等奖优秀论文集、LaTeX 模板及《数学建模应掌握的十类算法》</div>
            </div>
            <a class="btn primary sm" href="https://github.com/zhanwen/MathModel" target="_blank" rel="noopener noreferrer">访问国赛 GitHub 仓库 ↗</a>
          </div>
        </div>

        <section class="cat-section" style="margin-top:0">
          <div class="section-head">
            <span class="section-kicker" style="color:#e11d48">CUMCM PROBLEM TYPES (A / B / C) & ALGORITHMS</span>
            <h2>国赛 A、B、C 三大题型区别与对应核心算法映射</h2>
            <p>剖析国赛 A、B、C 三题的命题规律、学科背景，点击算法标签可直接打开站内在线求解器。</p>
          </div>
          <div class="prob-grid mcm-grid">
            ${CUMCM_PROBLEMS.map(p => `
            <div class="prob-card" style="--pc:${p.color}">
              <div class="pc-head">
                <span class="pc-badge">${p.code}</span>
                <span class="pc-group">${p.group}</span>
              </div>
              <div class="pc-row"><b>典型背景：</b>${p.bg}</div>
              <div class="pc-row"><b>命题特点：</b>${p.feature}</div>
              <div class="pc-row pc-ex"><b>近年真题：</b>${p.examples}</div>
              <div class="pc-algos">
                <span class="pca-label">对应高频算法（点击在线求解）：</span>
                <div class="pca-chips">${p.algos.map(([id, nm]) => algoLink(id, nm)).join('')}</div>
              </div>
            </div>`).join('')}
          </div>
        </section>

        <section class="cat-section">
          <div class="section-head">
            <span class="section-kicker" style="color:#be123c">CUMCM OUTSTANDING PAPERS</span>
            <h2>国赛近年代表赛题与一等奖论文建模解析</h2>
            <p>更多完整论文 PDF 与源码请前往 <a href="https://github.com/zhanwen/MathModel" target="_blank" rel="noopener noreferrer"><b>zhanwen/MathModel</b></a> 或切换至 <a href="#/papers"><b>历年优秀论文精粹</b></a>。</p>
          </div>
          <div class="paper-grid">
            ${PAPERS_DATA.filter(p => p.comp === 'cumcm').map(p => `
            <article class="paper-card">
              <div class="pp-top"><span class="pp-year cumcm">🇨🇳 ${p.year}</span><span class="pp-award">${p.award}</span></div>
              <h3 class="pp-title">${p.title}</h3>
              <p class="pp-summary">${p.summary}</p>
              <div class="pp-algos"><span class="ppa-lbl">论文核心建模算法：</span><div class="pca-chips">${p.algos.map(([id, nm]) => algoLink(id, nm)).join('')}</div></div>
              <div class="pp-foot"><a class="pp-repo-link" href="${p.repoUrl}" target="_blank" rel="noopener noreferrer">${ico('book')} 查看优秀论文与源码库：<b>${p.repoName}</b> ↗</a></div>
            </article>`).join('')}
          </div>
        </section>
        ${pagerHTML}
      </div>`;
      renderMath(main);
      return;
    }

    if (pageId === 'mcm') {
      main.innerHTML = `<div class="algo-page fade-in">
        <nav class="crumbs"><a href="#/">首页</a><span>/</span><span>竞赛与备赛专栏</span><span>/</span><b>${item.name}</b></nav>
        <div class="comp-overview-card mcm" style="margin-bottom:24px">
          <div class="coc-header">
            <span class="coc-flag">🇺🇸</span>
            <div>
              <div class="coc-tag">美国数学及其应用联合会 (COMAP) 主办 · 每年 1–2 月（4 天 96 小时）</div>
              <h3>美国大学生数学建模竞赛 (MCM / ICM)</h3>
            </div>
          </div>
          <p class="coc-desc">全球最具影响力的国际性数模赛事（3 人组队，全英文撰写，1 页 Summary 摘要页极为关键）。分为 <b>MCM（数学建模竞赛：A 连续、B 离散、C 大数据洞察）</b>与 <b>ICM（交叉学科竞赛：D 运筹网络、E 环境可持续、F 公共政策）</b>。美赛强调<b>建模逻辑自洽、创新视角、灵敏度检验、精美数据可视化与政策建议信（Memo）</b>。</p>
          <div class="coc-meta">
            <div><span>赛题结构</span><b>MCM (A/B/C) + ICM (D/E/F) 共 6 题</b></div>
            <div><span>核心考察</span><b>摘要质量 + 逻辑自洽 + 灵敏度与可视化</b></div>
            <div><span>获奖等级</span><b>O奖 (&lt;1%) · F奖 (~2%) · M奖 (~7%) · H奖 (~18%)</b></div>
          </div>
          <div class="coc-repo-bar">
            <div>
              <div class="crb-title">📦 美赛开源资源库：<b>Juccy-12/MathModelHub</b></div>
              <div class="crb-sub">收录 2021–2025 美赛 O 奖优秀论文（中英双语版）、美赛高频算法手册、2025C 完整代码与 mcmthesis 模板</div>
            </div>
            <a class="btn primary sm" href="https://github.com/Juccy-12/MathModelHub" target="_blank" rel="noopener noreferrer">访问美赛 GitHub 仓库 ↗</a>
          </div>
        </div>

        <section class="cat-section" style="margin-top:0">
          <div class="section-head">
            <span class="section-kicker" style="color:#0284c7">MCM / ICM PROBLEM TYPES (A–F) & ALGORITHMS</span>
            <h2>美赛六大赛题 (A–F) 区别与 O 奖高频算法映射</h2>
            <p>涵盖 MCM（A 连续 / B 离散 / C 大数据）与 ICM（D 运筹网络 / E 可持续 / F 政策）选题策略与对应算法工具。</p>
          </div>
          <div class="prob-grid mcm-grid">
            ${MCM_PROBLEMS.map(p => `
            <div class="prob-card" style="--pc:${p.color}">
              <div class="pc-head">
                <span class="pc-badge">${p.code}</span>
                <span class="pc-rate">${p.rate}</span>
              </div>
              <h4 class="pc-subtitle">${p.type}</h4>
              <p class="pc-desc">${p.desc}</p>
              <div class="pc-row pc-ex"><b>近年真题：</b>${p.examples}</div>
              <div class="pc-algos">
                <span class="pca-label">O 奖高频算法（点击在线求解）：</span>
                <div class="pca-chips">${p.algos.map(([id, nm]) => algoLink(id, nm)).join('')}</div>
              </div>
            </div>`).join('')}
          </div>
        </section>

        <section class="cat-section">
          <div class="section-head">
            <span class="section-kicker" style="color:#1d4ed8">MCM / ICM OUTSTANDING PAPERS</span>
            <h2>美赛近年代表赛题与 O 奖论文建模解析</h2>
            <p>更多双语 O 奖论文 PDF 与复现代码请前往 <a href="https://github.com/Juccy-12/MathModelHub" target="_blank" rel="noopener noreferrer"><b>Juccy-12/MathModelHub</b></a> 或切换至 <a href="#/papers"><b>历年优秀论文精粹</b></a>。</p>
          </div>
          <div class="paper-grid">
            ${PAPERS_DATA.filter(p => p.comp === 'mcm').map(p => `
            <article class="paper-card">
              <div class="pp-top"><span class="pp-year mcm">🇺🇸 ${p.year}</span><span class="pp-award">${p.award}</span></div>
              <h3 class="pp-title">${p.title}</h3>
              <p class="pp-summary">${p.summary}</p>
              <div class="pp-algos"><span class="ppa-lbl">论文核心建模算法：</span><div class="pca-chips">${p.algos.map(([id, nm]) => algoLink(id, nm)).join('')}</div></div>
              <div class="pp-foot"><a class="pp-repo-link" href="${p.repoUrl}" target="_blank" rel="noopener noreferrer">${ico('book')} 查看优秀论文与源码库：<b>${p.repoName}</b> ↗</a></div>
            </article>`).join('')}
          </div>
        </section>
        ${pagerHTML}
      </div>`;
      renderMath(main);
      return;
    }

    if (pageId === 'criteria') {
      main.innerHTML = `<div class="algo-page fade-in">
        <nav class="crumbs"><a href="#/">首页</a><span>/</span><span>竞赛与备赛专栏</span><span>/</span><b>${item.name}</b></nav>

        <section class="cat-section" style="margin-top:0">
          <div class="section-head">
            <span class="section-kicker" style="color:#d97706">JUDGING CRITERIA COMPARISON</span>
            <h2>⚖️ 国赛 (CUMCM) vs. 美赛 (MCM/ICM) 五大评审维度对比</h2>
            <p>采用自适应对比卡片布局（无横向滚动条），直观拆解中、美两大赛事在阅卷评分标准上的本质差异与备赛应对策略。</p>
          </div>

          <div class="vs-card-list">
            ${CRITERIA_VS.map(item => `
            <div class="vs-card">
              <div class="vs-head">
                <h4>${item.dim}</h4>
                <span class="vs-tip">💡 备赛策略：${item.tip}</span>
              </div>
              <div class="vs-body">
                <div class="vs-col cumcm">
                  <div class="vs-tag">🇨🇳 国赛 (CUMCM) 评审标准</div>
                  <p>${item.cumcm}</p>
                </div>
                <div class="vs-col mcm">
                  <div class="vs-tag">🇺🇸 美赛 (MCM / ICM) 评审标准</div>
                  <p>${item.mcm}</p>
                </div>
              </div>
            </div>`).join('')}
          </div>
        </section>

        <section class="cat-section">
          <div class="section-head">
            <span class="section-kicker" style="color:#2563eb">MODEL ACCURACY & VALIDATION METRICS</span>
            <h2>📐 数学建模核心精度与有效性检验指标速查</h2>
            <p>优秀的建模论文必须“用定量指标证明模型可靠”。以下为国赛与美赛最高频的 6 大类误差与有效性检验指标：</p>
          </div>

          <div class="metric-spec-grid">
            ${METRIC_SPECS.map(m => `
            <div class="ms-card" style="--mc:${m.color}">
              <div class="ms-top">
                <span class="ms-cat">${m.cat}</span>
                <h3>${m.name}</h3>
              </div>
              <div class="ms-formula">${m.formula}</div>
              ${m.explain ? `<div class="formula-explain">${m.explain}</div>` : ''}
              <div class="ms-std"><b>评判标准：</b>${m.std}</div>
              <p class="ms-desc">${m.desc}</p>
              <div class="pc-algos">
                <span class="pca-label">已集成该指标的站内算法（点击直接使用）：</span>
                <div class="pca-chips">${m.algos.map(([id, nm]) => algoLink(id, nm)).join('')}</div>
              </div>
            </div>`).join('')}
          </div>
        </section>
        ${pagerHTML}
      </div>`;
      renderMath(main);
      return;
    }

    if (pageId === 'papers') {
      main.innerHTML = `<div class="algo-page fade-in">
        <nav class="crumbs"><a href="#/">首页</a><span>/</span><span>竞赛与备赛专栏</span><span>/</span><b>${item.name}</b></nav>
        <section class="cat-section" style="margin-top:0">
          <div class="section-head">
            <span class="section-kicker" style="color:#7c3aed">OUTSTANDING PAPERS & GITHUB REPOSITORIES</span>
            <h2>🏆 历年特定年份与赛题优秀论文精粹（2021–2025）</h2>
            <p>联动国赛开源库 <a href="https://github.com/zhanwen/MathModel" target="_blank" rel="noopener noreferrer"><b>zhanwen/MathModel</b></a> 与美赛 O 奖双语库 <a href="https://github.com/Juccy-12/MathModelHub" target="_blank" rel="noopener noreferrer"><b>Juccy-12/MathModelHub</b></a>，拆解近年典型真题的核心建模链路，点击算法标签即可在站内交互复现。</p>
          </div>

          <div class="paper-filter-bar" id="paperFilter">
            <button class="pf-btn on" data-f="all">全部精选赛题与论文 (${PAPERS_DATA.length})</button>
            <button class="pf-btn" data-f="cumcm">🇨🇳 国赛 CUMCM 优秀论文 (${PAPERS_DATA.filter(x => x.comp === 'cumcm').length})</button>
            <button class="pf-btn" data-f="mcm">🇺🇸 美赛 MCM/ICM O奖优秀论文 (${PAPERS_DATA.filter(x => x.comp === 'mcm').length})</button>
          </div>

          <div class="paper-grid" id="paperGrid">
            ${PAPERS_DATA.map(p => `
            <article class="paper-card fade-in" data-comp="${p.comp}">
              <div class="pp-top">
                <span class="pp-year ${p.comp}">${p.comp === 'cumcm' ? '🇨🇳 ' : '🇺🇸 '}${p.year}</span>
                <span class="pp-award">${p.award}</span>
              </div>
              <h3 class="pp-title">${p.title}</h3>
              <p class="pp-summary">${p.summary}</p>
              <div class="pp-algos">
                <span class="ppa-lbl">论文核心建模算法：</span>
                <div class="pca-chips">${p.algos.map(([id, nm]) => algoLink(id, nm)).join('')}</div>
              </div>
              <div class="pp-foot">
                <a class="pp-repo-link" href="${p.repoUrl}" target="_blank" rel="noopener noreferrer">
                  ${ico('book')} 查看优秀论文与源码库：<b>${p.repoName}</b> ↗
                </a>
              </div>
            </article>`).join('')}
          </div>
        </section>
        ${pagerHTML}
      </div>`;

      const pfBar = $('#paperFilter', main);
      if (pfBar) {
        pfBar.addEventListener('click', e => {
          const b = e.target.closest('.pf-btn');
          if (!b) return;
          $$('.pf-btn', pfBar).forEach(x => x.classList.toggle('on', x === b));
          const f = b.dataset.f;
          $$('.paper-card', $('#paperGrid', main)).forEach(card => {
            card.hidden = f !== 'all' && card.dataset.comp !== f;
          });
        });
      }
      renderMath(main);
      return;
    }

    // pageId === 'guide'
    main.innerHTML = `<div class="algo-page fade-in">
      <nav class="crumbs"><a href="#/">首页</a><span>/</span><span>竞赛与备赛专栏</span><span>/</span><b>${item.name}</b></nav>
      <section class="cat-section" style="margin-top:0">
        <div class="section-head">
          <span class="section-kicker" style="color:#0d9488">MODEL COMBINATIONS & SELECTION GUIDE</span>
          <h2>🧭 竞赛“王炸组合”与算法选型速查指南</h2>
          <p>单一模型往往难以支撑国一或美赛 O 奖论文，掌握多模型串联组合与精准选型是冲击高奖的核心秘诀。</p>
        </div>

        <div class="card" style="margin-bottom:20px">
          <h3 class="card-h"><span class="ib">${ico('bulb')}</span>国赛与美赛五大高频“王炸组合”建模范式</h3>
          <div class="combo-card-list">
            ${COMBOS_DATA.map(c => `
            <div class="combo-item">
              <div class="ci-head">
                <span class="ci-scene">${c[0]}</span>
                <span class="ci-Title">${c[1]}</span>
              </div>
              <p class="ci-desc">${c[2]}</p>
              <div class="pca-chips">${c[3].map(id => algoLink(id)).join('')}</div>
            </div>`).join('')}
          </div>
        </div>

        <div class="guide-grid">
          <div class="card"><h3 class="card-h"><span class="ib">${ico('compass')}</span>问题 → 算法速查表（17 大模型全覆盖）</h3>
            ${rawTable(['你的问题', '数据与约束特征', '推荐算法'], GUIDE_DATA.map(g => [g[0], g[1], `<a href="#/${g[2]}"><b>${g[3]} →</b></a>`])).replace('<table>', '<table class="guide-table wrap-table">')}
          </div>
          <div class="card"><h3 class="card-h"><span class="ib">${ico('flow')}</span>数学建模获奖论文通用七步法</h3>
            <div class="flow-v">
              ${[
                ['问题重述与拆解', '提炼赛题背景，绘制全篇“总体建模技术路线流程图 (Mindmap/Flowchart)”'],
                ['合理假设与符号说明', '简化次要矛盾，用规范三线表集中定义全文核心数学符号与量纲'],
                ['数据预处理与探索分析', '缺失插补、3σ/箱线图异常值清洗、Z-Score 标准化或正向化，绘制特征分布图'],
                ['递进式模型建立', '由浅入深建立主模型或主客观组合模型，清晰展示推导公式与约束条件'],
                ['算法设计与数值求解', '调用单纯形、RK4、模拟退火、最小二乘等算法求解，输出精确数值与可视化图表'],
                ['精度检验与灵敏度分析', '计算 MAE / RMSE / MAPE / 轮廓系数 / 一致性 CR，微调关键参数验证结论稳健性'],
                ['模型评价与政策建议信', '客观总结模型优缺点与推广前景，美赛常附 1~2 页给管理层的 Policy Memo'],
              ].map((s, i) => `<div class="fv"><b>${i + 1}</b><div>${s[0]}<small>${s[1]}</small></div></div>`).join('')}
            </div>
          </div>
        </div>
      </section>
      ${pagerHTML}
    </div>`;
    renderMath(main);
  }

  /* =========================================================
     算法详情页
     ========================================================= */
  function renderAlgo(main, a, tab) {
    curAlgo = a;
    const fresh = main.dataset.id !== a.id;
    if (fresh) {
      const idx = ALGOS.indexOf(a), prev = ALGOS[idx - 1], next = ALGOS[idx + 1];
      const parentAlgo = a.parent ? ALGOS.find(x => x.id === a.parent) : null;
      const rootParent = parentAlgo || (ALGOS.some(x => x.parent === a.id) ? a : null);
      const family = rootParent ? [rootParent, ...ALGOS.filter(x => x.parent === rootParent.id)] : [];
      const subBarHTML = family.length > 1 ? `
        <div class="subcat-bar fade-in">
          <span class="subcat-label">📂 线性规划体系切换：</span>
          ${family.map((f, fi) => `<a class="subcat-pill ${f.id === a.id ? 'active' : ''}" href="#/${f.id}">${fi === 0 ? '🔹 主分类：' : '🔸 子分类：'}${f.name}</a>`).join('')}
        </div>` : '';
      main.dataset.id = a.id;
      main.style.setProperty('--c1', a.c[0]); main.style.setProperty('--c2', a.c[1]);
      main.innerHTML = `<div class="algo-page">
        <nav class="crumbs"><a href="#/">首页</a><span>/</span><span>${CATS[a.cat].name}</span>${parentAlgo ? `<span>/</span><a href="#/${parentAlgo.id}">${parentAlgo.name}</a>` : ''}<span>/</span><b>${a.name}</b></nav>
        ${subBarHTML}
        <header class="algo-hero fade-in">
          <div class="ah-ico">${a.icon}</div>
          <div class="ah-text"><div class="ah-cat">${parentAlgo ? `${CATS[a.cat].name} · ${parentAlgo.short} 子分类` : CATS[a.cat].name.toUpperCase()}</div><h1>${a.name}</h1><div class="ah-en">${a.en}</div><p>${a.summary}</p>
            <div class="ah-tags">${a.tags.map(t => `<span>${t}</span>`).join('')}</div></div>
          <div class="ah-formula">${a.keyFormula}</div>
        </header>
        <div class="tabs-wrap"><div class="tabs">${TABS.map(t => `<a class="tab" data-tab="${t.k}" href="#/${a.id}/${t.k}">${ico(t.i)}${t.n}</a>`).join('')}</div></div>
        <section id="panel" class="panel-area"></section>
        <nav class="pager">${prev ? `<a href="#/${prev.id}" class="pg prev"><small>← 上一个算法</small><b>${prev.name}</b></a>` : '<span></span>'}${next ? `<a href="#/${next.id}" class="pg next"><small>下一个算法 →</small><b>${next.name}</b></a>` : '<span></span>'}</nav>
      </div>`;
      renderMath($('.algo-hero', main));
    } else {
      const tw = $('.tabs-wrap', main);
      const top = tw.getBoundingClientRect().top + window.scrollY - 70;
      if (window.scrollY > top) window.scrollTo({ top, behavior: 'smooth' });
    }
    if (!TABS.find(t => t.k === tab)) tab = 'overview';
    $$('.tab', main).forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
    const panel = $('#panel');
    panel.classList.remove('fade-in'); void panel.offsetWidth; panel.classList.add('fade-in');
    ({ overview: renderOverview, steps: renderSteps, calc: renderCalc, code: renderCode })[tab](panel, a);
  }

  function diagramBoxHTML(algoId) {
    const dg = window.ALGO_DIAGRAMS && window.ALGO_DIAGRAMS[algoId];
    if (!dg) return '';
    return `<div class="diagram-card" data-dg-id="${algoId}">
      <div class="dg-title"><span>${dg.title}</span><span class="dg-export-btns"><button type="button" class="ce-btn" data-dg-svg="${algoId}" title="导出原理图 SVG 矢量文件">📐 SVG</button><button type="button" class="ce-btn" data-dg-pdf="${algoId}" title="导出原理图 PDF 矢量文件">📄 PDF</button></span></div>
      <div class="dg-canvas">${dg.svg}</div>
      <div class="dg-caption">${dg.caption}</div>
    </div>`;
  }

  /* 6 大核心维度（4 字精简标签，杜绝雷达图文字拥挤）与 18 大算法性能画像 */
  const ALGO_RADAR_DIMS = ['小样本适应', '非线性能力', '客观抗噪性', '计算轻量度', '结论可解释', '全局与外推'];
  const ALGO_RADAR_PROFILES = {
    // 评价与决策类 (eval)
    topsis:  { scores: [82, 68, 86, 94, 92, 85], pro: '正负理想解双基准几何测距，排序分辨率高', con: '需外部赋权（常配熵权法），受极端离群点影响' },
    ahp:     { scores: [96, 58, 52, 92, 95, 76], pro: '无需客观样本数据，定性经验定量化且含一致性检验', con: '主观性强，指标超 9 个时判断矩阵易不一致' },
    entropy: { scores: [65, 62, 96, 95, 86, 78], pro: '100% 数据驱动客观赋权，自动识别高区分度指标', con: '依赖样本离散度，忽略指标业务重要性层级' },
    fce:     { scores: [88, 80, 68, 85, 88, 74], pro: '隶属函数刻画软边界，擅长定性分级综合评判', con: '隶属度函数与权重设定具有一定主观性' },
    gra:     { scores: [98, 82, 84, 94, 89, 80], pro: '4 个以上小样本即可建模，幾何波形趋势比对灵敏', con: '分辨系数 ρ 常凭经验取 0.5，主要给出相对关联序' },
    // 预测与回归类 (pred)
    linear:    { scores: [86, 25, 76, 98, 98, 84], pro: '解析闭式解、t/F 统计检验与置信区间体系最完备', con: '仅限线性关系，对高杠杆异常点较敏感' },
    multiple:  { scores: [74, 42, 78, 92, 94, 82], pro: '可量化多因素独立边际贡献，支持 VIF 共线性诊断', con: '样本量需大于变量数，强共线性下估计方差膨胀' },
    nonlinear: { scores: [76, 96, 74, 80, 88, 90], pro: '内置 Logistic 等机理饱和曲线，中长期外推合理', con: '需先验设定函数形式，对数变换易放大零值附近误差' },
    gm11:      { scores: [98, 75, 78, 94, 86, 68], pro: '仅需 4~10 期贫信息小样本，累加生成自动平滑随机噪声', con: '仅适合指数单调序列，长期外推易发散且怕剧烈波动' },
    arima:     { scores: [52, 66, 88, 78, 85, 92], pro: '充分挖掘自相关动态记忆，提供严格预测置信扇形带', con: '要求序列平稳或差分平稳，样本量一般需 ≥ 20 期' },
    // 优化与规划类 (opt)
    lp:     { scores: [90, 22, 85, 95, 96, 98], pro: '单纯形法保证全局极值，自带松弛变量与瓶颈资源诊断', con: '目标与约束必须全线性，决策变量允许连续可分' },
    ilp:    { scores: [86, 55, 86, 74, 94, 96], pro: '支持 0-1 选址指派与整数不可分约束，避免四舍五入越界', con: '属 NP-Hard 问题，超大规模变量下分支定界搜索耗时' },
    sa_pso: { scores: [88, 98, 84, 72, 75, 92], pro: '不依赖梯度与凸性，Metropolis 准则有效跳出局部极小', con: '随机启发式不保证每次必达理论最优，需调参降温率' },
    // 分类与降维类 (cls)
    pca:    { scores: [75, 38, 86, 92, 80, 84], pro: '正交变换彻底消除多重共线性，按方差贡献率客观降维', con: '仅捕捉线性相关性，综合主成分物理含义需载荷矩阵辅助解释' },
    kmeans: { scores: [78, 60, 72, 94, 90, 80], pro: '迭代复杂度 O(nKT) 极快，簇中心与轮廓系数直观清晰', con: '需预先指定簇数 K，对非凸形状簇与离群噪点敏感' },
    // 机理与随机模拟类 (sim)
    ode_sir:     { scores: [92, 94, 82, 86, 96, 95], pro: '微分方程深刻揭示系统演化物理机理、再生数阈值与相轨线', con: '依赖机理假设与参数率定，复杂高维系统无解析解' },
    monte_carlo: { scores: [90, 98, 90, 68, 84, 88], pro: '收敛率 O(N⁻¹/²) 与空间维数无关，擅长高维积分与风险模拟', con: '结果带随机抽样方差，高精度需十万级抽样计算' },
    markov:      { scores: [84, 65, 86, 94, 92, 90], pro: '转移矩阵清晰刻画状态跃迁，可精确求解长期极限稳态分布', con: '要求无后效性（齐次马氏性）假设，转移概率需保持平稳' },
  };
  const RADAR_PALETTE = ['#4f46e5', '#0d9488', '#e11d48', '#d97706', '#7c3aed', '#0284c7'];

  function renderOverview(p, a) {
    const peerAlgos = ALGOS.filter(x => x.cat === a.cat);
    const defaultChecked = new Set([a.id]);
    if (peerAlgos.length > 1) {
      const second = peerAlgos.find(x => x.id !== a.id);
      if (second) defaultChecked.add(second.id);
    }
    p.innerHTML = `
    <div class="ov-grid">
      <div class="card span-2"><h3 class="card-h"><span class="ib">${ico('bulb')}</span>核心思想与几何直观</h3><div class="prose">${a.idea}</div>${diagramBoxHTML(a.id)}</div>
      <div class="card"><h3 class="card-h"><span class="ib">${ico('target')}</span>适用场景</h3><ul class="list check">${a.scenes.map(s => `<li>${s}</li>`).join('')}</ul></div>
      <div class="card"><h3 class="card-h"><span class="ib">${ico('db')}</span>数据要求</h3><div class="prose">${a.data}</div></div>
      <div class="card span-2 radar-cmp-card">
        <div class="radar-cmp-head">
          <div>
            <h3 class="card-h" style="margin-bottom:4px"><span class="ib">${ico('compass')}</span>同类算法六维能力雷达图对比（${CATS[a.cat].name}）</h3>
            <p class="hint" style="margin:0">勾选下方同类算法即可叠加至同一雷达图，直观对比各模型优劣边界（标签精简无遮挡，支持导出 SVG / PDF 矢量图）。</p>
          </div>
          <div class="radar-quick-btns">
            <button type="button" class="btn ghost sm" id="rd_all">全选同类</button>
            <button type="button" class="btn ghost sm" id="rd_only">仅看当前</button>
          </div>
        </div>
        <div class="radar-cmp-body">
          <div class="radar-canvas-col">
            ${chartBox('ch_ov_radar', 320)}
          </div>
          <div class="radar-ctrl-col">
            <div class="radar-check-title">勾选要对比的「${CATS[a.cat].name}」算法：</div>
            <div class="radar-check-list" id="rd_checks">
              ${peerAlgos.map((pa, idx) => {
                const col = RADAR_PALETTE[idx % RADAR_PALETTE.length];
                const isCur = pa.id === a.id;
                const checked = defaultChecked.has(pa.id) ? 'checked' : '';
                return `<label class="radar-chk-pill ${checked ? 'on' : ''}" style="--rc:${col}">
                  <input type="checkbox" value="${pa.id}" data-idx="${idx}" ${checked}>
                  <span class="rc-dot" style="background:${col}"></span>
                  <span class="rc-name">${esc(pa.short || pa.name)}${isCur ? ' <small>(当前)</small>' : ''}</span>
                </label>`;
              }).join('')}
            </div>
            <div class="radar-summary-box" id="rd_summary"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="callout tip"><b>💡 建模提示</b><div>${a.tips}</div></div>
    <div class="cta-row"><a class="btn primary" href="#/${a.id}/steps">查看建模步骤 ${ico('arrow')}</a><a class="btn ghost" href="#/${a.id}/calc">${ico('calc')}直接在线求解</a></div>`;

    const updateRadarComparison = () => {
      const boxes = $$('#rd_checks input[type="checkbox"]', p);
      let activeIds = boxes.filter(b => b.checked).map(b => b.value);
      if (!activeIds.length) {
        const curBox = boxes.find(b => b.value === a.id) || boxes[0];
        if (curBox) { curBox.checked = true; activeIds = [curBox.value]; }
      }
      boxes.forEach(b => b.closest('.radar-chk-pill').classList.toggle('on', b.checked));

      const datasets = activeIds.map(id => {
        const idx = peerAlgos.findIndex(x => x.id === id);
        const pa = peerAlgos[idx] || a;
        const col = RADAR_PALETTE[Math.max(0, idx) % RADAR_PALETTE.length];
        const prof = ALGO_RADAR_PROFILES[id] || { scores: [80, 80, 80, 80, 80, 80] };
        return {
          label: pa.short || pa.name,
          data: prof.scores,
          borderColor: col,
          backgroundColor: alpha(col, activeIds.length > 2 ? 0.10 : 0.16),
          borderWidth: id === a.id ? 2.6 : 2,
          pointBackgroundColor: '#fff',
          pointBorderColor: col,
          pointBorderWidth: 2,
          pointRadius: id === a.id ? 4 : 3,
        };
      });

      mkChart('ch_ov_radar', {
        type: 'radar',
        data: { labels: ALGO_RADAR_DIMS, datasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          layout: { padding: { top: 8, bottom: 8, left: 14, right: 14 } },
          plugins: {
            legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, padding: 14, font: { size: 12 } } },
          },
          scales: {
            r: {
              min: 0,
              max: 100,
              beginAtZero: true,
              ticks: { display: false, stepSize: 20 },
              grid: { color: '#e2e8f0' },
              angleLines: { color: '#e2e8f0' },
              pointLabels: {
                font: { size: 12.5, weight: '700' },
                color: '#1e293b',
                padding: 12,
              },
            },
          },
        },
      });

      const sumEl = $('#rd_summary', p);
      if (sumEl) {
        sumEl.innerHTML = activeIds.map(id => {
          const idx = peerAlgos.findIndex(x => x.id === id);
          const pa = peerAlgos[idx] || a;
          const col = RADAR_PALETTE[Math.max(0, idx) % RADAR_PALETTE.length];
          const prof = ALGO_RADAR_PROFILES[id] || { pro: (pa.pros && pa.pros[0]) || '', con: (pa.cons && pa.cons[0]) || '' };
          return `<div class="radar-sum-item" style="--rc:${col}">
            <div class="rsi-head"><span class="rc-dot" style="background:${col}"></span><b>${esc(pa.short || pa.name)}</b></div>
            <div class="rsi-tags">
              <span class="rsi-pro"><b>优势：</b>${esc(prof.pro)}</span>
              <span class="rsi-con"><b>局限：</b>${esc(prof.con)}</span>
            </div>
          </div>`;
        }).join('');
      }
    };

    $('#rd_checks', p).addEventListener('change', updateRadarComparison);
    $('#rd_all', p).onclick = () => {
      $$('#rd_checks input[type="checkbox"]', p).forEach(b => (b.checked = true));
      updateRadarComparison();
    };
    $('#rd_only', p).onclick = () => {
      $$('#rd_checks input[type="checkbox"]', p).forEach(b => (b.checked = b.value === a.id));
      updateRadarComparison();
    };
    updateRadarComparison();
    renderMath(p);
  }

  function renderSteps(p, a) {
    const stepDgs = window.STEP_DIAGRAMS || {};
    p.innerHTML = `
    <div class="card"><h3 class="card-h"><span class="ib">${ico('flow')}</span>建模流程总览与坐标系图解 <small style="font-weight:400;color:var(--muted);font-size:13px">共 ${a.steps.length} 步，点击步骤标签可快速定位</small></h3>
      <div class="flow">${a.steps.map((s, i) => `<button class="flow-chip" data-go="${i}"><b>${i + 1}</b>${s.t}</button>`).join('<span class="flow-arrow">→</span>')}</div>
      ${diagramBoxHTML(a.id)}
    </div>
    <div class="steps">${a.steps.map((s, i) => `
      <div class="step" id="step-${i}"><div class="step-num">${i + 1}</div>
        <div class="step-body"><h3>${s.t}</h3><div class="prose">${s.d}</div>${s.f ? `<div class="formula">${s.f}</div>` : ''}${s.n ? `<div class="step-note">${s.n}</div>` : ''}${stepDgs[`${a.id}:${i}`] || ''}</div>
      </div>`).join('')}
    </div>
    <div class="cta-row"><a class="btn primary" href="#/${a.id}/calc">${ico('calc')}理解了，去在线求解</a><a class="btn ghost" href="#/${a.id}/code">${ico('code')}查看 Python 代码</a></div>`;
    $$('.flow-chip', p).forEach(b => (b.onclick = () => $('#step-' + b.dataset.go).scrollIntoView({ behavior: 'smooth', block: 'start' })));
    renderMath(p);
  }

  function hlPython(code) {
    const e = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const re = /(#.*$)|((?:f)?'[^'\n]*'|(?:f)?"[^"\n]*")|\b(def|return|import|from|as|for|in|if|else|elif|while|and|or|not|None|True|False|lambda|with|class)\b|\b([A-Za-z_]\w*)(?=\()|\b(\d+\.?\d*(?:e-?\d+)?)\b/gm;
    return e.replace(re, (m, c, s, k, f, n) =>
      c ? `<span class="tk-c">${c}</span>` : s ? `<span class="tk-s">${s}</span>` : k ? `<span class="tk-k">${k}</span>` : f ? `<span class="tk-f">${f}</span>` : `<span class="tk-n">${n}</span>`);
  }
  function renderCode(p, a) {
    p.innerHTML = `<div class="code-card"><div class="code-head"><span class="dots"><i></i><i></i><i></i></span><span>${a.id}.py</span><button class="copy-btn">${ico('copy')}<span>复制代码</span></button></div><pre><code>${hlPython(a.code)}</code></pre></div>
      <p class="hint center">运行环境：Python 3.8+ ｜ 依赖安装：<code>pip install numpy scipy pandas statsmodels</code></p>`;
    $('.copy-btn', p).onclick = async e => {
      const btn = e.currentTarget;
      try { await navigator.clipboard.writeText(a.code); } catch (_) {
        const t = document.createElement('textarea'); t.value = a.code; document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove();
      }
      $('span', btn).textContent = '已复制 ✓';
      setTimeout(() => ($('span', btn).textContent = '复制代码'), 1600);
    };
  }

  function renderCalc(p, a) {
    destroyCharts();
    CALC[a.id](p, a);
  }

  /* =========================================================
     在线求解器
     ========================================================= */
  const HINT_MATRIX = '每行一个评价对象、每列一个指标。首行可写指标名，首列可写对象名；支持从 Excel 直接复制粘贴（制表符 / 逗号 / 空格分隔）。';
  const CALC = {};

  /* ---------- TOPSIS ---------- */
  CALC.topsis = root => {
    root.innerHTML = `<div class="calc-grid">
      ${inputPanel(1, '输入决策矩阵', HINT_MATRIX)}
      <div class="panel"><div class="panel-title"><span class="pt-num">2</span>指标类型与权重</div>
        <p class="hint">为每个指标选择类型，中间型需填写最优值，区间型需填写最佳区间。</p>
        <div class="type-list" id="types"></div>
        <div class="field"><label>权重来源</label><div class="seg" id="wmode"><button data-v="equal" class="on">等权重</button><button data-v="entropy">熵权法（客观）</button><button data-v="custom">自定义</button></div></div>
        <div class="field" id="wbox" hidden><input class="inp" id="wval" placeholder="按指标顺序输入，如 0.4, 0.3, 0.2, 0.1（自动归一化）"></div>
      </div></div>${runBar()}`;
    const inp = setupInput({
      rowUnit: '个对象', colUnit: '个指标', types: true, parse: { rowPrefix: '对象', colPrefix: '指标' },
      example: () => `河流 含氧量 PH值 细菌总数 植物营养物量
A 4.69 6.59 51 11.94
B 2.03 7.86 19 6.46
C 9.11 6.31 46 8.91
D 8.61 7.05 46 26.43
E 7.13 6.50 50 23.57
F 2.39 6.77 38 24.62
G 7.69 6.79 38 6.01
H 9.30 6.81 27 31.57
I 5.45 7.62 5 18.46
J 6.19 7.27 17 7.51`,
      exTypes: () => [{ type: 'max' }, { type: 'mid', best: 7 }, { type: 'min' }, { type: 'int', a: 10, b: 20 }],
    });
    const wmode = seg($('#wmode'), v => ($('#wbox').hidden = v !== 'custom'));
    const out = $('#out');
    const run = scroll => runSafe(out, () => {
      const { data, rowNames, colNames } = inp.get(), types = inp.types();
      if (data.length < 2) throw new Error('至少需要 2 个评价对象');
      let w = null, wsrc = '等权重', mode = wmode();
      if (mode === 'entropy') { w = MM.entropy(data, types).w; wsrc = '熵权法'; }
      if (mode === 'custom') {
        w = parseList($('#wval').value);
        if (w.length !== colNames.length || w.some(v => !isFinite(v) || v < 0) || MM.sum(w) === 0) throw new Error(`自定义权重需为 ${colNames.length} 个非负数`);
        wsrc = '自定义权重';
      }
      const r = MM.topsis(data, types, w);
      const best = sortedIdx(r.rank)[0];
      out.innerHTML =
        resCard('Step 1 · 指标正向化', `<p class="hint">将极小型、中间型、区间型指标统一转化为极大型（越大越好）。</p>${tableHTML(r.P, rowNames, colNames)}`) +
        resCard('Step 2 · 标准化矩阵 Z', `<p class="hint">$z_{ij}=\\tilde x_{ij}\\big/\\sqrt{\\sum_i \\tilde x_{ij}^2}$，消除量纲影响。</p>${tableHTML(r.Z, rowNames, colNames)}`) +
        resCard('Step 3 · 权重与正负理想解', tableHTML([r.w, r.zPlus, r.zMinus], ['权重 w', '正理想解 Z⁺', '负理想解 Z⁻'], colNames), wsrc) +
        resCard('Step 4 · 距离、贴近度与排名',
          rankTable(rowNames, [{ n: 'D⁺', v: r.dPlus }, { n: 'D⁻', v: r.dMinus }, { n: '贴近度 S', v: r.S }], r.Snorm, r.rank, '归一化得分') +
          `<p class="res-text">综合评价结果：<b>${esc(rowNames[best])}</b> 的相对贴近度最高（S = ${fmt(r.S[best])}），为最优对象。</p>` +
          chartBox('ch1', Math.max(240, rowNames.length * 34)));
      const o = sortedIdx(r.rank);
      mkChart('ch1', barCfg(o.map(i => rowNames[i]), o.map(i => r.Snorm[i]), { horizontal: true, label: '得分' }));
    }, scroll);
    $('#brun').onclick = () => run(true);
    run(false);
  };

  /* ---------- 熵权法 ---------- */
  CALC.entropy = root => {
    root.innerHTML = `<div class="calc-grid">
      ${inputPanel(1, '输入指标数据', HINT_MATRIX)}
      <div class="panel"><div class="panel-title"><span class="pt-num">2</span>指标类型</div>
        <p class="hint">熵权法计算前需将所有指标正向化。</p><div class="type-list" id="types"></div></div>
      </div>${runBar()}`;
    const inp = setupInput({
      rowUnit: '个对象', colUnit: '个指标', types: true, parse: { rowPrefix: '对象', colPrefix: '指标' },
      example: () => `城市 人均GDP(万元) 居民收入(万元) 失业率(%) 绿化覆盖率(%) PM2.5
甲市 9.8 4.6 3.2 41.5 38
乙市 12.4 5.8 2.8 38.2 45
丙市 6.5 3.2 4.1 45.6 29
丁市 15.1 6.9 2.5 36.8 52
戊市 8.2 4.1 3.6 43.1 33
己市 10.6 5.0 3.0 40.2 41`,
      exTypes: () => [{ type: 'max' }, { type: 'max' }, { type: 'min' }, { type: 'max' }, { type: 'min' }],
    });
    const out = $('#out');
    const run = scroll => runSafe(out, () => {
      const { data, rowNames, colNames } = inp.get();
      const r = MM.entropy(data, inp.types());
      const top = r.w.indexOf(Math.max(...r.w));
      out.innerHTML =
        resCard('Step 1 · 正向化 + 极差标准化', `<p class="hint">$z_{ij}=\\dfrac{\\tilde x_{ij}-\\min \\tilde x_{j}}{\\max \\tilde x_{j}-\\min \\tilde x_{j}}\\in[0,1]$</p>${tableHTML(r.Z, rowNames, colNames)}`) +
        resCard('Step 2 · 概率矩阵 P', `<p class="hint">$p_{ij}=z_{ij}\\big/\\sum_i z_{ij}$，表示第 $i$ 个对象在指标 $j$ 下的比重。</p>${tableHTML(r.Pm, rowNames, colNames)}`) +
        resCard('Step 3 · 信息熵、差异系数与熵权',
          tableHTML([r.e, r.d, r.w], ['信息熵 e', '差异系数 d = 1−e', '熵权 w'], colNames) +
          `<p class="res-text">权重最大的指标是 <b>${esc(colNames[top])}</b>（w = ${fmt(r.w[top])}），说明各对象在该指标上的差异最大、提供的信息最多。</p>` +
          `<div class="res-grid">${chartBox('chw', 280)}${chartBox('chd', 280)}</div>`) +
        resCard('Step 4 · 综合得分与排名', rankTable(rowNames, [], r.score, r.rank, '综合得分（百分制）') + chartBox('chs', Math.max(220, rowNames.length * 34)));
      mkChart('chw', barCfg(colNames, r.w, { label: '熵权' }));
      mkChart('chd', { type: 'doughnut', data: { labels: colNames, datasets: [{ data: r.w, backgroundColor: PALETTE, borderWidth: 2, borderColor: '#fff' }] }, options: { responsive: true, maintainAspectRatio: false, cutout: '62%', plugins: { legend: { position: 'right', labels: { usePointStyle: true, boxWidth: 8 } } } } });
      const o = sortedIdx(r.rank);
      mkChart('chs', barCfg(o.map(i => rowNames[i]), o.map(i => r.score[i]), { horizontal: true, label: '得分' }));
    }, scroll);
    $('#brun').onclick = () => run(true);
    run(false);
  };

  /* ---------- AHP ---------- */
  CALC.ahp = root => {
    const parseFrac = s => {
      s = String(s).trim();
      const m = s.match(/^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/);
      const v = m ? +m[1] / +m[2] : s === '' ? NaN : Number(s);
      return isFinite(v) && v > 0 ? v : NaN;
    };
    const recipStr = s => {
      const v = parseFrac(s);
      if (!isFinite(v)) return '?';
      const m = String(s).trim().match(/^1\s*\/\s*(\d+(?:\.\d+)?)$/);
      if (m) return m[1];
      if (Number.isInteger(v)) return v === 1 ? '1' : `1/${v}`;
      return fmtS(1 / v, 3);
    };
    const EX = { names: ['景色', '费用', '居住', '饮食', '交通'], up: [['1/2', '4', '3', '3'], ['7', '5', '5'], ['1/2', '1/3'], ['1']] };
    let n = 5, names = EX.names.slice(), U = {}; // U["i,j"] 上三角字符串
    const loadEx = () => { n = 5; names = EX.names.slice(); U = {}; EX.up.forEach((row, i) => row.forEach((v, k) => (U[`${i},${i + k + 1}`] = v))); };
    loadEx();
    root.innerHTML = `<div class="panel">
        <div class="panel-title"><span class="pt-num">1</span>设置准则</div>
        <div class="ahp-top">
          <div class="field inline"><label>准则个数 n</label><select class="sel" id="ahpN" style="width:90px">${[2, 3, 4, 5, 6, 7, 8, 9, 10].map(k => `<option ${k === n ? 'selected' : ''}>${k}</option>`).join('')}</select></div>
          <div class="field grow"><label>准则名称（逗号分隔）</label><input class="inp" id="ahpNames"></div>
          <button class="btn ghost sm" id="bex">${ico('db')}载入示例</button><button class="btn ghost sm" id="breset">重置为全 1</button>
        </div>
        <div class="panel-title mt"><span class="pt-num">2</span>填写判断矩阵 <small>只需填写上三角（支持 1/3 这样的分数），下三角自动取倒数</small></div>
        <div class="saaty">Saaty 标度：<b>1</b> 同等重要 · <b>3</b> 稍微重要 · <b>5</b> 明显重要 · <b>7</b> 强烈重要 · <b>9</b> 极端重要 · 2/4/6/8 为中间值 · 行因素相对列因素</div>
        <div class="table-wrap"><table class="ahp-grid" id="grid"></table></div>
      </div>${runBar()}`;
    const grid = $('#grid'), namesInp = $('#ahpNames');
    const syncNames = () => { names = Array.from({ length: n }, (_, i) => names[i] || `准则${i + 1}`); namesInp.value = names.join(', '); };
    const draw = () => {
      let h = `<thead><tr><th>A</th>${names.map(s => `<th>${esc(s)}</th>`).join('')}</tr></thead><tbody>`;
      for (let i = 0; i < n; i++) {
        h += `<tr><th>${esc(names[i])}</th>`;
        for (let j = 0; j < n; j++) {
          if (i === j) h += '<td class="diag">1</td>';
          else if (i < j) h += `<td><input class="inp cell" data-k="${i},${j}" value="${esc(U[`${i},${j}`] ?? '1')}"></td>`;
          else h += `<td class="recip" id="rc-${i}-${j}">${recipStr(U[`${j},${i}`] ?? '1')}</td>`;
        }
        h += '</tr>';
      }
      grid.innerHTML = h + '</tbody>';
    };
    grid.addEventListener('input', e => {
      const k = e.target.dataset.k;
      if (!k) return;
      U[k] = e.target.value;
      e.target.classList.toggle('err', !isFinite(parseFrac(e.target.value)));
      const [i, j] = k.split(',');
      $(`#rc-${j}-${i}`).textContent = recipStr(e.target.value);
    });
    $('#ahpN').onchange = e => { n = +e.target.value; syncNames(); draw(); };
    namesInp.addEventListener('input', () => { const arr = namesInp.value.split(/[,，]/).map(s => s.trim()); names = Array.from({ length: n }, (_, i) => arr[i] || `准则${i + 1}`); draw(); });
    $('#bex').onclick = () => { loadEx(); $('#ahpN').value = n; syncNames(); draw(); };
    $('#breset').onclick = () => { U = {}; draw(); };
    syncNames(); draw();

    const out = $('#out');
    const run = scroll => runSafe(out, () => {
      const A = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => {
        if (i === j) return 1;
        const v = parseFrac(i < j ? U[`${i},${j}`] ?? '1' : U[`${j},${i}`] ?? '1');
        if (!isFinite(v)) throw new Error(`判断矩阵第 ${Math.min(i, j) + 1} 行第 ${Math.max(i, j) + 1} 列的值无效（需为正数或分数）`);
        return i < j ? v : 1 / v;
      }));
      const r = MM.ahp(A);
      const avg = r.wArith.map((v, i) => (v + r.wGeo[i] + r.wEig[i]) / 3);
      const rank = MM.rankDesc(r.wEig);
      const crCls = n <= 2 ? 'ok' : r.pass ? 'ok' : 'bad';
      out.innerHTML =
        resCard('Step 1 · 判断矩阵 A', tableHTML(A, names.map(esc), names.map(esc), 4, 'A') +
          `<p class="hint" style="margin-top:12px">算术平均法中间结果——列归一化矩阵：</p>${tableHTML(r.Nm, names.map(esc), names.map(esc), 4)}`) +
        resCard('Step 2 · 一致性检验', metrics([
          { k: '最大特征值 λmax', v: fmt(r.lambdaMax), cls: 'accent' },
          { k: '一致性指标 CI', v: fmt(r.CI), s: '(λmax − n)/(n − 1)' },
          { k: `随机一致性 RI（n=${n}）`, v: fmt(r.RI, 2) },
          { k: '一致性比例 CR', v: fmt(r.CR), cls: crCls, s: n <= 2 ? 'n ≤ 2 时恒满足一致性' : r.pass ? 'CR < 0.1 ✓ 通过' : 'CR ≥ 0.1 ✗ 未通过' },
        ]) + (n > 2 && !r.pass && r.worst
          ? `<div class="callout warn"><b>修改建议</b><div>判断矩阵一致性不可接受。偏离最大的元素是 <b>a<sub>${r.worst.i + 1}${r.worst.j + 1}</sub></b>（${esc(names[r.worst.i])} vs ${esc(names[r.worst.j])}），当前值 ${fmtS(A[r.worst.i][r.worst.j], 3)}，根据权重比 w<sub>i</sub>/w<sub>j</sub> 建议调整为约 <b>${fmtS(r.worst.suggest, 2)}</b> 附近的标度值。</div></div>`
          : `<div class="callout ok"><b>检验通过</b><div>判断矩阵具有满意的一致性，所得权重可以使用。</div></div>`), 'CR = CI / RI') +
        resCard('Step 3 · 权重计算结果（三种方法对比）',
          rawTable(['准则', '算术平均法', '几何平均法', '特征值法', '三法平均', '排名'], names.map((nm, i) => [esc(nm), fmt(r.wArith[i]), fmt(r.wGeo[i]), fmt(r.wEig[i]), `<b>${fmt(avg[i])}</b>`, rankPill(rank[i])])) +
          chartBox('chw', 300));
      mkChart('chw', {
        type: 'bar',
        data: { labels: names, datasets: [['算术平均法', r.wArith, PALETTE[0]], ['几何平均法', r.wGeo, PALETTE[1]], ['特征值法', r.wEig, PALETTE[2]]].map(([l, d, c]) => ({ label: l, data: d, backgroundColor: alpha(c, 0.85), borderRadius: 6, maxBarThickness: 26 })) },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { usePointStyle: true, boxWidth: 8 } } }, scales: { x: { grid: { display: false } }, y: { beginAtZero: true } } },
      });
    }, scroll);
    $('#brun').onclick = () => run(true);
    run(false);
  };

  /* ---------- 灰色关联分析 ---------- */
  CALC.gra = root => {
    const EX_F = `年份 GDP 第一产业 第二产业 第三产业
2000年 1988 386 839 763
2001年 2061 408 846 808
2002年 2335 422 960 953
2003年 2750 482 1258 1010
2004年 3356 511 1577 1268
2005年 3806 561 1893 1352`;
    const EX_E = `企业 利润率(%) 市场占有率(%) 成本(万元) 客户满意度
企业A 12.5 18 320 86
企业B 9.8 25 280 82
企业C 15.2 12 360 90
企业D 11.0 20 300 78
企业E 13.6 15 340 88`;
    root.innerHTML = `<div class="calc-grid">
      ${inputPanel(1, '输入数据', '<span id="graHint"></span>')}
      <div class="panel"><div class="panel-title"><span class="pt-num">2</span>分析设置</div>
        <div class="field"><label>分析模式</label><div class="seg" id="mode"><button data-v="factor" class="on">影响因素分析</button><button data-v="eval">综合评价</button></div></div>
        <div class="field"><label>分辨系数 ρ（0~1，通常取 0.5）</label><input class="inp" id="rho" type="number" step="0.05" min="0.01" max="1" value="0.5"></div>
        <div id="typeBox" hidden><div class="field"><label>指标类型</label></div><div class="type-list" id="types"></div></div>
      </div></div>${runBar()}`;
    const HINTS = {
      factor: '每行一个样本（如年份），<b>第 1 列为参考序列（母序列）</b>，其余列为比较序列（影响因素）。首列可写样本名称。',
      eval: '每行一个评价对象，每列一个指标。参考序列取各指标（正向化后）的最优值。',
    };
    let curMode = 'factor';
    $('#graHint').innerHTML = HINTS.factor;
    const inp = setupInput({ rowUnit: '行', colUnit: '列', types: true, parse: { rowPrefix: '样本', colPrefix: '序列' }, example: () => (curMode === 'factor' ? EX_F : EX_E), exTypes: () => (curMode === 'eval' ? [{ type: 'max' }, { type: 'max' }, { type: 'min' }, { type: 'max' }] : null) });
    const out = $('#out');
    seg($('#mode'), v => {
      curMode = v;
      $('#graHint').innerHTML = HINTS[v];
      $('#typeBox').hidden = v !== 'eval';
      inp.load(v === 'factor' ? EX_F : EX_E, v === 'eval' ? [{ type: 'max' }, { type: 'max' }, { type: 'min' }, { type: 'max' }] : null);
      run(false);
    });
    const run = scroll => runSafe(out, () => {
      const { data, rowNames, colNames } = inp.get();
      const rho = +$('#rho').value;
      if (!(rho > 0 && rho <= 1)) throw new Error('分辨系数 ρ 需在 (0, 1] 之间');
      if (curMode === 'factor') {
        const r = MM.gra(data, { mode: 'factor', rho });
        const fnames = colNames.slice(1), best = sortedIdx(r.rank)[0];
        out.innerHTML =
          resCard('Step 1 · 均值化无量纲处理', tableHTML(r.N, rowNames, colNames)) +
          resCard('Step 2 · 差序列与两级极差', `<p class="hint">$\\Delta_i(k)=|x_0'(k)-x_i'(k)|$，参考序列：<b>${esc(colNames[0])}</b></p>` + tableHTML(r.D, rowNames, fnames) +
            metrics([{ k: '两级最小差 a', v: fmt(r.a) }, { k: '两级最大差 b', v: fmt(r.b) }, { k: '分辨系数 ρ', v: rho }])) +
          resCard('Step 3 · 关联系数矩阵 ξ', `<p class="hint">$\\xi_i(k)=\\dfrac{a+\\rho b}{\\Delta_i(k)+\\rho b}$</p>` + tableHTML(r.XI, rowNames, fnames)) +
          resCard('Step 4 · 关联度排序', rankTable(fnames, [], r.r, r.rank, '关联度 r', '比较序列') +
            `<p class="res-text">与「${esc(colNames[0])}」关联最紧密的因素是 <b>${esc(fnames[best])}</b>（r = ${fmt(r.r[best])}），其对参考序列的影响程度最大。</p>` + chartBox('ch1', 280));
        const o = sortedIdx(r.rank);
        mkChart('ch1', barCfg(o.map(i => fnames[i]), o.map(i => r.r[i]), { label: '关联度' }));
      } else {
        const r = MM.gra(data, { mode: 'eval', rho, types: inp.types() });
        const best = sortedIdx(r.rank)[0];
        out.innerHTML =
          resCard('Step 1 · 正向化 + 均值化', tableHTML(r.N, rowNames, colNames)) +
          resCard('Step 2 · 参考序列与差序列', tableHTML([r.ref], ['参考序列（最优值）'], colNames) + tableHTML(r.D, rowNames, colNames) +
            metrics([{ k: '两级最小差 a', v: fmt(r.a) }, { k: '两级最大差 b', v: fmt(r.b) }, { k: '分辨系数 ρ', v: rho }])) +
          resCard('Step 3 · 关联系数矩阵 ξ', tableHTML(r.XI, rowNames, colNames)) +
          resCard('Step 4 · 灰色关联度（综合评价得分）', rankTable(rowNames, [], r.r, r.rank, '关联度 r') +
            `<p class="res-text">综合评价最优的对象是 <b>${esc(rowNames[best])}</b>，与理想对象的关联度最高（r = ${fmt(r.r[best])}）。</p>` + chartBox('ch1', Math.max(220, rowNames.length * 34)));
        const o = sortedIdx(r.rank);
        mkChart('ch1', barCfg(o.map(i => rowNames[i]), o.map(i => r.r[i]), { horizontal: true, label: '关联度' }));
      }
    }, scroll);
    $('#brun').onclick = () => run(true);
    run(false);
  };

  /* ---------- 回归通用 ---------- */
  function coefTable(names, r, extra = {}) {
    const head = ['参数', '估计值', '标准误', 't 值', 'p 值', '显著性'];
    if (extra.std) head.push('标准化系数');
    if (extra.vif) head.push('VIF');
    return rawTable(head, names.map((nm, j) => {
      const row = [nm, `<b>${fmt(r.beta[j])}</b>`, fmt(r.se[j]), fmt(r.t[j], 3), fmtP(r.pv[j]), `<span class="sig">${stars(r.pv[j]) || '<span style="color:var(--muted);font-weight:400">不显著</span>'}</span>`];
      if (extra.std) row.push(j === 0 ? '—' : fmt(r.stdBeta[j]));
      if (extra.vif) row.push(j === 0 ? '—' : `${fmt(extra.vif[j - 1], 3)} ${extra.vif[j - 1] > 10 ? '<span class="badge bad">共线</span>' : ''}`);
      return row;
    }));
  }
  function anovaTable(SSR, SSE, k, df, F, pF) {
    return rawTable(['方差来源', '平方和 SS', '自由度 df', '均方 MS', 'F 值', 'p 值'], [
      ['回归 (SSR)', fmt(SSR), k, fmt(SSR / k), `<b>${fmt(F, 3)}</b>`, fmtP(pF)],
      ['残差 (SSE)', fmt(SSE), df, fmt(SSE / df), '', ''],
      ['总计 (SST)', fmt(SSR + SSE), k + df, '', '', ''],
    ]);
  }
  function eqTex(lhs, terms) {
    // terms: [{c, t}] t 为项的 TeX（常数项为 ''）
    return lhs + '=' + terms.map((x, i) => {
      const sign = x.c < 0 ? '-' : i === 0 ? '' : '+';
      return `${sign}${texNum(Math.abs(x.c))}${x.t}`;
    }).join('');
  }
  const PT = (c, r = 4) => ({ backgroundColor: alpha(c, 0.75), borderColor: c, pointRadius: r, pointHoverRadius: r + 2 });
  const LN = (c, w = 2.5, dash) => ({ showLine: true, pointRadius: 0, borderColor: c, borderWidth: w, borderDash: dash, fill: false, tension: 0 });
  function residualChart(id, fitted, resid) {
    const lo = Math.min(...fitted), hi = Math.max(...fitted);
    mkChart(id, {
      type: 'scatter',
      data: { datasets: [
        { label: '残差', data: fitted.map((v, i) => ({ x: v, y: resid[i] })), ...PT(curAlgo.c[1]) },
        { label: '_zero', data: [{ x: lo, y: 0 }, { x: hi, y: 0 }], ...LN('#94a3b8', 1.5, [6, 4]) },
      ] },
      options: baseScatterOpts('拟合值 ŷ', '残差 e'),
    });
  }

  /* ---------- 一元线性回归 ---------- */
  CALC.linear = root => {
    root.innerHTML = `<div class="calc-grid">
      ${inputPanel(1, '输入样本数据 (x, y)', '两列数据：<b>第 1 列为自变量 x，第 2 列为因变量 y</b>；首行可写变量名。')}
      <div class="panel"><div class="panel-title"><span class="pt-num">2</span>参数设置</div>
        <div class="field"><label>预测点 x₀（可选，多个用逗号分隔）</label><input class="inp" id="x0" value="10.5, 12"></div>
        <div class="field"><label>置信水平</label><select class="sel" id="alpha"><option value="0.05">95%</option><option value="0.01">99%</option><option value="0.1">90%</option></select></div>
        <div class="callout mini info"><div>显著性标记：<b>***</b> p&lt;0.001 · <b>**</b> p&lt;0.01 · <b>*</b> p&lt;0.05<br>图中阴影带为回归均值的置信区间。</div></div>
      </div></div>${runBar()}`;
    const inp = setupInput({
      rowUnit: '组样本', colUnit: '个变量', parse: { colNames: ['x', 'y'], rowPrefix: '样本' },
      example: () => `广告投入(万元) 销售额(万元)
2.1 12.3
3.0 15.1
3.8 18.2
4.5 20.5
5.2 22.8
6.1 26.9
7.0 29.5
7.8 33.1
8.6 35.6
9.5 39.2`,
    });
    const out = $('#out');
    const run = scroll => runSafe(out, () => {
      const { data, colNames } = inp.get();
      if (data[0].length !== 2) throw new Error('一元线性回归需要恰好 2 列数据（x 与 y）');
      const x = data.map(r => r[0]), y = data.map(r => r[1]);
      const al = +$('#alpha').value;
      const r = MM.linreg(x, y);
      const [xn, yn] = colNames;
      const eq = eqTex('\\hat y', [{ c: r.a, t: '' }, { c: r.b, t: 'x' }]);
      const preds = parseList($('#x0').value).filter(isFinite).map(v => r.predict(v, al));
      const lvl = `${Math.round((1 - al) * 100)}%`;
      out.innerHTML =
        resCard('Step 1 · 描述统计与相关分析', metrics([
          { k: '样本量 n', v: r.n }, { k: 'x̄', v: fmtS(r.xm) }, { k: 'ȳ', v: fmtS(r.ym) },
          { k: 'Lxx', v: fmtS(r.Lxx) }, { k: 'Lxy', v: fmtS(r.Lxy) }, { k: '相关系数 r', v: fmt(r.r), cls: 'accent', s: Math.abs(r.r) >= 0.8 ? '强相关' : Math.abs(r.r) >= 0.5 ? '中等相关' : '弱相关' },
        ])) +
        resCard('Step 2 · 最小二乘估计', `<div class="equation">$$${eq}$$</div>` +
          coefTable(['截距 β₀', `斜率 β₁ (${esc(xn)})`], { beta: [r.a, r.b], se: [r.seA, r.seB], t: [r.tA, r.tB], pv: [r.pA, r.pB] }) +
          `<p class="res-text">解释：${esc(xn)} 每增加 1 个单位，${esc(yn)} 平均${r.b >= 0 ? '增加' : '减少'} <b>${fmtS(Math.abs(r.b))}</b> 个单位。</p>`) +
        resCard('Step 3 · 拟合优度与误差评价指标 (Accuracy Metrics)', metrics([
          { k: '决定系数 R²', v: fmt(r.R2), cls: 'accent', s: '拟合优度' },
          { k: '平均绝对误差 MAE', v: fmt(r.MAE, 4), cls: 'ok', s: '平均绝对离差' },
          { k: '均方误差 MSE', v: fmt(r.MSE, 4), s: '残差方差量度' },
          { k: '均方根误差 RMSE', v: fmt(r.RMSE, 4), cls: 'accent', s: '与因变量量纲相同' },
          { k: '平均相对误差 MRE (MAPE)', v: isFinite(r.MAPE) ? fmt(r.MAPE, 2) + '%' : '—', cls: r.MAPE < 10 ? 'ok' : '', s: isFinite(r.MRE) ? `MRE = ${fmt(r.MRE, 4)}` : '含零值无法计算' },
          { k: 'F 统计量 (p值)', v: `${fmt(r.F, 2)} (${fmtP(r.pF)})`, cls: r.pF < 0.05 ? 'ok' : 'bad', s: r.pF < 0.05 ? '线性关系显著' : '不显著' },
        ]) + anovaTable(r.SSR, r.SSE, 1, r.df, r.F, r.pF)) +
        resCard('Step 4 · 回归直线与残差分析', `<div class="res-grid"><div><div class="chart-title">散点图与回归直线</div>${chartBox('chf', 320)}</div><div><div class="chart-title">残差图（应随机分布于 0 附近）</div>${chartBox('chr', 320)}</div></div>`) +
        (preds.length ? resCard('Step 5 · 预测', rawTable(['x₀', '点预测 ŷ₀', `均值置信区间 (${lvl})`, `个体预测区间 (${lvl})`],
          preds.map(p => [fmtS(p.x0), `<b>${fmt(p.y)}</b>`, `[${fmt(p.ci[0])}, ${fmt(p.ci[1])}]`, `[${fmt(p.pi[0])}, ${fmt(p.pi[1])}]`]))) : '');
      const xs = [...x, ...preds.map(p => p.x0)], lo = Math.min(...xs), hi = Math.max(...xs), N = 60;
      const grid = Array.from({ length: N + 1 }, (_, i) => lo + (hi - lo) * i / N);
      const band = grid.map(v => r.band(v, al));
      mkChart('chf', {
        type: 'scatter',
        data: { datasets: [
          { label: '_lo', data: grid.map((v, i) => ({ x: v, y: band[i][0] })), ...LN('transparent', 0) },
          { label: '_hi', data: grid.map((v, i) => ({ x: v, y: band[i][1] })), ...LN('transparent', 0), fill: '-1', backgroundColor: alpha(curAlgo.c[0], 0.12) },
          { label: '回归直线', data: [{ x: lo, y: r.a + r.b * lo }, { x: hi, y: r.a + r.b * hi }], ...LN(curAlgo.c[0]) },
          { label: '观测值', data: x.map((v, i) => ({ x: v, y: y[i] })), ...PT(curAlgo.c[1], 5) },
          ...(preds.length ? [{ label: '预测点', data: preds.map(p => ({ x: p.x0, y: p.y })), backgroundColor: '#fff', borderColor: curAlgo.c[0], borderWidth: 2.5, pointRadius: 6, pointStyle: 'rectRot' }] : []),
        ] },
        options: baseScatterOpts(xn, yn),
      });
      residualChart('chr', r.yhat, r.resid);
    }, scroll);
    $('#brun').onclick = () => run(true);
    run(false);
  };

  /* ---------- 多元线性回归 ---------- */
  CALC.multiple = root => {
    root.innerHTML = `<div class="calc-grid">
      ${inputPanel(1, '输入样本数据', '每行一个样本，<b>前 k 列为自变量，最后一列为因变量 y</b>；首行写变量名。')}
      <div class="panel"><div class="panel-title"><span class="pt-num">2</span>参数设置</div>
        <div class="field"><label>预测：新样本自变量取值（按顺序逗号分隔，可选）</label><input class="inp" id="x0" value="100, 5, 1.0"></div>
        <div class="field"><label>置信水平</label><select class="sel" id="alpha"><option value="0.05">95%</option><option value="0.01">99%</option><option value="0.1">90%</option></select></div>
        <div class="callout mini info"><div>VIF &gt; 10 表示存在严重多重共线性；标准化系数可用于比较各自变量影响的相对大小。</div></div>
      </div></div>${runBar()}`;
    const inp = setupInput({
      rowUnit: '组样本', colUnit: '个变量', parse: { colPrefix: 'x', rowPrefix: '样本' },
      example: () => `面积(㎡) 房龄(年) 距地铁(km) 价格(万元)
85 5 1.2 142
120 3 0.8 185
60 15 2.5 97
95 8 1.5 150
150 2 0.5 223
70 20 3.0 98
110 10 1.0 171
80 12 2.0 121
130 6 1.8 193
65 25 0.6 106
100 4 2.8 147
140 9 1.1 206`,
    });
    const out = $('#out');
    const run = scroll => runSafe(out, () => {
      const { data, colNames } = inp.get();
      const k = data[0].length - 1;
      if (k < 1) throw new Error('至少需要 1 个自变量列和 1 个因变量列');
      const X = data.map(r => r.slice(0, k)), y = data.map(r => r[k]);
      const xn = colNames.slice(0, k), yn = colNames[k];
      const al = +$('#alpha').value, lvl = `${Math.round((1 - al) * 100)}%`;
      const r = MM.ols(X, y), vif = MM.vif(X), R = MM.corrMatrix(data);
      const x0 = parseList($('#x0').value);
      const pred = x0.length === k && x0.every(isFinite) ? r.predict(x0, al) : null;
      const eq = eqTex('\\hat y', [{ c: r.beta[0], t: '' }, ...xn.map((_, j) => ({ c: r.beta[j + 1], t: `x_{${j + 1}}` }))]);
      const heat = v => { const a = Math.min(1, Math.abs(v)); const c = v >= 0 ? curAlgo.c[0] : '#ef4444'; return `style="background:${alpha(c, a * 0.75)};color:${a > 0.55 ? '#fff' : 'inherit'};font-weight:600"`; };
      const corrHTML = `<div class="table-wrap"><table><thead><tr><th></th>${colNames.map(c => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${R.map((row, i) => `<tr><th>${esc(colNames[i])}</th>${row.map(v => `<td ${heat(v)}>${v.toFixed(3)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
      const sig = xn.filter((_, j) => r.pv[j + 1] < 0.05);
      out.innerHTML =
        resCard('Step 1 · 数据概览与相关系数矩阵', metrics([{ k: '样本量 n', v: r.n }, { k: '自变量个数 k', v: k }, { k: '因变量', v: esc(yn) }, { k: '残差自由度', v: r.df }]) +
          `<p class="hint" style="margin-top:14px">相关系数热力图：颜色越深相关性越强（红色为负相关）。自变量之间高度相关提示可能存在共线性。</p>` + corrHTML) +
        resCard('Step 2 · 最小二乘参数估计', `<div class="equation">$$${eq}$$</div><p class="hint">${xn.map((s, j) => `$x_{${j + 1}}$ = ${esc(s)}`).join('；')}</p>` +
          coefTable(['常数项 β₀', ...xn.map((s, j) => `β${j + 1}（${esc(s)}）`)], r, { std: true, vif: vif })) +
        resCard('Step 3 · 模型检验与误差评价指标 (Accuracy Metrics)', metrics([
          { k: '决定系数 R²', v: fmt(r.R2), cls: 'accent', s: '拟合优度' },
          { k: '调整 R²', v: fmt(r.adjR2), s: '消除自变量个数影响' },
          { k: '平均绝对误差 MAE', v: fmt(r.MAE, 4), cls: 'ok' },
          { k: '均方误差 MSE', v: fmt(r.MSE, 4) },
          { k: '均方根误差 RMSE', v: fmt(r.RMSE, 4), cls: 'accent' },
          { k: '平均相对误差 MRE (MAPE)', v: isFinite(r.MAPE) ? fmt(r.MAPE, 2) + '%' : '—', cls: r.MAPE < 10 ? 'ok' : '', s: isFinite(r.MRE) ? `MRE = ${fmt(r.MRE, 4)}` : '含零值无法计算' },
          { k: 'F 统计量', v: fmt(r.F, 3) },
          { k: 'F 检验 p 值', v: fmtP(r.pF), cls: r.pF < 0.05 ? 'ok' : 'bad', s: r.pF < 0.05 ? '回归方程整体显著' : '整体不显著' },
        ]) + anovaTable(r.SSR, r.SSE, k, r.df, r.F, r.pF) +
          `<p class="res-text">在 α = 0.05 水平下，${sig.length ? `显著的自变量为：<b>${sig.map(esc).join('、')}</b>` : '没有自变量单独显著'}${sig.length < k ? `；${xn.filter((_, j) => r.pv[j + 1] >= 0.05).map(esc).join('、')} 不显著，可考虑逐步回归剔除` : ''}。</p>`) +
        resCard('Step 4 · 拟合效果与残差分析', `<div class="res-grid"><div><div class="chart-title">实际值 vs 拟合值</div>${chartBox('chf', 320)}</div><div><div class="chart-title">残差图</div>${chartBox('chr', 320)}</div></div>`) +
        (pred ? resCard('Step 5 · 预测', rawTable(['自变量取值', '点预测 ŷ₀', `均值置信区间 (${lvl})`, `个体预测区间 (${lvl})`], [[xn.map((s, j) => `${esc(s)}=${x0[j]}`).join(', '), `<b>${fmt(pred.y)}</b>`, `[${fmt(pred.ci[0])}, ${fmt(pred.ci[1])}]`, `[${fmt(pred.pi[0])}, ${fmt(pred.pi[1])}]`]])) : '');
      const lo = Math.min(...y, ...r.yhat), hi = Math.max(...y, ...r.yhat);
      mkChart('chf', {
        type: 'scatter',
        data: { datasets: [
          { label: '理想线 y = ŷ', data: [{ x: lo, y: lo }, { x: hi, y: hi }], ...LN('#94a3b8', 1.5, [6, 4]) },
          { label: '样本点', data: y.map((v, i) => ({ x: v, y: r.yhat[i] })), ...PT(curAlgo.c[0], 5) },
        ] },
        options: baseScatterOpts('实际值 y', '拟合值 ŷ'),
      });
      residualChart('chr', r.yhat, r.resid);
    }, scroll);
    $('#brun').onclick = () => run(true);
    run(false);
  };

  /* ---------- 非线性回归 ---------- */
  CALC.nonlinear = root => {
    root.innerHTML = `<div class="calc-grid">
      ${inputPanel(1, '输入样本数据 (x, y)', '两列数据：第 1 列为自变量 x，第 2 列为因变量 y；首行可写变量名。')}
      <div class="panel"><div class="panel-title"><span class="pt-num">2</span>选择模型</div>
        <div class="field"><div class="seg" id="model"><button data-v="compare" class="on">全部对比</button><button data-v="poly">多项式</button><button data-v="exp">指数</button><button data-v="power">幂函数</button><button data-v="log">对数</button><button data-v="logistic">Logistic</button></div></div>
        <div class="field" id="degBox"><label>多项式阶数</label><select class="sel" id="deg" style="width:120px">${[2, 3, 4, 5, 6].map(d => `<option value="${d}" ${d === 3 ? 'selected' : ''}>${d} 次</option>`).join('')}</select></div>
        <div class="field"><label>预测点 x₀（可选，逗号分隔）</label><input class="inp" id="x0" value="13, 14, 15"></div>
        <div class="callout mini info"><div>求解流程：线性化变换求初值 → Levenberg–Marquardt 迭代最小化残差平方和。</div></div>
      </div></div>${runBar()}`;
    const inp = setupInput({
      rowUnit: '组样本', colUnit: '个变量', parse: { colNames: ['x', 'y'], rowPrefix: '样本' },
      example: () => `时间(天) 菌落数量(百个)
1 4.2
2 6.8
3 11.5
4 18.9
5 30.1
6 45.3
7 61.8
8 76.4
9 86.9
10 93.2
11 96.8
12 98.6`,
    });
    const model = seg($('#model'), () => run(false));
    const out = $('#out');
    $('#deg').onchange = () => run(false);
    const modelEq = fit => {
      if (fit.key === 'poly') return eqTex('\\hat y', fit.beta.map((c, j) => ({ c, t: j === 0 ? '' : j === 1 ? 'x' : `x^{${j}}` })));
      const p = fit.p.map(v => texNum(v));
      const sg = v => (v < 0 ? '-' : '+');
      switch (fit.key) {
        case 'exp': return `\\hat y=${p[0]}\\,e^{${texNum(fit.p[1])}x}`;
        case 'power': return `\\hat y=${p[0]}\\,x^{${texNum(fit.p[1])}}`;
        case 'log': return `\\hat y=${p[0]}${sg(fit.p[1])}${texNum(Math.abs(fit.p[1]))}\\ln x`;
        case 'logistic': return `\\hat y=\\dfrac{${p[0]}}{1+${p[1]}\\,e^{${texNum(-fit.p[2])}x}}`;
      }
      return '';
    };
    const curve = (fit, lo, hi) => Array.from({ length: 121 }, (_, i) => { const v = lo + (hi - lo) * i / 120; return { x: v, y: fit.f(v) }; }).filter(pt => isFinite(pt.y));
    const run = scroll => runSafe(out, () => {
      const m = model();
      $('#degBox').hidden = !(m === 'poly' || m === 'compare');
      const { data, colNames } = inp.get();
      if (data[0].length !== 2) throw new Error('需要恰好 2 列数据（x 与 y）');
      const x = data.map(r => r[0]), y = data.map(r => r[1]), deg = +$('#deg').value;
      const [xn, yn] = colNames;
      const x0 = parseList($('#x0').value).filter(isFinite);
      const xs = [...x, ...x0], lo = Math.min(...xs), hi = Math.max(...xs);
      const doFit = k => (k === 'poly' ? MM.polyfit(x, y, deg) : MM.nlfit(k, x, y));
      if (m === 'compare') {
        const keys = ['poly', 'exp', 'power', 'log', 'logistic'];
        const fits = keys.map(k => { try { return doFit(k); } catch (e) { return { key: k, name: k === 'poly' ? `${deg} 次多项式` : MM.NL_MODELS[k].name, err: e.message }; } });
        const ok = fits.filter(f => !f.err);
        if (!ok.length) throw new Error('所有模型均无法拟合该数据');
        const best = ok.reduce((a, b) => (b.AIC < a.AIC ? b : a));
        out.innerHTML =
          resCard('模型对比结果', rawTable(['模型', '拟合方程', 'R²', 'MAE', 'MSE', 'RMSE', 'MRE (MAPE)', 'AIC', '评价'], fits.map(f => f.err
            ? [f.name, `<span style="color:var(--muted)">${esc(f.err)}</span>`, '—', '—', '—', '—', '—', '—', '<span class="badge warn">不适用</span>']
            : [f.name, `$${modelEq(f)}$`, `<b>${fmt(f.R2)}</b>`, fmt(f.MAE), fmt(f.MSE), fmt(f.RMSE), isFinite(f.MAPE) ? fmt(f.MAPE, 2) + '%' : '—', fmt(f.AIC, 3), f === best ? '<span class="badge ok">★ AIC 最优</span>' : ''])) +
            `<p class="res-text">综合拟合精度（R²、RMSE、MAE、MRE）与模型复杂度（AIC 越小越好），推荐 <b>${best.name}</b>：R² = ${fmt(best.R2)}，RMSE = ${fmt(best.RMSE)}，MAE = ${fmt(best.MAE)}。选择模型时还应结合实际物理/机理意义与外推合理性。</p>`, 'R² / MAE / RMSE / AIC') +
          resCard('拟合曲线对比', chartBox('chc', 400)) +
          (x0.length ? resCard('各模型预测值', rawTable(['x₀', ...ok.map(f => f.name)], x0.map(v => [fmtS(v), ...ok.map(f => (f === best ? `<b>${fmt(f.f(v))}</b>` : fmt(f.f(v))))]))) : '');
        mkChart('chc', {
          type: 'scatter',
          data: { datasets: [
            { label: '观测值', data: x.map((v, i) => ({ x: v, y: y[i] })), ...PT('#1e2235', 5), order: 0 },
            ...ok.map((f, i) => ({ label: f.name, data: curve(f, lo, hi), ...LN(PALETTE[[0, 1, 2, 3, 5][keys.indexOf(f.key)]], f === best ? 3.5 : 2, f === best ? undefined : [5, 4]), order: 1 })),
          ] },
          options: baseScatterOpts(xn, yn),
        });
        return;
      }
      const f = doFit(m);
      const pnames = f.key === 'poly' ? f.beta.map((_, j) => `β${j}`) : f.params;
      const initRow = f.key === 'poly' ? '' : rawTable(['参数', ...pnames], [['线性化初值', ...f.init.map(v => fmt(v))], ['LM 优化后', ...f.p.map(v => `<b>${fmt(v)}</b>`)]]);
      out.innerHTML =
        (f.key === 'poly'
          ? resCard('Step 1 · 转化为多元线性回归', `<p class="hint">令 $x_j=x^{j}$，对设计矩阵 $[1, x, x^2, \\dots, x^{${deg}}]$ 用最小二乘求解 $\\hat{\\boldsymbol\\beta}=(X^\\top X)^{-1}X^\\top\\mathbf y$。</p>` +
            coefTable(pnames.map((s, j) => (j === 0 ? '常数项 β₀' : `β${j}（x${j > 1 ? `<sup>${j}</sup>` : ''}）`)), f))
          : resCard('Step 1 · 线性化求初值 + LM 迭代优化', `<p class="hint">模型：$${f.tex}$。${f.how}；再以此为初值，经 <b>${f.iter}</b> 次 LM 迭代最小化 $\\sum (y_i-\\hat y_i)^2$。</p>` + initRow)) +
        resCard('Step 2 · 拟合方程与误差精度评价 (Accuracy Metrics)', `<div class="equation">$$${modelEq(f)}$$</div>` + metrics([
          { k: '决定系数 R²', v: fmt(f.R2), cls: 'accent', s: '拟合优度' },
          { k: '调整 R²', v: fmt(f.adjR2) },
          { k: '平均绝对误差 MAE', v: fmt(f.MAE), cls: 'ok' },
          { k: '均方误差 MSE', v: fmt(f.MSE) },
          { k: '均方根误差 RMSE', v: fmt(f.RMSE), cls: 'accent' },
          { k: '平均相对误差 MRE (MAPE)', v: isFinite(f.MAPE) ? fmt(f.MAPE, 2) + '%' : '—', cls: f.MAPE < 10 ? 'ok' : '', s: isFinite(f.MRE) ? `MRE = ${fmt(f.MRE, 4)}` : '含零值无法计算' },
          { k: 'AIC 准则', v: fmt(f.AIC, 3) },
        ]) + (f.key === 'logistic' ? `<p class="res-text">参数解释：环境最大容纳量（饱和值）<b>K ≈ ${fmtS(f.p[0], 3)}</b>，内禀增长率 <b>b ≈ ${fmtS(f.p[2], 4)}</b>，增长最快的拐点出现在 x = ln(a)/b ≈ <b>${fmtS(Math.log(f.p[1]) / f.p[2], 3)}</b>（此时 y = K/2）。</p>` : '')) +
        resCard('Step 3 · 拟合曲线与残差', `<div class="res-grid"><div><div class="chart-title">观测值与拟合曲线</div>${chartBox('chf', 320)}</div><div><div class="chart-title">残差图</div>${chartBox('chr', 320)}</div></div>` +
          rawTable(['序号', esc(xn), `观测值 ${esc(yn)}`, '拟合值 ŷ', '残差 e', '相对误差'], x.map((v, i) => [i + 1, fmtS(v), fmtS(y[i]), fmt(f.yhat[i]), fmt(f.resid[i]), y[i] !== 0 ? fmt(Math.abs(f.resid[i] / y[i]) * 100, 2) + '%' : '—']))) +
        (x0.length ? resCard('Step 4 · 预测', rawTable(['x₀', '预测值 ŷ₀'], x0.map(v => [fmtS(v), `<b>${fmt(f.f(v))}</b>`]))) : '');
      mkChart('chf', {
        type: 'scatter',
        data: { datasets: [
          { label: '拟合曲线', data: curve(f, lo, hi), ...LN(curAlgo.c[0], 3) },
          { label: '观测值', data: x.map((v, i) => ({ x: v, y: y[i] })), ...PT(curAlgo.c[1], 5) },
          ...(x0.length ? [{ label: '预测点', data: x0.map(v => ({ x: v, y: f.f(v) })), backgroundColor: '#fff', borderColor: curAlgo.c[0], borderWidth: 2.5, pointRadius: 6, pointStyle: 'rectRot' }] : []),
        ] },
        options: baseScatterOpts(xn, yn),
      });
      residualChart('chr', f.yhat, f.resid);
    }, scroll);
    $('#brun').onclick = () => run(true);
    run(false);
  };

  /* ---------- GM(1,1) ---------- */
  CALC.gm11 = root => {
    root.innerHTML = `<div class="calc-grid">
      <div class="panel"><div class="panel-title"><span class="pt-num">1</span>输入原始时间序列<span class="csv-drop-badge">支持拖拽 CSV</span></div>
        <p class="hint">按时间顺序输入非负数据（至少 4 个），用逗号、空格或换行分隔，或直接拖入 CSV 文件。</p>
        <textarea id="din" class="data-input" style="min-height:140px" spellcheck="false" placeholder="在此输入数据，或将 .csv / .txt 文件拖拽至此处…"></textarea>
        <div class="btn-row"><button class="btn ghost sm" id="bex">${ico('db')}载入示例</button>${csvImportBtnHTML()}<button class="btn ghost sm" id="bclr">清空</button><span class="data-info" id="dinfo"></span></div>
      </div>
      <div class="panel"><div class="panel-title"><span class="pt-num">2</span>参数设置</div>
        <div class="field"><label>起始期标签（如年份，可选）</label><input class="inp" id="start" type="number" value="2017"></div>
        <div class="field"><label>向后预测期数</label><input class="inp" id="steps" type="number" min="1" max="20" value="3"></div>
        <div class="callout mini info"><div>GM(1,1) 适合 4~10 个数据的短期预测；数据需通过级比检验。</div></div>
      </div></div>${runBar()}`;
    const EX = '128.5, 136.2, 143.1, 151.8, 160.3, 168.9, 178.2';
    const ta = $('#din'), info = $('#dinfo');
    const getSeries = () => {
      const v = ta.value.split(/[\s,，;；]+/).filter(Boolean);
      if (v.some(s => isNaN(Number(s)))) throw new Error('序列中包含非数值内容');
      const arr = v.map(Number);
      info.innerHTML = `<span class="ok-dot"></span>共 ${arr.length} 个数据`;
      return arr;
    };
    $('#bex').onclick = () => { ta.value = EX; getSeries(); };
    $('#bclr').onclick = () => { ta.value = ''; info.textContent = ''; ta.focus(); };
    ta.value = EX;
    const out = $('#out');
    const run = scroll => runSafe(out, () => {
      const x0 = getSeries();
      const steps = Math.max(0, Math.min(50, parseInt($('#steps').value) || 0));
      const st = $('#start').value.trim();
      const lab = k => (st !== '' && isFinite(+st) ? String(+st + k) : `第${k + 1}期`);
      const r = MM.gm11(x0, steps);
      const n = r.n;
      const aTex = texNum(r.a, 6), baTex = texNum(r.b / r.a, 4), c0 = texNum(x0[0] - r.b / r.a, 4);
      const dev = -r.a;
      const devText = dev <= 0.3 ? '适用于中长期预测' : dev <= 0.5 ? '适用于短期预测' : dev <= 0.8 ? '短期预测需谨慎' : dev <= 1 ? '应采用残差修正模型' : '不宜采用 GM(1,1)';
      out.innerHTML =
        resCard('Step 1 · 级比检验', metrics([
          { k: '可容覆盖区间', v: `(${fmtS(r.lo, 4)}, ${fmtS(r.hi, 4)})`, s: `e^(±2/(n+1))，n = ${n}` },
          { k: '级比范围', v: `[${fmtS(Math.min(...r.lam), 4)}, ${fmtS(Math.max(...r.lam), 4)}]` },
          { k: '检验结论', v: r.ratioPass ? '通过 ✓' : '未通过 ✗', cls: r.ratioPass ? 'ok' : 'bad', s: r.ratioPass ? '可建立 GM(1,1) 模型' : '建议平移变换后再建模' },
        ]) + rawTable(['期', ...r.lam.map((_, i) => lab(i + 1))], [['级比 λ(k)', ...r.lam.map((v, i) => `<span style="color:${v > r.lo && v < r.hi ? 'inherit' : '#dc2626'}">${fmt(v)}</span>`)]])) +
        resCard('Step 2 · 累加生成与紧邻均值', rawTable(['期', ...x0.map((_, k) => lab(k))], [
          ['原始序列 x⁽⁰⁾', ...x0.map(v => fmtS(v))],
          ['累加序列 x⁽¹⁾', ...r.x1.map(v => fmt(v, 3))],
          ['紧邻均值 z⁽¹⁾', '—', ...r.z1.map(v => fmt(v, 3))],
        ])) +
        resCard('Step 3 · 最小二乘估计参数与时间响应函数', metrics([
          { k: '发展系数 a', v: fmt(r.a, 6), cls: 'accent', s: `−a = ${fmtS(dev, 4)}，${devText}` },
          { k: '灰作用量 b', v: fmt(r.b, 4) },
          { k: 'b / a', v: fmt(r.b / r.a, 4) },
        ]) + `<div class="equation" style="margin-top:14px">$$\\hat x^{(1)}(k+1)=${c0}\\,e^{${texNum(-r.a, 6)}k}${r.b / r.a < 0 ? '' : '+'}${baTex}$$</div><p class="hint">白化方程：$\\dfrac{dx^{(1)}}{dt}${r.a < 0 ? '' : '+'}${aTex}\\,x^{(1)}=${texNum(r.b, 4)}$</p>`) +
        resCard('Step 4 · 累减还原与误差精度指标 (Accuracy & Error Metrics)',
          metrics([
            { k: '平均绝对误差 MAE', v: fmt(r.MAE, 4), cls: 'ok' },
            { k: '均方误差 MSE', v: fmt(r.MSE, 4) },
            { k: '均方根误差 RMSE', v: fmt(r.RMSE, 4), cls: 'accent' },
            { k: '平均相对误差 MRE', v: isFinite(r.MRE) ? fmt(r.MRE * 100, 3) + '%' : '—', cls: r.MRE < 0.1 ? 'ok' : 'bad', s: `MRE = ${fmt(r.MRE, 4)}` },
          ]) +
          rawTable(['期', '原始值 x⁽⁰⁾', '拟合值 x̂⁽⁰⁾', '残差 e', '相对误差 ε', '级比偏差 ρ'],
            x0.map((v, k) => [lab(k), fmtS(v), fmt(r.x0hat[k], 4), fmt(r.e[k], 4), k === 0 ? '—' : fmt(r.relErr[k] * 100, 3) + '%', k === 0 ? '—' : fmt(r.rho[k - 1], 4)])) +
          `<p class="res-text">平均相对误差 MRE 为 <b>${fmt(r.meanRelErr * 100, 3)}%</b>，${r.meanRelErr < 0.1 ? '达到较高精度要求（< 10%）' : r.meanRelErr < 0.2 ? '达到一般精度要求（< 20%）' : '未达到精度要求'}；最大级比偏差 |ρ| = ${fmt(Math.max(...r.rho.map(Math.abs)), 4)}，${Math.max(...r.rho.map(Math.abs)) < 0.1 ? '达到较高要求' : Math.max(...r.rho.map(Math.abs)) < 0.2 ? '达到一般要求' : '未达到要求'}。</p>`) +
        resCard('Step 5 · 后验差检验', metrics([
          { k: '原始序列标准差 S₁', v: fmt(r.S1) }, { k: '残差标准差 S₂', v: fmt(r.S2) },
          { k: '后验差比 C', v: fmt(r.C), cls: r.C <= 0.5 ? 'ok' : 'bad' }, { k: '小误差概率 P', v: fmt(r.P, 3), cls: r.P >= 0.8 ? 'ok' : 'bad' },
          { k: '模型精度等级', v: r.grade.text, cls: r.grade.level <= 2 ? 'ok' : 'bad' },
        ])) +
        resCard('Step 6 · 拟合与预测结果', chartBox('chf', 340) + (steps ? rawTable(['期', ...r.forecast.map((_, i) => lab(n + i))], [['预测值', ...r.forecast.map(v => `<b>${fmt(v, 4)}</b>`)]]) : ''), steps ? `向后预测 ${steps} 期` : '');
      const labels = r.x0hat.map((_, k) => lab(k));
      mkChart('chf', {
        type: 'line',
        data: { labels, datasets: [
          { label: '原始数据', data: [...x0, ...Array(steps).fill(null)], borderColor: curAlgo.c[1], backgroundColor: alpha(curAlgo.c[1], 0.8), pointRadius: 5, borderWidth: 0, showLine: false },
          { label: '模型拟合', data: r.x0hat.map((v, k) => (k < n ? v : null)), borderColor: curAlgo.c[0], borderWidth: 2.5, pointRadius: 0, tension: 0.3, fill: { target: 'origin', above: alpha(curAlgo.c[0], 0.06) } },
          { label: '预测', data: r.x0hat.map((v, k) => (k >= n - 1 ? v : null)), borderColor: curAlgo.c[0], borderDash: [6, 5], borderWidth: 2.5, pointRadius: r.x0hat.map((_, k) => (k >= n ? 5 : 0)), pointStyle: 'rectRot', pointBackgroundColor: '#fff', tension: 0.3 },
        ] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { usePointStyle: true, boxWidth: 8 } } }, scales: { x: { grid: { display: false } }, y: { grid: { color: '#f0f1f7' } } } },
      });
    }, scroll);
    $('#brun').onclick = () => run(true);
    run(false);
  };

  /* ---------- 模糊综合评价 ---------- */
  CALC.fce = root => {
    root.innerHTML = `<div class="calc-grid">
      ${inputPanel(1, '输入模糊评价矩阵 R', '每行对应一个评价因素，每列对应一个评语级（如：优、良、中、差）；各元素为属于该评语的隶属度或投票比率（0~1）。')}
      <div class="panel"><div class="panel-title"><span class="pt-num">2</span>权重与合成算子</div>
        <div class="field"><label>因素权重向量 W</label><input class="inp" id="wval" placeholder="如 0.35, 0.25, 0.20, 0.20（自动归一化）"></div>
        <div class="field"><label>模糊合成算子</label>
          <select class="sel" id="fce_op">
            <option value="sum-prod" selected>M(·, ⊕) 加权平均型（兼顾所有因素，建模最常用）</option>
            <option value="max-min">M(∧, ∨) 主因素决定型（突出最关键因素）</option>
            <option value="max-prod">M(·, ∨) 主因素突出型（相乘突出重点）</option>
            <option value="min-sum">M(∧, ⊕) 有界和型（综合下限考虑）</option>
          </select>
        </div>
        <div class="field"><label>各评语级量化分值（可选，用于计算综合得分）</label><input class="inp" id="fce_scores" placeholder="如 95, 80, 65, 45"></div>
      </div></div>${runBar()}`;
    const inp = setupInput({
      rowUnit: '个因素', colUnit: '个评语级', parse: { rowPrefix: '因素', colPrefix: '评语' },
      example: () => `因素 优秀 良好 一般 较差
专业技能 0.40 0.35 0.20 0.05
沟通表达 0.30 0.40 0.20 0.10
团队协作 0.20 0.50 0.25 0.05
创新意识 0.50 0.30 0.15 0.05`,
    });
    $('#wval').value = '0.35, 0.25, 0.20, 0.20';
    $('#fce_scores').value = '95, 80, 65, 45';
    const out = $('#out');
    const run = scroll => runSafe(out, () => {
      const { data, rowNames, colNames } = inp.get();
      const m = data.length, n = colNames.length;
      if (m < 1 || n < 2) throw new Error('至少需要 1 个评价因素和 2 个评语等级');
      data.forEach((r, i) => {
        r.forEach((v, j) => {
          if (v < 0 || v > 1.0001) throw new Error(`第 ${i + 1} 行第 ${j + 1} 列的隶属度 (${v}) 不在 [0, 1] 区间`);
        });
      });
      let wStr = $('#wval').value.trim();
      let W = wStr ? parseList(wStr) : Array(m).fill(1 / m);
      if (W.length !== m || W.some(v => !isFinite(v) || v < 0) || MM.sum(W) === 0) {
        throw new Error(`因素权重需为 ${m} 个非负数`);
      }
      W = MM.normalize(W);
      const op = $('#fce_op').value;
      const scoresStr = $('#fce_scores').value.trim();
      let scores = null;
      if (scoresStr) {
        scores = parseList(scoresStr);
        if (scores.length !== n) throw new Error(`评语量化分值需对应 ${n} 个评语级`);
      }
      const r = MM.fce(W, data, op, scores);
      const bestComment = colNames[r.maxIdx];

      out.innerHTML =
        resCard('Step 1 · 因素权重与隶属矩阵 R',
          rawTable(['因素 \\ 评语', ...colNames, '权重 W'],
            data.map((row, i) => [rowNames[i], ...row.map(v => fmtS(v)), `<b>${fmt(W[i], 3)}</b>`])) +
          `<p class="hint">注：各因素单项隶属度向量构成了模糊关系矩阵 $\\mathbf R_{${m}\\times ${n}}$。</p>`) +
        resCard('Step 2 · 模糊合成运算结果向量 B',
          rawTable(['评语等级', ...colNames], [
            ['未归一化 B*', ...r.B_raw.map(v => fmt(v, 4))],
            ['归一化隶属度 B', ...r.B.map(v => `<b>${fmt(v, 4)}</b>`)],
            ...(scores ? [['量化分值 S', ...scores.map(v => fmtS(v))]] : []),
          ]) +
          metrics([
            { k: '采用算子', v: op === 'sum-prod' ? '加权平均 M(·, ⊕)' : op === 'max-min' ? '主因素 M(∧, ∨)' : op === 'max-prod' ? '主因素突出 M(·, ∨)' : '有界和 M(∧, ⊕)' },
            { k: '综合评语等级', v: bestComment, cls: 'accent', s: `最大隶属度 b_max = ${fmt(r.maxVal, 4)}` },
            ...(r.finalScore !== null ? [{ k: '加权综合得分', v: fmt(r.finalScore, 2), cls: 'ok', s: '基于用户设定的评语分值' }] : []),
          ])) +
        resCard('Step 3 · 最大隶属度有效度与区分度检验',
          metrics([
            { k: '有效度比值 β', v: fmt(r.beta, 3), cls: r.beta >= 1.5 ? 'ok' : 'bad', s: r.beta >= 1.5 ? 'β ≥ 1.5，有效度极高' : r.beta >= 1.1 ? '1.1 ≤ β < 1.5，有效度良好' : 'β < 1.1，两等级隶属度接近，判别需谨慎' },
            { k: '区分度指标 α', v: fmt(r.alpha, 4), cls: r.alpha >= 0.2 ? 'ok' : 'bad', s: 'α = (n·b_max - 1)/(n - 1)，范围 [0, 1]' },
          ]) +
          `<p class="res-text">综合评价结论：该评价对象在“<b>${esc(bestComment)}</b>”评语上的隶属度最高（<b>${fmt(r.maxVal * 100, 2)}%</b>）` +
          (r.finalScore !== null ? `，综合得分评估为 <b>${fmt(r.finalScore, 2)}</b> 分。` : '。') +
          `有效度检验显示 β = ${fmt(r.beta, 2)}，${r.beta >= 1.5 ? '具有很强的判别区分度。' : '建议参考加权分值或二级评判。'}</p>` +
          chartBox('ch_fce', 280));

      mkChart('ch_fce', barCfg(colNames, r.B, { horizontal: false, label: '隶属度' }));
    }, scroll);
    $('#brun').onclick = () => run(true);
    run(false);
  };

  /* ---------- 时间序列 ARIMA ---------- */
  CALC.arima = root => {
    root.innerHTML = `<div class="calc-grid">
      <div class="panel"><div class="panel-title"><span class="pt-num">1</span>输入时间序列数据<span class="csv-drop-badge">支持拖拽 CSV</span></div>
        <p class="hint">按时间先后顺序输入一维序列（支持单列数字，或首列为时间标签/年份季度），支持拖拽 CSV。</p>
        <textarea id="din_arima" class="data-input" style="min-height:160px" spellcheck="false" placeholder="在此输入序列，或将 .csv / .txt 文件拖拽至此处…"></textarea>
        <div class="btn-row"><button class="btn ghost sm" id="bex_arima">${ico('db')}载入示例</button>${csvImportBtnHTML()}<button class="btn ghost sm" id="bclr_arima">清空</button><span class="data-info" id="dinfo_arima"></span></div>
      </div>
      <div class="panel"><div class="panel-title"><span class="pt-num">2</span>模型阶数与预测设置</div>
        <div class="res-grid" style="gap:10px">
          <div class="field"><label>AR 阶数 p</label><input class="inp" id="ar_p" type="number" min="0" max="6" value="1"></div>
          <div class="field"><label>差分阶数 d</label><input class="inp" id="ar_d" type="number" min="0" max="2" value="1"></div>
          <div class="field"><label>MA 阶数 q</label><input class="inp" id="ar_q" type="number" min="0" max="6" value="1"></div>
          <div class="field"><label>预测步数</label><input class="inp" id="ar_steps" type="number" min="1" max="24" value="5"></div>
        </div>
        <div class="btn-row" style="margin-top:14px">
          <button class="btn ghost sm" id="b_auto_arima">${ico('compass')}自动定阶 (Auto ARIMA)</button>
          <span class="hint" style="margin:0">按 AIC 最小准则网格搜索最佳 (p, d, q)</span>
        </div>
        <div class="callout mini info" style="margin-top:12px"><div>ARIMA(p, d, q)：适用于较平稳或经 d 阶差分平稳的非白噪声时间序列。</div></div>
      </div></div>${runBar()}`;

    const EX = `2020-Q1 112
2020-Q2 118
2020-Q3 132
2020-Q4 129
2021-Q1 121
2021-Q2 135
2021-Q3 148
2021-Q4 148
2022-Q1 136
2022-Q2 158
2022-Q3 170
2022-Q4 170
2023-Q1 150
2023-Q2 178
2023-Q3 199
2023-Q4 199
2024-Q1 184
2024-Q2 210
2024-Q3 230
2024-Q4 228`;

    const ta = $('#din_arima'), info = $('#dinfo_arima');
    const parseSeries = () => {
      const lines = ta.value.split(/\r?\n/).map(l => l.trim()).filter(l => l.length && !l.startsWith('#'));
      if (!lines.length) throw new Error('请输入时间序列数据');
      const labels = [], values = [];
      lines.forEach((line, idx) => {
        const parts = line.split(/[\s,，;；]+/).filter(Boolean);
        if (!parts.length) return;
        if (parts.length === 1) {
          const v = Number(parts[0]);
          if (isNaN(v)) throw new Error(`第 ${idx + 1} 行非有效数值: ${parts[0]}`);
          labels.push(`t=${idx + 1}`);
          values.push(v);
        } else {
          const v = Number(parts[parts.length - 1]);
          if (isNaN(v)) throw new Error(`第 ${idx + 1} 行末尾非有效数值: ${parts[parts.length - 1]}`);
          labels.push(parts[0]);
          values.push(v);
        }
      });
      if (values.length < 8) throw new Error('时间序列长度至少需要 8 个观测值');
      info.innerHTML = `<span class="ok-dot"></span>共 ${values.length} 期观测值`;
      return { labels, values };
    };

    $('#bex_arima').onclick = () => { ta.value = EX; parseSeries(); };
    $('#bclr_arima').onclick = () => { ta.value = ''; info.textContent = ''; ta.focus(); };
    ta.value = EX;

    $('#b_auto_arima').onclick = () => {
      try {
        const { values } = parseSeries();
        const auto = MM.autoArima(values, 3, 2, 2, 5);
        $('#ar_p').value = auto.best.p;
        $('#ar_d').value = auto.best.d;
        $('#ar_q').value = auto.best.q;
        run(true);
      } catch (e) {
        alert('自动定阶出错: ' + e.message);
      }
    };

    const out = $('#out');
    const run = scroll => runSafe(out, () => {
      const { labels, values } = parseSeries();
      const p = Math.max(0, parseInt($('#ar_p').value) || 0);
      const d = Math.max(0, parseInt($('#ar_d').value) || 0);
      const q = Math.max(0, parseInt($('#ar_q').value) || 0);
      const steps = Math.max(1, parseInt($('#ar_steps').value) || 5);

      const r = MM.arima(values, p, d, q, steps);
      const diffVals = MM.diff(values, d);
      const acfRes = MM.acf(diffVals, 10);
      const pacfRes = MM.pacf(diffVals, 10);

      const futureLabels = Array.from({ length: steps }, (_, i) => {
        const last = labels[labels.length - 1];
        const m = last.match(/(\d+)-Q([1-4])/);
        if (m) {
          let y = parseInt(m[1]), qtr = parseInt(m[2]) + i + 1;
          while (qtr > 4) { y++; qtr -= 4; }
          return `${y}-Q${qtr}`;
        }
        if (/^\d{4}$/.test(last)) return String(parseInt(last) + i + 1);
        return `预测+${i + 1}`;
      });

      const allLabels = [...labels, ...futureLabels];

      out.innerHTML =
        resCard('Step 1 · 序列平稳化与差分分析',
          metrics([
            { k: '原始序列长度 N', v: values.length },
            { k: '差分阶数 d', v: d, s: d === 0 ? '原始序列直接建模' : `${d} 阶差分变换` },
            { k: '差分后均值', v: fmt(MM.mean(diffVals), 4) },
            { k: '差分后标准差', v: fmt(MM.std(diffVals), 4) },
          ])) +
        resCard('Step 2 · 自相关 (ACF) 与偏自相关 (PACF) 检验',
          `<p class="hint">95% 显著性临界阈值: ±${fmt(acfRes.se, 4)}。若超出虚线阈值则显著相关。</p>` +
          chartBox('ch_acf', 260) +
          rawTable(['滞后期 k', ...acfRes.lags.slice(1).map(k => `Lag ${k}`)], [
            ['自相关 ACF', ...acfRes.acf.slice(1).map(v => fmt(v, 3))],
            ['偏自相关 PACF', ...pacfRes.pacf.slice(1).map(v => fmt(v, 3))],
          ])) +
        resCard(`Step 3 · ARIMA(${p}, ${d}, ${q}) 模型参数估计`,
          metrics([
            { k: '常数项 c', v: fmt(r.c, 4) },
            { k: '残差方差 σ²', v: fmt(r.sigma2, 4) },
            { k: 'AIC 信息准则', v: fmt(r.AIC, 2), cls: 'accent' },
            { k: 'BIC 信息准则', v: fmt(r.BIC, 2) },
          ]) +
          (r.phi.length ? rawTable(['AR 参数', ...r.phi.map((_, i) => `ϕ_${i + 1}`)], [['估计值', ...r.phi.map(v => fmt(v, 4))]]) : '') +
          (r.theta.length ? rawTable(['MA 参数', ...r.theta.map((_, i) => `θ_${i + 1}`)], [['估计值', ...r.theta.map(v => fmt(v, 4))]]) : '')) +
        resCard('Step 4 · 序列拟合误差与精度评价 (In-Sample Accuracy)',
          metrics([
            { k: '平均绝对误差 MAE', v: fmt(r.MAE, 4), cls: 'ok' },
            { k: '均方误差 MSE', v: fmt(r.MSE, 4) },
            { k: '均方根误差 RMSE', v: fmt(r.RMSE, 4), cls: 'accent' },
            { k: '平均相对误差 MRE (MAPE)', v: isFinite(r.MAPE) ? fmt(r.MAPE, 2) + '%' : '—', cls: r.MAPE < 10 ? 'ok' : '', s: isFinite(r.MRE) ? `MRE = ${fmt(r.MRE, 4)}` : '含零值无法计算' },
            { k: 'AIC 准则', v: fmt(r.AIC, 2) },
            { k: 'BIC 准则', v: fmt(r.BIC, 2) },
          ])) +
        resCard('Step 5 · 残差白噪声诊断 (Ljung-Box 检验)',
          metrics([
            { k: 'Ljung-Box 统计量 Q', v: fmt(r.Q, 3) },
            { k: '自由度 df', v: r.df_q },
            { k: 'P-Value', v: fmtP(r.p_Q), cls: r.whiteNoisePass ? 'ok' : 'bad' },
            { k: '诊断结论', v: r.whiteNoisePass ? '白噪声 (通过 ✓)' : '未充分提取 (需调整阶数)', cls: r.whiteNoisePass ? 'ok' : 'bad', s: r.whiteNoisePass ? '残差为白噪声，信息提取完全' : '残差仍有自相关，建议提高 p 或 q' },
          ])) +
        resCard('Step 6 · 历史拟合与未来预测结果',
          chartBox('ch_arima', 340) +
          rawTable(['期数', '预测值 ŷ', '95% 置信下限', '95% 置信上限'],
            futureLabels.map((lab, i) => [lab, `<b>${fmt(r.forecast[i], 4)}</b>`, fmt(r.lower95[i], 4), fmt(r.upper95[i], 4)])),
          `向后预测 ${steps} 期`);

      mkChart('ch_acf', {
        type: 'bar',
        data: {
          labels: acfRes.lags.slice(1).map(k => `Lag ${k}`),
          datasets: [
            { label: 'ACF 自相关', data: acfRes.acf.slice(1), backgroundColor: 'rgba(99, 102, 241, 0.7)', borderRadius: 4 },
            { label: 'PACF 偏自相关', data: pacfRes.pacf.slice(1), backgroundColor: 'rgba(20, 184, 166, 0.7)', borderRadius: 4 },
          ],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          scales: { y: { min: -1, max: 1, grid: { color: '#f0f1f7' } } },
        },
      });

      const nHist = values.length;
      mkChart('ch_arima', {
        type: 'line',
        data: {
          labels: allLabels,
          datasets: [
            { label: '原始序列', data: [...values, ...Array(steps).fill(null)], borderColor: '#0ea5e9', backgroundColor: 'rgba(14, 165, 233, 0.8)', pointRadius: 4, borderWidth: 2, showLine: true },
            { label: '模型拟合', data: [...r.fitted, ...Array(steps).fill(null)], borderColor: '#6366f1', borderWidth: 2, pointRadius: 0, tension: 0.2 },
            { label: '未来预测', data: [...Array(nHist - 1).fill(null), values[nHist - 1], ...r.forecast], borderColor: '#f97316', borderDash: [6, 4], borderWidth: 2.5, pointRadius: [...Array(nHist).fill(0), ...Array(steps).fill(5)], pointStyle: 'rectRot', pointBackgroundColor: '#fff' },
            { label: '95% 上限', data: [...Array(nHist).fill(null), ...r.upper95], borderColor: 'rgba(249, 115, 22, 0.3)', borderDash: [3, 3], pointRadius: 0, fill: false },
            { label: '95% 下限', data: [...Array(nHist).fill(null), ...r.lower95], borderColor: 'rgba(249, 115, 22, 0.3)', borderDash: [3, 3], pointRadius: 0, fill: '-1', backgroundColor: 'rgba(249, 115, 22, 0.12)' },
          ],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { labels: { usePointStyle: true, boxWidth: 8 } } },
          scales: { x: { grid: { display: false } }, y: { grid: { color: '#f0f1f7' } } },
        },
      });
    }, scroll);
    $('#brun').onclick = () => run(true);
    run(false);
  };

  /* ---------- 蒙特卡洛算法 ---------- */
  CALC.monte_carlo = root => {
    root.innerHTML = `<div class="calc-grid">
      <div class="panel"><div class="panel-title"><span class="pt-num">1</span>应用场景选择与参数输入</div>
        <div class="field"><label>模拟实验类型</label>
          <div class="seg" id="mc_scene">
            <button data-v="integral" class="on">定积分估计与大数定律</button>
            <button data-v="gbm">资产价格与 VaR 风险模拟</button>
            <button data-v="newsvendor">报童随机库存决策优化</button>
          </div>
        </div>
        <div id="mc_p_integral">
          <div class="field"><label>被积函数 f(x)（JS 表达式，支持 sin, cos, exp, sqrt 等）</label><input class="inp" id="mc_fn" value="sin(x) * exp(-x/3) + 2"></div>
          <div class="res-grid" style="gap:10px">
            <div class="field"><label>积分下限 a</label><input class="inp" id="mc_a" type="number" value="0"></div>
            <div class="field"><label>积分上限 b</label><input class="inp" id="mc_b" type="number" value="6"></div>
          </div>
          <div class="field"><label>随机模拟抽样次数 N</label><input class="inp" id="mc_n_int" type="number" min="100" max="200000" step="1000" value="10000"></div>
        </div>
        <div id="mc_p_gbm" hidden>
          <div class="res-grid" style="gap:10px">
            <div class="field"><label>初始资产价格 S₀</label><input class="inp" id="mc_s0" type="number" value="100"></div>
            <div class="field"><label>年化预期收益率 μ</label><input class="inp" id="mc_mu" type="number" step="0.01" value="0.08"></div>
            <div class="field"><label>年化波动率 σ</label><input class="inp" id="mc_sigma" type="number" step="0.01" value="0.25"></div>
            <div class="field"><label>投资期限 T (年)</label><input class="inp" id="mc_t" type="number" step="0.1" value="1"></div>
          </div>
          <div class="res-grid" style="gap:10px">
            <div class="field"><label>模拟路径条数</label><input class="inp" id="mc_paths" type="number" min="100" max="10000" step="500" value="1000"></div>
            <div class="field"><label>每条路径步数</label><input class="inp" id="mc_steps" type="number" min="10" max="250" value="50"></div>
          </div>
        </div>
        <div id="mc_p_news" hidden>
          <div class="res-grid" style="gap:10px">
            <div class="field"><label>需求均值 μ</label><input class="inp" id="mc_d_mu" type="number" value="100"></div>
            <div class="field"><label>需求标准差 σ</label><input class="inp" id="mc_d_sigma" type="number" value="25"></div>
            <div class="field"><label>单位进货成本 C</label><input class="inp" id="mc_c" type="number" value="40"></div>
            <div class="field"><label>单位销售价格 P</label><input class="inp" id="mc_p" type="number" value="70"></div>
            <div class="field"><label>单位残值 S (未售出)</label><input class="inp" id="mc_s" type="number" value="15"></div>
            <div class="field"><label>单位缺货惩罚成本</label><input class="inp" id="mc_pen" type="number" value="5"></div>
          </div>
          <div class="field"><label>模拟进货量范围 Q_min ~ Q_max (步长)</label>
            <div style="display:flex;gap:8px">
              <input class="inp" id="mc_qmin" type="number" value="50">
              <input class="inp" id="mc_qmax" type="number" value="150">
              <input class="inp" id="mc_qstep" type="number" value="5">
            </div>
          </div>
        </div>
      </div>
      <div class="panel"><div class="panel-title"><span class="pt-num">2</span>蒙特卡洛原理与特点</div>
        <p class="hint">蒙特卡洛方法的核心思想：通过<b>大量重复独立随机抽样</b>，利用辛钦大数定律与中心极限定理，将未知参数或高维复杂期望转化为样本统计量。</p>
        <div class="callout mini info">
          <div><b>误差收敛速度：</b>标准误差与 $1/\\sqrt{N}$ 成正比。当试验次数增加 100 倍时，估计精度提高 10 倍。该收敛速度与问题的空间维数无关，因而极其适合求解高维数值计算与复杂随机系统模拟。</div>
        </div>
      </div></div>${runBar()}`;

    const scene = seg($('#mc_scene'), v => {
      $('#mc_p_integral').hidden = v !== 'integral';
      $('#mc_p_gbm').hidden = v !== 'gbm';
      $('#mc_p_news').hidden = v !== 'newsvendor';
    });

    const out = $('#out');
    const run = scroll => runSafe(out, () => {
      const mode = scene();
      if (mode === 'integral') {
        const fn = $('#mc_fn').value.trim();
        const a = parseFloat($('#mc_a').value);
        const b = parseFloat($('#mc_b').value);
        const N = parseInt($('#mc_n_int').value) || 10000;
        const r = MM.monteCarlo.integral(fn, a, b, N);

        out.innerHTML =
          resCard('Step 1 · 蒙特卡洛定积分估计结果',
            metrics([
              { k: '模拟抽样次数 N', v: r.N.toLocaleString() },
              { k: '定积分估计值', v: fmt(r.estimate, 5), cls: 'accent' },
              { k: '标准误差 SE', v: fmt(r.se, 5) },
              { k: '95% 置信区间', v: `[${fmt(r.ci[0], 4)}, ${fmt(r.ci[1], 4)}]`, cls: 'ok' },
            ]) +
            `<div class="equation" style="margin-top:14px">$$I = \\int_{${a}}^{${b}} \\left(${esc(fn)}\\right)dx \\approx ${fmt(r.estimate, 5)} \\quad (\\pm ${fmt(1.96 * r.se, 4)})$$</div>`) +
          resCard('Step 2 · 大数定律收敛轨迹（样本量 N 对精度的影响）',
            chartBox('ch_mc_conv', 320) +
            rawTable(['抽样步数 N', '当前估计值', '标准误差 SE', '95% 置信区间'],
              r.history.map(h => [h.n.toLocaleString(), `<b>${fmt(h.est, 5)}</b>`, fmt(h.se, 5), `[${fmt(h.ci[0], 4)}, ${fmt(h.ci[1], 4)}]`])));

        mkChart('ch_mc_conv', {
          type: 'line',
          data: {
            labels: r.history.map(h => h.n),
            datasets: [
              { label: '估计值收敛曲线', data: r.history.map(h => h.est), borderColor: '#8b5cf6', borderWidth: 2.5, pointRadius: 4, pointBackgroundColor: '#8b5cf6' },
              { label: '95% 置信上限', data: r.history.map(h => h.ci[1]), borderColor: 'rgba(139, 92, 246, 0.3)', borderDash: [4, 4], pointRadius: 0 },
              { label: '95% 置信下限', data: r.history.map(h => h.ci[0]), borderColor: 'rgba(139, 92, 246, 0.3)', borderDash: [4, 4], pointRadius: 0, fill: '-1', backgroundColor: 'rgba(139, 92, 246, 0.1)' },
            ],
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            scales: { x: { title: { display: true, text: '模拟抽样次数 N' } }, y: { title: { display: true, text: '积分估计值' }, grid: { color: '#f0f1f7' } } },
          },
        });
      } else if (mode === 'gbm') {
        const S0 = parseFloat($('#mc_s0').value);
        const mu = parseFloat($('#mc_mu').value);
        const sigma = parseFloat($('#mc_sigma').value);
        const T = parseFloat($('#mc_t').value);
        const paths = parseInt($('#mc_paths').value) || 1000;
        const steps = parseInt($('#mc_steps').value) || 50;
        const r = MM.monteCarlo.gbm(S0, mu, sigma, T, steps, paths);

        out.innerHTML =
          resCard('Step 1 · 资产价格与 VaR 风险价值度量',
            metrics([
              { k: '期末平均价格 E[S_T]', v: fmt(r.meanTerminal, 2), cls: 'accent' },
              { k: '期末价格中位数', v: fmt(r.medianTerminal, 2) },
              { k: '95% VaR (最大潜在损失)', v: fmt(Math.max(0, r.var95), 2), cls: 'bad', s: `置信度 95% 下损失不超过 ${fmt(Math.max(0, r.var95), 2)}` },
              { k: '95% CVaR (期望亏损)', v: fmt(Math.max(0, r.es95), 2), cls: 'bad', s: '尾部超额损失期望' },
            ])) +
          resCard('Step 2 · 几何布朗运动 (GBM) 随机模拟路径',
            chartBox('ch_mc_paths', 340) +
            `<p class="hint">展示其中 15 条模拟随机价格扩散路径：$dS_t = \\mu S_t dt + \\sigma S_t dW_t$。</p>`);

        const datasets = r.displayPaths.map((p, idx) => ({
          label: `Path ${idx + 1}`,
          data: p,
          borderColor: PALETTE[idx % PALETTE.length],
          borderWidth: 1.5,
          pointRadius: 0,
        }));
        mkChart('ch_mc_paths', {
          type: 'line',
          data: { labels: r.timeGrid.map(t => `${t}Y`), datasets },
          options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { x: { grid: { display: false } }, y: { grid: { color: '#f0f1f7' }, title: { display: true, text: '资产价格 S_t' } } },
          },
        });
      } else {
        const mu = parseFloat($('#mc_d_mu').value);
        const sigma = parseFloat($('#mc_d_sigma').value);
        const cost = parseFloat($('#mc_c').value);
        const price = parseFloat($('#mc_p').value);
        const salvage = parseFloat($('#mc_s').value);
        const pen = parseFloat($('#mc_pen').value);
        const qmin = parseFloat($('#mc_qmin').value);
        const qmax = parseFloat($('#mc_qmax').value);
        const qstep = parseFloat($('#mc_qstep').value);

        const r = MM.monteCarlo.newsvendor(mu, sigma, cost, price, salvage, pen, qmin, qmax, qstep, 3000);

        out.innerHTML =
          resCard('Step 1 · 报童问题随机库存优化决策',
            metrics([
              { k: '理论临界服务水平 CR', v: fmt(r.criticalRatio * 100, 2) + '%', s: 'Cu / (Cu + Co)' },
              { k: '理论最优订货量 Q*_theory', v: fmt(r.qTheory, 1), s: 'μ + σ·Φ⁻¹(CR)' },
              { k: '模拟最优进货量 Q*', v: r.bestQ.q, cls: 'ok', s: '使得期望利润最大' },
              { k: '最大期望利润', v: fmt(r.bestQ.meanProfit, 2), cls: 'accent' },
              { k: '5% VaR 风险利润', v: fmt(r.bestQ.var5Profit, 2), s: '最差 5% 情况下的利润底线' },
            ])) +
          resCard('Step 2 · 订货量 Q 与期望利润及风险曲线',
            chartBox('ch_mc_news', 320) +
            rawTable(['进货量 Q', '期望利润 Mean', '利润标准差 Std', '5% 风险下限 VaR'],
              r.results.map(row => [row.q === r.bestQ.q ? `<b>${row.q} ★</b>` : row.q, fmt(row.meanProfit, 2), fmt(row.stdProfit, 2), fmt(row.var5Profit, 2)])));

        mkChart('ch_mc_news', {
          type: 'line',
          data: {
            labels: r.qList,
            datasets: [
              { label: '期望平均利润', data: r.results.map(x => x.meanProfit), borderColor: '#10b981', borderWidth: 3, pointRadius: r.results.map(x => (x.q === r.bestQ.q ? 7 : 2)), pointBackgroundColor: '#10b981' },
              { label: '5% 风险利润下限 (VaR)', data: r.results.map(x => x.var5Profit), borderColor: '#f43f5e', borderDash: [4, 4], borderWidth: 2, pointRadius: 0 },
            ],
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            scales: { x: { title: { display: true, text: '进货量 Q' } }, y: { title: { display: true, text: '利润金额' }, grid: { color: '#f0f1f7' } } },
          },
        });
      }
    }, scroll);
    $('#brun').onclick = () => run(true);
    run(false);
  };

  /* ---------- 马尔可夫算法 ---------- */
  CALC.markov = root => {
    root.innerHTML = `<div class="calc-grid">
      ${inputPanel(1, '输入一步状态转移矩阵 P', '方阵：第 i 行第 j 列表示从状态 i 转移到状态 j 的概率。每行元素之和必须等于 1。首行首列支持状态名称。')}
      <div class="panel"><div class="panel-title"><span class="pt-num">2</span>初始状态与推移步数</div>
        <div class="field"><label>初始状态概率分布 π⁽⁰⁾</label><input class="inp" id="mk_pi0" placeholder="如 0.6, 0.3, 0.1（逗号分隔，自动归一化）"></div>
        <div class="field"><label>状态推移与预测步数 n</label><input class="inp" id="mk_steps" type="number" min="1" max="50" value="10"></div>
        <div class="callout mini info" style="margin-top:14px"><div>马尔可夫性（无后效性）：在已知系统“当前”状态的条件下，“未来”的状态仅取决于当前，而与“过去”的历史无关。</div></div>
      </div></div>${runBar()}`;

    const inp = setupInput({
      rowUnit: '个状态', colUnit: '个转移状态', parse: { rowPrefix: '状态', colPrefix: '状态' },
      example: () => `状态 晴天 阴天 雨天
晴天 0.70 0.20 0.10
阴天 0.30 0.50 0.20
雨天 0.20 0.40 0.40`,
    });
    $('#mk_pi0').value = '0.5, 0.3, 0.2';
    const out = $('#out');
    const run = scroll => runSafe(out, () => {
      const { data, rowNames, colNames } = inp.get();
      const k = data.length;
      if (k < 2) throw new Error('状态数至少需要 2 个');
      if (colNames.length !== k) throw new Error(`转移矩阵必须为方阵（当前为 ${k} 行 × ${colNames.length} 列）`);
      const pi0Str = $('#mk_pi0').value.trim();
      let pi0 = null;
      if (pi0Str) {
        pi0 = parseList(pi0Str);
        if (pi0.length !== k || pi0.some(v => !isFinite(v) || v < 0) || MM.sum(pi0) === 0) {
          throw new Error(`初始概率分布需为 ${k} 个非负数值`);
        }
      }
      const steps = Math.max(1, Math.min(50, parseInt($('#mk_steps').value) || 10));
      const r = MM.markov(data, pi0, steps, rowNames);

      out.innerHTML =
        resCard('Step 1 · 一步转移概率矩阵 P 校验',
          rawTable(['当前状态 \\ 下一状态', ...r.names, '行和检验'],
            data.map((row, i) => [r.names[i], ...row.map(v => fmtS(v)), `<b>${fmtS(MM.sum(row), 4)}</b>`])) +
          `<p class="hint">每行表示条件转移概率 $P_{ij} = P(X_{t+1}=j \\mid X_t=i)$，各行概率和严格守恒为 1。</p>`) +
        resCard('Step 2 · 极限稳态分布 π*（长期稳态概率）',
          metrics([
            ...r.steady.map((v, i) => ({ k: `稳态 · ${r.names[i]}`, v: fmt(v * 100, 2) + '%', cls: 'accent', s: `π*_${i + 1} = ${fmt(v, 4)}` })),
          ]) +
          `<p class="res-text">求解齐次方程组 $(\\mathbf P^\\top - \\mathbf I)\\boldsymbol\\pi^\\top = \\mathbf 0$ 且 $\\sum \\pi_i = 1$。长期运行后系统处于各状态的概率将独立于初始状态，收敛至上述稳态平衡分布。</p>`) +
        resCard(`Step 3 · 状态概率随时间演变轨迹 (0 ~ ${steps} 步)`,
          chartBox('ch_markov', 320) +
          rawTable(['步数 t', ...r.names],
            r.trajectory.map((dist, t) => [`t = ${t}${t === 0 ? ' (初始)' : ''}`, ...dist.map(v => fmt(v, 4))]))) +
        resCard(`Step 4 · ${steps} 步转移概率矩阵 P^(${steps})`,
          rawTable(['状态', ...r.names],
            r.P_n.map((row, i) => [r.names[i], ...row.map(v => fmt(v, 4))]))) +
        resCard('Step 5 · 离散马尔可夫状态链蒙特卡洛抽样序列 (20 步模拟)',
          `<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:10px">` +
          r.simChain.map((st, idx) => `<span style="padding:4px 10px;background:#f1f5f9;border-radius:8px;font-size:12.5px;font-family:var(--mono)"><small style="color:var(--muted)">t${idx}:</small> <b>${esc(r.names[st])}</b></span>`).join(' → ') +
          `</div><p class="hint" style="margin-top:10px">通过伪随机数模拟系统在各步之间的实际状态跳跃路径，体现无后效性随机游走。</p>`);

      const timeLabels = r.trajectory.map((_, t) => `Step ${t}`);
      const datasets = r.names.map((name, i) => ({
        label: name,
        data: r.trajectory.map(dist => dist[i]),
        borderColor: PALETTE[i % PALETTE.length],
        backgroundColor: alpha(PALETTE[i % PALETTE.length], 0.1),
        borderWidth: 2.5,
        pointRadius: 3,
        tension: 0.2,
      }));
      mkChart('ch_markov', {
        type: 'line',
        data: { labels: timeLabels, datasets },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { position: 'top', labels: { usePointStyle: true, boxWidth: 8 } } },
          scales: { x: { grid: { display: false } }, y: { min: 0, max: 1, grid: { color: '#f0f1f7' }, title: { display: true, text: '状态概率 π_i(t)' } } },
        },
      });
    }, scroll);
    $('#brun').onclick = () => run(true);
    run(false);
  };

  /* -------------------- 13. 线性规划与单纯形法 -------------------- */
  CALC.lp = box => {
    box.innerHTML =
      `<div class="panel"><div class="panel-title"><span class="pt-num">1</span>线性规划模型配置（支持二维几何图解与多维单纯形法）<span class="csv-drop-badge">支持拖拽 CSV</span></div>
        <p class="hint">预设案例含<b>二维双产品排产（带可行域几何多边形图解）</b>与<b>2024 国赛 C 题农作物多地块种植分配（三维单纯形）</b>。</p>
        <div class="ctrl-row" style="margin-bottom:10px">
          <label>优化方向：</label>
          <div class="seg" id="lp_sense"><button class="on" data-v="max">最大化 (Max Z)</button><button data-v="min">最小化 (Min Z)</button></div>
          <button class="btn ghost sm" id="lp_ex2d">${ico('db')}二维排产示例（含可行域图）</button>
          <button class="btn ghost sm" id="lp_ex3d">${ico('db')}2024国赛C题三作物种植示例</button>
          ${csvImportBtnHTML()}
        </div>
        <div class="ctrl-row" style="margin-bottom:10px">
          <label>目标函数系数 $\\mathbf c$（逗号分隔）：</label>
          <input id="lp_c" class="inp" type="text" style="max-width:300px" value="40, 30" />
        </div>
        <label style="font-size:13px;font-weight:600;display:block;margin-bottom:6px">线性约束条件（每行一条，格式：<code>名称 | 系数1, 系数2... | &lt;= 或 &gt;= 或 = | 右端限额 b</code>）：</label>
        <textarea id="lp_cons" class="data-input" spellcheck="false" style="min-height:115px"></textarea>
      </div>` + runBar('执行单纯形法求解');

    const getSense = seg($('#lp_sense'), () => run(false));
    const load2D = () => {
      $('#lp_c').value = '40, 30';
      $('#lp_cons').value = `原料A约束 | 2, 1 | <= | 100
原料B约束 | 1, 2 | <= | 80
工时上限  | 1, 0 | <= | 45`;
    };
    const load3D = () => {
      $('#lp_c').value = '1200, 1600, 1000';
      $('#lp_cons').value = `耕地面积(亩) | 1, 1, 1 | <= | 100
灌溉水(m³)   | 3, 5, 2 | <= | 360
人工工时(h)  | 4, 3, 5 | <= | 350`;
    };
    load2D();
    $('#lp_ex2d').onclick = () => { load2D(); run(true); };
    $('#lp_ex3d').onclick = () => { load3D(); run(true); };

    const out = $('#out');
    const run = scroll => runSafe(out, () => {
      const sense = getSense();
      const c = parseList($('#lp_c').value);
      if (!c.length || c.some(v => !isFinite(v))) throw new Error('请输入有效的目标函数系数');
      const lines = $('#lp_cons').value.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      const constraints = lines.map((line, i) => {
        const parts = line.split('|').map(s => s.trim());
        let name = `约束 ${i + 1}`, aStr = '', op = '<=', bStr = '';
        if (parts.length === 4) { [name, aStr, op, bStr] = parts; }
        else if (parts.length === 3) { [aStr, op, bStr] = parts; }
        else throw new Error(`第 ${i + 1} 行格式有误，请使用“名称 | 系数 | <= | 右端值”格式`);
        const a = parseList(aStr);
        if (a.length !== c.length) throw new Error(`约束「${name}」有 ${a.length} 个系数，与决策变量个数 (${c.length}) 不一致`);
        return { name, a, op, b: Number(bStr) };
      });

      const r = MM.lpSolve(c, constraints, sense);
      const objTex = c.map((v, j) => `${v >= 0 && j > 0 ? '+' : ''}${fmtS(v)}x_${j + 1}`).join(' ');

      out.innerHTML =
        resCard('Step 1 · 全局最优决策方案与目标极值',
          metrics([
            { k: `最优目标值 (${sense.toUpperCase()} Z*)`, v: fmt(r.zOpt, 4), cls: 'accent', s: `单纯形迭代 ${r.iter} 步收敛` },
            ...r.xOpt.map((v, j) => ({ k: `最优决策变量 x_${j + 1}*`, v: fmt(v, 4), s: `目标系数 c_${j + 1} = ${fmtS(c[j])}` })),
          ]) +
          `<div class="formula-box">$$\\${sense}\\ Z = ${objTex} \\quad\\Longrightarrow\\quad Z^* = ${texNum(r.zOpt, 4)}$$</div>`) +
        resCard('Step 2 · 资源约束松弛量 (Slack) 与瓶颈紧约束诊断',
          rawTable(
            ['约束名称', '最优左端消耗值 (LHS)', '符号', '资源上限/右端值 (RHS)', '松弛/剩余量 (Slack)', '约束状态诊断'],
            r.conAnalysis.map(ca => [
              esc(ca.name),
              fmt(ca.lhs, 4),
              ca.op,
              fmt(ca.rhs, 4),
              `<b>${fmt(ca.slack, 4)}</b>`,
              ca.binding
                ? '<span style="color:#e11d48;font-weight:700">★ 紧约束（资源完全耗尽，属核心瓶颈）</span>'
                : `<span style="color:#0d9488">非紧约束（尚余 ${fmt(ca.slack, 2)} 单位富余）</span>`,
            ])
          ) +
          `<p class="hint">竞赛论文解读建议：紧约束（Slack = 0）是限制目标进一步提升的瓶颈资源；若需扩容，应优先增加紧约束对应的资源配额。</p>`) +
        (r.n === 2 && r.polygon.length >= 3
          ? resCard('Step 3 · 二维可行域多边形与极点寻优可视化',
              chartBox('ch_lp', 350) +
              rawTable(
                ['可行域极点 (Vertex)', '坐标 (x₁, x₂)', '目标函数值 Z(x₁, x₂)', '是否全局最优'],
                r.allVertices.map((pt, idx) => [
                  `极点 V${idx + 1}`,
                  `(${fmt(pt.x, 3)}, ${fmt(pt.y, 3)})`,
                  `<b>${fmt(pt.z, 4)}</b>`,
                  Math.hypot(pt.x - r.xOpt[0], pt.y - r.xOpt[1]) < 1e-3 ? '<span class="rk r1">★ 最优极点</span>' : '可行极点',
                ])
              ))
          : '') +
        (r.history.length
          ? resCard('Step 4 · 单纯形表基变量旋转迭代轨迹',
              rawTable(
                ['迭代步', '进基列', '出基行', '当前基本可行解 x', '当前目标函数值 Z'],
                r.history.map(h => [
                  `Step ${h.iter}`,
                  `列 ${h.enter}`,
                  `行 ${h.leave}`,
                  `(${h.x.map(v => fmt(v, 3)).join(', ')})`,
                  `<b>${fmt(h.z, 4)}</b>`,
                ])
              ))
          : '');

      if (r.n === 2 && r.polygon.length >= 3) {
        const polyPts = [...r.polygon, r.polygon[0]];
        mkChart('ch_lp', {
          type: 'scatter',
          data: {
            datasets: [
              {
                label: '可行域边界与极点',
                data: polyPts,
                showLine: true,
                fill: true,
                backgroundColor: alpha('#2563eb', 0.14),
                borderColor: '#2563eb',
                borderWidth: 2.5,
                pointRadius: 5,
                pointBackgroundColor: '#2563eb',
              },
              {
                label: `全局最优解 (${fmt(r.xOpt[0], 2)}, ${fmt(r.xOpt[1], 2)})`,
                data: [{ x: r.xOpt[0], y: r.xOpt[1] }],
                pointRadius: 9,
                pointStyle: 'star',
                backgroundColor: '#e11d48',
                borderColor: '#e11d48',
              },
            ],
          },
          options: baseScatterOpts('决策变量 x₁', '决策变量 x₂'),
        });
      }
    }, scroll);
    $('#brun').onclick = () => run(true);
    run(false);
  };

  /* -------------------- 13b. 整数规划与 0-1 规划（线性规划子分类） -------------------- */
  CALC.ilp = box => {
    box.innerHTML =
      `<div class="panel"><div class="panel-title"><span class="pt-num">1</span>整数规划 / 0-1 规划模型配置（分支定界法 Branch &amp; Bound）<span class="csv-drop-badge">支持拖拽 CSV</span></div>
        <p class="hint">属于<b>线性规划的核心子分类</b>：支持<b>纯整数规划 (IP)</b>、<b>0-1 二元规划 (BIP)</b> 与<b>混合整数规划 (MILP)</b>，自动对比 LP 松弛解、直接四舍五入陷阱与分支定界搜索树。</p>
        <div class="ctrl-row" style="margin-bottom:10px">
          <label>优化方向：</label>
          <div class="seg" id="ilp_sense"><button class="on" data-v="max">最大化 (Max Z)</button><button data-v="min">最小化 (Min Z)</button></div>
          <label>变量类型模式：</label>
          <div class="seg" id="ilp_vmode">
            <button class="on" data-v="I">纯整数 (x∈ℤ≥0)</button>
            <button data-v="B">0-1 规划 (x∈{0,1})</button>
            <button data-v="M">混合整数 (MILP)</button>
          </div>
        </div>
        <div class="ctrl-row" style="margin-bottom:10px">
          <button class="btn ghost sm" id="ilp_ex_ip">${ico('db')}示例1：二维纯整数排产（含整点网格图）</button>
          <button class="btn ghost sm" id="ilp_ex_bin">${ico('db')}示例2：0-1 应急选址/投资组合（5变量）</button>
          <button class="btn ghost sm" id="ilp_ex_milp">${ico('db')}示例3：混合整数规划 MILP（设备+产量）</button>
          ${csvImportBtnHTML()}
        </div>
        <div class="ctrl-row" style="margin-bottom:10px">
          <label>目标函数系数 $\\mathbf c$（逗号分隔）：</label>
          <input id="ilp_c" class="inp" type="text" style="max-width:260px" value="40, 90" />
          <span id="ilp_custom_wrap" style="display:none;align-items:center;gap:6px">
            <label>各变量类型（I=整数, B=0-1, C=连续）：</label>
            <input id="ilp_vtypes" class="inp" type="text" style="max-width:160px" value="I, I, C" />
          </span>
        </div>
        <label style="font-size:13px;font-weight:600;display:block;margin-bottom:6px">线性约束条件（每行一条，格式：<code>名称 | 系数1, 系数2... | &lt;= 或 &gt;= 或 = | 右端限额 b</code>）：</label>
        <textarea id="ilp_cons" class="data-input" spellcheck="false" style="min-height:110px"></textarea>
      </div>` + runBar('执行分支定界法求解');

    const getSense = seg($('#ilp_sense'), () => run(false));
    const getVMode = seg($('#ilp_vmode'), v => {
      $('#ilp_custom_wrap').style.display = v === 'M' ? 'inline-flex' : 'none';
      run(false);
    });
    const setSeg = (el, val) => {
      $$('button', el).forEach(b => b.classList.toggle('on', b.dataset.v === val));
    };

    const loadIP = () => {
      setSeg($('#ilp_sense'), 'max');
      setSeg($('#ilp_vmode'), 'I');
      $('#ilp_custom_wrap').style.display = 'none';
      $('#ilp_c').value = '40, 90';
      $('#ilp_cons').value = `特种钢材定额(吨) | 9, 7 | <= | 56
精密工时上限(h)  | 7, 20 | <= | 70`;
    };
    const loadBin = () => {
      setSeg($('#ilp_sense'), 'max');
      setSeg($('#ilp_vmode'), 'B');
      $('#ilp_custom_wrap').style.display = 'none';
      $('#ilp_c').value = '25, 32, 18, 28, 22';
      $('#ilp_cons').value = `建设资金预算(百万) | 12, 18, 9, 15, 11 | <= | 40
运维人员定额(人)   | 5, 7, 4, 6, 5 | <= | 18
区域至少选址2处    | 1, 1, 1, 1, 1 | >= | 2`;
    };
    const loadMILP = () => {
      setSeg($('#ilp_sense'), 'max');
      setSeg($('#ilp_vmode'), 'M');
      $('#ilp_custom_wrap').style.display = 'inline-flex';
      $('#ilp_c').value = '1200, 1600, 950';
      $('#ilp_vtypes').value = 'I, I, C';
      $('#ilp_cons').value = `耕地总面积(亩) | 1, 1, 1 | <= | 100
灌溉水配额(m³) | 3, 5, 2 | <= | 365
人工工时上限   | 4, 3, 5 | <= | 355`;
    };

    loadIP();
    $('#ilp_ex_ip').onclick = () => { loadIP(); run(true); };
    $('#ilp_ex_bin').onclick = () => { loadBin(); run(true); };
    $('#ilp_ex_milp').onclick = () => { loadMILP(); run(true); };

    const out = $('#out');
    const run = scroll => runSafe(out, () => {
      const sense = getSense();
      const vmode = getVMode();
      const c = parseList($('#ilp_c').value);
      if (!c.length || c.some(v => !isFinite(v))) throw new Error('请输入有效的目标函数系数');

      let varTypes = vmode;
      if (vmode === 'M') {
        const rawTypes = $('#ilp_vtypes').value.split(/[\s,，;；]+/).filter(Boolean).map(s => s.toUpperCase());
        if (rawTypes.length !== c.length) throw new Error(`混合整数模式下，变量类型个数 (${rawTypes.length}) 需与变量个数 (${c.length}) 一致`);
        varTypes = rawTypes.map(t => (t === 'B' || t === 'C' ? t : 'I'));
      }

      const lines = $('#ilp_cons').value.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      const constraints = lines.map((line, i) => {
        const parts = line.split('|').map(s => s.trim());
        let name = `约束 ${i + 1}`, aStr = '', op = '<=', bStr = '';
        if (parts.length === 4) { [name, aStr, op, bStr] = parts; }
        else if (parts.length === 3) { [aStr, op, bStr] = parts; }
        else throw new Error(`第 ${i + 1} 行格式有误，请使用“名称 | 系数 | <= | 右端值”格式`);
        const a = parseList(aStr);
        if (a.length !== c.length) throw new Error(`约束「${name}」有 ${a.length} 个系数，与决策变量个数 (${c.length}) 不一致`);
        return { name, a, op, b: Number(bStr) };
      });

      const r = MM.ilpSolve(c, constraints, sense, varTypes);
      const typeLabel = t => (t === 'B' ? '0-1变量 {0,1}' : t === 'C' ? '连续实数 ℝ≥0' : '整数变量 ℤ≥0');

      out.innerHTML =
        resCard('Step 1 · 整数规划全局最优解 vs. LP 松弛解与四舍五入对比',
          metrics([
            { k: `整数规划最优值 (${sense.toUpperCase()} Z*)`, v: fmt(r.zOpt, 4), cls: 'accent', s: `搜索 ${r.nodesExplored} 个分支定界节点` },
            { k: 'LP 连续松弛最优值 Z_LP', v: fmt(r.lpRelax.zOpt, 4), s: `松弛解 (${r.lpRelax.xOpt.map(v => fmtS(v, 2)).join(', ')})` },
            { k: '整点间隙 (Integrality Gap)', v: fmt(r.gap * 100, 2) + '%', s: '|Z_LP − Z*| / |Z*|' },
            ...r.xOpt.map((v, j) => ({
              k: `最优决策 x_${j + 1}*`,
              v: r.varTypes[j] === 'C' ? fmt(v, 4) : String(Math.round(v)),
              cls: 'ok',
              s: `${typeLabel(r.varTypes[j])} (LP=${fmtS(r.lpRelax.xOpt[j], 3)})`,
            })),
          ]) +
          `<div class="callout mini ${r.roundedFeasible ? 'info' : 'warn'}" style="margin-top:12px">
            <b>⚠️ 为什么不能直接把 LP 松弛解四舍五入？</b>
            <div>LP 连续松弛解为 $\\mathbf x^{\\text{LP}} = (${r.lpRelax.xOpt.map(v => fmtS(v, 3)).join(', ')})$，若直接简单四舍五入得 $\\mathbf x^{\\text{round}} = (${r.xRounded.map(v => fmtS(v, 2)).join(', ')})$：
            ${r.roundedFeasible
              ? `虽然该取整点满足约束（目标值 $Z=${fmtS(r.zRounded, 2)}$），但分支定界法求得的全局最优整数解为 $\\mathbf x^*=(${r.xOpt.map(v => fmtS(v, 2)).join(', ')})$（目标值 $Z^*=${fmtS(r.zOpt, 2)}$）。`
              : `<b style="color:#dc2626">直接四舍五入点违反了资源约束（属于不可行解）！</b>必须通过分支定界法在可行域内部寻找真正的最优整点 $\\mathbf x^*=(${r.xOpt.map(v => fmtS(v, 2)).join(', ')})$（$Z^*=${fmtS(r.zOpt, 2)}$）。`}</div>
          </div>`) +
        (r.n === 2 && r.polygon && r.polygon.length >= 3
          ? resCard('Step 2 · 二维连续松弛可行域与离散可行整点网格 (Lattice Points) 图解',
              chartBox('ch_ilp', 360) +
              `<p class="hint">蓝色多边形为 LP 连续松弛可行域，圆点为所有满足约束的<b>离散可行整点 $(x_1, x_2)\\in\\mathbb{Z}_{\\ge 0}^2$（共 ${r.latticePoints.length} 个整点）</b>；橙色空心圆为 LP 连续松弛最优解，红色五角星为整数规划全局最优解。</p>`)
          : '') +
        resCard(`Step ${r.n === 2 && r.polygon && r.polygon.length >= 3 ? 3 : 2} · 分支定界法 (Branch & Bound) 搜索树节点迭代过程表`,
          rawTable(
            ['节点编号', '父节点', '树深度', '新增分支约束', '子问题 LP 松弛解 x', '松弛目标值 Z_LP', '节点剪枝/分支状态'],
            r.treeNodes.map(nd => [
              `Node #${nd.id}`,
              nd.parentId === 0 ? '—' : `#${nd.parentId}`,
              `L${nd.depth}`,
              `<code>${esc(nd.branchRule)}</code>`,
              nd.x ? `(${nd.x.map(v => fmtS(v, 3)).join(', ')})` : '无可行解',
              nd.z !== null ? `<b>${fmt(nd.z, 3)}</b>` : '—',
              nd.status === 'integer_best'
                ? `<span style="color:#16a34a;font-weight:700">${esc(nd.statusText)}</span>`
                : nd.status === 'infeasible' || nd.status === 'pruned_bound'
                ? `<span style="color:#dc2626">${esc(nd.statusText)}</span>`
                : `<span style="color:#2563eb">${esc(nd.statusText)}</span>`,
            ])
          )) +
        resCard(`Step ${r.n === 2 && r.polygon && r.polygon.length >= 3 ? 4 : 3} · 最优整数方案下的资源约束消耗与余量分析`,
          rawTable(
            ['约束名称', '最优整点消耗值 (LHS)', '符号', '资源限额 (RHS)', '资源剩余量 (Slack)', '说明'],
            r.conAnalysis.map(ca => [
              esc(ca.name),
              fmt(ca.lhs, 4),
              ca.op,
              fmt(ca.rhs, 4),
              `<b>${fmt(ca.slack, 4)}</b>`,
              ca.binding
                ? '<span style="color:#e11d48;font-weight:700">★ 紧约束（完全用尽）</span>'
                : `<span style="color:#0d9488">因整数不可分割性，剩余 ${fmt(ca.slack, 2)} 单位</span>`,
            ])
          ));

      if (r.n === 2 && r.polygon && r.polygon.length >= 3) {
        const polyPts = [...r.polygon, r.polygon[0]];
        mkChart('ch_ilp', {
          type: 'scatter',
          data: {
            datasets: [
              {
                label: `整数规划最优解 (${r.xOpt[0]}, ${r.xOpt[1]}), Z*=${fmtS(r.zOpt, 1)}`,
                data: [{ x: r.xOpt[0], y: r.xOpt[1] }],
                pointRadius: 10,
                pointStyle: 'star',
                backgroundColor: '#e11d48',
                borderColor: '#e11d48',
              },
              {
                label: `LP 连续松弛最优解 (${fmt(r.lpRelax.xOpt[0], 2)}, ${fmt(r.lpRelax.xOpt[1], 2)}), Z_LP=${fmtS(r.lpRelax.zOpt, 1)}`,
                data: [{ x: r.lpRelax.xOpt[0], y: r.lpRelax.xOpt[1] }],
                pointRadius: 7,
                backgroundColor: 'rgba(249, 115, 22, 0.25)',
                borderColor: '#f97316',
                borderWidth: 2.5,
              },
              {
                label: `可行整点网格 (${r.latticePoints.length} 个整点)`,
                data: r.latticePoints,
                pointRadius: 4.5,
                backgroundColor: '#0284c7',
                borderColor: '#fff',
                borderWidth: 1,
              },
              {
                label: 'LP 连续松弛可行域边界',
                data: polyPts,
                showLine: true,
                fill: true,
                backgroundColor: alpha('#2563eb', 0.11),
                borderColor: '#2563eb',
                borderDash: [5, 4],
                borderWidth: 2,
                pointRadius: 3,
              },
            ],
          },
          options: baseScatterOpts('整数决策变量 x₁', '整数决策变量 x₂'),
        });
      }
    }, scroll);
    $('#brun').onclick = () => run(true);
    run(false);
  };

  /* -------------------- 14. 模拟退火智能优化 (SA - TSP) -------------------- */
  CALC.sa_pso = box => {
    box.innerHTML =
      inputPanel(1, '输入巡检站点/城市二维坐标（每行一个节点：名称 X坐标 Y坐标）',
        '模拟退火算法 + 2-opt 邻域算子将自动搜索访问所有节点并返回起点的最短闭合回路（TSP）。') +
      `<div class="panel"><div class="panel-title"><span class="pt-num">2</span>退火热力学控制参数</div>
        <div class="ctrl-row">
          <label>初始温度 $T_0$：</label>
          <input id="sa_t0" class="inp sm" type="number" value="1000" step="100" />
          <label>降温系数 $\\alpha$：</label>
          <input id="sa_alpha" class="inp sm" type="number" value="0.96" step="0.01" min="0.80" max="0.99" />
          <label>单温 Markov 链长 $L$：</label>
          <input id="sa_l" class="inp sm" type="number" value="120" step="20" />
        </div>
      </div>` + runBar('启动模拟退火寻优');

    const inp = setupInput({
      rowUnit: '个站点', colUnit: '维坐标',
      parse: { rowPrefix: '站点', colNames: ['X坐标', 'Y坐标'] },
      example: () => `站点 X坐标 Y坐标
基地O 50 50
站点A 18 82
站点B 86 24
站点C 35 90
站点D 28 16
站点E 78 88
站点F 12 38
站点G 92 62
站点H 46 28
站点I 32 58
站点J 62 12
站点K 68 48`,
    });

    const out = $('#out');
    const run = scroll => runSafe(out, () => {
      const { data, rowNames } = inp.get();
      if (data[0].length < 2) throw new Error('请提供每个节点的二维坐标 (X, Y)');
      const coords = data.map(r => [r[0], r[1]]);
      const T0 = Math.max(10, Number($('#sa_t0').value) || 1000);
      const alphaVal = Math.min(0.995, Math.max(0.8, Number($('#sa_alpha').value) || 0.96));
      const L = Math.max(20, Math.min(500, parseInt($('#sa_l').value) || 120));

      const r = MM.saTsp(coords, rowNames, { T0, alpha: alphaVal, markovLen: L });
      const routeNames = [...r.bestTour.map(i => r.names[i]), r.names[r.bestTour[0]]];

      out.innerHTML =
        resCard('Step 1 · 模拟退火全局寻优结果汇总',
          metrics([
            { k: '最优闭合总里程 L*', v: fmt(r.bestCost, 4), cls: 'accent', s: '全局最优回路长度' },
            { k: '初始顺序总里程 L₀', v: fmt(r.initCost, 4), s: '未优化初始顺序' },
            { k: '路径缩短优化率', v: fmt(r.improvement, 2) + '%', cls: 'accent', s: `节省里程 ${fmt(r.initCost - r.bestCost, 2)}` },
            { k: 'Metropolis 接受劣解次数', v: String(r.acceptedWorse), s: `总扰动 ${r.totalTrials} 次 / 降温 ${r.steps} 轮` },
          ]) +
          `<div style="margin-top:12px;padding:12px 14px;background:#f8fafc;border-radius:10px;border:1px solid var(--border);font-size:13px">
            <b>最优闭环访问序列：</b><br/>
            <span style="font-family:var(--mono);color:var(--primary)">${routeNames.map(esc).join(' → ')}</span>
          </div>`) +
        resCard('Step 2 · 二维空间路径规划图（最优回路 vs 初始回路）与退火收敛曲线',
          `<div class="two-col">${chartBox('ch_sa_route', 340)}${chartBox('ch_sa_conv', 340)}</div>`) +
        resCard('Step 3 · 最优回路各路段明细表',
          rawTable(
            ['路段序号', '起点名称', '终点名称', '起点坐标', '终点坐标', '路段欧氏距离', '累计里程'],
            r.bestTour.map((u, idx) => {
              const v = r.bestTour[(idx + 1) % r.n];
              const d = r.distMat[u][v];
              const cum = r.bestTour.slice(0, idx + 1).reduce((s, node, k) => s + r.distMat[node][r.bestTour[(k + 1) % r.n]], 0);
              return [
                `第 ${idx + 1} 段`,
                `<b>${esc(r.names[u])}</b>`,
                `<b>${esc(r.names[v])}</b>`,
                `(${fmtS(coords[u][0])}, ${fmtS(coords[u][1])})`,
                `(${fmtS(coords[v][0])}, ${fmtS(coords[v][1])})`,
                fmt(d, 4),
                `<b>${fmt(cum, 4)}</b>`,
              ];
            })
          ));

      const bestPts = [...r.bestTour, r.bestTour[0]].map(i => ({ x: coords[i][0], y: coords[i][1] }));
      const initPts = [...r.initTour, r.initTour[0]].map(i => ({ x: coords[i][0], y: coords[i][1] }));

      mkChart('ch_sa_route', {
        type: 'scatter',
        data: {
          datasets: [
            {
              label: `SA 最优回路 (L*=${fmt(r.bestCost, 1)})`,
              data: bestPts,
              showLine: true,
              borderColor: '#7c3aed',
              backgroundColor: '#7c3aed',
              borderWidth: 2.6,
              pointRadius: 6,
            },
            {
              label: `初始顺序路径 (L₀=${fmt(r.initCost, 1)})`,
              data: initPts,
              showLine: true,
              borderColor: 'rgba(148,163,184,0.55)',
              borderDash: [5, 5],
              borderWidth: 1.5,
              pointRadius: 0,
            },
          ],
        },
        options: baseScatterOpts('X 坐标', 'Y 坐标'),
      });

      mkChart('ch_sa_conv', {
        type: 'line',
        data: {
          labels: r.history.map(h => h.step),
          datasets: [
            {
              label: '历史最优里程 Best Cost',
              data: r.history.map(h => h.bestCost),
              borderColor: '#ec4899',
              borderWidth: 2.5,
              pointRadius: 0,
              tension: 0.15,
            },
            {
              label: '当前状态里程 Current Cost (含跳出局部最优波动)',
              data: r.history.map(h => h.curCost),
              borderColor: 'rgba(124,58,237,0.35)',
              borderWidth: 1.4,
              pointRadius: 0,
            },
          ],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { position: 'top', labels: { usePointStyle: true, boxWidth: 8 } } },
          scales: {
            x: { title: { display: true, text: '退火降温迭代步 k' }, grid: { display: false } },
            y: { title: { display: true, text: '回路总里程' }, grid: { color: '#f0f1f7' } },
          },
        },
      });
    }, scroll);
    $('#brun').onclick = () => run(true);
    run(false);
  };

  /* -------------------- 15. 主成分分析 (PCA) -------------------- */
  CALC.pca = box => {
    box.innerHTML =
      inputPanel(1, '输入多指标样本数据矩阵（行为样本对象，列为各评价/特征指标）',
        '系统将自动执行 Z-Score 标准化、相关系数矩阵分解、碎石图绘制、因子载荷计算与主成分综合得分排序。') +
      `<div class="panel"><div class="panel-title"><span class="pt-num">2</span>累计方差贡献率保留阈值</div>
        <div class="ctrl-row">
          <label>累计方差贡献率阈值：</label>
          <select id="pca_th" class="sel">
            <option value="0.80">≥ 80%</option>
            <option value="0.85" selected>≥ 85%（竞赛常用标准）</option>
            <option value="0.90">≥ 90%</option>
          </select>
        </div>
      </div>` + runBar('执行主成分分析 (PCA)');

    const inp = setupInput({
      rowUnit: '个样本', colUnit: '项指标',
      parse: { rowPrefix: '地区', colPrefix: '指标' },
      example: () => `地区 GDP总量 研发投入 专利授权 高新企业数 绿地覆盖率
城市A 980 96.2 510 22.4 94
城市B 850 92.5 420 18.2 88
城市C 910 94.1 465 20.5 91
城市D 760 89.4 380 16.8 85
城市E 620 85.0 310 14.5 79
城市F 510 81.2 240 12.0 75
城市G 430 76.8 195 10.1 71
城市H 390 74.0 170 9.2 68`,
    });

    const out = $('#out');
    const run = scroll => runSafe(out, () => {
      const { data, rowNames, colNames } = inp.get();
      const th = Number($('#pca_th').value) || 0.85;
      const r = MM.pca(data, th);
      const pcNames = Array.from({ length: r.m }, (_, i) => `PC${i + 1}`);

      out.innerHTML =
        resCard('Step 1 · 特征值与主成分方差贡献率表',
          metrics([
            { k: '保留主成分个数 k', v: `${r.k} 个`, cls: 'accent', s: `原始维度 ${r.m} 维 → 降为 ${r.k} 维` },
            { k: `前 ${r.k} 主成分累计方差贡献率`, v: fmt(r.cumRatio[r.k - 1] * 100, 2) + '%', cls: 'accent', s: `阈值要求 ≥ ${(th * 100).toFixed(0)}%` },
            { k: '第一主成分 PC1 贡献率', v: fmt(r.varRatio[0] * 100, 2) + '%', s: `特征值 λ₁ = ${fmt(r.eigVals[0], 4)}` },
            { k: '第二主成分 PC2 贡献率', v: fmt(r.varRatio[1] * 100, 2) + '%', s: `特征值 λ₂ = ${fmt(r.eigVals[1], 4)}` },
          ]) +
          rawTable(
            ['主成分', '特征值 λ_i', '方差贡献率 (%)', '累计方差贡献率 (%)', '是否保留'],
            r.eigVals.map((v, i) => [
              `<b>PC${i + 1}</b>`,
              fmt(v, 4),
              fmt(r.varRatio[i] * 100, 2) + '%',
              `<b>${fmt(r.cumRatio[i] * 100, 2)}%</b>`,
              i < r.k ? '<span class="rk r1">保留</span>' : '<span style="color:var(--muted)">舍去</span>',
            ])
          )) +
        resCard('Step 2 · 碎石图 (Scree Plot) 与 PC1-PC2 二维投影散点图',
          `<div class="two-col">${chartBox('ch_pca_scree', 310)}${chartBox('ch_pca_biplot', 310)}</div>`) +
        resCard('Step 3 · 因子载荷矩阵 (Factor Loadings) 与主成分特征向量',
          tableHTML(r.loadings, colNames, pcNames, 4, '原始指标 \\ 主成分') +
          `<p class="hint">因子载荷绝对值越接近 1，说明该主成分对该原始指标的代表性越强，可据此在论文中为各主成分命名。</p>`) +
        resCard('Step 4 · 主成分得分与综合评价排名',
          rankTable(
            rowNames,
            Array.from({ length: r.k }, (_, idx) => ({ n: `PC${idx + 1} 得分`, v: r.pcScores.map(row => row[idx]) })),
            r.compScores,
            r.rank,
            'PCA 综合得分',
            '样本对象'
          ));

      mkChart('ch_pca_scree', {
        type: 'bar',
        data: {
          labels: pcNames,
          datasets: [
            {
              type: 'line',
              label: '累计贡献率 (%)',
              data: r.cumRatio.map(v => v * 100),
              borderColor: '#f97316',
              backgroundColor: '#f97316',
              borderWidth: 2.5,
              yAxisID: 'y1',
            },
            {
              type: 'bar',
              label: '特征值 λ',
              data: r.eigVals,
              backgroundColor: gradFill(false),
              borderRadius: 6,
              yAxisID: 'y',
            },
          ],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          scales: {
            y: { position: 'left', beginAtZero: true, title: { display: true, text: '特征值 λ' } },
            y1: { position: 'right', min: 0, max: 105, grid: { drawOnChartArea: false }, title: { display: true, text: '累计贡献率 (%)' } },
          },
        },
      });

      mkChart('ch_pca_biplot', {
        type: 'scatter',
        data: {
          datasets: [
            {
              label: '样本在 (PC1, PC2) 空间投影',
              data: r.pcScores.map((s, i) => ({ x: s[0], y: s[1], name: rowNames[i] })),
              backgroundColor: '#0d9488',
              pointRadius: 6,
            },
          ],
        },
        options: {
          ...baseScatterOpts(`PC1 (${fmt(r.varRatio[0] * 100, 1)}%)`, `PC2 (${fmt(r.varRatio[1] * 100, 1)}%)`),
          plugins: {
            tooltip: {
              callbacks: {
                label: c => ` ${c.raw.name}: (PC1=${fmt(c.raw.x, 2)}, PC2=${fmt(c.raw.y, 2)})`,
              },
            },
          },
        },
      });
    }, scroll);
    $('#brun').onclick = () => run(true);
    run(false);
  };

  /* -------------------- 16. K-Means++ 聚类与轮廓系数 -------------------- */
  CALC.kmeans = box => {
    box.innerHTML =
      inputPanel(1, '输入待聚类样本特征矩阵（行为样本对象，列为特征指标）',
        '系统将自动运行 K-Means++ 聚类，并绘制 K=2~6 的肘部法则 (SSE) 与轮廓系数 (Silhouette) 曲线辅助确定最优分类数。') +
      `<div class="panel"><div class="panel-title"><span class="pt-num">2</span>聚类簇数 $K$ 与标准化设置</div>
        <div class="ctrl-row">
          <label>指定聚类簇数 $K$：</label>
          <select id="km_k" class="sel">
            <option value="2">K = 2 类</option>
            <option value="3" selected>K = 3 类（推荐）</option>
            <option value="4">K = 4 类</option>
            <option value="5">K = 5 类</option>
          </select>
          <label style="margin-left:12px">特征预处理：</label>
          <select id="km_std" class="sel">
            <option value="1" selected>Z-Score 标准化（消除量纲影响）</option>
            <option value="0">保持原始数值直接计算距离</option>
          </select>
        </div>
      </div>` + runBar('执行 K-Means++ 聚类与检验');

    const inp = setupInput({
      rowUnit: '个样本', colUnit: '维特征',
      parse: { rowPrefix: '样本', colPrefix: '特征' },
      example: () => `文物样本 二氧化硅(SiO2) 氧化铅(PbO) 氧化钾(K2O) 氧化钡(BaO)
高钾样本1 69.33 0.00 9.99 0.00
高钾样本2 65.88 0.00 9.67 0.00
高钾样本3 61.71 0.00 12.37 0.00
高钾样本4 67.65 0.00 7.37 0.00
铅钡亚类A1 36.28 47.43 0.00 10.35
铅钡亚类A2 33.59 49.12 0.15 11.20
铅钡亚类A3 39.41 44.85 0.20 9.80
铅钡亚类A4 35.10 46.20 0.00 10.90
铅钡亚类B1 53.79 25.39 0.32 4.12
铅钡亚类B2 55.42 23.80 0.45 3.85
铅钡亚类B3 50.61 27.15 0.18 4.60
铅钡亚类B4 52.30 26.05 0.25 4.30`,
    });

    const out = $('#out');
    const run = scroll => runSafe(out, () => {
      const { data, rowNames, colNames } = inp.get();
      const K = parseInt($('#km_k').value) || 3;
      const stdFlag = $('#km_std').value === '1';
      const r = MM.kmeans(data, K, stdFlag);

      const bestElbowK = r.elbow.slice().sort((a, b) => b.silhouette - a.silhouette)[0];

      out.innerHTML =
        resCard('Step 1 · 聚类有效性核心评价指标（轮廓系数 & 肘部 SSE）',
          metrics([
            { k: '平均轮廓系数 (Silhouette)', v: fmt(r.avgSilhouette, 4), cls: 'accent', s: r.avgSilhouette >= 0.5 ? '聚类结构清晰合理 (≥0.5)' : '簇间存在一定重叠' },
            { k: '簇内误差平方和 (SSE)', v: fmt(r.sse, 4), s: `迭代 ${r.iter} 次完全收敛` },
            { k: '轮廓系数最优推荐簇数', v: `K = ${bestElbowK.k}`, cls: 'accent', s: `对应最高轮廓系数 ${fmt(bestElbowK.silhouette, 4)}` },
            { k: '各簇样本分布', v: r.clusterStats.map(c => `${c.count}个`).join(' / '), s: `共 ${r.n} 个样本划分为 ${r.K} 簇` },
          ])) +
        resCard('Step 2 · 聚类散点投影图（含簇质心）与 K 值肘部法则/轮廓系数对比图',
          `<div class="two-col">${chartBox('ch_km_scatter', 330)}${chartBox('ch_km_elbow', 330)}</div>`) +
        resCard('Step 3 · 各簇质心画像表（还原至原始指标量纲）',
          rawTable(
            ['类别簇', '样本数量 (占比)', '簇内平均轮廓系数', ...colNames.map(c => `${esc(c)} (均值中心)`)],
            r.clusterStats.map(cs => [
              `<span class="rk r${cs.cluster <= 3 ? cs.cluster : ''}">簇 C${cs.cluster}</span>`,
              `<b>${cs.count}</b> (${fmt(cs.ratio * 100, 1)}%)`,
              fmt(cs.avgSil, 4),
              ...cs.centroid.map(v => `<b>${fmt(v, 3)}</b>`),
            ])
          )) +
        resCard('Step 4 · 样本归属类别与个体轮廓系数明细',
          rawTable(
            ['样本名称', '所属聚类簇', '距所属簇质心距离', '样本轮廓系数 s(i)', ...colNames.map(esc)],
            rowNames.map((nm, i) => [
              esc(nm),
              `<span class="rk r${r.labels[i] + 1 <= 3 ? r.labels[i] + 1 : ''}">簇 C${r.labels[i] + 1}</span>`,
              fmt(r.distToCenter[i], 4),
              `<b>${fmt(r.silhouettes[i], 4)}</b>`,
              ...data[i].map(v => fmtS(v)),
            ])
          ));

      // 绘制聚类散点图
      const clusterDatasets = Array.from({ length: r.K }, (_, c) => ({
        label: `簇 C${c + 1} (n=${r.clusterStats[c].count})`,
        data: r.coords2D
          .map((pt, i) => ({ x: pt[0], y: pt[1], name: rowNames[i], c: r.labels[i] }))
          .filter(pt => pt.c === c),
        backgroundColor: PALETTE[c % PALETTE.length],
        pointRadius: 6,
      }));
      clusterDatasets.push({
        label: '聚类质心 (Centroids)',
        data: r.centroids2D.map((pt, c) => ({ x: pt[0], y: pt[1], name: `质心 C${c + 1}` })),
        backgroundColor: '#111827',
        borderColor: '#ffffff',
        borderWidth: 2,
        pointStyle: 'rectRot',
        pointRadius: 9,
      });

      mkChart('ch_km_scatter', {
        type: 'scatter',
        data: { datasets: clusterDatasets },
        options: baseScatterOpts(r.axisNames[0], r.axisNames[1]),
      });

      mkChart('ch_km_elbow', {
        type: 'line',
        data: {
          labels: r.elbow.map(e => `K = ${e.k}`),
          datasets: [
            {
              label: '簇内误差平方和 SSE (肘部法则)',
              data: r.elbow.map(e => e.sse),
              borderColor: '#f59e0b',
              backgroundColor: '#f59e0b',
              borderWidth: 2.5,
              yAxisID: 'y',
            },
            {
              label: '平均轮廓系数 Silhouette (越大越优)',
              data: r.elbow.map(e => e.silhouette),
              borderColor: '#2563eb',
              backgroundColor: '#2563eb',
              borderDash: [5, 4],
              borderWidth: 2.5,
              yAxisID: 'y1',
            },
          ],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          scales: {
            y: { position: 'left', title: { display: true, text: 'SSE (簇内误差平方和)' } },
            y1: { position: 'right', min: 0, max: 1, grid: { drawOnChartArea: false }, title: { display: true, text: '轮廓系数 Silhouette' } },
          },
        },
      });
    }, scroll);
    $('#brun').onclick = () => run(true);
    run(false);
  };

  /* -------------------- 17. 常微分方程动力学 (ODE RK4) -------------------- */
  CALC.ode_sir = box => {
    box.innerHTML =
      `<div class="panel"><div class="panel-title"><span class="pt-num">1</span>选择连续微分方程动力学模型（四阶龙格-库塔 RK4 求解）</div>
        <div class="seg" id="ode_type" style="margin-bottom:14px">
          <button class="on" data-v="seir">SEIR 传染病/舆论传播模型</button>
          <button data-v="sir">SIR 经典仓室模型</button>
          <button data-v="lv">Lotka-Volterra 捕食者-猎物生态模型</button>
        </div>
        <div id="ode_params"></div>
      </div>` + runBar('执行四阶龙格-库塔 (RK4) 仿真');

    const pBox = $('#ode_params');
    const renderParams = mode => {
      if (mode === 'seir' || mode === 'sir') {
        pBox.innerHTML = `<div class="ctrl-row" style="flex-wrap:wrap;gap:12px">
          <label>总人口 $N$：<input id="ode_N" class="inp sm" type="number" value="10000" /></label>
          <label>有效传染率 $\\beta$：<input id="ode_beta" class="inp sm" type="number" value="0.60" step="0.05" /></label>
          ${mode === 'seir' ? `<label>潜伏转阳率 $\\sigma$：<input id="ode_sigma" class="inp sm" type="number" value="0.20" step="0.05" /></label>` : ''}
          <label>康复移除率 $\\gamma$：<input id="ode_gamma" class="inp sm" type="number" value="0.10" step="0.02" /></label>
          <label>初始感染 $I_0$：<input id="ode_I0" class="inp sm" type="number" value="10" /></label>
          ${mode === 'seir' ? `<label>初始潜伏 $E_0$：<input id="ode_E0" class="inp sm" type="number" value="20" /></label>` : ''}
          <label>仿真天数 $T_{\\max}$：<input id="ode_tmax" class="inp sm" type="number" value="120" /></label>
        </div>`;
      } else {
        pBox.innerHTML = `<div class="ctrl-row" style="flex-wrap:wrap;gap:12px">
          <label>猎物增长率 $\\alpha$：<input id="lv_a" class="inp sm" type="number" value="0.60" step="0.05" /></label>
          <label>被捕食率 $\\beta$：<input id="lv_b" class="inp sm" type="number" value="0.025" step="0.005" /></label>
          <label>捕食转化率 $\\delta$：<input id="lv_d" class="inp sm" type="number" value="0.015" step="0.005" /></label>
          <label>捕食者死亡率 $\\gamma$：<input id="lv_g" class="inp sm" type="number" value="0.40" step="0.05" /></label>
          <label>初始猎物 $x_0$：<input id="lv_x0" class="inp sm" type="number" value="40" /></label>
          <label>初始捕食者 $y_0$：<input id="lv_y0" class="inp sm" type="number" value="15" /></label>
          <label>仿真时长 $T_{\\max}$：<input id="lv_tmax" class="inp sm" type="number" value="60" /></label>
        </div>`;
      }
      renderMath(pBox);
    };

    const getMode = seg($('#ode_type'), m => { renderParams(m); run(false); });
    renderParams('seir');

    const out = $('#out');
    const run = scroll => runSafe(out, () => {
      const mode = getMode();
      let params = {};
      if (mode === 'seir' || mode === 'sir') {
        params = {
          N: Number($('#ode_N').value) || 10000,
          beta: Number($('#ode_beta').value) || 0.5,
          sigma: $('#ode_sigma') ? Number($('#ode_sigma').value) || 0.2 : 0.2,
          gamma: Number($('#ode_gamma').value) || 0.1,
          I0: Number($('#ode_I0').value) || 10,
          E0: $('#ode_E0') ? Number($('#ode_E0').value) || 20 : 0,
          tMax: Number($('#ode_tmax').value) || 120,
          dt: 0.5,
        };
      } else {
        params = {
          alpha: Number($('#lv_a').value) || 0.6,
          beta: Number($('#lv_b').value) || 0.025,
          delta: Number($('#lv_d').value) || 0.015,
          gamma: Number($('#lv_g').value) || 0.4,
          x0: Number($('#lv_x0').value) || 40,
          y0: Number($('#lv_y0').value) || 15,
          tMax: Number($('#lv_tmax').value) || 60,
          dt: 0.1,
        };
      }

      const r = MM.odeSimulate(mode, params);

      if (mode === 'seir' || mode === 'sir') {
        const iIdx = mode === 'seir' ? 2 : 1;
        out.innerHTML =
          resCard('Step 1 · 动力学阈值与传播峰值特征指标',
            metrics([
              { k: '基本再生数 R₀ = β / γ', v: fmt(r.R0_num, 2), cls: 'accent', s: r.R0_num > 1 ? 'R₀ > 1：将发生指数级流行扩散' : 'R₀ ≤ 1：将自然衰减消亡' },
              { k: '感染人数峰值 I_max', v: fmt(r.peakI, 1) + ' 人', cls: 'accent', s: `占总人口 ${fmt((r.peakI / r.N) * 100, 2)}%` },
              { k: '感染达峰时间 t_peak', v: `第 ${fmt(r.peakDay, 1)} 天`, s: '医疗资源承压最高峰时刻' },
              { k: '稳态累计感染比例 R(∞)/N', v: fmt((r.finalR / r.N) * 100, 2) + '%', s: `剩余易感者 ${fmt(r.finalS, 0)} 人` },
            ])) +
          resCard('Step 2 · 仓室状态时间演化曲线与 (S, I) 相平面轨线图',
            `<div class="two-col">${chartBox('ch_ode_time', 330)}${chartBox('ch_ode_phase', 330)}</div>`);

        mkChart('ch_ode_time', {
          type: 'line',
          data: {
            labels: r.ts.map(t => fmtS(t, 1)),
            datasets: r.varNames.map((nm, j) => ({
              label: nm,
              data: r.ys.map(y => y[j]),
              borderColor: PALETTE[j % PALETTE.length],
              borderWidth: 2.4,
              pointRadius: 0,
            })),
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            scales: { x: { title: { display: true, text: '时间 t (天)' }, ticks: { maxTicksLimit: 10 } }, y: { title: { display: true, text: '仓室人数' } } },
          },
        });

        mkChart('ch_ode_phase', {
          type: 'scatter',
          data: {
            datasets: [
              {
                label: 'S(t) - I(t) 相平面演化轨迹',
                data: r.ys.map(y => ({ x: y[0], y: y[iIdx] })),
                showLine: true,
                borderColor: '#e11d48',
                backgroundColor: '#e11d48',
                borderWidth: 2.4,
                pointRadius: 0,
              },
            ],
          },
          options: baseScatterOpts('易感者人数 S(t)', '感染者人数 I(t)'),
        });
      } else {
        out.innerHTML =
          resCard('Step 1 · Lotka-Volterra 种群生态平衡点与振荡特征',
            metrics([
              { k: '猎物共存平衡点 x* = γ/δ', v: fmt(r.eqPrey, 2), cls: 'accent', s: '非平凡生态不动点' },
              { k: '捕食者共存平衡点 y* = α/β', v: fmt(r.eqPred, 2), cls: 'accent', s: '非平凡生态不动点' },
              { k: '猎物种群周期峰值 x_max', v: fmt(r.maxPrey, 2), s: '周期性振荡波峰' },
              { k: '捕食者种群周期峰值 y_max', v: fmt(r.maxPred, 2), s: '相位滞后于猎物峰值' },
            ])) +
          resCard('Step 2 · 双种群周期振荡时序图与相平面闭合极限环 (Phase Portrait)',
            `<div class="two-col">${chartBox('ch_ode_time', 330)}${chartBox('ch_ode_phase', 330)}</div>`);

        mkChart('ch_ode_time', {
          type: 'line',
          data: {
            labels: r.ts.map(t => fmtS(t, 1)),
            datasets: r.varNames.map((nm, j) => ({
              label: nm,
              data: r.ys.map(y => y[j]),
              borderColor: j === 0 ? '#0d9488' : '#e11d48',
              borderWidth: 2.4,
              pointRadius: 0,
            })),
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            scales: { x: { title: { display: true, text: '时间 t' }, ticks: { maxTicksLimit: 10 } }, y: { title: { display: true, text: '种群数量' } } },
          },
        });

        mkChart('ch_ode_phase', {
          type: 'scatter',
          data: {
            datasets: [
              {
                label: '相空间闭合轨线 (x(t), y(t))',
                data: r.ys.map(y => ({ x: y[0], y: y[1] })),
                showLine: true,
                borderColor: '#7c3aed',
                borderWidth: 2.2,
                pointRadius: 0,
              },
              {
                label: `中心平衡点 (${fmt(r.eqPrey, 1)}, ${fmt(r.eqPred, 1)})`,
                data: [{ x: r.eqPrey, y: r.eqPred }],
                backgroundColor: '#e11d48',
                pointRadius: 8,
                pointStyle: 'star',
              },
            ],
          },
          options: baseScatterOpts('猎物种群数量 x(t)', '捕食者种群数量 y(t)'),
        });
      }
    }, scroll);
    $('#brun').onclick = () => run(true);
    run(false);
  };


  /* =========================================================
     路由与初始化
     ========================================================= */
  function renderSidebar() {
    let html = `<a class="nav-link" href="#/" data-id=""><span class="nav-ico home">${ico('home')}</span><span>首页总览</span></a>`;
    html += `<div class="nav-group"><div class="nav-group-title"><span class="dot" style="background:#e11d48"></span>竞赛与备赛专栏</div>`;
    COMP_NAV.forEach(item => {
      html += `<a class="nav-link" href="#/${item.id}" data-id="${item.id}" data-search="${esc((item.name + item.search).toLowerCase())}"><span class="nav-ico" style="background:linear-gradient(135deg,${item.c[0]},${item.c[1]})">${item.icon}</span><span>${item.name}</span></a>`;
    });
    html += '</div>';
    for (const [k, c] of Object.entries(CATS)) {
      html += `<div class="nav-group"><div class="nav-group-title"><span class="dot" style="background:${c.color}"></span>${c.name}</div>`;
      ALGOS.filter(a => a.cat === k && !a.parent).forEach(a => {
        html += `<a class="nav-link" href="#/${a.id}" data-id="${a.id}" data-search="${esc((a.name + a.short + a.en + a.tags.join('')).toLowerCase())}"><span class="nav-ico" style="background:linear-gradient(135deg,${a.c[0]},${a.c[1]})">${a.icon}</span><span>${a.name}</span></a>`;
        ALGOS.filter(sub => sub.parent === a.id).forEach(sub => {
          html += `<a class="nav-link nav-sublink" href="#/${sub.id}" data-id="${sub.id}" data-search="${esc((sub.name + sub.short + sub.en + sub.tags.join('')).toLowerCase())}"><span class="sub-branch">└</span><span class="nav-ico sm" style="background:linear-gradient(135deg,${sub.c[0]},${sub.c[1]})">${sub.icon}</span><span>${sub.name}</span></a>`;
        });
      });
      html += '</div>';
    }
    $('#nav').innerHTML = html;
    $('#search').addEventListener('input', e => {
      const q = e.target.value.trim().toLowerCase();
      $$('.nav-link[data-search]').forEach(l => (l.hidden = !!q && !l.dataset.search.includes(q)));
      $$('.nav-group').forEach(g => (g.hidden = !$$('.nav-link[data-search]', g).some(l => !l.hidden)));
    });
    $('#menuBtn').onclick = () => document.body.classList.toggle('nav-open');
    $('#backdrop').onclick = () => document.body.classList.remove('nav-open');
  }

  let lastId = null;
  function route() {
    const [id = '', tab = 'overview'] = location.hash.replace(/^#\/?/, '').split('/');
    const main = $('#page');
    const algo = ALGOS.find(a => a.id === id);
    const compPage = COMP_NAV.find(c => c.id === id);
    destroyCharts();
    if (algo) renderAlgo(main, algo, tab);
    else if (compPage) renderCompPage(main, compPage.id);
    else renderHome(main);
    const curId = algo ? id : compPage ? compPage.id : '';
    if (curId !== lastId) window.scrollTo({ top: 0 });
    lastId = curId;
    $$('.nav-link').forEach(l => l.classList.toggle('active', l.dataset.id === lastId));
    document.body.classList.remove('nav-open');
  }

  /* =========================================================
     全局交互委托：CSV 拖拽/导入、SVG/PDF 矢量图导出、LaTeX 三线表
     ========================================================= */
  function normalizeCsvText(rawText, targetTa) {
    let text = String(rawText || '').replace(/^\uFEFF/, '').trim();
    if (!text) return '';
    // 若为线性规划 / 整数规划约束框且不包含 '|'，支持将 CSV 行自动转为约束行或直接保留原格式
    if (targetTa && (targetTa.id === 'lp_cons' || targetTa.id === 'ilp_cons') && !text.includes('|')) {
      const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      const converted = [];
      lines.forEach(line => {
        const cols = line.split(',').map(s => s.trim().replace(/^"|"$/g, ''));
        if (cols.length >= 4 && (cols[cols.length - 2] === '<=' || cols[cols.length - 2] === '>=' || cols[cols.length - 2] === '=')) {
          const name = cols[0];
          const op = cols[cols.length - 2];
          const rhs = cols[cols.length - 1];
          const coefs = cols.slice(1, cols.length - 2).join(', ');
          converted.push(`${name} | ${coefs} | ${op} | ${rhs}`);
        } else {
          converted.push(line);
        }
      });
      return converted.join('\n');
    }
    // 普通矩阵/序列：将 CSV 双引号与内部空格清理，使得 parseTable 可无缝识别
    return text.split(/\r?\n/).map(line => {
      if (!line.trim()) return '';
      const cells = [];
      let cur = '', inQ = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') { inQ = !inQ; }
        else if ((ch === ',' || ch === '\t' || ch === ';') && !inQ) {
          cells.push(cur.trim().replace(/\s+/g, '_'));
          cur = '';
        } else {
          cur += ch;
        }
      }
      cells.push(cur.trim().replace(/\s+/g, '_'));
      return cells.filter(Boolean).join('\t');
    }).filter(Boolean).join('\n');
  }

  function applyCsvTextToInput(rawText, ta, fileName = 'CSV') {
    if (!ta) ta = $('#din') || $('.data-input');
    if (!ta) return false;
    const formatted = normalizeCsvText(rawText, ta);
    if (!formatted) {
      showToast('⚠️ CSV 文件内容为空');
      return false;
    }
    ta.value = formatted;
    ta.dispatchEvent(new Event('input', { bubbles: true }));
    const runBtn = $('#brun');
    setTimeout(() => {
      if (runBtn) runBtn.click();
      showToast(`✅ 已导入 ${fileName} 并完成计算`);
    }, 60);
    return true;
  }

  async function readCsvFileAndApply(file, ta) {
    if (!file) return;
    const buf = await file.arrayBuffer();
    let text = new TextDecoder('utf-8').decode(buf);
    if (text.includes('\uFFFD')) {
      try { text = new TextDecoder('gbk').decode(buf); } catch (_) {}
    }
    applyCsvTextToInput(text, ta, file.name);
  }

  document.addEventListener('dragover', e => {
    const ta = e.target.closest('.data-input') || (e.target.closest('.panel') && $('.data-input', e.target.closest('.panel')));
    if (!ta) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    ta.classList.add('drag-over');
  });

  document.addEventListener('dragleave', e => {
    const ta = e.target.closest('.data-input');
    if (ta) ta.classList.remove('drag-over');
  });

  document.addEventListener('drop', e => {
    const panel = e.target.closest('.panel');
    const ta = e.target.closest('.data-input') || (panel && $('.data-input', panel));
    if (!ta) return;
    ta.classList.remove('drag-over');
    const files = e.dataTransfer && e.dataTransfer.files;
    if (files && files.length > 0) {
      e.preventDefault();
      readCsvFileAndApply(files[0], ta);
    }
  });

  document.addEventListener('change', e => {
    if (e.target.classList && e.target.classList.contains('csv-file-inp')) {
      const file = e.target.files && e.target.files[0];
      const panel = e.target.closest('.panel');
      const ta = (panel && $('.data-input', panel)) || $('#din') || $('.data-input');
      if (file) readCsvFileAndApply(file, ta);
      e.target.value = '';
    }
  });

  document.addEventListener('click', async e => {
    const svgBtn = e.target.closest('[data-chart-svg]');
    if (svgBtn) {
      const id = svgBtn.dataset.chartSvg;
      const chart = chartMap[id];
      if (!chart) { showToast('⚠️ 未找到图表实例'); return; }
      const svgStr = chartToVectorSVG(chart);
      downloadBlob(new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' }), `${curAlgo.id}_${id}.svg`);
      showToast('📐 已导出出版级 SVG 矢量图');
      return;
    }

    const pdfBtn = e.target.closest('[data-chart-pdf]');
    if (pdfBtn) {
      const id = pdfBtn.dataset.chartPdf;
      const chart = chartMap[id];
      const cv = document.getElementById(id) || (chart && chart.canvas);
      if (!cv) { showToast('⚠️ 未找到图表画布'); return; }
      await exportElementToPDF(cv, `${curAlgo.id}_${id}.pdf`);
      showToast('📄 已导出出版级 PDF 图表');
      return;
    }

    const dgSvgBtn = e.target.closest('[data-dg-svg]');
    if (dgSvgBtn) {
      const card = dgSvgBtn.closest('.diagram-card');
      const svgEl = card && card.querySelector('svg');
      if (!svgEl) return;
      let raw = new XMLSerializer().serializeToString(svgEl);
      if (!raw.includes('xmlns=')) raw = raw.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
      const fullSvg = `<?xml version="1.0" encoding="UTF-8"?>\n` + raw;
      downloadBlob(new Blob([fullSvg], { type: 'image/svg+xml;charset=utf-8' }), `${dgSvgBtn.dataset.dgSvg}_diagram.svg`);
      showToast('📐 已导出几何原理 SVG 矢量图');
      return;
    }

    const dgPdfBtn = e.target.closest('[data-dg-pdf]');
    if (dgPdfBtn) {
      const card = dgPdfBtn.closest('.diagram-card');
      const svgEl = card && card.querySelector('svg');
      if (!svgEl) return;
      await exportElementToPDF(svgEl, `${dgPdfBtn.dataset.dgPdf}_diagram.pdf`);
      showToast('📄 已导出几何原理 PDF 文件');
      return;
    }

    const tblBtn = e.target.closest('[data-tbl-act]');
    if (tblBtn) {
      const act = tblBtn.dataset.tblAct;
      const wrap = tblBtn.closest('.table-wrap');
      const tableEl = wrap && wrap.querySelector('table');
      if (!tableEl) return;
      const cardEl = wrap.closest('.res-card');
      const titleEl = cardEl && cardEl.querySelector('.res-title');
      const cap = titleEl ? titleEl.textContent.replace(/\s+/g, ' ').trim() : `${curAlgo.short || curAlgo.name} 计算结果表`;

      if (act === 'copy-latex') {
        const tex = domTableToLatex(tableEl, cap);
        try { await navigator.clipboard.writeText(tex); } catch (_) {
          const t = document.createElement('textarea'); t.value = tex; document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove();
        }
        const orig = tblBtn.textContent;
        tblBtn.textContent = '✓ 已复制 LaTeX';
        setTimeout(() => (tblBtn.textContent = orig), 1600);
        showToast('📋 已复制 LaTeX booktabs 三线表源码');
      } else if (act === 'toggle-latex') {
        const pre = wrap.querySelector('.latex-preview');
        if (!pre) return;
        if (pre.hidden) {
          pre.textContent = domTableToLatex(tableEl, cap);
          pre.hidden = false;
          tblBtn.classList.add('on');
        } else {
          pre.hidden = true;
          tblBtn.classList.remove('on');
        }
      } else if (act === 'export-csv') {
        const csv = '\uFEFF' + domTableToCSV(tableEl);
        downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8' }), `${curAlgo.id}_table.csv`);
        showToast('📥 已导出结果表格 CSV 文件');
      }
    }
  });

  window.MM_EXPORT = {
    chartToVectorSVG,
    exportElementToPDF,
    domTableToLatex,
    domTableToCSV,
    applyCsvTextToInput,
    getChart: id => chartMap[id],
  };

  if (window.Chart) {
    Chart.defaults.font.family = getComputedStyle(document.body).fontFamily;
    Chart.defaults.color = '#6b7190';
    Chart.defaults.borderColor = '#eef0f6';
    Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(30,34,53,.92)';
    Chart.defaults.plugins.tooltip.padding = 10;
    Chart.defaults.plugins.tooltip.cornerRadius = 8;
  }
  renderSidebar();
  window.addEventListener('hashchange', route);
  route();
})();
