# M3 · vi（Tiếng Việt）首页文案 QA 记录

| 项 | 内容 |
|---|---|
| locale | vi（T3：按 R36 以"LLM 翻译 + 回译 + 术语表 lint + 关键词检查"上线，上线后补母语审校） |
| 交付 | `src/locales/vi.json`（新建）；`src/data/glossary/vi.json`（新建，§7.2.5 格式：文档 08 §7.2.1 表 T-A…T-E 的 vi 列，逐条对照 `WordByWordPrototype/Localizable.xcstrings` 的 vi 值核过，加 §7.2.2 规则 ①–③ 与 X9）；`docs/redesign-2026/ops/m3/vi-lint.json`（claims-lint / keyword-map 的 vi 补丁提案，未合并）；本记录 |
| 依据 | 文档 08 §7（7.1–7.10）、§1.1、§1.4、§1.5、§2 en 母版；文档 03 §1.4、§1.5、§1.6、§2.3（vi 行，表 A / B / C）、§3.1–§3.9（vi 草案）；文档 04 §4、§5.1、§5.5、§5.7（vi 的页脚、linkText 种子、T1–T11）；裁定 R36、R39–R43、R46、R52、R61–R65、R71、R75–R78、R83、R84；`ja.json` / `zh-Hans.json` 作结构参照；`_legacy/vi.json`、`sibling-tm.json` 只作术语参考（带 warnings 的写法与事实一律未用：quét、đối chiếu từng câu、trợ lý thông minh、hơn 20 cặp ngôn ngữ、nhóm theo ngày、phát âm AI không giới hạn、"Mới · Từ đội ngũ…" 等） |
| 称谓与用语 | bạn；全国通用的书面越南语；引号 “ ”；App 的功能名、按钮名照 App 的 vi 字符串（含 App 自己的英文式大小写，如 “Vuốt để Dịch”、“Tự Động / Đoạn Văn / Từng Câu”） |
| 工作方式 | 私有副本 `…/scratchpad/wbw-m3-vi/` 起草与渲染检查；最终验证在按真实仓库当前状态重新 rsync 的 `…/scratchpad/wbw-m3-vi-final/` 里做。OG 图只在副本里生成，**没有**复制进真实仓库；lint 词表只在副本里合入自测，测完已还原，并与真实仓库逐字节比对一致。另请一个只读的第二模型做了独立通读（§5 末尾） |
| 日期 | 2026-10-06 |

## 0. 摘要

1. 键与 en 完全一致（`check.mjs --keys vi`：0 缺、0 多；与 ja 一样不提供 `about.*`、`chromeExtension.*`、`legal.*`，提供 `notfound.*`）。最终验证用的新副本 = 真实仓库 HEAD `3d520ab`（含 54afac8 价格表换行、bb689eb 数据模式 Unicode 化、78b1856 解析修正；已发布 en / zh-Hans / zh-Hant / ja / ko / es / fr / pt-BR / de / it / nl / pl / uk / ru / tr，工作区干净）+ vi 的两个文件，在副本里生成 `home-vi` OG 后：`node build.mjs` 与 `--pseudo` 均 **0 error**（23 页），`node scripts/check.mjs` 0 error / 0 warning，`node --test scripts/tests/*.test.mjs` **62/62** 通过。
2. vi 自己的 warning 只有三类：L-4 两条 review（`meta.appStoreSubtitle` 照录越南店面显示的英文副标题、`common.menu` = "Menu"，§6-5 / §6-6）+ 6 条文档 08 §1.5 列为正常的照抄值；L-14（25 条规则没有 vi 写法）与 L-9（没有 vi 的 G1 how-to 模式）来自数据文件缺 vi 词表——我按简报没改数据文件，补丁见 `vi-lint.json`（附录 A），在副本里合入后这两条消失、全站仍 0 error、测试 62/62。**vi 没有 L-8 warning**（kicker、alt、规格清单等全部在上限内）。
3. title 逐字采用文档 03 §3.9 vi 草案（56 字符）；description 按文档 08 §7.3 把草案的「Chạm hai lần」改成 App 用词「Nhấn đúp」，「một đoạn」改成「một đoạn văn」，结尾「Miễn phí trên iPhone và iPad.」（160 字符）；H1 在草案基础上把「đoạn」改「đoạn văn」、逗号改成越南语常用的结果连接词「là」，荧光笔标在 K1 核心名词「trang web」上（74 字符）。
4. 手势：句中「vuốt sang phải」（App `tip_swipe_to_translate` 原文）、「nhấn đúp」（App `tip_double_tap_context_meaning` 原文；文档 08 §7.3 已把文档 03 草案的「chạm hai lần」改掉），单击写「nhấn」（与 App 一致）。glossary 把「chạm hai lần」、鼠标说法「nhấp / bấm đúp」、左滑、单击查词列为禁用。
5. 复数：vi 的 CLDR 复数类别只有 `other`，名词没有数的变化，按文档 08 §1.4（"en、ja、zh-Hans、zh-Hant、ko、vi、th、id 不需要复数对象"）不写复数对象，与 ja / zh-Hans / zh-Hant / ko 相同（§2 Q2、§6-7）。
6. SurfEnglish：`seMode('vi')` = local（文档 08 §7.8 的 full 模式）。卡片、FAQ ②、页脚 ④ 都链 `https://surfenglish.app/vi/`（`hreflang="vi"`）；`note` 写"界面 12 种语言，含越南语"（T6）；`linkText` 用文档 04 §5.7 的 vi 种子「Đọc tin tiếng Anh song ngữ — SurfEnglish」；页脚取文档 04 §5.5 的 vi 定值。
7. 英文界面：5 处截图 alt、4 条画廊图注与 alt、`common.screenshotLabel` / `screenshotExcerptLabel`、OG alt、SE 截图 alt 与图注都写「(giao diện tiếng Anh)」；`features[x].alt` 描述社交帖样张并注明「không phải ảnh chụp màn hình」。指向英文页的富文本链接（`@about`、`@chrome` 的 `a` 与 `aExtLive`）在链接文字里加「(tiếng Anh)」；`@se-site` 指向 SE 越南语页，不加。
8. OG（只在副本）：`node scripts/og.mjs --only home-vi` 一次通过：标题 56 px × 2 行、副标题 30 px × 2 行、q82、146.0 KB；越南语叠加声调在 OG 字体里渲染正常（已目视检查）。
9. 渲染（`scripts/serve.mjs --port 4607` + headless Chrome，外部请求全部拦截）：1280 / 900 / 768 / 560 / 414 / 390 / 375 / 360 / 320 px 都没有横向溢出，价格表在所有宽度都不需要横向滚动；SE 卡片 361 / 379 / 312 / 412 / 419 / 440 / 440 / 462 / 540 px（上限 420 / 420 / 480 / 480 / 480 / 480 / 480 / 480 / 560）；390 px 整页 **12,961 px**（目标 ≤ 13,000；同副本 en 12,879、it 12,955、tr 13,025、pt-BR 13,104、es 13,145、pl 13,459、uk 13,621、de 13,628、ru 13,865）；样张红色译文条顶端 735 px（390 × 844）/ 733 px（375 × 812），与 en 相同。
10. 需要负责人决定的事见 §6，主要是：OG 图（D-23）、是否合入 vi lint 词表、App 的越南语字符串问题（X9 之外又发现 6 处）、SE 页脚店名与研究 05 的出入、`meta.appStoreSubtitle`、页面高度目标随语言数增长。

## 1. 关键词落点（title / H1 / description 用了哪些主词）

