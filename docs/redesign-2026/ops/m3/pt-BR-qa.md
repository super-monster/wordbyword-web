# M3 · pt-BR（巴西葡萄牙语）首页文案 QA 记录

| 项 | 内容 |
|---|---|
| locale | pt-BR（T2：LLM 翻译 + 回译 + 术语表 lint + 关键词检查后上线，上线后补母语审校，R36） |
| 交付 | `src/locales/pt-BR.json`（新建）、`src/data/glossary/pt-BR.json`（新建：文档 08 §7.2.1 表 T-A…T-E 的 pt-BR 列，逐条对照 `WordByWordPrototype/Localizable.xcstrings` 的 pt-BR 值核过）、本记录、`pt-BR-lint.json`（claims-lint / keyword-map 的 pt-BR 补丁提案，未合并） |
| 依据 | 文档 08 §7（7.1–7.10）、§1.1、§1.4、§1.5、§2 en 母版；文档 03 §1.4/§1.5/§1.6/§2.3（pt-BR 行，表 A/B/C）/§3.1–§3.9；文档 04 §5.1/§5.5/§5.7；裁定 R36、R39–R43、R46、R53、R61–R65、R71、R75–R78、R83、R84；`ja.json` / `zh-Hans.json` 作结构参照 |
| 称谓与用语 | você；巴西用法（tela、celular、usuário、compartilhar、contato、equipe、registro；欧葡写法进 glossary 禁用表）；引号 “ ”；App 名 "o WordByWord / o app"（阳性），App Store 用阴性 "na App Store"（Apple 巴西写法）；Apple 账户写 "Conta Apple"（Apple 现用名） |
| 工作方式 | 私有副本中构建和验收；OG 图只在副本里生成，未复制进真实仓库；真实仓库只放入上面四个文件 |
| 日期 | 2026-10-06 |

## 0. 摘要

1. 键与 en 完全一致（`check.mjs --keys pt-BR`：0 缺、0 多）。最终复核用的是**真实仓库当前 HEAD（1d5fe5b，已含 zh-Hant / es / fr / ko 和 es、fr 的 lint 规则）+ 本次两个文件**的新副本，在副本里跑 `og.mjs --only home-pt-BR` 后：`build` 0 error、`build --pseudo` 0 error、`scripts/check.mjs` 0 error / 0 warning、`node --test scripts/tests/*.test.mjs` 58/58 通过。
2. pt-BR 相关 warning 共 4 条：L-8 `features[lookup].kicker` 30 > 24（App 原名，见 §6-1；es 26、fr 28 同类）；L-4 `common.menu` = "Menu"（葡语本来就是这个词）；L-14（claims-lint 没有 pt-BR 写法，24 条规则"未覆盖"）与 L-9（keyword-map 没有 pt-BR 的 G1 how-to 词）——后两条按简报没改数据文件，补丁见 `pt-BR-lint.json`（§5），在副本里合入后这两条消失、仍 0 error、测试 58/58。
3. title 逐字用文档 03 §3.9 草案（59 字符）；description 按 §7.3 手势写法把 "Dois toques" 改成 "Toque duas vezes"，受众词改成 "Para aprender idiomas"（160 字符）；H1 只把 "de uma" 改成 "numa"（70 字符），桌面端不再出现 "de uma" 单独成行（§7）。
4. 手势：句中写 "deslize … para a direita"（与 App 提示 `tip_swipe_to_translate` 一致）和 "toque duas vezes"；名词用 App 自己的 "toque duplo"。旧版 pt 页的 "Selecione para traduzir / tradução por seleção" 全部不用，glossary 把它列为禁用（claims-lint `selection-translate` 也会拦）。
5. SE：`seMode = local`（文档 08 §7.8 的 full），卡片、FAQ、页脚都链 `https://surfenglish.app/pt-br/`（hreflang pt-BR）。hreflang 簇里 `/pt-br/` 另有 `pt`（R53），文案无须处理。
6. OG（只在副本）：一次通过，标题 60 px × 3 行（第 3 行是荧光笔短语，与 en 现状同一版式），副标题 28 px × 2 行，157.8 KB。**真实仓库在生成 `home-pt-BR` OG 之前会报 D-23（唯一的 error）。**

