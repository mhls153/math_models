/* =========================================================
   数学建模算法核心实现（纯 JavaScript，无第三方依赖）
   包含：评价决策类、回归预测类、随机模拟与时序决策类
   ========================================================= */
(function (global) {
  'use strict';

  /* ---------------- 基础工具 ---------------- */
  const sum = a => a.reduce((s, v) => s + v, 0);
  const mean = a => sum(a) / a.length;
  const col = (X, j) => X.map(r => r[j]);
  const transpose = X => X[0].map((_, j) => X.map(r => r[j]));
  const matMul = (A, B) => A.map(r => B[0].map((_, j) => r.reduce((s, v, k) => s + v * B[k][j], 0)));
  const matVec = (A, v) => A.map(r => r.reduce((s, x, k) => s + x * v[k], 0));
  const std = (a, ddof = 0) => { const m = mean(a); return Math.sqrt(sum(a.map(v => (v - m) ** 2)) / (a.length - ddof)); };
  const normalize = w => { const s = sum(w); return s === 0 ? w.map(() => 1 / w.length) : w.map(v => v / s); };

  function inverse(A) {
    const n = A.length;
    const maxAbs = Math.max(...A.flat().map(Math.abs), 1e-300);
    const tol = 1e-13 * Math.max(1, maxAbs);
    const M = A.map((r, i) => [...r, ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))]);
    for (let c = 0; c < n; c++) {
      let p = c;
      for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
      if (Math.abs(M[p][c]) < tol) throw new Error('矩阵奇异（或接近奇异），无法求逆：可能存在完全共线性或样本不足');
      [M[c], M[p]] = [M[p], M[c]];
      const pv = M[c][c];
      for (let j = 0; j < 2 * n; j++) M[c][j] /= pv;
      for (let r = 0; r < n; r++) {
        if (r === c) continue;
        const f = M[r][c];
        if (f) for (let j = 0; j < 2 * n; j++) M[r][j] -= f * M[c][j];
      }
    }
    return M.map(r => r.slice(n));
  }
  const solve = (A, b) => matVec(inverse(A), b);

  /** 矩阵整数次幂 A^p */
  function matPow(A, p) {
    const n = A.length;
    let res = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
    let base = A.map(r => r.slice());
    let exp = Math.max(0, Math.floor(p));
    while (exp > 0) {
      if (exp % 2 === 1) res = matMul(res, base);
      base = matMul(base, base);
      exp = Math.floor(exp / 2);
    }
    return res;
  }

  /** 降序排名（1 为最大） */
  function rankDesc(arr) {
    const idx = arr.map((_, i) => i).sort((a, b) => arr[b] - arr[a]);
    const r = new Array(arr.length);
    idx.forEach((k, pos) => (r[k] = pos + 1));
    return r;
  }

  /** 分位数计算 (0 <= q <= 1) */
  function quantile(arr, q) {
    const s = arr.slice().sort((a, b) => a - b);
    const pos = (s.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    if (s[base + 1] !== undefined) return s[base] + rest * (s[base + 1] - s[base]);
    return s[base];
  }

  /** Box-Muller 标准正态分布随机数 N(0, 1) */
  function randn() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }

  /* ---------------- 统计分布 ---------------- */
  function lgamma(x) {
    const c = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
    let y = x, tmp = x + 5.5;
    tmp -= (x + 0.5) * Math.log(tmp);
    let ser = 1.000000000190015;
    for (let j = 0; j < 6; j++) ser += c[j] / ++y;
    return -tmp + Math.log(2.5066282746310005 * ser / x);
  }
  function betacf(a, b, x) {
    const MAXIT = 300, EPS = 3e-14, FPMIN = 1e-300;
    const qab = a + b, qap = a + 1, qam = a - 1;
    let c = 1, d = 1 - qab * x / qap;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    d = 1 / d;
    let h = d;
    for (let m = 1; m <= MAXIT; m++) {
      const m2 = 2 * m;
      let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
      d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
      c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
      d = 1 / d; h *= d * c;
      aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
      d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
      c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
      d = 1 / d;
      const del = d * c;
      h *= del;
      if (Math.abs(del - 1) < EPS) break;
    }
    return h;
  }
  /** 正则化不完全 Beta 函数 I_x(a,b) */
  function ibeta(x, a, b) {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    const bt = Math.exp(lgamma(a + b) - lgamma(a) - lgamma(b) + a * Math.log(x) + b * Math.log(1 - x));
    if (x < (a + 1) / (a + b + 2)) return bt * betacf(a, b, x) / a;
    return 1 - bt * betacf(b, a, 1 - x) / b;
  }
  /** t 分布双侧 p 值 */
  const tPValue = (t, df) => (isFinite(t) ? ibeta(df / (df + t * t), df / 2, 0.5) : 0);
  /** F 分布右尾 p 值 */
  const fPValue = (F, d1, d2) => (F <= 0 ? 1 : !isFinite(F) ? 0 : ibeta(d2 / (d2 + d1 * F), d2 / 2, d1 / 2));
  /** 双侧 t 临界值 t_{alpha/2}(df) */
  function tCrit(alpha, df) {
    let lo = 0, hi = 1e4;
    for (let i = 0; i < 200; i++) {
      const mid = (lo + hi) / 2;
      if (tPValue(mid, df) > alpha) lo = mid; else hi = mid;
    }
    return (lo + hi) / 2;
  }

  /** 正则化不完全 Gamma 函数 P(a, x) 与卡方右尾 p 值 */
  function gammp(a, x) {
    if (x <= 0) return 0;
    if (x < a + 1) {
      let ap = a, s = 1 / a, del = s;
      for (let n = 1; n <= 300; n++) {
        ap += 1;
        del *= x / ap;
        s += del;
        if (Math.abs(del) < Math.abs(s) * 3e-14) break;
      }
      return s * Math.exp(-x + a * Math.log(x) - lgamma(a));
    }
    let b = x + 1 - a, c = 1e300, d = 1 / b, h = d;
    for (let i = 1; i <= 300; i++) {
      const an = -i * (i - a);
      b += 2;
      d = an * d + b; if (Math.abs(d) < 1e-30) d = 1e-30;
      c = b + an / c; if (Math.abs(c) < 1e-30) c = 1e-30;
      d = 1 / d;
      const del = d * c;
      h *= del;
      if (Math.abs(del - 1) < 3e-14) break;
    }
    const q = Math.exp(-x + a * Math.log(x) - lgamma(a)) * h;
    return 1 - q;
  }
  const chi2PValue = (chi2, df) => (chi2 <= 0 || df <= 0 ? 1 : Math.max(0, 1 - gammp(df / 2, chi2 / 2)));

  /* ---------------- 指标正向化 ---------------- */
  function positivize(X, types) {
    const out = X.map(r => r.slice());
    X[0].forEach((_, j) => {
      const c = col(X, j), t = (types && types[j]) || { type: 'max' };
      const mx = Math.max(...c), mn = Math.min(...c);
      if (t.type === 'min') {
        c.forEach((v, i) => (out[i][j] = mx - v));
      } else if (t.type === 'mid') {
        const M = Math.max(...c.map(v => Math.abs(v - t.best)));
        c.forEach((v, i) => (out[i][j] = M === 0 ? 1 : 1 - Math.abs(v - t.best) / M));
      } else if (t.type === 'int') {
        const M = Math.max(t.a - mn, mx - t.b);
        c.forEach((v, i) => {
          if (M <= 0) out[i][j] = 1;
          else if (v < t.a) out[i][j] = 1 - (t.a - v) / M;
          else if (v > t.b) out[i][j] = 1 - (v - t.b) / M;
          else out[i][j] = 1;
        });
      }
    });
    return out;
  }

  /* ---------------- TOPSIS ---------------- */
  function topsis(X, types, weights) {
    const n = X.length, m = X[0].length;
    const P = positivize(X, types);
    const norms = Array.from({ length: m }, (_, j) => Math.sqrt(sum(col(P, j).map(v => v * v))));
    const Z = P.map(r => r.map((v, j) => (norms[j] === 0 ? 0 : v / norms[j])));
    const w = weights ? normalize(weights) : Array(m).fill(1 / m);
    const zPlus = Array.from({ length: m }, (_, j) => Math.max(...col(Z, j)));
    const zMinus = Array.from({ length: m }, (_, j) => Math.min(...col(Z, j)));
    const dPlus = Z.map(r => Math.sqrt(sum(r.map((v, j) => w[j] * (zPlus[j] - v) ** 2))));
    const dMinus = Z.map(r => Math.sqrt(sum(r.map((v, j) => w[j] * (zMinus[j] - v) ** 2))));
    const S = dPlus.map((dp, i) => (dp + dMinus[i] === 0 ? 0.5 : dMinus[i] / (dp + dMinus[i])));
    const sS = sum(S);
    const Snorm = S.map(v => (sS === 0 ? 1 / n : v / sS));
    return { n, m, P, Z, w, zPlus, zMinus, dPlus, dMinus, S, Snorm, rank: rankDesc(S) };
  }

  /* ---------------- 熵权法 ---------------- */
  function entropy(X, types) {
    const n = X.length, m = X[0].length;
    if (n < 2) throw new Error('熵权法至少需要 2 个评价对象');
    const P = positivize(X, types);
    const mins = Array.from({ length: m }, (_, j) => Math.min(...col(P, j)));
    const maxs = Array.from({ length: m }, (_, j) => Math.max(...col(P, j)));
    const Z = P.map(r => r.map((v, j) => (maxs[j] === mins[j] ? 1 : (v - mins[j]) / (maxs[j] - mins[j]))));
    const colSum = Array.from({ length: m }, (_, j) => sum(col(Z, j)));
    const Pm = Z.map(r => r.map((v, j) => (colSum[j] === 0 ? 1 / n : v / colSum[j])));
    const k = 1 / Math.log(n);
    const e = Array.from({ length: m }, (_, j) => -k * sum(col(Pm, j).map(p => (p > 0 ? p * Math.log(p) : 0))));
    const d = e.map(v => 1 - v);
    const sd = sum(d);
    const w = sd === 0 ? Array(m).fill(1 / m) : d.map(v => v / sd);
    const score = Z.map(r => 100 * sum(r.map((v, j) => v * w[j])));
    return { n, m, P, Z, Pm, e, d, w, score, rank: rankDesc(score) };
  }

  /* ---------------- 层次分析法 AHP ---------------- */
  const RI_TABLE = [0, 0, 0, 0.52, 0.89, 1.12, 1.26, 1.36, 1.41, 1.46, 1.49, 1.52, 1.54, 1.56, 1.58, 1.59];
  function ahp(A) {
    const n = A.length;
    const cs = Array.from({ length: n }, (_, j) => sum(col(A, j)));
    const Nm = A.map(r => r.map((v, j) => v / cs[j]));
    const wArith = Nm.map(r => mean(r));
    const wGeo = normalize(A.map(r => Math.pow(r.reduce((p, v) => p * v, 1), 1 / n)));
    let w = Array(n).fill(1 / n);
    for (let it = 0; it < 2000; it++) {
      const nw = normalize(matVec(A, w));
      const diff = Math.max(...nw.map((v, i) => Math.abs(v - w[i])));
      w = nw;
      if (diff < 1e-14) break;
    }
    const Aw = matVec(A, w);
    const lambdaMax = mean(Aw.map((v, i) => v / w[i]));
    const CI = n > 2 ? (lambdaMax - n) / (n - 1) : 0;
    const RI = RI_TABLE[n] ?? 1.59;
    const CR = RI ? CI / RI : 0;
    let worst = null;
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      const dev = Math.abs(Math.log(A[i][j] * w[j] / w[i]));
      if (!worst || dev > worst.dev) worst = { i, j, dev, suggest: w[i] / w[j] };
    }
    return { n, Nm, wArith, wGeo, wEig: w, Aw, lambdaMax, CI, RI, CR, pass: CR < 0.1, worst };
  }

  /* ---------------- 模糊综合评价 (FCE) ---------------- */
  function fce(W, R, op = 'sum-prod', scores = null) {
    const m = W.length;
    const n = R[0].length;
    if (R.length !== m) throw new Error(`权重向量维度 (${m}) 与单因素评判矩阵行数 (${R.length}) 不一致`);
    const w = normalize(W);
    const B_raw = new Array(n).fill(0);

    if (op === 'max-min') {
      // M(∧, ∨) 主因素决定型
      for (let j = 0; j < n; j++) {
        let maxV = 0;
        for (let i = 0; i < m; i++) maxV = Math.max(maxV, Math.min(w[i], R[i][j]));
        B_raw[j] = maxV;
      }
    } else if (op === 'max-prod') {
      // M(·, ∨) 主因素突出型
      for (let j = 0; j < n; j++) {
        let maxV = 0;
        for (let i = 0; i < m; i++) maxV = Math.max(maxV, w[i] * R[i][j]);
        B_raw[j] = maxV;
      }
    } else if (op === 'min-sum') {
      // M(∧, ⊕) 有界和型
      for (let j = 0; j < n; j++) {
        let s = 0;
        for (let i = 0; i < m; i++) s += Math.min(w[i], R[i][j]);
        B_raw[j] = Math.min(1, s);
      }
    } else {
      // 默认 M(·, ⊕) 加权平均型（乘加模型，应用最广泛）
      for (let j = 0; j < n; j++) {
        let s = 0;
        for (let i = 0; i < m; i++) s += w[i] * R[i][j];
        B_raw[j] = s;
      }
    }

    const sB = sum(B_raw);
    const B = sB === 0 ? Array(n).fill(1 / n) : B_raw.map(v => v / sB);

    // 最大隶属度原则
    let maxIdx = 0, maxVal = B[0];
    for (let j = 1; j < n; j++) {
      if (B[j] > maxVal) { maxVal = B[j]; maxIdx = j; }
    }

    // 最大隶属度有效度度量
    const sortedB = B.slice().sort((a, b) => b - a);
    const beta = sortedB[1] > 1e-9 ? sortedB[0] / sortedB[1] : 999;
    const alpha = n > 1 ? (n * sortedB[0] - 1) / (n - 1) : 1;

    // 加权综合得分
    let finalScore = null;
    if (Array.isArray(scores) && scores.length === n) {
      finalScore = sum(B.map((b, j) => b * scores[j]));
    }

    return { m, n, w, R, op, B_raw, B, maxIdx, maxVal, alpha, beta, finalScore };
  }

  /* ---------------- 灰色关联分析 ---------------- */
  function gra(X, opt = {}) {
    const rho = opt.rho ?? 0.5;
    const mode = opt.mode || 'factor';
    const flatAB = D => { const f = D.flat(); return [Math.min(...f), Math.max(...f)]; };
    if (mode === 'factor') {
      if (X[0].length < 2) throw new Error('至少需要 1 列参考序列和 1 列比较序列');
      const means = X[0].map((_, j) => mean(col(X, j)));
      if (means.some(v => v === 0)) throw new Error('存在均值为 0 的序列，无法进行均值化');
      const N = X.map(r => r.map((v, j) => v / means[j]));
      const x0 = col(N, 0);
      const D = N.map((r, k) => r.slice(1).map(v => Math.abs(v - x0[k])));
      const [a, b] = flatAB(D);
      const XI = D.map(r => r.map(d => (b === 0 ? 1 : (a + rho * b) / (d + rho * b))));
      const r = XI[0].map((_, i) => mean(col(XI, i)));
      return { mode, rho, N, D, a, b, XI, r, rank: rankDesc(r) };
    }
    const P = positivize(X, opt.types);
    const means = P[0].map((_, j) => mean(col(P, j)));
    const N = P.map(r => r.map((v, j) => (means[j] === 0 ? 0 : v / means[j])));
    const ref = N[0].map((_, j) => Math.max(...col(N, j)));
    const D = N.map(r => r.map((v, j) => Math.abs(ref[j] - v)));
    const [a, b] = flatAB(D);
    const XI = D.map(r => r.map(d => (b === 0 ? 1 : (a + rho * b) / (d + rho * b))));
    const m = X[0].length;
    const w = opt.weights ? normalize(opt.weights) : Array(m).fill(1 / m);
    const r = XI.map(row => sum(row.map((v, j) => v * w[j])));
    return { mode, rho, P, N, ref, D, a, b, XI, w, r, rank: rankDesc(r) };
  }

  /* ---------------- 误差评价指标（MAE, MSE, RMSE, MRE, MAPE） ---------------- */
  /** 计算实际值与预测/拟合值之间的常用误差精度量 */
  function calcErrors(y, yhat) {
    const n = y.length;
    if (!n) return { MAE: 0, MSE: 0, RMSE: 0, MRE: 0, MAPE: 0 };
    let sumAbs = 0, sumSq = 0, sumRel = 0;
    let hasZero = false;
    for (let i = 0; i < n; i++) {
      const e = y[i] - yhat[i];
      const absE = Math.abs(e);
      sumAbs += absE;
      sumSq += e * e;
      if (y[i] !== 0) {
        sumRel += absE / Math.abs(y[i]);
      } else {
        hasZero = true;
      }
    }
    const MAE = sumAbs / n;
    const MSE = sumSq / n;
    const RMSE = Math.sqrt(MSE);
    const MRE = hasZero ? NaN : sumRel / n;
    const MAPE = hasZero ? NaN : MRE * 100;
    return { MAE, MSE, RMSE, MRE, MAPE };
  }

  /* ---------------- 一元线性回归 ---------------- */
  function linreg(x, y) {
    const n = x.length;
    if (n < 3) throw new Error('一元线性回归至少需要 3 组样本');
    const xm = mean(x), ym = mean(y);
    const Lxx = sum(x.map(v => (v - xm) ** 2));
    const Lyy = sum(y.map(v => (v - ym) ** 2));
    const Lxy = sum(x.map((v, i) => (v - xm) * (y[i] - ym)));
    if (Lxx === 0) throw new Error('自变量 x 取值全部相同，无法回归');
    const b = Lxy / Lxx, a = ym - b * xm;
    const yhat = x.map(v => a + b * v);
    const resid = y.map((v, i) => v - yhat[i]);
    const SSE = sum(resid.map(e => e * e)), SST = Lyy, SSR = SST - SSE;
    const df = n - 2;
    const s = Math.sqrt(SSE / df);
    const R2 = SST === 0 ? 1 : 1 - SSE / SST;
    const r = Lyy === 0 ? 0 : Lxy / Math.sqrt(Lxx * Lyy);
    const seB = s / Math.sqrt(Lxx), seA = s * Math.sqrt(1 / n + xm * xm / Lxx);
    const tB = seB === 0 ? Infinity : b / seB, tA = seA === 0 ? Infinity : a / seA;
    const F = SSE === 0 ? Infinity : SSR / (SSE / df);
    const errs = calcErrors(y, yhat);
    const res = {
      n, xm, ym, Lxx, Lyy, Lxy, a, b, yhat, resid, SSE, SST, SSR, df, s, R2, r,
      seA, seB, tA, tB, pA: tPValue(Math.abs(tA), df), pB: tPValue(Math.abs(tB), df), F, pF: fPValue(F, 1, df),
      ...errs,
    };
    res.predict = (x0, alpha = 0.05) => {
      const y0 = a + b * x0, tc = tCrit(alpha, df);
      const seM = s * Math.sqrt(1 / n + (x0 - xm) ** 2 / Lxx), seP = s * Math.sqrt(1 + 1 / n + (x0 - xm) ** 2 / Lxx);
      return { x0, y: y0, ci: [y0 - tc * seM, y0 + tc * seM], pi: [y0 - tc * seP, y0 + tc * seP] };
    };
    res.band = (x0, alpha = 0.05) => {
      const tc = tCrit(alpha, df);
      const seM = s * Math.sqrt(1 / n + (x0 - xm) ** 2 / Lxx);
      return [a + b * x0 - tc * seM, a + b * x0 + tc * seM];
    };
    return res;
  }

  /* ---------------- 多元线性回归（OLS） ---------------- */
  function ols(X, y) {
    const n = y.length, k = X[0].length, p = k + 1;
    if (n <= p) throw new Error(`样本量 n=${n} 必须大于待估参数个数 ${p}`);
    const D = X.map(r => [1, ...r]);
    const Dt = transpose(D);
    const C = inverse(matMul(Dt, D));
    const beta = matVec(C, matVec(Dt, y));
    const yhat = D.map(r => r.reduce((s, v, j) => s + v * beta[j], 0));
    const resid = y.map((v, i) => v - yhat[i]);
    const ym = mean(y);
    const SSE = sum(resid.map(e => e * e)), SST = sum(y.map(v => (v - ym) ** 2)), SSR = SST - SSE;
    const df = n - p, s2 = SSE / df, s = Math.sqrt(s2);
    const R2 = SST === 0 ? 1 : 1 - SSE / SST;
    const adjR2 = 1 - (1 - R2) * (n - 1) / df;
    const se = beta.map((_, j) => Math.sqrt(Math.max(0, s2 * C[j][j])));
    const t = beta.map((b, j) => (se[j] === 0 ? Infinity : b / se[j]));
    const pv = t.map(v => tPValue(Math.abs(v), df));
    const F = s2 === 0 ? Infinity : (SSR / k) / s2;
    const pF = fPValue(F, k, df);
    const sy = std(y, 1);
    const stdBeta = beta.map((b, j) => (j === 0 ? null : b * std(col(X, j - 1), 1) / sy));
    const AIC = n * Math.log(SSE / n) + 2 * p;
    const errs = calcErrors(y, yhat);
    const res = { n, k, p, beta, se, t, pv, yhat, resid, SSE, SST, SSR, df, s, R2, adjR2, F, pF, C, stdBeta, AIC, ...errs };
    res.predict = (x0, alpha = 0.05) => {
      const d = [1, ...x0];
      const y0 = sum(d.map((v, j) => v * beta[j]));
      const q = sum(d.map((v, i) => v * sum(d.map((u, j) => C[i][j] * u))));
      const tc = tCrit(alpha, df);
      return { x0, y: y0, ci: [y0 - tc * s * Math.sqrt(q), y0 + tc * s * Math.sqrt(q)], pi: [y0 - tc * s * Math.sqrt(1 + q), y0 + tc * s * Math.sqrt(1 + q)] };
    };
    return res;
  }
  function vif(X) {
    const k = X[0].length;
    if (k < 2) return [1];
    return Array.from({ length: k }, (_, j) => {
      try {
        const yj = col(X, j), Xo = X.map(r => r.filter((_, c) => c !== j));
        const r = ols(Xo, yj);
        return r.R2 >= 1 ? Infinity : 1 / (1 - r.R2);
      } catch (e) { return NaN; }
    });
  }
  function corrMatrix(X) {
    const m = X[0].length;
    const cols = Array.from({ length: m }, (_, j) => col(X, j));
    return cols.map(a => cols.map(b => {
      const am = mean(a), bm = mean(b);
      const num = sum(a.map((v, i) => (v - am) * (b[i] - bm)));
      const den = Math.sqrt(sum(a.map(v => (v - am) ** 2)) * sum(b.map(v => (v - bm) ** 2)));
      return den === 0 ? 0 : num / den;
    }));
  }

  /* ---------------- 非线性回归 ---------------- */
  function lm(f, p0, x, y, maxIter = 500) {
    let p = p0.slice(), lambda = 1e-3, iter = 0;
    const resid = q => y.map((yi, i) => yi - f(x[i], q));
    const cost = r => sum(r.map(v => v * v));
    let r = resid(p), c = cost(r);
    if (!isFinite(c)) throw new Error('初值处函数值无效，请检查数据范围');
    for (; iter < maxIter; iter++) {
      const J = x.map(xi => p.map((pj, j) => {
        const h = 1e-7 * Math.max(1, Math.abs(pj));
        const pp = p.slice(); pp[j] += h;
        return (f(xi, pp) - f(xi, p)) / h;
      }));
      const JT = transpose(J), JTJ = matMul(JT, J), JTr = matVec(JT, r);
      let improved = false, rel = 0;
      for (let tries = 0; tries < 30; tries++) {
        const A = JTJ.map((row, i) => row.map((v, j) => (i === j ? v * (1 + lambda) + 1e-12 : v)));
        let delta;
        try { delta = solve(A, JTr); } catch (e) { lambda *= 10; continue; }
        const pn = p.map((v, i) => v + delta[i]);
        const rn = resid(pn), cn = cost(rn);
        if (isFinite(cn) && cn < c) {
          rel = (c - cn) / (c + 1e-300);
          p = pn; r = rn; c = cn;
          lambda = Math.max(lambda / 10, 1e-15);
          improved = true;
          break;
        }
        lambda *= 10;
      }
      if (!improved || rel < 1e-13) break;
    }
    return { p, cost: c, iter };
  }

  const NL_MODELS = {
    exp: {
      name: '指数模型', tex: String.raw`y=a\,e^{bx}`, params: ['a', 'b'],
      f: (x, p) => p[0] * Math.exp(p[1] * x),
      init(x, y) {
        if (y.some(v => v <= 0)) throw new Error('指数模型要求所有 y > 0');
        const l = linreg(x, y.map(Math.log));
        return { p: [Math.exp(l.a), l.b], how: String.raw`两边取对数：$\ln y=\ln a+bx$，对 $(x,\ \ln y)$ 做一元线性回归` };
      },
    },
    power: {
      name: '幂函数模型', tex: String.raw`y=a\,x^{b}`, params: ['a', 'b'],
      f: (x, p) => p[0] * Math.pow(x, p[1]),
      init(x, y) {
        if (x.some(v => v <= 0) || y.some(v => v <= 0)) throw new Error('幂函数模型要求 x > 0 且 y > 0');
        const l = linreg(x.map(Math.log), y.map(Math.log));
        return { p: [Math.exp(l.a), l.b], how: String.raw`双对数变换：$\ln y=\ln a+b\ln x$，对 $(\ln x,\ \ln y)$ 做线性回归` };
      },
    },
    log: {
      name: '对数模型', tex: String.raw`y=a+b\ln x`, params: ['a', 'b'],
      f: (x, p) => p[0] + p[1] * Math.log(x),
      init(x, y) {
        if (x.some(v => v <= 0)) throw new Error('对数模型要求所有 x > 0');
        const l = linreg(x.map(Math.log), y);
        return { p: [l.a, l.b], how: String.raw`令 $u=\ln x$，则 $y=a+bu$ 为线性模型` };
      },
    },
    logistic: {
      name: 'Logistic 模型', tex: String.raw`y=\dfrac{K}{1+a\,e^{-bx}}`, params: ['K', 'a', 'b'],
      f: (x, p) => p[0] / (1 + p[1] * Math.exp(-p[2] * x)),
      init(x, y) {
        if (y.some(v => v <= 0)) throw new Error('Logistic 模型要求所有 y > 0');
        const K = Math.max(...y) * 1.1;
        const l = linreg(x, y.map(v => Math.log(K / v - 1)));
        return { p: [K, Math.exp(l.a), -l.b], how: String.raw`取 $K_0=1.1\max y$，变换 $\ln\!\left(\frac{K}{y}-1\right)=\ln a-bx$ 后线性回归得初值` };
      },
    },
  };

  function fitStats(y, yhat, k) {
    const n = y.length, ym = mean(y);
    const resid = y.map((v, i) => v - yhat[i]);
    const SSE = sum(resid.map(e => e * e)), SST = sum(y.map(v => (v - ym) ** 2));
    const R2 = SST === 0 ? 1 : 1 - SSE / SST;
    const errs = calcErrors(y, yhat);
    return {
      resid, SSE, SST, R2, adjR2: n - k > 0 ? 1 - (1 - R2) * (n - 1) / (n - k) : NaN,
      ...errs,
      AIC: n * Math.log(SSE / n) + 2 * k,
    };
  }

  function nlfit(key, x, y) {
    const m = NL_MODELS[key];
    if (x.length <= m.params.length) throw new Error(`样本量需大于参数个数 ${m.params.length}`);
    const ini = m.init(x, y);
    const res = lm(m.f, ini.p, x, y);
    const yhat = x.map(v => m.f(v, res.p));
    return { key, name: m.name, tex: m.tex, params: m.params, init: ini.p, how: ini.how, p: res.p, iter: res.iter, yhat, f: v => m.f(v, res.p), ...fitStats(y, yhat, m.params.length) };
  }

  function polyfit(x, y, deg) {
    const X = x.map(v => Array.from({ length: deg }, (_, j) => v ** (j + 1)));
    const r = ols(X, y);
    const f = v => r.beta.reduce((s, b, j) => s + b * v ** j, 0);
    return { ...r, key: 'poly', deg, name: `${deg} 次多项式`, f, p: r.beta, params: r.beta.map((_, j) => `β${j}`), ...fitStats(y, r.yhat, deg + 1) };
  }

  /* ---------------- 灰色预测 GM(1,1) ---------------- */
  function gm11(x0, steps = 3) {
    const n = x0.length;
    if (n < 4) throw new Error('GM(1,1) 至少需要 4 个数据');
    if (x0.some(v => v <= 0)) throw new Error('GM(1,1) 要求原始序列全部为正数（可先做平移变换）');
    const lam = x0.slice(1).map((v, i) => x0[i] / v);
    const lo = Math.exp(-2 / (n + 1)), hi = Math.exp(2 / (n + 1));
    const ratioPass = lam.every(v => v > lo && v < hi);
    const x1 = []; x0.reduce((s, v, i) => (x1[i] = s + v), 0);
    const z1 = x1.slice(1).map((v, i) => 0.5 * (v + x1[i]));
    const B = z1.map(z => [-z, 1]);
    const Y = x0.slice(1);
    const Bt = transpose(B);
    const [a, b] = solve(matMul(Bt, B), matVec(Bt, Y));
    const total = n + steps;
    const x1hat = Array.from({ length: total }, (_, k) => (x0[0] - b / a) * Math.exp(-a * k) + b / a);
    const x0hat = x1hat.map((v, k) => (k === 0 ? x0[0] : v - x1hat[k - 1]));
    const e = x0.map((v, k) => v - x0hat[k]);
    const relErr = e.map((v, k) => Math.abs(v) / x0[k]);
    const meanRelErr = mean(relErr.slice(1));
    const rho = lam.map(l => 1 - ((1 - 0.5 * a) / (1 + 0.5 * a)) * l);
    const S1 = std(x0), S2 = std(e);
    const C = S1 === 0 ? 0 : S2 / S1;
    const em = mean(e);
    const P = mean(e.map(v => (Math.abs(v - em) < 0.6745 * S1 ? 1 : 0)));
    let grade;
    if (C <= 0.35 && P >= 0.95) grade = { level: 1, text: '一级（好）' };
    else if (C <= 0.5 && P >= 0.8) grade = { level: 2, text: '二级（合格）' };
    else if (C <= 0.65 && P >= 0.7) grade = { level: 3, text: '三级（勉强合格）' };
    else grade = { level: 4, text: '四级（不合格）' };
    const errs = calcErrors(x0, x0hat.slice(0, n));
    return { n, steps, lam, lo, hi, ratioPass, x1, z1, a, b, x1hat, x0hat, e, relErr, meanRelErr, rho, S1, S2, C, P, grade, forecast: x0hat.slice(n), ...errs };
  }

  /* ---------------- 时间序列 ARIMA ---------------- */
  /** 差分运算 */
  function diff(x, d = 1) {
    let cur = x.slice();
    for (let i = 0; i < d; i++) {
      const nxt = [];
      for (let j = 1; j < cur.length; j++) nxt.push(cur[j] - cur[j - 1]);
      cur = nxt;
    }
    return cur;
  }

  /** 自相关函数 ACF */
  function acf(x, maxLag = 16) {
    const N = x.length;
    const m = mean(x);
    const v = sum(x.map(v => (v - m) ** 2));
    const kMax = Math.min(maxLag, Math.floor(N / 3), N - 2);
    const res = [];
    for (let k = 0; k <= kMax; k++) {
      let num = 0;
      for (let t = k; t < N; t++) num += (x[t] - m) * (x[t - k] - m);
      res.push(v === 0 ? (k === 0 ? 1 : 0) : num / v);
    }
    return { lags: Array.from({ length: kMax + 1 }, (_, i) => i), acf: res, se: 1.96 / Math.sqrt(N) };
  }

  /** 偏自相关函数 PACF (Durbin-Levinson 递推) */
  function pacf(x, maxLag = 16) {
    const r = acf(x, maxLag).acf;
    const K = r.length - 1;
    const phi = Array.from({ length: K + 1 }, () => new Array(K + 1).fill(0));
    const pacfVals = [1];
    for (let k = 1; k <= K; k++) {
      let num = r[k];
      let den = 1;
      for (let j = 1; j < k; j++) {
        num -= phi[k - 1][j] * r[k - j];
        den -= phi[k - 1][j] * r[j];
      }
      phi[k][k] = Math.abs(den) > 1e-12 ? num / den : 0;
      for (let j = 1; j < k; j++) {
        phi[k][j] = phi[k - 1][j] - phi[k][k] * phi[k - 1][k - j];
      }
      pacfVals.push(phi[k][k]);
    }
    return { lags: Array.from({ length: K + 1 }, (_, i) => i), pacf: pacfVals, se: 1.96 / Math.sqrt(x.length) };
  }

  /** ARIMA(p, d, q) 建模与预测 */
  function arima(x, p = 1, d = 0, q = 0, steps = 5) {
    const N = x.length;
    if (N < 8) throw new Error('时间序列长度至少需要 8 个观测值');
    p = Math.max(0, Math.floor(p));
    d = Math.max(0, Math.floor(d));
    q = Math.max(0, Math.floor(q));
    steps = Math.max(1, Math.floor(steps));

    const w = diff(x, d);
    const M = w.length;
    if (M <= p + q + 2) throw new Error(`差分后序列长度 (${M}) 过短，无法估计 p=${p}, q=${q} 的参数`);

    let phi = [], theta = [], c = 0, fittedW = [], residW = [];

    if (p === 0 && q === 0) {
      c = mean(w);
      fittedW = Array(M).fill(c);
      residW = w.map(v => v - c);
    } else if (q === 0) {
      // 纯 AR(p) 模型：直接 OLS 估计
      const X_ar = [];
      const Y_ar = [];
      for (let t = p; t < M; t++) {
        const row = [];
        for (let i = 1; i <= p; i++) row.push(w[t - i]);
        X_ar.push(row);
        Y_ar.push(w[t]);
      }
      const r_ols = ols(X_ar, Y_ar);
      c = r_ols.beta[0];
      phi = r_ols.beta.slice(1);
      residW = new Array(M).fill(0);
      fittedW = new Array(M).fill(0);
      for (let t = 0; t < p; t++) {
        fittedW[t] = w[t];
        residW[t] = 0;
      }
      for (let t = p; t < M; t++) {
        let fv = c;
        for (let i = 0; i < p; i++) fv += phi[i] * w[t - 1 - i];
        fittedW[t] = fv;
        residW[t] = w[t] - fv;
      }
    } else {
      // ARMA(p, q) 模型：采用 Hannan-Rissanen 算法两步估计
      const kAr = Math.min(Math.max(p + q + 2, 4), Math.floor(M / 3));
      const X_long = [], Y_long = [];
      for (let t = kAr; t < M; t++) {
        const row = [];
        for (let i = 1; i <= kAr; i++) row.push(w[t - i]);
        X_long.push(row);
        Y_long.push(w[t]);
      }
      const r_long = ols(X_long, Y_long);
      const e_hat = new Array(M).fill(0);
      for (let t = kAr; t < M; t++) {
        let val = r_long.beta[0];
        for (let i = 1; i <= kAr; i++) val += r_long.beta[i] * w[t - i];
        e_hat[t] = w[t] - val;
      }

      const startT = Math.max(p, q, kAr);
      const X_arma = [], Y_arma = [];
      for (let t = startT; t < M; t++) {
        const row = [];
        for (let i = 1; i <= p; i++) row.push(w[t - i]);
        for (let j = 1; j <= q; j++) row.push(e_hat[t - j]);
        X_arma.push(row);
        Y_arma.push(w[t]);
      }
      const r_arma = ols(X_arma, Y_arma);
      c = r_arma.beta[0];
      phi = r_arma.beta.slice(1, p + 1);
      theta = r_arma.beta.slice(p + 1);

      fittedW = new Array(M).fill(0);
      residW = new Array(M).fill(0);
      for (let t = 0; t < M; t++) {
        let fv = c;
        for (let i = 0; i < p; i++) if (t - 1 - i >= 0) fv += phi[i] * w[t - 1 - i];
        for (let j = 0; j < q; j++) if (t - 1 - j >= 0) fv += theta[j] * residW[t - 1 - j];
        fittedW[t] = fv;
        residW[t] = w[t] - fv;
      }
    }

    // 统计指标与信息准则
    const kParams = p + q + 1;
    const validResid = residW.slice(Math.max(p, q));
    const SSE = sum(validResid.map(e => e * e));
    const sigma2 = Math.max(1e-12, SSE / Math.max(1, validResid.length - kParams));
    const s = Math.sqrt(sigma2);
    const logLik = -0.5 * validResid.length * (Math.log(2 * Math.PI * sigma2) + 1);
    const AIC = 2 * kParams - 2 * logLik;
    const BIC = kParams * Math.log(validResid.length) - 2 * logLik;

    // Ljung-Box 白噪声检验
    const mMax = Math.min(10, Math.floor(validResid.length / 4));
    const resAcf = acf(validResid, mMax).acf;
    let Q = 0;
    const n_res = validResid.length;
    for (let k = 1; k <= mMax; k++) {
      Q += (resAcf[k] ** 2) / (n_res - k);
    }
    Q *= n_res * (n_res + 2);
    const df_q = Math.max(1, mMax - p - q);
    const p_Q = chi2PValue(Q, df_q);

    // 递归向后预测 w
    const predW = [];
    const extendedW = w.slice();
    const extendedE = residW.slice();
    for (let h = 1; h <= steps; h++) {
      const curT = M + h - 1;
      let val = c;
      for (let i = 0; i < p; i++) {
        const idx = curT - 1 - i;
        val += phi[i] * (idx >= M ? predW[idx - M] : extendedW[idx]);
      }
      for (let j = 0; j < q; j++) {
        const idx = curT - 1 - j;
        if (idx < M) val += theta[j] * extendedE[idx];
      }
      predW.push(val);
    }

    // MA(∞) 权重计算预测方差
    const psi = [1];
    for (let j = 1; j < steps; j++) {
      let val = (j <= q ? theta[j - 1] : 0);
      for (let i = 1; i <= Math.min(j, p); i++) {
        val += phi[i - 1] * psi[j - i];
      }
      psi.push(val);
    }

    // 还原原始序列的预测与拟合
    const fittedX = [];
    if (d === 0) {
      for (let t = 0; t < N; t++) fittedX.push(fittedW[t]);
    } else if (d === 1) {
      fittedX.push(x[0]);
      for (let t = 1; t < N; t++) fittedX.push(x[t - 1] + fittedW[t - 1]);
    } else if (d === 2) {
      fittedX.push(x[0], x[1]);
      for (let t = 2; t < N; t++) fittedX.push(2 * x[t - 1] - x[t - 2] + fittedW[t - 2]);
    }

    const predX = [];
    const predLower = [];
    const predUpper = [];
    let lastX = x.slice(-2);
    for (let h = 0; h < steps; h++) {
      let x_hat;
      if (d === 0) {
        x_hat = predW[h];
      } else if (d === 1) {
        x_hat = (h === 0 ? x[N - 1] : predX[h - 1]) + predW[h];
      } else if (d === 2) {
        const prev1 = (h === 0 ? x[N - 1] : predX[h - 1]);
        const prev2 = (h === 0 ? x[N - 2] : h === 1 ? x[N - 1] : predX[h - 2]);
        x_hat = 2 * prev1 - prev2 + predW[h];
      }
      predX.push(x_hat);

      // 误差累积项
      let se_w = s * Math.sqrt(psi.slice(0, h + 1).reduce((acc, v) => acc + v * v, 0));
      const se_x = se_w * Math.sqrt(1 + d * 0.5 * (h + 1));
      predLower.push(x_hat - 1.96 * se_x);
      predUpper.push(x_hat + 1.96 * se_x);
    }

    const errs = calcErrors(x, fittedX);
    return {
      p, d, q, steps, N, M,
      c, phi, theta, s, sigma2, logLik, AIC, BIC,
      Q, df_q, p_Q, whiteNoisePass: p_Q > 0.05,
      w, fittedW, residW,
      x, fittedX, predX, predLower, predUpper,
      forecast: predX,
      fitted: fittedX,
      lower95: predLower,
      upper95: predUpper,
      ...errs,
    };
  }

  /** 自动网格搜索最优 ARIMA 参数 */
  function autoArima(x, maxP = 3, maxD = 2, maxQ = 2, steps = 5) {
    let best = null;
    const candidates = [];
    for (let d = 0; d <= maxD; d++) {
      for (let p = 0; p <= maxP; p++) {
        for (let q = 0; q <= maxQ; q++) {
          try {
            const res = arima(x, p, d, q, steps);
            candidates.push({ p, d, q, AIC: res.AIC, BIC: res.BIC, pass: res.whiteNoisePass });
            if (!best || res.AIC < best.AIC) best = res;
          } catch (e) {
            // 参数不收敛则跳过
          }
        }
      }
    }
    if (!best) throw new Error('未能找到可行的 ARIMA 模型');
    return { best, candidates };
  }

  /* ---------------- 蒙特卡洛算法 ---------------- */
  const monteCarlo = {
    /** 复杂函数定积分估计（投点法 + 平均值法 + 收敛轨迹） */
    integral(fnStr, a, b, N = 5000) {
      if (b <= a) throw new Error('积分上限 b 必须大于下限 a');
      N = Math.max(100, Math.min(200000, Math.floor(N)));
      let f;
      try {
        f = new Function('x', `with (Math) { return ${fnStr}; }`);
        const test = f((a + b) / 2);
        if (!isFinite(test)) throw new Error('函数在测试点处无效');
      } catch (e) {
        throw new Error(`被积函数表达式错误: ${e.message}`);
      }

      const checkpoints = [100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000].filter(cp => cp <= N);
      if (!checkpoints.includes(N)) checkpoints.push(N);

      let sumY = 0, sumY2 = 0;
      const history = [];
      let cpIdx = 0;
      const samplePoints = []; // 供散点渲染的一小部分

      for (let i = 1; i <= N; i++) {
        const xi = a + Math.random() * (b - a);
        const yi = f(xi);
        sumY += yi;
        sumY2 += yi * yi;

        if (samplePoints.length < 500 && Math.random() < 0.2) {
          samplePoints.push({ x: xi, y: yi });
        }

        if (i === checkpoints[cpIdx]) {
          const currentMean = sumY / i;
          const currentEst = (b - a) * currentMean;
          const varY = (sumY2 - (sumY * sumY) / i) / Math.max(1, i - 1);
          const se = (b - a) * Math.sqrt(Math.max(0, varY) / i);
          history.push({ n: i, est: currentEst, se, ci: [currentEst - 1.96 * se, currentEst + 1.96 * se] });
          cpIdx++;
        }
      }

      const finalMean = sumY / N;
      const finalEst = (b - a) * finalMean;
      const sampleVar = (sumY2 - (sumY * sumY) / N) / (N - 1);
      const se = (b - a) * Math.sqrt(Math.max(0, sampleVar) / N);
      const ci = [finalEst - 1.96 * se, finalEst + 1.96 * se];

      return {
        fnStr, a, b, N,
        estimate: finalEst,
        se,
        ci,
        sampleVar,
        history,
        samplePoints,
      };
    },

    /** 几何布朗运动 GBM 资产价格与 VaR 风险价值模拟 */
    gbm(S0, mu, sigma, T = 1, steps = 50, numPaths = 1000) {
      if (S0 <= 0 || sigma <= 0 || T <= 0) throw new Error('初始价格、波动率与模拟时长必须为正数');
      numPaths = Math.max(50, Math.min(20000, Math.floor(numPaths)));
      steps = Math.max(10, Math.min(500, Math.floor(steps)));

      const dt = T / steps;
      const drift = (mu - 0.5 * sigma * sigma) * dt;
      const vol = sigma * Math.sqrt(dt);

      const displayPaths = [];
      const numDisplay = Math.min(15, numPaths);
      const terminalPrices = [];

      for (let p = 0; p < numPaths; p++) {
        let S = S0;
        const path = (p < numDisplay) ? [S] : null;
        for (let t = 1; t <= steps; t++) {
          const z = randn();
          S *= Math.exp(drift + vol * z);
          if (path) path.push(S);
        }
        terminalPrices.push(S);
        if (path) displayPaths.push(path);
      }

      const meanTerminal = mean(terminalPrices);
      const medianTerminal = quantile(terminalPrices, 0.5);
      const returns = terminalPrices.map(S => (S - S0) / S0);
      const losses = terminalPrices.map(S => S0 - S);

      const var95 = quantile(losses, 0.95);
      const var99 = quantile(losses, 0.99);
      const es95 = mean(losses.filter(L => L >= var95));

      const timeGrid = Array.from({ length: steps + 1 }, (_, i) => +(i * dt).toFixed(3));

      return {
        S0, mu, sigma, T, steps, numPaths,
        timeGrid, displayPaths,
        meanTerminal, medianTerminal,
        var95, var99, es95,
        returnsMean: mean(returns),
        returnsStd: std(returns),
        terminalPrices,
      };
    },

    /** 报童问题随机库存决策仿真 */
    newsvendor(mu, sigma, cost, price, salvage = 0, penalty = 0, qMin = 50, qMax = 150, qStep = 10, N = 3000) {
      if (price <= cost) throw new Error('售价必须大于进货成本');
      const qList = [];
      for (let q = qMin; q <= qMax; q += qStep) qList.push(q);

      const demands = [];
      for (let i = 0; i < N; i++) {
        demands.push(Math.max(0, mu + sigma * randn()));
      }

      const results = qList.map(q => {
        const profits = demands.map(d => {
          const sold = Math.min(q, d);
          const unsold = Math.max(0, q - d);
          const lost = Math.max(0, d - q);
          return sold * price + unsold * salvage - q * cost - lost * penalty;
        });
        const m = mean(profits);
        const s = std(profits);
        const var5 = quantile(profits, 0.05);
        return { q, meanProfit: m, stdProfit: s, var5Profit: var5 };
      });

      let bestQ = results[0];
      results.forEach(r => { if (r.meanProfit > bestQ.meanProfit) bestQ = r; });

      // 理论最优服务水平与临界分位数
      const criticalRatio = (price - cost + penalty) / (price - salvage + penalty);

      return {
        mu, sigma, cost, price, salvage, penalty,
        qList, results, bestQ, criticalRatio, demands,
      };
    },
  };

  /* ---------------- 马尔可夫算法 ---------------- */
  function markov(P, pi0, steps = 10, stateNames = null) {
    const k = P.length;
    if (k < 2) throw new Error('状态数至少需要 2 个');
    for (let i = 0; i < k; i++) {
      if (P[i].length !== k) throw new Error(`转移矩阵第 ${i + 1} 行列数不匹配`);
      const rSum = sum(P[i]);
      if (Math.abs(rSum - 1) > 1e-4) throw new Error(`转移矩阵第 ${i + 1} 行概率和不为 1 (当前和: ${rSum.toFixed(4)})`);
    }

    const initPi = normalize(pi0 || Array(k).fill(1 / k));
    const names = stateNames || Array.from({ length: k }, (_, i) => `状态 ${i + 1}`);
    steps = Math.max(1, Math.min(100, Math.floor(steps)));

    // 状态概率分布随步数推移过程
    const trajectory = [initPi];
    let curPi = initPi.slice();
    for (let t = 1; t <= steps; t++) {
      curPi = matVec(transpose(P), curPi);
      trajectory.push(curPi);
    }

    // 计算极限稳态分布 π P = π <=> (P^T - I) π^T = 0, 附带 sum(π) = 1
    let steady = null;
    try {
      const A = transpose(P).map((row, i) => row.map((v, j) => (i === j ? v - 1 : v)));
      A[k - 1] = Array(k).fill(1); // 替换最后一行归一化条件
      const b = Array(k).fill(0);
      b[k - 1] = 1;
      steady = solve(A, b);
      // 保证非负
      const sSum = sum(steady);
      steady = steady.map(v => Math.max(0, v) / sSum);
    } catch (e) {
      steady = trajectory[trajectory.length - 1]; // 若奇异则以多步收敛作为极限近似
    }

    // n 步转移概率矩阵 P^steps
    const P_n = matPow(P, steps);

    // 蒙特卡洛状态链模拟生成
    const simSteps = 20;
    const simChain = [];
    let curState = 0;
    let r0 = Math.random(), cum0 = 0;
    for (let i = 0; i < k; i++) {
      cum0 += initPi[i];
      if (r0 <= cum0) { curState = i; break; }
    }
    simChain.push(curState);
    for (let s = 1; s <= simSteps; s++) {
      const r = Math.random();
      let cum = 0;
      for (let j = 0; j < k; j++) {
        cum += P[curState][j];
        if (r <= cum || j === k - 1) {
          curState = j;
          break;
        }
      }
      simChain.push(curState);
    }

    return {
      k, P, initPi, steps, names,
      trajectory, steady, P_n, simChain,
    };
  }

  /* =========================================================
     12. 线性规划与单纯形法 (Linear Programming - Simplex & 2D Geometry)
     ========================================================= */
  /**
   * 求解标准/一般线性规划问题:
   *   max / min  c^T x
   *   s.t.       A_i x (<=, >=, =) b_i,  x >= 0
   * @param {number[]} c 目标函数系数 (长度 n)
   * @param {Array<{a:number[], op:string, b:number, name?:string}>} constraints 约束列表
   * @param {'max'|'min'} sense 优化方向
   */
  function lpSolve(c, constraints, sense = 'max') {
    const n = c.length;
    const m = constraints.length;
    if (n < 1 || m < 1) throw new Error('请至少输入 1 个决策变量和 1 条约束条件');

    // 规范化 b_i >= 0
    const normCons = constraints.map((con, idx) => {
      let a = con.a.slice(0, n);
      let b = Number(con.b);
      let op = con.op || '<=';
      if (b < 0) {
        a = a.map(v => -v);
        b = -b;
        if (op === '<=') op = '>=';
        else if (op === '>=') op = '<=';
      }
      return { a, op, b, origOp: con.op || '<=', origB: Number(con.b), origA: con.a.slice(0, n), name: con.name || `约束 ${idx + 1}` };
    });

    // 大 M 单纯形法构造
    const BIG_M = 1e7;
    const sign = sense === 'min' ? -1 : 1;
    let numSlack = 0, numSurplus = 0, numArt = 0;
    normCons.forEach(con => {
      if (con.op === '<=') numSlack++;
      else if (con.op === '>=') { numSurplus++; numArt++; }
      else { numArt++; }
    });

    const totalCols = n + numSlack + numSurplus + numArt;
    const tableau = Array.from({ length: m + 1 }, () => Array(totalCols + 1).fill(0));
    const basis = Array(m).fill(0);
    const artCols = [];
    let sIdx = n, aIdx = n + numSlack + numSurplus;

    normCons.forEach((con, i) => {
      for (let j = 0; j < n; j++) tableau[i][j] = con.a[j];
      tableau[i][totalCols] = con.b;
      if (con.op === '<=') {
        tableau[i][sIdx] = 1;
        basis[i] = sIdx;
        sIdx++;
      } else if (con.op === '>=') {
        tableau[i][sIdx] = -1;
        sIdx++;
        tableau[i][aIdx] = 1;
        basis[i] = aIdx;
        artCols.push(aIdx);
        aIdx++;
      } else {
        tableau[i][aIdx] = 1;
        basis[i] = aIdx;
        artCols.push(aIdx);
        aIdx++;
      }
    });

    // 目标行: max sum(sign * c_j * x_j) - M * sum(art)
    // Tableau 最后一行存 -reduced_cost: z - c_j x_j = 0 => -c_j
    for (let j = 0; j < n; j++) tableau[m][j] = -sign * c[j];
    artCols.forEach(colIdx => { tableau[m][colIdx] = BIG_M; });

    // 消去人工变量在目标行中的系数
    normCons.forEach((_, i) => {
      if (artCols.includes(basis[i])) {
        for (let j = 0; j <= totalCols; j++) {
          tableau[m][j] -= BIG_M * tableau[i][j];
        }
      }
    });

    const history = [];
    let iter = 0;
    const maxIter = 200;
    let unbounded = false;

    while (iter < maxIter) {
      // 寻找进基变量 (最负的检验数)
      let pivotCol = -1, minVal = -1e-9;
      for (let j = 0; j < totalCols; j++) {
        if (tableau[m][j] < minVal) {
          minVal = tableau[m][j];
          pivotCol = j;
        }
      }
      if (pivotCol === -1) break; // 已达最优

      // 最小比值检验寻找出基变量
      let pivotRow = -1, minRatio = Infinity;
      for (let i = 0; i < m; i++) {
        const aij = tableau[i][pivotCol];
        if (aij > 1e-9) {
          const ratio = tableau[i][totalCols] / aij;
          if (ratio < minRatio - 1e-12) {
            minRatio = ratio;
            pivotRow = i;
          }
        }
      }
      if (pivotRow === -1) { unbounded = true; break; }

      // 旋转主元消元 (Pivot)
      const pv = tableau[pivotRow][pivotCol];
      for (let j = 0; j <= totalCols; j++) tableau[pivotRow][j] /= pv;
      for (let i = 0; i <= m; i++) {
        if (i !== pivotRow) {
          const factor = tableau[i][pivotCol];
          if (Math.abs(factor) > 1e-12) {
            for (let j = 0; j <= totalCols; j++) {
              tableau[i][j] -= factor * tableau[pivotRow][j];
            }
          }
        }
      }
      basis[pivotRow] = pivotCol;
      iter++;

      // 记录当前解
      const curX = Array(n).fill(0);
      for (let i = 0; i < m; i++) {
        if (basis[i] < n) curX[basis[i]] = tableau[i][totalCols];
      }
      const curZ = curX.reduce((s, v, j) => s + c[j] * v, 0);
      history.push({ iter, enter: pivotCol + 1, leave: pivotRow + 1, x: curX, z: curZ });
    }

    if (unbounded) throw new Error('该线性规划问题无界（目标函数可趋于无穷大/小，请检查约束条件是否闭合）');

    // 检查人工变量是否仍大于 0（无可行解）
    for (let i = 0; i < m; i++) {
      if (artCols.includes(basis[i]) && tableau[i][totalCols] > 1e-5) {
        throw new Error('该线性规划问题无可行解（约束条件之间存在矛盾）');
      }
    }

    const xOpt = Array(n).fill(0);
    for (let i = 0; i < m; i++) {
      if (basis[i] < n) xOpt[basis[i]] = Math.max(0, tableau[i][totalCols]);
    }
    const zOpt = xOpt.reduce((s, v, j) => s + c[j] * v, 0);

    // 计算每条约束的实际左端值、松弛/剩余变量与对偶影子价格
    const conAnalysis = constraints.map((con, i) => {
      const lhs = con.a.slice(0, n).reduce((s, aij, j) => s + aij * xOpt[j], 0);
      const slack = Math.abs(con.b - lhs);
      const binding = slack < 1e-5;
      return {
        name: con.name || `约束 ${i + 1}`,
        lhs,
        op: con.op || '<=',
        rhs: con.b,
        slack,
        binding,
      };
    });

    // 若 n === 2，精确计算二维可行域多边形顶点用于绘图
    let polygon = [];
    let allVertices = [];
    if (n === 2) {
      const lines = [
        { a: [1, 0], b: 0 },
        { a: [0, 1], b: 0 },
        ...constraints.map(con => ({ a: [con.a[0], con.a[1]], b: Number(con.b) })),
      ];
      const pts = [];
      for (let i = 0; i < lines.length; i++) {
        for (let j = i + 1; j < lines.length; j++) {
          const [a1, b1] = lines[i].a, c1 = lines[i].b;
          const [a2, b2] = lines[j].a, c2 = lines[j].b;
          const det = a1 * b2 - a2 * b1;
          if (Math.abs(det) > 1e-10) {
            const x1 = (c1 * b2 - c2 * b1) / det;
            const x2 = (a1 * c2 - a2 * c1) / det;
            if (x1 >= -1e-7 && x2 >= -1e-7) {
              // 检验是否满足所有约束
              const feasible = constraints.every(con => {
                const val = con.a[0] * x1 + con.a[1] * x2;
                if (con.op === '<=') return val <= con.b + 1e-6;
                if (con.op === '>=') return val >= con.b - 1e-6;
                return Math.abs(val - con.b) <= 1e-5;
              });
              if (feasible) {
                const cx1 = Math.max(0, x1), cx2 = Math.max(0, x2);
                if (!pts.some(p => Math.hypot(p.x - cx1, p.y - cx2) < 1e-5)) {
                  pts.push({ x: cx1, y: cx2, z: c[0] * cx1 + c[1] * cx2 });
                }
              }
            }
          }
        }
      }
      if (pts.length >= 3) {
        const cx = mean(pts.map(p => p.x)), cy = mean(pts.map(p => p.y));
        pts.sort((p1, p2) => Math.atan2(p1.y - cy, p1.x - cx) - Math.atan2(p2.y - cy, p2.x - cx));
      }
      polygon = pts;
      allVertices = pts.slice().sort((a, b) => (sense === 'max' ? b.z - a.z : a.z - b.z));
    }

    return {
      n, m, c, sense, xOpt, zOpt, iter, history, conAnalysis, polygon, allVertices,
    };
  }

  /* =========================================================
     13. 智能启发式优化：模拟退火算法 (Simulated Annealing - TSP & Function Opt)
     ========================================================= */
  /**
   * 模拟退火求解旅行商路径优化 (TSP)
   * @param {number[][]} coords n×2 节点坐标
   * @param {string[]} names 节点名称
   * @param {object} opts { T0, alpha, Tmin, markovLen }
   */
  function saTsp(coords, names, opts = {}) {
    const n = coords.length;
    if (n < 4) throw new Error('节点数量至少需要 4 个');
    const T0 = opts.T0 || 1000;
    const alpha = opts.alpha || 0.96;
    const Tmin = opts.Tmin || 0.05;
    const L = opts.markovLen || Math.max(60, n * 12);

    // 距离矩阵
    const distMat = Array.from({ length: n }, (_, i) =>
      Array.from({ length: n }, (__, j) =>
        Math.hypot(coords[i][0] - coords[j][0], coords[i][1] - coords[j][1])
      )
    );

    const tourDist = tour => {
      let d = 0;
      for (let i = 0; i < n; i++) d += distMat[tour[i]][tour[(i + 1) % n]];
      return d;
    };

    // 初始顺序路径
    let curTour = Array.from({ length: n }, (_, i) => i);
    const initCost = tourDist(curTour);
    let curCost = initCost;
    let bestTour = curTour.slice();
    let bestCost = curCost;

    let T = T0;
    const history = [{ step: 0, T, bestCost, curCost }];
    let step = 0;
    let acceptedBetter = 0, acceptedWorse = 0, totalTrials = 0;

    while (T > Tmin && step < 400) {
      for (let k = 0; k < L; k++) {
        totalTrials++;
        // 2-opt 邻域翻转扰动
        let i = 1 + Math.floor(Math.random() * (n - 1));
        let j = 1 + Math.floor(Math.random() * (n - 1));
        if (i === j) continue;
        if (i > j) [i, j] = [j, i];

        const nextTour = curTour.slice();
        // 翻转 [i, j]
        let l = i, r = j;
        while (l < r) {
          const tmp = nextTour[l];
          nextTour[l] = nextTour[r];
          nextTour[r] = tmp;
          l++; r--;
        }

        const nextCost = tourDist(nextTour);
        const dE = nextCost - curCost;
        if (dE < 0) {
          curTour = nextTour;
          curCost = nextCost;
          acceptedBetter++;
          if (curCost < bestCost) {
            bestCost = curCost;
            bestTour = curTour.slice();
          }
        } else if (Math.random() < Math.exp(-dE / T)) {
          curTour = nextTour;
          curCost = nextCost;
          acceptedWorse++;
        }
      }
      T *= alpha;
      step++;
      history.push({ step, T, bestCost, curCost });
    }

    // 最终执行一次确定性 2-opt 局部精细打磨确保全局高质量解
    let improved = true;
    while (improved) {
      improved = false;
      for (let i = 1; i < n - 1; i++) {
        for (let j = i + 1; j < n; j++) {
          const cand = bestTour.slice();
          let l = i, r = j;
          while (l < r) { [cand[l], cand[r]] = [cand[r], cand[l]]; l++; r--; }
          const cCost = tourDist(cand);
          if (cCost < bestCost - 1e-9) {
            bestCost = cCost;
            bestTour = cand;
            improved = true;
          }
        }
      }
    }
    history[history.length - 1].bestCost = bestCost;

    const initTour = Array.from({ length: n }, (_, i) => i);
    const improvement = ((initCost - bestCost) / initCost) * 100;

    return {
      n, coords, names, distMat,
      initTour, initCost,
      bestTour, bestCost,
      improvement,
      steps: step,
      totalTrials, acceptedBetter, acceptedWorse,
      history,
    };
  }

  /* =========================================================
     14. 主成分分析 (Principal Component Analysis - PCA)
     ========================================================= */
  /**
   * 实对称矩阵 Jacobi 特征值与特征向量分解
   */
  function jacobiEigen(A, maxSweeps = 100) {
    const m = A.length;
    const D = A.map(r => r.slice());
    const V = Array.from({ length: m }, (_, i) => Array.from({ length: m }, (__, j) => (i === j ? 1 : 0)));

    for (let sweep = 0; sweep < maxSweeps; sweep++) {
      let maxOff = 0, p = 0, q = 1;
      for (let i = 0; i < m; i++) {
        for (let j = i + 1; j < m; j++) {
          if (Math.abs(D[i][j]) > maxOff) {
            maxOff = Math.abs(D[i][j]);
            p = i; q = j;
          }
        }
      }
      if (maxOff < 1e-12) break;

      const app = D[p][p], aqq = D[q][q], apq = D[p][q];
      const theta = 0.5 * Math.atan2(2 * apq, aqq - app);
      const c = Math.cos(theta), s = Math.sin(theta);

      for (let i = 0; i < m; i++) {
        if (i !== p && i !== q) {
          const dip = D[i][p], diq = D[i][q];
          D[i][p] = D[p][i] = c * dip - s * diq;
          D[i][q] = D[q][i] = s * dip + c * diq;
        }
      }
      D[p][p] = c * c * app - 2 * s * c * apq + s * s * aqq;
      D[q][q] = s * s * app + 2 * s * c * apq + c * c * aqq;
      D[p][q] = D[q][p] = 0;

      for (let i = 0; i < m; i++) {
        const vip = V[i][p], viq = V[i][q];
        V[i][p] = c * vip - s * viq;
        V[i][q] = s * vip + c * viq;
      }
    }

    const pairs = Array.from({ length: m }, (_, i) => ({
      val: Math.max(0, D[i][i]),
      vec: V.map(row => row[i]),
    }));
    pairs.sort((a, b) => b.val - a.val);

    // 调整特征向量符号使其分量和为正（保证方向一致性）
    pairs.forEach(p => {
      if (sum(p.vec) < 0) p.vec = p.vec.map(v => -v);
    });

    return {
      values: pairs.map(p => p.val),
      vectors: pairs.map(p => p.vec), // vectors[k] 是第 k 个主成分的特征向量 (长度 m)
    };
  }

  function pca(X, threshold = 0.85) {
    const n = X.length, m = X[0].length;
    if (n < 3 || m < 2) throw new Error('PCA 至少需要 3 个样本和 2 个指标');

    // 1. Z-score 标准化
    const means = Array.from({ length: m }, (_, j) => mean(col(X, j)));
    const stds = Array.from({ length: m }, (_, j) => std(col(X, j)) || 1);
    const Z = X.map(row => row.map((v, j) => (v - means[j]) / stds[j]));

    // 2. 相关系数矩阵 R (m×m)
    const R = corrMatrix(X);

    // 3. 特征值与特征向量分解
    const { values: eigVals, vectors: eigVecs } = jacobiEigen(R);
    const totalVar = sum(eigVals) || m;
    const varRatio = eigVals.map(v => v / totalVar);
    const cumRatio = [];
    varRatio.reduce((acc, v, i) => (cumRatio[i] = acc + v), 0);

    // 确定保留主成分个数 k
    let k = cumRatio.findIndex(c => c >= threshold) + 1;
    if (k <= 0) k = Math.min(2, m);

    // 4. 因子载荷矩阵 L_{j, r} = sqrt(lambda_r) * e_{jr}
    const loadings = Array.from({ length: m }, (_, j) =>
      Array.from({ length: m }, (__, r) => Math.sqrt(eigVals[r]) * eigVecs[r][j])
    );

    // 5. 各样本的主成分得分矩阵 F = Z * E (n×m)
    const pcScores = Z.map(zRow =>
      eigVecs.map(vec => zRow.reduce((s, zj, j) => s + zj * vec[j], 0))
    );

    // 6. 综合得分（以前 k 个主成分方差贡献率为权重加权求和）
    const activeWeights = varRatio.slice(0, k);
    const wSum = sum(activeWeights) || 1;
    const compScores = pcScores.map(fRow =>
      activeWeights.reduce((s, w, r) => s + (w / wSum) * fRow[r], 0)
    );
    const rank = rankDesc(compScores);

    return {
      n, m, k, Z, R, eigVals, eigVecs, varRatio, cumRatio, loadings, pcScores, compScores, rank,
    };
  }

  /* =========================================================
     15. K-Means++ 聚类与轮廓系数评估 (K-Means & Silhouette & Elbow)
     ========================================================= */
  function runSingleKMeans(Z, K, seed = 42) {
    const n = Z.length, m = Z[0].length;
    // 确定性伪随机保证可复现
    let s = seed;
    const nextRand = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };

    const sqDist = (a, b) => a.reduce((acc, v, j) => acc + (v - b[j]) ** 2, 0);

    // K-Means++ 初始化聚类中心
    const centroids = [Z[Math.floor(nextRand() * n)].slice()];
    while (centroids.length < K) {
      const dists = Z.map(pt => Math.min(...centroids.map(c => sqDist(pt, c))));
      const dSum = sum(dists);
      if (dSum <= 1e-12) {
        centroids.push(Z[centroids.length % n].slice());
      } else {
        let r = nextRand() * dSum, acc = 0, picked = n - 1;
        for (let i = 0; i < n; i++) {
          acc += dists[i];
          if (r <= acc) { picked = i; break; }
        }
        centroids.push(Z[picked].slice());
      }
    }

    let labels = Array(n).fill(0);
    let iter = 0;
    for (; iter < 100; iter++) {
      let changed = false;
      for (let i = 0; i < n; i++) {
        let bestC = 0, bestD = Infinity;
        for (let c = 0; c < K; c++) {
          const d = sqDist(Z[i], centroids[c]);
          if (d < bestD) { bestD = d; bestC = c; }
        }
        if (labels[i] !== bestC) { labels[i] = bestC; changed = true; }
      }
      if (!changed && iter > 0) break;

      for (let c = 0; c < K; c++) {
        const members = Z.filter((_, i) => labels[i] === c);
        if (members.length > 0) {
          centroids[c] = Array.from({ length: m }, (_, j) => mean(members.map(row => row[j])));
        }
      }
    }

    // 计算簇内误差平方和 SSE (Inertia)
    let sse = 0;
    const distToCenter = Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      const d2 = sqDist(Z[i], centroids[labels[i]]);
      sse += d2;
      distToCenter[i] = Math.sqrt(d2);
    }

    // 计算每个样本的轮廓系数 Silhouette s(i) = (b(i) - a(i)) / max(a(i), b(i))
    const silhouettes = Array(n).fill(0);
    if (K > 1 && K < n) {
      for (let i = 0; i < n; i++) {
        const ci = labels[i];
        const sameCluster = [];
        const otherClusters = Array.from({ length: K }, () => []);
        for (let j = 0; j < n; j++) {
          if (i === j) continue;
          const d = Math.sqrt(sqDist(Z[i], Z[j]));
          if (labels[j] === ci) sameCluster.push(d);
          else otherClusters[labels[j]].push(d);
        }
        const ai = sameCluster.length > 0 ? mean(sameCluster) : 0;
        let bi = Infinity;
        for (let c = 0; c < K; c++) {
          if (c !== ci && otherClusters[c].length > 0) {
            bi = Math.min(bi, mean(otherClusters[c]));
          }
        }
        if (!isFinite(bi)) bi = 0;
        silhouettes[i] = Math.max(ai, bi) > 1e-12 ? (bi - ai) / Math.max(ai, bi) : 0;
      }
    }
    const avgSilhouette = mean(silhouettes);

    return { K, labels, centroids, sse, silhouettes, avgSilhouette, distToCenter, iter: iter + 1 };
  }

  function kmeans(X, K = 3, standardize = true) {
    const n = X.length, m = X[0].length;
    if (n < 4) throw new Error('聚类分析至少需要 4 个样本对象');
    if (K < 2 || K >= n) throw new Error(`聚类簇数 K 需在 2 到 ${n - 1} 之间`);

    const means = Array.from({ length: m }, (_, j) => mean(col(X, j)));
    const stds = Array.from({ length: m }, (_, j) => std(col(X, j)) || 1);
    const Z = standardize ? X.map(row => row.map((v, j) => (v - means[j]) / stds[j])) : X.map(r => r.slice());

    // 多次随机种子运行取最优 SSE
    let bestRes = null;
    for (let s = 1; s <= 8; s++) {
      const res = runSingleKMeans(Z, K, s * 97 + 13);
      if (!bestRes || res.sse < bestRes.sse) bestRes = res;
    }

    // 还原原始量纲下的聚类中心
    const rawCentroids = bestRes.centroids.map(cRow =>
      standardize ? cRow.map((v, j) => v * stds[j] + means[j]) : cRow.slice()
    );

    // 肘部法则与轮廓系数随 K 变化曲线 (K = 2 .. min(6, n-1))
    const maxK = Math.min(6, n - 1);
    const elbow = [];
    for (let kVal = 2; kVal <= maxK; kVal++) {
      let bestKRes = null;
      for (let s = 1; s <= 5; s++) {
        const r = runSingleKMeans(Z, kVal, s * 53 + 7);
        if (!bestKRes || r.sse < bestKRes.sse) bestKRes = r;
      }
      elbow.push({ k: kVal, sse: bestKRes.sse, silhouette: bestKRes.avgSilhouette });
    }

    // 2D 坐标投影（若 m >= 2，用前两个主成分或前两维投影）
    let coords2D = [];
    let centroids2D = [];
    let axisNames = ['维度 1', '维度 2'];
    if (m === 1) {
      coords2D = Z.map((r, i) => [r[0], i]);
      centroids2D = bestRes.centroids.map(c => [c[0], 0]);
    } else if (m === 2) {
      coords2D = Z.map(r => [r[0], r[1]]);
      centroids2D = bestRes.centroids.map(c => [c[0], c[1]]);
    } else {
      const pcaRes = pca(X, 0.85);
      coords2D = pcaRes.pcScores.map(r => [r[0], r[1]]);
      centroids2D = bestRes.centroids.map(cRow => [
        cRow.reduce((s, v, j) => s + v * pcaRes.eigVecs[0][j], 0),
        cRow.reduce((s, v, j) => s + v * pcaRes.eigVecs[1][j], 0),
      ]);
      axisNames = [
        `PC1 (${(pcaRes.varRatio[0] * 100).toFixed(1)}%)`,
        `PC2 (${(pcaRes.varRatio[1] * 100).toFixed(1)}%)`,
      ];
    }

    // 汇总每个簇的统计信息
    const clusterStats = Array.from({ length: K }, (_, c) => {
      const idxs = bestRes.labels.map((lb, i) => (lb === c ? i : -1)).filter(i => i >= 0);
      return {
        cluster: c + 1,
        count: idxs.length,
        ratio: idxs.length / n,
        avgSil: idxs.length ? mean(idxs.map(i => bestRes.silhouettes[i])) : 0,
        centroid: rawCentroids[c],
        members: idxs,
      };
    });

    return {
      n, m, K,
      labels: bestRes.labels,
      centroids: bestRes.centroids,
      rawCentroids,
      sse: bestRes.sse,
      silhouettes: bestRes.silhouettes,
      avgSilhouette: bestRes.avgSilhouette,
      distToCenter: bestRes.distToCenter,
      iter: bestRes.iter,
      elbow,
      coords2D,
      centroids2D,
      axisNames,
      clusterStats,
    };
  }

  /* =========================================================
     16. 常微分方程动力学仿真 (ODE:的四阶龙格-库塔法 RK4)
     ========================================================= */
  /**
   * 通用四阶龙格-库塔法 (RK4) 求解常微分方程组 dy/dt = f(t, y)
   */
  function rk4(deriv, y0, t0, tMax, dt) {
    const steps = Math.min(2000, Math.max(10, Math.round((tMax - t0) / dt)));
    const h = (tMax - t0) / steps;
    const ts = [t0];
    const ys = [y0.slice()];
    let t = t0, y = y0.slice();
    const d = y0.length;

    for (let s = 0; s < steps; s++) {
      const k1 = deriv(t, y);
      const y2 = Array.from({ length: d }, (_, i) => y[i] + 0.5 * h * k1[i]);
      const k2 = deriv(t + 0.5 * h, y2);
      const y3 = Array.from({ length: d }, (_, i) => y[i] + 0.5 * h * k2[i]);
      const k3 = deriv(t + 0.5 * h, y3);
      const y4 = Array.from({ length: d }, (_, i) => y[i] + h * k3[i]);
      const k4 = deriv(t + h, y4);

      y = Array.from({ length: d }, (_, i) => y[i] + (h / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
      t += h;
      ts.push(t);
      ys.push(y);
    }
    return { ts, ys, h, steps };
  }

  function odeSimulate(modelType, params) {
    if (modelType === 'seir') {
      const N = params.N || 10000;
      const beta = params.beta ?? 0.6;
      const sigma = params.sigma ?? 0.2;
      const gamma = params.gamma ?? 0.1;
      const I0 = params.I0 ?? 10;
      const E0 = params.E0 ?? 20;
      const R0_init = params.R0_init ?? 0;
      const S0 = Math.max(0, N - I0 - E0 - R0_init);
      const days = params.tMax || 120;
      const dt = params.dt || 0.5;

      const deriv = (_, [S, E, I]) => {
        const inf = (beta * S * I) / N;
        return [
          -inf,
          inf - sigma * E,
          sigma * E - gamma * I,
          gamma * I,
        ];
      };
      const { ts, ys } = rk4(deriv, [S0, E0, I0, R0_init], 0, days, dt);
      let peakI = 0, peakDay = 0;
      ys.forEach((y, idx) => {
        if (y[2] > peakI) { peakI = y[2]; peakDay = ts[idx]; }
      });
      const R0_num = beta / gamma;
      return {
        modelType, N, R0_num, peakI, peakDay,
        finalR: ys[ys.length - 1][3],
        finalS: ys[ys.length - 1][0],
        ts, ys,
        varNames: ['易感者 S(t)', '潜伏者 E(t)', '感染者 I(t)', '康复者 R(t)'],
      };
    }

    if (modelType === 'sir') {
      const N = params.N || 10000;
      const beta = params.beta ?? 0.45;
      const gamma = params.gamma ?? 0.12;
      const I0 = params.I0 ?? 15;
      const R0_init = params.R0_init ?? 0;
      const S0 = Math.max(0, N - I0 - R0_init);
      const days = params.tMax || 100;
      const dt = params.dt || 0.5;

      const deriv = (_, [S, I]) => {
        const inf = (beta * S * I) / N;
        return [-inf, inf - gamma * I, gamma * I];
      };
      const { ts, ys } = rk4(deriv, [S0, I0, R0_init], 0, days, dt);
      let peakI = 0, peakDay = 0;
      ys.forEach((y, idx) => {
        if (y[1] > peakI) { peakI = y[1]; peakDay = ts[idx]; }
      });
      const R0_num = beta / gamma;
      return {
        modelType, N, R0_num, peakI, peakDay,
        finalR: ys[ys.length - 1][2],
        finalS: ys[ys.length - 1][0],
        ts, ys,
        varNames: ['易感者 S(t)', '感染者 I(t)', '康复者 R(t)'],
      };
    }

    // Lotka-Volterra 捕食者-猎物生态竞争模型
    const alpha = params.alpha ?? 0.6; // 猎物自然增长率
    const beta = params.beta ?? 0.025; // 被捕食率
    const delta = params.delta ?? 0.015; // 捕食者繁殖转化率
    const gamma = params.gamma ?? 0.4; // 捕食者自然死亡率
    const x0 = params.x0 ?? 40;
    const y0 = params.y0 ?? 15;
    const tMax = params.tMax || 60;
    const dt = params.dt || 0.1;

    const deriv = (_, [x, y]) => [
      alpha * x - beta * x * y,
      delta * x * y - gamma * y,
    ];
    const { ts, ys } = rk4(deriv, [x0, y0], 0, tMax, dt);
    const eqPrey = gamma / delta;
    const eqPred = alpha / beta;
    const maxPrey = Math.max(...ys.map(r => r[0]));
    const maxPred = Math.max(...ys.map(r => r[1]));

    return {
      modelType: 'lv',
      eqPrey, eqPred, maxPrey, maxPred,
      ts, ys,
      varNames: ['猎物/食草种群 x(t)', '捕食者种群 y(t)'],
    };
  }

  global.MM = {
    sum, mean, std, col, transpose, matMul, matVec, normalize, inverse, solve, matPow,
    rankDesc, quantile, randn,
    lgamma, betacf, ibeta, tPValue, fPValue, tCrit, gammp, chi2PValue,
    positivize, topsis, entropy, ahp, RI_TABLE, fce, gra,
    linreg, ols, vif, corrMatrix,
    lm, NL_MODELS, nlfit, polyfit, fitStats, gm11,
    diff, acf, pacf, arima, autoArima,
    calcErrors,
    monteCarlo, markov,
    lpSolve, saTsp, jacobiEigen, pca, kmeans, rk4, odeSimulate,
  };
})(window);