| 位置 | 文案 | 承载的关键词 | 长度 |
|---|---|---|---|
| `meta.title` | WordByWord: ứng dụng dịch trang web song ngữ trên iPhone | 品牌位 WordByWord（VN 店面名是 "WordByWord Translate"，但文档 03 §1.5 只让 zh-Hant / ru 用店名作品牌位）；**K1 主词「ứng dụng dịch trang web song ngữ trên iPhone」逐字完整**（文档 03 §2.3 表 A、文档 08 §7.3）；`seo.titleMust` = iPhone / trang web / ứng dụng 全部命中（文档 03 §3.8：iPhone + K1 核心名词 + §1.6 产品词）；`primaryTokens.home.vi`（iPhone、ứng dụng）命中；无 how-to 句式 | 56 / 60 |
| `meta.description` | Cho người học ngoại ngữ: trong WordByWord, vuốt một đoạn văn sang phải, bản dịch hiện ngay bên dưới. Nhấn đúp vào từ để xem nghĩa. Miễn phí trên iPhone và iPad. | 受众词「người học ngoại ngữ」（表 C，R39；也是文档 03 §1.4 列出的必须放行的 vi 通用学习词）；K1 动作 + 结果在前一半；「trong WordByWord」（文档 03 §3.2 允许，代替"内置浏览器"）；K2 动作 → 结果；平台 + 免费收尾（SEO-11）；不写价格 | 160（120–160） |
| `hero.title`（H1） | Vuốt một đoạn văn trên [[trang web]] sang phải là bản dịch hiện ngay bên dưới. | K1 核心名词「trang web」（荧光笔 2 词，R65）；"段落"一级的动作 + 结果（R46、PRO-19），写了方向；不含品牌（R27）；不是 how-to 句式。「sang phải」「bản dịch」之间用了不换行空格，375–1280 px 下断行为「Vuốt một đoạn văn ／ trên trang web ／ sang phải là bản dịch ／ hiện ngay bên dưới.」 | 74 / 75 |
| `hero.eyebrow` | WordByWord · Trình đọc web song ngữ để học ngoại ngữ | 品牌 + 品类（bilingual web reader）+ 受众（通用学习词，R39 / R83） | 52 / 60 |
| `hero.lede` = `ledeShort` | WordByWord là trợ lý đọc dành cho người học ngoại ngữ, trên iPhone và iPad. | R39 定义句，以「WordByWord là」开头；「trợ lý」只用在定义句、FAQ `what-is` 与页脚 tagline（D13） | 75 / 90 |
| `meta.ogHeadline` | Đọc trang web song ngữ. [[Bản gốc vẫn còn nguyên.]] | K1 场景（双语读网页 + 原文保留）；荧光笔 1 处；没用「giữ nguyên bản gốc」，把它留给 G1 how-to（附录 A） | 56 px × 2 行 |
| 功能区 H2 | Vuốt để dịch, nhấn đúp để tra từ — trên những trang web bạn đọc | K1 + K2 场景句；「trên những trang web bạn đọc」（PRO-16，不写"任何网站"） | 63 |
| 功能 H3 | K1「Vuốt để Dịch: bản dịch hiện ngay dưới văn bản gốc」；K2「Nhấn đúp để tra từ theo ngữ cảnh bằng AI」；K9「Dịch bài đăng X (Twitter) và đọc song ngữ trong trình duyệt tích hợp」；K5「Trích Xuất Cụm và Action Flow cho câu tiếng Anh」（R83 带「tiếng Anh」限定）；K3「Đọc văn bản bằng giọng AI, hoặc nhanh hơn với giọng iOS trên máy」；K4「Phân tích cấu trúc câu bằng AI cho những câu dài」；K7「Dịch trên đám mây hoặc trên thiết bị」；K6「Lịch sử dịch và tra từ」 | K2「tra từ theo ngữ cảnh bằng AI」、K3「đọc văn bản bằng giọng AI」、K4「phân tích cấu trúc câu bằng AI」、K6「lịch sử dịch và tra từ」、K7「dịch trên đám mây hoặc trên thiết bị」都与表 A / B 主词**逐字一致**；K9 含「dịch bài đăng X (Twitter)」 | 全部 ≤ 70 wu |
| 语言段 H2 | Dịch sang 21 ngôn ngữ — không chỉ từ tiếng Anh | K8 主词「dịch sang 21 ngôn ngữ」逐字（数字是占位符） | 46 |
| 价格段 H2 / FAQ `free` | Miễn phí mỗi ngày — nâng cấp lên Plus khi bạn đọc nhiều hơn / WordByWord có miễn phí không? Giới hạn mỗi ngày là bao nhiêu? | K10「miễn phí」+ Plus（「nâng cấp lên Plus」对应 App 的 "Nâng Cấp lên Plus"）；次词「giới hạn miễn phí mỗi ngày」 | — |
| 最终 CTA H2 | Bắt đầu đọc trang web song ngữ trên iPhone | 动作句，不是 G1 标题，不暗示整页（R46） | 42 |

检查结果：title / description / H1 / OG / 功能区 H2 里没有 SE 独占词（现有 `học tiếng Anh`、`tin tiếng Anh` 及附录 A 建议新增的 `tin tức tiếng Anh`、`báo tiếng Anh`、`luyện … tiếng Anh`、`tiếng Anh theo trình/cấp độ`、`nhóm nghĩa`、`trích xuất cụm` 全部 0 命中）；title / H1 / description / `cta.title` 里没有 how-to 句式（附录 A 的 G1 模式 0 命中）。

## 2. Q1–Q10 逐条结果（文档 08 §7.9）