## 1. 关键词落点（title / H1 / description 用了哪些主词）

| 位置 | 文案 | 承载的关键词 | 长度 |
|---|---|---|---|
| `meta.title` | WordByWord: tradutor bilíngue de páginas da web para iPhone | 品牌位 WordByWord；K1 主词整句（表 A pt-BR："tradutor bilíngue de páginas da web para iPhone"）；`titleMust` = iPhone / páginas da web / tradutor；`primaryTokens` iPhone + tradutor | 59 / 60 |
| `meta.description` | Para aprender idiomas: no WordByWord, deslize um parágrafo e a tradução aparece abaixo. Toque duas vezes numa palavra e veja o sentido. Grátis no iPhone e iPad. | 受众词 aprender idiomas（表 C）；K1 动作 + 结果在前半；"no WordByWord"（文档 03 §3.2 允许的"在 WordByWord 里"）；K2 动作 → 结果；"iPhone e iPad · 免费"收尾（SEO-11） | 160（120–160） |
| `hero.title`（H1） | Deslize um parágrafo numa [[página da web]] e veja a tradução logo abaixo. | K1 动作（段落级，R46/PRO-19）+ 结果 + 核心名词 "página da web"（荧光笔 3 词，R65）；无品牌、无 how-to | 70 / 75 |
| `hero.eyebrow` | WordByWord · Leitor bilíngue da web para aprender idiomas | 品牌 + 品类 + 受众 | 57 / 60 |
| `hero.lede` = `ledeShort` | WordByWord é um assistente de leitura para quem aprende idiomas, no iPhone e no iPad. | R39 定义句（"assistente" 只在定义句里出现） | 85 / 90 |
| `featuresIntro.title`（功能区 H2） | Deslize e traduza, toque duas vezes e consulte — nos sites que você lê | K1 + K2 场景句；"nos sites que você lê"（不写"任意网站"，PRO-16） | 70 / 70 |
| 功能 H3 | K1 "Deslize para Traduzir: a tradução aparece logo abaixo do original"；K2 "Toque duas vezes numa palavra e veja o significado no contexto, com IA"；K9 "Leia posts do X (Twitter) com tradução no navegador integrado"；K3 "Leitura em voz alta com IA ou vozes rápidas do iOS no aparelho"；K4 "Análise da estrutura da frase com IA, para entender frases longas"；K7 "Tradução na nuvem ou no dispositivo"；K6 "Histórico de traduções e palavras consultadas" | K3、K4、K6、K7 的表 A/B 主词逐字进 H3；K5 只用 App 名 + "para frases em inglês"（R83） | ≤ 70 wu |
| `languages.title` | Tradução para 21 idiomas, e não só de páginas em inglês | K8 主词 "tradução para 21 idiomas"（复数对象） | 55 |
| `pricing.title` / FAQ `free` | Grátis todos os dias — e o Plus quando você lê mais / O WordByWord é grátis? Quais são os limites diários? | K10 | — |
| `cta.title` | Comece a ler sites em dois idiomas no iPhone | 动作句，不与 G1 how-to 重复（R46） | 44 |

没有出现在 title / H1 / description / OG / 功能区 H2 的词：aprender inglês、notícias em inglês、blocos（SE 词，文档 03 §1.4）；como traduzir、manter o original（G1 how-to）。

## 2. Q1–Q10 逐条结果（文档 08 §7.9）

