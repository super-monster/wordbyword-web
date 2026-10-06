# M3 · ko（한국어）首页文案 QA 记录

| 项 | 内容 |
|---|---|
| 日期 | 2026-10-06 |
| 交付物 | `src/locales/ko.json`：首页全部键 + `notfound.*`。ko 没有 about 页和 Chrome 扩展页（`src/site.mjs` 的 `PAGES` 只给 en / zh-Hans），所以不交付 `legal`、`about`、`chromeExtension` |
| 术语表 | 沿用已有的 `src/data/glossary/ko.json`，未修改（补充建议见 §9-4） |
| 批次与审校 | T1。R36 / H7：上线前须由外部韩语母语审校；T-7 前没有着落时，按"双模型互检 + 回译 + 术语表 lint"上线并标记待复核。本记录包含回译、lint 和第二模型互检的结果，**还没有经过母语审校** |
| 依据 | 文档 08 §7（7.1–7.10）、§1.4–1.5、§2；文档 03 §1.4、§1.5、§2.2（ko 表）、§3.5、§3.9；文档 04 §5.1、§5.5、§5.7；裁定 R36、R39–R43、R46、R52、R61、R62、R64、R65、R71、R75–R78、R83；`src/data/sibling.mjs`（ko 的 `seMode` = `local`，即文档 08 的 full 模式） |
| 构建验证 | 在私有副本里，叠加真实仓库最新提交 7e5dc74（en / ja / zh-Hans / zh-Hant）再加上本稿 ko：`node build.mjs` 0 error（12 页；ko 只有预期内的 L-4 W），`--pseudo` 0 error，`scripts/check.mjs` 0 error / 0 warning，`check.mjs --keys ko` 缺 0、多 0，`node --test scripts/tests/*.test.mjs` 58/58。OG 图 `home-ko` 只在副本里生成过：标题 64 px × 2 行，副标题 30 px × 2 行，130.7 KB，版式检查通过 |

## 0. 摘要

- **关键词**：title 原样使用文档 03 §3.9 的 ko 草案「WordByWord: 아이폰 웹페이지 번역 앱 | 원문·번역 같이 보기」（K1 主词「아이폰 웹페이지 번역 앱」，titleMust 4 个词元全部命中）。description、H1 也都用 §3.9 草案。H1 只有一处荧光笔，标在「웹페이지」上。功能 H3、FAQ 问句按 §2.2 ko 关键词改写，K2 用「AI 사전」，K6 用「번역 기록·단어 찾기 기록」。
- **语体**（I18-12）：`meta.description` 和全部 FAQ 答案用합니다체。hero、功能卡、各区导语、SE 卡片、按钮、CTA 用해요체。要点、图注、alt、规格清单、表格用名词结尾。系统提示（`langFallbackNote`、`langSuggest`、`notfound`）用해요체。同一段落没有混用。
- **手势**：功能名「오른쪽 스와이프 번역」，按 X4 取 `右滑翻译` 键的值，不用祈使句「번역하려면 스와이프하세요」；句子里写「오른쪽으로 밀면」或「스와이프」。双击统一写「두 번 탭」，功能名「두 번 탭하여 찾기」。全文没有汉字（X3）。
- **回译**：没有发现事实偏差。与 en 的差异都有规则依据：D2 首屏不写价格；§7.8 full 模式要写"界面含韩语"；截图说明标注英文界面；关键词改写。见 §5.2。
- **第二模型互检**：已完成（Claude Sonnet，只读）。结论是读起来像韩国本土的 App 官网。31 条意见中：采纳 23 条（其中 2 条部分采纳），6 条说明理由后未采纳，2 条只是备注（§7）。
- **仍要处理**：
  - 外部母语审校（R36）；
  - 在真实仓库生成 `home-ko` OG 图，否则构建报 D-23；
  - demo 模板对 ko 拼接译文时句间没有空格，本稿先用一个尾随空格临时处理（§9-2）。

## 1. 关键词落点（title / H1 / description 用了哪些主词）