| # | 结果 | 说明 |
|---|---|---|
| Q1 | ✓ | JSON 能解析，文件为 NFC；键、数组 id 与顺序同 en（L-1、L-2）；新副本 build / `--pseudo` 0 error，`check.mjs` 0 / 0，测试 62/62。真实仓库在生成 OG 前会报 D-23（§6-1） |
| Q2 | ✓ | 占位符、`[[ ]]`、`**`、`[文本](@ref)` 都保留；ref 只用 `@about`、`@chrome`、`@se-site`（白名单内）；没有写死额度、价格、语言数（L-12 0 条）。vi 不需要复数对象（§0 第 5 条）；代入当前值后核对了渲染："Giao diện ứng dụng: 20 ngôn ngữ""Bản dịch: 21 ngôn ngữ""50 lượt vuốt để dịch…""20 lượt nhấn đúp…""5 lượt giải thích cú pháp…""Giao diện 12 ngôn ngữ, có tiếng Việt""Dịch sang 21 ngôn ngữ"。价格渲染为「3,99 US$」（`Intl.NumberFormat('vi')`），Plus 表头第二行在「(tại Mỹ)」前换行 |
| Q3 | ✓ | title 以品牌位开头，含 `titleMust` 全部词元；K1 是产品 / 品类意图（ứng dụng dịch trang web）；没有 §1.4 禁用主词与 how-to 句式 |
| Q4 | ✓ | `hero.title` 恰好 1 处 `[[trang web]]`（2 词）；功能 H3、`languages.title` 无 `[[ ]]`；`hero.lede` 以「WordByWord là」开头，写明「dành cho người học ngoại ngữ」 |
| Q5 | ✓ | §1.1 红线逐行核对：交互只写"内置浏览器里向右滑段落"；整页翻译只出现在 FAQ `whole-page` 的否定回答里，Safari 扩展只在 FAQ `safari`，Android 只在 FAQ `android`；没写离线、无限 AI 发音（"giọng iOS không giới hạn số lần" 指 iOS 语音，属实）、暗色模式 / 主题、快捷键 / 音量、生词本 / 闪卡 / 同步、"Plus 专属"、样式数量、口语练习、ChatGPT、"đội ngũ / chúng tôi"（开发者一律第三人称 Jinlong；样张译文里的 "chúng tôi" 属于虚构文章）；CJK 原文不能双击查词、Trích Xuất Cụm / Action Flow 仅英语都写在同屏；没有 jargon「quét」「đối chiếu từng câu」。附录 A 词表在副本里跑 L-14：0 命中 |
| Q6 | ✓ | kicker 与价格表行名用 App 叫法（glossary `required` 15 项，L-13 0 违规）；按钮名照 App 原文加引号：“Nhận Giải thích Cú pháp AI”、“Nâng Cấp Ngay”、“Khôi phục Mua hàng”、“Đọc AI”、“Đọc tại chỗ”、“Mạch hành động của câu”（glossary `contains`）；X9 已修正：App 的「Lịch Sử Dịch Chuyển」写成「lịch sử dịch bằng thao tác vuốt」；Action Flow 保留 App Store 名，正文括注 App 内叫法（D3） |
| Q7 | ✓ | 截图逐张目视核对（`assets/img/shot/en/*`）：西语维基页 + 英文译文、"convirtiéndose"卡片、设置页 Auto / Quote Style / Local Read、"matrimonio"释义页、Spanish → English (US)、语言列表（首项就是 Vietnamese）、朗读播放器（正在读西语句子）、"Syntax Explanations"；alt 里界面字样按截图英文原样引用并写「(giao diện tiếng Anh)」；`features[x].alt` 描述社交帖样张；`demo.lookup.word` = "end"，出现在 `demo.source[1]`（L-10） |
| Q8 | ✓ | local 模式：链 SE 越南语页；`note` 含「có tiếng Việt」，没有 en-site 的 uiNote / 界面说明句；H2 以 SurfEnglish 开头；body 首句是条件句「Bạn đang học tiếng Anh?」；卖点只用 R41 三项（分级新闻、复习游戏、从 Safari 分享），不提语音；没有「mới / nhanh hơn / nâng cấp / có thể phù hợp hơn / thay thế」；`points[0]` 写成「ở các cấp độ {se.levels}」（PRO-10）；`linkText` 是核心词短语 + 品牌，不是裸域名（R76）；`appStoreLinkText` 不含 → |
| Q9 | ✓ | 代入占位符后全部在 §7.6 / L-8 上限内（附录 B）；SE 卡片高度在 R10 / R84 限内（§7） |
| Q10 | ✓ | 拉丁文字（带越南语声调），不涉及 RTL / CJK；没有 `{wbr}`（R61）。越南语以音节为单位分写，浏览器会在双音节词中间断行：只在 H1 的「sang phải」「bản dịch」和 `features[chunks].title` 的「Action Flow」里用了不换行空格（U+00A0，与 pt-BR 的 "Action Flow"、仓库对 "iOS 18" 的处理相同），其余标题照常断行 |
| Q12 | ✓ | 7 种宽度无溢出、无字体回落（`document.fonts.check` 为真；越南语叠加声调在显示字体、正文无衬线体、FAQ 衬线体、OG 字体里都正常） |
| Q13 | ✓ | FAQ `devices` 的 `a`（S0）不写扩展名称；`aExtLive` 写名称并注明只从该页链接安装；首页没出现 WordByWord.io |

## 3. 回译对照（vi → English，对照 en.json）

