/* =========================================================
   算法讲解内容：原理 / 步骤 / 公式 / Python 代码
   （公式使用 KaTeX 语法，$...$ 行内，$$...$$ 独立显示）
   ========================================================= */
window.ALGO_CONTENT = [
  /* ====================== TOPSIS ====================== */
  {
    id: 'topsis', cat: 'eval', icon: 'T', c: ['#6366f1', '#8b5cf6'],
    name: 'TOPSIS 法', short: 'TOPSIS',
    en: 'Technique for Order Preference by Similarity to Ideal Solution',
    summary: '逼近理想解排序法：通过计算各方案与“最优解”“最劣解”的距离，衡量其相对优劣并进行综合排序。',
    tags: ['多指标评价', '综合排序', '可结合熵权'],
    keyFormula: String.raw`$$S_i=\frac{D_i^-}{D_i^+ + D_i^-}$$`,
    idea: String.raw`<p>TOPSIS 的核心思想非常直观：<b>好的方案应当离“最好”尽可能近，同时离“最差”尽可能远</b>。</p>
<p>首先将所有指标统一为“越大越好”的极大型并标准化，然后在每个指标上取最大值构成<b>正理想解</b> $Z^+$，取最小值构成<b>负理想解</b> $Z^-$。计算每个评价对象到两者的欧氏距离 $D_i^+$、$D_i^-$，最后用相对贴近度 $S_i$ 作为综合得分：$S_i$ 越接近 1，方案越优。</p>
<div class="key-formula">$$S_i=\frac{D_i^-}{D_i^+ + D_i^-}\in[0,1]$$</div>
<div class="formula-explain"><b>💡 公式直白解读：</b>$D_i^+$ 是方案 $i$ 与“虚拟满分标杆 $Z^+$”的差距（越小越好），$D_i^-$ 是与“虚拟垫底方案 $Z^-$”的距离（越大越好）。分式 $S_i$ 计算的是<b>“离最差有多远”占“两端总跨度”的比例</b>——若某方案就是满分标杆，则 $D_i^+=0 \implies S_i=1$。</div>`,
    scenes: ['多方案 / 多对象的综合评价与优劣排序（如城市竞争力、供应商选择）', '有明确的原始指标数据（可量化）', '与熵权法、AHP 等赋权方法组合使用（熵权-TOPSIS、AHP-TOPSIS）', '水质、环境、绩效等含有不同类型指标的评价问题'],
    pros: ['充分利用原始数据信息，结果精确反映方案间差距', '对样本量、指标数无严格限制，计算简单', '可灵活处理极大型、极小型、中间型、区间型指标', '几何意义清晰，便于解释'],
    cons: ['需要预先确定指标权重，权重主观时会影响结果', '增删方案可能导致排序逆转（理想解随样本变化）', '指标间高度相关时会出现信息重复'],
    data: String.raw`<p>决策矩阵 $X_{n\times m}$：$n$ 个评价对象（行）、$m$ 个评价指标（列），数值型。需明确每个指标的类型：</p>
<ul><li><b>极大型</b>：越大越好（如 GDP、成绩）</li><li><b>极小型</b>：越小越好（如成本、污染物）</li><li><b>中间型</b>：越接近某值越好（如 PH 值接近 7）</li><li><b>区间型</b>：落在某区间内最好（如体温 36~37℃）</li></ul>`,
    tips: '竞赛中常用 “熵权法确定权重 + TOPSIS 排序” 的组合模型，既客观又能输出排名。本站的在线求解中可一键切换为熵权-TOPSIS。',
    steps: [
      { t: '构建原始决策矩阵', d: String.raw`设有 $n$ 个评价对象、$m$ 个评价指标，$x_{ij}$ 表示第 $i$ 个对象在第 $j$ 个指标上的取值。`,
        f: String.raw`$$X=(x_{ij})_{n\times m}=\begin{pmatrix}x_{11}&x_{12}&\cdots&x_{1m}\\ x_{21}&x_{22}&\cdots&x_{2m}\\ \vdots&\vdots&\ddots&\vdots\\ x_{n1}&x_{n2}&\cdots&x_{nm}\end{pmatrix}$$`,
        n: '直白理解：每一行代表一个参赛选手（评价对象），每一列代表一个打分科目（评价指标）。' },
      { t: '指标正向化', d: String.raw`将所有指标统一转化为<b>极大型指标</b>（越大越好）。极小型：$\tilde x_i=\max x-x_i$；中间型（最优值 $x_{best}$）与区间型（最佳区间 $[a,b]$）分别为：`,
        f: String.raw`$$\tilde x_i=1-\frac{|x_i-x_{best}|}{M},\quad M=\max_i|x_i-x_{best}|$$
$$\tilde x_i=\begin{cases}1-\dfrac{a-x_i}{M}, & x_i\lt a\\[6pt] 1, & a\le x_i\le b\\[6pt] 1-\dfrac{x_i-b}{M}, & x_i\gt b\end{cases}\qquad M=\max\{a-\min x_i,\ \max x_i-b\}$$`,
        n: '公式解读：M 是所有样本偏离最佳值（或最佳区间 [a,b]）的“最大偏离幅度”。用实际偏离量除以 M 再被 1 减，就能把数据平滑映射到 [0, 1]：正好命中最佳值/区间时得满分 1，偏离最远的那一个得 0 分。' },
      { t: '标准化处理', d: '为消除不同指标量纲的影响，对正向化矩阵做向量归一化：',
        f: String.raw`$$z_{ij}=\frac{\tilde x_{ij}}{\sqrt{\sum_{i=1}^{n}\tilde x_{ij}^{2}}}$$`,
        n: '公式解读：分母是整列数据的“平方和开根号”（即列向量的几何长度）。除以它之后，每一列所有元素的平方和都恰好等于 1，从而消除了“万元、百分比、毫克”等单位量级差异。' },
      { t: '确定正、负理想解', d: '在每一个指标上取所有对象的最大值构成正理想解（最优方案），取最小值构成负理想解（最劣方案）：',
        f: String.raw`$$Z^+=\left(\max_i z_{i1},\ \max_i z_{i2},\ \dots,\ \max_i z_{im}\right),\qquad Z^-=\left(\min_i z_{i1},\ \min_i z_{i2},\ \dots,\ \min_i z_{im}\right)$$`,
        n: '公式解读：Z⁺ 是把所有对象在各项指标上的“单科最高分”拼出来的虚拟全能冠军；Z⁻ 则是把各项“单科最低分”拼出来的虚拟垫底对象。' },
      { t: '计算到理想解的距离', d: String.raw`结合指标权重 $w_j$（$\sum w_j=1$），计算第 $i$ 个对象与正、负理想解的加权欧氏距离：`,
        f: String.raw`$$D_i^+=\sqrt{\sum_{j=1}^{m}w_j\left(Z_j^+-z_{ij}\right)^2},\qquad D_i^-=\sqrt{\sum_{j=1}^{m}w_j\left(Z_j^--z_{ij}\right)^2}$$`,
        n: '公式解读：这就是高维空间里的“勾股定理（两点间直线距离）”，重要指标乘上更大的权重 wⱼ。Dᵢ⁺ 越小说明离冠军越近；Dᵢ⁻ 越大说明离垫底越远。' },
      { t: '计算相对贴近度并排序', d: String.raw`$S_i\in[0,1]$，越大说明越接近正理想解、方案越优。归一化后可作为最终得分：`,
        f: String.raw`$$S_i=\frac{D_i^-}{D_i^+ + D_i^-},\qquad \tilde S_i=\frac{S_i}{\sum_{i=1}^{n}S_i}$$`,
        n: '公式解读：Sᵢ 综合了 Dᵢ⁺ 和 Dᵢ⁻ 两个距离，越接近 1 代表越优秀；右式 S̃ᵢ 只是把所有对象的得分除以总和，转换成加起来等于 1 的相对占比。' },
    ],
    code: String.raw`import numpy as np

def topsis(X, types, w=None):
    """X: n×m 决策矩阵; types: 每列 'max' 或 'min'; w: 权重(可选)"""
    X = np.asarray(X, dtype=float).copy()
    for j, t in enumerate(types):                      # 1. 正向化
        if t == 'min':
            X[:, j] = X[:, j].max() - X[:, j]
    Z = X / np.sqrt((X ** 2).sum(axis=0))              # 2. 向量标准化
    m = X.shape[1]
    w = np.ones(m) / m if w is None else np.asarray(w) / np.sum(w)
    z_pos, z_neg = Z.max(axis=0), Z.min(axis=0)        # 3. 正负理想解
    d_pos = np.sqrt((w * (z_pos - Z) ** 2).sum(axis=1))  # 4. 距离
    d_neg = np.sqrt((w * (z_neg - Z) ** 2).sum(axis=1))
    S = d_neg / (d_pos + d_neg)                        # 5. 相对贴近度
    return S / S.sum()

X = [[4.69, 51, 11.94],
     [2.03, 19, 6.46],
     [9.11, 46, 8.91],
     [8.61, 46, 26.43]]
score = topsis(X, ['max', 'min', 'max'])
rank = (-score).argsort().argsort() + 1
print('得分:', score.round(4))
print('排名:', rank)`,
  },

  /* ====================== AHP ====================== */
  {
    id: 'ahp', cat: 'eval', icon: 'AHP', c: ['#0ea5e9', '#6366f1'],
    name: '层次分析法', short: 'AHP',
    en: 'Analytic Hierarchy Process',
    summary: '将复杂决策问题分解为目标—准则—方案的层次结构，通过两两比较构造判断矩阵来确定各因素权重。',
    tags: ['主观赋权', '定性转定量', '一致性检验'],
    keyFormula: String.raw`$$CR=\frac{CI}{RI}\lt 0.1$$`,
    idea: String.raw`<p>层次分析法由美国运筹学家 T. L. Saaty 于 20 世纪 70 年代提出。人很难一次性给出 $n$ 个因素的准确权重，但<b>比较两个因素谁更重要</b>却容易得多。</p>
<p>AHP 将问题分解为<b>目标层、准则层、方案层</b>，在每一层内用 1~9 标度对因素两两比较，形成判断矩阵 $A$；判断矩阵的最大特征值对应的特征向量（归一化后）即为权重。为避免出现“A 比 B 重要、B 比 C 重要、C 又比 A 重要”这类矛盾，需要做<b>一致性检验</b>。</p>
<div class="key-formula">$$A\mathbf w=\lambda_{\max}\mathbf w,\qquad CI=\frac{\lambda_{\max}-n}{n-1}$$</div>
<div class="formula-explain"><b>💡 公式直白解读：</b>若专家打分完全理想自洽（如 A 是 B 的 2 倍重要，B 是 C 的 3 倍，A 恰好是 C 的 6 倍），则最大特征值 $\lambda_{\max}$ 严格等于指标个数 $n$，此时 $CI=0$；打分越前后矛盾，$\lambda_{\max}$ 比 $n$ 超出得越多，$CI$ 就越大。</div>`,
    scenes: ['缺乏客观数据、需依赖专家经验进行决策的问题', '确定评价指标的权重（再与 TOPSIS、模糊综合评价等结合）', '方案选择：旅游地选择、选址决策、人才选拔等', '定性与定量相结合的复杂系统分析'],
    pros: ['系统性强：将复杂问题层次化、条理化', '所需定量数据少，能将主观判断量化', '简洁实用，易于理解和推广', '有一致性检验保证判断的逻辑合理性'],
    cons: ['主观性较强，不同专家结果可能差异较大', '指标过多（n > 9）时判断矩阵难以通过一致性检验', '只能在已有方案中选优，不能生成新方案'],
    data: String.raw`<p>只需要一个 $n\times n$ 的<b>正互反判断矩阵</b>：$a_{ij}\gt 0$，$a_{ji}=1/a_{ij}$，$a_{ii}=1$。其中 $a_{ij}$ 表示因素 $i$ 相对因素 $j$ 的重要程度（1~9 标度）。</p>
<p>建议准则数 $n\le 9$，过多时可分组形成多层结构。</p>`,
    tips: '论文中推荐同时给出算术平均法、几何平均法、特征值法三种方法的权重并取平均，以体现结果的稳健性。本站在线求解会同时输出三种结果。',
    steps: [
      { t: '建立层次结构模型', d: String.raw`分析问题中各因素之间的关系，自上而下建立递阶层次结构：<ul><li><b>目标层</b>：决策的目的（如“选择最佳旅游地”）</li><li><b>准则层</b>：评判的标准（如景色、费用、居住、饮食、交通）</li><li><b>方案层</b>：可供选择的备选方案（如苏杭、北戴河、桂林）</li></ul>` },
      { t: '构造判断矩阵', d: String.raw`对同一层次的各因素关于上一层某准则进行两两比较，采用 Saaty 1~9 标度：
<table><thead><tr><th>标度 $a_{ij}$</th><th>含义</th></tr></thead><tbody>
<tr><td>1</td><td>因素 $i$ 与 $j$ 同等重要</td></tr><tr><td>3</td><td>$i$ 比 $j$ 稍微重要</td></tr><tr><td>5</td><td>$i$ 比 $j$ 明显重要</td></tr><tr><td>7</td><td>$i$ 比 $j$ 强烈重要</td></tr><tr><td>9</td><td>$i$ 比 $j$ 极端重要</td></tr><tr><td>2, 4, 6, 8</td><td>上述相邻判断的中间值</td></tr><tr><td>倒数</td><td>$a_{ji}=1/a_{ij}$</td></tr></tbody></table>`,
        f: String.raw`$$A=\begin{pmatrix}1&a_{12}&\cdots&a_{1n}\\ 1/a_{12}&1&\cdots&a_{2n}\\ \vdots&\vdots&\ddots&\vdots\\ 1/a_{1n}&1/a_{2n}&\cdots&1\end{pmatrix}$$`,
        n: '公式解读：对角线全是 1（自己跟自己比同等重要）；若“景色”比“费用”重要 2 倍（a₂₁=2），那反过来“费用”相对“景色”就必须填倒数 1/2（a₁₂=1/2）。' },
      { t: '计算权重向量', d: '常用三种方法，结果通常相近：<b>①算术平均法</b>（列归一化后按行求平均）；<b>②几何平均法</b>（按行求几何平均后归一化）；<b>③特征值法</b>（求最大特征值对应的特征向量并归一化）。',
        f: String.raw`$$\text{①}\ w_i=\frac{1}{n}\sum_{j=1}^{n}\frac{a_{ij}}{\sum_{k=1}^{n}a_{kj}}\qquad \text{②}\ w_i=\frac{\left(\prod_{j=1}^{n}a_{ij}\right)^{1/n}}{\sum_{k=1}^{n}\left(\prod_{j=1}^{n}a_{kj}\right)^{1/n}}\qquad \text{③}\ A\mathbf w=\lambda_{\max}\mathbf w$$`,
        n: '公式解读：① 先把每一列除以该列总和（算出每列视角下的权重），再把各列结果按行取算术平均；② 把第 i 行的 n 个打分连乘起来开 n 次方，再除以所有行的总和；③ 解线性代数特征方程，取最大特征值对应的特征向量归一化。' },
      { t: '一致性检验', d: String.raw`计算一致性指标 $CI$，查表得平均随机一致性指标 $RI$，计算一致性比例 $CR$。当 $CR\lt 0.1$ 时认为判断矩阵的一致性可以接受，否则需修正判断矩阵。
<table><thead><tr><th>n</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th><th>9</th><th>10</th></tr></thead><tbody><tr><td>RI</td><td>0</td><td>0</td><td>0.52</td><td>0.89</td><td>1.12</td><td>1.26</td><td>1.36</td><td>1.41</td><td>1.46</td><td>1.49</td></tr></tbody></table>`,
        f: String.raw`$$CI=\frac{\lambda_{\max}-n}{n-1},\qquad CR=\frac{CI}{RI}$$`,
        n: '公式解读：CI 衡量当前矩阵偏离完全一致的程度；RI 是计算机随机乱填上万个互反矩阵算出的平均偏离基准。CR = CI / RI < 0.1 说明你的逻辑矛盾程度不到随机乱填的 10%，检验通过。' },
      { t: '层次总排序', d: String.raw`计算方案层对目标层的综合权重。设准则层权重为 $b_j$，方案 $k$ 对准则 $j$ 的权重为 $w_{kj}$，则方案 $k$ 的总得分为：`,
        f: String.raw`$$W_k=\sum_{j=1}^{m}b_j\,w_{kj},\qquad CR_{\text{总}}=\frac{\sum_j b_j\,CI_j}{\sum_j b_j\,RI_j}\lt 0.1$$`,
        n: '公式解读：左式就像算大学加权总评成绩——用每个科目的学分占比 bⱼ 乘以方案 k 在该科目下的得分 wₖⱼ 再相加。' },
      { t: '做出决策', d: '根据总排序权重的大小对方案排序，权重最大者为最优方案；并结合实际情况对结果进行合理性分析与敏感性分析。' },
    ],
    code: String.raw`import numpy as np

RI = [0, 0, 0, 0.52, 0.89, 1.12, 1.26, 1.36, 1.41, 1.46, 1.49, 1.52, 1.54, 1.56, 1.58, 1.59]

def ahp(A):
    A = np.asarray(A, dtype=float)
    n = A.shape[0]
    w_arith = (A / A.sum(axis=0)).mean(axis=1)          # 算术平均法
    g = np.prod(A, axis=1) ** (1 / n)
    w_geo = g / g.sum()                                  # 几何平均法
    vals, vecs = np.linalg.eig(A)                        # 特征值法
    k = np.argmax(vals.real)
    lam = vals[k].real
    w_eig = np.abs(vecs[:, k].real); w_eig /= w_eig.sum()
    CI = (lam - n) / (n - 1)                             # 一致性检验
    CR = CI / RI[n] if RI[n] else 0
    return w_arith, w_geo, w_eig, lam, CI, CR

A = [[1,   1/2, 4, 3,   3  ],
     [2,   1,   7, 5,   5  ],
     [1/4, 1/7, 1, 1/2, 1/3],
     [1/3, 1/5, 2, 1,   1  ],
     [1/3, 1/5, 3, 1,   1  ]]
wa, wg, we, lam, CI, CR = ahp(A)
print('特征值法权重:', we.round(4))
print(f'λmax={lam:.4f}  CI={CI:.4f}  CR={CR:.4f}  ->', '通过' if CR < 0.1 else '未通过')`,
  },

  /* ====================== 熵权法 ====================== */
  {
    id: 'entropy', cat: 'eval', icon: 'EWM', c: ['#14b8a6', '#0ea5e9'],
    name: '熵权法', short: 'EWM',
    en: 'Entropy Weight Method',
    summary: '基于信息熵的客观赋权方法：指标数据差异越大、信息熵越小，所提供的信息越多，权重越大。',
    tags: ['客观赋权', '信息熵', '综合评价'],
    keyFormula: String.raw`$$e_j=-\frac{1}{\ln n}\sum_{i=1}^{n}p_{ij}\ln p_{ij}$$`,
    idea: String.raw`<p>“熵”源于热力学，香农将其引入信息论，用以度量<b>不确定性</b>。一个指标在各对象上的取值越<b>分散</b>（差异越大），其信息熵越小，对综合评价的区分作用越大，应赋予更大权重；反之，若所有对象在某指标上取值几乎相同，则该指标对评价几乎没有贡献。</p>
<p>熵权法完全由数据本身决定权重，避免了人为主观因素的干扰。</p>
<div class="key-formula">$$w_j=\frac{1-e_j}{\sum_{k=1}^{m}(1-e_k)}$$</div>
<div class="formula-explain"><b>💡 公式直白解读：</b>信息熵 $e_j\in[0,1]$ 代表“大家在该指标上有多雷同”（全员同分时 $e_j=1$）。因此 $1-e_j$ 就代表“该指标拉开差距的能力（差异系数 $d_j$）”，把它除以所有指标的差异系数总和，就得到了客观权重 $w_j$。</div>`,
    scenes: ['需要客观确定多个评价指标权重的场合', '与 TOPSIS、灰色关联、模糊综合评价结合形成组合模型', '经济发展水平、生态环境质量、企业绩效等综合评价', '指标数据较完整、样本量较多的情况'],
    pros: ['完全客观，权重由数据差异决定', '计算简单，可解释性强', '可与多种评价方法灵活组合'],
    cons: ['忽略了指标本身的实际重要程度（可能与常识不符）', '对样本依赖性强，样本变化权重随之改变', '无法考虑指标间的相关性'],
    data: String.raw`<p>与 TOPSIS 相同的决策矩阵 $X_{n\times m}$，并标明各指标类型。注意：标准化后会出现 0 值，计算 $p\ln p$ 时约定 $0\ln 0=0$。</p>`,
    tips: '若希望兼顾专家经验与数据客观性，可将 AHP 主观权重 w¹ 与熵权 w² 做组合赋权：w = αw¹ + (1−α)w² 或乘法合成归一化。',
    steps: [
      { t: '构建矩阵并正向化', d: String.raw`构建 $n$ 个对象、$m$ 个指标的原始矩阵 $X$，将极小型、中间型、区间型指标正向化（方法同 TOPSIS），得到 $\tilde X$。` },
      { t: '数据标准化', d: '采用极差标准化（min-max）消除量纲影响，使各指标取值落在 [0, 1]：',
        f: String.raw`$$z_{ij}=\frac{\tilde x_{ij}-\min_i \tilde x_{ij}}{\max_i \tilde x_{ij}-\min_i \tilde x_{ij}}$$`,
        n: '公式解读：（当前值 − 该列最小值）÷（该列最大值 − 最小值）。处理后每列最高分变为 1，最低分变为 0。' },
      { t: '计算概率矩阵（比重）', d: String.raw`计算第 $j$ 个指标下第 $i$ 个对象所占的比重：`,
        f: String.raw`$$p_{ij}=\frac{z_{ij}}{\sum_{i=1}^{n}z_{ij}},\qquad \sum_{i=1}^{n}p_{ij}=1$$`,
        n: '公式解读：把第 j 列看作一块蛋糕，pᵢⱼ 就是第 i 个对象分到的份额占比，整列份额加起来等于 1。' },
      { t: '计算信息熵', d: String.raw`$e_j\in[0,1]$。当所有 $p_{ij}$ 相等时 $e_j=1$（无信息）。`,
        f: String.raw`$$e_j=-\frac{1}{\ln n}\sum_{i=1}^{n}p_{ij}\ln p_{ij},\qquad (\text{约定 } 0\ln 0=0)$$`,
        n: '公式解读：因为 0 < pᵢⱼ ≤ 1，所以 ln(pᵢⱼ) 是负数，前面加负号使结果为正；乘以 1/ln(n) 是为了将最大值恰好缩放到 1。大家份额越平均，eⱼ 越接近 1；差距越悬殊，eⱼ 越接近 0。' },
      { t: '计算信息效用值（差异系数）', d: '信息效用值越大，说明该指标提供的信息越多：',
        f: String.raw`$$d_j=1-e_j$$`,
        n: '公式解读：把“越小越好的信息熵 eⱼ”用 1 减，翻转为“越大越好的信息价值 dⱼ”。' },
      { t: '计算熵权', d: '将信息效用值归一化即得各指标的熵权：',
        f: String.raw`$$w_j=\frac{d_j}{\sum_{j=1}^{m}d_j}$$`,
        n: '公式解读：每个指标的信息价值 dⱼ 占全部指标总信息价值的比例，即为该指标的客观熵权。' },
      { t: '计算综合得分', d: '利用熵权对标准化数据加权求和，得到各对象的综合得分并排序（也可将权重代入 TOPSIS）：',
        f: String.raw`$$F_i=\sum_{j=1}^{m}w_j\,z_{ij}$$`,
        n: '公式解读：用算出的熵权 wⱼ 乘以各指标标准化得分 zᵢⱼ 并相加，得出每个对象的综合总分。' },
    ],
    code: String.raw`import numpy as np

def entropy_weight(X, types):
    X = np.asarray(X, dtype=float).copy()
    n, m = X.shape
    for j, t in enumerate(types):                     # 1. 正向化
        if t == 'min':
            X[:, j] = X[:, j].max() - X[:, j]
    Z = (X - X.min(0)) / (X.max(0) - X.min(0))        # 2. 极差标准化
    P = Z / Z.sum(0)                                  # 3. 比重
    with np.errstate(divide='ignore', invalid='ignore'):
        plnp = np.where(P > 0, P * np.log(P), 0)
    e = -plnp.sum(0) / np.log(n)                      # 4. 信息熵
    d = 1 - e                                         # 5. 差异系数
    w = d / d.sum()                                   # 6. 熵权
    score = Z @ w * 100                               # 7. 综合得分
    return w, score

X = [[1.2, 3.5, 4.1, 38],
     [2.6, 5.2, 3.2, 42],
     [0.9, 2.8, 5.5, 31],
     [3.1, 6.0, 2.9, 46]]
w, score = entropy_weight(X, ['max', 'max', 'min', 'max'])
print('权重:', w.round(4))
print('得分:', score.round(2))`,
  },

  /* ====================== 灰色关联 ====================== */
  {
    id: 'gra', cat: 'eval', icon: 'GRA', c: ['#10b981', '#0d9488'],
    name: '灰色关联分析', short: 'GRA',
    en: 'Grey Relational Analysis',
    summary: '根据序列曲线几何形状的相似程度判断因素间联系的紧密程度，适用于小样本、贫信息的系统分析与综合评价。',
    tags: ['影响因素分析', '小样本', '综合评价'],
    keyFormula: String.raw`$$\xi_i(k)=\frac{a+\rho b}{\Delta_i(k)+\rho b}$$`,
    idea: String.raw`<p>灰色系统理论由邓聚龙教授于 1982 年提出，“灰”指信息部分已知、部分未知。灰色关联分析的基本思想是：<b>两条序列曲线的几何形状越接近，它们的关联程度就越大</b>。</p>
<p>它常用于两类问题：<b>①影响因素分析</b>——以系统特征（如 GDP）为参考序列，分析哪些因素对其影响最大；<b>②综合评价</b>——以各指标最优值构成的“理想对象”为参考序列，关联度越大的对象越优。</p>
<div class="key-formula">$$r_i=\frac{1}{n}\sum_{k=1}^{n}\xi_i(k)$$</div>
<div class="formula-explain"><b>💡 公式直白解读：</b>$\xi_i(k)\in(0,1]$ 是第 $i$ 条子序列与母序列在第 $k$ 个时间点的“贴合得分”（贴得越紧越接近 1）；把所有时间点的贴合得分取平均，就是两条曲线的整体关联度 $r_i$。</div>`,
    scenes: ['分析系统中各因素对主行为的影响程度并排序', '样本量较少、数据分布规律不明显（无需典型分布）', '多指标综合评价（与 TOPSIS 类似，可组合为灰色关联-TOPSIS）', '经济、农业、工程等领域的因素分析'],
    pros: ['对样本量与数据分布无严格要求，小样本亦可', '计算量小，结果与定性分析通常一致', '可用于时间序列，也可用于截面数据'],
    cons: ['分辨系数 ρ 的取值带有主观性', '关联度只能反映相对大小，不代表因果关系', '各指标的最优值难以确定时评价结果会受影响'],
    data: String.raw`<p><b>影响因素分析</b>：每行为一个样本（如年份），第 1 列为参考序列（母序列），其余列为比较序列（子序列）。</p><p><b>综合评价</b>：每行为一个评价对象，每列为一个指标，需先对指标正向化。</p>`,
    tips: '分辨系数 ρ 通常取 0.5；ρ 越小，关联系数之间的差异越大、区分能力越强。论文中可对 ρ 做敏感性分析说明结果稳健。',
    steps: [
      { t: '确定分析序列', d: String.raw`确定反映系统行为特征的<b>参考序列</b>（母序列）与影响系统行为的<b>比较序列</b>（子序列）。综合评价时取各指标最优值构成参考序列。`,
        f: String.raw`$$X_0=\big(x_0(1),x_0(2),\dots,x_0(n)\big),\qquad X_i=\big(x_i(1),x_i(2),\dots,x_i(n)\big),\ i=1,\dots,m$$`,
        n: '公式解读：X₀ 是我们要研究的核心目标序列（如历年 GDP），X₁…Xₘ 是候选的影响因素序列（如一产、二产、三产产值）。' },
      { t: '无量纲化处理', d: '各因素量纲不同，需进行无量纲化。常用均值化（也可用初值化）：',
        f: String.raw`$$x_i'(k)=\frac{x_i(k)}{\frac{1}{n}\sum_{k=1}^{n}x_i(k)}$$`,
        n: '公式解读：每个数值除以所在列的平均值，使所有序列都变成围绕 1 上下波动的相对倍数，便于直接作差比较。' },
      { t: '求差序列与两级极差', d: '计算每个比较序列与参考序列在对应点的绝对差，并求两级最小差 a 与两级最大差 b：',
        f: String.raw`$$\Delta_i(k)=\left|x_0'(k)-x_i'(k)\right|,\qquad a=\min_i\min_k\Delta_i(k),\qquad b=\max_i\max_k\Delta_i(k)$$`,
        n: '公式解读：Δᵢ(k) 是第 i 条曲线在第 k 个点与母序列的竖直距离；“两级极差” a 和 b 就是先在每列里找最值，再在所有列里找全局最小差值 a 和全局最大差值 b。' },
      { t: '计算关联系数', d: String.raw`$\rho\in(0,1)$ 为分辨系数，一般取 $\rho=0.5$：`,
        f: String.raw`$$\xi_i(k)=\frac{a+\rho\,b}{\Delta_i(k)+\rho\,b}$$`,
        n: '公式解读：将差距 Δᵢ(k) 放在分母位置——当某点差距刚好是全局最小（Δᵢ(k) = a）时，分子分母相等，关联系数得满分 1；差距越大，分母越大，关联系数就越小。' },
      { t: '计算关联度', d: '关联系数是各时刻（各指标）的关联程度值，信息过于分散，取平均值（或加权平均）作为关联度：',
        f: String.raw`$$r_i=\frac{1}{n}\sum_{k=1}^{n}\xi_i(k)\qquad \text{或}\qquad r_i=\sum_{k=1}^{n}w_k\,\xi_i(k)$$`,
        n: '公式解读：把第 i 个因素在 n 个时刻的关联系数求算术平均（或按指标权重 wₖ 加权平均），汇总成一个代表整体相似度的总分 rᵢ。' },
      { t: '关联度排序与分析', d: '按关联度大小排序：在因素分析中，关联度越大，说明该因素对参考序列影响越大；在综合评价中，关联度越大的对象越优。' },
    ],
    code: String.raw`import numpy as np

def grey_relation(data, rho=0.5):
    """data: 第 0 列为参考序列(母序列)，其余列为比较序列"""
    X = np.asarray(data, dtype=float)
    X = X / X.mean(axis=0)                    # 1. 均值化
    x0, Xi = X[:, [0]], X[:, 1:]
    delta = np.abs(Xi - x0)                   # 2. 差序列
    a, b = delta.min(), delta.max()           # 3. 两级最小差、最大差
    xi = (a + rho * b) / (delta + rho * b)    # 4. 关联系数
    return xi.mean(axis=0)                    # 5. 关联度

#        GDP  第一产业 第二产业 第三产业
data = [[1988, 386,  839,  763],
        [2061, 408,  846,  808],
        [2335, 422,  960,  953],
        [2750, 482, 1258, 1010],
        [3356, 511, 1577, 1268],
        [3806, 561, 1893, 1352]]
r = grey_relation(data)
print('关联度:', r.round(4))`,
  },

  /* ====================== 一元线性回归 ====================== */
  {
    id: 'linear', cat: 'reg', icon: 'LR', c: ['#f97316', '#f43f5e'],
    name: '一元线性回归', short: 'LR',
    en: 'Simple Linear Regression',
    summary: '研究一个自变量与一个因变量之间线性关系的统计方法，用最小二乘法估计回归直线，并进行显著性检验与预测。',
    tags: ['最小二乘', '相关分析', '区间预测'],
    keyFormula: String.raw`$$\hat y=\hat\beta_0+\hat\beta_1x$$`,
    idea: String.raw`<p>当散点图显示两个变量大致沿一条直线分布时，可以用一条直线来刻画它们的关系。<b>最小二乘法</b>的思想是：寻找一条直线，使所有观测点到直线的<b>竖直距离的平方和最小</b>。</p>
<p>得到回归方程后，还需要回答两个问题：<b>方程拟合得好不好</b>（$R^2$）、<b>线性关系是否显著</b>（$t$ 检验、$F$ 检验），最后才能用于预测。</p>
<div class="key-formula">$$\min_{\beta_0,\beta_1}Q=\sum_{i=1}^{n}\left(y_i-\beta_0-\beta_1x_i\right)^2$$</div>
<div class="formula-explain"><b>💡 公式直白解读：</b>$\beta_0 + \beta_1 x_i$ 是直线算出的预测值，$y_i - (\beta_0 + \beta_1 x_i)$ 就是第 $i$ 个真实数据点到直线的竖直偏差（残差）；平方是为了防止正负偏差相抵消，最小二乘就是找到让总偏差平方和 $Q$ 最小的那条唯一最佳直线。</div>`,
    scenes: ['两个变量间存在明显线性趋势（如广告投入与销售额）', '探究单一因素对结果的影响方向与大小', '简单趋势预测（如年份与产量）', '作为更复杂回归模型的基准模型'],
    pros: ['模型简单、计算方便，结果可解释性极强', '有完整的统计推断理论（检验、置信区间）', '是理解其他回归方法的基础'],
    cons: ['只能刻画线性关系，对非线性关系拟合差', '对异常值敏感', '仅考虑单一因素，可能遗漏重要变量'],
    data: String.raw`<p>$n$ 组成对样本 $(x_i,y_i)$，建议 $n\ge 10$。经典假设：误差项 $\varepsilon_i$ 独立、零均值、同方差，且服从正态分布 $N(0,\sigma^2)$。</p>`,
    tips: '建模前务必先画散点图；建模后做残差分析（残差应随机分布在 0 附近，无明显趋势或喇叭形），以验证模型假设是否成立。',
    steps: [
      { t: '绘制散点图与相关分析', d: String.raw`观察数据分布形态，计算 Pearson 相关系数 $r$ 判断线性相关程度（$|r|$ 越接近 1 线性关系越强）：`,
        f: String.raw`$$r=\frac{\sum_{i=1}^{n}(x_i-\bar x)(y_i-\bar y)}{\sqrt{\sum_{i=1}^{n}(x_i-\bar x)^2\sum_{i=1}^{n}(y_i-\bar y)^2}}=\frac{L_{xy}}{\sqrt{L_{xx}L_{yy}}}$$`,
        n: '公式解读：分子 Lₓᵧ 衡量 x 和 y 是否“同涨同跌”（都在均值上方或都在下方时乘积为正）；分母是两者各自波动幅度。r ∈ [-1, 1]，越接近 ±1 说明散点越紧贴一条直线。' },
      { t: '建立回归模型', d: String.raw`假设 $y$ 与 $x$ 之间满足线性关系，$\beta_0$ 为截距，$\beta_1$ 为回归系数（斜率），$\varepsilon$ 为随机误差：`,
        f: String.raw`$$y=\beta_0+\beta_1x+\varepsilon,\qquad \varepsilon\sim N(0,\sigma^2)$$`,
        n: '公式解读：把真实值 y 拆成“确定性直线部分 β₀ + β₁x”加上“随机噪音 ε”（假设噪音均值为 0、方差恒为 σ²）。' },
      { t: '最小二乘法估计参数', d: String.raw`令 $Q$ 对 $\beta_0,\beta_1$ 的偏导数为 0，解正规方程组得：`,
        f: String.raw`$$\hat\beta_1=\frac{L_{xy}}{L_{xx}}=\frac{\sum(x_i-\bar x)(y_i-\bar y)}{\sum(x_i-\bar x)^2},\qquad \hat\beta_0=\bar y-\hat\beta_1\bar x$$`,
        n: '公式解读：斜率 β̂₁ 就是“x 与 y 的协动量 Lₓᵧ ÷ x 自身的波动量 Lₓₓ”；求完斜率后，根据“回归直线必定穿过样本中心点 (x̄, ȳ)”反推出截距 β̂₀。' },
      { t: '拟合优度与误差精度评价', d: String.raw`总平方和分解为 $SST=SSR+SSE$。决定系数 $R^2$ 衡量回归解释力；同时数模竞赛中常用 MAE、MSE、RMSE、MRE/MAPE 评定实际预测精度：`,
        f: String.raw`$$R^2=1-\frac{SSE}{SST},\quad \text{MAE}=\frac{1}{n}\sum_{i=1}^{n}|y_i-\hat y_i|,\quad \text{MSE}=\frac{SSE}{n},\quad \text{RMSE}=\sqrt{\text{MSE}},\quad \text{MRE}=\frac{1}{n}\sum_{i=1}^{n}\frac{|y_i-\hat y_i|}{|y_i|}$$`,
        n: '公式解读：SSE/SST 是“未被模型解释的残差波动占比”，用 1 减去它就是模型成功解释的比例 R²；MAE 是平均每次预测差多少，RMSE 对大误差惩罚更重，MRE 则是平均偏差占真实值的百分比。' },
      { t: '显著性检验', d: String.raw`检验 $H_0:\beta_1=0$。$t$ 检验与 $F$ 检验在一元情形下等价（$F=t^2$），$p\lt 0.05$ 时认为线性关系显著：`,
        f: String.raw`$$t=\frac{\hat\beta_1}{\hat\sigma/\sqrt{L_{xx}}}\sim t(n-2),\qquad F=\frac{SSR}{SSE/(n-2)}\sim F(1,n-2),\qquad \hat\sigma=\sqrt{\frac{SSE}{n-2}}$$`,
        n: '公式解读：t 值等于“斜率估计值 ÷ 斜率的标准误（信噪比）”，F 值等于“回归解释的方差 ÷ 残差噪音方差”。|t| 或 F 越大（对应 p < 0.05），说明 x 对 y 的影响绝非巧合。' },
      { t: '残差分析与预测', d: String.raw`检查残差是否满足独立、同方差、正态等假设。对给定 $x_0$，点预测 $\hat y_0=\hat\beta_0+\hat\beta_1x_0$，其 $1-\alpha$ 预测区间为：`,
        f: String.raw`$$\hat y_0\pm t_{\alpha/2}(n-2)\,\hat\sigma\sqrt{1+\frac{1}{n}+\frac{(x_0-\bar x)^2}{L_{xx}}}$$`,
        n: '公式解读：根号内三项代表预测不确定性的三个来源：① 1 是新样本点自身的随机波动；② 1/n 是样本均值估计误差；③ (x₀−x̄)²/Lₓₓ 说明预测点 x₀ 离历史中心 x̄ 越远，误差带越呈喇叭口张开。' },
    ],
    code: String.raw`import numpy as np
from scipy import stats
import statsmodels.api as sm

x = np.array([2.1, 3.0, 3.8, 4.5, 5.2, 6.1, 7.0, 7.8, 8.6, 9.5])
y = np.array([12.3, 15.1, 18.2, 20.5, 22.8, 26.9, 29.5, 33.1, 35.6, 39.2])

# 1) scipy 快速回归与精度误差指标
res = stats.linregress(x, y)
y_hat = res.intercept + res.slope * x
mae = np.mean(np.abs(y - y_hat))
mse = np.mean((y - y_hat) ** 2)
rmse = np.sqrt(mse)
mre = np.mean(np.abs(y - y_hat) / np.abs(y))
print(f'回归方程: y = {res.intercept:.4f} + {res.slope:.4f} x')
print(f'精度指标: R²={res.rvalue**2:.4f}, MAE={mae:.4f}, MSE={mse:.4f}, RMSE={rmse:.4f}, MRE={mre*100:.2f}%')

# 2) statsmodels 完整回归报告（系数显著性、F 检验）
model = sm.OLS(y, sm.add_constant(x)).fit()
print(model.summary())

# 3) x0 = 10.5 处的点预测与 95% 区间
pred = model.get_prediction(np.array([[1, 10.5]]))
print(pred.summary_frame(alpha=0.05))`,
  },

  /* ====================== 多元线性回归 ====================== */
  {
    id: 'multiple', cat: 'reg', icon: 'MLR', c: ['#ec4899', '#a855f7'],
    name: '多元线性回归', short: 'MLR',
    en: 'Multiple Linear Regression',
    summary: '研究一个因变量与多个自变量之间线性关系的模型，以矩阵形式的最小二乘求解，并进行整体与个别显著性检验及共线性诊断。',
    tags: ['矩阵最小二乘', 'F/t 检验', 'VIF 共线性'],
    keyFormula: String.raw`$$\hat{\boldsymbol\beta}=(X^\top X)^{-1}X^\top\mathbf y$$`,
    idea: String.raw`<p>现实问题中，因变量往往受到<b>多个因素</b>共同影响，例如房价同时受面积、房龄、地段影响。多元线性回归将一元模型推广到多个自变量：</p>
$$y=\beta_0+\beta_1x_1+\beta_2x_2+\cdots+\beta_kx_k+\varepsilon$$
<p>回归系数 $\beta_j$ 的含义是：<b>在其他自变量保持不变时</b>，$x_j$ 每增加一个单位，$y$ 平均变化 $\beta_j$ 个单位。借助矩阵运算，可以一次性求出所有参数。</p>
<div class="formula-explain"><b>💡 公式直白解读：</b>核心矩阵公式 $\hat{\boldsymbol\beta}=(X^\top X)^{-1}X^\top\mathbf y$ 把所有自变量打包成矩阵 $X$、因变量打包成向量 $\mathbf y$，无需逐个求导解方程组，直接通过矩阵转置与求逆一步算出全部回归系数 $\hat\beta_0, \hat\beta_1, \dots, \hat\beta_k$。</div>`,
    scenes: ['多因素对某一结果的定量影响分析（解释）', '基于多个解释变量对因变量进行预测', '筛选关键影响因素（结合逐步回归）', '经济计量、社会调查、工程实验数据分析'],
    pros: ['可同时考虑多个因素，更贴近实际', '参数有明确的经济/物理含义', '统计推断理论成熟（F 检验、t 检验、置信区间）'],
    cons: ['要求变量间关系为线性', '自变量间存在多重共线性时估计不稳定', '对异常值、异方差、自相关敏感', '样本量需明显大于自变量个数'],
    data: String.raw`<p>样本量 $n$，自变量个数 $k$，要求 $n\gt k+1$（建议 $n\ge 5\sim10$ 倍 $k$）。数据每行一个样本，前 $k$ 列为自变量，<b>最后一列为因变量</b>。</p>`,
    tips: '若某些自变量 t 检验不显著，可以采用逐步回归（向前 / 向后 / 双向）剔除；若 VIF > 10，可考虑删除相关变量、主成分回归或岭回归。',
    steps: [
      { t: '变量选择与数据准备', d: '根据机理分析或相关分析选取候选自变量，绘制散点图矩阵、计算相关系数矩阵，初步判断各自变量与因变量的线性关系及自变量之间的相关性。' },
      { t: '建立回归模型（矩阵形式）', d: String.raw`对 $n$ 组样本，模型可写为矩阵形式，其中 $X$ 为 $n\times(k+1)$ 设计矩阵（首列全为 1）：`,
        f: String.raw`$$\mathbf y=X\boldsymbol\beta+\boldsymbol\varepsilon,\qquad X=\begin{pmatrix}1&x_{11}&\cdots&x_{1k}\\ 1&x_{21}&\cdots&x_{2k}\\ \vdots&\vdots&\ddots&\vdots\\ 1&x_{n1}&\cdots&x_{nk}\end{pmatrix},\qquad \boldsymbol\varepsilon\sim N(\mathbf 0,\sigma^2I)$$`,
        n: '公式解读：矩阵 X 的第 1 列全填 1，是为了与参数向量 β 的第 1 个元素 β₀ 相乘时自动变成常数截距项；把 n 个样本的线性方程竖着叠在一起就写成了 y = Xβ + ε。' },
      { t: '最小二乘估计', d: String.raw`最小化残差平方和 $Q(\boldsymbol\beta)=(\mathbf y-X\boldsymbol\beta)^\top(\mathbf y-X\boldsymbol\beta)$，求导得正规方程 $X^\top X\boldsymbol\beta=X^\top\mathbf y$，解得：`,
        f: String.raw`$$\hat{\boldsymbol\beta}=(X^\top X)^{-1}X^\top\mathbf y,\qquad \hat\sigma^2=\frac{SSE}{n-k-1}$$`,
        n: '公式解读：这是一元回归斜率 Lₓᵧ/Lₓₓ 的矩阵升级版——Xᵀy 相当于自变量与因变量的协方差，乘以 (XᵀX)⁻¹ 相当于除以自变量自身的协方差矩阵；分母 n−k−1 是扣除 k+1 个待估参数后的自由度。' },
      { t: '拟合优度与误差精度评价', d: String.raw`除调整后决定系数 $\bar R^2$ 外，数模赛题常用 MAE、MSE、RMSE、MRE/MAPE 评判多元预测精度：`,
        f: String.raw`$$\bar R^2=1-\frac{SSE/(n-k-1)}{SST/(n-1)},\quad \text{MAE}=\frac{1}{n}\sum_{i=1}^n|y_i-\hat y_i|,\quad \text{MSE}=\frac{SSE}{n},\quad \text{RMSE}=\sqrt{\text{MSE}},\quad \text{MRE}=\frac{1}{n}\sum_{i=1}^n\frac{|y_i-\hat y_i|}{|y_i|}$$`,
        n: '公式解读：普通 R² 只要多塞几个无关自变量就会虚高；调整决定系数 R̄² 上下分别除以自由度 (n−k−1) 和 (n−1)，给“增加变量个数 k”加上了惩罚，只有真正有用的自变量才会让 R̄² 上升。' },
      { t: '显著性检验', d: String.raw`<b>F 检验</b>（整体显著性）检验 $H_0:\beta_1=\cdots=\beta_k=0$；<b>t 检验</b>（单个系数）检验 $H_0:\beta_j=0$，其中 $c_{jj}$ 为 $(X^\top X)^{-1}$ 的第 $j$ 个对角元：`,
        f: String.raw`$$F=\frac{SSR/k}{SSE/(n-k-1)}\sim F(k,\,n-k-1),\qquad t_j=\frac{\hat\beta_j}{\hat\sigma\sqrt{c_{jj}}}\sim t(n-k-1)$$`,
        n: '公式解读：F 检验看“所有 k 个自变量合在一起对预测 y 有没有显著作用”；tⱼ 检验看“剔除其他变量影响后，单独第 j 个自变量是否不可或缺”（p < 0.05 即显著）。' },
      { t: '多重共线性诊断', d: String.raw`$R_j^2$ 为第 $j$ 个自变量对其余自变量回归的决定系数。一般认为 $VIF\gt 10$ 存在严重共线性：`,
        f: String.raw`$$VIF_j=\frac{1}{1-R_j^2}$$`,
        n: '公式解读：把第 j 个自变量 xⱼ 当作因变量、拿其余自变量去拟合它得到 Rⱼ²。若 xⱼ 能被其他自变量线性替代（Rⱼ² 接近 1），分母 1−Rⱼ² 就会趋近于 0，导致方差膨胀因子 VIFⱼ 暴增（>10 说明严重共线）。' },
      { t: '残差分析与预测', d: String.raw`检查残差的正态性、同方差性、独立性（可用 Durbin-Watson 检验）。对新样本 $\mathbf x_0=(1,x_{01},\dots,x_{0k})^\top$：`,
        f: String.raw`$$\hat y_0=\mathbf x_0^\top\hat{\boldsymbol\beta},\qquad \hat y_0\pm t_{\alpha/2}(n-k-1)\,\hat\sigma\sqrt{1+\mathbf x_0^\top(X^\top X)^{-1}\mathbf x_0}$$`,
        n: '公式解读：根号里的二次型 x₀ᵀ(XᵀX)⁻¹x₀ 度量的是“新样本点 x₀ 离历史训练样本中心的马氏距离”——预测点越偏离常见样本范围，预测区间就越宽。' },
    ],
    code: String.raw`import numpy as np
import pandas as pd
import statsmodels.api as sm
from statsmodels.stats.outliers_influence import variance_inflation_factor

df = pd.DataFrame({
    '面积':  [85, 120, 60, 95, 150, 70, 110, 80, 130, 65, 100, 140],
    '房龄':  [5, 3, 15, 8, 2, 20, 10, 12, 6, 25, 4, 9],
    '距地铁': [1.2, 0.8, 2.5, 1.5, 0.5, 3.0, 1.0, 2.0, 1.8, 0.6, 2.8, 1.1],
    '价格':  [142, 185, 97, 150, 223, 98, 171, 121, 193, 106, 147, 206]})

X = sm.add_constant(df[['面积', '房龄', '距地铁']])
y = df['价格']
model = sm.OLS(y, X).fit()
print(model.summary())                       # 系数、t 检验、F 检验、R²

# 误差精度指标计算
y_hat = model.predict(X)
mae = np.mean(np.abs(y - y_hat))
mse = np.mean((y - y_hat) ** 2)
rmse = np.sqrt(mse)
mre = np.mean(np.abs(y - y_hat) / y)
print(f'精度指标: MAE={mae:.4f}, MSE={mse:.4f}, RMSE={rmse:.4f}, MRE={mre*100:.2f}%')

# VIF 共线性诊断
vif = [variance_inflation_factor(X.values, i) for i in range(1, X.shape[1])]
print('VIF 共线性检验:', np.round(vif, 3))

# 点预测与 95% 置信区间
x_new = pd.DataFrame({'const': [1], '面积': [100], '房龄': [5], '距地铁': [1.0]})
print(model.get_prediction(x_new).summary_frame(alpha=0.05))`,
  },

  /* ====================== 非线性回归 ====================== */
  {
    id: 'nonlinear', cat: 'reg', icon: 'NLR', c: ['#f59e0b', '#ea580c'],
    name: '非线性回归', short: 'NLR',
    en: 'Nonlinear & Polynomial Regression',
    summary: '当变量之间呈曲线关系时，通过多项式、指数、幂函数、对数、Logistic 等模型拟合，采用线性化变换与 LM 迭代求解。',
    tags: ['曲线拟合', 'Logistic', 'Levenberg–Marquardt'],
    keyFormula: String.raw`$$\min_{\boldsymbol\theta}\sum_{i=1}^{n}\left[y_i-f(x_i;\boldsymbol\theta)\right]^2$$`,
    idea: String.raw`<p>许多实际问题中变量关系是<b>曲线型</b>的：人口增长先快后慢趋于饱和（S 形）、细菌繁殖呈指数增长、边际效用递减呈对数形……此时需要选择合适的非线性函数形式 $y=f(x;\boldsymbol\theta)$。</p>
<p>求解思路分两类：<b>①可线性化模型</b>——通过变量代换（如取对数）化为线性回归；<b>②本质非线性模型</b>——采用 Gauss-Newton、<b>Levenberg–Marquardt (LM)</b> 等迭代算法直接最小化残差平方和。实际中常用①的结果作为②的初值，兼顾稳定与精度。</p>
<div class="formula-explain"><b>公式通俗解读：</b>$\boldsymbol\theta$ 是待求参数向量（如 Logistic 曲线中的最大容量 $K$、增长速率 $b$），目标就是调整这些参数，让理论曲线 $f(x_i;\boldsymbol\theta)$ 与实验数据点 $y_i$ 之间的总垂直偏差平方和达到最小。</div>`,
    scenes: ['散点图呈明显曲线趋势（增长、衰减、饱和）', '人口、产品市场、传染病等 S 形增长预测（Logistic）', '物理、化学实验数据的经验公式拟合', '多项式趋势拟合与插值近似'],
    pros: ['可刻画复杂的非线性关系，拟合精度高', '模型参数常具有明确的实际意义（如 K 为环境容纳量）', '线性化 + LM 迭代求解稳定可靠'],
    cons: ['模型形式需要人为选择，依赖经验与机理分析', '迭代算法依赖初值，可能收敛到局部最优', '高次多项式易过拟合、外推能力差'],
    data: String.raw`<p>$n$ 组样本 $(x_i,y_i)$，样本量需大于参数个数。注意定义域：指数、Logistic 模型线性化要求 $y\gt 0$；幂函数要求 $x,y\gt 0$；对数模型要求 $x\gt 0$。</p>`,
    tips: '模型选择不能只看 R²：应综合 R²、RMSE、AIC（越小越好）以及模型的实际意义与外推合理性。本站的“全部对比”功能可一键比较各模型。',
    steps: [
      { t: '绘制散点图，选择候选模型', d: String.raw`根据散点图形态与问题机理选择候选函数：
<table><thead><tr><th>模型</th><th>表达式</th><th>典型特征</th></tr></thead><tbody>
<tr><td>多项式</td><td>$y=\beta_0+\beta_1x+\cdots+\beta_px^p$</td><td>有拐点、波动</td></tr>
<tr><td>指数</td><td>$y=ae^{bx}$</td><td>增长/衰减速度与当前值成正比</td></tr>
<tr><td>幂函数</td><td>$y=ax^{b}$</td><td>双对数坐标下呈直线</td></tr>
<tr><td>对数</td><td>$y=a+b\ln x$</td><td>先快后慢，增长递减</td></tr>
<tr><td>Logistic</td><td>$y=\dfrac{K}{1+ae^{-bx}}$</td><td>S 形曲线，存在饱和值 K</td></tr></tbody></table>` },
      { t: '线性化变换（求初值）', d: '对可线性化的模型通过变量代换转为线性回归问题，用最小二乘求得参数（作为后续迭代的初值）：',
        f: String.raw`$$y=ae^{bx}\ \Rightarrow\ \ln y=\ln a+bx\qquad\quad y=ax^b\ \Rightarrow\ \ln y=\ln a+b\ln x$$
$$y=\frac{K}{1+ae^{-bx}}\ \Rightarrow\ \ln\!\left(\frac{K}{y}-1\right)=\ln a-bx$$`,
        n: String.raw`公式解读：通过取自然对数 $\ln$，把原本“弯曲”的指数、幂函数或 S 形曲线拉直成关于 $x$（或 $\ln x$）的一次直线方程，从而能直接套用普通最小二乘法快速算出粗略初值。` },
      { t: '多项式回归', d: String.raw`令 $x_j=x^j$ 为新变量，多项式回归即转化为多元线性回归，可直接用矩阵最小二乘求解：`,
        f: String.raw`$$y=\beta_0+\beta_1x+\beta_2x^2+\cdots+\beta_px^p\ \Longrightarrow\ \hat{\boldsymbol\beta}=(X^\top X)^{-1}X^\top\mathbf y,\quad X_{ij}=x_i^{\,j}$$`,
        n: String.raw`公式解读：虽然曲线含 $x^2, x^3$ 等高次项，但对待求系数 $\beta_j$ 而言仍是线性的，只需把 $x, x^2, \dots, x^p$ 当作多个自变量列进矩阵 $X$ 即可一步求解。阶数 $p$ 一般 $\le 4$，防止过拟合。` },
      { t: '非线性最小二乘迭代（LM 算法）', d: String.raw`线性化会改变误差结构（对 $\ln y$ 最小二乘 ≠ 对 $y$ 最小二乘），因此以线性化结果为初值，用 LM 算法直接最小化原始残差平方和。每步迭代求解增量 $\boldsymbol\delta$，其中 $J$ 为雅可比矩阵、$\mathbf r$ 为残差向量、$\lambda$ 为阻尼因子：`,
        f: String.raw`$$\left(J^\top J+\lambda\,\mathrm{diag}(J^\top J)\right)\boldsymbol\delta=J^\top\mathbf r,\qquad \boldsymbol\theta^{(t+1)}=\boldsymbol\theta^{(t)}+\boldsymbol\delta$$`,
        n: String.raw`公式解读：LM 算法是“梯度下降法”和“高斯-牛顿法”的智能结合体——$J$ 是预测值对各参数的偏导数矩阵（灵敏度），$\mathbf r=y-\hat y$ 是当前误差；阻尼因子 $\lambda$ 大时步子稳（像梯度下降），$\lambda$ 小时收敛快（像二阶牛顿法），每步算出参数修正量 $\boldsymbol\delta$ 不断逼近最优解。` },
      { t: '误差指标评价与模型比较', d: String.raw`计算全套误差评价指标（MAE、MSE、RMSE、MRE/MAPE），并结合 AIC 信息准则在多项式、指数、幂函数、Logistic 等候选模型间进行横向择优：`,
        f: String.raw`$$\text{MAE}=\frac{1}{n}\sum_{i=1}^n|y_i-\hat y_i|,\quad \text{MSE}=\frac{1}{n}\sum_{i=1}^n(y_i-\hat y_i)^2,\quad \text{RMSE}=\sqrt{\text{MSE}},\quad \text{MRE}=\frac{1}{n}\sum_{i=1}^n\frac{|y_i-\hat y_i|}{|y_i|},\quad AIC=n\ln\frac{SSE}{n}+2k$$`,
        n: String.raw`公式解读：$AIC$（赤池信息量准则）由两部分组成：前半部分 $n\ln(SSE/n)$ 衡量拟合误差，后半部分 $2k$ 是对参数个数 $k$ 的惩罚；$AIC$ 越小说明模型“既拟合得准、又足够精简（不过拟合）”。` },
      { t: '预测与解释', d: '选定最优模型后进行预测，并结合参数实际意义解释结果（如 Logistic 中 K 为环境最大容纳量，b 为内禀增长率）。外推预测需格外谨慎。' },
    ],
    code: String.raw`import numpy as np
from scipy.optimize import curve_fit

x = np.arange(1, 13)
y = np.array([4.2, 6.8, 11.5, 18.9, 30.1, 45.3, 61.8, 76.4, 86.9, 93.2, 96.8, 98.6])

def logistic(x, K, a, b):
    return K / (1 + a * np.exp(-b * x))

# 1) 线性化求初值
K0 = y.max() * 1.1
b1, b0 = np.polyfit(x, np.log(K0 / y - 1), 1)
p0 = [K0, np.exp(b0), -b1]

# 2) LM 非线性最小二乘
popt, pcov = curve_fit(logistic, x, y, p0=p0, method='lm')
y_hat = logistic(x, *popt)

# 3) 拟合优度与全套误差指标
r2 = 1 - ((y - y_hat) ** 2).sum() / ((y - y.mean()) ** 2).sum()
mae = np.mean(np.abs(y - y_hat))
mse = np.mean((y - y_hat) ** 2)
rmse = np.sqrt(mse)
mre = np.mean(np.abs(y - y_hat) / y)
print(f'Logistic 参数: K={popt[0]:.3f}, a={popt[1]:.4f}, b={popt[2]:.4f}')
print(f'精度指标: R²={r2:.4f}, MAE={mae:.4f}, MSE={mse:.4f}, RMSE={rmse:.4f}, MRE={mre*100:.2f}%')

# 4) 多项式回归对比
coef = np.polyfit(x, y, deg=3)
print('三次多项式系数(高次→低次):', coef.round(4))
print('x=14 时 Logistic 预测:', logistic(14, *popt).round(3))`,
  },

  /* ====================== GM(1,1) ====================== */
  {
    id: 'gm11', cat: 'reg', icon: 'GM', c: ['#ef4444', '#db2777'],
    name: '灰色预测 GM(1,1)', short: 'GM(1,1)',
    en: 'Grey Model GM(1,1)',
    summary: '通过累加生成弱化原始数据的随机性，建立一阶单变量微分方程模型，适用于小样本、近似指数规律的时间序列预测。',
    tags: ['小样本预测', '累加生成', '后验差检验'],
    keyFormula: String.raw`$$\frac{dx^{(1)}}{dt}+ax^{(1)}=b$$`,
    idea: String.raw`<p>GM(1,1) 表示 “1 阶微分方程、1 个变量” 的灰色模型。原始数据往往杂乱无章，但通过<b>一次累加生成（1-AGO）</b>后，新序列会呈现出明显的<b>近似指数增长规律</b>，从而可以用一阶线性微分方程来拟合。</p>
<p>求出累加序列的预测值后，再通过<b>累减还原</b>得到原始序列的预测值。GM(1,1) 只需 4 个以上数据即可建模，是数据量少时的利器。</p>
<div class="key-formula">$$\hat x^{(1)}(k+1)=\left(x^{(0)}(1)-\frac{b}{a}\right)e^{-ak}+\frac{b}{a}$$</div>
<div class="formula-explain"><b>公式通俗解读：</b>上标 $(0)$ 代表原始数据，上标 $(1)$ 代表“累加后的数据”（例如第 3 项等于前 3 年之和）。累加把波动的数据变成平滑上升曲线，用指数函数 $e^{-ak}$ 拟合出累加预测值 $\hat x^{(1)}$ 后，再用“今年累加值减去去年累加值”就还原出了今年的预测值 $\hat x^{(0)}$。</div>`,
    scenes: ['样本量少（4~10 个）的时间序列短期预测', '数据呈单调、近似指数变化趋势（如人口、能耗、GDP）', '信息不完全的“灰色系统”', '作为组合预测模型的组成部分'],
    pros: ['所需数据少，4 个数据即可建模', '不要求数据服从典型分布', '计算简单，短期预测精度较高', '有完整的精度检验体系'],
    cons: ['只适用于近似指数规律的数据，对波动大的数据效果差', '中长期预测误差较大', '要求原始数据非负（否则需平移）'],
    data: String.raw`<p>一个等时间间隔的非负时间序列 $X^{(0)}=\big(x^{(0)}(1),\dots,x^{(0)}(n)\big)$，$n\ge 4$。数据需通过<b>级比检验</b>，否则可做平移变换 $y^{(0)}(k)=x^{(0)}(k)+c$。</p>`,
    tips: '-a 称为发展系数：当 -a ≤ 0.3 时适用于中长期预测；0.3 < -a ≤ 0.5 适用于短期预测；-a > 1 时不宜采用 GM(1,1) 模型。',
    steps: [
      { t: '级比检验', d: String.raw`计算序列的级比 $\lambda(k)$，若所有级比都落在可容覆盖区间内，则可以建立 GM(1,1) 模型；否则需对数据做平移变换：`,
        f: String.raw`$$\lambda(k)=\frac{x^{(0)}(k-1)}{x^{(0)}(k)},\ k=2,\dots,n,\qquad \lambda(k)\in\left(e^{-\frac{2}{n+1}},\ e^{\frac{2}{n+1}}\right)$$`,
        n: String.raw`公式解读：级比 $\lambda(k)$ 就是“上一期除以本一期”的比值，用来检验原始序列的变化速度是否平缓均匀；若全部落在区间 $(e^{-2/(n+1)}, e^{2/(n+1)})$ 内，说明适合用指数规律拟合；若不通过，给所有数据统一加上一个常数 $c$ 即可平滑比值。` },
      { t: '一次累加生成（1-AGO）', d: '对原始序列进行一次累加，弱化随机性、增强规律性：',
        f: String.raw`$$x^{(1)}(k)=\sum_{i=1}^{k}x^{(0)}(i),\qquad k=1,2,\dots,n$$`,
        n: String.raw`公式解读：就像“求前缀和”，第 $k$ 个累加值等于前 $k$ 期原始数据加在一起。只要原始数据为正，累加序列 $x^{(1)}$ 必然单调递增且消除了局部随机毛刺。` },
      { t: '紧邻均值生成', d: String.raw`构造背景值序列 $Z^{(1)}$：`,
        f: String.raw`$$z^{(1)}(k)=\frac{1}{2}\left(x^{(1)}(k)+x^{(1)}(k-1)\right),\qquad k=2,3,\dots,n$$`,
        n: String.raw`公式解读：由于微分方程是连续的而数据是离散的，用相邻两期累加值的平均值 $z^{(1)}(k)$（梯形中位线面积近似）来代替 $[k-1, k]$ 时段内的平均状态。` },
      { t: '建立灰微分方程与白化方程', d: String.raw`$a$ 为发展系数，$b$ 为灰作用量：`,
        f: String.raw`$$\text{灰微分方程：}\ x^{(0)}(k)+a\,z^{(1)}(k)=b\qquad\quad \text{白化方程：}\ \frac{dx^{(1)}}{dt}+a\,x^{(1)}=b$$`,
        n: String.raw`公式解读：注意 $x^{(0)}(k) = x^{(1)}(k) - x^{(1)}(k-1)$ 恰好是累加序列在单位时间内的增量（即导数 $\frac{dx^{(1)}}{dt}$ 的离散形式）；其中 $-a$ 控制指数增长快慢（发展系数），$b$ 代表外部恒定驱动力（灰作用量）。` },
      { t: '最小二乘估计参数', d: '将 n−1 个灰微分方程写成矩阵形式 Y = Bu，用最小二乘求参数：',
        f: String.raw`$$\hat{\mathbf u}=\begin{pmatrix}\hat a\\ \hat b\end{pmatrix}=(B^\top B)^{-1}B^\top Y,\qquad B=\begin{pmatrix}-z^{(1)}(2)&1\\ -z^{(1)}(3)&1\\ \vdots&\vdots\\ -z^{(1)}(n)&1\end{pmatrix},\quad Y=\begin{pmatrix}x^{(0)}(2)\\ x^{(0)}(3)\\ \vdots\\ x^{(0)}(n)\end{pmatrix}$$`,
        n: String.raw`公式解读：把灰微分方程改写成 $x^{(0)}(k) = -a\,z^{(1)}(k) + b$，这就变成了以 $-z^{(1)}(k)$ 为自变量、$x^{(0)}(k)$ 为因变量的线性回归，直接用最小二乘矩阵公式求出 $\hat a$ 和 $\hat b$。` },
      { t: '求时间响应函数并累减还原', d: String.raw`求解白化方程（初始条件 $\hat x^{(1)}(1)=x^{(0)}(1)$），再累减得到原始序列的拟合与预测值：`,
        f: String.raw`$$\hat x^{(1)}(k+1)=\left(x^{(0)}(1)-\frac{b}{a}\right)e^{-ak}+\frac{b}{a},\qquad \hat x^{(0)}(k+1)=\hat x^{(1)}(k+1)-\hat x^{(1)}(k)$$`,
        n: String.raw`公式解读：左式是一阶常微分方程的标准解析解（算出累加预测值），右式做一次“相邻相减（差分）”，把累加值还原成每一期实际的预测值 $\hat x^{(0)}$。` },
      { t: '模型精度与误差检验体系', d: String.raw`<b>①误差量度</b>：MAE、MSE、RMSE 与平均相对误差 MRE（$\lt 10\%$ 为较高精度，$\lt 20\%$ 为一般精度）。<b>②级比偏差</b>：$|\rho(k)|\lt 0.1$。<b>③后验差比与小误差概率</b>：
<table><thead><tr><th>精度等级</th><th>后验差比 C</th><th>小误差概率 P</th><th>平均相对误差 MRE</th></tr></thead><tbody>
<tr><td>一级（好）</td><td>$\le 0.35$</td><td>$\ge 0.95$</td><td>$\lt 10\%$</td></tr><tr><td>二级（合格）</td><td>$\le 0.50$</td><td>$\ge 0.80$</td><td>$\lt 20\%$</td></tr><tr><td>三级（勉强）</td><td>$\le 0.65$</td><td>$\ge 0.70$</td><td>$\ge 20\%$</td></tr><tr><td>四级（不合格）</td><td>$\gt 0.65$</td><td>$\lt 0.70$</td><td>不推荐</td></tr></tbody></table>`,
        f: String.raw`$$\text{MAE}=\frac{1}{n-1}\sum_{k=2}^n|x^{(0)}_k-\hat x^{(0)}_k|,\quad \text{RMSE}=\sqrt{\frac{1}{n-1}\sum_{k=2}^n(x^{(0)}_k-\hat x^{(0)}_k)^2},\quad \text{MRE}=\frac{1}{n-1}\sum_{k=2}^n\frac{|x^{(0)}_k-\hat x^{(0)}_k|}{x^{(0)}_k},\quad C=\frac{S_2}{S_1}$$`,
        n: String.raw`公式解读：后验差比 $C = S_2/S_1$ 是“残差标准差 $S_2$”与“原始数据标准差 $S_1$”的比值——$C$ 越小（如 $\le 0.35$），说明预测误差相比原始数据自身的波动非常小，模型精度极佳。` },
    ],
    code: String.raw`import numpy as np

def gm11(x0, steps=3):
    x0 = np.asarray(x0, dtype=float)
    n = len(x0)
    lam = x0[:-1] / x0[1:]                                   # 1. 级比检验
    lo, hi = np.exp(-2 / (n + 1)), np.exp(2 / (n + 1))
    print('级比检验:', '通过' if np.all((lam > lo) & (lam < hi)) else '未通过')
    x1 = np.cumsum(x0)                                       # 2. 1-AGO
    z1 = 0.5 * (x1[1:] + x1[:-1])                            # 3. 紧邻均值
    B = np.column_stack([-z1, np.ones(n - 1)])
    a, b = np.linalg.lstsq(B, x0[1:], rcond=None)[0]         # 4. 最小二乘
    k = np.arange(n + steps)
    x1_hat = (x0[0] - b / a) * np.exp(-a * k) + b / a        # 5. 时间响应
    x0_hat = np.r_[x0[0], np.diff(x1_hat)]                   # 6. 累减还原
    e = x0[1:] - x0_hat[1:n]                                 # 7. 精度检验(k=2..n)
    
    # 全套误差评价指标
    mae = np.mean(np.abs(e))
    mse = np.mean(e ** 2)
    rmse = np.sqrt(mse)
    mre = np.mean(np.abs(e) / x0[1:])
    C = e.std() / x0.std()
    P = np.mean(np.abs(e - e.mean()) < 0.6745 * x0.std())
    print(f'发展系数 a={a:.6f}, 灰作用量 b={b:.4f}')
    print(f'精度指标: MAE={mae:.4f}, MSE={mse:.4f}, RMSE={rmse:.4f}, MRE={mre*100:.2f}%')
    print(f'后验差检验: C={C:.4f}, P={P:.2f}')
    return x0_hat[:n], x0_hat[n:]

fit, pred = gm11([128.5, 136.2, 143.1, 151.8, 160.3, 168.9, 178.2], steps=3)
print('拟合值:', fit.round(3))
print('预测值:', pred.round(3))`,
  },

  /* ====================== 模糊综合评价 ====================== */
  {
    id: 'fce', cat: 'eval', icon: 'FCE', c: ['#06b6d4', '#3b82f6'],
    name: '模糊综合评价', short: 'FCE',
    en: 'Fuzzy Comprehensive Evaluation',
    summary: '应用模糊集合论中的隶属度与模糊变换，将定性评价转化为定量评价，有效处理评价指标边界模糊、难以精确量化的问题。',
    tags: ['模糊隶属度', '模糊合成算子', '定性转定量', '综合评判'],
    keyFormula: String.raw`$$\mathbf B = \mathbf W \circ \mathbf R$$`,
    idea: String.raw`<p>现实决策中，许多事物的属性并非“非黑即白”，如“空气质量优良”、“服务态度满意”、“水质清洁度”，其评价界限具有<b>模糊性（Fuzzy）</b>。</p>
<p>模糊综合评价建立在扎德（L. A. Zadeh）创立的模糊集合论基础之上：通过确定评价指标集 $U$、评语集 $V$ 与单因素隶属度矩阵 $\mathbf R$，再结合权重向量 $\mathbf W$，利用<b>模糊合成算子</b>（如加权平均型、主因素决定型）得出方案对各评语等级的综合隶属度向量 $\mathbf B$，最后依据最大隶属度原则或加权评分得出结论。</p>
<div class="key-formula">$$\mathbf B = (b_1, b_2, \dots, b_n) = \mathbf W \circ \mathbf R = (w_1, \dots, w_m) \circ \begin{pmatrix} r_{11} & \cdots & r_{1n} \\ \vdots & \ddots & \vdots \\ r_{m1} & \cdots & r_{mn} \end{pmatrix}$$</div>
<div class="formula-explain"><b>公式通俗解读：</b>矩阵第 $i$ 行第 $j$ 列的 $r_{ij}$ 表示“第 $i$ 项指标属于第 $j$ 个评语等级（如优秀）的程度（或专家投票比例）”；符号 $\circ$ 代表模糊合成运算，把各指标权重 $\mathbf W$ 与评判矩阵 $\mathbf R$ 结合，算出整体方案在“优、良、中、差”各等级上的总归属度 $\mathbf B$。</div>`,
    scenes: ['指标界限难以定量划分、含有人为主观模糊性的评价（如教师教学质量、企业满意度）', '环境质量、水质、生态健康等多等级综合判定', '与 AHP、熵权法配合（用 AHP/熵权确定权重，FCE 执行综合模糊评判）', '多层次复杂系统的综合评估（二级/多级模糊综合评价）'],
    pros: ['能系统化地定量处理定性描述与模糊边界', '结果为一个向量而非单一数值，能丰富反映对象在各个等级上的倾向性', '适用性广，可与专家问卷、调查投票无缝结合'],
    cons: ['隶属函数的选取带有一定主观性', '当指标数较多时，主因素决定型算子容易出现“信息丢失”或评语过于集中', '最大隶属度原则在隶属度接近时可能存在失效风险'],
    data: String.raw`<p>指标权重向量 $\mathbf W = (w_1, \dots, w_m)$（$\sum w_i = 1$）；单因素模糊评判矩阵 $\mathbf R_{m\times n}$（每行表示该指标属于各个评价等级的隶属度或投票比重，通常行和为 1）；以及评语集等级名称与可选赋分向量。</p>`,
    tips: '在数学建模论文中，建议优先采用 $M(\cdot, \oplus)$ 乘加加权平均型算子，因为它综合考虑了所有指标的信息；同时推荐计算“最大隶属度有效度指标”以佐证决策的可靠性。',
    steps: [
      { t: '确定因素集与评语集', d: String.raw`设评价对象的指标因素集为 $U=\{u_1, u_2, \dots, u_m\}$；评语集（等级集）为 $V=\{v_1, v_2, \dots, v_n\}$（如 {优秀, 良好, 一般, 较差, 极差}）。`,
        f: String.raw`$$U = \{u_1, u_2, \dots, u_m\},\qquad V = \{v_1, v_2, \dots, v_n\}$$`,
        n: String.raw`公式解读：$U$ 是“评什么”（如教学态度、教学内容、教学方法 $m$ 个指标），$V$ 是“怎么评”（如优、良、中、差 $n$ 个等级档次）。` },
      { t: '确定指标权重向量', d: String.raw`反映各指标在整体评价中的相对重要程度，满足非负性与归一化条件：`,
        f: String.raw`$$\mathbf W = (w_1, w_2, \dots, w_m),\qquad w_i \ge 0,\quad \sum_{i=1}^m w_i = 1$$`,
        n: String.raw`公式解读：$w_i$ 是第 $i$ 个指标的重要程度占比（所有权重加起来等于 $1$），可由 AHP 层次分析法（主观赋权）或熵权法（客观赋权）科学确定。` },
      { t: '构建单因素模糊评价矩阵', d: String.raw`对每个指标 $u_i$，确定其对各评语等级 $v_j$ 的隶属度 $r_{ij}$（可通过正态/梯形隶属函数计算，或由专家评分、问卷调查比例汇总）：`,
        f: String.raw`$$\mathbf R = (r_{ij})_{m\times n} = \begin{pmatrix} r_{11} & r_{12} & \cdots & r_{1n} \\ r_{21} & r_{22} & \cdots & r_{2n} \\ \vdots & \vdots & \ddots & \vdots \\ r_{m1} & r_{m2} & \cdots & r_{mn} \end{pmatrix},\qquad 0 \le r_{ij} \le 1$$`,
        n: String.raw`公式解读：例如有 10 位专家对指标 1 打分，4 人评“优”、4 人评“良”、2 人评“中”、0 人评“差”，那么矩阵第 1 行就是 $(0.4, 0.4, 0.2, 0.0)$。` },
      { t: '选择算子进行模糊合成', d: String.raw`利用模糊合成算子计算综合评价向量 $\mathbf B = \mathbf W \circ \mathbf R$。常用四种算子：
<table><thead><tr><th>算子类型</th><th>数学符号</th><th>计算公式</th><th>特点</th></tr></thead><tbody>
<tr><td>加权平均型</td><td>$M(\cdot, \oplus)$</td><td>$b_j = \sum_{i=1}^m w_i r_{ij}$</td><td>兼顾所有因素，信息保留最全面（推荐）</td></tr>
<tr><td>主因素决定型</td><td>$M(\wedge, \vee)$</td><td>$b_j = \max_i (\min(w_i, r_{ij}))$</td><td>突出关键主导因素，常用于严苛筛选</td></tr>
<tr><td>主因素突出型</td><td>$M(\cdot, \vee)$</td><td>$b_j = \max_i (w_i r_{ij})$</td><td>突出主要指标贡献</td></tr>
<tr><td>有界和型</td><td>$M(\wedge, \oplus)$</td><td>$b_j = \min(1, \sum_i \min(w_i, r_{ij}))$</td><td>约束上限求和</td></tr></tbody></table>`,
        f: String.raw`$$b_j = \sum_{i=1}^m w_i\,r_{ij},\qquad j = 1, 2, \dots, n$$`,
        n: String.raw`公式解读：符号 $\wedge$ 表示取较小值（$\min$），符号 $\vee$ 表示取较大值（$\max$）；而最常用的加权平均算子 $M(\cdot, \oplus)$ 就是普通矩阵乘法，把各指标在第 $j$ 等级上的隶属度按权重加权求和得到 $b_j$。` },
      { t: '综合向量归一化', d: String.raw`部分算子计算出的向量元素和不为 1，需做归一化处理得到各评语的最终隶属概率：`,
        f: String.raw`$$\tilde b_j = \frac{b_j}{\sum_{k=1}^n b_k},\qquad \tilde{\mathbf B} = (\tilde b_1, \tilde b_2, \dots, \tilde b_n)$$`,
        n: String.raw`公式解读：将综合隶属度向量各项除以它们的总和，使 $\tilde b_1 + \dots + \tilde b_n = 1$，这样每个 $\tilde b_j$ 就能直接解释为“整体属于第 $j$ 等级的百分比权重”。` },
      { t: '综合评语决策与分值计算', d: String.raw`①<b>最大隶属度原则</b>：选取 $\max_j \tilde b_j$ 对应的评语 $v_{j^*}$ 作为定性结论；②<b>加权分值法</b>：给定评语等级分值向量 $\mathbf S = (s_1, \dots, s_n)^\top$（如 [95, 80, 65, 50]），计算百分制量化总分：`,
        f: String.raw`$$F = \tilde{\mathbf B} \cdot \mathbf S = \sum_{j=1}^n \tilde b_j\,s_j$$`,
        n: String.raw`公式解读：给每个评语档次赋一个具体分数 $s_j$（如优=95分、良=80分），再乘以对应档次的隶属度比重 $\tilde b_j$ 求和，就把模糊的定性评语转化成了一个可以精确排名的综合总分 $F$。` },
    ],
    code: String.raw`import numpy as np

def fuzzy_eval(W, R, op='sum-prod', scores=None):
    W = np.asarray(W, dtype=float)
    W = W / W.sum()
    R = np.asarray(R, dtype=float)
    m, n = R.shape
    
    if op == 'sum-prod':       # 加权平均型 M(·, ⊕)
        B = W @ R
    elif op == 'max-min':      # 主因素决定型 M(∧, ∨)
        B = np.max(np.minimum(W[:, None], R), axis=0)
    elif op == 'max-prod':     # 主因素突出型 M(·, ∨)
        B = np.max(W[:, None] * R, axis=0)
    elif op == 'min-sum':      # 有界和型 M(∧, ⊕)
        B = np.minimum(1.0, np.sum(np.minimum(W[:, None], R), axis=0))
    
    B_norm = B / B.sum()
    max_idx = int(np.argmax(B_norm))
    score = float(B_norm @ scores) if scores is not None else None
    return B_norm, max_idx, score

# 示例：4个维度，4个评语等级 ['优', '良', '中', '差']
W = [0.35, 0.25, 0.20, 0.20]
R = [[0.4, 0.4, 0.2, 0.0],
     [0.6, 0.3, 0.1, 0.0],
     [0.2, 0.5, 0.2, 0.1],
     [0.1, 0.3, 0.4, 0.2]]
scores = [95, 80, 65, 50]

B_norm, max_idx, score = fuzzy_eval(W, R, op='sum-prod', scores=scores)
grades = ['优秀', '良好', '中等', '较差']
print('综合隶属度:', B_norm.round(4))
print(f'最大隶属度评定: {grades[max_idx]} (隶属度 {B_norm[max_idx]:.4f})')
print(f'综合量化评分: {score:.2f} 分')`,
  },

  /* ====================== 时间序列 ARIMA ====================== */
  {
    id: 'arima', cat: 'reg', icon: 'ARIMA', c: ['#3b82f6', '#6366f1'],
    name: '时间序列 ARIMA', short: 'ARIMA',
    en: 'AutoRegressive Integrated Moving Average',
    summary: '经典自回归积分滑动平均模型：对非平稳时序差分平稳化后，结合自回归项 AR 与滑动平均项 MA 捕捉动态依赖结构，进行统计推断与区间预测。',
    tags: ['时序预测', '平稳性差分', 'ACF/PACF 定阶', '动态区间预测'],
    keyFormula: String.raw`$$\Phi(B)(1-B)^d X_t = c + \Theta(B)\varepsilon_t$$`,
    idea: String.raw`<p>时间序列分析旨在挖掘历史观测值随时间演化的内在随机依赖规律。ARIMA$(p,d,q)$ 模型由统计学家 Box 与 Jenkins 提出，将时序分解为三大核心构件：</p>
<ul>
  <li><b>I (差分项, $d$)</b>：对非平稳趋势序列进行 $d$ 阶差分 $\nabla^d X_t$，消除均值趋势转化为平稳序列；</li>
  <li><b>AR (自回归项, $p$)</b>：当前值由过去的 $p$ 个历史值加权决定，刻画时序系统的“惯性/记忆效应”；</li>
  <li><b>MA (滑动平均项, $q$)</b>：当前值由过去的 $q$ 个随机扰动误差加权决定，刻画外部冲击的“滞后衰减”效应。</li>
</ul>
<div class="key-formula">$$\left(1-\sum_{i=1}^p \phi_i B^i\right)(1-B)^d X_t = c + \left(1+\sum_{j=1}^q \theta_j B^j\right)\varepsilon_t,\qquad \varepsilon_t \overset{i.i.d.}{\sim} N(0, \sigma^2)$$</div>
<div class="formula-explain"><b>公式通俗解读：</b>式中的 $B$ 叫“滞后算子”，作用是把时间往回推一步（即 $B X_t = X_{t-1}$，$B^k X_t = X_{t-k}$）。$(1-B)^d X_t$ 就是做 $d$ 次相邻相减（差分）消除趋势；左边括号里的 $\phi_i$ 把过去 $p$ 期历史值关联到现在（自回归 AR），右边括号里的 $\theta_j$ 把过去 $q$ 期预测误差 $\varepsilon_{t-j}$ 修补到现在（滑动平均 MA）。</div>`,
    scenes: ['具有趋势性、自相关性但无强季节性的中短期时间序列预测（如宏观经济指标、电力负荷、销量趋势）', '检验历史扰动冲击对当前系统的持续影响机制', '作为金融与工程数据时序基准对比模型'],
    pros: ['理论根基深厚，具有成熟的参数估计、假设检验与统计诊断体系', '不仅输出点预测，还能严格计算未来多步的置信区间', '对自相关结构捕捉精准，计算高效'],
    cons: ['要求序列在差分后满足宽平稳性假设，不擅长强非线性突变', '中远期预测随着方差发散置信带会迅速变宽，远期预测精度下降', '对缺失值与不规则采样敏感'],
    data: String.raw`<p>等间隔采样的单变量数值时间序列 $X = (x_1, x_2, \dots, x_N)$，样本容量建议 $N \ge 20$。要求无连续大面积缺失值。</p>`,
    tips: '在竞赛中，ARIMA 建模的精髓在于严谨的流程：差分后务必用 ACF / PACF 辅助识别阶数；残差必须通过 Ljung-Box 白噪声检验，否则说明时序信息尚未提取充分。',
    steps: [
      { t: '序列平稳性检验与差分', d: String.raw`观察时序图并计算差分。若原始序列非平稳（存在持续上升/下降趋势），进行一阶或二阶差分 $\nabla^d X_t$，直至差分序列围绕常数均值上下随机波动。`,
        f: String.raw`$$\nabla X_t = X_t - X_{t-1},\qquad \nabla^2 X_t = \nabla X_t - \nabla X_{t-1} = X_t - 2X_{t-1} + X_{t-2}$$`,
        n: String.raw`公式解读：一阶差分 $\nabla X_t$ 是“今天减昨天”的增量（消除线性增长趋势）；二阶差分 $\nabla^2 X_t$ 是“增量的增量”（消除二次曲线加速趋势）。` },
      { t: '绘制自相关与偏自相关图 (ACF / PACF)', d: String.raw`计算差分序列的样本自相关函数 $\hat\rho_k$ 与偏自相关函数 $\hat\phi_{kk}$，结合 Bartlett 标准误判定拖尾与截尾特性，初步确定阶数 $(p, q)$。
<table><thead><tr><th>模型</th><th>自相关函数 ACF</th><th>偏自相关函数 PACF</th></tr></thead><tbody>
<tr><td>$AR(p)$</td><td>拖尾（指数/振荡衰减）</td><td>$p$ 阶截尾（超出虚线临界值）</td></tr>
<tr><td>$MA(q)$</td><td>$q$ 阶截尾</td><td>拖尾</td></tr>
<tr><td>$ARMA(p, q)$</td><td>拖尾</td><td>拖尾</td></tr></tbody></table>`,
        f: String.raw`$$\hat\rho_k = \frac{\sum_{t=k+1}^N (w_t - \bar w)(w_{t-k} - \bar w)}{\sum_{t=1}^N (w_t - \bar w)^2},\qquad \text{置信界限: } \pm \frac{1.96}{\sqrt{N}}$$`,
        n: String.raw`公式解读：$\hat\rho_k$ 衡量“当前数据 $w_t$ 与 $k$ 期前的数据 $w_{t-k}$ 有多相似”；若在某阶之后迅速跌入 $\pm 1.96/\sqrt{N}$ 蓝色虚线带内，就叫“截尾”，用来判断 $p$ 和 $q$ 取几阶。` },
      { t: '模型参数估计', d: String.raw`对选定阶数 $(p, d, q)$ 的差分序列 $w_t = \nabla^d X_t$，利用条件最小二乘（CLS）或 Hannan-Rissanen 算法估计自回归系数 $\phi_i$、滑动平均系数 $\theta_j$ 与常数项 $c$。`,
        f: String.raw`$$w_t = c + \sum_{i=1}^p \phi_i w_{t-i} + \varepsilon_t + \sum_{j=1}^q \theta_j \varepsilon_{t-j},\qquad \hat\sigma^2 = \frac{1}{N-d-p-q}\sum_{t} \hat\varepsilon_t^2$$`,
        n: String.raw`公式解读：把展开后的方程看作“当前差分值 = 常数项 + 过去 $p$ 期差分值的加权和 + 当期随机冲击 + 过去 $q$ 期冲击残差的加权和”，$\hat\sigma^2$ 为残差噪声的估计方差。` },
      { t: '模型诊断：残差白噪声检验', d: String.raw`优秀的模型应将有用信息完全吸收，使残差 $\{\hat\varepsilon_t\}$ 成为纯随机白噪声序列。采用 <b>Ljung-Box $Q$ 统计量</b> 进行自相关检验，要求 $p\gt 0.05$（无法拒绝白噪声原假设）。`,
        f: String.raw`$$Q = N(N+2)\sum_{k=1}^m \frac{\hat r_k^2(\hat\varepsilon)}{N-k} \sim \chi^2(m - p - q)$$`,
        n: String.raw`公式解读：$\hat r_k(\hat\varepsilon)$ 是残差序列在第 $k$ 阶的自相关系数；$Q$ 统计量把前 $m$ 阶残差自相关平方汇总起来——如果 $Q$ 很小（对应 $p$ 值 $>0.05$），说明残差里已经没有任何规律可挖，模型提取信息充分。` },
      { t: '信息准则优选与误差精度评价 (AIC/BIC & MAE/RMSE)', d: String.raw`在多个候选阶数组合中，除通过 AIC/BIC 判定模型相对优劣外，在竞赛论文中常列出历史序列的拟合误差指标（MAE、MSE、RMSE、MRE/MAPE）证明预测模型的拟合可靠性：`,
        f: String.raw`$$\text{MAE}=\frac{1}{N}\sum_{t=1}^N|x_t-\hat x_t|,\quad \text{RMSE}=\sqrt{\frac{1}{N}\sum_{t=1}^N(x_t-\hat x_t)^2},\quad \text{MRE}=\frac{1}{N}\sum_{t=1}^N\frac{|x_t-\hat x_t|}{|x_t|},\quad AIC=2k-2\ln L$$`,
        n: String.raw`公式解读：$L$ 是模型的最大似然函数值，$k$ 是参数总数；$AIC$ 兼顾了“高似然度（拟合准）”与“少参数（防过拟合）”，值越小代表 $(p,d,q)$ 阶数搭配越合理。` },
      { t: '多步外推预测与还原', d: String.raw`利用估计好的差分方程递推向后预测未来 $h$ 步 $\hat w_{N+h}$，再通过逆差分还原到原始时间序列尺度，并输出 95% 预测置信区间：`,
        f: String.raw`$$\hat X_{N+h} = \hat X_{N+h-1} + \hat w_{N+h}\ (d=1),\qquad \hat X_{N+h} \pm 1.96\,\hat\sigma \sqrt{\sum_{j=0}^{h-1}\psi_j^2}$$`,
        n: String.raw`公式解读：$\psi_j$ 是将 ARIMA 模型展开为无穷阶滑动平均 $\text{MA}(\infty)$ 后的传递权重（$\psi_0=1$）；预测步数 $h$ 越远，根号下累加的 $\psi_j^2$ 项越多，误差扇形区间也就自然越往外张开。` },
    ],
    code: String.raw`import numpy as np
import pandas as pd
import statsmodels.api as sm
from statsmodels.tsa.stattools import adfuller
from statsmodels.stats.diagnostic import acorr_ljungbox

# 模拟或载入时间序列数据
data = [112, 118, 132, 129, 121, 135, 148, 148, 136, 119, 104, 118,
        115, 126, 141, 135, 125, 149, 170, 170, 158, 133, 114, 140,
        145, 150, 178, 163, 172, 178, 199, 199, 184, 162, 146, 166]
ts = pd.Series(data)

# 1. 平稳性检验
adf_res = adfuller(ts)
print(f'ADF Statistic: {adf_res[0]:.4f}, p-value: {adf_res[1]:.4f}')

# 2. 拟合 ARIMA(1, 1, 1) 模型
model = sm.tsa.ARIMA(ts, order=(1, 1, 1)).fit()
print(model.summary())

# 3. 历史拟合精度误差评价指标 (MAE, MSE, RMSE, MRE)
fitted = model.fittedvalues
mae = np.mean(np.abs(ts - fitted))
mse = np.mean((ts - fitted) ** 2)
rmse = np.sqrt(mse)
mre = np.mean(np.abs(ts - fitted) / ts)
print(f'拟合精度: MAE={mae:.4f}, MSE={mse:.4f}, RMSE={rmse:.4f}, MRE={mre*100:.2f}%')

# 4. 残差白噪声 Ljung-Box 检验
lb_df = acorr_ljungbox(model.resid, lags=[6, 10], return_df=True)
print('\n残差 Ljung-Box 检验:')
print(lb_df)

# 5. 外推预测未来 5 期及 95% 置信区间
forecast_res = model.get_forecast(steps=5)
pred_df = forecast_res.summary_frame(alpha=0.05)
print('\n向后 5 期预测值与置信区间:')
print(pred_df[['mean', 'mean_ci_lower', 'mean_ci_upper']])`,
  },

  /* ====================== 蒙特卡洛算法 ====================== */
  {
    id: 'monte_carlo', cat: 'sim', icon: 'MC', c: ['#ec4899', '#f43f5e'],
    name: '蒙特卡洛算法', short: 'Monte Carlo',
    en: 'Monte Carlo Simulation & Random Sampling',
    summary: '以概率论与数理统计为基础的计算机随机模拟方法，借助大数定律和伪随机数生成，解决高维复杂系统数值积分、随机仿真与风险量化决策。',
    tags: ['大数定律', '随机抽样', '数值积分', '金融 VaR 仿真'],
    keyFormula: String.raw`$$\hat\theta = \frac{1}{N}\sum_{i=1}^N f(X_i) \xrightarrow{P} \mathbb{E}[f(X)]$$`,
    idea: String.raw`<p>蒙特卡洛（Monte Carlo）方法源于 20 世纪 40 年代冯·诺依曼与乌拉姆在研制核武器时的开创性工作，因著名赌城而得名。其核心哲学是：<b>用大量的随机试验来逼近确定性的真实答案</b>。</p>
<p>当一个数学模型过于复杂、维度过高或包含高度随机扰动导致无法求得解析解时，计算机生成成千上万个符合特定概率分布的随机样本，统计这些样本在系统中的输出均值、方差与分位数。由<b>辛钦大数定律</b>保证，样本估计值以概率 1 收敛于真实理论值，误差按 $O(1/\sqrt{N})$ 速率收敛，且该收敛速度与问题维度无关（突破“维数灾难”）。</p>
<div class="formula-explain"><b>公式通俗解读：</b>$\mathbb{E}[f(X)]$ 是我们想求但算不出解析解的理论期望（或积分值）；只需随机抽取 $N$ 个样本点 $X_i$ 代入函数算平均值 $\hat\theta$，当模拟次数 $N\to\infty$ 时，算术平均值就会依概率收敛（$\xrightarrow{P}$）到真实答案。</div>`,
    scenes: ['解析解难以求解的复杂/高维区域定积分与面积计算', '排队论、供应链、离散事件服务系统的动态运作仿真', '金融工程中的资产期权定价、几何布朗运动与风险价值 (VaR) 量化', '随机需求下的多阶段库存决策优化（如报童问题）'],
    pros: ['几乎不受问题几何维度与函数非线性形式的限制（突破维数灾难）', '概念直观易懂，易于在计算机上并行化执行', '能同时输出系统均值、极端风险分位数与全概率分布形态'],
    cons: ['收敛速度为 O(1/√N)，提高一位有效精度需要增加 100 倍计算量', '高度依赖高质量的伪随机数发生器', '所得结果为概率近似值而非严格精确解析值'],
    data: String.raw`<p>根据具体任务提供参数：①定积分需被积函数表达式与积分上下限；②资产仿真需初价 $S_0$、漂移率 $\mu$、波动率 $\sigma$；③库存决策需均值、方差、进货成本与售价。</p>`,
    tips: '在数模论文中应用蒙特卡洛方法，务必绘制“模拟次数 N 对估计值的收敛曲线”，以证明模拟次数已足够大、结果具有稳健的数值收敛性；同时给出 95% 置信区间。',
    steps: [
      { t: '明确随机系统与目标测度', d: String.raw`将待求解的问题转化为某个随机变量的数学期望 $\theta = \mathbb{E}[g(X)]$ 或概率测度 $P(A)$。`,
        f: String.raw`$$\theta = \int_{\Omega} g(x)\,p(x)\,dx = \mathbb{E}[g(X)],\qquad X \sim p(x)$$`,
        n: String.raw`公式解读：任何定积分都可以改写成“函数值 $g(x)$ 乘以概率密度 $p(x)$ 的期望”；例如在区间 $[a,b]$ 上求积分 $\int_a^b f(x)dx$，就等价于在 $[a,b]$ 均匀撒点算平均值再乘以区间宽度 $(b-a)$。` },
      { t: '构造伪随机数发生器与抽样分布', d: String.raw`根据系统变量的概率特性，选择合适的抽样方法：均匀分布采用线性同余/梅森旋转算法，正态分布采用 <b>Box-Muller 变换</b>，任意连续分布可采用逆变换抽样法：`,
        f: String.raw`$$Z_1 = \sqrt{-2\ln U_1}\cos(2\pi U_2),\quad Z_2 = \sqrt{-2\ln U_1}\sin(2\pi U_2),\qquad U_1, U_2 \overset{i.i.d.}{\sim} U(0, 1)$$`,
        n: String.raw`公式解读：计算机原生只能生成 $[0,1]$ 之间的均匀随机数 $U_1, U_2$；Box-Muller 变换利用极坐标变换公式，把两个独立的均匀随机数精准转换成两个独立的标准正态分布随机数 $Z_1, Z_2 \sim N(0,1)$。` },
      { t: '独立重复大规模随机试验', d: String.raw`计算机循环执行 $N$ 次独立模拟（如 $N=10^4 \sim 10^6$），记录每次试验的目标输出值 $Y_i = g(X_i)$。` },
      { t: '统计量计算与大数定律逼近', d: String.raw`计算样本均值作为目标真值 $\theta$ 的无偏估计 $\hat\theta$，并计算样本方差 $S^2$：`,
        f: String.raw`$$\hat\theta = \bar Y = \frac{1}{N}\sum_{i=1}^N Y_i,\qquad S^2 = \frac{1}{N-1}\sum_{i=1}^N (Y_i - \bar Y)^2$$`,
        n: String.raw`公式解读：$\bar Y$ 是 $N$ 次模拟结果的平均值（代表最可能的期望结果），$S^2$ 是 $N$ 次结果的离散波动方差（用于评估模拟误差大小）。` },
      { t: '标准误差与置信区间估计', d: String.raw`由中心极限定理（CLT），估计值的标准误差为 $SE = S/\sqrt{N}$，可给出 $1-\alpha$（如 95%）的渐近置信区间：`,
        f: String.raw`$$\hat\theta \pm z_{\alpha/2}\,\frac{S}{\sqrt{N}},\qquad (\alpha=0.05 \implies z_{0.025} \approx 1.96)$$`,
        n: String.raw`公式解读：模拟误差与 $\sqrt{N}$ 成反比——想让结果精度提高 $10$ 倍（误差缩至 $1/10$），模拟次数 $N$ 需要增加 $100$ 倍。` },
      { t: '风险量化与决策优化', d: String.raw`在金融或决策场景中，通过排序输出求分位数：如 95% 在险价值 $VaR_{95\%}$ 与期望短缺（条件在险价值 $CVaR$），或比选使得期望利润最大的决策方案。`,
        f: String.raw`$$VaR_{\alpha} = \inf \{ l \mid P(L \le l) \ge \alpha \},\qquad CVaR_{\alpha} = \mathbb{E}[L \mid L \ge VaR_{\alpha}]$$`,
        n: String.raw`公式解读：把模拟出的损失 $L$ 从小到大排好序，$VaR_{95\%}$ 就是排在 $95\%$ 位置上的那个“最大可能亏损阈值”；而 $CVaR_{95\%}$ 则是把最惨的那 $5\%$ 极端情况的亏损再求平均，反映极端尾部风险。` },
    ],
    code: String.raw`import numpy as np
import matplotlib.pyplot as plt

# 1. 复杂函数定积分估计：\int_0^2 \sin(x) * exp(-x^2) dx
def mc_integrate(f, a, b, N=50000):
    x = np.random.uniform(a, b, N)
    y = f(x)
    est = (b - a) * np.mean(y)
    se = (b - a) * np.std(y, ddof=1) / np.sqrt(N)
    return est, (est - 1.96 * se, est + 1.96 * se)

est, ci = mc_integrate(lambda x: np.sin(x) * np.exp(-x**2), 0, 2)
print(f'定积分估计值: {est:.6f}, 95% 置信区间: [{ci[0]:.6f}, {ci[1]:.6f}]')

# 2. 几何布朗运动 (GBM) 资产路径模拟与 95% VaR 计算
def mc_gbm(S0=100, mu=0.08, sigma=0.25, T=1.0, steps=252, paths=10000):
    dt = T / steps
    # 模拟路径矩阵 paths × steps
    Z = np.random.standard_normal((paths, steps))
    log_returns = (mu - 0.5 * sigma**2) * dt + sigma * np.sqrt(dt) * Z
    price_paths = S0 * np.exp(np.cumsum(log_returns, axis=1))
    
    terminal_prices = price_paths[:, -1]
    losses = S0 - terminal_prices
    var_95 = np.percentile(losses, 95)
    cvar_95 = losses[losses >= var_95].mean()
    return terminal_prices.mean(), var_95, cvar_95

mean_p, var95, cvar95 = mc_gbm()
print(f'一年后资产期望价格: {mean_p:.2f}, 95% VaR 风险价值: {var95:.2f}, CVaR: {cvar95:.2f}')`,
  },

  /* ====================== 马尔可夫算法 ====================== */
  {
    id: 'markov', cat: 'sim', icon: 'MCK', c: ['#8b5cf6', '#d946ef'],
    name: '马尔可夫算法', short: 'Markov',
    en: 'Markov Chain & Transition Modeling',
    summary: '研究具有“无后效性”随机转移过程的数学模型，通过状态转移概率矩阵分析动态系统的短期演化、中长期概率分布与稳态平衡。',
    tags: ['马氏无后效性', '状态转移矩阵', '平稳分布', '市场份额演化'],
    keyFormula: String.raw`$$\boldsymbol\pi^{(n)} = \boldsymbol\pi^{(0)} \mathbf P^n,\qquad \boldsymbol\pi^* \mathbf P = \boldsymbol\pi^*$$`,
    idea: String.raw`<p>马尔可夫链（Markov Chain）由俄国数学家马尔可夫于 1906 年创立。它的灵魂是著名的<b>无后效性（无记忆性）</b>：<b>在已知“当前”状态的条件下，“未来”的状态仅取决于“现在”，而与“过去”的历史过程无关</b>。</p>
<p>如果系统在若干离散状态之间随机转移，用<b>一步状态转移概率矩阵 $\mathbf P$</b> 描述相邻时刻的转移法则。利用 Chapman-Kolmogorov 关系，系统经过 $n$ 步后的转移概率恰好等于矩阵的 $n$ 次方 $\mathbf P^n$；而长期演化下，大部分不可约非周期链会收敛到一个不随时间改变的<b>极限稳态分布 $\boldsymbol\pi^*$</b>，这为长期市场份额预测与设备寿命可靠性评估提供了强有力的工具。</p>
<div class="key-formula">$$P_{ij} = P(X_{t+1}=j \mid X_t=i),\qquad \sum_{j=1}^k P_{ij} = 1$$</div>
<div class="formula-explain"><b>公式通俗解读：</b>$P_{ij}$ 表示“当前处于状态 $i$（如用品牌A），下一期转移到状态 $j$（如换用品牌B）的条件概率”；因为下一期必定落在 $k$ 个状态之一，所以矩阵每一行的概率加起来必定等于 $1$。</div>`,
    scenes: ['不同品牌/产品之间的客户流失与市场占有率演变预测', '天气状态（晴/阴/雨）或水质等级的序列转换规律分析', '工业设备工作状态（正常/小故障/大故障/报废）与预防性维修周期决策', 'PageRank 网页排名算法的核心底层概率转移模型'],
    pros: ['数学结构精简优美，状态演化与预测只需标准矩阵代数即可高效求解', '既能做短期多步预测，又能解析求解长期的稳态极限平衡', '易于通过样本频数直接估计转移概率'],
    cons: ['严格的“无后效性”假设在部分现实问题中并不完全满足（现实系统常有历史累积效应）', '状态离散划分时若划分过多会造成矩阵稀疏、估计不稳定', '要求状态转移概率在时间上具有齐次性（即转移概率不随时间漂移）'],
    data: String.raw`<p>状态空间 $S=\{s_1, \dots, s_k\}$；$k\times k$ 一步状态转移矩阵 $\mathbf P$（行和恒等于 1，所有元素在 [0, 1]）；初始状态概率分布向量 $\boldsymbol\pi^{(0)}$ 与预测期数 $n$。</p>`,
    tips: '在数模竞赛中，求解平稳分布实际上是求解齐次线性方程组 $\boldsymbol\pi^*( \mathbf P - \mathbf I) = \mathbf 0$ 并在其中替换一行以增加 $\sum \pi_i^* = 1$ 的归一化约束条件，即可唯一解出长期稳态份额。',
    steps: [
      { t: '划分系统状态空间', d: String.raw`根据研究目的划分出互斥且完备的状态集 $S=\{s_1, s_2, \dots, s_k\}$。如市场三品牌份额：$S=\{\text{品牌A}, \text{品牌B}, \text{品牌C}\}$。` },
      { t: '构建一步状态转移概率矩阵', d: String.raw`由历史观测样本统计状态转移频数，计算条件转移概率 $P_{ij} = n_{ij} / \sum_k n_{ik}$，构建转移矩阵 $\mathbf P$，保证非负与行和归一：`,
        f: String.raw`$$\mathbf P = \begin{pmatrix} P_{11} & P_{12} & \cdots & P_{1k} \\ P_{21} & P_{22} & \cdots & P_{2k} \\ \vdots & \vdots & \ddots & \vdots \\ P_{k1} & P_{k2} & \cdots & P_{kk} \end{pmatrix},\qquad \sum_{j=1}^k P_{ij} = 1$$`,
        n: String.raw`公式解读：对角线元素 $P_{ii}$ 代表“保持原状态不变（客户留存）”的概率，非对角线元素 $P_{ij}\ (i\ne j)$ 代表“从状态 $i$ 跳到状态 $j$（客户跨品牌流动）”的概率。` },
      { t: '检验马尔可夫性与时间齐次性', d: '检验系统状态变化是否满足无后效性（卡方独立性检验），验证转移概率矩阵在观测周期内是否相对稳定。' },
      { t: '计算多步转移矩阵与状态演化', d: String.raw`由 Chapman-Kolmogorov 方程，第 $n$ 步状态转移矩阵为 $\mathbf P^{(n)} = \mathbf P^n$。设当前初始分布为 $\boldsymbol\pi^{(0)}$，则未来第 $n$ 期的各状态概率向量为：`,
        f: String.raw`$$\boldsymbol\pi^{(n)} = \boldsymbol\pi^{(0)} \mathbf P^n = \boldsymbol\pi^{(n-1)} \mathbf P$$`,
        n: String.raw`公式解读：每往未来推演一期，只需把当前的状态概率行向量 $\boldsymbol\pi$ 右乘一次转移矩阵 $\mathbf P$；推演 $n$ 期就连乘 $n$ 次 $\mathbf P$。` },
      { t: '求解极限平稳分布', d: String.raw`若马氏链不可约且非周期，则存在与初始状态无关的唯一平稳分布 $\boldsymbol\pi^* = (\pi_1^*, \dots, \pi_k^*)$，满足：`,
        f: String.raw`$$\boldsymbol\pi^* \mathbf P = \boldsymbol\pi^*,\qquad \sum_{i=1}^k \pi_i^* = 1 \iff \begin{cases} (\mathbf P^\top - \mathbf I)\boldsymbol\pi^{*\top} = \mathbf 0 \\ \sum_{i=1}^k \pi_i^* = 1 \end{cases}$$`,
        n: String.raw`公式解读：当演化达到动态平衡时，流入某状态的概率恰好等于流出该状态的概率，即再乘一次 $\mathbf P$ 分布也不再改变（$\boldsymbol\pi^*\mathbf P=\boldsymbol\pi^*$）；联立所有状态概率之和为 $1$ 即可解出终极市场份额 $\boldsymbol\pi^*$。` },
      { t: '状态轨迹模拟与实际决策', d: String.raw`基于转移矩阵与初始状态进行离散路径仿真，分析平均首次到达时间或吸收概率，为经营策略、市场投资提供定量决策支持。` },
    ],
    code: String.raw`import numpy as np

def markov_analysis(P, pi0, steps=5):
    P = np.asarray(P, dtype=float)
    pi0 = np.asarray(pi0, dtype=float)
    k = P.shape[0]
    
    # 1. 演化轨迹计算
    trajectory = [pi0]
    cur_pi = pi0.copy()
    for t in range(steps):
        cur_pi = cur_pi @ P
        trajectory.append(cur_pi)
    
    # 2. 求解极限平稳分布: pi * P = pi <=> (P.T - I) * pi.T = 0, sum(pi) = 1
    A = P.T - np.eye(k)
    A[-1, :] = 1.0       # 替换最后一行归一化条件
    b = np.zeros(k)
    b[-1] = 1.0
    steady_pi = np.linalg.solve(A, b)
    
    return np.array(trajectory), steady_pi

# 示例：3 家公司的市场份额转移矩阵
# [i, j] 表示从公司 i 转向公司 j 的概率
P = [[0.80, 0.15, 0.05],
     [0.10, 0.75, 0.15],
     [0.05, 0.10, 0.85]]
pi0 = [0.40, 0.35, 0.25]  # 当前市场份额

traj, steady = markov_analysis(P, pi0, steps=6)
brands = ['品牌A', '品牌B', '品牌C']
print('各时期市场份额推演:')
for t, p in enumerate(traj):
    print(f'第 {t} 期: ' + ' | '.join(f'{brands[i]}: {p[i]*100:.2f}%' for i in range(3)))

print('\n长期极限平稳市场份额:')
for i, b in enumerate(brands):
    print(f'{b}: {steady[i]*100:.2f}%')`,
  },

  /* ====================== 线性规划与单纯形法 ====================== */
  {
    id: 'lp', cat: 'opt', icon: 'LP', c: ['#2563eb', '#06b6d4'],
    name: '线性规划与单纯形法', short: '线性规划',
    en: 'Linear Programming & Simplex Method',
    summary: '运筹优化的基石：在一组线性等式或不等式约束下，求解线性目标函数的最大值或最小值，并分析资源影子价格与松弛量。',
    tags: ['运筹优化', '国赛B/C核心', '单纯形法'],
    keyFormula: String.raw`$$\max/\min\ z=\mathbf c^\top\mathbf x\quad\text{s.t. }A\mathbf x\le\mathbf b,\ \mathbf x\ge\mathbf 0$$`,
    idea: String.raw`<p>线性规划（Linear Programming, LP）是数学建模竞赛中出镜率最高的优化模型（如 2024 国赛 C 题《农作物种植策略》、2023 国赛 C 题《蔬菜补货与定价》、2025 美赛 C/D 题供应链分配）。</p>
<p>其几何本质是：所有满足线性约束条件的解构成一个高维<b>凸多面体（可行域）</b>。根据线性规划基本定理，若最优解存在，则<b>必然可以在可行域的某个顶点（极点）处取得</b>。<b>单纯形法（Simplex Method）</b>通过引入松弛变量与人工变量，从某一个初始基本可行解出发，沿着凸多面体的棱不断跳向使目标函数更优的相邻顶点，直至所有非基变量的检验数满足最优性判据。</p>
<div class="key-formula">$$\max\ z=\sum_{j=1}^{n}c_j x_j\qquad\text{s.t.}\quad\sum_{j=1}^{n}a_{ij}x_j\le b_i\ (i=1,\dots,m),\quad x_j\ge 0$$</div>
<div class="formula-explain"><b>公式通俗解读：</b>$x_j$ 是我们要决定的方案（如第 $j$ 种产品生产多少件），$c_j$ 是单件利润，$z$ 是总利润；$\text{s.t.}$（subject to，受限于）后面表示生产消耗的第 $i$ 种原材料总量 $\sum a_{ij}x_j$ 不能超过库存上限 $b_i$。</div>`,
    scenes: [
      '生产计划与排产调度：如工厂原材料分配、农作物地块种植规划（2024 国赛 C 题）',
      '物流运输与供应链优化：多产地到多销地的最小成本调运、应急物资分配',
      '投资组合与资产配置：在风险上界与资金约束下追求最大收益（2022 美赛 C 题）',
      '下料切割与配料问题：在满足营养或强度标准的前提下最小化原料采购成本',
    ],
    pros: [
      '凸优化性质保证局部最优解即为全局唯一最优解，不会陷入局部极值',
      '单纯形法与内点法极其成熟，即使上万个决策变量也能在秒级求出精确解',
      '配套的对偶理论、松弛变量（Slack）与影子价格（Shadow Price）具有极佳的经济学可解释性',
    ],
    cons: [
      '要求目标函数和约束条件均为严格线性关系（非线性时需分段线性化或改用 NLP）',
      '当决策变量必须取整数（如人员数量、0-1 选址）时，需升级为分支定界法求解整数规划（MILP）',
      '对输入参数的扰动可能较敏感，竞赛论文中通常需配合灵敏度分析或蒙特卡洛鲁棒检验',
    ],
    data: String.raw`<p>三要素：<b>决策变量</b> $\mathbf x=(x_1,\dots,x_n)^\top$、<b>目标函数系数向量</b> $\mathbf c=(c_1,\dots,c_n)^\top$、<b>约束系数矩阵与右端资源限额</b> $(A, \mathbf b)$。</p>`,
    tips: '竞赛加分技巧：求解出最优方案后，务必在论文中讨论“哪些约束是紧约束（松弛量为 0，资源已耗尽）”以及“若增加 1 单位稀缺资源，目标函数能提升多少（影子价格）”，这能极大提升论文的决策深度。',
    steps: [
      { t: '三要素提炼与数学建模', d: String.raw`明确问题要决定的未知量（决策变量 $x_j$）、优化的目标（最大化利润或最小化成本 $z=\mathbf c^\top\mathbf x$）以及受限的资源或规则条件（约束 $A\mathbf x\le \mathbf b$）。` },
      { t: '化为标准型（引入松弛/剩余/人工变量）', d: String.raw`对于 $\le$ 约束引入非负松弛变量 $s_i\ge 0$；对于 $\ge$ 约束减去剩余变量并引入大 $M$ 人工变量 $a_i$，将不等式组转化为标准等式组：`,
        f: String.raw`$$\max\ z = \mathbf c^\top\mathbf x + \mathbf 0^\top\mathbf s - M\sum a_i\qquad \text{s.t. }\ \tilde A\tilde{\mathbf x}=\mathbf b,\ \tilde{\mathbf x}\ge \mathbf 0$$`,
        n: String.raw`公式解读：松弛变量 $s_i$ 代表“未用完的剩余资源”，帮我们把不等式 $\le b_i$ 变成等式 $= b_i$；大 $M$ 是一个无穷大的惩罚数，挂在人工变量 $a_i$ 前面，逼迫算法在寻优过程中必须把虚构的人工变量挤出基外降为 $0$。` },
      { t: '构建初始单纯形表与基变量', d: String.raw`选取单位阵对应的松弛变量或人工变量作为初始基变量 $\mathbf x_B$，令非基变量 $\mathbf x_N=\mathbf 0$，得到初始基本可行解 $\mathbf x^{(0)}=(\mathbf B^{-1}\mathbf b, \mathbf 0)^\top$。` },
      { t: '最优性检验（计算检验数 $\sigma_j$）', d: String.raw`计算各非基变量的目标检验数（Reduced Cost）$\sigma_j = c_j - \mathbf c_B^\top \mathbf B^{-1}\mathbf P_j$。若最大化问题中所有 $\sigma_j \le 0$，则当前基可行解即为全局最优解；否则选择 $\sigma_k > 0$ 最大的变量 $x_k$ 作为<b>进基变量</b>。`,
        f: String.raw`$$\sigma_j = c_j - z_j = c_j - \mathbf c_B^\top \mathbf B^{-1}\mathbf P_j$$`,
        n: String.raw`公式解读：检验数 $\sigma_j$ 代表“每多生产 $1$ 单位第 $j$ 种产品，直接带来的利润 $c_j$ 减去它挤占其他产品资源所损失的机会成本 $z_j$ 后的净赚差额”；只要 $\sigma_j > 0$，增加该变量就能让总利润继续上涨。` },
      { t: '最小比值准则与旋转消元（Pivot）', d: String.raw`按最小比值法则（Minimum Ratio Test）确定<b>出基变量</b> $x_{B_r}$，保证新解仍非负；随后以主元 $a_{rk}$ 为中心做高斯-约旦消元更新单纯形表，重复迭代直至收敛：`,
        f: String.raw`$$\theta = \min_{i}\left\{\frac{\bar b_i}{\bar a_{ik}}\ \middle|\ \bar a_{ik} > 0\right\} = \frac{\bar b_r}{\bar a_{rk}}$$`,
        n: String.raw`公式解读：$\bar b_i$ 是当前第 $i$ 项剩余可用量，$\bar a_{ik}$ 是新产品每单位消耗量；比值 $\bar b_i/\bar a_{ik}$ 就是“第 $i$ 项资源最多能支撑生产多少单位新产品”，取最小值 $\theta$ 是为了迁就最先耗尽的那项瓶颈资源，防止其他基变量变成负数。` },
      { t: '松弛分析与灵敏度检验', d: String.raw`输出最优决策方案 $\mathbf x^*$ 与最优目标值 $z^*$，核查各约束的松弛量 $s_i^* = b_i - \mathbf a_i^\top\mathbf x^*$：若 $s_i^*=0$ 则为瓶颈紧约束（Binding Constraint），反之则说明该项资源仍有富余。` },
    ],
    code: String.raw`import numpy as np
from scipy.optimize import linprog

# 示例：2024 国赛 C 题风格 —— 农场作物种植与资源分配优化
# 决策变量: x1(作物A种植亩数), x2(作物B种植亩数), x3(作物C种植亩数)
# 目标函数: max Z = 1200*x1 + 1600*x2 + 1000*x3 (元)
# 注意 scipy.optimize.linprog 默认求最小值，故目标系数取负号
c = [-1200, -1600, -1000]

# 不等式约束 A_ub @ x <= b_ub
# 1) 耕地面积约束: x1 + x2 + x3 <= 100 (亩)
# 2) 灌溉用水约束: 3*x1 + 5*x2 + 2*x3 <= 360 (立方米)
# 3) 人工工时约束: 4*x1 + 3*x2 + 5*x3 <= 350 (工时)
A_ub = [
    [1, 1, 1],
    [3, 5, 2],
    [4, 3, 5]
]
b_ub = [100, 360, 350]

# 变量非负边界
bounds = [(0, None), (0, None), (0, None)]

res = linprog(c, A_ub=A_ub, b_ub=b_ub, bounds=bounds, method='highs')

print("求解状态:", res.message)
print(f"最优总收益 Z* = {-res.fun:.2f} 元")
for i, val in enumerate(res.x, 1):
    print(f"  x{i}* = {val:.4f}")
print("各约束资源剩余量 (Slack):", res.slack)`,
  },

  /* ====================== 整数规划与 0-1 规划（线性规划子分类） ====================== */
  {
    id: 'ilp', parent: 'lp', cat: 'opt', icon: 'ILP', c: ['#0284c7', '#2563eb'],
    name: '整数规划 (ILP / 0-1规划)', short: '整数规划',
    en: 'Integer, Binary (0-1) & Mixed-Integer Linear Programming (Branch & Bound)',
    summary: '线性规划的核心分支：要求部分或全部决策变量取整数或 0-1 二元值，通过松弛界与分支定界法（Branch & Bound）精确求解选址、指派与离散排产问题。',
    tags: ['线性规划子类', '分支定界法', '0-1选址/指派', '混合整数MILP'],
    keyFormula: String.raw`$$\max\ z=\mathbf c^\top\mathbf x\quad\text{s.t. }A\mathbf x\le\mathbf b,\ x_j\in\mathbb{Z}_{\ge 0}\ \text{或}\ \{0,1\}$$`,
    idea: String.raw`<p>在许多实际建模问题中，决策变量<b>天然不允许出现小数</b>：例如“派遣多少辆救护车（$x_j\in\mathbb{Z}_{\ge 0}$）”、“是否在某地建立应急物资库（$x_j\in\{0,1\}$）”、“农作物是否在同一地块轮作（2024 国赛 C 题）”。这类在线性规划基础上增加<b>整数约束</b>的模型统称为<b>整数线性规划（ILP / MILP）</b>。</p>
<p>初学者最容易犯的错误是“先当普通线性规划算出小数解，再直接四舍五入”——这样做不仅经常<b>违反约束条件（变成不可行解）</b>，而且往往<b>偏离真正的整数最优解</b>。标准精确解法是<b>分支定界法（Branch and Bound）</b>：先去掉整数限制求<b>线性规划松弛解（LP Relaxation）</b>作为目标函数的理论上界；若某个变量 $x_k=3.6$ 不是整数，则把可行域一分为二（<b>分支</b>：$x_k\le 3$ 与 $x_k\ge 4$），在搜索树中利用已知整数解不断<b>定界剪枝（Pruning）</b>，快速锁定全局最优整点。</p>
<div class="key-formula">$$\text{分支操作: } x_k = v \notin \mathbb{Z} \implies \text{左支 } x_k \le \lfloor v \rfloor \;\cup\; \text{右支 } x_k \ge \lceil v \rceil$$</div>
<div class="formula-explain"><b>💡 公式直白解读：</b>符号 $\lfloor v \rfloor$ 是向下取整（如 $\lfloor 3.6 \rfloor = 3$），$\lceil v \rceil$ 是向上取整（如 $\lceil 3.6 \rceil = 4$）。既然整数解不可能落在 $(3, 4)$ 开区间内，把问题拆成 $x_k \le 3$ 和 $x_k \ge 4$ 两个子问题，就既剔除了小数 $3.6$，又保证<b>绝不会漏掉任何一个真正的整数可行解</b>。</div>`,
    scenes: [
      '0-1 选址与设施覆盖：应急物流中心选址、充电桩/基站布设（建=1，不建=0）',
      '指派与匹配问题：n 个人分配 n 项任务、机床加工排程、赛程编排（匈牙利算法/0-1规划）',
      '固定成本与逻辑约束建模：引入大 M 与 0-1 变量刻画“若开机生产则需支付固定启动费”（2024 国赛 C 题地块种植下限约束）',
      '离散物资装载与下料问题：集装箱装载件数、成套设备采购台数、投资项目组合选择（0-1 背包）',
    ],
    pros: [
      '严格满足现实中“人数、车辆数、是否选中”不可分割的离散物理约束',
      '引入 0-1 逻辑变量后表达能力极强，可刻画“互斥、先后依赖、固定启动成本、分段阶梯价”等复杂业务规则',
      '分支定界法与割平面法（Branch & Cut）可提供全局最优性证明及最优间隙（MIP Gap）',
    ],
    cons: [
      '理论复杂度属于 NP-Hard，当整数变量规模达数万且结构松散时求解时间可能呈指数增长',
      '不具备连续线性规划那样平滑的对偶影子价格，灵敏度分析需通过参数重求解完成',
    ],
    data: String.raw`<p>在普通线性规划三要素 $(A, \mathbf b, \mathbf c)$ 的基础上，额外指定每个变量的离散类型：<b>纯整数规划 (IP)</b> 全部 $x_j\in\mathbb{Z}_{\ge 0}$；<b>0-1 规划 (BIP)</b> 全部 $x_j\in\{0,1\}$；<b>混合整数规划 (MILP)</b> 部分变量为整数、其余为连续实数。</p>`,
    tips: '竞赛高分建模技巧：在论文中写出 0-1 逻辑约束是拉开差距的关键！例如：① 互斥约束（A、B 最多选一个）：$x_1 + x_2 \le 1$；② 依赖约束（若选 B 则必选 A）：$x_2 \le x_1$；③ 固定费用/最小规模约束（若种植则至少种 $L$ 亩，上限 $U$ 亩）：$L\cdot y_j \le x_j \le U\cdot y_j\ (y_j\in\{0,1\})$。',
    steps: [
      { t: '区分变量类型与建立整数规划模型', d: String.raw`根据题意明确哪些变量必须取非负整数（$\mathbb{Z}_{\ge 0}$）、哪些是“选或不选”的 0-1 决策变量（$\{0,1\}$）、哪些可以取连续实数（$\mathbb{R}_{\ge 0}$），写出标准混合整数线性规划（MILP）：`,
        f: String.raw`$$\max\ z = \mathbf c^\top\mathbf x + \mathbf d^\top\mathbf y \qquad \text{s.t. }\ A\mathbf x + G\mathbf y \le \mathbf b,\quad \mathbf x \in \mathbb{Z}_{\ge 0}^{n_1},\ \mathbf y \in \mathbb{R}_{\ge 0}^{n_2}$$`,
        n: String.raw`公式解读：把必须取整数的决策量归为向量 $\mathbf x$（共 $n_1$ 个），把允许取小数的连续决策量归为向量 $\mathbf y$（共 $n_2$ 个）；当 $n_2=0$ 时就是纯整数规划，当 $\mathbf x\in\{0,1\}^{n_1}$ 时就是 0-1 规划。` },
      { t: '逻辑条件与固定成本的 0-1 线性化表达', d: String.raw`利用 0-1 二元变量 $y_j\in\{0,1\}$ 与上界常数 $M$（大 $M$ 法），将复杂的“如果…就…”业务规则转化为等价的线性不等式约束：`,
        f: String.raw`$$\text{① 互斥: } y_1+y_2\le 1 \qquad \text{② 依赖: } y_2\le y_1 \qquad \text{③ 半连续上下界: } L_j y_j \le x_j \le U_j y_j$$`,
        n: String.raw`公式解读：重点看式③（2024国赛C题核心技巧）——当 $y_j=0$（不种该作物）时，不等式变为 $0 \le x_j \le 0$，强制面积 $x_j=0$；当 $y_j=1$（决定种植）时，不等式变为 $L_j \le x_j \le U_j$，强制种植面积不低于最小经济规模 $L_j$。` },
      { t: '求解线性规划松弛问题 (LP Relaxation)', d: String.raw`暂时抹去所有“必须为整数”的限制，用单纯形法求解对应的连续线性规划松弛问题 $(P_0)$。松弛解 $\mathbf x^{\text{LP}}$ 的目标值 $z^{\text{LP}}$ 构成了整数规划全局最优值 $z^*$ 的<b>理论上界</b>（最大化问题）：`,
        f: String.raw`$$z^* \le z^{\text{LP}} = \max\left\{\mathbf c^\top\mathbf x \;\middle|\; A\mathbf x \le \mathbf b,\ \mathbf x \ge \mathbf 0\right\}$$`,
        n: String.raw`公式解读：因为整数可行解集是连续可行域的子集（在“整点”里挑肯定比在“所有实数点”里挑受限更多），所以整数最优收益 $z^*$ 绝不可能超过连续松弛最优收益 $z^{\text{LP}}$。若 $\mathbf x^{\text{LP}}$ 恰好全是整数，那它直接就是全局最优整数解！` },
      { t: '分支（Branching）：切割小数解区间', d: String.raw`若松弛最优解中某个整数变量 $x_k = v$ 为小数（如 $3.6$），则以 $\lfloor v \rfloor$ 和 $\lceil v \rceil$ 为界将当前节点裂变为两个互斥的子问题 $P_1, P_2$ 加入搜索树：`,
        f: String.raw`$$P_1:\ \text{原约束} \cup \{x_k \le \lfloor v \rfloor\},\qquad P_2:\ \text{原约束} \cup \{x_k \ge \lceil v \rceil\}$$`,
        n: String.raw`公式解读：开区间 $(\lfloor v \rfloor, \lceil v \rceil)$ 之间没有任何整数，把它挖掉后分成左右两半求解，既排除了当前小数解 $v$，又完整保留了所有合法的整数点。` },
      { t: '定界与剪枝（Bounding & Pruning）', d: String.raw`维护当前已找到的最好整数可行解目标值 $\underline{z}$（下界/Incumbent）。对搜索树中的任一子问题节点 $i$，求解其 LP 松弛得上界 $z_i^{\text{LP}}$，若满足以下三条准则之一则直接<b>剪枝（不再继续向下分支）</b>：`,
        f: String.raw`$$\text{剪枝条件: }\begin{cases} \text{① 不可行剪枝: } P_i \text{ 的 LP 松弛无可行解} \\ \text{② 定界剪枝: } z_i^{\text{LP}} \le \underline{z} \ (\text{即使继续分支也不可能超越当前最优整数解}) \\ \text{③ 整点剪枝: } \mathbf x_i^{\text{LP}} \in \mathbb{Z}^n \ (\text{已得整数解，若 } z_i^{\text{LP}} > \underline{z} \text{ 则更新 } \underline{z} \gets z_i^{\text{LP}}) \end{cases}$$`,
        n: String.raw`公式解读：为什么分支定界比暴力枚举快得多？全靠“② 定界剪枝”——一旦发现某个分支连它的“连续松弛理论上限 $z_i^{\text{LP}}$”都比不上手里已有的整数解 $\underline{z}$，整棵子树成千上万个组合直接一刀砍掉，无需再算！` },
      { t: '整点间隙（Integrality Gap）与方案输出', d: String.raw`当搜索树所有活跃节点均被剪枝完毕，当前最优整数解 $\mathbf x^*$ 即为全局最优解。计算松弛上界与整数最优解之间的相对整点间隙（Gap）：`,
        f: String.raw`$$\text{Integrality Gap} = \frac{|z^{\text{LP}} - z^*|}{|z^*|} \times 100\%$$`,
        n: String.raw`公式解读：该指标衡量“因为要求变量必须取整数，相比连续理想状态牺牲了百分之多少的目标收益”，在论文中汇报此指标能显著体现运筹学专业深度。` },
    ],
    code: String.raw`import numpy as np
from scipy.optimize import milp, LinearConstraint, Bounds

# 示例 1：纯整数规划 (IP) —— 集装箱/重型设备排产问题
# max Z = 40*x1 + 90*x2
# s.t. 9*x1 + 7*x2 <= 56
#      7*x1 + 20*x2 <= 70
#      x1, x2 >= 0 且为整数
c = np.array([-40, -90])  # scipy.optimize.milp 默认求最小，最大化取负号
integrality = np.array([1, 1])  # 1 表示整数变量 (Integer)，0 表示连续变量

A = np.array([
    [9,  7],
    [7, 20]
])
constraints = LinearConstraint(A, -np.inf, [56, 70])
bounds = Bounds([0, 0], [np.inf, np.inf])

res = milp(c=c, integrality=integrality, bounds=bounds, constraints=constraints)
print("=== 纯整数规划求解结果 ===")
print(f"最优整数目标值 Z* = {-res.fun:.0f}")
print(f"最优整数方案: x1* = {res.x[0]:.0f}, x2* = {res.x[1]:.0f}")

# 示例 2：0-1 整数规划 (BIP) —— 5 个候选应急物资中心选址/项目投资
# max Z = 25*x1 + 32*x2 + 18*x3 + 28*x4 + 22*x5
# s.t. 资金约束: 12*x1 + 18*x2 + 9*x3 + 15*x4 + 11*x5 <= 40
#      人力约束: 5*x1  + 7*x2  + 4*x3 + 6*x4  + 5*x5  <= 18
#      x_j in {0, 1}
c_bin = np.array([-25, -32, -18, -28, -22])
A_bin = np.array([
    [12, 18, 9, 15, 11],
    [5,  7,  4, 6,  5]
])
res_bin = milp(
    c=c_bin,
    integrality=np.ones(5),
    bounds=Bounds(np.zeros(5), np.ones(5)),  # 上下界 [0, 1] 即为 0-1 变量
    constraints=LinearConstraint(A_bin, -np.inf, [40, 18])
)
print("\n=== 0-1 选址/投资规划结果 ===")
print(f"最大总效益 Z* = {-res_bin.fun:.0f}, 选中方案编码: {res_bin.x.astype(int)}")`,
  },

  /* ====================== 模拟退火与启发式智能优化 ====================== */
  {
    id: 'sa_pso', cat: 'opt', icon: 'SA', c: ['#7c3aed', '#ec4899'],
    name: '模拟退火智能优化', short: '模拟退火 SA',
    en: 'Simulated Annealing & Heuristic Optimization',
    summary: '受固体退火物理过程启发的元启发式全局优化算法：以 Metropolis 准则概率性接受劣解，有效跳出局部最优陷阱，攻克 NP-Hard 组合与非线性寻优。',
    tags: ['元启发式优化', 'TSP路径规划', '跳出局部最优'],
    keyFormula: String.raw`$$P(\Delta E)=\begin{cases}1,&\Delta E<0\\\exp(-\Delta E/T),&\Delta E\ge 0\end{cases}$$`,
    idea: String.raw`<p>在国赛 A/B 题与美赛 B/D 题中（如 2024 国赛 A 题《板凳龙螺线调头寻优》、2023 国赛 A 题《定日镜场布局优化》、无人机巡检路径规划 TSP），目标函数往往高度非线性、不可导甚至由黑箱仿真给出，传统梯度法或线性规划无法直接求解。</p>
<p><b>模拟退火算法（Simulated Annealing, SA）</b>模拟金属高温加热后缓慢冷却结晶的热力学过程：在高温 $T$ 阶段，算法不仅接受更优的新状态（$\Delta E < 0$），还会按 <b>Metropolis 玻尔兹曼概率</b> $\exp(-\Delta E / T)$ 接受比当前更差的解，从而具备强大的“爬坡跳出局部极小值”能力；随着温度按 $T_{k+1}=\alpha T_k$ 缓慢降低，搜索逐渐收敛并锁定全局最优解。</p>
<div class="key-formula">$$P(\text{Accept}) = \exp\left(-\frac{f(X_{\text{new}})-f(X_{\text{cur}})}{T}\right),\qquad T_{k+1} = \alpha T_k\ (\alpha\in[0.90, 0.99])$$</div>
<div class="formula-explain"><b>公式通俗解读：</b>$\Delta E = f(X_{\text{new}})-f(X_{\text{cur}})$ 是新方案比旧方案多出的成本（变差了多少）；温度 $T$ 越高，或者变差的幅度 $\Delta E$ 越小，$\exp(-\Delta E/T)$ 就越接近 $1$，算法越敢“暂时走一步臭棋”从而翻越局部小山丘去寻找真正的全局最低谷。</div>`,
    scenes: [
      '组合优化与路径规划：旅行商问题（TSP）、车辆路径问题（VRP）、无人机救灾巡检路线设计',
      '工程排布与参数反演：定日镜场坐标排布（2023 国赛 A 题）、芯片资源排布、风电场功率分配',
      '生产车间调度：流水线作业排序（Job-Shop）、涂装-总装缓存区调序调度',
      '复杂多峰非线性函数全局极值寻优与黑箱模型参数率定',
    ],
    pros: [
      '不依赖目标函数的导数或解析形式，对离散组合空间与连续非凸空间均适用',
      '通过 Metropolis 概率接受机制有效克服贪心局部搜索“早熟收敛”的缺陷',
      '算法结构简洁，结合 2-opt 等邻域算子可在毫秒级求出高质量近似全局最优解',
    ],
    cons: [
      '属于随机启发式算法，单次运行存在随机波动，竞赛中通常多次独立运行取最优',
      '降温速率 α、初始温度 T0 与内循环马尔可夫链长度 L 需要合理调参平衡精度与耗时',
    ],
    data: String.raw`<p>组合路径优化（TSP）：$n$ 个节点的二维坐标 $(x_i, y_i)$ 或距离矩阵 $D_{n\times n}$；控制参数：初始温度 $T_0$、降温系数 $\alpha$、终止温度 $T_{\min}$ 与单温迭代次数 $L$。</p>`,
    tips: '在论文中展示启发式算法时，切忌只给一个最终数字！一定要画出两张核心图：① 最优目标函数值随迭代降温的【收敛曲线图】（展示初期跳出局部最优的波动与后期平稳收敛）；② 初始方案与最优方案的【空间路径对比图】。',
    steps: [
      { t: '解空间编码与初始解生成', d: String.raw`将实际问题映射为编码序列（如 TSP 问题用城市访问排列 $\pi=(\pi_1,\pi_2,\dots,\pi_n)$ 表示），计算初始目标函数（适应度/能量）$E(\pi^{(0)})$，设定初始高温 $T=T_0$。` },
      { t: '构造邻域扰动产生新解', d: String.raw`在当前解 $\pi$ 的邻域内施加随机扰动生成候选解 $\pi'$。对于路径问题，最常用且高效的邻域算子是 <b>2-opt 区间翻转</b>（随机选取两个位置 $i<j$，将子序列 $\pi_i\dots\pi_j$ 逆序翻转以消除交叉路径）。` },
      { t: '计算能量差与 Metropolis 接受判据', d: String.raw`计算新旧解的目标函数增量 $\Delta E = E(\pi') - E(\pi)$。若 $\Delta E < 0$ 则无条件接受新解；若 $\Delta E \ge 0$，则生成均匀随机数 $r\sim U(0,1)$，当 $r < \exp(-\Delta E/T)$ 时概率接受该劣解：`,
        f: String.raw`$$P(\pi \to \pi') = \begin{cases} 1, & \Delta E < 0 \\ \exp\left(-\dfrac{\Delta E}{T}\right), & \Delta E \ge 0 \end{cases}$$`,
        n: String.raw`公式解读：当 $\Delta E < 0$（新路径更短）时 $100\%$ 采纳；当 $\Delta E \ge 0$（新路径变长）时，掷一个 $[0,1]$ 随机数与玻尔兹曼概率 $\exp(-\Delta E/T)$ 比大小——前期高温 $T$ 大，容易容忍劣解实现全局探索；后期低温 $T\to 0$，概率趋近 $0$，转为纯粹的精细爬山。` },
      { t: '等温马尔可夫链平衡抽样', d: String.raw`在当前温度 $T_k$ 下重复执行步 2~3 共 $L$ 次（即 Markov 链长度），使系统在该温度下达到热力学准平衡态，并实时更新历史全局最优解 $\pi_{\text{best}}$。` },
      { t: '指数退火降温与终止检验', d: String.raw`按指数退火计划更新温度 $T_{k+1} = \alpha T_k$（通常取 $\alpha \in [0.92, 0.99]$）。若 $T_{k+1} < T_{\min}$ 则停止退火并输出全局最优方案 $\pi_{\text{best}}$，否则返回步 2 继续迭代。`,
        f: String.raw`$$T_{k} = T_0 \cdot \alpha^k,\qquad \lim_{k\to\infty} T_k = 0$$`,
        n: String.raw`公式解读：每完成一轮内循环，温度就乘以衰减系数 $\alpha$（如 $0.96$），呈几何级数平缓降温，模拟金属缓慢冷却结晶的过程。` },
    ],
    code: String.raw`import numpy as np

def simulated_annealing_tsp(coords, T0=1000.0, alpha=0.96, Tmin=1e-2, L=150, seed=42):
    """模拟退火 + 2-opt 求解 TSP 路径优化"""
    rng = np.random.default_rng(seed)
    coords = np.asarray(coords, dtype=float)
    n = len(coords)
    # 距离矩阵
    dist_mat = np.linalg.norm(coords[:, None, :] - coords[None, :, :], axis=-1)

    def tour_length(tour):
        return sum(dist_mat[tour[i], tour[(i + 1) % n]] for i in range(n))

    cur_tour = np.arange(n)
    cur_cost = tour_length(cur_tour)
    best_tour, best_cost = cur_tour.copy(), cur_cost
    T = T0
    history = [best_cost]

    while T > Tmin:
        for _ in range(L):
            i, j = sorted(rng.choice(range(1, n), size=2, replace=False))
            new_tour = cur_tour.copy()
            new_tour[i:j+1] = new_tour[i:j+1][::-1]  # 2-opt 翻转
            new_cost = tour_length(new_tour)
            dE = new_cost - cur_cost
            if dE < 0 or rng.random() < np.exp(-dE / T):
                cur_tour, cur_cost = new_tour, new_cost
                if cur_cost < best_cost:
                    best_tour, best_cost = cur_tour.copy(), cur_cost
        T *= alpha
        history.append(best_cost)

    return best_tour, best_cost, history

# 示例：10 个巡检站点二维坐标
pts = [[10, 20], [85, 25], [25, 80], [70, 85], [50, 50],
       [15, 55], [90, 65], [40, 15], [60, 30], [35, 70]]
tour, cost, hist = simulated_annealing_tsp(pts)
print("最优巡检顺序:", " -> ".join(map(str, np.append(tour, tour[0]))))
print(f"最短闭合总里程: {cost:.4f} (初始顺序里程: {hist[0]:.4f})")`,
  },

  /* ====================== 主成分分析 PCA ====================== */
  {
    id: 'pca', cat: 'ml', icon: 'PC', c: ['#0d9488', '#3b82f6'],
    name: '主成分分析 (PCA)', short: '主成分分析',
    en: 'Principal Component Analysis',
    summary: '正交线性变换降维与客观综合评价利器：将多个存在共线性的相关指标浓缩为少数几个相互独立的综合主成分，最大程度保留原始数据方差信息。',
    tags: ['特征降维', '消除共线性', '综合得分'],
    keyFormula: String.raw`$$\mathbf R\mathbf e_k=\lambda_k\mathbf e_k,\quad \eta_k=\frac{\lambda_k}{\sum_{j=1}^m\lambda_j}$$`,
    idea: String.raw`<p>在实际赛题中（如 2021 美赛 C/E 题可持续发展评估、2022 国赛 B 题文物成分分析、2025 美赛 C 题特征工程），往往收集到十几个甚至几十个指标，指标之间存在强烈的<b>多重共线性（信息重叠）</b>。</p>
<p><b>主成分分析（PCA）</b>利用矩阵特征值分解，在几何上将原始坐标轴做<b>正交旋转</b>：第一主成分 $F_1$ 沿着数据散布方差最大的方向，第二主成分 $F_2$ 与 $F_1$ 正交且沿着剩余方差最大的方向。通常只需选取前 $k$ 个（特征值 $\lambda > 1$ 或累计方差贡献率 $\ge 85\%$）主成分，即可在不损失主要信息的前提下实现<b>高维可视化、消除共线性与客观综合排名</b>。</p>
<div class="key-formula">$$F_k = e_{1k}Z_1 + e_{2k}Z_2 + \cdots + e_{mk}Z_m,\qquad \text{Cov}(F_i, F_j)=0\ (i\ne j)$$</div>
<div class="formula-explain"><b>公式通俗解读：</b>$Z_1\dots Z_m$ 是标准化后的原始指标，$F_k$ 是拼出来的新“综合主成分”（组合系数 $e_{jk}$ 来自相关矩阵的特征向量）。奇妙之处在于：不同主成分之间完全正交独立（协方差 $\text{Cov}(F_i,F_j)=0$），信息零重叠，且每个主成分携带的信息量恰好等于对应的特征值 $\lambda_k$。</div>`,
    scenes: [
      '高维数据特征降维与可视化：将多维指标投影到 PC1-PC2 二维平面进行散点分群展示',
      '消除回归分析中的多重共线性：先提取主成分再建立主成分回归（PCR）或聚类分析',
      '多指标客观综合评价：以各主成分的方差贡献率 η_k 为权重计算综合发展指数（如城市竞争力、双碳指标评估）',
      '图像压缩、光谱/基因高维信号去噪与核心驱动因子识别',
    ],
    pros: [
      '各主成分之间严格正交（相关系数为 0），彻底消除指标间的信息重叠与共线性',
      '权重完全由数据方差结构（特征值占比）内生决定，客观无主观偏见',
      '因子载荷矩阵可清晰揭示每个主成分背后代表的实际物理或经济含义',
    ],
    cons: [
      '主成分是原始指标的线性组合，有时当正负载荷混杂时经济解释不如原始指标直观',
      '基于皮尔逊线性相关矩阵，对非线性流形结构的降维能力有限',
      '对极端异常值较敏感，建模前建议先做异常值清洗与 Z-score 标准化',
    ],
    data: String.raw`<p>$n\times m$ 样本指标矩阵 $X$（$n$ 个样本对象、$m$ 个连续数值型指标，要求 $n > m$）。</p>`,
    tips: '竞赛写作黄金法则：跑完 PCA 后，必须根据【因子载荷矩阵（Loadings）】为前几个主成分命名！例如 PC1 在 GDP、财政收入上载荷极高，即可命名为“经济规模因子”；PC2 在绿化率、PM2.5 改善上载荷高，命名为“生态宜居因子”，评委极度青睐这种有实际解释的降维。',
    steps: [
      { t: '原始数据 Z-Score 标准化', d: String.raw`消除不同指标量纲与数量级的差异，将每列指标转化为均值为 0、标准差为 1 的标准正态变量：`,
        f: String.raw`$$z_{ij} = \frac{x_{ij} - \bar x_j}{s_j},\qquad \bar x_j = \frac{1}{n}\sum_{i=1}^n x_{ij},\quad s_j = \sqrt{\frac{1}{n-1}\sum_{i=1}^n(x_{ij}-\bar x_j)^2}$$`,
        n: String.raw`公式解读：每个数据减去该列均值 $\bar x_j$ 再除以样本标准差 $s_j$，把所有不同单位的指标统一拉平到“均值为 $0$、方差为 $1$”的同一起跑线上。` },
      { t: '计算相关系数矩阵 R', d: String.raw`计算标准化矩阵 $\mathbf Z$ 的样本相关系数矩阵 $\mathbf R_{m\times m}$（实对称半正定矩阵）：`,
        f: String.raw`$$\mathbf R = \frac{1}{n-1}\mathbf Z^\top \mathbf Z = (r_{jk})_{m\times m}$$`,
        n: String.raw`公式解读：因为 $\mathbf Z$ 已经标准化，直接用 $\mathbf Z^\top\mathbf Z/(n-1)$ 算出的就是各指标两两之间的皮尔逊相关系数矩阵，对角线全为 $1$。` },
      { t: '求解特征值与单位正交特征向量', d: String.raw`解特征方程 $|\mathbf R - \lambda\mathbf I| = 0$，将特征值从大到小排列 $\lambda_1 \ge \lambda_2 \ge \cdots \ge \lambda_m \ge 0$，并求出对应的单位正交特征向量 $\mathbf e_1, \mathbf e_2, \dots, \mathbf e_m$。` },
      { t: '计算方差贡献率与确定主成分个数 k', d: String.raw`计算第 $r$ 个主成分的方差贡献率 $\eta_r$ 与累计方差贡献率 $G(k)$。通常按 Kaiser 准则（$\lambda_r \ge 1$）或累计贡献率 $G(k) \ge 85\%$ 确定保留的主成分个数 $k$：`,
        f: String.raw`$$\eta_r = \frac{\lambda_r}{\sum_{j=1}^m \lambda_j},\qquad G(k) = \frac{\sum_{r=1}^k \lambda_r}{\sum_{j=1}^m \lambda_j} \ge 85\%$$`,
        n: String.raw`公式解读：所有特征值之和 $\sum\lambda_j$ 等于原始指标总数 $m$（即总方差信息量）；$\eta_r$ 表示第 $r$ 个主成分能解释百分之多少的原始信息，前 $k$ 个加起来超过 $85\%$ 就足以代表整体。` },
      { t: '计算因子载荷与主成分综合得分', d: String.raw`计算因子载荷 $l_{jr} = \sqrt{\lambda_r}e_{jr}$ 解释主成分含义；计算各样本在各主成分上的得分 $F_{ir}$，并以方差贡献率为权重合成综合评价得分：`,
        f: String.raw`$$F_{ir} = \sum_{j=1}^m e_{jr} z_{ij},\qquad S_i = \sum_{r=1}^k \frac{\eta_r}{G(k)} F_{ir}$$`,
        n: String.raw`公式解读：$F_{ir}$ 是第 $i$ 个样本在第 $r$ 主成分轴上的投影坐标；再把各主成分得分按其信息贡献率占比 $\eta_r/G(k)$ 加权汇总，就得到了客观的综合总分 $S_i$。` },
    ],
    code: String.raw`import numpy as np

def pca_analysis(X, threshold=0.85):
    X = np.asarray(X, dtype=float)
    # 1. Z-score 标准化
    Z = (X - X.mean(axis=0)) / X.std(axis=0, ddof=1)
    # 2. 相关系数矩阵
    R = np.corrcoef(Z, rowvar=False)
    # 3. 特征值与特征向量分解
    eig_vals, eig_vecs = np.linalg.eigh(R)
    idx = np.argsort(eig_vals)[::-1]
    eig_vals, eig_vecs = eig_vals[idx], eig_vecs[:, idx]
    # 调整符号使每列特征向量和为正
    eig_vecs *= np.where(eig_vecs.sum(axis=0) < 0, -1, 1)

    var_ratio = eig_vals / eig_vals.sum()
    cum_ratio = np.cumsum(var_ratio)
    k = int(np.searchsorted(cum_ratio, threshold) + 1)

    # 4. 载荷矩阵与主成分得分
    loadings = eig_vecs * np.sqrt(eig_vals)
    pc_scores = Z @ eig_vecs[:, :k]
    weights = var_ratio[:k] / var_ratio[:k].sum()
    comp_score = pc_scores @ weights
    return eig_vals, var_ratio, cum_ratio, loadings, pc_scores, comp_score

# 示例：8 个地区的 5 项经济社会发展指标
X = [
    [850, 92.5, 420, 18.2, 88],
    [620, 85.0, 310, 14.5, 79],
    [980, 96.2, 510, 22.4, 94],
    [430, 76.8, 195, 10.1, 71],
    [760, 89.4, 380, 16.8, 85],
    [510, 81.2, 240, 12.0, 75],
    [910, 94.1, 465, 20.5, 91],
    [390, 74.0, 170,  9.2, 68],
]
vals, ratio, cum, load, pcs, score = pca_analysis(X)
print("特征值:", np.round(vals, 4))
print("累计方差贡献率:", np.round(cum * 100, 2), "%")
print("综合主成分得分:", np.round(score, 4))`,
  },

  /* ====================== K-Means 聚类与轮廓系数 ====================== */
  {
    id: 'kmeans', cat: 'ml', icon: 'KM', c: ['#f59e0b', '#ef4444'],
    name: 'K-Means 聚类与轮廓评估', short: 'K-Means 聚类',
    en: 'K-Means++ Clustering & Silhouette Analysis',
    summary: '无监督分群的标杆算法：基于欧氏距离迭代划分样本簇，结合肘部法则（Elbow Method）与轮廓系数（Silhouette Score）科学论证最佳分类数 K。',
    tags: ['无监督分群', '肘部法则', '轮廓系数'],
    keyFormula: String.raw`$$\min\ \text{SSE}=\sum_{k=1}^{K}\sum_{\mathbf x_i\in C_k}\|\mathbf x_i-\boldsymbol\mu_k\|^2,\quad s(i)=\frac{b(i)-a(i)}{\max\{a(i),b(i)\}}$$`,
    idea: String.raw`<p>在国赛与美赛数据分析题中（如 2022 国赛 B 题《高钾与铅钡玻璃亚类划分》、2023 国赛 C 题《蔬菜单品聚类》、2023 美赛 C 题《Wordle 单词难度分级》、2024 美赛 C 题《网球选手风格分群》），经常需要将没有先验标签的样本自动划分为若干同质群组。</p>
<p><b>K-Means++ 算法</b>通过最大化初始质心间距克服传统随机初始化的不稳定性，随后交替执行“<b>按最近邻分配簇标签</b>”与“<b>重算簇质心均值</b>”直至簇内误差平方和（SSE）收敛。同时，为了在论文中有理有据地回答“<b>为什么选 K=3 而不是 K=4？</b>”，必须联合使用<b>肘部法则（SSE 拐点）</b>与<b>轮廓系数（Silhouette Coefficient $s\in[-1,1]$）</b>进行定量验证。</p>
<div class="key-formula">$$s(i) = \frac{b(i) - a(i)}{\max\{a(i),\, b(i)\}} \in [-1, 1],\qquad \bar S = \frac{1}{n}\sum_{i=1}^{n} s(i)$$</div>
<div class="formula-explain"><b>公式通俗解读：</b>$a(i)$ 是样本 $i$ 到“自己所在群内部”其他样本的平均距离（越小代表内部越抱团），$b(i)$ 是样本 $i$ 到“隔壁最近另一个群”的平均距离（越大代表群与群之间界限越分明）；当 $b(i) \gg a(i)$ 时，轮廓系数 $s(i)$ 趋近于 $1$，说明分群效果极佳。</div>`,
    scenes: [
      '客户/城市/选手画像分群：根据多维表现指标将研究对象划分为“高潜型、稳健型、薄弱型”等典型类别',
      '文物/材料/基因亚类鉴别：如高钾玻璃与铅钡玻璃的化学成分亚类划分（2022 国赛 B 题）',
      '空间选址与设施覆盖：通过聚类质心确定物流配送中心、充电桩或基站的最优服务几何中心',
      '时间序列或工况模式识别：将不同时间段或运行状态聚类为离散状态（常作为马尔可夫链的前置步骤）',
    ],
    pros: [
      '原理直观、收敛极快（通常 5~20 次迭代即可完全收敛），适合大中小各类样本规模',
      '各簇的聚类中心（Centroid）可直接还原到原始指标量纲，便于总结每个群体的典型画像特征',
      '配套轮廓系数与肘部法则可形成完整的“确定 K 值 → 聚类划分 → 有效性检验”论文闭环',
    ],
    cons: [
      '需要预先指定簇数 K（需借助肘部法则和轮廓系数辅助确定）',
      '基于球形欧氏距离假设，对非凸形状（如环形、月牙形）或密度差异极大的簇识别效果受限',
      '对量纲与异常值敏感，聚类前一般需先做 Z-Score 标准化处理',
    ],
    data: String.raw`<p>$n\times m$ 数值型特征矩阵 $X$（$n$ 个样本对象、$m$ 个特征维度）及预设聚类簇数 $K\ (2 \le K < n)$。</p>`,
    tips: '来自 MathModelHub O 奖手册的高分秘诀：评委最讨厌“拍脑袋令 K=3”。在论文中放一张【K=2~6 的 SSE 肘部折线 + 平均轮廓系数双指标对比图】，再用一句话说明：“当 K=3 时 SSE 下降速率明显放缓出现拐点，且轮廓系数达到峰值，故确定最优聚类数为 3”，说服力直接拉满！',
    steps: [
      { t: '特征标准化与距离度量定义', d: String.raw`为防止数值量级大的指标主导欧氏距离，先对原始特征矩阵做 Z-Score 标准化得到 $\mathbf Z$，采用欧氏距离 $d(\mathbf z_i, \mathbf z_j) = \|\mathbf z_i - \mathbf z_j\|_2$ 度量样本间相似度。` },
      { t: 'K-Means++ 启发式初始化质心', d: String.raw`随机选取第 1 个质心 $\boldsymbol\mu_1$；随后计算每个样本到已选最近质心的距离平方 $D(\mathbf z_i)^2$，按正比于 $D(\mathbf z_i)^2$ 的轮盘赌概率依次选出其余 $K-1$ 个初始质心，使初始中心尽可能分散。` },
      { t: '最近邻簇分配与质心更新迭代', d: String.raw`交替执行以下两步直至簇划分不再变化：① 将每个样本分配给距离最近的质心所属簇 $C_k$；② 将每个簇的质心更新为簇内所有样本的均值向量：`,
        f: String.raw`$$c^{(t)}_i = \arg\min_{k\in\{1,\dots,K\}} \|\mathbf z_i - \boldsymbol\mu_k^{(t)}\|_2^2,\qquad \boldsymbol\mu_k^{(t+1)} = \frac{1}{|C_k|}\sum_{\mathbf z_i\in C_k} \mathbf z_i$$`,
        n: String.raw`公式解读：左式 $\arg\min$ 表示“哪个簇中心 $\boldsymbol\mu_k$ 离样本 $\mathbf z_i$ 最近，就把样本归入哪一类”；右式表示“把归入第 $k$ 类的所有样本坐标求算术平均，作为下一轮新的簇中心（重心）”。` },
      { t: '肘部法则（Elbow Method）分析', d: String.raw`遍历不同的 $K=2,3,\dots,K_{\max}$，计算簇内误差平方和（SSE / Inertia）。随着 $K$ 增大 SSE 单调递减，选取斜率由陡变缓的“手肘拐点”作为候选 $K$ 值：`,
        f: String.raw`$$\text{SSE}(K) = \sum_{k=1}^{K}\sum_{\mathbf z_i\in C_k} \|\mathbf z_i - \boldsymbol\mu_k\|_2^2$$`,
        n: String.raw`公式解读：$\text{SSE}$ 是所有样本到各自簇中心距离的平方总和，度量“簇内松散程度”；当增加类别数 $K$ 不再能显著降低 $\text{SSE}$（折线出现手肘弯曲拐点）时，该拐点就是性价比最高的分类数 $K$。` },
      { t: '轮廓系数（Silhouette Score）定量检验', d: String.raw`计算每个样本 $i$ 到同簇其他样本的平均距离 $a(i)$（簇内凝聚度）与到最近其他簇样本的平均距离 $b(i)$（簇间分离度）。平均轮廓系数 $\bar S$ 越接近 1 说明“簇内越紧、簇间越远”，聚类效果越优异：`,
        f: String.raw`$$s(i) = \frac{b(i) - a(i)}{\max\{a(i),\, b(i)\}},\qquad \bar S = \frac{1}{n}\sum_{i=1}^{n} s(i)$$`,
        n: String.raw`公式解读：分母 $\max\{a(i),b(i)\}$ 把比值归一化到 $[-1,1]$ 之间；经验标准：平均轮廓系数 $\bar S > 0.5$ 表明聚类结构清晰合理，$\bar S > 0.7$ 表明聚类效果极佳。` },
    ],
    code: String.raw`import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score

# 示例：样本特征矩阵 (n=12, m=3)
X = np.array([
    [88, 92, 85], [85, 89, 82], [91, 94, 88], [84, 86, 80],
    [55, 60, 58], [58, 63, 54], [52, 57, 60], [60, 65, 56],
    [25, 30, 88], [28, 34, 85], [22, 28, 91], [30, 32, 84]
], dtype=float)

# 1. Z-Score 标准化
scaler = StandardScaler()
Z = scaler.fit_transform(X)

# 2. 遍历 K=2..6 计算 SSE (肘部法则) 与轮廓系数
for k in range(2, 7):
    km = KMeans(n_clusters=k, init='k-means++', n_init=10, random_state=42).fit(Z)
    sil = silhouette_score(Z, km.labels_)
    print(f"K={k} | SSE={km.inertia_:.4f} | 轮廓系数 Silhouette={sil:.4f}")

# 3. 选定最优 K=3 输出最终聚类结果与原始量纲质心
best_km = KMeans(n_clusters=3, init='k-means++', n_init=10, random_state=42).fit(Z)
centers_orig = scaler.inverse_transform(best_km.cluster_centers_)
print("\n最终簇标签:", best_km.labels_)
print("各簇中心 (原始量纲):\n", np.round(centers_orig, 2))`,
  },

  /* ====================== 常微分方程动力学模型 ====================== */
  {
    id: 'ode_sir', cat: 'sim', icon: 'DE', c: ['#e11d48', '#f97316'],
    name: '微分方程动力学 (RK4)', short: '微分方程动力学',
    en: 'ODE Dynamical Systems (SEIR & Lotka-Volterra via RK4)',
    summary: '连续机理建模的核心范式：基于四阶龙格-库塔法（RK4）高精度数值积分，仿真 SEIR 传染病/舆论传播与 Lotka-Volterra 种群生态竞争演化。',
    tags: ['连续机理模型', '国赛/美赛A题', '四阶龙格库塔'],
    keyFormula: String.raw`$$\frac{\mathrm d\mathbf y}{\mathrm dt}=\mathbf f(t,\mathbf y),\quad R_0=\frac{\beta}{\gamma}$$`,
    idea: String.raw`<p>在国赛 A 题与美赛 A/E 题（连续型问题，如 2024 美赛 A 题《七鳃鳗性别比例与种群生态演化》、传染病防控、社交网络舆论扩散、污染物水体扩散、碳中和生态动力学）中，核心任务是根据物理或生态守恒定律建立<b>常微分方程组（ODEs）</b>。</p>
<p>由于非线性微分方程组绝大多数没有初等解析解，数学建模中标准做法是采用<b>四阶龙格-库塔法（Fourth-Order Runge-Kutta, RK4）</b>进行高精度数值仿真（局部截断误差达 $O(h^5)$），绘制状态变量随时间的演化曲线与<b>相平面轨线图（Phase Portrait）</b>，并求解系统的平衡点（Equilibrium）与关键阈值（如基本再生数 $R_0 = \beta/\gamma$）。</p>
<div class="key-formula">$$\text{SEIR: }\begin{cases}\dfrac{\mathrm dS}{\mathrm dt}=-\dfrac{\beta SI}{N},\quad \dfrac{\mathrm dE}{\mathrm dt}=\dfrac{\beta SI}{N}-\sigma E\\[6pt]\dfrac{\mathrm dI}{\mathrm dt}=\sigma E-\gamma I,\quad \dfrac{\mathrm dR}{\mathrm dt}=\gamma I\end{cases}\qquad \text{Lotka-Volterra: }\begin{cases}\dfrac{\mathrm dx}{\mathrm dt}=x(\alpha-\beta y)\\[6pt]\dfrac{\mathrm dy}{\mathrm dt}=y(\delta x-\gamma)\end{cases}$$</div>
<div class="formula-explain"><b>公式通俗解读：</b>微分方程左边 $\frac{\mathrm d}{\mathrm dt}$ 代表“某一群体数量随时间的瞬时变化速度”，右边等于“每秒新流入人数 $-$ 每秒流出人数”。例如在 SEIR 中，$\frac{\beta SI}{N}$ 是健康人 $S$ 接触感染者 $I$ 被传染变成潜伏者 $E$ 的速率，$\sigma E$ 是潜伏者发病变成感染者 $I$ 的速率，$\gamma I$ 是感染者康复变成 $R$ 的速率。</div>`,
    scenes: [
      '传染病与舆论信息传播：SIR / SEIR 模型量化感染峰值、达峰时间、潜伏期效应与疫苗隔离效果',
      '生态种群竞争与协同演化：Lotka-Volterra 捕食者-猎物模型（如 2024 美赛 A 题七鳃鳗与寄主生态动力学）',
      '物理与工程连续过程：散热温控方程、药物代谢动力学（PK/PD）、水库泄洪与化学反应动力学',
      '技术扩散与新产品市场渗透：Bass 扩散微分方程模型',
    ],
    pros: [
      '机理极其清晰，每一个参数（感染率 β、潜伏转化率 σ、恢复率 γ）都有明确的现实物理/生态意义',
      '可进行定性稳定性分析（平衡点、相平面极限环、阈值 R0）与反事实政策仿真（如改变 β 模拟封控效果）',
      '四阶龙格-库塔（RK4）精度极高、数值稳定，是科学计算领域的黄金标准',
    ],
    cons: [
      '经典仓室模型假设人群均匀混合（Homogeneous Mixing），忽略了空间异质性与复杂网络拓扑结构',
      '方程参数往往需要结合历史真实数据通过非线性最小二乘进行参数反演（Parameter Estimation）',
    ],
    data: String.raw`<p>微分方程组机理参数（如总人口 $N$、传播率 $\beta$、潜伏转阳率 $\sigma$、康复率 $\gamma$，或生态增长率 $\alpha$、捕食率 $\beta$ 等）、初值状态向量 $\mathbf y(0)$ 及仿真时长 $T_{\max}$。</p>`,
    tips: '美赛 A/E 题 O 奖论文必杀技：除了画出各状态随时间 t 的变化曲线外，一定要画一张【相平面轨线图（如 S-I 相图或猎物 x - 捕食者 y 闭合极限环）】并标出不动点/平衡点 $(x^*, y^*) = (\gamma/\delta, \alpha/\beta)$，审稿人一看便知具备扎实的动力系统功底！',
    steps: [
      { t: '划分系统仓室或状态变量', d: String.raw`明确系统中随时间连续演化的核心状态量。例如 SEIR 模型将总人口 $N$ 划分为四类仓室：易感者 $S(t)$、潜伏者 $E(t)$、感染者 $I(t)$ 与康复/移出者 $R(t)$，满足守恒律 $S+E+I+R=N$。` },
      { t: '基于变化率守恒建立微分方程组', d: String.raw`根据“单位时间净变化率 = 流入速率 − 流出速率”建立耦合非线性常微分方程组 $\dfrac{\mathrm d\mathbf y}{\mathrm dt} = \mathbf f(t, \mathbf y)$：`,
        f: String.raw`$$\begin{cases} \dfrac{\mathrm dS}{\mathrm dt} = -\dfrac{\beta S I}{N} \\[6pt] \dfrac{\mathrm dE}{\mathrm dt} = \dfrac{\beta S I}{N} - \sigma E \\[6pt] \dfrac{\mathrm dI}{\mathrm dt} = \sigma E - \gamma I \\[6pt] \dfrac{\mathrm dR}{\mathrm dt} = \gamma I \end{cases}\qquad\text{或}\qquad\begin{cases} \dfrac{\mathrm dx}{\mathrm dt} = \alpha x - \beta x y \\[6pt] \dfrac{\mathrm dy}{\mathrm dt} = \delta x y - \gamma y \end{cases}$$`,
        n: String.raw`公式解读：右式 Lotka-Volterra 方程中，$x$ 是猎物（自身按 $\alpha x$ 自然繁殖，遇到捕食者按 $\beta xy$ 被吃掉），$y$ 是捕食者（靠吃猎物按 $\delta xy$ 繁殖，缺乏食物时按 $\gamma y$ 自然死亡），两者相互制约形成周期性波动。` },
      { t: '平衡点（奇点）与阈值理论分析', d: String.raw`令导数 $\dfrac{\mathrm d\mathbf y}{\mathrm dt} = \mathbf 0$ 求解系统的平衡点与传播阈值。对于传染病模型，基本再生数 $R_0 = \dfrac{\beta}{\gamma}$ 决定了疫情是否爆发（$R_0 > 1$ 形成流行高峰，$R_0 < 1$ 自然消亡）；对于 Lotka-Volterra 模型，非零共存平衡点为 $(x^*, y^*) = \left(\dfrac{\gamma}{\delta}, \dfrac{\alpha}{\beta}\right)$。` },
      { t: '四阶龙格-库塔法（RK4）数值离散求解', d: String.raw`以步长 $h=\Delta t$ 离散时间轴 $t_{n+1}=t_n+h$，在每一步内计算四个斜率加权平均，达到四阶全局精度 $O(h^4)$：`,
        f: String.raw`$$\begin{aligned} \mathbf k_1 &= \mathbf f(t_n, \mathbf y_n), & \mathbf k_2 &= \mathbf f\!\left(t_n+\tfrac{h}{2}, \mathbf y_n+\tfrac{h}{2}\mathbf k_1\right) \\ \mathbf k_3 &= \mathbf f\!\left(t_n+\tfrac{h}{2}, \mathbf y_n+\tfrac{h}{2}\mathbf k_2\right), & \mathbf k_4 &= \mathbf f(t_n+h, \mathbf y_n+h\mathbf k_3) \end{aligned}$$
$$\mathbf y_{n+1} = \mathbf y_n + \frac{h}{6}\left(\mathbf k_1 + 2\mathbf k_2 + 2\mathbf k_3 + \mathbf k_4\right)$$`,
        n: String.raw`公式解读：如果只用起点斜率 $\mathbf k_1$ 往前迈一步就是粗糙的欧拉法；RK4 则聪明地探测了“起点斜率 $\mathbf k_1$、两个中点预测斜率 $\mathbf k_2, \mathbf k_3$、终点预测斜率 $\mathbf k_4$”，再按 $1:2:2:1$ 的黄金权重求平均迈出下一步，既快又极其精准。` },
      { t: '绘制时序演化曲线、相平面图与参数灵敏度分析', d: String.raw`绘制各状态随时间的变化曲线与二维相空间轨迹，并改变关键受控参数（如通过社交隔离降低 $\beta$ 或提高治愈率 $\gamma$）对比峰值削减效果（“压平曲线 Flatten the Curve”）。` },
    ],
    code: String.raw`import numpy as np
from scipy.integrate import solve_ivp

# 1. SEIR 传染病动力学模型
def seir_ode(t, y, N, beta, sigma, gamma):
    S, E, I, R = y
    inf = beta * S * I / N
    return [-inf, inf - sigma * E, sigma * E - gamma * I, gamma * I]

N = 10000
beta, sigma, gamma = 0.6, 0.2, 0.1
y0 = [N - 30, 20, 10, 0]  # [S0, E0, I0, R0]
t_eval = np.linspace(0, 120, 241)

sol = solve_ivp(seir_ode, [0, 120], y0, args=(N, beta, sigma, gamma), t_eval=t_eval, method='RK45')
S, E, I, R = sol.y
peak_idx = np.argmax(I)
print(f"基本再生数 R0 = {beta/gamma:.2f}")
print(f"感染峰值人数 I_max = {I[peak_idx]:.1f} 人 (发生在第 {sol.t[peak_idx]:.1f} 天)")
print(f"最终累计感染比例 = {R[-1]/N*100:.2f}%")`,
  },
];