| # | 结果 | 说明 |
|---|---|---|
| Q1 | ✓ | JSON 可解析；键、数组 id 和顺序与 en 一致（L-1、L-2）；无 about / chromeExtension / legal（pt-BR 没有这些页，与 ja 相同） |
| Q2 | ✓ | 占位符、`[[ ]]`、`**`、`[文本](@ref)` 原样保留，ref 只用 @about / @chrome / @se-site；没有写死额度、价格、语言数（L-12 无提示）。按简报 R62 对"数字 + 可数名词"一律用复数对象，写 pt 的全部 CLDR 类别 `one / many / other`（Node 24：0、1 → one，21 → other，1 000 000 → many，即 "1.000.000 de idiomas"）。渲染核对：App em 20 idiomas、Traduções para 21 idiomas、50 traduções、20 consultas、30 usos、5 explicações。价格表 `perDay` 写成 "{n} por dia"，数字后不接可数名词 |
| Q3 | ✓ | title 以品牌开头，含 `titleMust` 全部词元；K1 是产品 / 品类意图；title、description、H1、OG、功能区 H2 中 SE 独占词与 G1 how-to 句式 0 命中（用 §5 提案规则验证） |
| Q4 | ✓ | H1 恰好 1 处 `[[ ]]`（3 词）；功能 H3、`languages.title` 无 `[[ ]]`；`hero.lede` 以 "WordByWord é…" 开头并写明受众 |
| Q5 | ✓ | §1.1 红线表逐行对过；§7.5 禁用说法：现有 pt-BR 规则（selection-translate、jargon）0 命中，§5 提案的 25 条规则 0 命中（豁免键除外） |
| Q6 | ✓ | kicker、价格表行名、"在 App 里点哪个按钮"用 App 叫法（表 T-A…T-E，及 App 的 Free/Plus 对照屏行名）；句中用 §7.3 写法；§7.2.2 没有 pt-BR 修正项；L-13（glossary：required / contains / banned）0 违规 |
| Q7 | ✓ | 所有 alt 与 gallery 图注都写明 "(interface em inglês)"，`common.screenshotLabel` / `screenshotExcerptLabel` 也写明；`features[x].alt` 描述社交帖样张并注明 "não é uma captura de tela"；样张 `lookup.word` = "end"，出现在 `demo.source[1]`（L-10） |
| Q8 | ✓ | SE：模式 local；`note` = "App em 12 idiomas, com português"；`linkText` 是 SE 核心词短语 + 品牌；H2 以 SurfEnglish 开头；无"升级 / 替代 / Novo / mais adequado / pode combinar melhor" |
| Q9 | ✓（1 处例外） | 全部代入占位符后测：见 §1 与 §7。唯一超限是 `features[lookup].kicker` 30 > 24（W，§6-1）。alt 最长 125（上限 125） |
| Q10 | ✓ | 拉丁文字，无 `{wbr}`；不涉及 RTL / CJK |
| Q13 | ✓ | FAQ `devices` 的 `a`（S0）不写扩展名称；首页不出现 WordByWord.io（`footer.notAffiliated` 只在 about / 扩展页渲染） |

指向英文页面的链接在链接文字内加 "(em inglês)"：FAQ `what-is` 的 @about、`devices` 的 @chrome（`a` 与 `aExtLive`）。

## 3. 回译对照（pt-BR → English，对照 en.json）