| 键 | vi | 回译 | en 原文 |
|---|---|---|---|
| meta.title | WordByWord: ứng dụng dịch trang web song ngữ trên iPhone | WordByWord: bilingual web page translation app on iPhone | WordByWord: Bilingual Web Page Translator App for iPhone |
| meta.description | Cho người học ngoại ngữ: trong WordByWord, vuốt một đoạn văn sang phải, bản dịch hiện ngay bên dưới. Nhấn đúp vào từ để xem nghĩa. Miễn phí trên iPhone và iPad. | For language learners: in WordByWord, swipe a paragraph to the right and the translation appears right below. Double-tap a word to see its meaning. Free on iPhone and iPad. | For language learners: swipe a paragraph in the built-in browser and its translation appears below. Double-tap a word for its meaning. Free on iPhone & iPad. |
| meta.ogHeadline | Đọc trang web song ngữ. [[Bản gốc vẫn còn nguyên.]] | Read web pages bilingually. The original stays intact. | Read any web page bilingually. Keep the original. |
| meta.ogSubline | Vuốt sang phải trên một đoạn văn · nhấn đúp vào từ để xem nghĩa theo ngữ cảnh | Swipe right on a paragraph · double-tap a word to see its meaning in context | Swipe right on a paragraph · double-tap a word for its meaning in context |
| hero.title | Vuốt một đoạn văn trên [[trang web]] sang phải là bản dịch hiện ngay bên dưới. | Swipe a paragraph on a web page to the right and the translation appears right below. | Swipe a paragraph on any web page. Its translation appears right below. |
| hero.lede | WordByWord là trợ lý đọc dành cho người học ngoại ngữ, trên iPhone và iPad. | WordByWord is a reading assistant for language learners, on iPhone and iPad. | WordByWord is a reading assistant for language learners on iPhone and iPad. |
| hero.how | Mở một trang web trong trình duyệt tích hợp rồi vuốt sang phải trên một đoạn văn: bản dịch hiện ngay bên dưới. Nhấn đúp vào một từ để AI giải thích nghĩa của từ đó trong câu. | Open a website in the built-in browser, then swipe right on a paragraph: the translation appears right below. Double-tap a word to have the AI explain what it means in the sentence. | Open a site in its built-in browser and swipe right on a paragraph: the translation appears below it. Double-tap a word for an AI explanation of what it means there. |
| featuresIntro.title | Vuốt để dịch, nhấn đúp để tra từ — trên những trang web bạn đọc | Swipe to translate, double-tap to look up words — on the websites you read | Swipe to translate, double-tap to look up — on the websites you read |
| features[swipe].title | Vuốt để Dịch: bản dịch hiện ngay dưới văn bản gốc | Swipe to Translate: the translation appears right below the original text | Swipe to Translate: the translation appears right below the original |
| features[lookup].title | Nhấn đúp để tra từ theo ngữ cảnh bằng AI | Double-tap to look up a word in context with AI | Double-tap a word for its AI meaning in context |
| features[x].title | Dịch bài đăng X (Twitter) và đọc song ngữ trong trình duyệt tích hợp | Translate X (Twitter) posts and read them bilingually in the built-in browser | Read X (Twitter) posts bilingually in the built-in browser |
| features[chunks].title | Trích Xuất Cụm và Action Flow cho câu tiếng Anh | Chunk Extraction and Action Flow for English sentences | Chunk Extraction and Action Flow, for English sentences |
| features[speech].title | Đọc văn bản bằng giọng AI, hoặc nhanh hơn với giọng iOS trên máy | Read text aloud with an AI voice — or faster, with iOS voices on the device | AI read-aloud, or fast on-device iOS voices |
| features[syntax].title | Phân tích cấu trúc câu bằng AI cho những câu dài | AI sentence structure analysis for long sentences | （同左） |
| features[engines].title | Dịch trên đám mây hoặc trên thiết bị | Translation in the cloud or on the device | Cloud or on-device translation |
| features[display].title | Bố cục và kiểu bản dịch | Layout and style of the translation | Translation layout and style |
| features[history].title | Lịch sử dịch và tra từ | Translation and word-lookup history | Translation and lookup history |
| features[devices].title | iPhone, iPad, Mac và Vision Pro | iPhone, iPad, Mac and Vision Pro | （同左） |
| faq[what-is].q | WordByWord là gì? | What is WordByWord? | （同左） |
| faq[whole-page].q | WordByWord có dịch cả trang web cùng lúc được không? | Can WordByWord translate a whole web page at once? | （同左） |
| faq[safari].q | WordByWord có dùng được trong Safari hay ứng dụng khác không? | Can WordByWord be used in Safari or other apps? | Does it work in Safari or inside other apps? |
| faq[word-by-word].q | WordByWord có phải công cụ dịch từng từ không? | Is WordByWord a word-by-word translation tool? | Is WordByWord a word-by-word translator? |
| faq[x].q | Tôi có thể đọc X (Twitter) bằng WordByWord không? | Can I read X (Twitter) with WordByWord? | （同左） |
| faq[languages].q | WordByWord hỗ trợ những ngôn ngữ nào? | Which languages does WordByWord support? | （同左） |
| faq[free].q | WordByWord có miễn phí không? Giới hạn mỗi ngày là bao nhiêu? | Is WordByWord free? What are the daily limits? | （同左） |
| faq[engines].q | Ứng dụng dùng công cụ dịch nào? | Which translation engine does the app use? | Which translation engine does it use? |
| faq[account].q | Tôi có cần tài khoản để dùng WordByWord không? | Do I need an account to use WordByWord? | （同左） |
| faq[restore].q | Làm sao để lấy lại WordByWord Plus trên iPhone hoặc iPad mới? | How do I get WordByWord Plus back on a new iPhone or iPad? | （同左） |
| faq[android].q | Có phiên bản Android không? | Is there an Android version? | （同左） |
| faq[english-learner].q | Tôi đang học tiếng Anh. SurfEnglish có đáng để thử thêm không? | I'm learning English. Is SurfEnglish worth trying as well? | I’m learning English. Is SurfEnglish worth trying too? |
| faq[devices].q | WordByWord có chạy trên iPad, Mac hay trình duyệt máy tính không? | Does WordByWord run on iPad, Mac or a computer browser? | Does WordByWord work on iPad, Mac or a desktop browser? |
| pricing.summary | Mọi tính năng đều miễn phí trong các giới hạn này; Plus nâng giới hạn với giá 3,99 US$/tháng (Mỹ). | Every feature is free within these limits; Plus raises the limits for US$3.99/month (US). | Every feature is free within these limits; Plus raises them for $3.99/month (US). |
| sibling.card.eyebrow | Từ nhà phát triển WordByWord | From the WordByWord developer | From the developer of WordByWord |
| sibling.card.title | SurfEnglish: tin tiếng Anh mỗi ngày theo trình độ của bạn | SurfEnglish: daily English news at your level | （同左） |
| sibling.card.body | Bạn đang học tiếng Anh? Cứ đọc trang nào bạn thích trong WordByWord, và thử thêm SurfEnglish: tin tiếng Anh mỗi ngày theo trình độ và trò chơi ôn tập, với cùng thao tác vuốt và nhấn đúp. | Learning English? Go on reading any page you like in WordByWord, and also try SurfEnglish: daily English news by level and review games, with the same swipe and double-tap. | Learning English? Keep reading any page you like in WordByWord, and try SurfEnglish too: daily English news by level and review games, with the same swipe and double-tap. |
| sibling.card.points | Tin tiếng Anh thật ở các cấp độ A1–C1 / Trò chơi ôn lại những gì bạn đã đọc / Chia sẻ bài tiếng Anh từ Safari | Real English news at levels A1–C1 / Games that review what you've read / Share English articles from Safari | Real English news at levels A1–C1 / Review games built from what you’ve read / Share English articles from Safari to the app |
| sibling.card.note | Bắt đầu miễn phí · iPhone và iPad · Giao diện 12 ngôn ngữ, có tiếng Việt · Dịch sang 21 ngôn ngữ | Free to start · iPhone and iPad · Interface in 12 languages, Vietnamese included · Translates into 21 languages | Free to start · iPhone and iPad · App in 12 languages · Translations into 21 |
| sibling.card.linkText | Đọc tin tiếng Anh song ngữ — SurfEnglish | Read English news bilingually — SurfEnglish | Read English news at your level with SurfEnglish |
| sibling.card.appStoreLinkText | Tải SurfEnglish trên App Store | Get SurfEnglish on the App Store | （同左） |
| sibling.card.shotAlt | SurfEnglish, màn hình Games (giao diện tiếng Anh): Sentence Builder và Word Raid, chơi với câu và từ đã lưu | SurfEnglish, Games screen (English interface): Sentence Builder and Word Raid, played with saved sentences and words | SurfEnglish Games screen: Sentence Builder and Word Raid, ready to play with saved sentences and words |
| sibling.card.shotCaption | Ảnh chụp màn hình SurfEnglish (giao diện tiếng Anh) | SurfEnglish screenshot (English interface) | （同左） |
| sibling.footer.heading / linkText | Cùng nhà phát triển / SurfEnglish: Đọc tin tiếng Anh | From the same developer / SurfEnglish: Read English News（文档 04 §5.5 的 vi 店名，见 §6-4） | More from the maker / SurfEnglish: Bilingual News |
| faq[english-learner].a（SE 相关） | Hãy cứ dùng WordByWord cho những trang web và bài đăng X bạn chọn, bằng tiếng Anh hay bất kỳ ngôn ngữ nào khác. Nếu bạn muốn có thêm tin tiếng Anh mỗi ngày được chia theo trình độ (A1–C1) và trò chơi ôn lại những câu và từ bạn đã lưu, thì SurfEnglish, ứng dụng của cùng nhà phát triển, có sẵn những thứ đó với cùng thao tác vuốt và nhấn đúp. Hai ứng dụng có thể dùng song song. [Trang web SurfEnglish] | Keep using WordByWord for the websites and X posts you choose, in English or any other language. If you'd also like daily English news sorted by level (A1–C1) and games that review the sentences and words you've saved, then SurfEnglish, an app by the same developer, has exactly that, with the same swipe and double-tap. The two apps can be used side by side. [SurfEnglish website] | Keep using WordByWord for the pages and X posts you choose, in English or any other language. If you would also like daily English news sorted by level (A1–C1) and games that review the sentences and words you have saved, SurfEnglish, from the same developer, adds that with the same swipe and double-tap. The two apps work side by side. [SurfEnglish website] |
| cta.title | Bắt đầu đọc trang web song ngữ trên iPhone | Start reading websites bilingually on iPhone | （同左） |
| cta.recap | Vuốt để dịch · Nhấn đúp để tra từ · Đọc to · 21 ngôn ngữ | Swipe to translate · Double-tap to look up · Read aloud · 21 languages | （同左） |

FAQ 答案（不在回译清单里）也逐句对过 en：额度全部是占位符；`free` 写明 iOS 语音不限次数、Plus 是月订、美区价格 + 其他地区以 App Store 为准；`account` 写"不需要创建账号"（避开 "đăng ký"，它在本页也指"订阅"）；`restore` 引用 App 按钮 “Nâng Cấp Ngay” → “Khôi phục Mua hàng”（T-E）；`devices` 的 S0 答案只写"WordByWord 的开发者正在准备一个 Chrome 扩展"，`aExtLive` 才写名称和"只从该页链接安装"。

### 3.1 与 en 的事实偏差

**没有事实偏差。**（第二模型独立通读的结论相同，§5 末尾。）与 en 不同、但都有依据的地方：

1. H1、description、how 写了方向「sang phải」（en 的 H1 / description 没写）：与 App 的 `tip_swipe_to_translate`（"Vuốt sang phải…"）和文档 08 §7.3 的手势写法一致；description 用「trong WordByWord」代替 "in the built-in browser"（文档 03 §3.2 允许；草案原样）。
2. H1 / OG 没有 "any"（"mọi trang web"）：草案原样，也避免"整页"联想。
3. `features[x].title` 把 K9 主词「dịch bài đăng X (Twitter)」放进 H3，并保留 en 的"在内置浏览器里双语读"。
4. `features[speech].alt` 写的是截图实际内容（"朗读播放器在屏幕底部，正在读一句西语"），没有照 en 的 "a translated paragraph"：页面上显示的是 `tts-ex` 节选图，图里只有播放器卡片和原文句子（§6-8）。
5. SE 卡片：`points[2]` 省掉 "to the app"（卡片语境里不言自明）、`points[1]` 写成"复习你读过的内容的游戏"；`note` 按 T6 加「có tiếng Việt」；`linkText` 用文档 04 §5.7 的 vi 种子（SE 越南语站的核心词「Đọc tin tiếng Anh song ngữ」），没有 "at your level"——这层意思在卡片 H2 和要点 1 里。
6. `hero.platformNote` 不写美区价格，只写「Plus là gói đăng ký theo tháng」（D2，与 ja / zh-Hans 相同）。
7. 指向英文页的三个富文本链接文字带「(tiếng Anh)」（Wave 2 规定）。
8. FAQ `engines`、`android` 的问句不带品牌名（与 en 的 "Which translation engine does it use?""Is there an Android version?" 相同），为了在 390 px 下各占一行（§7）。