| 位置 | ko 文案 | 承载的关键词（文档 03 §2.2 ko 表） |
|---|---|---|
| `meta.title` | WordByWord: 아이폰 웹페이지 번역 앱 \| 원문·번역 같이 보기 | 品牌位 WordByWord 在首；**K1 主词「아이폰 웹페이지 번역 앱」原样**；K1 次词「원문·번역 같이 보기」；titleMust「아이폰」「웹페이지」「번역」「앱」全部命中；primaryTokens「웹페이지」「앱」命中；没有 how-to 句式（방법 / 하는 법） |
| `meta.description` | WordByWord는 외국어 공부용 iPhone·iPad 웹페이지 번역 앱입니다. 문단을 오른쪽으로 밀면 번역이 원문 아래에 나오고, 단어를 두 번 탭하면 AI가 문맥에 맞는 뜻을 알려 줍니다. 무료입니다. | 受众「외국어 공부용」（R39）；K1 次词「웹페이지 번역 앱」；K1 动作 + 结果「문단을 오른쪽으로 밀면 번역이 원문 아래에」落在前半；K2「AI」「문맥에 맞는 뜻」（次词 문맥 단어 뜻）；平台词 iPhone·iPad；「무료」。开头用"WordByWord는 …앱입니다"的定义式，代替"内置浏览器"的写法（文档 03 §3.2 允许，与 §3.9 草案一致） |
| `hero.title`（H1） | [[웹페이지]] 문단을 오른쪽으로 밀면 번역이 바로 아래에 나와요. | K1 核心名词「웹페이지」（荧光笔，4 字）；动作写到"段落"一级「문단을 오른쪽으로 밀면」；结果「번역이 바로 아래에」；不暗示整页（R46） |
| `hero.eyebrow` | WordByWord · 외국어 공부용 웹페이지 읽기 앱 | 品牌 + 定位主词「외국어 공부용 웹페이지 읽기 앱」 |
| `hero.lede` | WordByWord는 웹페이지를 읽으며 외국어를 공부하는 사람을 위한 iPhone·iPad 앱이에요. | 定义句以品牌开头（R27、R39），写明受众 |
| `featuresIntro.title`（H2） | 오른쪽으로 밀면 번역, 두 번 탭하면 AI 사전 — 내가 읽는 웹페이지에서 | K1 动作 + **K2 主词「AI 사전」** + 「웹페이지」。写"내가 읽는"，不写"任何网页"（PRO-16） |
| 功能 H3 | 见 §5.1 | K1「오른쪽 스와이프 번역」「원문 바로 아래」；K2「AI 사전」「문맥에 맞는 뜻」；K9「X(트위터) 게시물」「원문과 번역」；K5「청크 추출」「Action Flow(문장 동작 흐름)」，带「영어 문장」限定（R83）；K3「AI 읽어주기」；K4「AI 문장 구조 분석」「긴 문장」；K7「클라우드 / 기기 내 번역」；K6「번역 기록과 단어 찾기 기록」 |
| `languages.title`（H2） | 영어가 아닌 웹페이지도 21개 언어로 번역해요 | K8「21개 언어로 번역」（数字是占位符） |
| `pricing.title`（H2） | 매일 무료, 더 많이 읽을 땐 Plus로 업그레이드 | K10「무료」+ Plus |
| FAQ 问句 | 웹페이지 전체를 한 번에 번역할 수 있나요? / … 하루 무료 사용량은 얼마인가요? / WordByWord로 X(트위터)도 … / … 직역하는 번역기인가요? | 长尾"整页翻译"；K10 次词「하루 무료 사용량」；K9「트위터」；P5「word by word」→「직역」 |

## 2. 品牌位、语体、手势写法、SE 模式

- **品牌位**：「WordByWord」。韩区 App Store 名就是 WordByWord，副标题是「스와이프 번역, AI 해설」（研究 05 §2.1），已写进 `meta.appStoreName` / `appStoreSubtitle`。title 以品牌开头。「아이폰」只用在 title 和 seo 里，其余地方都写「iPhone」（文档 03 表 C：ko 的本地写法已经在 title 里）。
- **语体**：见 §0。FAQ 问句用「…나요? / …인가요?」。
- **App 叫法**：以下名称都和 `WordByWordPrototype/Localizable.xcstrings` 的 ko 值核对过：
  - 功能与模式名：오른쪽 스와이프 번역、두 번 탭하여 찾기 (AI 의미)、더 많은 정의、청크 추출、문장 동작 흐름、AI 읽기 / 로컬 읽기、클라우드 번역 엔진 / 로컬 엔진、자동 / 단락 / 문장 단위、스와이프 번역 기록、원본 언어 / 대상 언어、북마크；
  - 按钮名（在句中加引号）：‘AI 구문 설명 받기’、‘지금 업그레이드’、‘구매 복원’。
  - Action Flow 按 D3 统一写 App Store 名「Action Flow」，在 H3 和语言段注明 App 内叫法「문장 동작 흐름」。价格表行名按 glossary 写「문장 동작 흐름」。
- **手势**：
  - 句中右滑写「오른쪽으로 밀다」，与 iOS 的「밀어서 잠금 해제」和 SurfEnglish 韩文站的说法一致，有时也写「스와이프」；
  - 双击一律写「두 번 탭」。App 的报错文案里有「더블 탭」，网站不用（§9-5）；
  - 段落：正文写「문단」（文档 03 §3.9 草案的用词）。只有提到 App 的显示方式时才写 App 叫法「단락」。
- **SE 模式**：`seMode('ko') = 'local'`（ko 在 `SIBLING.seLocalePath` 里），即文档 08 的 full 模式。
  - 卡片 ① 渲染，用两条文字链接：
    - `appStoreLinkText`「App Store에서 SurfEnglish 다운로드」，用 Apple 韩文徽章的动词，不含"→"；
    - `linkText`「SurfEnglish로 내 수준에 맞는 영어 뉴스 읽기」，即 SE 核心词短语 + 品牌，语义与 en 完全对应（R76）。链到 `https://surfenglish.app/ko/`，`hreflang="ko"`。
  - H2 以 SurfEnglish 开头。条件句「영어를 공부하고 있나요?」放在 body 第一句（R40）。卖点只写 R41 的三项：分级新闻、复习游戏、从 Safari 分享。
  - `note` 按 §7.8 写「앱 화면은 한국어 포함 {se.uiLanguages}개 언어」（界面含韩语）。
  - FAQ ② 答案用합니다체，互补叙事，链接用品牌锚「SurfEnglish 공식 웹사이트」。
  - 页脚 ④ 用文档 04 §5.5 的定值：「같은 개발자의 다른 앱」、「SurfEnglish: 영어 뉴스 원문·번역」。
  - 没有 `uiNote` / `availability`（这两个键只用于 en-site / no-card 模式）。

## 3. Q1–Q10 逐条结果（文档 08 §7.9）