| 键 | pt-BR | 回译 | en 原文 |
|---|---|---|---|
| meta.title | WordByWord: tradutor bilíngue de páginas da web para iPhone | WordByWord: bilingual web page translator for iPhone | …Bilingual Web Page Translator App for iPhone |
| meta.description | Para aprender idiomas: no WordByWord, deslize um parágrafo e a tradução aparece abaixo. Toque duas vezes numa palavra e veja o sentido. Grátis no iPhone e iPad. | To learn languages: in WordByWord, swipe a paragraph and the translation appears below. Double-tap a word and see its meaning. Free on iPhone and iPad. | For language learners: swipe a paragraph in the built-in browser… |
| meta.ogHeadline | Leia qualquer página da web em dois idiomas. [[Sem perder o original.]] | Read any web page in two languages. Without losing the original. | Read any web page bilingually. Keep the original. |
| meta.ogSubline | Deslize um parágrafo para a direita · toque duas vezes numa palavra para ver o sentido no contexto | Swipe a paragraph to the right · double-tap a word to see its meaning in context | 同义 |
| hero.title | Deslize um parágrafo numa [[página da web]] e veja a tradução logo abaixo. | Swipe a paragraph on a web page and see the translation right below. | …on any web page. Its translation appears right below. |
| hero.lede | WordByWord é um assistente de leitura para quem aprende idiomas, no iPhone e no iPad. | WordByWord is a reading assistant for people learning languages, on iPhone and iPad. | 同义 |
| hero.how | Abra um site no navegador integrado e deslize um parágrafo para a direita: a tradução aparece logo abaixo. Toque duas vezes numa palavra e a IA explica o que ela significa ali. | Open a site in the built-in browser and swipe a paragraph to the right: the translation appears right below. Double-tap a word and the AI explains what it means there. | 同义 |
| featuresIntro.title | Deslize e traduza, toque duas vezes e consulte — nos sites que você lê | Swipe and translate, double-tap and look up — on the sites you read | 同义 |
| features[swipe].title | Deslize para Traduzir: a tradução aparece logo abaixo do original | Swipe to Translate: the translation appears right below the original | 同义 |
| features[lookup].title | Toque duas vezes numa palavra e veja o significado no contexto, com IA | Double-tap a word and see its meaning in context, with AI | Double-tap a word for its AI meaning in context |
| features[x].title | Leia posts do X (Twitter) com tradução no navegador integrado | Read X (Twitter) posts with translation in the built-in browser | …bilingually… |
| features[chunks].title | Extração de Blocos e Action Flow, para frases em inglês | Chunk Extraction and Action Flow, for English sentences | 同义 |
| features[speech].title | Leitura em voz alta com IA ou vozes rápidas do iOS no aparelho | AI read-aloud, or fast iOS voices on the device | 同义 |
| features[syntax].title | Análise da estrutura da frase com IA, para entender frases longas | AI sentence structure analysis, to understand long sentences | …for long sentences |
| features[engines].title | Tradução na nuvem ou no dispositivo | Cloud or on-device translation | 同义 |
| features[display].title | Layout e estilo da tradução | Translation layout and style | 同义 |
| features[history].title | Histórico de traduções e palavras consultadas | History of translations and looked-up words | 同义 |
| features[devices].title | iPhone, iPad, Mac e Vision Pro | iPhone, iPad, Mac and Vision Pro | 同义 |
| faq q（13 问，按顺序） | O que é o WordByWord? · O WordByWord traduz uma página da web inteira de uma vez? · Funciona no Safari ou dentro de outros apps? · O WordByWord é um tradutor palavra por palavra? · Posso ler o X (Twitter) com o WordByWord? · Quais idiomas o WordByWord suporta? · O WordByWord é grátis? Quais são os limites diários? · Que mecanismo de tradução ele usa? · Preciso criar uma conta para usar o WordByWord? · Como recupero o WordByWord Plus em um iPhone ou iPad novo? · Existe uma versão para Android? · Estou aprendendo inglês. Vale a pena experimentar também o SurfEnglish? · O WordByWord funciona no iPad, no Mac ou no navegador do PC? | What is WordByWord? · Does WordByWord translate a whole web page at once? · Does it work in Safari or inside other apps? · Is WordByWord a word-by-word translator? · Can I read X (Twitter) with WordByWord? · Which languages does WordByWord support? · Is WordByWord free? What are the daily limits? · Which translation engine does it use? · Do I need to create an account to use WordByWord? · How do I get WordByWord Plus back on a new iPhone or iPad? · Is there an Android version? · I'm learning English. Is SurfEnglish worth trying too? · Does WordByWord work on iPad, Mac or in the PC browser? | 同义（最后一问 en 为 "a desktop browser"） |
| pricing.summary | Tudo é grátis dentro desses limites; o Plus os aumenta por US$ 3,99/mês (EUA). | Everything is free within these limits; Plus raises them for US$3.99/month (US). | Every feature is free within these limits… |
| sibling.card.eyebrow / title | Do criador do WordByWord / SurfEnglish: notícias em inglês no seu nível | From the creator of WordByWord / SurfEnglish: English news at your level | …developer… / …daily English news at your level |
| sibling.card.body | Aprendendo inglês? Continue lendo qualquer página no WordByWord e experimente também o SurfEnglish: notícias diárias em inglês e jogos de revisão, com os mesmos gestos. | Learning English? Keep reading any page in WordByWord and try SurfEnglish too: daily English news and review games, with the same gestures. | …daily English news by level and review games, with the same swipe and double-tap. |
| sibling.card.points | Notícias reais em inglês nos níveis A1–C1 · Jogos de revisão com o que você leu · Envie artigos em inglês do Safari para o app | Real English news at levels A1–C1 · Review games with what you've read · Send English articles from Safari to the app | 同义 |
| sibling.card.note | Grátis para começar · iPhone e iPad · App em 12 idiomas, com português · Traduções para 21 | Free to start · iPhone and iPad · App in 12 languages, including Portuguese · Translations into 21 | 加"含葡语"（文档 04 §5.7 T6） |
| sibling.card.linkText / appStoreLinkText | Leia notícias em inglês no seu nível com o SurfEnglish / Baixar o SurfEnglish na App Store | Read English news at your level with SurfEnglish / Get SurfEnglish on the App Store | 同义 |
| sibling.card.shotCaption / footer | Captura de tela do SurfEnglish (interface em inglês) / Do mesmo desenvolvedor · SurfEnglish: Inglês e notícias | SurfEnglish screenshot (English interface) / From the same developer · SurfEnglish: English and news（巴西商店名） | 同义 |
| cta.title | Comece a ler sites em dois idiomas no iPhone | Start reading websites in two languages on iPhone | …bilingually… |
| cta.recap | Deslize para traduzir · Toque duas vezes para consultar · Leitura em voz alta · 21 idiomas | Swipe to translate · Double-tap to look up · Read aloud · 21 languages | 同义 |