## 4. 没把握的措辞（14 处，附回译与替代写法）

| # | 键 | vi（回译） | 顾虑 | 替代写法（回译） |
|---|---|---|---|---|
| 1 | `hero.lede` / FAQ `what-is` / `footer.tagline` | trợ lý đọc dành cho người học ngoại ngữ（a reading assistant for language learners） | R39 定义句的直译；「trợ lý đọc」在越南语里不算常见搭配，读者可能联想到"AI 助手" | WordByWord là ứng dụng hỗ trợ đọc dành cho người học ngoại ngữ…（an app that helps language learners read…，+11 字符） |
| 2 | `features[lookup].kicker`、价格表行名 | Nhấn đúp để Tìm kiếm（Double-tap to Search） | App 原名（`word_meaning_lookup_title` 去掉 "(Ý Nghĩa AI)"）；「tìm kiếm」是"搜索"，查词通常说「tra từ」，与 H3 的「tra từ」并排时读者可能以为是两个功能 | Nhấn đúp để tra từ（Double-tap to look up a word；需同时改 glossary，且与 App 不一致，见 §6-3） |
| 3 | `features[speech].text`、价格表 `localVoice` | “Đọc tại chỗ”（"Read on the spot"） | App 原名（`audio_playback_title_local`）；App 其他地方都把 local 译成「cục bộ」，「tại chỗ」读起来像"当场读" | Đọc cục bộ / Đọc trên máy（Local reading / on-device reading；需 App 侧先改） |
| 4 | `meta.ogHeadline` | Bản gốc vẫn còn nguyên.（The original stays intact.） | en 是 "Keep the original."；直译「Giữ nguyên bản gốc」更贴，但它正是 vi 的 G1 how-to 关键词，按附录 A 留给 G1 | [[Giữ nguyên bản gốc.]]（Keep the original as is.；要重跑 og.mjs） |
| 5 | `hero.title` | …sang phải là bản dịch hiện ngay bên dưới.（…to the right and the translation appears right below.） | 「A là B」表示"一…就…"，口语自然；文档 03 草案用的是逗号连接（更书面） | Vuốt một đoạn văn trên [[trang web]] sang phải, bản dịch hiện ngay bên dưới.（草案句式，72） |
| 6 | `features[x].kicker` | X (trước đây là Twitter)（X (formerly Twitter)） | 按 §7.2.3 首次出现写"X（旧 Twitter）"；正好 24 wu，没有余量 | X (Twitter cũ)（X (old Twitter)，14） |
| 7 | `hero.platformNote`、`features[devices].text` | Mac chip Apple（Apple-chip Mac） | 为守 140 / 80 字符写成电报体；FAQ 里写的是完整的「máy Mac dùng chip Apple」 | máy Mac dùng chip Apple（platformNote 会到 141 > 140） |
| 8 | `hero.eyebrow` | Trình đọc web song ngữ để học ngoại ngữ（Bilingual web reader for learning languages） | 初稿「…cho người học ngoại ngữ」在 1280 px 下折成两行（"NGOẠI NGỮ" 单独一行），改成「để học ngoại ngữ」后一行 | WordByWord · Đọc web song ngữ cho người học ngoại ngữ（Bilingual web reading for language learners，1280 px 一行） |
| 9 | `featuresIntro.lede` | Hai thao tác lo gần hết mọi việc（Two gestures take care of almost everything） | 「lo」偏口语 | Hai thao tác đảm nhận phần lớn công việc（Two gestures handle most of the work） |
| 10 | `sibling.card.points[2]` | Chia sẻ bài tiếng Anh từ Safari（Share English articles from Safari） | 省掉了 "vào ứng dụng"（为卡片高度：375 px 下 504 → 440 px） | Chia sẻ bài tiếng Anh từ Safari vào ứng dụng（多 1 行） |
| 11 | `features[speech].text` | hỗ trợ giọng Premium hoặc Enhanced bạn đã tải về（supports Premium or Enhanced voices you've downloaded） | 照 App 的 vi 字符串保留英文档名；iOS 越南语设置里这两档可能叫「Cao cấp」「Nâng cao」，我没有在真机上核对 | hỗ trợ giọng Cao cấp (Premium) hoặc Nâng cao (Enhanced) |
| 12 | `languages.uiCount` / `targetCount` | Giao diện ứng dụng: 20 ngôn ngữ / Bản dịch: 21 ngôn ngữ（App interface: 20 languages / Translations: 21 languages） | 与第三条「Ngôn ngữ của trang: …」统一成"X：Y"结构；初稿「Dịch sang 21 ngôn ngữ」与 H2 重复 | Ứng dụng có giao diện 20 ngôn ngữ / Dịch sang 21 ngôn ngữ |
| 13 | `faq[word-by-word].a` 首句 | Không theo nghĩa đen.（Not in the literal sense.） | 第二模型建议改「Không hẳn như tên gọi」（Not quite as the name suggests）；我保留了直译，避免把答案引向"名字的含义"（R73 删除了这类叙事） | Không hẳn như tên gọi.（Not quite as the name suggests.） |
| 14 | `sibling.card.points[0]` | ở các cấp độ A1–C1（at levels A1–C1） | 卡片 H2 / FAQ 用「trình độ」（你的水平），要点用「cấp độ」（CEFR 等级，SE 越南语官网的用词）；第二模型建议统一成「trình độ」 | Tin tiếng Anh thật ở các trình độ A1–C1 |

## 5. 术语与 App 叫法处理要点（给审校人）