| # | 结果 | 说明 |
|---|---|---|
| Q1 | ✅ | 纯 JSON，能解析。键与 en 一致：L-1、L-2 0 error；`check.mjs --keys ko` 缺 0、多 0。构建 0 error（OG 图在副本里生成后）。数组 id 和顺序与 en 相同 |
| Q2 | ✅ | 占位符 `{targetLanguages}` `{uiLanguages}` `{minOS}` `{minMacOS}` `{plus.priceUS}` `{se.*}` `{quota.*}` `{n}` `{yearRange}` `{set}` 都保留。`[[ ]]` 只出现在 `hero.title` 和 `meta.ogHeadline`；`**…**` 只在 FAQ `free`；链接 `@about` `@se-site` `@chrome` 都在白名单里。没有写死额度、价格或语言数（L-12 无 W；「10km」只出现在豁免的 X 样张里）。ko 的 CLDR 复数类别只有 other，「개 언어」「회」这类量词不变形，所以不需要复数对象（R62） |
| Q3 | ✅ | title 以品牌开头，含 titleMust 全部词元，K1 是产品 / 品类意图。title、H1、description、`cta.title` 中没有 G1 的 how-to 句式（방법 / 하는 법）。title、H1、description、OG、功能区 H2 中没有 SE 独占词（영어 공부 / 학습 / 뉴스 / 읽기、청크、표현 묶음）。L-9 0 error |
| Q4 | ✅ | `hero.title` 恰好 1 处 `[[웹페이지]]`（4 字，≤ 6）。功能 H3 和 `languages.title` 不加 `[[ ]]`。`hero.lede` 以「WordByWord는」开头，写明受众"边读网页边学外语的人" |
| Q5 | ✅ | 按 §1.1 红线表逐行人工核对：内置浏览器里右滑段落；只在 FAQ `whole-page` 里否定整页翻译；否定 Safari 扩展；不写样式数量；双击带中日韩限制；界面 20 种、译文 21 种语言，源语言自动识别；语块和 Action Flow 只限英文；引擎是 Azure + Google 或 iOS，不写离线；朗读不写"无限 AI"；句法解析免费版有额度；没有生词本；X 只在内置浏览器里用；价格全部用占位符，首屏不写价格（D2）；不需要账号；没有隐私断言；Jinlong 用第三人称；SE 用互补叙事。L-14：claims-lint 0 命中。全部 29 条规则都覆盖到 ko（27 条有 ko 模式，2 条用 `*` 模式），没有"未覆盖"W |
| Q6 | ✅ | kicker 用 App 叫法：「오른쪽 스와이프 번역」（X4 修正）、「두 번 탭하여 찾기」。glossary 的 `required` 5 项全部一致。按钮名照 App 原文引用。L-13 0 error，没有汉字（X3） |
| Q7 | ✅ | 每个 alt 都描述实际的 en 截图（已逐张查看图片），并注明「(영어 인터페이스)」。`gallery.items` 4 张全部显示，图注都写了「영어 인터페이스」。`features[x].alt` 描述社交帖样张，写「(스크린샷 아님)」，不写英文界面。`demo.lookup.word`「end」出现在 `demo.source[1]` 中 |
| Q8 | ✅ | full 模式（§2）。SE 区块没有「업그레이드 / 새로운 / 신규 / 더 빠른 / 더 잘 맞 / 자매 앱」，不写语音卖点，`points[0]` 写成「{se.levels} 레벨로 나뉜…」，不写"from {se.levels}"（PRO-10）。`linkText` 是核心词短语，不是裸域名（R76） |
| Q9 | ✅ | 见 §4，代入占位符后实测 |
| Q10 | ✅ | 没有 `{wbr}`（R61）。按韩语规范空格。没有汉字。不涉及 RTL |
| Q12 | ✅ | 本地预览：1280×800、390×844、375×812、320×700 下都没有横向溢出，标题和按钮没有被裁切，标题在空格处换行（`keep-all`）。390 宽页高 12,122 px（目标 ≤ 13,000）。SE 卡片高：桌面 338 px、390 宽 417 px、320 宽 500 px（上限 420 / 480 / 560）。390×844 首屏 H1 占 3 行，样张译文条顶边在 684 px，首屏可见 |
| Q13 | ✅ | FAQ `devices` 的 `a`（S0）不写扩展名称。`aExtLive` 写名称「WordByWord Translate for Chrome」，并说明只能从该页链接安装。首页任何位置都没有 WordByWord.io（`footer.notAffiliated` 不在首页渲染） |

## 4. 长度实测（占位符代入后；CJK 全角 = wu ÷ 2）

| 键 | 上限（文档 08 §7.6） | 实测 wu | 实测全角 |
|---|---|---|---|
| `meta.title` | ≤ 32 全角 | 57 | 28.5 |
| `meta.description` | 50–90 全角 | 179 | 89.5 |
| `hero.title` | ≤ 32 全角 | 58 | 29 |
| `hero.eyebrow` | ≤ 60wu | 43 | 21.5 |
| `hero.lede` / `ledeShort` | ≤ 70 全角 / ≤ 45 全角 | 82 | 41 |
| `hero.how` | ≤ 180wu | 158 | 79 |
| `hero.platformNote` | ≤ 140wu | 118 | 59 |
| `hero.ctaNote` | ≤ 40wu | 29 | 14.5 |
| `features[engines].text` | ≤ 40 全角 | 78 | 39 |
| `features[display].text` | ≤ 40 全角 | 65 | 32.5 |
| `features[history].text` | ≤ 40 全角 | 62 | 31 |
| `features[devices].text` | ≤ 40 全角 | 75 | 37.5 |
| `languages.title` | ≤ 70wu | 43 | 21.5 |
| `pricing.summary` | ≤ 100wu | 86 | 43 |
| `cta.title` | ≤ 70wu | 52 | 26 |
| `cta.recap` | ≤ 90wu | 73 | 36.5 |
| `sibling.card.title` | ≤ 24 全角 | 43 | 21.5 |
| `sibling.card.body` | ≤ 110 全角 | 191 | 95.5 |
| `sibling.card.linkText` | ≤ 30 全角 | 43 | 21.5 |
| `sibling.card.appStoreLinkText` | ≤ 30 全角 | 34 | 17 |
| `features[x].sample.translation` | ≤ 50 全角 | 59 | 29.5 |
| `nav.downloadShort` | ≤ 10wu | 4 | 2 |