### 3.1 与 en 的事实偏差

**无。** 只有措辞上的取舍：① H1 的 "any web page" 写成 "numa página da web"（照文档 03 草案的 "uma página"，"qualquer página da web" 会让荧光笔短语变成 4 个词）；② description 用 "no WordByWord" 代替 "in the built-in browser"（长度；文档 03 §3.2 允许），并去掉了草案里的 "para a direita"（en 的 description 也不写方向；方向写在 hero.how、功能区和 FAQ）；③ SE 卡片正文把 "by level / same swipe and double-tap" 压成 "notícias diárias em inglês … com os mesmos gestos"（为满足卡片高度，"no seu nível" 在 H2、"níveis A1–C1" 在要点 1，FAQ 答案仍完整写出 "o mesmo gesto de deslizar e o mesmo toque duplo"）；④ SE `note` 按 T6 加了 "com português"。

## 4. 没把握的措辞（10 处，附回译与替代写法）

| # | 键 | 现写法（回译） | 不确定在哪 | 替代 |
|---|---|---|---|---|
| 1 | features[lookup].kicker（及价格表行） | Toque duas vezes para procurar（Double-tap to look up） | App 原名，30 字符超出 24 wu；"procurar" 是 App 的直译，巴西人查词更常说 "consultar" | Toque duplo（11，iOS 与 App 都用的名词）/ Consulta por toque duplo（24） |
| 2 | features[speech].text | vozes Premium ou Aprimoradas que você já baixou（Premium or Enhanced voices you've downloaded） | App 的 pt-BR 写 "Premium ou Enhanced"；我按 iOS 巴葡的语音标签写 "Aprimorada"，未在真机核对 | vozes Premium ou Enhanced（照 App） |
| 3 | featuresIntro.title | …toque duas vezes e consulte…（double-tap and look up） | "consulte" 没有宾语，略口语 | …toque duas vezes e entenda…（and understand） |
| 4 | meta.description | Para aprender idiomas: …（To learn languages:） | 受众写成目的状语，不是"为学习者"；为守 160 字符 | Para quem aprende idiomas: …（164，L-8 W） |
| 5 | meta.description / ogSubline | …e veja o sentido（and see its meaning） | "sentido" 比 K2 主词里的 "significado" 口语；H3 用的是 "significado" | …e veja o significado（+4 字符，超 160） |
| 6 | hero.eyebrow | Leitor bilíngue da web para aprender idiomas（Bilingual web reader for learning languages） | "leitor da web" 不是常见说法 | Leitura bilíngue na web para quem aprende idiomas（62，超 60） |
| 7 | meta.ogHeadline | Sem perder o original.（Without losing the original.） | es 把 "sin perder el original" 列入 G1 how-to 保留词；OG 不在 how-to 检查区，en 的 OG 同样用 "Keep the original." | O original continua ali.（The original stays there.） |
| 8 | features[syntax].text | No “Histórico de Tradução por Deslizamento”…（In the "Swipe Translation History"…） | 照引 App 屏幕名，但 "deslizamento" 也有"滑坡"义，读起来生硬；不引原名又会和 App 的 "Histórico de Traduções"（查词历史）混淆 | no histórico das frases traduzidas（不引原名） |
| 9 | sibling.card.eyebrow | Do criador do WordByWord（From the creator of WordByWord） | 文档 04 T2 要"单数开发者"；"desenvolvedor" 在 375 px 下折成两行 | Do desenvolvedor do WordByWord |
| 10 | faq.items[devices].q | …ou no navegador do PC?（…or in the PC browser?） | "PC" 在巴西泛指电脑，但也可能被理解成 Windows 机 | …ou num navegador de computador?（手机上多一行） |