- **App 叫法的出处**：全部取自 `WordByWordPrototype/Localizable.xcstrings` 的 vi 值（2026-10-06 读取），与文档 08 §7.2.1 表 T-A…T-E 的 vi 列一致：`daily_sentence_translation_limit`「Vuốt để Dịch」、`word_meaning_lookup_title`「Nhấn đúp để Tìm kiếm (Ý Nghĩa AI)」、`more_definitions_title`「Định nghĩa khác」、`Chunk Extraction`「Trích Xuất Cụm」、`sentence_skeleton_settings_navigation_title`「Mạch hành động của câu」、`get_syntax_explanation_button`「Nhận Giải thích Cú pháp AI」、`audio_playback_title_streaming / _local`「Đọc AI / Đọc tại chỗ」、`swipe_translation_engine_mode_api_title / _local_title`「Công cụ dịch đám mây / Công cụ cục bộ」、`translation_mode_title_*`「Tự Động / Đoạn Văn / Từng Câu」、`swipe_translation_result_display_mode_title_*`「Hiển thị tự động / Hiển thị thủ công」、`ai_pronunciation_word / _sentence`「Phát âm AI (Từ) / (Câu)」、`setting_description_source_language / _target_language`「Ngôn ngữ Nguồn / Ngôn ngữ Đích」、`upgrade_to_plus_button`「Nâng Cấp lên Plus」、`limit_unlimited`「Không giới hạn」、`upgrade_now_button`「Nâng Cấp Ngay」、`restore_purchase_button`「Khôi phục Mua hàng」、`search_or_enter`「Tìm kiếm hoặc nhập URL」；价格表行名的结构取自 `FeatureQuotaManager.swift` 的 `featureDisplayName`（App 的 Free / Plus 对照屏），短写成「Vuốt để Dịch · đám mây / cục bộ」，查词行去掉「(Ý Nghĩa AI)」后缀（原名在手机表格里折成三行）。
- **规则 ①②**：kicker、价格表行名、"在 App 里点哪个按钮"照 App 原文（含 App 的英文式词首大写）；句子里用自然说法：「vuốt để dịch」「nhấn đúp để tra từ」「lịch sử dịch bằng thao tác vuốt」「dấu trang」「tab」。
- **规则 ③（X9）**：App 的「Lịch Sử Dịch Chuyển」（"移动的历史"）不照抄，写「lịch sử dịch bằng thao tác vuốt」；glossary 禁用「dịch chuyển」。
- **Action Flow**：标题、表格、样张标签用 App Store 名 "Action Flow"，正文第一次出现时括注 App 内叫法「Mạch hành động của câu」（D3）。
- **截图 alt**：截图是英文界面，alt 里的界面字样按截图英文原样引用（Auto、Quote Style、Local Read、More Definitions、Games、Sentence Builder、Word Raid），并注明「(giao diện tiếng Anh)」。
- **Apple 用语**：「Tài khoản Apple」（Apple 自 2024 起的越南语叫法）、「máy Mac dùng chip Apple」、vi-vn 徽章文字「Tải về trên App Store」→ `common.appStoreBadgeAlt`「Tải WordByWord trên App Store」、SE 文字链接「Tải SurfEnglish trên App Store」（T8：徽章动词 + 品牌）。
- **X**：kicker 写「X (trước đây là Twitter)」（§7.2.3 首次出现的格式），其余写「X (Twitter)」；帖子叫「bài đăng」。
- **数字与价格**：`{plus.priceUS}` 渲染为「3,99 US$」；表格单元「{n}/ngày」，与 en 的 "{n} / day" 同构（App 的 `limit_per_day%lld` 是「%lld lần mỗi ngày」）。初稿是「{n} lượt/ngày」：54afac8 让手机上的单元格可以换行后，它让 vi 价格表在 390 px 比 en 高 60 px（872 vs 812）；「{n}/ngày」在 390 / 375 px 与 en 等高（812 / 833 px），320 px 为 1,077 px（en 937，初稿 1,223）。
- **语体**：全页「bạn」，不用「quý khách / các bạn」；开发者只用第三人称「Jinlong」「nhà phát triển」；FAQ 答案首句直接作答（Có. / Không.）。
- **第二模型通读**（只读，独立于起草过程）：结论是"没有事实偏差"；提出 29 条措辞意见，采纳 25 条（价格表单元的「lượt」后来随上一条改成「{n}/ngày」；另有 4 条改了写法再采纳：devices 改成「nhà phát triển của WordByWord」、english-learner 改成「thì SurfEnglish, ứng dụng của cùng nhà phát triển, có sẵn những thứ đó」、查词截图 alt 为守 125 字符改成「…được tô sáng và thẻ giải nghĩa trong câu」、价格区导语为守 13,000 px 改成「gói Plus」），部分采纳 1 条（朗读正文去掉重复的「dùng」，但 Premium / Enhanced 不改，§4-11），未采纳 3 条（页脚栏标题「Cùng nhà phát triển」是文档 04 §5.5 定值；「cấp độ」与 word-by-word 首句见 §4-13、§4-14）。

## 6. 需要负责人决定的问题

1. **OG 图（D-23）**：按简报，`home-vi.jpg` 与 `og.json` 没有复制进真实仓库。vi.json 进库后，`node build.mjs` 会报 `D-23 home-vi: no OG image`，直到运行 `node scripts/og.mjs --only home-vi`（新副本实测一次通过：56 px × 2 行、副标题 30 px × 2 行、146.0 KB）。
2. **vi lint 词表**：`docs/redesign-2026/ops/m3/vi-lint.json`（附录 A）覆盖 26 条规则（比 de / pt-BR 多 `selection-translate`：该规则已有 it / pl / ru / tr / pt-BR / hi / ar 等，但没有 vi）+ `seOwned` 追加 / `seOwnedLead` / `reserved.G1`。副本（HEAD `3d520ab` + vi）合入后全站 0 error、vi 的 L-14 / L-9 warning 消失、测试 62/62。是否合入、由谁合入，请决定。请特别看 `seOwned` 新增的「trích xuất cụm」「nhóm nghĩa」：它们会禁止 title / H1 / description / OG / 功能区 H2 出现 App 的 Chunk Extraction 名「Trích Xuất Cụm」和 SE 越南语站对语块的叫法（与 en 禁 "chunks"、pt-BR 禁 "blocos" 同理；功能区 H3 不受影响）。
3. **报给 App 侧的越南语字符串问题**（规则 ③；网站已按括号里的方式处理）：
   - X9：`view_title_swipe_history`「Lịch Sử Dịch Chuyển」，同样的词还在 `view_title_swipe_detail`「Chi Tiết Dịch Chuyển」（网站写「lịch sử dịch bằng thao tác vuốt」）。
   - 双击两种说法：`tip_double_tap_context_meaning` / `word_meaning_lookup_title` 用「Nhấn đúp」，`double_tap_not_supported_message` 用「chạm hai lần」，而且把查词叫成「tính năng dịch」（网站统一「nhấn đúp」）。
   - Local 两种说法：`audio_playback_title_local`「Đọc tại chỗ」vs 其他设置的「cục bộ」（网站引用按钮名时照 App，§4-3；建议 App 改成「Đọc cục bộ」或「Đọc trên máy」）。
   - 「Nhấn đúp để Tìm kiếm」：「Tìm kiếm」是"搜索"，查词的自然说法是「tra từ」（§4-2；建议 App 改成「Nhấn đúp để Tra từ」）。
   - 书签两种说法：`bookmark_title`「Đánh dấu」vs「Dấu trang」（Xóa / Chỉnh sửa / Xem Dấu Trang）（网站用「dấu trang」）。
   - 英文式词首大写：「Vuốt để Dịch」「Tự Động / Đoạn Văn / Từng Câu」「Nâng Cấp Ngay」「Trích Xuất Cụm」等；同一个样式名有「Kiểu Trích Dẫn」「Kiểu Trích dẫn」两种大小写（网站在 kicker / 表格 / 引号里照 App，正文用小写）。
   - 语音档名「Premium / Enhanced」保留英文（§4-11）。
4. **SE 页脚店名**：文档 04 §5.5 给 vi 的 `sibling.footer.linkText` 是「SurfEnglish: Đọc tin tiếng Anh」（取自 SE 官网 `src/locales/vi.json` 的 `appStoreName`），我照用；但研究 05 §3.5 记录的 VN 店面名是 "SurfEnglish: Bilingual News"。如果 VN 店面至今没有越南语名称，请决定改用店面实名，还是保留文档 04 的写法（页脚链接指向 SE 越南语官网，不是 App Store）。
5. **`meta.appStoreName` / `appStoreSubtitle`**：VN 店面实名是 "WordByWord Translate"，副标题显示的是 US 的英文副标题 "Swipe to translate AI explains"（2026-10-05 调研时保存的 VN 店面页面；VN 店面没有越南语本地化）。我照录这两个值（只用于 en 的 about 事实表，vi 页面不渲染），因此有 1 条 L-4 review。若要给 VN 店面补越南语元数据，可以借用本页 eyebrow / ctaNote 的说法。
6. **L-4 `common.menu` = "Menu"**：越南语网站的汉堡菜单通常就写 "Menu"（「Trình đơn」偏书面、少见），保留。
7. **复数对象**：按文档 08 §1.4 不写（vi 只有 other 类别，与 ja / zh-Hans / zh-Hant / ko 相同）。若负责人希望所有语言统一写复数对象，把各处"数字占位符 + 名词"改成 `{targetLanguages, plural, other{# ngôn ngữ}}` 这种只有 other 分支的对象即可，渲染结果不变。
8. **en 的朗读截图 alt**：`features[speech].alt` 在 en 写 "a translated paragraph with the read-aloud player"，但页面实际显示的 `tts-ex` 节选只有播放器卡片和一句西语原文。vi 按图片实际内容写；en 及其他语言的 alt 是否同步修正，请决定。
9. **页面高度目标**：390 px 下 vi 为 12,961 px（en 12,879）。页脚语言列表每多发布两种语言就长约 32 px（本次工作期间从 12 种增加到 16 种），20 种语言全部上线后 en 本身也会逼近 13,000，已发布的 de / pl / ru / uk 早已超过。建议把目标改成"相对 en 的增量"或把页脚语言列表折叠（与 pt-BR 记录的建议相同）。
10. **母语审校**：按 R36，vi 上线后补越南语母语审校；请审校人重点看 §4 的 14 处、§6-3 的 App 用词，以及全页「bạn」的语气。