alt 字数（≤ 125）：最长的是 `features[lookup].alt`，86 字。其余 FAQ 问句 ≤ 67wu、答案 ≤ 409wu（上限 120 / 600），功能 H3 ≤ 62wu（上限 70），kicker ≤ 20wu（上限 24），都在范围内。`description` 已经用满（89.5 / 90），以后改动须同时删减别处。

## 5. 回译对照（ko → English，对照 en.json）

### 5.1 对照表

| 键 | ko | 回译 | en 母版 |
|---|---|---|---|
| `meta.title` | WordByWord: 아이폰 웹페이지 번역 앱 \| 원문·번역 같이 보기 | WordByWord: iPhone Web Page Translation App \| See the Original and the Translation Together | WordByWord: Bilingual Web Page Translator App for iPhone |
| `meta.description` | WordByWord는 외국어 공부용 iPhone·iPad 웹페이지 번역 앱입니다. 문단을 오른쪽으로 밀면 번역이 원문 아래에 나오고, 단어를 두 번 탭하면 AI가 문맥에 맞는 뜻을 알려 줍니다. 무료입니다. | WordByWord is an iPhone/iPad web page translation app for studying foreign languages. Swipe a paragraph to the right and the translation appears below the original; double-tap a word and the AI tells you the meaning that fits the context. It's free. | For language learners: swipe a paragraph in the built-in browser and its translation appears below. Double-tap a word for its meaning. Free on iPhone & iPad. |
| `meta.ogHeadline` | 웹페이지를 번역과 함께. [[원문은 그대로.]] | Web pages, with the translation. [[The original stays as it is.]] | Read any web page bilingually. [[Keep the original.]] |
| `meta.ogSubline` | 문단을 오른쪽으로 밀면 번역 · 단어를 두 번 탭하면 문맥 속 뜻 | Swipe a paragraph right for the translation · double-tap a word for its meaning in context | Swipe right on a paragraph · double-tap a word for its meaning in context |
| `hero.title` | [[웹페이지]] 문단을 오른쪽으로 밀면 번역이 바로 아래에 나와요. | Swipe a paragraph of a [[web page]] to the right and its translation appears right below. | Swipe a paragraph on [[any web page]]. Its translation appears right below. |
| `hero.lede` | WordByWord는 웹페이지를 읽으며 외국어를 공부하는 사람을 위한 iPhone·iPad 앱이에요. | WordByWord is an iPhone/iPad app for people who study foreign languages while reading web pages. | WordByWord is a reading assistant for language learners on iPhone and iPad. |
| `hero.how` | 앱의 내장 브라우저로 사이트를 열고 문단을 오른쪽으로 밀면 번역이 원문 바로 아래에 나와요. 단어를 두 번 탭하면 그 문장에서 어떤 뜻으로 쓰였는지 AI가 알려 줘요. | Open a site in the app's built-in browser and swipe a paragraph to the right: the translation appears right below the original. Double-tap a word and the AI tells you what it means in that sentence. | Open a site in its built-in browser and swipe right on a paragraph: the translation appears below it. Double-tap a word for an AI explanation of what it means there. |
| `featuresIntro.title` | 오른쪽으로 밀면 번역, 두 번 탭하면 AI 사전 — 내가 읽는 웹페이지에서 | Swipe right to translate, double-tap for the AI dictionary — on the web pages I read | Swipe to translate, double-tap to look up — on the websites you read |
| `features[swipe].title` | 오른쪽 스와이프 번역: 원문 바로 아래에 번역이 나와요 | Swipe Right Translation: the translation appears right below the original | Swipe to Translate: the translation appears right below the original |
| `features[lookup].title` | 단어를 두 번 탭하면 AI 사전이 문맥에 맞는 뜻을 알려 줘요 | Double-tap a word and the AI dictionary tells you the meaning that fits the context | Double-tap a word for its AI meaning in context |
| `features[x].title` | X(트위터) 게시물도 내장 브라우저에서 원문과 번역을 함께 읽어요 | Read X (Twitter) posts too, original and translation together, in the built-in browser | Read X (Twitter) posts bilingually in the built-in browser |
| `features[chunks].title` | 영어 문장을 위한 청크 추출과 Action Flow(문장 동작 흐름) | Chunk Extraction and Action Flow (Sentence Action Flow) for English sentences | Chunk Extraction and Action Flow, for English sentences |
| `features[speech].title` | AI 읽어주기, 또는 바로 재생되는 iOS 내장 음성 | AI read-aloud, or built-in iOS voices that play right away | AI read-aloud, or fast on-device iOS voices |
| `features[syntax].title` | 긴 문장을 위한 AI 문장 구조 분석 | AI sentence structure analysis for long sentences | AI sentence structure analysis for long sentences |
| `features[engines].title` | 클라우드 번역 또는 기기 내 번역 | Cloud translation or on-device translation | Cloud or on-device translation |
| `features[display].title` | 번역 표시 방식과 스타일 | Translation display mode and style | Translation layout and style |
| `features[history].title` | 번역 기록과 단어 찾기 기록 | Translation history and word-lookup history | Translation and lookup history |
| `features[devices].title` | iPhone·iPad·Mac·Vision Pro | iPhone, iPad, Mac, Vision Pro | iPhone, iPad, Mac and Vision Pro |
| `faq[what-is].q` | WordByWord는 무엇인가요? | What is WordByWord? | What is WordByWord? |
| `faq[whole-page].q` | 웹페이지 전체를 한 번에 번역할 수 있나요? | Can it translate a whole web page at once? | Can WordByWord translate a whole web page at once? |
| `faq[safari].q` | Safari나 다른 앱 안에서도 쓸 수 있나요? | Can I use it in Safari or inside other apps? | Does it work in Safari or inside other apps? |
| `faq[word-by-word].q` | WordByWord는 단어를 하나씩 직역하는 번역기인가요? | Is WordByWord a translator that literally translates words one at a time? | Is WordByWord a word-by-word translator? |
| `faq[x].q` | WordByWord로 X(트위터)도 읽을 수 있나요? | Can I read X (Twitter) with WordByWord too? | Can I read X (Twitter) with WordByWord? |
| `faq[languages].q` | WordByWord는 어떤 언어를 지원하나요? | Which languages does WordByWord support? | Which languages does WordByWord support? |
| `faq[free].q` | WordByWord는 무료인가요? 하루 무료 사용량은 얼마인가요? | Is WordByWord free? How big is the free daily allowance? | Is WordByWord free? What are the daily limits? |
| `faq[engines].q` | 어떤 번역 엔진을 쓰나요? | Which translation engine does it use? | Which translation engine does it use? |
| `faq[account].q` | WordByWord를 쓰려면 계정이 필요한가요? | Do I need an account to use WordByWord? | Do I need an account to use WordByWord? |
| `faq[restore].q` | 새 iPhone이나 iPad에서 WordByWord Plus를 다시 쓰려면 어떻게 하나요? | What do I do to use WordByWord Plus again on a new iPhone or iPad? | How do I get WordByWord Plus back on a new iPhone or iPad? |
| `faq[android].q` | 안드로이드 버전도 있나요? | Is there an Android version too? | Is there an Android version? |
| `faq[english-learner].q` | 영어를 공부하고 있어요. SurfEnglish도 써 볼 만한가요? | I'm studying English. Is SurfEnglish worth trying too? | I’m learning English. Is SurfEnglish worth trying too? |
| `faq[devices].q` | iPad나 Mac, PC 브라우저에서도 쓸 수 있나요? | Can I use it on an iPad, a Mac or in a PC (desktop) browser? | Does WordByWord work on iPad, Mac or a desktop browser? |
| `pricing.summary` | 이 한도 안에서는 모든 기능이 무료예요. Plus는 미국 기준 월 {plus.priceUS}에 한도를 높여 줘요. | Within these limits every feature is free. Plus raises the limits for US$3.99 a month (US price). | Every feature is free within these limits; Plus raises them for {plus.priceUS}/month (US). |
| `sibling.card.eyebrow` | WordByWord 개발자가 만든 앱 | An app made by the developer of WordByWord | From the developer of WordByWord |
| `sibling.card.title` | SurfEnglish: 내 수준에 맞는 영어 뉴스, 매일 | SurfEnglish: English news at your level, every day | SurfEnglish: daily English news at your level |
| `sibling.card.body` | 영어를 공부하고 있나요? 읽고 싶은 페이지는 계속 WordByWord로 읽으면서 SurfEnglish도 써 보세요. 매일 올라오는 레벨별 영어 뉴스와 복습 게임을 익숙한 스와이프와 두 번 탭 그대로 이용할 수 있어요. | Studying English? Keep reading the pages you want in WordByWord, and try SurfEnglish too. You get daily English news by level and review games with the same familiar swipe and double-tap. | Learning English? Keep reading any page you like in WordByWord, and try SurfEnglish too: daily English news by level and review games, with the same swipe and double-tap. |
| `sibling.card.points` | {se.levels} 레벨로 나뉜 실제 영어 뉴스 / 읽은 내용으로 만드는 복습 게임 / Safari에서 영어 기사를 SurfEnglish로 공유 | Real English news sorted into levels A1–C1 / Review games made from what you've read / Share English articles from Safari to SurfEnglish | Real English news at levels {se.levels} / Review games built from what you’ve read / Share English articles from Safari to the app |
| `sibling.card.note` | 무료로 시작 · iPhone / iPad · 앱 화면은 한국어 포함 {se.uiLanguages}개 언어 · {se.targetLanguages}개 언어로 번역 | Free to start · iPhone / iPad · App interface in 12 languages, Korean included · Translates into 21 languages | Free to start · iPhone and iPad · App in {se.uiLanguages} languages · Translations into {se.targetLanguages} |
| `sibling.card.linkText` | SurfEnglish로 내 수준에 맞는 영어 뉴스 읽기 | Read English news at your level with SurfEnglish | Read English news at your level with SurfEnglish |
| `sibling.card.appStoreLinkText` | App Store에서 SurfEnglish 다운로드 | Download SurfEnglish on the App Store | Get SurfEnglish on the App Store |
| `sibling.card.shotAlt` | SurfEnglish 게임 화면(영어 인터페이스): 저장한 문장과 단어로 플레이할 수 있는 Sentence Builder와 Word Raid | SurfEnglish Games screen (English interface): Sentence Builder and Word Raid, playable with your saved sentences and words | SurfEnglish Games screen: Sentence Builder and Word Raid, ready to play with saved sentences and words |
| `sibling.card.shotCaption` | SurfEnglish 스크린샷(영어 인터페이스) | SurfEnglish screenshot (English interface) | SurfEnglish screenshot (English interface) |
| `sibling.footer.heading` / `linkText` | 같은 개발자의 다른 앱 / SurfEnglish: 영어 뉴스 원문·번역 | Other apps from the same developer / SurfEnglish: English News, Original & Translation | More from the maker / SurfEnglish: Bilingual News |
| `cta.title` | iPhone에서 외국어 웹페이지를 번역과 함께 읽어 보세요 | Try reading foreign-language web pages together with their translation on iPhone | Start reading websites bilingually on iPhone |
| `cta.recap` | 오른쪽 스와이프 번역 · 두 번 탭해 단어 찾기 · 읽어주기 · {targetLanguages}개 언어로 번역 | Swipe Right Translation · Double-tap to look up words · Read aloud · Translation into 21 languages | Swipe to translate · Double-tap to look up · Read aloud · {targetLanguages} languages |