## 5. claims-lint / keyword-map 的 pt-BR 补丁（`pt-BR-lint.json`，未合并）

- 覆盖：claims-lint 中有分语言写法、且还没有 pt-BR 键的全部 25 条规则（跳过已有 pt-BR 的 selection-translate、jargon，以及只有 `*` 的 io-home、engine-claim）。keyword-map：`seOwned` 在现有 "aprender inglês"、"notícias em inglês" 上补其他"学英语"动词形式、"inglês por nível"、"blocos"（SE 巴葡官网叫语块 "blocos de sentido"；en 同样把 `chunks?` 列为 SE 词）；`seOwnedLead` 补 "aprendendo / estudar inglês" 开头；`reservedG1` 新增（como traduzir / como ler、manter / mantendo / preservar / sem perder o original、passo a passo）。
- 测试：在新副本合入后，pt-BR 文案 0 命中（L-14、L-9、D-8 均无报错，build / pseudo 0 error，测试 58/58）；以下反例每条规则至少命中一处，反面样例（我们自己的句子、R83 的通用学习词）0 命中：

| 规则 | 反例 | 命中 |
|---|---|---|
| whole-page | Traduza a página inteira com um toque. | Traduza a página inteira |
| swipe-left | Deslize o parágrafo para a esquerda para ver a tradução. | …para a esquerda（"barra vermelha à esquerda" 不命中） |
| safari-extension | Funciona como extensão do Safari em qualquer app. | extensão do Safari / em qualquer app |
| offline | Traduza offline, sem internet. | offline / sem internet |
| unlimited-ai-voice | O Plus inclui pronúncia AI ilimitada. | AI ilimitad（"“Leitura AI” usa…"、"Sem limite diário" 不命中） |
| dark-mode-theme | Ative o modo escuro e escolha temas personalizados. | modo escuro / temas personalizad |
| shortcuts-volume | Ajuste o volume e use atalhos de teclado. | volume / atalhos de teclado |
| vocab-sync | Salve palavras em flashcards e sincronize entre dispositivos. | flashcards / sincroniz |
| android | Baixe a versão para Android no Google Play. | Android / Google Play（FAQ `android` 豁免） |
| desktop-version | Use a versão para PC no Windows. | versão para PC |
| x-app | Traduza posts direto no app do X. | no app do X |
| plus-early-access | Assinantes do Plus têm acesso antecipado a novidades. | acesso antecipado |
| privacy-claim | O app não coleta nenhum dado pessoal. | nenhum dado pessoal |
| initial-version | A versão inicial traduz entre mais de 20 idiomas. | versão inicial |
| language-pairs | Mais de 20 pares de idiomas. | pares de idiomas |
| style-count | Escolha entre 8 estilos de tradução. | 8 estilos |
| auto-detect-target | O app detecta automaticamente o idioma de destino. | detecta automaticamente o idioma de destino |
| history-by-date | O histórico fica agrupado por data. | agrupado por data |
| plus-only | A análise de sintaxe é exclusiva do Plus. | exclusiva do Plus |
| speaking-practice | Melhore sua pronúncia com prática de conversação. | Melhore sua pronúncia / prática de conversação |
| replacement-tone | Se você aprende inglês, o SurfEnglish pode combinar melhor com você. | pode combinar melhor |
| se-on-device-voice | Vozes de IA no aparelho, que funcionam offline. | Vozes de IA no aparelho / funcionam offline |
| se-hype | Novo: o SurfEnglish é mais rápido e melhor que o WordByWord. | Novo / mais rápid / melhor que |
| hype | O melhor app de tradução, usado por milhões de pessoas. | O melhor / milhões de pessoas |
| ext-language-count | A extensão traduz para 20+ idiomas. | 20+ idiomas（只作用于 chromeExtension.*） |
| seOwned | Aprenda inglês com notícias em inglês por nível. | Aprenda inglês / notícias em inglês / inglês por nível（"Para aprender idiomas"、"quem aprende idiomas" 不命中） |
| seOwnedLead | Aprendendo inglês? Conheça o SurfEnglish（作 H2） | Aprendendo inglês |
| reservedG1 | Como traduzir páginas da web no iPhone mantendo o original | Como traduzir / mantendo o original（我们的 cta.title 与 H1 不命中） |