## 7. 版面实测（新副本 HEAD `3d520ab` + vi，`scripts/serve.mjs --port 4607`，headless Chrome，外部请求全部拦截）

| 视口 | 横向溢出 | SE 卡片高度（上限） | 样张红色译文条顶端 | H1 行数 | 整页高度 |
|---|---|---|---|---|---|
| 1280 × 800 | 无 | 361 px（420） | 378 px | 4 | 10,119 px（en 10,079） |
| 900 × 900 | 无 | 379 px（420） | 378 px | 4 | 9,821 px |
| 768 × 1024 | 无 | 312 px（480） | 699 px | 3 | 12,159 px |
| 560 × 900 | 无 | 412 px（480） | 771 px | 4 | 12,455 px |
| 414 × 896 | 无 | 419 px（480） | 738 px | 4 | 13,014 px |
| 390 × 844 | 无 | 440 px（480） | 735 px（< 844，R69；en 735） | 4 | **12,961 px**（目标 ≤ 13,000；en 12,879、it 12,955、tr 13,025、pt-BR 13,104、es 13,145、pl 13,459、uk 13,621、de 13,628、ru 13,865） |
| 375 × 812 | 无 | 440 px（480） | 733 px（en 733） | 4 | 13,046 px（en 12,955） |
| 360 × 780 | 无 | 462 px（480） | 763 px | 5 | 13,287 px |
| 320 × 640 | 无 | 540 px（560，R84） | 816 px（en 873） | 5 | 13,843 px（en 13,388） |

价格表在所有宽度都不出现横向滚动（54afac8 之后 < 768 px 单元格可换行）；页眉下载按钮在所有宽度都是「Tải về」（`nav.download` = `downloadShort`），< 360 px 只显示图标（54afac8）。为满足上面的数字所做的调整（初稿 → 定稿）：

- SE 卡片：eyebrow「Từ nhà phát triển của WordByWord」→「Từ nhà phát triển WordByWord」（375 px 下 2 行 → 1 行）；要点 2、3 缩短到一行；note「Miễn phí để bắt đầu」→「Bắt đầu miễn phí」：375 px 504 → 440 px，320 px 582 → 540 px。
- `hero.secondaryCta`「Xem cách hoạt động」→「Cách hoạt động」：初稿在 375 px 下掉到徽章下一行，样张下移 52 px（红条 785 → 733 px）。
- `hero.eyebrow`：「…cho người học ngoại ngữ」→「…để học ngoại ngữ」，1280 px 下 2 行 → 1 行（§4-8）。
- FAQ 四个问句缩短（safari、devices 由 3 行变 2 行；engines、android 由 2 行变 1 行），价格区导语「WordByWord Plus」→「gói Plus」（4 行 → 3 行）。
- 价格表单元「{n} lượt/ngày」→「{n}/ngày」（与 en 同构，见 §5「数字与价格」）：54afac8 之后 390 px 价格区 1,410 → 1,350 px，整页 13,021 → 12,961 px。
- 价格表 `lookup` 行用 App 名去掉「(Ý Nghĩa AI)」后缀的写法（与 kicker 相同），不是为了旧的裁切：在 54afac8 的 CSS 下实测，完整原名在 390 / 375 px 折成「(Ý ／ Nghĩa AI)」，给括号加不换行空格又会让 320 px 的价格表出现横向滚动。
- H1 的「sang phải」「bản dịch」、`features[chunks].title` 的「Action Flow」用不换行空格，避免双音节词在行尾拆开（H1 行数不变；375–1280 px 断行为「Vuốt một đoạn văn ／ trên trang web ／ sang phải là bản dịch ／ hiện ngay bên dưới.」）。
- 目视检查（深色模式截图）：390 / 375 / 320 px 的 hero、样张查词卡、L1 / L2 功能块（①②③ 页边注）、X 样张、语块示意、规格清单、语言段、价格表、SE 卡片、FAQ、页脚，1280 px 的页眉、hero、价格表、SE 卡片，320 px 的页眉：没有溢出、词中断行或字体回落；越南语声调在各字体里叠加正常。

## 附录 A：建议的 vi lint 词表（`docs/redesign-2026/ops/m3/vi-lint.json`）

文件形状按 Wave 2 约定：`{"claimsLint": {"<rule id>": [...]}, "keywordMap": {"seOwned": [...], "seOwnedLead": [...], "reservedG1": [...]}}`。覆盖 `claims-lint.json` 中所有有按语言写法、且还没有 vi 键的规则，共 **26 条**（跳过已有 vi 的 `jargon`，以及只有 `*` 的 `io-home`、`engine-claim`；`hype` 保留它的 `*` 模式，另加 vi 模式）。`keywordMap`：`seOwned.vi` 追加（现有 `học tiếng Anh`、`tin tiếng Anh` 不变），`seOwnedLead.vi`、`reserved.G1.vi` 新建。

写法要点：越南语每个音节之间有空格、字母大多不在 ASCII 内，词边界一律用 `(?<![\p{L}])` / `(?![\p{L}])`，多音节词之间用 `\s+`；没有用 `\w` / `\b`，所以在 `bb689eb`（数据模式里的 `\w` `\b` 改为 Unicode 感知）前后行为相同。匹配方式同校验器（`iu`，在代入占位符、去掉标记后的文本上；文件均为 NFC）。

**自测**（`scratchpad/vi-lint-test.mjs`，与 `compileAll` 用同一套 Unicode 改写）：① vi 文案 0 命中（按各规则自带的 `exempt` / `only` 键路径，与 L-14 相同）；② 下列反例句每条都命中各自规则；③ 必须放行的句子 0 命中：「Cho người học ngoại ngữ」「học ngoại ngữ qua trang web」（文档 03 §1.4 的 vi 通用学习词）、「giọng iOS không giới hạn số lần」「Không giới hạn」（价格表 / FAQ 的属实说法）、「tiện khi theo dõi những tài khoản…」（X 卡片，theo dõi = 关注）、「Một số tính năng…」（FAQ，"một số" = 一些）、「Thư viện khu phố của chúng tôi…」（样张译文里的"我们"属于虚构文章）。把词表合入新副本（HEAD `3d520ab` + vi）后：构建 / `--pseudo` 全站 0 error，vi 的 L-14 / L-9 汇总 W 消失，`check.mjs` 0 / 0，测试 62/62；测完已把副本的数据文件还原，并与真实仓库逐字节比对一致。