### 5.2 与 en 的差异（事实偏差：0）

1. `meta.description` 没有写 "in the built-in browser"，改用定义式开头「WordByWord는 …앱입니다」（文档 03 §3.2 允许的第三种写法；与 §3.9 ko 草案逐字一致）；多写了「AI」「문맥」，属实（F15）。
2. `hero.title`、`meta.ogHeadline` 没有译出 "any"（§3.9 草案就是这样），事实不变。
3. `hero.lede` 把 "reading assistant" 写成「앱」：沿用文档 03 §3.5 的 ko 草案，避免「도우미」（旧站的「스마트 외국어 학습 도우미」已按文档 08 §8.1 删除）。
4. `hero.platformNote`（不在回译清单里）不写美区价格，按 D2 只说「Plus는 월간 구독」。
5. `sibling.card.note` 多了「한국어 포함」：这是文档 08 §7.8 对 full 模式的要求（ja「日本語を含む」、zh-Hans「支持简体中文等」相同）；SE 的 App 界面有韩语（SE 官网 ko 版，`SIBLING.seLocalePath`）。
6. `sibling.card.points[2]` 把 "the app" 写成「SurfEnglish」，免得被读成 WordByWord 有分享扩展。
7. `gallery.items[languageList].alt` 在 en 列出的 5 种语言后加了「한국어」：截图里确实有 "Korean (한국어)"（已查看 `assets/img/shot/en/language-list-540.jpg`）。
8. 所有 alt、图注、`common.screenshotLabel` 都标注「영어 인터페이스」（§7.1-5）；`features[speech].alt` 写成"번역한 스페인어 문단을 화면 아래쪽 읽어주기 플레이어로 듣는 모습"，与节选图（播放器里显示西语原句）一致。
9. `features[speech].title` 把 "fast" 写成「바로 재생되는」（马上开始播放），与 ja「すぐに再生できる」同一理解。
10. 链接文字给英文页加了「(영어)」（`@about`、`@chrome`），`aExtLive` 句末括注「안내 페이지는 영어」。zh-Hant 也这样做了，ja / zh-Hans 没有（§9-3）。