## 6. 需要负责人决定的问题

1. **kicker 上限与 App 原名冲突（系统性）**：文档 08 §7.6 的 kicker ≤ 24 wu 与规则 ①"kicker 用 App 叫法"在拉丁语言里冲突——pt-BR "Toque duas vezes para procurar" 30、fr 28、es 26，均为 W。建议把拉丁 / 西里尔文字的 kicker 上限放宽到 32，或统一改用短名（pt-BR 可写 "Toque duplo"）。我保留了 App 原名。
2. **App 侧 pt-BR 文案问题（规则 ③，报给 App，不在官网范围）**：① "AI" 与 "IA" 混用（"Leitura AI""Pronúncia AI""Significado AI" vs "Análise de Estrutura de Sintaxe de IA"）；官网的 kicker / 价格表 / 引用按钮名照 App，正文写 "IA"。若负责人认定 "AI" 属"混入别的语言"，网站可统一改成 "IA"（例如 "Pronúncia com IA (Palavra)"）。② 本地语音写 "Premium ou Enhanced"，iOS 巴葡界面是 "Aprimorada"（见 §4-2）。③ 书签有 "Marcadores" 与 "Ver Favoritos" 两种叫法（网站用 Safari 巴葡的 "favoritos"）。④ "Tradução por Deslizamento"（"deslizamento" 也指滑坡）。⑤ 巴西 App Store 副标题 "Deslize para traduzir de IA" 语法不通（"de IA" 接不上）；`meta.appStoreSubtitle` 按 ja 的做法照抄商店原文（只在 en-only 的 about 事实表用到）。
3. **合并 `pt-BR-lint.json`**：特别确认 `seOwned` 里的 `\bblocos?\b`（title / H1 / description / OG / 功能区 H2 禁用 "blocos"，与 en 禁 "chunks" 同理；正文与 H3 不受影响）。
4. **OG**：真实仓库需要跑 `node scripts/og.mjs --only home-pt-BR`（副本里一次通过），否则 D-23 报错。
5. **页面长度**：390 px 下 pt-BR 13,070 px，en 12,822、es 13,048、fr 13,549（同一副本）。≤ 13,000 的目标定于只有 3 种语言时；页脚语言列表每多一种语言就变长（en 已从 12,758 涨到 12,822），20 种语言全部上线后 en 也会超。建议把目标改成"相对 en ≤ +X%"或只对 en 生效。pt-BR 已经为此缩短了价格表行名、SE 卡片和几段正文（§7）。
6. 发布后按 R36 安排巴西葡语母语审校，重点是 §4 的 10 处。

## 7. 版面实测（新副本 + 本地 Cloudflare 模拟服务器，浅色模式）

| 视口 | 整页高度 | SE 卡片高度（上限） | 其他 |
|---|---|---|---|
| 1280 × 800 | 10,296 | 338（420） | 无横向溢出；H1 4 行（Deslize um parágrafo / numa página da web / e veja a tradução / logo abaixo.） |
| 390 × 844 | 13,070（en 12,822） | 429（480） | 样张红色译文条顶端 735 px（R69：844 内可见） |
| 375 × 812 | 13,279 | 450（480） | 无横向溢出；译文条 733 px |
| 320 × 640 | 14,014 | 545（560，R84） | 无横向溢出 |

为满足以上数字所做的改动（与初稿相比）：价格表行名缩成 App 名短式（手机上 ≤ 3 行，表高 1,064 → 952 px @375）；SE 卡片正文、要点 2、note 缩短，H2 去掉 "diárias"（514 → 450 px @375；592 → 545 px @320）；`featuresIntro.lede`、`pricing.lede`、`languages.lede`、查词正文、两条图注各删几个词；FAQ 标题改 "Dúvidas sobre o WordByWord"（手机上 1 行）。