| 规则 | 反例句（全部命中） |
|---|---|
| whole-page | Dịch toàn bộ trang web chỉ với một chạm. ／ Dịch cả trang cùng lúc, không cần vuốt. |
| swipe-left | Vuốt sang trái để xem bản dịch. ／ Chỉ cần vuốt trái trên đoạn văn. |
| safari-extension | Dùng như tiện ích mở rộng Safari. ／ Dịch được trong bất kỳ ứng dụng nào. ／ Không cần chuyển ứng dụng. |
| selection-translate | Bôi đen văn bản để dịch ngay. ／ Dịch ngay khi chọn chữ. |
| offline | Dịch ngoại tuyến, không cần kết nối mạng. ／ Dùng được offline. |
| unlimited-ai-voice | Phát âm AI không giới hạn với Plus. ／ Plus có giọng đọc AI không giới hạn. |
| dark-mode-theme | Hỗ trợ chế độ tối và đổi màu chủ đề. ／ Tùy chỉnh giao diện tối. |
| shortcuts-volume | Tùy chỉnh phím tắt và âm lượng. |
| vocab-sync | Lưu từ vào sổ từ vựng và đồng bộ qua iCloud. ／ Ôn tập bằng thẻ ghi nhớ. |
| android | Tải bản Android trên CH Play.（越南常用的 Google Play 叫法）／ Có trên Google Play. |
| desktop-version | Có phiên bản cho máy tính Windows. ／ Tải ứng dụng cho PC. |
| x-app | Dịch bài đăng ngay trong ứng dụng X. ／ Ứng dụng duy nhất dịch được X. |
| plus-early-access | Thành viên Plus được trải nghiệm sớm tính năng mới. |
| privacy-claim | WordByWord không thu thập bất kỳ dữ liệu cá nhân nào. ／ Ứng dụng không theo dõi người dùng. |
| initial-version | Phiên bản đầu hỗ trợ hơn 20 ngôn ngữ.（legacy vi 页原句） |
| language-pairs | Hỗ trợ hơn 20 cặp ngôn ngữ.（legacy vi 页原句） |
| style-count | Chọn 8 kiểu hiển thị bản dịch. ／ Có bảy kiểu bản dịch. |
| auto-detect-target | Ứng dụng tự động nhận diện ngôn ngữ đích. ／ Ngôn ngữ đích được tự động nhận diện. |
| history-by-date | Lịch sử được tự động nhóm theo ngày.（legacy vi 页原句） |
| plus-only | Phân tích cú pháp chỉ dành cho Plus. ／ Tính năng độc quyền của gói Plus. |
| speaking-practice | Luyện phát âm và cải thiện kỹ năng nói. ／ Luyện nghe nói mỗi ngày. |
| replacement-tone | Nếu bạn học tiếng Anh, SurfEnglish có thể phù hợp hơn với bạn.（文档 04 T10 的 vi 种子）／ SurfEnglish thay thế WordByWord. ／ Ứng dụng chị em của WordByWord. |
| se-on-device-voice | Giọng AI trên thiết bị, dùng được ngoại tuyến. ／ Giọng đọc offline.（只作用于 SE 卡片与 FAQ `english-learner`） |
| se-hype | Mới: SurfEnglish giúp bạn học nhanh hơn và tốt hơn WordByWord. ／ Nâng cấp lên SurfEnglish.（只作用于 SE 区块） |
| hype | Ứng dụng dịch tốt nhất, mang tính cách mạng. ／ Hơn 10.000 người dùng tin dùng. ／ Đội ngũ WordByWord xin giới thiệu. ／ Ứng dụng số 1 Việt Nam. |
| ext-language-count | Tiện ích dịch sang 20+ ngôn ngữ.（只作用于 `chromeExtension.*`） |
| seOwned（追加） | Đọc tin tức tiếng Anh theo trình độ ／ Luyện đọc tiếng Anh qua báo tiếng Anh ／ Nhóm nghĩa được tự động đánh dấu ／ Trích Xuất Cụm cho mọi câu |
| seOwnedLead | Bạn đang học tiếng Anh? Hãy thử SurfEnglish ／ Học tiếng Anh với SurfEnglish ／ Luyện tiếng Anh mỗi ngày |
| reservedG1 | Cách dịch trang web trên iPhone mà vẫn giữ nguyên bản gốc ／ Làm sao để dịch trang web trên iPhone ／ Hướng dẫn đọc trang web song ngữ |

说明：`se-hype` 的「mới」是整音节匹配，会拦掉 SE 区块里任何含「mới」的词（mới mẻ、đổi mới…），SE 文案里请避免；它不作用于 FAQ `restore`（"thiết bị mới"）。`hype` 的「duy nhất」「số một」只在前后不是字母时命中，"Một số tính năng"（一些功能）不命中。`seOwnedLead` 会作用于所有语言页面的 H2，vi 模式只匹配越南语开头。合入前请母语审校再看一遍 `privacy-claim` 的「không (bị) theo dõi (người dùng|bạn)」：「theo dõi」也有"关注"的意思，所以只拦"不追踪用户 / 你"这种搭配。

## 附录 B：验证记录

最终验证在 `…/scratchpad/wbw-m3-vi-final/`：rsync 自真实仓库（HEAD `3d520ab`，工作区干净，已发布 en / zh-Hans / zh-Hant / ja / ko / es / fr / pt-BR / de / it / nl / pl / uk / ru / tr），加入 `vi.json`、`glossary/vi.json`，并在副本里生成 `home-vi` OG；与真实仓库逐文件比对，只多这三个文件和 `og.json` 里的 home-vi 一项。

| 命令 | 结果 |
|---|---|
| `node scripts/og.mjs --only home-vi` | ✓ headline 56 px × 2、sub 30 px × 2、q82、146.0 KB |
| `node build.mjs --out …/dist` | 23 页，**0 error**；vi 的 W：L-4（2 review + 6 expected）、L-14（25 条规则无 vi 词表）、L-9（无 vi 的 G1 模式） |
| `node build.mjs --pseudo --out …/dist-pseudo` | **0 error** |
| `node scripts/check.mjs` | 23 个 HTML，0 error，0 warning |
| `node scripts/check.mjs --keys vi` | 0 missing，0 not in en |
| `node --test scripts/tests/*.test.mjs` | 62 / 62 通过 |
| 合入 `vi-lint.json` 后 build / `--pseudo` / check / 测试 | 0 error；vi 只剩 L-4；check 0 / 0；测试 62 / 62（测完已还原数据文件） |

长度实测（占位符代入后，`text-length.mjs` 口径，拉丁文字按字素计）：

| 键 | 上限 | 实测 |
|---|---|---|
| `meta.title` | ≤ 60 | 56 |
| `meta.description` | 120–160 | 160 |
| `hero.title` | ≤ 75 | 74 |
| `hero.eyebrow` | ≤ 60 | 52 |
| `hero.lede` = `ledeShort` | ≤ 150 / ≤ 90 | 75 |
| `hero.how` | ≤ 180（L-8 220） | 174 |
| `hero.platformNote` | ≤ 140 | 136 |
| `hero.ctaNote` / `hero.secondaryCta` | ≤ 40 / ≤ 24 | 29 / 14 |
| kicker（swipe / lookup / x） | ≤ 24 | 12 / 20 / 24 |
| 功能 H3（最长：x / speech） | ≤ 70 | 68 / 64 |
| 规格清单 engines / display / history / devices | ≤ 80 | 80 / 78 / 69 / 73 |
| `features[chunks].text`（最长正文） | ≤ 320 | 305 |
| `features[x].sample.translation` | ≤ 120 | 80 |
| `languages.title` / `cta.title` | ≤ 70 | 46 / 42 |
| `pricing.summary` / `cta.recap` | ≤ 100 / ≤ 90 | 98 / 56 |
| `sibling.card.title` | ≤ 60 | 57 |
| `sibling.card.body` | ≤ 45 词 | 38 词（186 字符） |
| `sibling.card.points` | ≤ 45 | 37 / 35 / 31 |
| `sibling.card.linkText` / `appStoreLinkText` | ≤ 60 | 40 / 30 |
| `nav.downloadShort` | ≤ 10 | 6 |
| alt（最长：`gallery.items[dictionary]` / `meta.ogImageAlt` / `features[lookup]`） | ≤ 125 | 125 / 124 / 124 |
| `demo.translation`（合计） | ≤ 180 | 115 |
| FAQ 问句 / 答案（最长） | ≤ 120 / ≤ 600 | 65 / 456 |