## 6. 没把握的措辞（12 处，附回译与备选）

| # | 键 | 现稿（回译） | 疑点 | 备选（回译） |
|---|---|---|---|---|
| 1 | `meta.ogHeadline` | 웹페이지를 번역과 함께. [[원문은 그대로.]]（Web pages, with the translation. The original stays as it is.） | 前半句省略动词，属于口号体；是为 64 px × 2 行的版面选的 | 웹페이지를 두 언어로 읽어요. [[원문은 그대로.]]（Read web pages in two languages. The original stays as it is.）——在副本里实测 54 px × 2 行，也能放下 |
| 2 | `hero.lede`、`footer.tagline` | …웹페이지를 읽으며 외국어를 공부하는 사람을 위한 iPhone·iPad 앱이에요（an app for people who study foreign languages while reading web pages） | 把 en 的 "reading assistant" 写成"앱"；文档 03 §3.5 草案原文是「외국어를 공부하며 웹을 읽는 사람」，「웹을 읽다」不太顺，改了语序 | WordByWord는 외국어 학습자를 위한 iPhone·iPad 읽기 도우미예요.（…a reading assistant for foreign-language learners）——更贴 en，但「도우미」容易让人想起旧站的「스마트 … 도우미」 |
| 3 | `featuresIntro.title` | 오른쪽으로 밀면 번역, 두 번 탭하면 AI 사전 — 내가 읽는 웹페이지에서（Swipe right: translation; double-tap: AI dictionary — on the web pages I read） | 「AI 사전」作结果名词，属于紧凑的标题语法；「내가」略带第一人称 | 오른쪽으로 밀어 번역하고 두 번 탭해 뜻을 찾아요 — 지금 읽는 웹페이지에서（Swipe right to translate, double-tap to find the meaning — on the page you are reading）——但丢了 K2 主词 |
| 4 | `demo.translation`、`features[x].sample.translation` | 해라체：…문을 연다. / …책을 읽게 된다. / 첫 10km 달리기를 막 끝냈다. 느렸지만 한 번도 멈추지 않았다. | 样张是"文章 / 帖子"的译文，所以用书面体，与站点自己的해요체不同 | 해요체：…문을 열어요. / …읽게 돼요. / …끝냈어요. …않았어요. |
| 5 | `features[speech].text` | 내려받아 둔 Premium 또는 Enhanced 음성（downloaded Premium or Enhanced voices） | 取自 App 自己的韩文文案（`local_speech_engine_*`）；iOS 韩文设置里可能显示为「프리미엄」「향상된 음질」 | 내려받아 둔 프리미엄 또는 향상된 음질의 음성 |
| 6 | `features[speech].title` | AI 읽어주기, 또는 바로 재생되는 iOS 내장 음성（…built-in iOS voices that play right away） | en 的 "fast" 可以指响应快，也可以指语速快；App 描述为「빠른 속도」 | AI 읽어주기, 또는 빠른 iOS 기기 내 음성（…fast on-device iOS voices） |
| 7 | `features[x].kicker` | X(옛 트위터)（X, formerly Twitter） | 韩国媒体「옛 트위터」「구 트위터」两种都常见 | X(구 트위터) |
| 8 | 全文 | 正文「문단」，显示方式「단락」 | 同一个"段落"有两种写法：「단락」是 App 的模式名，「문단」是 §3.9 草案和 SE 韩文站的用词 | 全部统一为「문단」，只在引用设置名时加引号写‘단락’ |
| 9 | `faq[word-by-word].q` | …단어를 하나씩 직역하는 번역기인가요?（…a translator that literally translates words one at a time?） | 韩国用户搜 "word by word" 时可能用「word by word 번역」「단어별 번역」「축자 번역」 | WordByWord는 단어 단위로 번역하는 앱인가요?（Does WordByWord translate word by word?） |
| 10 | `faq[devices].q/a` | PC 브라우저（PC browser） | 韩国网络用语里「PC」泛指电脑端（「PC 버전」）；第二模型认为容易联想到 Windows，建议用「데스크톱」 | 컴퓨터 브라우저 / 데스크톱 브라우저 |
| 11 | `pricing.title` | 매일 무료, 더 많이 읽을 땐 Plus로 업그레이드（Free every day; upgrade to Plus when you read more） | 前半是名词短句。另一种更顺的写法几乎就是 SE 韩文站的 H2「매일 무료. 많이 읽는다면 Plus.」，为避免两站重复没有用 | 매일 무료로 쓰고, 많이 읽을 땐 Plus로（Use it free every day; go Plus when you read a lot） |
| 12 | `sibling.card.title` | SurfEnglish: 내 수준에 맞는 영어 뉴스, 매일（English news at your level, every day） | 副词「매일」放在句末，是标题体 | SurfEnglish: 매일 읽는 내 수준의 영어 뉴스（English news at my level, read daily）——手机上会断成「…매일 / 읽는…」 |

