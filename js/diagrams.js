/* =========================================================
   数学建模算法几何与直角坐标系图解库 (SVG Vector Diagrams)
   为全部 18 个算法提供直观的直角坐标系图、几何投影图与机理示意图，
   将抽象晦涩的数学公式转化为一目了然的几何直观（一图胜千言）。
   ========================================================= */
window.ALGO_DIAGRAMS = {
  /* 1. TOPSIS：二维标准化直角坐标系中的正/负理想解与欧氏距离图解 */
  topsis: {
    title: '📐 几何直观图解：二维指标直角坐标系中的正理想解 Z⁺、负理想解 Z⁻ 与贴近度 Sᵢ',
    caption: '在标准化直角坐标系 (z₁, z₂) 中，右上角 Z⁺ 是各项指标均取最大值的“虚拟满分标杆”，左下角 Z⁻ 是“虚拟最劣标杆”。方案 Pᵢ 到 Z⁺ 的距离为 Dᵢ⁺（红虚线，越小越好），到 Z⁻ 的距离为 Dᵢ⁻（绿实线，越大越好）。',
    svg: `<svg viewBox="0 0 640 270" class=" diagram-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="arr-top" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#475569"/>
        </marker>
      </defs>
      <!-- 背景网格 -->
      <rect x="60" y="25" width="230" height="200" fill="#f8fafc" stroke="#e2e8f0" rx="4"/>
      <g stroke="#e2e8f0" stroke-width="1" stroke-dasharray="3,3">
        <line x1="115" y1="25" x2="115" y2="225"/><line x1="175" y1="25" x2="175" y2="225"/><line x1="235" y1="25" x2="235" y2="225"/>
        <line x1="60" y1="75" x2="290" y2="75"/><line x1="60" y1="125" x2="290" y2="125"/><line x1="60" y1="175" x2="290" y2="175"/>
      </g>
      <!-- 直角坐标轴 -->
      <line x1="60" y1="225" x2="305" y2="225" stroke="#334155" stroke-width="2" marker-end="url(#arr-top)"/>
      <line x1="60" y1="225" x2="60" y2="15" stroke="#334155" stroke-width="2" marker-end="url(#arr-top)"/>
      <text x="295" y="245" font-size="12" font-weight="700" fill="#1e293b">指标 1 标准化值 z₁</text>
      <text x="15" y="22" font-size="12" font-weight="700" fill="#1e293b">指标 2 (z₂)</text>
      <!-- 负理想解 Z- 与正理想解 Z+ 辅助框 -->
      <rect x="85" y="50" width="180" height="150" fill="rgba(99,102,241,0.04)" stroke="#94a3b8" stroke-dasharray="4,4"/>
      <!-- 距离连线 Di- 与 Di+ -->
      <line x1="85" y1="200" x2="205" y2="105" stroke="#10b981" stroke-width="2.5"/>
      <line x1="205" y1="105" x2="265" y2="50" stroke="#ef4444" stroke-width="2.5" stroke-dasharray="6,4"/>
      <!-- 距离标签 -->
      <rect x="122" y="142" width="56" height="20" rx="4" fill="#ecfdf5" stroke="#10b981"/>
      <text x="150" y="156" font-size="11.5" font-weight="700" fill="#059669" text-anchor="middle">Dᵢ⁻ (远)</text>
      <rect x="216" y="65" width="56" height="20" rx="4" fill="#fef2f2" stroke="#ef4444"/>
      <text x="244" y="79" font-size="11.5" font-weight="700" fill="#dc2626" text-anchor="middle">Dᵢ⁺ (近)</text>
      <!-- 其他备选点 -->
      <circle cx="130" cy="160" r="4.5" fill="#94a3b8"/>
      <text x="138" y="164" font-size="11" fill="#64748b">方案 P₂</text>
      <circle cx="155" cy="85" r="4.5" fill="#94a3b8"/>
      <text x="110" y="88" font-size="11" fill="#64748b">方案 P₃</text>
      <!-- 负理想解 Z- -->
      <circle cx="85" cy="200" r="7" fill="#dc2626" stroke="#fff" stroke-width="2"/>
      <text x="96" y="214" font-size="12" font-weight="700" fill="#dc2626">负理想解 Z⁻ (min z₁, min z₂)</text>
      <!-- 正理想解 Z+ -->
      <circle cx="265" cy="50" r="7" fill="#16a34a" stroke="#fff" stroke-width="2"/>
      <text x="175" y="42" font-size="12" font-weight="700" fill="#16a34a">正理想解 Z⁺ (max z₁, max z₂)</text>
      <!-- 当前评价对象 Pi -->
      <circle cx="205" cy="105" r="6.5" fill="#4f46e5" stroke="#fff" stroke-width="2"/>
      <text x="215" y="112" font-size="12.5" font-weight="700" fill="#4f46e5">方案 Pᵢ (zᵢ₁, zᵢ₂)</text>

      <!-- 右侧：中间型与区间型正向化直角坐标系图 -->
      <line x1="355" y1="125" x2="485" y2="125" stroke="#334155" stroke-width="1.5" marker-end="url(#arr-top)"/>
      <line x1="365" y1="130" x2="365" y2="30" stroke="#334155" stroke-width="1.5" marker-end="url(#arr-top)"/>
      <polyline points="375,125 420,45 465,125" fill="rgba(99,102,241,0.12)" stroke="#6366f1" stroke-width="2.5"/>
      <line x1="420" y1="45" x2="420" y2="125" stroke="#6366f1" stroke-dasharray="3,3"/>
      <text x="420" y="38" font-size="11" font-weight="700" fill="#4f46e5" text-anchor="middle">正向化值 1</text>
      <text x="420" y="140" font-size="11" font-weight="700" fill="#1e293b" text-anchor="middle">x_best</text>
      <text x="420" y="156" font-size="11.5" font-weight="700" fill="#475569" text-anchor="middle">① 中间型正向化（三角形折线）</text>

      <line x1="495" y1="125" x2="628" y2="125" stroke="#334155" stroke-width="1.5" marker-end="url(#arr-top)"/>
      <line x1="505" y1="130" x2="505" y2="30" stroke="#334155" stroke-width="1.5" marker-end="url(#arr-top)"/>
      <polyline points="512,125 540,45 582,45 610,125" fill="rgba(16,185,129,0.12)" stroke="#10b981" stroke-width="2.5"/>
      <line x1="540" y1="45" x2="540" y2="125" stroke="#10b981" stroke-dasharray="3,3"/>
      <line x1="582" y1="45" x2="582" y2="125" stroke="#10b981" stroke-dasharray="3,3"/>
      <text x="561" y="38" font-size="11" font-weight="700" fill="#059669" text-anchor="middle">区间内得满分 1</text>
      <text x="540" y="140" font-size="11" font-weight="700" fill="#1e293b" text-anchor="middle">a</text>
      <text x="582" y="140" font-size="11" font-weight="700" fill="#1e293b" text-anchor="middle">b</text>
      <text x="561" y="156" font-size="11.5" font-weight="700" fill="#475569" text-anchor="middle">② 区间型正向化（梯形折线）</text>

      <!-- 右下：相对贴近度一维比例尺示意 -->
      <rect x="355" y="178" width="270" height="58" rx="8" fill="#f8fafc" stroke="#e2e8f0"/>
      <text x="490" y="198" font-size="12" font-weight="700" fill="#334155" text-anchor="middle">贴近度公式几何本质：Sᵢ = Dᵢ⁻ / (Dᵢ⁻ + Dᵢ⁺) ∈ [0, 1]</text>
      <line x1="380" y1="216" x2="515" y2="216" stroke="#10b981" stroke-width="5" stroke-linecap="round"/>
      <line x1="515" y1="216" x2="600" y2="216" stroke="#ef4444" stroke-width="5" stroke-linecap="round"/>
      <circle cx="380" cy="216" r="5" fill="#dc2626"/><circle cx="515" cy="216" r="5.5" fill="#4f46e5"/><circle cx="600" cy="216" r="5" fill="#16a34a"/>
      <text x="380" y="231" font-size="10.5" fill="#dc2626" text-anchor="middle">Z⁻(0)</text>
      <text x="515" y="231" font-size="10.5" font-weight="700" fill="#4f46e5" text-anchor="middle">Pᵢ (Sᵢ≈0.62)</text>
      <text x="600" y="231" font-size="10.5" fill="#16a34a" text-anchor="middle">Z⁺(1)</text>
    </svg>`
  },

  /* 2. AHP：递阶层次结构树与一致性比率 CR 检验标尺图解 */
  ahp: {
    title: '📐 结构与几何图解：AHP 三层递阶决策树与判断矩阵一致性检验标尺',
    caption: '左侧展示“目标层 O → 准则层 C → 方案层 A”的权重自上而下乘法合成；右侧展示互反矩阵对角对称关系（aⱼᵢ = 1/aᵢⱼ）及一致性比率 CR = CI/RI < 0.10 的判定区间。',
    svg: `<svg viewBox="0 0 640 245" class="diagram-svg" xmlns="http://www.w3.org/2000/svg">
      <!-- 左侧层次结构树 -->
      <rect x="15" y="15" width="330" height="215" rx="10" fill="#f8fafc" stroke="#e2e8f0"/>
      <text x="180" y="35" font-size="12.5" font-weight="700" fill="#1e293b" text-anchor="middle">① 递阶层次结构与权重合成 Wₖ = Σ bⱼ·wₖⱼ</text>
      <!-- 连线 -->
      <g stroke="#94a3b8" stroke-width="1.6">
        <line x1="180" y1="72" x2="80" y2="115"/><line x1="180" y1="72" x2="180" y2="115"/><line x1="180" y1="72" x2="280" y2="115"/>
        <line x1="80" y1="145" x2="95" y2="188"/><line x1="80" y1="145" x2="180" y2="188"/><line x1="80" y1="145" x2="265" y2="188"/>
        <line x1="180" y1="145" x2="95" y2="188"/><line x1="180" y1="145" x2="180" y2="188"/><line x1="180" y1="145" x2="265" y2="188"/>
        <line x1="280" y1="145" x2="95" y2="188"/><line x1="280" y1="145" x2="180" y2="188"/><line x1="280" y1="145" x2="265" y2="188"/>
      </g>
      <!-- 目标层 -->
      <rect x="115" y="46" width="130" height="28" rx="7" fill="#0ea5e9"/>
      <text x="180" y="64" font-size="12" font-weight="700" fill="#fff" text-anchor="middle">目标层 O（最优决策）</text>
      <!-- 准则层 -->
      <rect x="35" y="115" width="90" height="30" rx="6" fill="#6366f1"/>
      <text x="80" y="134" font-size="11.5" font-weight="700" fill="#fff" text-anchor="middle">准则 C₁ (b₁)</text>
      <rect x="135" y="115" width="90" height="30" rx="6" fill="#6366f1"/>
      <text x="180" y="134" font-size="11.5" font-weight="700" fill="#fff" text-anchor="middle">准则 C₂ (b₂)</text>
      <rect x="235" y="115" width="90" height="30" rx="6" fill="#6366f1"/>
      <text x="280" y="134" font-size="11.5" font-weight="700" fill="#fff" text-anchor="middle">准则 C₃ (b₃)</text>
      <!-- 方案层 -->
      <rect x="50" y="188" width="85" height="28" rx="6" fill="#0f172a"/>
      <text x="92" y="206" font-size="11.5" font-weight="700" fill="#fff" text-anchor="middle">方案 A₁ (W₁)</text>
      <rect x="140" y="188" width="85" height="28" rx="6" fill="#0f172a"/>
      <text x="182" y="206" font-size="11.5" font-weight="700" fill="#fff" text-anchor="middle">方案 A₂ (W₂)</text>
      <rect x="230" y="188" width="85" height="28" rx="6" fill="#0f172a"/>
      <text x="272" y="206" font-size="11.5" font-weight="700" fill="#fff" text-anchor="middle">方案 A₃ (W₃)</text>

      <!-- 右侧：正互反矩阵与一致性标尺 -->
      <rect x="360" y="15" width="265" height="215" rx="10" fill="#f8fafc" stroke="#e2e8f0"/>
      <text x="492" y="35" font-size="12.5" font-weight="700" fill="#1e293b" text-anchor="middle">② 正互反矩阵对称性与 CR 检验标尺</text>
      <!-- 3x3 示意矩阵 -->
      <rect x="405" y="48" width="175" height="84" rx="6" fill="#fff" stroke="#cbd5e1"/>
      <text x="435" y="68" font-size="12" font-weight="700" fill="#64748b" text-anchor="middle">1</text>
      <text x="492" y="68" font-size="12" font-weight="700" fill="#0284c7" text-anchor="middle">a₁₂ = 3</text>
      <text x="550" y="68" font-size="12" font-weight="700" fill="#0284c7" text-anchor="middle">a₁₃ = 6</text>
      <text x="435" y="94" font-size="12" font-weight="700" fill="#e11d48" text-anchor="middle">1/3</text>
      <text x="492" y="94" font-size="12" font-weight="700" fill="#64748b" text-anchor="middle">1</text>
      <text x="550" y="94" font-size="12" font-weight="700" fill="#0284c7" text-anchor="middle">a₂₃ = 2</text>
      <text x="435" y="120" font-size="12" font-weight="700" fill="#e11d48" text-anchor="middle">1/6</text>
      <text x="492" y="120" font-size="12" font-weight="700" fill="#e11d48" text-anchor="middle">1/2</text>
      <text x="550" y="120" font-size="12" font-weight="700" fill="#64748b" text-anchor="middle">1</text>
      <line x1="412" y1="53" x2="572" y2="127" stroke="#94a3b8" stroke-dasharray="3,3"/>

      <!-- CR 一致性数轴 -->
      <text x="492" y="154" font-size="11.5" font-weight="700" fill="#334155" text-anchor="middle">一致性比率 CR = (λ_max − n) / [(n − 1)·RI]</text>
      <rect x="382" y="168" width="125" height="16" rx="4" fill="#dcfce7" stroke="#16a34a"/>
      <rect x="507" y="168" width="98" height="16" rx="4" fill="#fee2e2" stroke="#dc2626"/>
      <line x1="507" y1="162" x2="507" y2="192" stroke="#dc2626" stroke-width="2.5"/>
      <text x="382" y="202" font-size="10.5" font-weight="700" fill="#15803d">CR=0 (λ_max=n 完美一致)</text>
      <text x="507" y="216" font-size="11" font-weight="800" fill="#dc2626" text-anchor="middle">阈值 CR = 0.10</text>
      <text x="565" y="202" font-size="10.5" font-weight="700" fill="#b91c1c" text-anchor="middle">CR≥0.1 矛盾需调</text>
    </svg>`
  },

  /* 3. 熵权法：直角坐标系下数据离散度与信息熵 e_j、权重 w_j 的映射关系 */
  entropy: {
    title: '📐 直角坐标系图解：指标数据离散程度 vs. 信息熵 eⱼ 与客观熵权 wⱼ',
    caption: '左图在样本坐标系中对比两个指标：指标 1 剧烈波动（区分度极强）→ 信息熵 e₁ 小 → 差异系数 d₁=1−e₁ 大 → 赋予高权重；指标 2 几乎持平（大家得分雷同）→ 信息熵 e₂≈1 → 赋予极低权重。',
    svg: `<svg viewBox="0 0 640 245" class="diagram-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="arr-ent" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#334155"/>
        </marker>
      </defs>
      <!-- 左：样本取值分布直角坐标系 -->
      <rect x="50" y="25" width="250" height="180" fill="#f8fafc" stroke="#e2e8f0"/>
      <line x1="50" y1="205" x2="312" y2="205" stroke="#334155" stroke-width="2" marker-end="url(#arr-ent)"/>
      <line x1="50" y1="205" x2="50" y2="15" stroke="#334155" stroke-width="2" marker-end="url(#arr-ent)"/>
      <text x="175" y="228" font-size="12" font-weight="700" fill="#1e293b" text-anchor="middle">评价对象样本 i = 1, 2, ..., n</text>
      <text x="20" y="22" font-size="12" font-weight="700" fill="#1e293b">标准化值 zᵢⱼ</text>
      <!-- 指标 2：几乎水平（无区分度） -->
      <polyline points="75,118 125,114 175,121 225,116 275,119" fill="none" stroke="#94a3b8" stroke-width="2.5" stroke-dasharray="5,4"/>
      <circle cx="75" cy="118" r="4" fill="#94a3b8"/><circle cx="125" cy="114" r="4" fill="#94a3b8"/><circle cx="175" cy="121" r="4" fill="#94a3b8"/><circle cx="225" cy="116" r="4" fill="#94a3b8"/><circle cx="275" cy="119" r="4" fill="#94a3b8"/>
      <text x="180" y="138" font-size="11.5" font-weight="700" fill="#64748b" text-anchor="middle">指标 B：全员雷同 (e_B ≈ 0.98 → 权重极低)</text>
      <!-- 指标 1：剧烈波动（高区分度） -->
      <polyline points="75,185 125,45 175,165 225,38 275,90" fill="none" stroke="#0d9488" stroke-width="3"/>
      <circle cx="75" cy="185" r="5" fill="#0d9488"/><circle cx="125" cy="45" r="5" fill="#0d9488"/><circle cx="175" cy="165" r="5" fill="#0d9488"/><circle cx="225" cy="38" r="5" fill="#0d9488"/><circle cx="275" cy="90" r="5" fill="#0d9488"/>
      <text x="175" y="34" font-size="11.5" font-weight="700" fill="#0f766e" text-anchor="middle">指标 A：差距悬殊 (e_A = 0.42 → 权重极高)</text>

      <!-- 右：函数曲线 d_j = 1 - e_j 直角坐标系 -->
      <rect x="365" y="25" width="240" height="180" fill="#f8fafc" stroke="#e2e8f0"/>
      <line x1="365" y1="205" x2="618" y2="205" stroke="#334155" stroke-width="2" marker-end="url(#arr-ent)"/>
      <line x1="365" y1="205" x2="365" y2="15" stroke="#334155" stroke-width="2" marker-end="url(#arr-ent)"/>
      <text x="485" y="228" font-size="12" font-weight="700" fill="#1e293b" text-anchor="middle">信息熵 eⱼ ∈ [0, 1]（越大越雷同）</text>
      <text x="395" y="22" font-size="12" font-weight="700" fill="#1e293b">信息效用 dⱼ = 1 − eⱼ</text>
      <!-- 直线 d = 1 - e -->
      <line x1="365" y1="45" x2="585" y2="205" stroke="#0ea5e9" stroke-width="3"/>
      <!-- 标出指标 A 和 指标 B -->
      <circle cx="457" cy="112" r="6" fill="#0d9488" stroke="#fff" stroke-width="2"/>
      <line x1="457" y1="112" x2="457" y2="205" stroke="#0d9488" stroke-dasharray="3,3"/>
      <text x="470" y="105" font-size="11.5" font-weight="700" fill="#0f766e">指标 A (d_A 大 → w_A 大)</text>
      <circle cx="578" cy="200" r="6" fill="#64748b" stroke="#fff" stroke-width="2"/>
      <text x="530" y="185" font-size="11.5" font-weight="700" fill="#64748b">指标 B (e_B→1, d_B→0)</text>
      <text x="352" y="50" font-size="11" font-weight="700" fill="#334155">1</text>
      <text x="585" y="220" font-size="11" font-weight="700" fill="#334155">1</text>
    </svg>`
  },

  /* 4. 模糊综合评价 FCE：梯形模糊隶属度函数直角坐标系图解 */
  fce: {
    title: '📐 直角坐标系图解：梯形模糊隶属函数 μ(x) 将定量指标映射为各等级隶属度向量',
    caption: '横轴为某评价指标的实测值 x（如百分制得分或水质溶氧量），纵轴为隶属度 μ∈[0,1]。实测值 x₀=82 竖直向上与“良”“优”两条隶属曲线相交，直接读出该指标属于【差, 中, 良, 优】的隶属度行向量 Rᵢ = (0, 0, 0.65, 0.35)。',
    svg: `<svg viewBox="0 0 640 245" class="diagram-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="arr-fce" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#334155"/>
        </marker>
      </defs>
      <rect x="55" y="30" width="540" height="170" fill="#f8fafc" stroke="#e2e8f0"/>
      <!-- 坐标轴 -->
      <line x1="55" y1="200" x2="610" y2="200" stroke="#334155" stroke-width="2" marker-end="url(#arr-fce)"/>
      <line x1="55" y1="200" x2="55" y2="18" stroke="#334155" stroke-width="2" marker-end="url(#arr-fce)"/>
      <text x="330" y="232" font-size="12" font-weight="700" fill="#1e293b" text-anchor="middle">指标实测数值 x（例如得分/环境浓度）</text>
      <text x="35" y="22" font-size="12" font-weight="700" fill="#1e293b">隶属度 μ(x)</text>
      <text x="42" y="55" font-size="11.5" font-weight="700" fill="#334155">1.0</text>
      <text x="42" y="204" font-size="11.5" font-weight="700" fill="#334155">0</text>
      <line x1="55" y1="50" x2="595" y2="50" stroke="#cbd5e1" stroke-dasharray="4,4"/>

      <!-- 4 个等级的梯形隶属函数曲线 -->
      <!-- 差 (v4) -->
      <polyline points="55,50 130,50 200,200" fill="rgba(239,68,68,0.10)" stroke="#ef4444" stroke-width="2.5"/>
      <text x="105" y="42" font-size="12" font-weight="700" fill="#dc2626" text-anchor="middle">等级 v₄ (差)</text>
      <!-- 中 (v3) -->
      <polyline points="140,200 210,50 280,50 350,200" fill="rgba(245,158,11,0.10)" stroke="#f59e0b" stroke-width="2.5"/>
      <text x="245" y="42" font-size="12" font-weight="700" fill="#d97706" text-anchor="middle">等级 v₃ (中)</text>
      <!-- 良 (v2) -->
      <polyline points="290,200 365,50 435,50 515,200" fill="rgba(14,165,233,0.10)" stroke="#0ea5e9" stroke-width="2.5"/>
      <text x="400" y="42" font-size="12" font-weight="700" fill="#0284c7" text-anchor="middle">等级 v₂ (良)</text>
      <!-- 优 (v1) -->
      <polyline points="445,200 525,50 595,50" fill="rgba(16,185,129,0.10)" stroke="#10b981" stroke-width="2.5"/>
      <text x="550" y="42" font-size="12" font-weight="700" fill="#059669" text-anchor="middle">等级 v₁ (优)</text>

      <!-- 观测点 x0 竖直截线 -->
      <line x1="473" y1="50" x2="473" y2="200" stroke="#4f46e5" stroke-width="2" stroke-dasharray="4,3"/>
      <circle cx="473" cy="121" r="6" fill="#0ea5e9" stroke="#fff" stroke-width="2"/>
      <circle cx="473" cy="147" r="6" fill="#10b981" stroke="#fff" stroke-width="2"/>
      <text x="473" y="216" font-size="12" font-weight="800" fill="#4f46e5" text-anchor="middle">实测值 x₀</text>
      <rect x="355" y="92" width="110" height="22" rx="5" fill="#e0f2fe" stroke="#0284c7"/>
      <text x="410" y="107" font-size="11" font-weight="700" fill="#0369a1" text-anchor="middle">r_i(良) = 0.65</text>
      <rect x="482" y="138" width="108" height="22" rx="5" fill="#dcfce7" stroke="#16a34a"/>
      <text x="536" y="153" font-size="11" font-weight="700" fill="#15803d" text-anchor="middle">r_i(优) = 0.35</text>
    </svg>`
  },

  /* 5. 灰色关联分析 GRA：时间序列直角坐标系中曲线几何形状贴合度与点差 Δ_i(k) */
  gra: {
    title: '📐 直角坐标系图解：参考母序列 X₀ 与比较子序列 X₁、X₂ 的几何形状相似度及绝对差 Δᵢ(k)',
    caption: '均值化无量纲处理后，所有序列在同一坐标系 (k, x\') 中围绕 1 波动：X₁（绿线）与母序列 X₀（蓝粗线）几何走势高度同步，各时刻竖直距离 Δ₁(k) 很小 → 关联系数 ξ₁(k) 接近 1；X₂（灰虚线）走势背离，距离 Δ₂(k) 大 → 关联度低。',
    svg: `<svg viewBox="0 0 640 250" class="diagram-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="arr-gra" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#334155"/>
        </marker>
      </defs>
      <rect x="55" y="22" width="545" height="190" fill="#f8fafc" stroke="#e2e8f0"/>
      <line x1="55" y1="212" x2="615" y2="212" stroke="#334155" stroke-width="2" marker-end="url(#arr-gra)"/>
      <line x1="55" y1="212" x2="55" y2="12" stroke="#334155" stroke-width="2" marker-end="url(#arr-gra)"/>
      <text x="335" y="238" font-size="12" font-weight="700" fill="#1e293b" text-anchor="middle">时刻 / 指标序号 k = 1, 2, 3, 4, 5</text>
      <text x="20" y="20" font-size="12" font-weight="700" fill="#1e293b">均值化序列 x'(k)</text>

      <!-- 比较序列 X2（偏离大） -->
      <polyline points="95,165 210,175 325,130 440,155 555,140" fill="none" stroke="#94a3b8" stroke-width="2.2" stroke-dasharray="6,4"/>
      <text x="515" y="165" font-size="11.5" font-weight="700" fill="#64748b">子序列 X₂ (形状背离，r₂ 小)</text>

      <!-- 母序列 X0 -->
      <polyline points="95,180 210,140 325,95 440,68 555,38" fill="none" stroke="#2563eb" stroke-width="3.2"/>
      <circle cx="95" cy="180" r="5" fill="#2563eb"/><circle cx="210" cy="140" r="5" fill="#2563eb"/><circle cx="325" cy="95" r="5" fill="#2563eb"/><circle cx="440" cy="68" r="5" fill="#2563eb"/><circle cx="555" cy="38" r="5" fill="#2563eb"/>
      <text x="415" y="45" font-size="12" font-weight="800" fill="#1d4ed8">母序列 X₀ (参考基准曲线)</text>

      <!-- 比较序列 X1（紧贴母序列） -->
      <polyline points="95,186 210,152 325,112 440,84 555,54" fill="none" stroke="#10b981" stroke-width="2.8"/>
      <circle cx="95" cy="186" r="4.5" fill="#10b981"/><circle cx="210" cy="152" r="4.5" fill="#10b981"/><circle cx="325" cy="112" r="4.5" fill="#10b981"/><circle cx="440" cy="84" r="4.5" fill="#10b981"/><circle cx="555" cy="54" r="4.5" fill="#10b981"/>
      <text x="295" y="132" font-size="12" font-weight="700" fill="#059669">子序列 X₁ (几何形状紧贴 X₀，关联度 r₁ 最大)</text>

      <!-- 标出最小差 a、当前点差 Δ1(3) 与最大差 b -->
      <line x1="95" y1="180" x2="95" y2="186" stroke="#16a34a" stroke-width="3"/>
      <text x="135" y="196" font-size="11" font-weight="700" fill="#15803d">两级最小差 a</text>
      <line x1="440" y1="68" x2="440" y2="155" stroke="#ef4444" stroke-width="2.2" stroke-dasharray="3,2"/>
      <rect x="448" y="102" width="84" height="20" rx="4" fill="#fef2f2" stroke="#ef4444"/>
      <text x="490" y="116" font-size="11" font-weight="700" fill="#dc2626" text-anchor="middle">点差 Δ₂(4) 大</text>
      <line x1="555" y1="38" x2="555" y2="140" stroke="#dc2626" stroke-width="2.5"/>
      <text x="508" y="96" font-size="11" font-weight="800" fill="#b91c1c">两级最大差 b</text>
    </svg>`
  },

  /* 6. 一元线性回归：直角坐标系最小二乘竖直残差 e_i 与喇叭口预测区间图解 */
  linear: {
    title: '📐 直角坐标系图解：最小二乘回归直线、竖直残差 eᵢ = yᵢ − ŷᵢ 与 95% 双曲预测置信带',
    caption: '在直角坐标系 (x, y) 中，最小二乘法寻找唯一一条穿过样本中心点 (x̄, ȳ) 的直线，使所有观测点到直线的竖直红线长度平方和 Σeᵢ² 最小；灰色阴影带展示离中心 x̄ 越远、预测不确定性越呈喇叭口张开。',
    svg: `<svg viewBox="0 0 640 255" class="diagram-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="arr-lr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#334155"/>
        </marker>
      </defs>
      <rect x="55" y="20" width="545" height="195" fill="#f8fafc" stroke="#e2e8f0"/>
      <line x1="55" y1="215" x2="615" y2="215" stroke="#334155" stroke-width="2" marker-end="url(#arr-lr)"/>
      <line x1="55" y1="215" x2="55" y2="12" stroke="#334155" stroke-width="2" marker-end="url(#arr-lr)"/>
      <text x="335" y="240" font-size="12" font-weight="700" fill="#1e293b" text-anchor="middle">自变量 x（中心点 x̄ 处置信带最窄）</text>
      <text x="20" y="20" font-size="12" font-weight="700" fill="#1e293b">因变量 y</text>

      <!-- 95% 双曲喇叭口置信带 -->
      <path d="M 85 162 Q 320 112 565 25 L 565 78 Q 320 132 85 204 Z" fill="rgba(249,115,22,0.12)" stroke="#fdba74" stroke-width="1.5" stroke-dasharray="4,4"/>
      <!-- 回归直线 -->
      <line x1="85" y1="183" x2="565" y2="51" stroke="#ea580c" stroke-width="3"/>
      <text x="465" y="42" font-size="12.5" font-weight="800" fill="#c2410c">回归直线 ŷ = β̂₀ + β̂₁x</text>

      <!-- 竖直残差线段 e_i = y_i - y_hat_i -->
      <line x1="140" y1="138" x2="140" y2="168" stroke="#e11d48" stroke-width="2.2"/>
      <circle cx="140" cy="138" r="5" fill="#1e293b"/>
      <text x="148" y="155" font-size="11" font-weight="700" fill="#e11d48">残差 e₁</text>

      <line x1="230" y1="172" x2="230" y2="143" stroke="#e11d48" stroke-width="2.2"/>
      <circle cx="230" cy="172" r="5" fill="#1e293b"/>
      <text x="238" y="165" font-size="11" font-weight="700" fill="#e11d48">e₂ = y₂ − ŷ₂</text>

      <!-- 样本中心点 (x_bar, y_bar) -->
      <circle cx="325" cy="117" r="7" fill="#2563eb" stroke="#fff" stroke-width="2"/>
      <line x1="325" y1="117" x2="325" y2="215" stroke="#2563eb" stroke-dasharray="3,3"/>
      <text x="325" y="102" font-size="12" font-weight="800" fill="#1d4ed8" text-anchor="middle">必过样本中心 (x̄, ȳ)</text>

      <line x1="430" y1="58" x2="430" y2="88" stroke="#e11d48" stroke-width="2.2"/>
      <circle cx="430" cy="58" r="5" fill="#1e293b"/>
      <text x="438" y="75" font-size="11" font-weight="700" fill="#e11d48">残差 eᵢ (最小化 Σeᵢ²)</text>

      <line x1="515" y1="88" x2="515" y2="65" stroke="#e11d48" stroke-width="2.2"/>
      <circle cx="515" cy="88" r="5" fill="#1e293b"/>
    </svg>`
  },

  /* 7. 多元线性回归：三维直角坐标系回归平面与列空间正交投影图解 */
  multiple: {
    title: '📐 三维直角坐标系与几何投影图解：多元回归超平面 ŷ = β₀ + β₁x₁ + β₂x₂ 与正交残差向量',
    caption: '左图展示双自变量下回归方程在三维直角坐标系 (x₁, x₂, y) 中张成一个倾斜平面；右图展示正规方程 β̂=(XᵀX)⁻¹Xᵀy 的几何本质——将真实观测向量 y 垂直投影到自变量列空间 span(X) 上，使残差向量 e = y − Xβ̂ 与平面严格垂直（正交）从而最短。',
    svg: `<svg viewBox="0 0 640 250" class="diagram-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="arr-mlr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#334155"/>
        </marker>
        <marker id="arr-mlr-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#2563eb"/>
        </marker>
      </defs>
      <!-- 左：3D 直角坐标系回归平面 -->
      <rect x="15" y="15" width="300" height="220" rx="8" fill="#f8fafc" stroke="#e2e8f0"/>
      <text x="165" y="34" font-size="12" font-weight="700" fill="#1e293b" text-anchor="middle">① 三维空间 (x₁, x₂, y) 最小二乘拟合平面</text>
      <!-- 3D 坐标轴 -->
      <line x1="85" y1="175" x2="85" y2="45" stroke="#334155" stroke-width="2" marker-end="url(#arr-mlr)"/>
      <line x1="85" y1="175" x2="275" y2="195" stroke="#334155" stroke-width="2" marker-end="url(#arr-mlr)"/>
      <line x1="85" y1="175" x2="30" y2="218" stroke="#334155" stroke-width="2" marker-end="url(#arr-mlr)"/>
      <text x="72" y="52" font-size="12" font-weight="700" fill="#1e293b">y</text>
      <text x="278" y="200" font-size="12" font-weight="700" fill="#1e293b">x₁</text>
      <text x="32" y="205" font-size="12" font-weight="700" fill="#1e293b">x₂</text>
      <!-- 回归平面多边形 -->
      <polygon points="85,140 245,105 210,165 50,195" fill="rgba(168,85,247,0.18)" stroke="#9333ea" stroke-width="2"/>
      <!-- 样本点及到平面的竖直残差垂线 -->
      <line x1="155" y1="82" x2="155" y2="132" stroke="#e11d48" stroke-width="2.2"/>
      <circle cx="155" cy="82" r="5" fill="#e11d48"/>
      <circle cx="155" cy="132" r="3.5" fill="#9333ea"/>
      <text x="163" y="105" font-size="11" font-weight="700" fill="#e11d48">残差 eᵢ</text>
      <line x1="195" y1="168" x2="195" y2="135" stroke="#e11d48" stroke-width="2"/>
      <circle cx="195" cy="168" r="4.5" fill="#1e293b"/>

      <!-- 右：矩阵列空间正交投影图解 -->
      <rect x="330" y="15" width="295" height="220" rx="8" fill="#f8fafc" stroke="#e2e8f0"/>
      <text x="477" y="34" font-size="12" font-weight="700" fill="#1e293b" text-anchor="middle">② 矩阵公式几何本质：正交投影 Xᵀ(y − Xβ̂) = 0</text>
      <polygon points="350,195 430,130 605,130 525,195" fill="rgba(37,99,235,0.10)" stroke="#60a5fa" stroke-width="1.8"/>
      <text x="515" y="185" font-size="11.5" font-weight="700" fill="#1d4ed8">自变量列空间 span(X)</text>
      <!-- 原点 O 到 y 和 y_hat -->
      <line x1="395" y1="175" x2="515" y2="152" stroke="#2563eb" stroke-width="3" marker-end="url(#arr-mlr-blue)"/>
      <line x1="395" y1="175" x2="515" y2="62" stroke="#0f172a" stroke-width="2.5" marker-end="url(#arr-mlr)"/>
      <!-- 垂直投影线 e = y - X*beta_hat -->
      <line x1="515" y1="152" x2="515" y2="65" stroke="#e11d48" stroke-width="2.5" stroke-dasharray="5,3"/>
      <!-- 直角符号 -->
      <polyline points="503,154 503,142 515,142" fill="none" stroke="#e11d48" stroke-width="1.8"/>
      <text x="430" y="102" font-size="12" font-weight="700" fill="#0f172a">真实向量 y</text>
      <text x="445" y="172" font-size="12" font-weight="700" fill="#2563eb">投影预测 ŷ = Xβ̂</text>
      <text x="524" y="112" font-size="11.5" font-weight="700" fill="#e11d48">正交残差 e ⊥ X</text>
    </svg>`
  },

  /* 8. 非线性回归：直角坐标系下 Logistic S形饱和曲线、指数与对数曲线家族图解 */
  nonlinear: {
    title: '📐 直角坐标系图解：Logistic S形饱和曲线（环境容量 K 与拐点 K/2）、指数增长与对数曲线形态对比',
    caption: '在直角坐标系 (x, y) 中直观对比三类典型非线性函数：① Logistic 曲线呈 S 形，在 y=K/2 拐点处增速达到最快，随后受阻趋近于水平渐近线 y=K；② 指数函数 y=aeᵇˣ 增速越来越快无上限；③ 对数函数 y=a+b ln(x) 先快后慢但无水平上界。',
    svg: `<svg viewBox="0 0 640 250" class="diagram-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="arr-nlr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#334155"/>
        </marker>
      </defs>
      <rect x="60" y="22" width="540" height="190" fill="#f8fafc" stroke="#e2e8f0"/>
      <line x1="60" y1="212" x2="615" y2="212" stroke="#334155" stroke-width="2" marker-end="url(#arr-nlr)"/>
      <line x1="60" y1="212" x2="60" y2="12" stroke="#334155" stroke-width="2" marker-end="url(#arr-nlr)"/>
      <text x="335" y="238" font-size="12" font-weight="700" fill="#1e293b" text-anchor="middle">时间 / 自变量 x</text>
      <text x="22" y="22" font-size="12" font-weight="700" fill="#1e293b">因变量 y</text>

      <!-- 环境最大容量 K 水平渐近线 -->
      <line x1="60" y1="52" x2="595" y2="52" stroke="#dc2626" stroke-width="1.8" stroke-dasharray="6,4"/>
      <text x="515" y="44" font-size="11.5" font-weight="800" fill="#dc2626">饱和渐近线 y = K（最大容纳量）</text>
      <text x="42" y="56" font-size="12" font-weight="800" fill="#dc2626">K</text>

      <!-- 半饱和拐点线 K/2 -->
      <line x1="60" y1="132" x2="310" y2="132" stroke="#94a3b8" stroke-dasharray="3,3"/>
      <line x1="310" y1="132" x2="310" y2="212" stroke="#94a3b8" stroke-dasharray="3,3"/>
      <text x="32" y="136" font-size="11.5" font-weight="700" fill="#475569">K/2</text>

      <!-- 指数增长曲线 -->
      <path d="M 65 198 Q 190 190 255 25" fill="none" stroke="#8b5cf6" stroke-width="2.4" stroke-dasharray="5,3"/>
      <text x="205" y="38" font-size="11.5" font-weight="700" fill="#7c3aed">指数增长 y = a·eᵇˣ (无上限)</text>

      <!-- Logistic S 形曲线 -->
      <path d="M 65 202 C 195 200, 240 165, 310 132 C 380 99, 435 56, 585 54" fill="none" stroke="#ea580c" stroke-width="3.2"/>
      <circle cx="310" cy="132" r="6" fill="#ea580c" stroke="#fff" stroke-width="2"/>
      <text x="322" y="126" font-size="11.5" font-weight="800" fill="#c2410c">S形拐点 (y=K/2, 增速最快)</text>
      <text x="475" y="75" font-size="12" font-weight="800" fill="#ea580c">Logistic: y = K/(1+ae⁻ᵇˣ)</text>

      <!-- 对数曲线 -->
      <path d="M 75 205 Q 160 140 585 115" fill="none" stroke="#0d9488" stroke-width="2.4"/>
      <text x="485" y="135" font-size="11.5" font-weight="700" fill="#0f766e">对数型 y = a + b·ln(x)</text>
    </svg>`
  },

  /* 9. 灰色预测 GM(1,1)：1-AGO 累加生成指数平滑与紧邻均值梯形面积图解 */
  gm11: {
    title: '📐 直角坐标系图解：一次累加生成 (1-AGO) 指数平滑效应与紧邻均值 z⁽¹⁾(k) 的梯形积分几何意义',
    caption: '左图展示原始序列 x⁽⁰⁾ 存在随机波动，经一次累加 x⁽¹⁾(k)=Σx⁽⁰⁾(i) 后呈光滑指数增长曲线；右图展示灰微分方程背景值 z⁽¹⁾(k)=½[x⁽¹⁾(k−1)+x⁽¹⁾(k)] 恰好是用梯形中位线面积近似连续积分 ∫x⁽¹⁾(t)dt。',
    svg: `<svg viewBox="0 0 640 245" class="diagram-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="arr-gm" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#334155"/>
        </marker>
      </defs>
      <!-- 左：1-AGO 累加前后对比 -->
      <rect x="45" y="25" width="265" height="180" fill="#f8fafc" stroke="#e2e8f0"/>
      <line x1="45" y1="205" x2="322" y2="205" stroke="#334155" stroke-width="2" marker-end="url(#arr-gm)"/>
      <line x1="45" y1="205" x2="45" y2="15" stroke="#334155" stroke-width="2" marker-end="url(#arr-gm)"/>
      <text x="180" y="230" font-size="12" font-weight="700" fill="#1e293b" text-anchor="middle">时间序号 k = 1, 2, ..., n</text>
      <!-- 原始序列 x(0) -->
      <polyline points="75,182 125,175 175,180 225,168 275,172" fill="none" stroke="#64748b" stroke-width="2.2" stroke-dasharray="4,3"/>
      <circle cx="75" cy="182" r="4" fill="#64748b"/><circle cx="125" cy="175" r="4" fill="#64748b"/><circle cx="175" cy="180" r="4" fill="#64748b"/><circle cx="225" cy="168" r="4" fill="#64748b"/><circle cx="275" cy="172" r="4" fill="#64748b"/>
      <text x="185" y="196" font-size="11.5" font-weight="700" fill="#475569" text-anchor="middle">原始序列 x⁽⁰⁾(k)（平缓/含随机波动）</text>
      <!-- 累加序列 x(1) -->
      <path d="M 75 182 Q 185 145 275 42" fill="none" stroke="#e11d48" stroke-width="3"/>
      <circle cx="75" cy="182" r="5" fill="#e11d48"/><circle cx="125" cy="158" r="5" fill="#e11d48"/><circle cx="175" cy="128" r="5" fill="#e11d48"/><circle cx="225" cy="90" r="5" fill="#e11d48"/><circle cx="275" cy="42" r="5" fill="#e11d48"/>
      <text x="165" y="65" font-size="12" font-weight="800" fill="#be123c">1-AGO 累加序列 x⁽¹⁾(k)（呈指数规律）</text>

      <!-- 右：紧邻均值 z(1)(k) 梯形面积几何意义 -->
      <rect x="360" y="25" width="250" height="180" fill="#f8fafc" stroke="#e2e8f0"/>
      <line x1="360" y1="205" x2="622" y2="205" stroke="#334155" stroke-width="2" marker-end="url(#arr-gm)"/>
      <line x1="360" y1="205" x2="360" y2="15" stroke="#334155" stroke-width="2" marker-end="url(#arr-gm)"/>
      <text x="485" y="230" font-size="12" font-weight="700" fill="#1e293b" text-anchor="middle">区间 [k−1, k] 上的梯形均值背景值</text>
      <!-- 梯形阴影 -->
      <polygon points="415,205 415,135 545,65 545,205" fill="rgba(225,29,72,0.12)" stroke="#f43f5e" stroke-width="2"/>
      <!-- 中位线 z(1)(k) -->
      <line x1="480" y1="100" x2="480" y2="205" stroke="#2563eb" stroke-width="2.5" stroke-dasharray="5,3"/>
      <circle cx="415" cy="135" r="5.5" fill="#e11d48"/>
      <circle cx="545" cy="65" r="5.5" fill="#e11d48"/>
      <circle cx="480" cy="100" r="6" fill="#2563eb" stroke="#fff" stroke-width="2"/>
      <text x="415" y="220" font-size="11.5" font-weight="700" fill="#334155" text-anchor="middle">k − 1</text>
      <text x="545" y="220" font-size="11.5" font-weight="700" fill="#334155" text-anchor="middle">k</text>
      <text x="405" y="125" font-size="11.5" font-weight="700" fill="#be123c" text-anchor="end">x⁽¹⁾(k−1)</text>
      <text x="552" y="60" font-size="11.5" font-weight="700" fill="#be123c">x⁽¹⁾(k)</text>
      <rect x="422" y="34" width="142" height="22" rx="5" fill="#dbeafe" stroke="#2563eb"/>
      <text x="493" y="49" font-size="11" font-weight="700" fill="#1d4ed8" text-anchor="middle">中位线高 = z⁽¹⁾(k)</text>
    </svg>`
  },

  /* 10. 时间序列 ARIMA：差分平稳化与 ACF/PACF 截尾置信带直角坐标系图解 */
  arima: {
    title: '📐 双直角坐标系图解：① 差分算子 ∇ᵈXₜ 消除非平稳趋势；② ACF/PACF 自相关图与 ±1.96/√N 截尾判定带',
    caption: '左图展示带趋势的非平稳序列 Xₜ 经一阶差分 wₜ = Xₜ − Xₜ₋₁ 后转化为围绕 0 上下波动的平稳序列；右图展示滞后阶数 k 坐标系下，前 2 阶柱子突破蓝色虚线阈值 ±1.96/√N、从第 3 阶起全部落入虚线带内，即判定为“2 阶截尾”。',
    svg: `<svg viewBox="0 0 640 245" class="diagram-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="arr-ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#334155"/>
        </marker>
      </defs>
      <!-- 左：原序列 vs 差分平稳序列 -->
      <rect x="40" y="25" width="265" height="180" fill="#f8fafc" stroke="#e2e8f0"/>
      <line x1="40" y1="205" x2="315" y2="205" stroke="#334155" stroke-width="2" marker-end="url(#arr-ar)"/>
      <line x1="40" y1="205" x2="40" y2="15" stroke="#334155" stroke-width="2" marker-end="url(#arr-ar)"/>
      <text x="172" y="228" font-size="12" font-weight="700" fill="#1e293b" text-anchor="middle">时间 t（差分将趋势拉平为平稳序列）</text>
      <!-- 原非平稳序列 -->
      <polyline points="55,155 90,138 125,145 160,112 195,95 230,102 265,62 295,42" fill="none" stroke="#6366f1" stroke-width="2.6"/>
      <text x="165" y="52" font-size="11.5" font-weight="700" fill="#4f46e5">原序列 Xₜ (非平稳上升)</text>
      <!-- 差分零均值线与差分序列 -->
      <line x1="40" y1="170" x2="305" y2="170" stroke="#94a3b8" stroke-dasharray="3,3"/>
      <polyline points="55,172 90,158 125,182 160,155 195,162 230,180 265,152 295,165" fill="none" stroke="#10b981" stroke-width="2.4"/>
      <text x="180" y="196" font-size="11.5" font-weight="700" fill="#059669">差分序列 wₜ = ∇Xₜ (平稳)</text>

      <!-- 右：ACF / PACF 截尾判定坐标系 -->
      <rect x="355" y="25" width="260" height="180" fill="#f8fafc" stroke="#e2e8f0"/>
      <line x1="355" y1="125" x2="625" y2="125" stroke="#334155" stroke-width="1.8" marker-end="url(#arr-ar)"/>
      <line x1="375" y1="205" x2="375" y2="15" stroke="#334155" stroke-width="2" marker-end="url(#arr-ar)"/>
      <text x="490" y="228" font-size="12" font-weight="700" fill="#1e293b" text-anchor="middle">滞后阶数 Lag k（ACF/PACF 定阶图）</text>
      <!-- 置信带 ±1.96/sqrt(N) -->
      <rect x="375" y="92" width="235" height="66" fill="rgba(59,130,246,0.10)"/>
      <line x1="375" y1="92" x2="610" y2="92" stroke="#2563eb" stroke-width="1.5" stroke-dasharray="5,3"/>
      <line x1="375" y1="158" x2="610" y2="158" stroke="#2563eb" stroke-width="1.5" stroke-dasharray="5,3"/>
      <text x="550" y="85" font-size="10.5" font-weight="700" fill="#1d4ed8">+1.96 / √N</text>
      <text x="550" y="172" font-size="10.5" font-weight="700" fill="#1d4ed8">−1.96 / √N</text>
      <!-- 自相关棒棒糖图 -->
      <line x1="405" y1="125" x2="405" y2="45" stroke="#e11d48" stroke-width="3.5"/><circle cx="405" cy="45" r="4.5" fill="#e11d48"/>
      <line x1="440" y1="125" x2="440" y2="68" stroke="#e11d48" stroke-width="3.5"/><circle cx="440" cy="68" r="4.5" fill="#e11d48"/>
      <line x1="475" y1="125" x2="475" y2="108" stroke="#64748b" stroke-width="3"/><circle cx="475" cy="108" r="4" fill="#64748b"/>
      <line x1="510" y1="125" x2="510" y2="140" stroke="#64748b" stroke-width="3"/><circle cx="510" cy="140" r="4" fill="#64748b"/>
      <line x1="545" y1="125" x2="545" y2="116" stroke="#64748b" stroke-width="3"/><circle cx="545" cy="116" r="4" fill="#64748b"/>
      <text x="422" y="38" font-size="11" font-weight="800" fill="#be123c" text-anchor="middle">超界显著 (k=1,2)</text>
      <text x="520" y="195" font-size="11" font-weight="700" fill="#475569" text-anchor="middle">k≥3 落入带内 ⇒ 2阶截尾</text>
    </svg>`
  },

  /* 11. 线性规划 LP：二维直角坐标系凸多面体可行域、目标等值线平移与单纯形极点跳跃图解 */
  lp: {
    title: '📐 直角坐标系图解：二维凸多边形可行域、目标函数等值线平移与单纯形法顶点跳跃轨迹',
    caption: '在决策变量直角坐标系 (x₁, x₂) 中，线性不等式约束围成蓝色凸多边形可行域。虚线为目标函数等值线 c₁x₁+c₂x₂=z，沿梯度向量 c 方向向右上平移，最后离开可行域的顶点 V₂ 即为全局最优解；红色箭头展示单纯形法从原点 V₀ → V₁ → V₂ 沿边界棱寻优。',
    svg: `<svg viewBox="0 0 640 260" class="diagram-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="arr-lp" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#334155"/>
        </marker>
        <marker id="arr-lp-red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#e11d48"/>
        </marker>
      </defs>
      <rect x="65" y="20" width="520" height="205" fill="#f8fafc" stroke="#e2e8f0"/>
      <line x1="65" y1="225" x2="600" y2="225" stroke="#334155" stroke-width="2" marker-end="url(#arr-lp)"/>
      <line x1="65" y1="225" x2="65" y2="12" stroke="#334155" stroke-width="2" marker-end="url(#arr-lp)"/>
      <text x="335" y="248" font-size="12" font-weight="700" fill="#1e293b" text-anchor="middle">决策变量 x₁ (如产品 A 产量)</text>
      <text x="22" y="22" font-size="12" font-weight="700" fill="#1e293b">变量 x₂</text>

      <!-- 凸多边形可行域 -->
      <polygon points="65,225 65,75 215,75 335,135 385,225" fill="rgba(37,99,235,0.14)" stroke="#2563eb" stroke-width="2.5"/>
      <text x="185" y="168" font-size="13" font-weight="800" fill="#1e40af">凸多面体可行域 (Ax ≤ b, x ≥ 0)</text>

      <!-- 目标函数等值线族 c^T x = z -->
      <line x1="120" y1="225" x2="270" y2="45" stroke="#f59e0b" stroke-width="1.8" stroke-dasharray="5,4"/>
      <line x1="210" y1="225" x2="360" y2="45" stroke="#f59e0b" stroke-width="1.8" stroke-dasharray="5,4"/>
      <line x1="260" y1="225" x2="410" y2="45" stroke="#ea580c" stroke-width="2.6" stroke-dasharray="6,3"/>
      <text x="418" y="52" font-size="12" font-weight="800" fill="#c2410c">最优目标等值线 cᵀx = z*</text>

      <!-- 法向量 c 推进方向 -->
      <line x1="270" y1="115" x2="322" y2="82" stroke="#ea580c" stroke-width="2.2" marker-end="url(#arr-lp-red)"/>
      <text x="335" y="78" font-size="11.5" font-weight="700" fill="#c2410c">目标梯度方向 c</text>

      <!-- 单纯形法沿顶点跳跃路径 V0 -> V1 -> V2* -->
      <line x1="65" y1="225" x2="378" y2="225" stroke="#e11d48" stroke-width="3" marker-end="url(#arr-lp-red)"/>
      <line x1="385" y1="225" x2="338" y2="141" stroke="#e11d48" stroke-width="3" marker-end="url(#arr-lp-red)"/>
      <circle cx="65" cy="225" r="5.5" fill="#475569"/>
      <text x="75" y="216" font-size="11" font-weight="700" fill="#334155">初始极点 V₀(0,0)</text>
      <circle cx="385" cy="225" r="5.5" fill="#e11d48"/>
      <text x="395" y="218" font-size="11" font-weight="700" fill="#be123c">相邻极点 V₁</text>
      <circle cx="335" cy="135" r="8" fill="#e11d48" stroke="#fff" stroke-width="2"/>
      <text x="348" y="138" font-size="12.5" font-weight="800" fill="#e11d48">★ 全局最优顶点 V₂*(x₁*, x₂*)</text>
    </svg>`
  },

  /* 12. 整数规划 ILP：二维直角坐标系整点网格与分支定界切割小数区间图解 */
  ilp: {
    title: '📐 直角坐标系图解：离散整点网格 (x₁, x₂)∈ℤ²、LP 松弛小数解与分支切割（挖去 3 < x₁ < 4）',
    caption: '在直角坐标系 (x₁, x₂) 中，只有蓝色实心圆点（整数坐标网格点）才是合法的整数解。LP 松弛最优解落在小数点 x_LP=(3.6, 2.2) 处；分支定界法将中间不含任何整数的竖直带 3 < x₁ < 4（红色斜线区）切掉，分裂为左子问题 P₁(x₁≤3) 与右子问题 P₂(x₁≥4) 锁定最优整点。',
    svg: `<svg viewBox="0 0 640 265" class="diagram-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="arr-ilp" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#334155"/>
        </marker>
      </defs>
      <rect x="65" y="20" width="520" height="205" fill="#f8fafc" stroke="#e2e8f0"/>
      <line x1="65" y1="225" x2="600" y2="225" stroke="#334155" stroke-width="2" marker-end="url(#arr-ilp)"/>
      <line x1="65" y1="225" x2="65" y2="12" stroke="#334155" stroke-width="2" marker-end="url(#arr-ilp)"/>
      <text x="335" y="252" font-size="12" font-weight="700" fill="#1e293b" text-anchor="middle">整数决策变量 x₁ ∈ {0, 1, 2, 3, 4, 5}</text>
      <text x="20" y="22" font-size="12" font-weight="700" fill="#1e293b">整数 x₂</text>

      <!-- LP 连续松弛可行域虚线外框 -->
      <polygon points="65,225 65,65 255,65 381,115 485,225" fill="rgba(148,163,184,0.10)" stroke="#64748b" stroke-width="1.8" stroke-dasharray="5,4"/>
      <!-- 左子问题 P1 (x1 <= 3) 与右子问题 P2 (x1 >= 4) 高亮 -->
      <polygon points="65,225 65,65 255,65 335,97 335,225" fill="rgba(2,132,199,0.13)" stroke="#0284c7" stroke-width="2.2"/>
      <polygon points="415,151 485,225 415,225" fill="rgba(2,132,199,0.13)" stroke="#0284c7" stroke-width="2.2"/>
      <!-- 被分支切除的小数开区间 3 < x1 < 4 -->
      <rect x="335" y="35" width="80" height="190" fill="rgba(239,68,68,0.10)"/>
      <line x1="335" y1="35" x2="335" y2="225" stroke="#dc2626" stroke-width="2" stroke-dasharray="4,3"/>
      <line x1="415" y1="35" x2="415" y2="225" stroke="#dc2626" stroke-width="2" stroke-dasharray="4,3"/>
      <text x="375" y="50" font-size="11" font-weight="800" fill="#dc2626" text-anchor="middle">切除小数带 (3&lt;x₁&lt;4)</text>
      <text x="200" y="198" font-size="12" font-weight="800" fill="#0369a1" text-anchor="middle">左分支子问题 P₁: x₁ ≤ 3</text>
      <text x="495" y="185" font-size="12" font-weight="800" fill="#0369a1">右分支 P₂: x₁ ≥ 4</text>

      <!-- 坐标刻度与整点网格 (x1=0..5, x2=0..3) -->
      <!-- x1 = 95(0), 175(1), 255(2), 335(3), 415(4), 495(5); y = 225(0), 175(1), 125(2), 75(3) -->
      <g fill="#0284c7">
        <circle cx="95" cy="225" r="4.5"/><circle cx="175" cy="225" r="4.5"/><circle cx="255" cy="225" r="4.5"/><circle cx="335" cy="225" r="4.5"/><circle cx="415" cy="225" r="4.5"/>
        <circle cx="95" cy="175" r="4.5"/><circle cx="175" cy="175" r="4.5"/><circle cx="255" cy="175" r="4.5"/><circle cx="335" cy="175" r="4.5"/><circle cx="415" cy="175" r="4.5"/>
        <circle cx="95" cy="125" r="4.5"/><circle cx="175" cy="125" r="4.5"/><circle cx="255" cy="125" r="4.5"/><circle cx="335" cy="125" r="4.5"/>
        <circle cx="95" cy="75" r="4.5"/><circle cx="175" cy="75" r="4.5"/><circle cx="255" cy="75" r="4.5"/>
      </g>
      <text x="335" y="239" font-size="11" font-weight="700" fill="#334155" text-anchor="middle">x₁=3</text>
      <text x="415" y="239" font-size="11" font-weight="700" fill="#334155" text-anchor="middle">x₁=4</text>

      <!-- LP 连续松弛小数最优解 (3.6, 2.2) -->
      <circle cx="381" cy="115" r="6.5" fill="#fff" stroke="#f97316" stroke-width="3"/>
      <text x="392" y="112" font-size="11.5" font-weight="800" fill="#ea580c">LP松弛解 (3.6, 2.2) ∉ ℤ²</text>

      <!-- 真正的整数最优解 (3, 2) -->
      <circle cx="335" cy="125" r="8" fill="#16a34a" stroke="#fff" stroke-width="2"/>
      <text x="250" y="115" font-size="12" font-weight="800" fill="#15803d">★ 整数最优整点 (3, 2)</text>
    </svg>`
  },

  /* 13. 模拟退火 SA：直角坐标系多峰能量地形图与 Metropolis 爬坡跳出局部最优图解 */
  sa_pso: {
    title: '📐 直角坐标系图解：多峰非凸目标函数地形 (x, E(x)) 与 Metropolis 概率爬坡跳出局部极小值',
    caption: '横轴为解空间状态 x，纵轴为目标成本/能量 E(x)。传统贪心算法一旦滑入左侧“局部最优浅谷”便无法翻越右侧山峰；模拟退火在高温 T 下以玻尔兹曼概率 exp(−ΔE/T) 接受能量上升 ΔE>0 的爬坡动作（橙色虚线箭头），成功翻越山脊找到右侧全局最优深谷。',
    svg: `<svg viewBox="0 0 640 250" class="diagram-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="arr-sa" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#334155"/>
        </marker>
        <marker id="arr-sa-up" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#ea580c"/>
        </marker>
        <marker id="arr-sa-ok" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#16a34a"/>
        </marker>
      </defs>
      <rect x="55" y="20" width="545" height="195" fill="#f8fafc" stroke="#e2e8f0"/>
      <line x1="55" y1="215" x2="615" y2="215" stroke="#334155" stroke-width="2" marker-end="url(#arr-sa)"/>
      <line x1="55" y1="215" x2="55" y2="12" stroke="#334155" stroke-width="2" marker-end="url(#arr-sa)"/>
      <text x="335" y="240" font-size="12" font-weight="700" fill="#1e293b" text-anchor="middle">解空间搜索状态 X（如 TSP 路径排列方案）</text>
      <text x="15" y="22" font-size="12" font-weight="700" fill="#1e293b">目标能量 E(X)</text>

      <!-- 多峰函数曲线 -->
      <path d="M 75 55 C 120 165, 165 165, 200 135 C 235 105, 265 65, 300 65 C 345 65, 395 200, 445 200 C 495 200, 535 95, 580 70" fill="none" stroke="#7c3aed" stroke-width="3.2"/>

      <!-- 局部最优陷阱 -->
      <circle cx="162" cy="148" r="6.5" fill="#dc2626" stroke="#fff" stroke-width="2"/>
      <text x="162" y="172" font-size="12" font-weight="800" fill="#dc2626" text-anchor="middle">局部最优陷阱 (贪心卡死)</text>

      <!-- 爬坡能量差 ΔE > 0 -->
      <line x1="162" y1="148" x2="310" y2="148" stroke="#94a3b8" stroke-dasharray="3,3"/>
      <line x1="300" y1="65" x2="300" y2="148" stroke="#ea580c" stroke-width="2" stroke-dasharray="4,2"/>
      <text x="342" y="112" font-size="11.5" font-weight="800" fill="#c2410c">能垒 ΔE &gt; 0</text>

      <!-- Metropolis 爬坡翻越箭头 -->
      <path d="M 172 142 Q 230 75 292 64" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-dasharray="6,3" marker-end="url(#arr-sa-up)"/>
      <rect x="145" y="32" width="215" height="24" rx="6" fill="#fff7ed" stroke="#ea580c"/>
      <text x="252" y="48" font-size="11.5" font-weight="700" fill="#c2410c" text-anchor="middle">高温以 P = exp(−ΔE/T) 概率爬坡翻越</text>

      <!-- 滑入全局最优谷底 -->
      <path d="M 312 68 Q 375 135 435 192" fill="none" stroke="#16a34a" stroke-width="2.6" marker-end="url(#arr-sa-ok)"/>
      <circle cx="445" cy="198" r="8" fill="#16a34a" stroke="#fff" stroke-width="2"/>
      <text x="445" y="212" font-size="12.5" font-weight="800" fill="#15803d" text-anchor="middle">★ 全局最优解 X* (低温锁定)</text>
    </svg>`
  },

  /* 14. 主成分分析 PCA：二维直角坐标系 (Z1, Z2) 正交旋转为新主成分轴 (PC1, PC2) 图解 */
  pca: {
    title: '📐 直角坐标系图解：原始相关坐标系 (Z₁, Z₂) 正交旋转至最大方差主成分轴 (PC₁, PC₂)',
    caption: '在标准化直角坐标系 (Z₁, Z₂) 中，由于两指标高度正相关，数据点云呈倾斜椭圆分布。PCA 通过特征向量分解将坐标轴逆时针正交旋转 θ 角：第一主成分轴 PC₁ 严格沿着椭圆长轴（方差最大方向 λ₁），第二主成分轴 PC₂ 沿垂直短轴（方差 λ₂），实现去相关与降维。',
    svg: `<svg viewBox="0 0 640 255" class="diagram-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="arr-pca" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748b"/>
        </marker>
        <marker id="arr-pc1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#0d9488"/>
        </marker>
        <marker id="arr-pc2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#e11d48"/>
        </marker>
      </defs>
      <rect x="55" y="18" width="530" height="215" fill="#f8fafc" stroke="#e2e8f0"/>
      <!-- 原始直角坐标轴 Z1, Z2 -->
      <line x1="120" y1="130" x2="520" y2="130" stroke="#94a3b8" stroke-width="1.8" marker-end="url(#arr-pca)"/>
      <line x1="310" y1="220" x2="310" y2="28" stroke="#94a3b8" stroke-width="1.8" marker-end="url(#arr-pca)"/>
      <text x="528" y="134" font-size="12" font-weight="700" fill="#64748b">原指标 Z₁</text>
      <text x="318" y="34" font-size="12" font-weight="700" fill="#64748b">原指标 Z₂</text>

      <!-- 倾斜椭圆数据点云 -->
      <g transform="translate(310,130) rotate(-28)">
        <ellipse cx="0" cy="0" rx="145" ry="38" fill="rgba(13,148,136,0.11)" stroke="#0d9488" stroke-width="1.8" stroke-dasharray="5,3"/>
        <!-- 散点 -->
        <circle cx="-115" cy="-8" r="4" fill="#3b82f6"/><circle cx="-90" cy="12" r="4" fill="#3b82f6"/>
        <circle cx="-65" cy="-15" r="4" fill="#3b82f6"/><circle cx="-40" cy="6" r="4" fill="#3b82f6"/>
        <circle cx="-15" cy="-18" r="4" fill="#3b82f6"/><circle cx="10" cy="16" r="4" fill="#3b82f6"/>
        <circle cx="42" cy="-10" r="4" fill="#3b82f6"/><circle cx="72" cy="14" r="4" fill="#3b82f6"/>
        <circle cx="98" cy="-6" r="4" fill="#3b82f6"/><circle cx="122" cy="5" r="4" fill="#3b82f6"/>
      </g>

      <!-- 旋转后的正交主成分轴 PC1 与 PC2 -->
      <line x1="150" y1="215" x2="475" y2="42" stroke="#0d9488" stroke-width="3.2" marker-end="url(#arr-pc1)"/>
      <line x1="348" y1="202" x2="268" y2="52" stroke="#e11d48" stroke-width="2.6" marker-end="url(#arr-pc2)"/>
      <!-- 正交直角标记 -->
      <text x="482" y="42" font-size="12.5" font-weight="800" fill="#0f766e">第一主成分轴 PC₁ (最大方差 λ₁，保留85%+信息)</text>
      <text x="135" y="48" font-size="12" font-weight="800" fill="#be123c">第二主成分轴 PC₂ (正交次要轴 λ₂, Cov=0)</text>
    </svg>`
  },

  /* 15. K-Means 聚类：二维特征坐标系轮廓系数 a(i)、b(i) 与肘部法则 (K, SSE) 图解 */
  kmeans: {
    title: '📐 双直角坐标系图解：① 轮廓系数中簇内距离 a(i) 与最近外簇距离 b(i)；② 肘部法则 (K, SSE) 拐点',
    caption: '左图在特征直角坐标系 (z₁, z₂) 中展示样本 i 到同簇内部点的平均距离 a(i)（越小越抱团）与到最近隔壁簇的平均距离 b(i)（越大越分明）；右图展示随着分类数 K 增加，簇内误差平方和 SSE 在 K=3 处出现明显“手肘拐点”。',
    svg: `<svg viewBox="0 0 640 245" class="diagram-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="arr-km" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#334155"/>
        </marker>
      </defs>
      <!-- 左：特征空间轮廓系数 a(i) 与 b(i) -->
      <rect x="45" y="22" width="275" height="185" fill="#f8fafc" stroke="#e2e8f0"/>
      <line x1="45" y1="207" x2="332" y2="207" stroke="#334155" stroke-width="2" marker-end="url(#arr-km)"/>
      <line x1="45" y1="207" x2="45" y2="12" stroke="#334155" stroke-width="2" marker-end="url(#arr-km)"/>
      <text x="182" y="232" font-size="12" font-weight="700" fill="#1e293b" text-anchor="middle">特征维度 z₁（轮廓系数 s(i) 几何定义）</text>
      <!-- 簇 1 (蓝) -->
      <circle cx="115" cy="145" r="42" fill="rgba(37,99,235,0.09)" stroke="#3b82f6" stroke-dasharray="4,3"/>
      <circle cx="95" cy="135" r="4.5" fill="#2563eb"/><circle cx="108" cy="165" r="4.5" fill="#2563eb"/><circle cx="132" cy="148" r="6" fill="#1d4ed8" stroke="#fff" stroke-width="1.5"/>
      <line x1="132" y1="148" x2="95" y2="135" stroke="#2563eb" stroke-width="1.8"/>
      <line x1="132" y1="148" x2="108" y2="165" stroke="#2563eb" stroke-width="1.8"/>
      <text x="115" y="96" font-size="11.5" font-weight="800" fill="#1d4ed8" text-anchor="middle">同簇内距离 a(i) 小</text>
      <!-- 簇 2 (绿，最近外簇) -->
      <circle cx="248" cy="82" r="42" fill="rgba(16,185,129,0.09)" stroke="#10b981" stroke-dasharray="4,3"/>
      <circle cx="235" cy="72" r="4.5" fill="#10b981"/><circle cx="262" cy="88" r="4.5" fill="#10b981"/><circle cx="242" cy="98" r="4.5" fill="#10b981"/>
      <!-- 跨簇距离 b(i) -->
      <line x1="132" y1="148" x2="235" y2="72" stroke="#e11d48" stroke-width="2" stroke-dasharray="5,3"/>
      <line x1="132" y1="148" x2="242" y2="98" stroke="#e11d48" stroke-width="2" stroke-dasharray="5,3"/>
      <text x="218" y="142" font-size="11.5" font-weight="800" fill="#dc2626">外簇距离 b(i) 大</text>

      <!-- 右：肘部法则 (K, SSE) 直角坐标系 -->
      <rect x="365" y="22" width="245" height="185" fill="#f8fafc" stroke="#e2e8f0"/>
      <line x1="365" y1="207" x2="622" y2="207" stroke="#334155" stroke-width="2" marker-end="url(#arr-km)"/>
      <line x1="365" y1="207" x2="365" y2="12" stroke="#334155" stroke-width="2" marker-end="url(#arr-km)"/>
      <text x="488" y="232" font-size="12" font-weight="700" fill="#1e293b" text-anchor="middle">聚类簇数 K（肘部法则选最佳 K）</text>
      <text x="395" y="22" font-size="12" font-weight="700" fill="#1e293b">簇内误差 SSE</text>
      <polyline points="395,45 445,142 495,168 545,180 590,186" fill="none" stroke="#f59e0b" stroke-width="3"/>
      <circle cx="395" cy="45" r="4.5" fill="#f59e0b"/>
      <circle cx="445" cy="142" r="8" fill="#e11d48" stroke="#fff" stroke-width="2"/>
      <circle cx="495" cy="168" r="4.5" fill="#f59e0b"/>
      <circle cx="545" cy="180" r="4.5" fill="#f59e0b"/>
      <circle cx="590" cy="186" r="4.5" fill="#f59e0b"/>
      <text x="395" y="221" font-size="11" fill="#475569" text-anchor="middle">K=2</text>
      <text x="445" y="221" font-size="11" font-weight="800" fill="#e11d48" text-anchor="middle">K=3*</text>
      <text x="495" y="221" font-size="11" fill="#475569" text-anchor="middle">K=4</text>
      <text x="545" y="221" font-size="11" fill="#475569" text-anchor="middle">K=5</text>
      <text x="515" y="132" font-size="12" font-weight="800" fill="#dc2626">★ 手肘拐点 (K=3 最优)</text>
    </svg>`
  },

  /* 16. 常微分方程动力学 RK4：四阶龙格-库塔四斜率采样与 Lotka-Volterra 相平面极限环图解 */
  ode_sir: {
    title: '📐 双直角坐标系图解：① RK4 单步四斜率 (k₁, k₂, k₃, k₄) 加权采样；② 相平面 (x, y) 闭合极限环与不动点',
    caption: '左图展示在步长 [tₙ, tₙ+h] 内，RK4 分别探测起点斜率 k₁、中点斜率 k₂/k₃ 与终点斜率 k₄ 并按 1:2:2:1 加权平均；右图展示 Lotka-Volterra 捕食系统中猎物 x 与捕食者 y 在相平面直角坐标系中围绕共存平衡点 (γ/δ, α/β) 形成周期振荡极限环。',
    svg: `<svg viewBox="0 0 640 245" class="diagram-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="arr-ode" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#334155"/>
        </marker>
      </defs>
      <!-- 左：RK4 四斜率几何图解 -->
      <rect x="45" y="22" width="270" height="185" fill="#f8fafc" stroke="#e2e8f0"/>
      <line x1="45" y1="207" x2="328" y2="207" stroke="#334155" stroke-width="2" marker-end="url(#arr-ode)"/>
      <line x1="45" y1="207" x2="45" y2="12" stroke="#334155" stroke-width="2" marker-end="url(#arr-ode)"/>
      <text x="180" y="232" font-size="12" font-weight="700" fill="#1e293b" text-anchor="middle">时间步 [tₙ, tₙ + h]（RK4 四斜率采样）</text>
      <!-- 真实积分曲线 -->
      <path d="M 75 175 Q 175 155 275 55" fill="none" stroke="#2563eb" stroke-width="3"/>
      <!-- 起点、中点、终点虚线 -->
      <line x1="175" y1="35" x2="175" y2="207" stroke="#cbd5e1" stroke-dasharray="4,3"/>
      <line x1="275" y1="35" x2="275" y2="207" stroke="#cbd5e1" stroke-dasharray="4,3"/>
      <text x="75" y="221" font-size="11" font-weight="700" fill="#334155" text-anchor="middle">tₙ</text>
      <text x="175" y="221" font-size="11" font-weight="700" fill="#334155" text-anchor="middle">tₙ + h/2</text>
      <text x="275" y="221" font-size="11" font-weight="700" fill="#334155" text-anchor="middle">tₙ + h</text>
      <!-- 斜率切线箭头 k1, k2/k3, k4 -->
      <line x1="75" y1="175" x2="135" y2="165" stroke="#ef4444" stroke-width="2.5"/>
      <circle cx="75" cy="175" r="5.5" fill="#ef4444"/><text x="90" y="190" font-size="11" font-weight="800" fill="#dc2626">起点 k₁</text>
      <line x1="150" y1="142" x2="205" y2="108" stroke="#f59e0b" stroke-width="2.5"/>
      <circle cx="175" cy="126" r="5.5" fill="#f59e0b"/><text x="184" y="138" font-size="11" font-weight="800" fill="#d97706">中点 k₂,k₃(×2)</text>
      <circle cx="275" cy="55" r="6" fill="#16a34a"/><text x="220" y="52" font-size="11" font-weight="800" fill="#15803d">终点 k₄ → yₙ₊₁</text>

      <!-- 右：相平面 (x, y) 闭合轨线图 -->
      <rect x="360" y="22" width="250" height="185" fill="#f8fafc" stroke="#e2e8f0"/>
      <line x1="360" y1="207" x2="622" y2="207" stroke="#334155" stroke-width="2" marker-end="url(#arr-ode)"/>
      <line x1="360" y1="207" x2="360" y2="12" stroke="#334155" stroke-width="2" marker-end="url(#arr-ode)"/>
      <text x="488" y="232" font-size="12" font-weight="700" fill="#1e293b" text-anchor="middle">猎物种群数量 x(t)（相平面轨线图）</text>
      <text x="392" y="22" font-size="12" font-weight="700" fill="#1e293b">捕食者 y(t)</text>
      <!-- 闭合极限环轨线 -->
      <ellipse cx="485" cy="118" rx="82" ry="54" fill="rgba(225,29,72,0.07)" stroke="#e11d48" stroke-width="2.8"/>
      <ellipse cx="485" cy="118" rx="48" ry="30" fill="none" stroke="#fb7185" stroke-width="1.8" stroke-dasharray="4,3"/>
      <!-- 中心平衡点 -->
      <circle cx="485" cy="118" r="6.5" fill="#2563eb" stroke="#fff" stroke-width="2"/>
      <line x1="485" y1="118" x2="485" y2="207" stroke="#2563eb" stroke-dasharray="3,3"/>
      <line x1="360" y1="118" x2="485" y2="118" stroke="#2563eb" stroke-dasharray="3,3"/>
      <text x="485" y="106" font-size="11" font-weight="800" fill="#1d4ed8" text-anchor="middle">平衡点 (γ/δ, α/β)</text>
    </svg>`
  },

  /* 17. 蒙特卡洛模拟 MC：定积分随机撒点与金融损失分布 VaR / CVaR 分位数直角坐标系图解 */
  monte_carlo: {
    title: '📐 双直角坐标系图解：① [a, b] 区间随机抽样估计定积分；② 损失概率分布上的 95% VaR 与尾部 CVaR',
    caption: '左图展示在区间 [a, b] 随机生成 N 个样本点 Xᵢ 并求函数均值 f̄，用矩形面积 (b−a)·f̄ 逼近曲边梯形定积分；右图在损失概率密度坐标系 (L, p(L)) 中标出 95% 分位阈值 VaR₉₅% 以及最右侧 5% 极端尾部阴影的重心期望 CVaR₉₅%。',
    svg: `<svg viewBox="0 0 640 245" class="diagram-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="arr-mc" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#334155"/>
        </marker>
      </defs>
      <!-- 左：蒙特卡洛定积分坐标系 -->
      <rect x="45" y="22" width="265" height="185" fill="#f8fafc" stroke="#e2e8f0"/>
      <line x1="45" y1="207" x2="322" y2="207" stroke="#334155" stroke-width="2" marker-end="url(#arr-mc)"/>
      <line x1="45" y1="207" x2="45" y2="12" stroke="#334155" stroke-width="2" marker-end="url(#arr-mc)"/>
      <text x="178" y="232" font-size="12" font-weight="700" fill="#1e293b" text-anchor="middle">积分区间 [a, b] 随机均匀抽样 Xᵢ</text>
      <!-- 被积函数曲线与阴影 -->
      <path d="M 75 207 L 75 135 Q 155 35 275 115 L 275 207 Z" fill="rgba(236,72,153,0.12)" stroke="#db2777" stroke-width="2.6"/>
      <!-- 等效均值矩形高度 -->
      <rect x="75" y="102" width="200" height="105" fill="none" stroke="#2563eb" stroke-width="1.8" stroke-dasharray="5,4"/>
      <text x="175" y="95" font-size="11" font-weight="700" fill="#1d4ed8" text-anchor="middle">样本函数均值高 E[f(X)]</text>
      <!-- 随机投点 -->
      <g fill="#10b981"><circle cx="95" cy="165" r="3"/><circle cx="122" cy="120" r="3"/><circle cx="148" cy="145" r="3"/><circle cx="172" cy="95" r="3"/><circle cx="205" cy="135" r="3"/><circle cx="235" cy="175" r="3"/><circle cx="255" cy="150" r="3"/></g>
      <g fill="#94a3b8"><circle cx="92" cy="65" r="3"/><circle cx="215" cy="55" r="3"/><circle cx="252" cy="72" r="3"/></g>
      <text x="75" y="221" font-size="11" font-weight="700" fill="#334155" text-anchor="middle">a</text>
      <text x="275" y="221" font-size="11" font-weight="700" fill="#334155" text-anchor="middle">b</text>

      <!-- 右：VaR 与 CVaR 概率分布直角坐标系 -->
      <rect x="355" y="22" width="260" height="185" fill="#f8fafc" stroke="#e2e8f0"/>
      <line x1="355" y1="207" x2="626" y2="207" stroke="#334155" stroke-width="2" marker-end="url(#arr-mc)"/>
      <line x1="355" y1="207" x2="355" y2="12" stroke="#334155" stroke-width="2" marker-end="url(#arr-mc)"/>
      <text x="488" y="232" font-size="12" font-weight="700" fill="#1e293b" text-anchor="middle">投资组合损失金额 L（右尾代表极端大额亏损）</text>
      <!-- 概率密度钟形曲线 -->
      <path d="M 365 207 C 400 205, 425 48, 465 48 C 505 48, 535 198, 605 207" fill="rgba(59,130,246,0.10)" stroke="#2563eb" stroke-width="2.5"/>
      <!-- 5% 尾部阴影 -->
      <path d="M 525 207 L 525 136 C 545 178, 570 202, 605 207 Z" fill="rgba(225,29,72,0.32)"/>
      <line x1="525" y1="55" x2="525" y2="207" stroke="#e11d48" stroke-width="2.5" stroke-dasharray="4,3"/>
      <text x="448" y="155" font-size="11.5" font-weight="700" fill="#1e40af" text-anchor="middle">95% 常规波动区</text>
      <text x="525" y="48" font-size="11.5" font-weight="800" fill="#dc2626" text-anchor="middle">VaR₉₅% 分位阈值</text>
      <text x="572" y="165" font-size="11" font-weight="800" fill="#be123c" text-anchor="middle">尾部 5% 均值=CVaR</text>
    </svg>`
  },

  /* 18. 马尔可夫链：状态转移有向图与多步概率收敛至稳态渐近线 π* 直角坐标系图解 */
  markov: {
    title: '📐 状态转移图与直角坐标系图解：① 一步状态转移概率有向图 Pᵢⱼ；② 状态概率 πᵢ(t) 收敛至稳态水平渐近线 π*',
    caption: '左图展示离散状态之间的条件转移概率 Pᵢⱼ（每个节点流出的箭头概率加和恒为 1）；右图在时间直角坐标系 (t, πᵢ(t)) 中展示无论初始份额 π⁽⁰⁾ 如何，经过若干步矩阵连乘 Pⁿ 后，各状态概率均收敛于水平稳态渐近线 π*。',
    svg: `<svg viewBox="0 0 640 245" class="diagram-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="arr-mk" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#475569"/>
        </marker>
      </defs>
      <!-- 左：三状态马尔可夫转移有向图 -->
      <rect x="20" y="20" width="285" height="205" rx="8" fill="#f8fafc" stroke="#e2e8f0"/>
      <text x="162" y="38" font-size="12" font-weight="700" fill="#1e293b" text-anchor="middle">① 状态空间一步转移有向图 (行和 ΣⱼPᵢⱼ = 1)</text>
      <!-- 有向边 -->
      <path d="M 140 82 Q 85 115 92 162" fill="none" stroke="#6366f1" stroke-width="2" marker-end="url(#arr-mk)"/>
      <path d="M 185 82 Q 235 115 228 162" fill="none" stroke="#6366f1" stroke-width="2" marker-end="url(#arr-mk)"/>
      <path d="M 118 182 Q 162 202 205 182" fill="none" stroke="#10b981" stroke-width="2" marker-end="url(#arr-mk)"/>
      <path d="M 205 170 Q 162 152 118 170" fill="none" stroke="#f59e0b" stroke-width="2" marker-end="url(#arr-mk)"/>
      <text x="82" y="122" font-size="11" font-weight="700" fill="#4f46e5">P₁₂=0.20</text>
      <text x="218" y="122" font-size="11" font-weight="700" fill="#4f46e5">P₁₃=0.10</text>
      <text x="162" y="210" font-size="11" font-weight="700" fill="#059669" text-anchor="middle">P₂₃ = 0.20</text>
      <!-- 三个状态节点 -->
      <circle cx="162" cy="72" r="24" fill="#6366f1"/><text x="162" y="76" font-size="11.5" font-weight="800" fill="#fff" text-anchor="middle">状态 S₁</text>
      <text x="162" y="42" font-size="10.5" font-weight="700" fill="#4f46e5" text-anchor="middle">自留 P₁₁=0.70</text>
      <circle cx="92" cy="182" r="24" fill="#10b981"/><text x="92" y="186" font-size="11.5" font-weight="800" fill="#fff" text-anchor="middle">状态 S₂</text>
      <circle cx="232" cy="182" r="24" fill="#f59e0b"/><text x="232" y="186" font-size="11.5" font-weight="800" fill="#fff" text-anchor="middle">状态 S₃</text>

      <!-- 右：状态概率收敛直角坐标系 (t, pi(t)) -->
      <rect x="345" y="22" width="270" height="185" fill="#f8fafc" stroke="#e2e8f0"/>
      <line x1="345" y1="207" x2="626" y2="207" stroke="#334155" stroke-width="2" marker-end="url(#arr-mk)"/>
      <line x1="345" y1="207" x2="345" y2="12" stroke="#334155" stroke-width="2" marker-end="url(#arr-mk)"/>
      <text x="485" y="232" font-size="12" font-weight="700" fill="#1e293b" text-anchor="middle">推移步数 t（π⁽ᵗ⁾ = π⁽⁰⁾Pᵗ 收敛至稳态 π*）</text>
      <text x="372" y="22" font-size="12" font-weight="700" fill="#1e293b">概率 πᵢ(t)</text>
      <!-- 三条稳态水平渐近线与收敛曲线 -->
      <line x1="345" y1="88" x2="610" y2="88" stroke="#6366f1" stroke-dasharray="4,3"/>
      <path d="M 355 45 Q 415 84 605 88" fill="none" stroke="#6366f1" stroke-width="2.8"/>
      <text x="558" y="80" font-size="11" font-weight="800" fill="#4f46e5">π₁* = 46.8%</text>

      <line x1="345" y1="126" x2="610" y2="126" stroke="#10b981" stroke-dasharray="4,3"/>
      <path d="M 355 155 Q 415 129 605 126" fill="none" stroke="#10b981" stroke-width="2.8"/>
      <text x="558" y="119" font-size="11" font-weight="800" fill="#059669">π₂* = 34.0%</text>

      <line x1="345" y1="168" x2="610" y2="168" stroke="#f59e0b" stroke-dasharray="4,3"/>
      <path d="M 355 190 Q 415 170 605 168" fill="none" stroke="#f59e0b" stroke-width="2.8"/>
      <text x="558" y="161" font-size="11" font-weight="800" fill="#d97706">π₃* = 19.2%</text>
    </svg>`
  },
};