## 7. 第二模型互检记录（R36 "双模型互检"）

- 审校方：Claude Sonnet，单独运行，只读。输入是 ko.json、en.json 和本简报的规则（语体、App 叫法、禁用词、长度上限）。
- 总评："Yes, it reads like a native Korean app website."——语体控制严格，App 叫法与韩文界面一致，没有营销腔和汉字，助词和空格干净；残留的翻译腔集中在几个标题上。
- **已采纳**（23 条，含 2 条部分采纳）：
  - `features[speech].alt` 改为与 en 更对应、又符合画面的写法；
  - `hero.how`、`features[swipe].text`、FAQ `what-is` 写明「앱의 내장 브라우저」，免得被理解成 iOS 自带浏览器；同时改掉生硬的「-므로」；
  - `features[lookup].title` 补宾语「단어를」；
  - `features[x].title`、`cta.title` 去掉「원문과 번역으로 읽다」这个直译；
  - `features[speech].title`「빠르게 재생되는」→「바로 재생되는 iOS 내장 음성」；
  - `languages.title` 改成一个完整的句子；
  - `sibling.card.title` 去掉句末悬空的「를」；
  - `sibling.card.body` 修正「뉴스를 쓰다」的搭配；
  - `sibling.card.points[2]` 写明 SurfEnglish；
  - FAQ `languages` 理顺主语；
  - FAQ `engines`：用 App 叫法「AI 구문 설명」；「언어 리소스」→「언어 데이터」；问句改为「어떤 번역 엔진을 쓰나요?」；
  - FAQ `devices.aExtLive`：统一「PC」，删去 en 没有的「반드시」，结尾改为합니다체，并注明是英文页；
  - `pricing.table.noLimit`「제한 없음」→「하루 제한 없음」（对应 en "No daily limit"，避免读成"无限"）；
  - `features[chunks].text` 删去重复的括注；
  - `features[syntax].text` 加「그러면」；
  - FAQ `free` 的价格括注改成完整的합니다체句子；
  - `gallery.items[languages].alt` 统一写「미국 영어」；
  - FAQ `what-is` 去掉「개발자 … 개발」的重复。
- **未采纳**（6 条，附理由）：
  - ① `sibling.card.note` 删「한국어 포함」：这是文档 08 §7.8 full 模式的要求；
  - ② languageList alt 删「한국어」：截图里看得到 "Korean (한국어)"；
  - ③ `meta.appStoreName` 改为 en 值：韩区店名就是 WordByWord（研究 05 §2.1）；
  - ④ FAQ 链接「공식」删除：ja / zh-Hans 都写了「公式 / 官网」，保持一致；
  - ⑤ `featuresIntro.title`「내가 읽는」→「지금 읽는」：列入 §6 第 3 条，留给母语审校；
  - ⑥ `meta.ogHeadline` 补动词「읽어요」：会掉到 54 px，保留 64 px × 2 行的版本，列入 §6 第 1 条。
- **部分采纳**（2 条）：
  - devices 的「PC」改「데스크톱」：只统一了 `aExtLive` 的「PC」写法，问句和 `a` 保留「PC 브라우저」（韩国网络用语里「PC」泛指电脑端），列入 §6 第 10 条；
  - 括注后的助词：`features[chunks].text` 删去重复括注，`languages.limits[1]` 保留括注——语言区是该词在这一屏首次出现，括注有用；括号后的助词按括号前的词选，语法上没有问题。
- **备注**（2 条，无须修改）：`meta.description` 已用满 90 全角；"AI 읽어주기 / AI 읽기 / AI 발음"等术语分工沿用 en 的结构。

## 8. 交付前的额外核对

- 与 App 的 ko 字符串核对过（`WordByWordPrototype/Localizable.xcstrings`）：
  - 书签在 App 里叫「북마크」，正文据此用「북마크」，不用 Safari 的「책갈피」；
  - 显示模式「자동 / 단락 / 문장 단위」、引擎「클라우드 번역 엔진 / 로컬 엔진」、语言「원본 언어 / 대상 언어」与 App 一致；
  - 结果显示「자동으로 표시 / 수동으로 표시」对应要点「번역을 자동으로 표시하거나 탭해서 보기」。
- SurfEnglish 韩文站（本地 `SurfEnglishWebsite/src/locales/ko.json`）的说法只作参考：「오른쪽으로 밀기」「두 번 탭」「레벨」「대역 읽기」。
  - 「대역」没有用：文档 03 §2.2 指出它会被「대역폭」占掉，而且是 SE 的核心词；
  - SE 的 H2「매일 무료. 많이 읽는다면 Plus.」也没有照搬，避免两站标题重复。
- OG 卡片（副本）：「웹페이지를 번역과 함께.」/「원문은 그대로.」，64 px × 2 行；副标题 30 px × 2 行；平台行「iPhone·iPad·Mac·Vision Pro」。

## 9. 需要负责人决定的问题

1. **OG 图（真实仓库构建会失败）**：按简报，没有把 OG 文件复制进真实仓库。ko.json 进库后，真实仓库构建会报 `D-23 home-ko: no OG image`，直到运行 `node scripts/og.mjs --only home-ko`。我的副本里渲染通过：标题 64 px × 2 行，副标题 30 px × 2 行，130.7 KB，没有版式问题。
2. **demo 译文的句间空格（模板问题）**：`src/templates/partials/demo.mjs` 第 40 行对 `script === 'cjk'` 的 locale 用空串拼接 `demo.translation[]`。中日文这样是对的，但韩语句子之间要有空格，否则会渲染成「…문을 연다.사람들은…」。本稿临时在 `demo.translation[0]` 末尾加了一个空格（渲染正确，L-* 不报错）。建议把模板改为 ko 用空格拼接，例如 `join(cjk && route.locale.code !== 'ko' ? '' : ' ')`。改模板后这个尾随空格可以删掉，留着也不影响（HTML 会合并空白）。
3. **"英文界面 / 英文页面"的标注是否全站统一**：
   - `common.screenshotLabel` / `screenshotExcerptLabel` 加了「· 영어 인터페이스」（en 母版只有 "iPhone screenshot"）；
   - 指向英文页的链接加了「(영어)」。
   - zh-Hant 也做了同样的处理（「（英文介面）」「（英文頁面）」），ja / zh-Hans 有本地截图或没有标注。建议在 17 个回落 en 截图的 locale 中统一。
4. **glossary 补充（建议，未改动 `src/data/glossary/ko.json`）**：现有 `required` 只有 5 项。可以照 en / ja 的做法锁定本稿用到的 App 叫法：

```json
"required": {
  "features[lookup].kicker": "두 번 탭하여 찾기", "features[x].kicker": "X(옛 트위터)", "features[chunks].kicker": "영어 페이지",
  "features[speech].kicker": "읽어주기", "features[syntax].kicker": "문장 구조", "features[engines].kicker": "번역 엔진",
  "features[display].kicker": "표시", "features[history].kicker": "기록", "features[devices].kicker": "기기",
  "features[chunks].sample.flowLabel": "Action Flow",
  "pricing.table.rows.cloudSwipe": "오른쪽 스와이프 번역 · 클라우드 엔진", "pricing.table.rows.localSwipe": "오른쪽 스와이프 번역 · 로컬 엔진",
  "pricing.table.rows.lookup": "두 번 탭하여 찾기(AI 의미)", "pricing.table.rows.lookupSpeech": "AI 발음 · 단어",
  "pricing.table.rows.swipeSpeech": "AI 발음 · 문장", "pricing.table.rows.localVoice": "iOS 음성(로컬 읽기)",
  "pricing.table.rows.syntax": "AI 구문 설명"
},
"contains": {
  "faq.items[restore].a": ["지금 업그레이드", "구매 복원"], "features[syntax].text": ["AI 구문 설명 받기", "스와이프 번역 기록"],
  "features[speech].text": ["AI 읽기", "로컬 읽기"], "features[chunks].text": ["청크 추출", "Action Flow"],
  "features[lookup].bullets[2]": ["더 많은 정의"]
}
```

   另外建议在 `banned` 里加两项：`{ "pattern": "더블 ?탭", "regex": true, "use": "두 번 탭" }`（文档 08 §7.3 的双击写法）和 `{ "pattern": "검색 기록", "use": "번역 기록 / 단어 찾기 기록" }`（I18-12）。本稿两项都没有命中。
5. **报给 App 侧的 ko 字符串问题**（§7.2.2 规则 ③，网站已按修正写法处理）：
   - X3：`tip_swipe_to_translate` 里有汉字「任意의」；
   - X4：`daily_sentence_translation_limit` 是祈使句；
   - 新发现：`double_tap_not_supported_message` 写「더블 탭 번역」，与功能名「두 번 탭하여 찾기」不一致，而且把查词叫成了"翻译"；
   - 新发现：`navigationTitle_history_detail`「검색 기록 상세」用了「검색 기록」，韩语里这通常指浏览器搜索记录（I18-12）；
   - 小问题：`word_meaning_lookup_title`「두 번 탭하여 찾기 (AI 의미)」括号前有空格，网站价格表按韩文书写规范写成「두 번 탭하여 찾기(AI 의미)」。
6. **母语审校重点**（R36 / H7；ko 需要外部审校）：
   - §6 的 12 处；
   - 系统提示用해요체（文档只规定了 description / FAQ 答案 / hero / 卡片 / 按钮）；
   - 样张译文用해라체；
   - FAQ 问句的关键词选择（「직역」「하루 무료 사용량」「PC 브라우저」）。
7. **（备忘）校验器与文档长度上限不一致**：L-8 对 `hero.how` 用 n 220（CJK 110 全角），文档 08 §7.6 是 180wu（90 全角），本稿按更严的 79 全角写。`common.langFallbackNote` 被 L-8 跳过（en 本身 81 字符），本稿是 41 全角。都不影响本稿通过，只供统一口径时参考。