/* =========================================================
   分步推导专用直角坐标系微图解 (Step-Level Cartesian Mini-Plots)
   针对分步推导中最容易抽象费解的分段函数、分布函数与几何变换提供配图
   ========================================================= */
window.STEP_DIAGRAMS = {
  /* TOPSIS Step 1 (index 1): 极小型、中间型、区间型正向化函数直角坐标系图 */
  'topsis:1': `<div class="step-diagram">
    <div class="sd-title">📊 直角坐标系直观对照：三种非极大型指标的正向化映射曲线 (横轴为原值 x，纵轴为正向化得分 x̃ ∈ [0, 1])</div>
    <svg viewBox="0 0 640 165" class="diagram-svg" xmlns="http://www.w3.org/2000/svg">
      <!-- 1. 极小型 -->
      <rect x="18" y="12" width="190" height="138" rx="6" fill="#fff" stroke="#e2e8f0"/>
      <line x1="42" y1="120" x2="195" y2="120" stroke="#334155" stroke-width="1.6"/>
      <line x1="42" y1="125" x2="42" y2="25" stroke="#334155" stroke-width="1.6"/>
      <line x1="55" y1="38" x2="175" y2="120" stroke="#ef4444" stroke-width="2.6"/>
      <circle cx="55" cy="38" r="4" fill="#ef4444"/><circle cx="175" cy="120" r="4" fill="#ef4444"/>
      <text x="30" y="42" font-size="10.5" font-weight="700" fill="#334155">1</text>
      <text x="55" y="134" font-size="10.5" fill="#475569" text-anchor="middle">min x</text>
      <text x="175" y="134" font-size="10.5" fill="#475569" text-anchor="middle">max x</text>
      <text x="115" y="26" font-size="11" font-weight="800" fill="#dc2626" text-anchor="middle">① 极小型 (单调递减直线)</text>

      <!-- 2. 中间型 -->
      <rect x="225" y="12" width="190" height="138" rx="6" fill="#fff" stroke="#e2e8f0"/>
      <line x1="248" y1="120" x2="402" y2="120" stroke="#334155" stroke-width="1.6"/>
      <line x1="248" y1="125" x2="248" y2="25" stroke="#334155" stroke-width="1.6"/>
      <polyline points="262,120 325,38 388,120" fill="rgba(99,102,241,0.12)" stroke="#6366f1" stroke-width="2.6"/>
      <line x1="325" y1="38" x2="325" y2="120" stroke="#6366f1" stroke-dasharray="3,2"/>
      <circle cx="325" cy="38" r="4" fill="#6366f1"/>
      <text x="325" y="134" font-size="10.5" font-weight="700" fill="#4f46e5" text-anchor="middle">x_best</text>
      <text x="262" y="134" font-size="10" fill="#64748b" text-anchor="middle">-M</text>
      <text x="388" y="134" font-size="10" fill="#64748b" text-anchor="middle">+M</text>
      <text x="320" y="26" font-size="11" font-weight="800" fill="#4f46e5" text-anchor="middle">② 中间型 (对称尖顶帐篷)</text>

      <!-- 3. 区间型 -->
      <rect x="432" y="12" width="190" height="138" rx="6" fill="#fff" stroke="#e2e8f0"/>
      <line x1="452" y1="120" x2="608" y2="120" stroke="#334155" stroke-width="1.6"/>
      <line x1="452" y1="125" x2="452" y2="25" stroke="#334155" stroke-width="1.6"/>
      <polyline points="465,120 502,38 558,38 595,120" fill="rgba(16,185,129,0.12)" stroke="#10b981" stroke-width="2.6"/>
      <line x1="502" y1="38" x2="502" y2="120" stroke="#10b981" stroke-dasharray="3,2"/>
      <line x1="558" y1="38" x2="558" y2="120" stroke="#10b981" stroke-dasharray="3,2"/>
      <text x="502" y="134" font-size="10.5" font-weight="700" fill="#059669" text-anchor="middle">a</text>
      <text x="558" y="134" font-size="10.5" font-weight="700" fill="#059669" text-anchor="middle">b</text>
      <text x="465" y="134" font-size="9.5" fill="#64748b" text-anchor="middle">a−M</text>
      <text x="595" y="134" font-size="9.5" fill="#64748b" text-anchor="middle">b+M</text>
      <text x="528" y="26" font-size="11" font-weight="800" fill="#059669" text-anchor="middle">③ 区间型 (平顶梯形台)</text>
    </svg>
  </div>`,

  /* 模拟退火 Step 2 (index 2): Metropolis 接受概率函数 P(ΔE) = exp(-ΔE/T) 直角坐标系图 */
  'sa_pso:2': `<div class="step-diagram">
    <div class="sd-title">📊 直角坐标系图解：Metropolis 接受概率曲线 P(ΔE) 在高温 T₁ 与低温 T₂ 下的形态对比</div>
    <svg viewBox="0 0 640 165" class="diagram-svg" xmlns="http://www.w3.org/2000/svg">
      <rect x="45" y="12" width="560" height="138" rx="6" fill="#fff" stroke="#e2e8f0"/>
      <line x1="80" y1="125" x2="580" y2="125" stroke="#334155" stroke-width="1.8"/>
      <line x1="220" y1="132" x2="220" y2="20" stroke="#334155" stroke-width="1.8"/>
      <!-- ΔE < 0 区域恒为 1 -->
      <line x1="90" y1="38" x2="220" y2="38" stroke="#16a34a" stroke-width="3.2"/>
      <rect x="90" y="38" width="130" height="87" fill="rgba(22,163,74,0.08)"/>
      <text x="155" y="85" font-size="11" font-weight="800" fill="#15803d" text-anchor="middle">ΔE &lt; 0（新解更优）</text>
      <text x="155" y="102" font-size="11" font-weight="700" fill="#15803d" text-anchor="middle">接受概率 P ≡ 100%</text>
      <!-- ΔE >= 0 高温曲线与低温曲线 -->
      <path d="M 220 38 Q 330 55 560 112" fill="none" stroke="#ea580c" stroke-width="2.8"/>
      <path d="M 220 38 Q 255 118 560 124" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-dasharray="5,3"/>
      <text x="435" y="68" font-size="11.5" font-weight="800" fill="#c2410c">高温初期 T 大：exp(−ΔE/T) 平缓，易接受劣解跳出局部陷阱</text>
      <text x="415" y="114" font-size="11.5" font-weight="800" fill="#1d4ed8">低温后期 T→0：曲线陡降趋于 0，拒绝劣解精细收敛</text>
      <text x="205" y="42" font-size="11" font-weight="700" fill="#334155">P=1</text>
      <text x="220" y="142" font-size="11" font-weight="700" fill="#334155" text-anchor="middle">ΔE = 0</text>
      <text x="530" y="142" font-size="11" font-weight="700" fill="#334155">目标增量 ΔE &gt; 0 (变差幅度)</text>
    </svg>
  </div>`,

  /* 蒙特卡洛 Step 1 (index 1): Box-Muller 均匀分布转标准正态分布直角坐标系映射图 */
  'monte_carlo:1': `<div class="step-diagram">
    <div class="sd-title">📊 直角坐标系图解：Box-Muller 变换将单位正方形均匀抽样 (U₁, U₂) 映射为二维标准正态分布 (Z₁, Z₂)</div>
    <svg viewBox="0 0 640 165" class="diagram-svg" xmlns="http://www.w3.org/2000/svg">
      <!-- 左：单位正方形 (0,1)x(0,1) -->
      <rect x="35" y="12" width="225" height="140" rx="6" fill="#fff" stroke="#e2e8f0"/>
      <line x1="75" y1="125" x2="225" y2="125" stroke="#334155" stroke-width="1.6"/>
      <line x1="75" y1="125" x2="75" y2="25" stroke="#334155" stroke-width="1.6"/>
      <rect x="75" y="38" width="110" height="87" fill="rgba(59,130,246,0.12)" stroke="#2563eb" stroke-width="1.8"/>
      <g fill="#2563eb"><circle cx="95" cy="55" r="3"/><circle cx="135" cy="62" r="3"/><circle cx="165" cy="52" r="3"/><circle cx="105" cy="88" r="3"/><circle cx="145" cy="95" r="3"/><circle cx="120" cy="110" r="3"/><circle cx="168" cy="105" r="3"/></g>
      <text x="145" y="26" font-size="11" font-weight="800" fill="#1d4ed8" text-anchor="middle">① 单位正方形均匀随机数 (U₁, U₂)</text>
      <text x="185" y="140" font-size="10.5" fill="#334155">U₁∈(0,1)</text>

      <!-- 中间变换箭头 -->
      <text x="315" y="75" font-size="11" font-weight="800" fill="#db2777" text-anchor="middle">极坐标径向拉伸</text>
      <text x="315" y="93" font-size="11" font-weight="700" fill="#475569" text-anchor="middle">R = √(−2 ln U₁) ➔</text>
      <text x="315" y="110" font-size="11" font-weight="700" fill="#475569" text-anchor="middle">Θ = 2π U₂</text>

      <!-- 右：二维正态同心圆等高线 (Z1, Z2) -->
      <rect x="375" y="12" width="235" height="140" rx="6" fill="#fff" stroke="#e2e8f0"/>
      <line x1="400" y1="85" x2="590" y2="85" stroke="#94a3b8" stroke-width="1.4"/>
      <line x1="495" y1="142" x2="495" y2="28" stroke="#94a3b8" stroke-width="1.4"/>
      <circle cx="495" cy="85" r="46" fill="rgba(236,72,153,0.06)" stroke="#f472b6" stroke-dasharray="3,2"/>
      <circle cx="495" cy="85" r="26" fill="rgba(236,72,153,0.14)" stroke="#db2777"/>
      <g fill="#be185d"><circle cx="492" cy="82" r="3"/><circle cx="502" cy="89" r="3"/><circle cx="486" cy="91" r="3"/><circle cx="499" cy="76" r="3"/><circle cx="475" cy="72" r="3"/><circle cx="520" cy="98" r="3"/></g>
      <text x="495" y="25" font-size="11" font-weight="800" fill="#be185d" text-anchor="middle">② 标准正态分布点云 (Z₁, Z₂) ~ N(0, I)</text>
    </svg>
  </div>`,

  /* 线性规划 Step 4 (index 4): 最小比值检验 θ = min(b_i / a_ik) 直角坐标系几何图解 */
  'lp:4': `<div class="step-diagram">
    <div class="sd-title">📊 直角坐标系图解：为什么出基变量必须取“最小比值 θ = min(b̄ᵢ / āᵢₖ)”？</div>
    <svg viewBox="0 0 640 165" class="diagram-svg" xmlns="http://www.w3.org/2000/svg">
      <rect x="35" y="12" width="570" height="140" rx="6" fill="#fff" stroke="#e2e8f0"/>
      <line x1="75" y1="125" x2="565" y2="125" stroke="#334155" stroke-width="2"/>
      <line x1="75" y1="132" x2="75" y2="22" stroke="#334155" stroke-width="2"/>
      <!-- 两条约束直线在横轴上的截距 -->
      <polygon points="75,125 75,45 195,85 275,125" fill="rgba(37,99,235,0.13)" stroke="#2563eb" stroke-width="2"/>
      <line x1="75" y1="25" x2="275" y2="125" stroke="#16a34a" stroke-width="2.2"/>
      <line x1="75" y1="45" x2="435" y2="125" stroke="#ef4444" stroke-width="2" stroke-dasharray="5,3"/>
      <!-- 两个截距点 -->
      <circle cx="275" cy="125" r="6.5" fill="#16a34a" stroke="#fff" stroke-width="2"/>
      <circle cx="435" cy="125" r="6" fill="#ef4444" stroke="#fff" stroke-width="2"/>
      <text x="275" y="143" font-size="11.5" font-weight="800" fill="#15803d" text-anchor="middle">★ 最小截距 θ = b̄₁/ā₁ₖ（合法边界顶点）</text>
      <text x="455" y="143" font-size="11.5" font-weight="700" fill="#dc2626" text-anchor="middle">较大截距 b̄₂/ā₂ₖ（已冲出可行域外，违反约束1！）</text>
      <text x="155" y="102" font-size="11.5" font-weight="700" fill="#1e40af">可行域</text>
    </svg>
  </div>`,
};

