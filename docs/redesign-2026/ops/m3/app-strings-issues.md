# WordByWord App 本地化字符串问题清单（M3 网站译者报告汇总）

| 项 | 内容 |
|---|---|
| 给谁 | App 开发者（改 `WordByWordPrototype/Localizable.xcstrings`） |
| 来源 | `docs/redesign-2026/ops/m3/` 下 17 份 `*-qa.md`（zh-Hant ko es pt-BR fr de it nl pl ru tr uk vi th id ar hi；ja、zh-Hans 没有 M3 记录）里报给 App 侧的条目；文档 08 §7.2.2 的 X1–X13（M3 之前已知），以及 §7.2.4 对 zh-TW 的说明 |
| 核对对象 | `WordByWordPrototype/Localizable.xcstrings`（dev 分支，最后一次改动是提交 0866b4e，2026-06-03；315 个键）。只读核对，没有改动 |
| 日期 | 2026-10-06 |

读法：

- "键"一律写 xcstrings 里的原键名（有些键带空格或 `%lld`，照抄）；zh-Hant 在 xcstrings 里的语言代码是 `zh-TW`。
- "现值"是从目录里读出来的当前值。一行涉及多个键、而且值不同时，用 ①②③ 对应键和值；值相同的键合在同一个编号里。
- "问题"列末尾的括号写来源：`ko §9-5` 指 `ko-qa.md` 第 9 节第 5 条，`X3` 指文档 08 §7.2.2 的 X3。标"核对补充"的内容是汇总时对照目录补上的事实，不是译者原话；它们没有改变任何一条的结论，只是补全了键名或范围。
- "建议值"优先照录译者的写法；译者只给了方向的（如"统一用 IA""只大写首词"），按方向补成了具体写法；来源完全没给写法的地方写明"请母语确定"。补写的和标"请母语确定"的，改 App 前都应请母语过目。App 改名后，网站的 glossary（`src/data/glossary/<locale>.json` 的 `required` / `contains`）和文档 08 §7.2.1 表 T-A…T-E 要跟着改。
- 严重度：**高** = 意思错、语言 / 文字错（如 uk 里的俄语词、id 里的马来语、zh-TW 里的简体字）、用户看得到的语法错误或错字；**中** = 同一概念叫法不一致（含 AI 写法混用、称谓混用、潜在的复数错误）；**低** = 文体（大小写、空格、语序直译、借词）以及需要真机或母语确认的条目。

## 1. 摘要

共 **138 条**（高 38 / 中 63 / 低 37），分布在 18 种语言（17 份 QA 记录的语言，加上只有 X13 的 zh-Hans）；另有 en 源串问题 4 条（§4）。X1–X13 在目录里**全部仍未修正**（§5）。目录自 2026-06-03 以后没有改动，所以下表里的现值就是当前值。

### 1.1 各语言条数

| 语言 | 条数 | 高 | 中 | 低 | 主要问题 |
|---|---|---|---|---|---|
| zh-Hant（zh-TW） | 8 | 4 | 3 | 1 | 20 个键仍是简体字（X1、X2 未改）；“本地”等大陆用语；右滑翻译两个名字 |
| ko | 5 | 1 | 2 | 2 | 汉字“任意”（X3）；祈使句功能名（X4）；“더블 탭 번역”“검색 기록” |
| es | 1 | 0 | 1 | 0 | AI / IA 混用 |
| pt-BR | 5 | 0 | 2 | 3 | AI / IA 混用；书签两种叫法；Premium / Enhanced |
| fr | 5 | 0 | 3 | 2 | AI / IA 混用；鼠标说法（X7）；“balayage”；Title Case |
| de | 5 | 0 | 3 | 2 | 鼠标说法（X7）；AI / KI 混用；du / Sie 混用；Title Case |
| it | 8 | 3 | 2 | 3 | 升级与更新同词；“iscrizione”当订阅；性不一致；swipe / scorrimento |
| nl | 11 | 6 | 3 | 2 | 挪威语（X5）、“Cita Stijl”（X6）；“Lezing”；错字；“Ingeschreven”；je / u |
| pl | 13 | 1 | 7 | 5 | “Zaktualizuj”当升级；阳性过去时；点按、右滑、语音各有两个名字；缺复数 |
| ru | 8 | 2 | 4 | 2 | 升级与更新同词；性不一致；“найти”；AI / ИИ 混用；手势三种叫法 |
| tr | 8 | 3 | 3 | 2 | “Limit Raporlandı”；提示语法不通；人称错；“aramak”；AI / Yapay Zeka |
| uk | 10 | 4 | 4 | 2 | 俄语词（Граница、Сплошне、движок）；升级与更新同词；“знайти”；AI / ШІ |
| vi | 7 | 1 | 4 | 2 | “Dịch Chuyển”（X9）；“Tìm kiếm”；“tại chỗ”；书签两种叫法 |
| th | 11 | 3 | 6 | 2 | “ท้องถิ่น”（X11）、“เครื่องยนต์”；引用样式译成文献引用；多处两种叫法 |
| id | 9 | 3 | 4 | 2 | 整句马来语；“Edit Bookmarks”未翻译；“Bacaan”；gesek / geser（X12） |
| ar | 12 | 2 | 8 | 2 | Action Flow 缺译（X8）；“50 مرات”复数错；“للذكاء الاصطناعي”；多处两种叫法 |
| hi | 11 | 5 | 3 | 3 | “पढ़ाई”（X10，Local 同错）；非词“असदस्ताक्षरित”；性一致、语义错 |
| zh-Hans | 1 | 0 | 1 | 0 | 没有 M3 记录，只有 X13 |
| ja | 0 | 0 | 0 | 0 | 没有 M3 记录，X 表也不涉及 ja |
| **合计** | **138** | **38** | **63** | **37** | |
| en（源串） | 4 | 2 | 1 | 1 | `folder_name_label` = "Border"、`usage_section_title` = "Dashed Underline"、"Double-tap translation" |

（一条 = 一个问题，可能涉及多个键。es 只有 1 条，是因为 es 译者只把 AI / IA 混用报给了 App 侧；不代表 es 没有 P2 一类问题。）

### 1.2 跨语言模式

| 模式 | 涉及语言（条数） | 说明 |
|---|---|---|
| [P0](#p0) 错语言 / 错文字（混进别的语言、简体字、汉字，或没翻译） | zh-Hant×4、ko、nl×2、uk×3、id×2、ar（13） | 界面里出现了不属于该语言的文字。这一类都按"高"处理。 |
| [P1](#p1) "AI" 与本语言写法混用，或 "AI" 的修饰关系译错 | es、pt-BR、fr、de、it、ru×2、tr、uk、ar、hi（11） | 同一界面一会儿写拉丁字母 "AI"，一会儿写本语言的缩写或全称（IA、KI、ИИ、ШІ、Yapay Zeka、एआई）；ru、ar、it 还有"AI 的句法""AI Pronuncia"这类修饰关系 / 语序问题。 |
| [P2](#p2) 英语式词首大写（Title Case） | fr、de、it、nl、pl、ru、uk、vi、id（9） | 按钮和设置名照 en 逐词大写；这些语言的界面规范只大写首词（德语名词除外）。 |
| [P3](#p3) Upgrade 与 Update 用同一个词 | it、pl、ru、uk（4） | "升级到 Plus" 被译成了"更新"，或与 `update_now_button`（更新 App）同值，用户分不清。 |
| [P4](#p4) 功能名写成祈使句 | ko、ru、tr（3） | `daily_sentence_translation_limit`（en "Swipe to Translate"）被译成"请滑动以翻译"式的祈使句；App 的免费 / Plus 对比页把它和引擎名拼在一起当行名显示。 |
| [P5](#p5) 触屏手势用了鼠标说法"双击（double-click）" | fr、de、nl、ar（4） | 提示语写成鼠标的 double-click，而不是触屏的 double-tap。 |
| [P6a](#p6a) 同一手势 / 功能叫法不一：右滑翻译 | zh-Hant、de、it、nl、pl、ru、th、id、zh-Hans（9） | 功能名、历史页、引擎设置、说明文字对"右滑翻译"各用各的词。 |
| [P6b](#p6b) 同一手势 / 功能叫法不一：双击 / 点按 | ko、pl、vi、id、ar（5） | 同一个"双击""点按"在不同字符串里用了不同动词或名词。 |
| [P6c](#p6c) 同一概念叫法不一：书签、历史、源语言、引擎、朗读模式、句法解析、升级、反馈 | ko、pt-BR、nl、pl×2、uk、vi、th×2、id、ar×3、hi（14） | 同一个界面概念在不同键里用了两个以上的名字。 |
| [P7](#p7) "不支持双击"提示把查词叫成"翻译" | ko、pl、vi、th、id、ar、hi（7） | `double_tap_not_supported_message` 说的是双击查词，各语言却写成"双击翻译"；根源在 en 原文（§4 第 3 条）。 |
| [P8](#p8) "Look Up（查词）"译成"搜索 / 找到" | pt-BR、pl、ru、tr、uk、vi、th（7） | `word_meaning_lookup_title`（en "Double-tap to Look Up (AI Meaning)"）里的 Look Up 被译成"搜索"或"找到"，读起来像网页搜索。 |
| [P9](#p9) 朗读功能名（AI Read / Local Read）译错或叫法不一 | nl、pl×2、vi、th、id、ar、hi（8） | "Read" 被译成"学习""讲座""读物""地方性"等；本地语音在不同页面有两个名字。 |
| [P10](#p10) 同一 en 文本有两个键，两次翻译不一致 | it、nl、tr、uk、id、ar（6） | `Quote Style` / `Dashed Underline` / `Border` 这几个以英文原文为键的条目，与 `translation_style_*` 各翻了一次，结果不同。 |
| [P11](#p11) 次数 / 数量没有复数变体 | pl、uk、ar（3） | `%lld` 后面的名词没有按数变形。 |
| [P12](#p12) iOS 语音档名 Premium / Enhanced 没有本地化 | pt-BR、it、vi、th、id（5） | `local_speech_engine_*` 让用户去系统设置下载 "Premium / Enhanced" 语音，但系统里这两档显示的是本地化名称。 |
| [P13](#p13) 称谓 / 语体不统一（含默认阳性） | de、nl、pl（3） | 同一 App 里 du / Sie、je / u 混用；pl 的提示只用阳性过去时。 |
| [P14](#p14) 订阅状态用词或语法错误 | it、nl、tr、hi（4） | "订阅"被译成"注册 / 报名"，或订阅状态句子有语法错误。 |

### 1.3 最严重的问题

1. **en 源串里两个标题放错了值**：`folder_name_label` = "Border"（书签 / 文件夹编辑页名称输入框上方的标题，英语用户编辑书签就会看到）、`usage_section_title` = "Dashed Underline"（朗读额度视图的标题，该视图目前没被引用）。其余语言的译文反而是对的（§4）。
2. **zh-TW 还有 20 个键是简体字**：X1（更多释义）、X2（下划线 6+1 个键）都没改，另有"创建文件夹""删除书签""无法获取词典数据""下载""折叠"等 12 个键。
3. **id 的 `tts_trial_exhausted_fallback_message` 整句是马来语**，而且把"AI 播放次数"译成了"AI 玩具"（mainan AI）；`edit_bookmark_title` 还是英文"Edit Bookmarks"。
4. **uk、nl、ar 界面里有别的语言**：uk 的边框 / 实线下划线样式名和本地语音说明是俄语词（Граница、Сплошне、движок）；nl 的 `ai_pronunciation_sentence` 是挪威语（X5）、引用样式是"Cita Stijl"（X6）；ar 的 Action Flow 整组 15 个键缺译，界面显示英文（X8）。
5. **购买路径上"升级"被写成"更新"**：it、ru、uk 的 `upgrade_now_button` 与 `update_now_button` 同值（Aggiorna Ora / Обновить Сейчас / Оновити Зараз）；pl 三条额度提示写"Zaktualizuj（更新）do Plus"。用户在订阅页、设置页都会碰到。
6. **朗读功能名意思错**：hi"AI पढ़ाई / स्थानीय पढ़ाई"是"学习"（X10 只列了前一个）、th"ท้องถิ่น"是"地方的"（X11）、nl"Lezing"是"讲座"、id"Bacaan"是"读物"；th 还把 engine 写成了"发动机"（เครื่องยนต์）。
7. **用户看得到的语法错误和错字**：ru `audio_playback_description_streaming` 性不一致；it `tts_trial_limit_reached_title` 性不一致；tr `limit_reached_title`"Limit Raporlandı"（已报告限额）、`tip_swipe_to_translate` 不通、`subscribed_user_message` 人称错；nl 三处错字；hi 非词"असदस्ताक्षरित"和两处阴阳性错误；ar 的次数"50 مرات"复数错（对比页上可见）。

### 1.4 成因与修改建议（汇总时的判断，不是译者原话）

- **很多问题是照搬 en 带来的**：en 按钮用 Title Case → 9 种语言报告了逐词大写（P2）；en 功能名"Swipe to Translate"是动词短语 → ko、ru、tr 译成祈使句（P4）；en"Double-tap translation"→ 所有语言都写"双击翻译"（P7）；en 的 `limit_per_day%lld` 没有复数变体 → pl、uk、ar 跟着没有（P11）。改 en 和给关键键补说明，比逐语言修更省事。
- **出问题最多的键缺少给译者的说明**：目录 315 个键里 162 个有 comment（都是中文），但 `daily_sentence_translation_limit`、`upgrade_now_button`、`update_now_button`、`double_tap_not_supported_message`、`limit_per_day%lld` 都没有；`audio_playback_title_streaming` / `_local` 的 comment 只有"智能朗读 / 系统朗读"，"Read"仍被 4 种语言译错（P9）。建议给这些键补英文 comment，写明"功能名、名词短语""朗读（read aloud），不是阅读""Upgrade = 购买升级到 Plus，不是更新 App""Look Up = 查词义，不是搜索"。
- **同一 en 文本有两个键**（P10）：遗留的 `Quote Style` / `Dashed Underline` / `Border` 和 `translation_style_*` 各翻一次，结果分叉。删掉遗留键即可消除这一类。
- **按语言安排一次母语过目**：P6 的"一个概念多个叫法"在 15 种语言里都有，只靠修报告里列出的键不够。建议每种语言请母语审校按本表把同一概念统一成一个词，同时检查 P2 的大小写。
- **修改后同步网站**：网站的 kicker、价格表行名和 FAQ 里的按钮名按规则 ① 照 App 原文引用（glossary 的 `required` / `contains`）。App 改了名，这些地方和文档 08 表 T-A…T-E 要一起改，否则构建会报 L-13。

## 2. 跨语言问题

每个模式一张表；一条问题如果同时属于两个模式，会在两张表里都出现。严重度见 §3。

### P0

**错语言 / 错文字（混进别的语言、简体字、汉字，或没翻译）**。界面里出现了不属于该语言的文字。这一类都按"高"处理。

| 语言 | 键 | 现值 | 问题 | 建议值 |
|---|---|---|---|---|
| zh-Hant | `more_definitions_title` | “更多释义” | 繁体界面里是简体字。（来源：X1） | 更多釋義 |
| zh-Hant | ① `translation_style_title_underline_solid`、`translation_style_description_underline_solid`<br>② `translation_style_title_underline_dashed`、`translation_style_description_underline_dashed`、`Dashed Underline`<br>③ `translation_style_title_underline_wavy`、`translation_style_description_underline_wavy` | ① “下划线（实线）”<br>② “下划线（虚线）”<br>③ “下划线（波浪线）” | 简体字（下划线、实线、虚线）。（来源：X2） | 底線（實線）／底線（虛線）／底線（波浪線） |
| zh-Hant | ① `create_folder_button`<br>② `delete_bookmark_button`<br>③ `delete_bookmark_confirm`<br>④ `dictionary_load_failed_message` | ① “创建文件夹”<br>② “删除书签”<br>③ “您想要删除书签吗？”<br>④ “无法获取词典数据，请稍后再试。” | 简体字，而且是大陆用语（文件夹、获取、数据）。这是文档 08 §7.2.4 点名的例子。（来源：08 §7.2.4） | 建立資料夾／刪除書籤／要刪除書籤嗎？／無法取得字典資料，請稍後再試。 |
| zh-Hant | ① `collapse_button`<br>② `default_folder_name`<br>③ `delete_swipe_action`<br>④ `dictionary_load_failed_title`<br>⑤ `download_button`<br>⑥ `download_cancelled_message`<br>⑦ `learn_more_plus_features_button`<br>⑧ `more_definitions_trial_exhausted_message` | ① “折叠”<br>② “新建文件夹”<br>③ “删除”<br>④ “无法加载词典数据”<br>⑤ “下载”<br>⑥ “下载已取消”<br>⑦ “了解 Plus 版的好处”<br>⑧ “您今天已使用完「更多释义」的所有免费试用。升级到 Plus 以解锁更多功能。” | 同样是简体字。核对补充：为核实 08 §7.2.4"部分仍是简体"的说法，用 Big5 字符集扫描了全部 zh-TW 值，共 20 个键含简体字；X1、X2 和上一行占 12 个，这 8 个是剩下的。（来源：08 §7.2.4，核对补充） | 折疊／新增資料夾／刪除／無法載入字典資料／下載／已取消下載／了解 Plus 的好處／您今天已用完「更多釋義」的所有免費試用。升級到 Plus 以解鎖更多功能。 |
| ko | `tip_swipe_to_translate` | “任意의 텍스트를 오른쪽으로 스와이프하여 번역을 표시합니다.” | 混入汉字"任意"。（来源：X3） | 아무 텍스트나 오른쪽으로 스와이프하면 번역이 표시됩니다. |
| nl | `ai_pronunciation_sentence` | “AI Uttale (Setning)” | 这是挪威语。（来源：X5） | AI-uitspraak (zin) |
| nl | ① `translation_style_title_quote_style`<br>② `Quote Style` | ① “Cita Stijl”<br>② “Citatstijl” | "Cita Stijl"不是荷兰语；"Citatstijl"拼错。（来源：X6） | Citaatstijl |
| uk | `translation_style_title_border`、`translation_style_description_border` | “Граница” | 俄语词"Граница"；同一含义的 `Border` 键是"Межа"。（来源：uk §6-6①） | Межа（与 `Border` 键一致） |
| uk | `translation_style_title_underline_solid`、`translation_style_description_underline_solid` | “Сплошне Підкреслення” | "Сплошне"是俄语形式。（来源：uk §6-6②） | Суцільне підкреслення |
| uk | ① `audio_playback_description_local`<br>② `swipe_translation_engine_mode_local_title` | ① “Використовує вбудований голосовий движок пристрою, висока швидкість, роботизований тон.”<br>② “Локальний рушій” | 说明里用俄语词"движок"，设置页用乌克兰语"рушій"。（来源：uk §6-6④、§2 Q6） | …вбудований голосовий рушій пристрою… |
| id | `tts_trial_exhausted_fallback_message` | “Anda telah menggunakan masa percubaan percuma hari ini. Beralih ke sebutan tempatan. Naik taraf ke Plus untuk membuka kunci lebih banyak mainan AI.” | 整句是马来语：percubaan percuma（马来语"免费试用"，印尼语 percuma 是"白费"）、sebutan tempatan（本地发音）、naik taraf（升级）；"mainan AI"是"AI 玩具"。（来源：id §6-4） | Anda telah menggunakan uji coba gratis hari ini. Beralih ke pelafalan lokal. Tingkatkan ke Plus untuk membuka lebih banyak pemutaran AI. |
| id | ① `edit_bookmark_title`<br>② `bookmark_title` | ① “Edit Bookmarks”<br>② “Bookmark” | "Edit Bookmarks"没有翻译；书签全部用英语借词"Bookmark"（iOS 印尼语 Safari 用"Penanda"）。（来源：id §6-4） | 如统一用"Penanda"：Edit Penanda／Penanda |
| ar | `sentence_skeleton_*`（15 个键，如 `sentence_skeleton_settings_navigation_title`、`sentence_skeleton_ui_analyze`） | （没有 ar 值，界面显示英文，如 "Sentence Action Flow""Action flow"） | Action Flow 整组缺译。（来源：X8、ar §6-7） | 补阿语；网站暂写"Action Flow (تسلسل الأفعال في الجملة)"，待母语复核 |

### P1

**"AI" 与本语言写法混用，或 "AI" 的修饰关系译错**。同一界面一会儿写拉丁字母 "AI"，一会儿写本语言的缩写或全称（IA、KI、ИИ、ШІ、Yapay Zeka、एआई）；ru、ar、it 还有"AI 的句法""AI Pronuncia"这类修饰关系 / 语序问题。

| 语言 | 键 | 现值 | 问题 | 建议值 |
|---|---|---|---|---|
| es | ① `audio_playback_title_streaming`<br>② `word_meaning_lookup_title`<br>③ `ai_pronunciation_word`<br>④ `ai_pronunciation_sentence`<br>⑤ `audio_playback_description_streaming` | ① “Lectura AI”<br>② “Toca dos veces para buscar (Significado AI)”<br>③ “Pronunciación AI (Palabra)”<br>④ “Pronunciación AI (Oración)”<br>⑤ “Utiliza la síntesis de voz AI basada en la nube, tono natural, velocidad ligeramente más lenta.” | 写拉丁字母"AI"；同一界面的 `get_syntax_explanation_button`、`grammar_structure_analysis`、`unlock_pronunciation_prompt` 写西语的"IA"。（来源：es §6-5） | 统一用 IA：Lectura con IA／Toca dos veces para buscar (Significado con IA)／Pronunciación con IA (Palabra)／Pronunciación con IA (Oración)／síntesis de voz con IA |
| pt-BR | ① `audio_playback_title_streaming`<br>② `ai_pronunciation_word`<br>③ `ai_pronunciation_sentence`<br>④ `word_meaning_lookup_title`<br>⑤ `audio_playback_description_streaming` | ① “Leitura AI”<br>② “Pronúncia AI (Palavra)”<br>③ “Pronúncia AI (Frase)”<br>④ “Toque duas vezes para procurar (Significado AI)”<br>⑤ “Usa a síntese de fala AI baseada em nuvem, tom natural, velocidade um pouco mais lenta.” | 写"AI"；`grammar_structure_analysis`、`get_syntax_explanation_button` 写"IA"。（来源：pt-BR §6-2①） | 统一用 IA：Leitura com IA／Pronúncia com IA (Palavra)／Pronúncia com IA (Frase)／(Significado com IA)／síntese de fala com IA |
| fr | ① `audio_playback_title_streaming`<br>② `ai_pronunciation_word`<br>③ `ai_pronunciation_sentence`<br>④ `audio_playback_description_streaming`<br>⑤ `tts_trial_exhausted_fallback_message` | ① “Lecture AI”<br>② “Prononciation AI (Mot)”<br>③ “Prononciation AI (Phrase)”<br>④ “Utilise la synthèse vocale AI basée sur le cloud, ton naturel, vitesse légèrement plus lente.”<br>⑤ “Vous avez épuisé l'essai gratuit d'aujourd'hui. Passé à la prononciation locale. Mettez à niveau vers Plus pour débloquer plus de lectures AI.” | 写"AI"；`word_meaning_lookup_title`（Signification IA）、`get_syntax_explanation_button`、`grammar_structure_analysis` 写"IA"。（来源：fr §5②、§6-5） | 统一用 IA：Lecture IA／Prononciation IA (Mot)／Prononciation IA (Phrase)／synthèse vocale IA／lectures IA |
| de | ① `get_syntax_explanation_button`<br>② `grammar_structure_analysis` | ① “AI-Syntax-Erklärung abrufen”<br>② “AI-Syntax-Strukturanalyse” | 写"AI-"；其余都写德语的"KI-"（KI-Lesen、KI-Aussprache、KI-Bedeutung）。（来源：de §6-5④） | KI-Syntax-Erklärung abrufen／KI-Syntax-Strukturanalyse |
| it | ① `ai_pronunciation_word`<br>② `ai_pronunciation_sentence` | ① “AI Pronuncia (Parola)”<br>② “AI Pronuncia (Frase)” | 英语语序"AI Pronuncia"，意大利语应把 AI 放在后面。（来源：it §6-5） | Pronuncia AI (parola)／Pronuncia AI (frase) |
| ru | ① `ai_pronunciation_word`<br>② `ai_pronunciation_sentence`<br>③ `word_meaning_lookup_title`<br>④ `audio_playback_description_streaming`<br>⑤ `unlock_pronunciation_prompt` | ① “AI произношение (слово)”<br>② “AI произношение (предложение)”<br>③ “Дважды коснитесь, чтобы найти (AI Значение)”<br>④ “Использует облачную AI-синтез речи, естественный тон, более медленная скорость.”<br>⑤ “Используйте AI-перевод, анализ контекста и высококачественный AI-голос с большей свободой. Улучшите свой опыт изучения языка.” | 写"AI"；`audio_playback_title_streaming`（Чтение ИИ）、句法解析两键写"ИИ"。（来源：ru §5-2） | 统一 ИИ（如"Произношение ИИ (слово)"） |
| ru | ① `grammar_structure_analysis`<br>② `get_syntax_explanation_button` | ① “Анализ структуры синтаксиса ИИ”<br>② “Получить объяснение синтаксиса ИИ” | 属格链"синтаксиса ИИ"读起来像"AI 的句法"。（来源：ru §5-8） | Анализ синтаксиса с помощью ИИ／Получить объяснение синтаксиса от ИИ |
| tr | Yapay Zeka：`audio_playback_title_streaming`、`ai_pronunciation_*`、`get_syntax_explanation_button`、`grammar_structure_analysis`<br>AI：`word_meaning_lookup_title`、`audio_playback_description_streaming`、`unlock_pronunciation_prompt`、`tts_trial_exhausted_fallback_message`<br>Sözdizimi：`label_syntax_explanations` | `audio_playback_title_streaming`：“Yapay Zeka Okuma”<br>`word_meaning_lookup_title`：“Aramak için çift dokunun (AI Anlamı)”<br>`get_syntax_explanation_button`：“Yapay Zeka Söz Dizimi Açıklamasını Al”<br>`label_syntax_explanations`：“Sözdizimi Açıklamaları” | "AI"与"Yapay Zeka"混用；"Söz Dizimi"与"Sözdizimi"混用（TDK 写"söz dizimi"）。（来源：tr §8-8） | 二选一统一（如全用"Yapay Zeka"）；"Sözdizimi"改"Söz Dizimi" |
| uk | ① `audio_playback_title_streaming`<br>② `ai_pronunciation_word`<br>③ `ai_pronunciation_sentence`<br>④ `word_meaning_lookup_title`<br>⑤ `audio_playback_description_streaming`<br>⑥ `unlock_pronunciation_prompt` | ① “AI Читання”<br>② “AI вимова (Слово)”<br>③ “AI вимова (Речення)”<br>④ “Двічі торкніться, щоб знайти (AI Значення)”<br>⑤ “Використовує хмарний AI-синтез мови, природний тон, повільніша швидкість.”<br>⑥ “Використовуйте AI-переклад, аналіз контексту та високоякісний AI-голос з більшою свободою. Покращте свій досвід вивчення мови.” | 写"AI"；句法解析两键写"ШІ"。（来源：uk §6-6⑤） | 统一 ШІ |
| ar | ① `grammar_structure_analysis`<br>② `get_syntax_explanation_button` | ① “تحليل بنية الجملة النحوية للذكاء الاصطناعي”<br>② “احصل على شرح التركيب النحوي للذكاء الاصطناعي” | "للذكاء الاصطناعي"是"AI …"的直译，字面是"属于 AI 的"。（来源：ar §6-7） | تحليل بنية الجملة النحوية بالذكاء الاصطناعي／احصل على شرح التركيب النحوي بالذكاء الاصطناعي |
| hi | ① `grammar_structure_analysis`<br>② `get_syntax_explanation_button` | ① “एआई वाक्य रचना संरचना विश्लेषण”<br>② “एआई वाक्य रचना व्याख्या प्राप्त करें” | 写天城文"एआई"；其余都是拉丁字母"AI"。（来源：hi §6-4②） | 统一"AI" |

### P2

**英语式词首大写（Title Case）**。按钮和设置名照 en 逐词大写；这些语言的界面规范只大写首词（德语名词除外）。

en 的按钮和设置名本身是 Title Case（“Upgrade Now”“Sentence by Sentence”“Restore Purchase”），译文照搬了这个大小写。下表只列译者报告的语言和他们举的例子；同类写法在这些语言里还有更多，改的时候可整体过一遍。

| 语言 | 键 | 现值 | 问题 | 建议值 |
|---|---|---|---|---|
| fr | ① `upgrade_now_button`<br>② `translation_mode_title_sentenceBySentence` | ① “Mettre à Niveau Maintenant”<br>② “Phrase par Phrase” | 英语式词首大写，法语只大写首词。（来源：fr §5①） | Mettre à niveau maintenant／Phrase par phrase |
| de | ① `upgrade_now_button`<br>② `restore_purchase_button`<br>③ `upgrade_to_plus_button`<br>④ `swipe_translation_switch_and_retry_button` | ① “Jetzt Upgraden”<br>② “Kauf Wiederherstellen”<br>③ “Auf Plus Upgraden”<br>④ “Wechseln und Erneut Versuchen” | 动词大写不合德语正字法（德语只有名词大写）。（来源：de §6-5②） | Jetzt upgraden／Kauf wiederherstellen／Auf Plus upgraden／Wechseln und erneut versuchen |
| it | ① `daily_sentence_translation_limit`<br>② `setting_description_select_translation_mode`<br>③ `translation_mode_title_sentenceBySentence`<br>④ `restore_purchase_button` | ① “Scorri per Tradurre”<br>② “Seleziona Modalità di Traduzione”<br>③ “Frase per Frase”<br>④ “Ripristina Acquisto” | 英语式词首大写。（来源：it §6-5） | Scorri per tradurre／Seleziona modalità di traduzione／Frase per frase／Ripristina acquisto |
| nl | ① `upgrade_now_button`<br>② `restore_purchase_button`<br>③ `retry_button`<br>④ `swipe_translation_switch_and_retry_button` | ① “Nu Upgraden”<br>② “Aankoop Herstellen”<br>③ “Opnieuw Proberen”<br>④ “Schakel Om en Probeer Opnieuw” | 英语式词首大写，荷兰语只大写首词。（来源：nl §6-3⑧） | Nu upgraden／Aankoop herstellen／Opnieuw proberen／Schakel om en probeer opnieuw |
| pl | ① `restore_purchase_button`<br>② `upgrade_now_button`<br>③ `translation_mode_title_sentenceBySentence`<br>④ `audio_playback_title_local`<br>⑤ `Chunk Extraction`<br>⑥ `view_title_translation_history`<br>⑦ `setting_description_source_language`<br>⑧ `translation_style_title_quote_style`<br>⑨ `swipe_translation_switch_and_retry_button` | ① “Przywróć Zakup”<br>② “Uaktualnij Teraz”<br>③ “Zdanie po Zdaniu”<br>④ “Lokalne Czytanie”<br>⑤ “Ekstrakcja Fragmentów”<br>⑥ “Historia Tłumaczeń”<br>⑦ “Język Źródłowy”<br>⑧ “Styl Cytowania”<br>⑨ “Przełącz i Spróbuj Ponownie” | 英语式词首大写，波兰语只大写首词。另：第二模型指出 iOS 里恢复购买的通行叫法是"Przywróć zakupy"。（来源：pl §6-8） | Przywróć zakupy／Uaktualnij teraz／Zdanie po zdaniu／Lokalne czytanie／Ekstrakcja fragmentów／Historia tłumaczeń／Język źródłowy／Styl cytowania／Przełącz i spróbuj ponownie |
| ru | ① `Chunk Extraction`<br>② `translation_mode_title_sentenceBySentence`<br>③ `view_title_swipe_history`<br>④ `upgrade_now_button`<br>⑤ `restore_purchase_button`<br>⑥ `setting_description_source_language` | ① “Извлечение Фрагментов”<br>② “Предложение за Предложением”<br>③ “История Перевода Свайпом”<br>④ “Обновить Сейчас”<br>⑤ “Восстановить Покупку”<br>⑥ “Исходный Язык” | 英语式词首大写，俄语只大写首词。（来源：ru §5-1） | Извлечение фрагментов／Предложение за предложением／История перевода свайпом／（升级按钮见 P3）／Восстановить покупку／Исходный язык |
| uk | ① `translation_mode_title_sentenceBySentence`<br>② `upgrade_now_button`<br>③ `setting_description_source_language` | ① “Речення за Реченням”<br>② “Оновити Зараз”<br>③ “Мова Джерела” | 英语式词首大写。（来源：uk §6-6⑥） | Речення за реченням／（升级按钮见 P3）／Мова джерела |
| vi | ① `daily_sentence_translation_limit`<br>② `translation_mode_title_auto`<br>③ `translation_mode_title_paragraph`<br>④ `translation_mode_title_sentenceBySentence`<br>⑤ `upgrade_now_button`<br>⑥ `Chunk Extraction`<br>⑦ `translation_style_title_quote_style`<br>⑧ `Quote Style` | ① “Vuốt để Dịch”<br>② “Tự Động”<br>③ “Đoạn Văn”<br>④ “Từng Câu”<br>⑤ “Nâng Cấp Ngay”<br>⑥ “Trích Xuất Cụm”<br>⑦ “Kiểu Trích Dẫn”<br>⑧ “Kiểu Trích dẫn” | 英语式词首大写；同一个样式名还有"Kiểu Trích Dẫn""Kiểu Trích dẫn"两种大小写。（来源：vi §6-3） | Vuốt để dịch／Tự động／Đoạn văn／Từng câu／Nâng cấp ngay／Trích xuất cụm／Kiểu trích dẫn（两个键统一） |
| id | ① `word_meaning_lookup_title`<br>② `daily_sentence_translation_limit` | ① “Ketuk dua kali untuk Mencari (Arti AI)”<br>② “Gesek untuk Menerjemahkan” | 大小写混用（"untuk Mencari""untuk Menerjemahkan"）。（来源：id §6-4） | Ketuk dua kali untuk mencari (Arti AI)／Geser untuk menerjemahkan |

### P3

**Upgrade 与 Update 用同一个词**。"升级到 Plus" 被译成了"更新"，或与 `update_now_button`（更新 App）同值，用户分不清。

核对补充（译者未报告，未计入统计）：es 的 `upgrade_now_button` 与 `update_now_button` 同为“Actualizar Ahora”，pt-BR 同为“Atualizar Agora”；de 的 `free_tts_limit_message`、`more_definitions_trial_exhausted_message` 写“Aktualisieren Sie auf Plus”（aktualisieren = 更新）。修 P3 时建议请这几种语言的母语一并确认。

| 语言 | 键 | 现值 | 问题 | 建议值 |
|---|---|---|---|---|
| it | ① `upgrade_now_button`、`update_now_button`<br>② `upgrade_to_plus_button`<br>③ `button_text_refresh` | ① “Aggiorna Ora”<br>② “Aggiorna a Plus”<br>③ “Aggiorna” | "Upgrade Now"与"Update Now"同为"Aggiorna Ora"，"Refresh"是"Aggiorna"；"aggiornare"首先是"更新"，用户分不清升级和更新。（来源：it §6-5） | 升级类改用"Passa a Plus"（App 自己的 `usage_status_upgrade_hint %@` 已是"Passa a Plus…"） |
| pl | ① `feature_trial_exhausted_message`<br>② `free_tts_limit_message`<br>③ `more_definitions_trial_exhausted_message`<br>④ `upgrade_to_plus_button`<br>⑤ `usage_status_upgrade_hint %@` | ① “Wykorzystałeś wszystkie dzisiejsze darmowe próby tej funkcji. Zaktualizuj, aby odblokować więcej.”<br>② “Wykorzystałeś wszystkie swoje darmowe wymowy na dziś. Zaktualizuj do Plus, aby uzyskać więcej.”<br>③ “Dziś wykorzystałeś wszystkie darmowe wersje próbne „Więcej definicji”. Zaktualizuj do Plus, aby odblokować więcej.”<br>④ “Uaktualnij do Plus”<br>⑤ “Przejdź na Plus, aby zwiększyć limit do %@.” | 三条额度提示写"Zaktualizuj (do Plus)"，"zaktualizować"是更新软件，用在这里是错的；同一动作在 `upgrade_to_plus_button` 是"Uaktualnij do Plus"、在 `usage_status_upgrade_hint %@` 是"Przejdź na Plus"，一个动作三种说法。（来源：pl §6-8） | 统一"Przejdź na Plus"（如"…Przejdź na Plus, aby odblokować więcej."） |
| ru | ① `upgrade_now_button`、`update_now_button`<br>② `upgrade_to_plus_button` | ① “Обновить Сейчас”<br>② “Обновить до Plus” | 升级和更新是同一个"Обновить Сейчас"，用户分不清；"Обновить до Plus"也容易读成"更新"。（来源：ru §5-5） | Перейти на Plus／Оформить Plus |
| uk | `upgrade_now_button`、`update_now_button` | “Оновити Зараз” | 升级与更新同为"Оновити Зараз"，"升级到 Plus"读起来像"立即更新"。（来源：uk §6-6⑧） | 升级按钮改如"Перейти на Plus"（来源未给写法，请母语确定） |

### P4

**功能名写成祈使句**。`daily_sentence_translation_limit`（en "Swipe to Translate"）被译成"请滑动以翻译"式的祈使句；App 的免费 / Plus 对比页把它和引擎名拼在一起当行名显示。

| 语言 | 键 | 现值 | 问题 | 建议值 |
|---|---|---|---|---|
| ko | `daily_sentence_translation_limit` | “번역하려면 스와이프하세요” | 祈使句（"要翻译就请滑动"）当功能名；在免费 / Plus 对比页里和引擎名拼成一行显示。`右滑翻译` 键已 stale，要改本键。（来源：X4） | 오른쪽 스와이프 번역 |
| ru | `daily_sentence_translation_limit` | “Проведите для перевода” | 祈使句当功能名（与 ko 的 X4 同类）；`右滑翻译` 键没有 ru 值。（来源：ru §5-4） | Перевод свайпом |
| tr | `daily_sentence_translation_limit` | “Çevirmek için Kaydırın” | 祈使句当功能名（与 ko 的 X4 同类）。（来源：tr §8-8） | Kaydırarak Çeviri |

### P5

**触屏手势用了鼠标说法"双击（double-click）"**。提示语写成鼠标的 double-click，而不是触屏的 double-tap。

| 语言 | 键 | 现值 | 问题 | 建议值 |
|---|---|---|---|---|
| fr | `tip_double_tap_context_meaning` | “Double-cliquez sur n'importe quel mot pour voir sa signification contextuelle.” | 鼠标说法"Double-cliquez"。（来源：X7） | Touchez deux fois un mot pour voir son sens dans le contexte. |
| de | `tip_double_tap_context_meaning` | “Doppelklicke auf ein beliebiges Wort, um seine kontextuelle Bedeutung anzuzeigen.” | 鼠标说法"Doppelklicke"。（来源：X7） | Doppeltippe auf ein beliebiges Wort, um seine Bedeutung im Kontext zu sehen. |
| nl | `tip_double_tap_context_meaning` | “Dubbelklik op een willekeurig woord om de contextuele betekenis te bekijken.” | 鼠标说法"Dubbelklik"。（来源：X7） | Dubbeltik op een woord om de betekenis in context te zien. |
| ar | ① `word_meaning_lookup_title`<br>② `tip_double_tap_context_meaning` | ① “انقر نقرًا مزدوجًا للبحث (معنى AI)”<br>② “انقر نقرًا مزدوجًا على أي كلمة لعرض معناها السياقي.” | "انقر نقرًا مزدوجًا"是 Microsoft 体系里鼠标"双击"的标准译法，iOS 触屏语境常见"اضغط مرتين"（与 X7 同类）；是否改由母语审校与 App 一起定。（来源：ar §6-7、§4-2） | اضغط مرتين（待定） |

### P6a

**同一手势 / 功能叫法不一：右滑翻译**。功能名、历史页、引擎设置、说明文字对"右滑翻译"各用各的词。

核对补充：`右滑翻译` 这个键在目录里已是 stale（代码不再引用；引导页的“右滑翻译”是写在 `OnboardingGuideView.swift` 里的字面量），界面上显示的功能名来自 `daily_sentence_translation_limit`（免费 / Plus 对比页的行名也是它）。所以 X4、X13 一类的修正要改 `daily_sentence_translation_limit`。

| 语言 | 键 | 现值 | 问题 | 建议值 |
|---|---|---|---|---|
| zh-Hant | `daily_sentence_translation_limit` | “滑動翻譯” | 同一功能两个名字：这里是"滑動翻譯"，历史页、引擎设置等处是"右滑翻譯"。核对补充：`右滑翻译` 键在目录里已是 stale（代码不再引用），所以要改的是本键。（来源：X13） | 右滑翻譯 |
| de | ① `view_title_swipe_history`<br>② `view_title_swipe_detail` | ① “Swipe Übersetzungshistorie”<br>② “Swipe Übersetzungsdetails” | 英德混用且缺连字符；功能名本身是"Wischen zum Übersetzen"。核对补充：`view_title_swipe_detail` 同样问题。（来源：de §6-5③） | 至少加连字符：Swipe-Übersetzungsverlauf／Swipe-Übersetzungsdetails；或与功能名统一成"Wisch-…" |
| it | ① `view_title_swipe_history`<br>② `view_title_swipe_detail`<br>③ `swipe_translation_engine_settings_navigation_title`<br>④ `Swipe Right Translation Mode Settings` | ① “Cronologia Traduzione Swipe”<br>② “Dettagli Traduzione Swipe”<br>③ “Motore di traduzione con scorrimento”<br>④ “Impostazioni della Modalità di Traduzione con Scorrimento a Destra” | 同一手势两种叫法："swipe"（历史页、详情页及 5 条说明文字）与"scorrimento"（引擎设置、右滑模式设置）。（来源：it §6-5） | 统一一种（功能名是"Scorri per tradurre"，建议统一"scorrimento"） |
| nl | ① `daily_sentence_translation_limit`<br>② `swipe_translation_engine_settings_navigation_title`<br>③ `swipe_translation_online_limit_reached_message`<br>④ `swipe_translation_engine_mode_local_title` | ① “Veeg om te vertalen”<br>② “Swipe-vertaalmotor”<br>③ “Je hebt alle online swipe-vertalingen voor vandaag gebruikt. Schakel over naar de lokale engine om door te gaan.”<br>④ “Lokale motor” | 同一手势两种叫法：功能名"Veeg om te vertalen"、说明里"veegvertaling"，其余是"swipe-vertaling / Swipe-vertaalmotor / Swipe Vertaalgeschiedenis"；引擎名"Lokale motor"，额度提示里却是"lokale engine"。（来源：nl §6-3⑥） | 手势统一一种（veeg- 或 swipe-）；引擎统一"motor" |
| pl | ① `chunk_extraction_mode_description_manual`<br>② `view_title_swipe_history`<br>③ `sentence_skeleton_mode_description_manual` | ① “Pokazuje przycisk fragmentów po tłumaczeniu przesunięciem i wyodrębnia po stuknięciu.”<br>② “Historia Tłumaczenia Przesunięciem”<br>③ “Pokaż przycisk przebiegu działań po tłumaczeniu gestem i analizuj po stuknięciu.” | "右滑翻译"两种说法："tłumaczenie przesunięciem"（`chunk_extraction_*`、历史页、引擎设置）与"tłumaczenie gestem"（`sentence_skeleton_*`）。（来源：pl §6-8） | 统一"tłumaczenie przesunięciem" |
| ru | ① `daily_sentence_translation_limit`<br>② `view_title_swipe_history`<br>③ `Swipe Right Translation Mode Settings` | ① “Проведите для перевода”<br>② “История Перевода Свайпом”<br>③ “Настройки Режима Перевода При Смахивании Вправо” | 手势三种叫法："Проведите…""…Свайпом""…При Смахивании Вправо"。（来源：ru §5-7） | 统一"свайп"（如"Настройки режима перевода свайпом"） |
| th | ① `view_title_swipe_history`<br>② `view_title_swipe_detail` | ① “ประวัติการแปลแบบสไลด์”<br>② “รายละเอียดการแปลแบบสไลด์” | 同一手势两种叫法：这两处"…แบบสไลด์"，其余所有地方"ปัด"。（来源：th §6-7） | 统一"ปัด"（如"ประวัติการแปลแบบปัด"） |
| id | ① `daily_sentence_translation_limit`<br>② `tip_swipe_to_translate` | ① “Gesek untuk Menerjemahkan”<br>② “Geser ke kanan pada teks apa pun untuk menampilkan terjemahannya.” | 功能名用"Gesek"（刷卡、摩擦），提示和"Swipe down to close"都用"Geser"；iOS 印尼语手势统一用 geser。（来源：X12、id §6-4） | Geser untuk Menerjemahkan |
| zh-Hans | `daily_sentence_translation_limit` | “滑动翻译” | 同一功能两个名字：这里是"滑动翻译"，历史页、引擎设置等处是"右滑翻译"。`右滑翻译` 键已 stale，要改本键。（来源：X13） | 右滑翻译 |

### P6b

**同一手势 / 功能叫法不一：双击 / 点按**。同一个"双击""点按"在不同字符串里用了不同动词或名词。

| 语言 | 键 | 现值 | 问题 | 建议值 |
|---|---|---|---|---|
| ko | `double_tap_not_supported_message` | “중국어, 일본어, 한국어에 대한 더블 탭 번역은 현재 지원되지 않습니다.” | 写"더블 탭"，与功能名"두 번 탭하여 찾기"不一致；而且把查词叫成"번역"（翻译）。（来源：ko §9-5） | 중국어, 일본어, 한국어에서는 아직 두 번 탭하여 찾기를 지원하지 않습니다.（先改 en，见 §4） |
| pl | ① `word_meaning_lookup_title`<br>② `tip_double_tap_context_meaning`<br>③ `chunk_extraction_mode_description_manual`<br>④ `sentence_skeleton_mode_description_manual`<br>⑤ `swipe_translation_result_display_mode_description_manual` | ① “Dotknij dwukrotnie, aby wyszukać (Znaczenie AI)”<br>② “Dotknij dwukrotnie dowolnego słowa, aby zobaczyć jego znaczenie w kontekście.”<br>③ “Pokazuje przycisk fragmentów po tłumaczeniu przesunięciem i wyodrębnia po stuknięciu.”<br>④ “Pokaż przycisk przebiegu działań po tłumaczeniu gestem i analizuj po stuknięciu.”<br>⑤ “Najpierw wstawia symbol zastępczy, a tłumaczy po stuknięciu Pokaż tłumaczenie.” | "点按"两个动词：功能名和提示用"dotknij"，三条说明用"stuknięcie"（iOS 系统用"stuknij"）。（来源：pl §6-8） | 统一一个动词（网站用功能名里的"dotknij"） |
| vi | `double_tap_not_supported_message` | “Hiện tại, tính năng dịch bằng cách chạm hai lần không được hỗ trợ cho tiếng Trung, tiếng Nhật và tiếng Hàn.” | 双击写"chạm hai lần"，其余都是"nhấn đúp"；而且把查词叫成"tính năng dịch"（翻译功能）。（来源：vi §6-3） | 用"nhấn đúp"并说是查词（先改 en，见 §4） |
| id | `double_tap_not_supported_message` | “Terjemahan ketuk ganda saat ini tidak didukung untuk bahasa Cina, Jepang, dan Korea.” | 双击写"ketuk ganda"，其余是"ketuk dua kali"；而且把查词叫成"Terjemahan"（翻译）。（来源：id §6-4） | 用"ketuk dua kali"并说是查词（先改 en，见 §4） |
| ar | `swipe_translation_result_display_mode_description_manual` | “يُدرج موضعًا مؤقتًا أولًا، ثم يترجم ويعرض النتيجة عند الضغط على إظهار الترجمة.” | 点按动词不一致：多数用"النقر"，这里用"الضغط"。（来源：ar §6-7） | 与下一行的决定一起统一 |

### P6c

**同一概念叫法不一：书签、历史、源语言、引擎、朗读模式、句法解析、升级、反馈**。同一个界面概念在不同键里用了两个以上的名字。

| 语言 | 键 | 现值 | 问题 | 建议值 |
|---|---|---|---|---|
| ko | `navigationTitle_history_detail` | “검색 기록 상세” | "검색 기록"在韩语里通常指浏览器的搜索记录（I18-12）；en 是 "History Detail"。（来源：ko §9-5） | 기록 상세 |
| pt-BR | ① `bookmark_title`<br>② `view_bookmarks_button` | ① “Marcadores”<br>② “Ver Favoritos” | 书签两种叫法："Marcadores / Marcador"（`bookmark_title` 等 8 个键）与"Favoritos"（`view_bookmarks_button`）。（来源：pt-BR §6-2③） | 统一一种；Safari 巴葡叫"Favoritos"（网站也用它） |
| nl | ① `daily_sentence_translation_limit`<br>② `swipe_translation_engine_settings_navigation_title`<br>③ `swipe_translation_online_limit_reached_message`<br>④ `swipe_translation_engine_mode_local_title` | ① “Veeg om te vertalen”<br>② “Swipe-vertaalmotor”<br>③ “Je hebt alle online swipe-vertalingen voor vandaag gebruikt. Schakel over naar de lokale engine om door te gaan.”<br>④ “Lokale motor” | 同一手势两种叫法：功能名"Veeg om te vertalen"、说明里"veegvertaling"，其余是"swipe-vertaling / Swipe-vertaalmotor / Swipe Vertaalgeschiedenis"；引擎名"Lokale motor"，额度提示里却是"lokale engine"。（来源：nl §6-3⑥） | 手势统一一种（veeg- 或 swipe-）；引擎统一"motor" |
| pl | ① `send_feedback_button`<br>② `feedback_submit_button` | ① “Wyślij Informację Zwrotną”<br>② “Wyślij opinię” | 同一动作两种说法。（来源：pl §6-8） | 统一"Wyślij opinię" |
| pl | ① `grammar_structure_analysis`<br>② `get_syntax_explanation_button`<br>③ `sentence_skeleton_settings_navigation_title`<br>④ `sentence_skeleton_ui_analyze` | ① “Analiza struktury składni AI”<br>② “Pobierz wyjaśnienie składni AI”<br>③ “Przebieg działań w zdaniu”<br>④ “Przebieg działań” | 第二模型意见："struktury składni"语义重复；同一功能有"Analiza struktury składni AI"与"…wyjaśnienie składni AI"两个名字，"Przebieg działań w zdaniu"与"Przebieg działań"同理。（来源：pl §6-8） | 如"Analiza składni AI"；同一功能统一一个名字 |
| uk | ① `audio_playback_description_local`<br>② `swipe_translation_engine_mode_local_title` | ① “Використовує вбудований голосовий движок пристрою, висока швидкість, роботизований тон.”<br>② “Локальний рушій” | 说明里用俄语词"движок"，设置页用乌克兰语"рушій"。（来源：uk §6-6④、§2 Q6） | …вбудований голосовий рушій пристрою… |
| vi | ① `bookmark_title`<br>② `view_bookmarks_button` | ① “Đánh dấu”<br>② “Xem Dấu Trang” | 书签两种叫法："Đánh dấu"（`bookmark_title` 及书签保存提示）与"Dấu trang"（删除 / 编辑 / 查看）。（来源：vi §6-3） | 统一"Dấu trang" |
| th | ① `bookmark_title`<br>② `view_bookmarks_button`<br>③ `edit_bookmark_title`<br>④ `delete_bookmark_button` | ① “รายการโปรด”<br>② “ดูบุ๊กมาร์ก”<br>③ “แก้ไขบุ๊กมาร์ก”<br>④ “ลบบุ๊กมาร์ก” | 书签两种叫法："รายการโปรด"与"บุ๊กมาร์ก"。（来源：th §6-7） | 统一一种（网站用"รายการโปรด"） |
| th | ① `setting_description_source_language`<br>② `select_source_language_title` | ① “ภาษาแหล่งที่มา”<br>② “เลือกภาษาต้นฉบับ” | 源语言两种叫法。（来源：th §6-7） | 统一一种（如"ภาษาต้นฉบับ"） |
| id | ① `usage_status_upgrade_hint %@`<br>② `upgrade_to_plus_button` | ① “Upgrade ke Plus untuk meningkatkannya menjadi %@.”<br>② “Tingkatkan ke Plus” | 升级两种写法：英语借词"Upgrade ke Plus"与"Tingkatkan ke Plus"。（来源：id §6-4） | 统一"Tingkatkan ke Plus" |
| ar | ① `grammar_structure_analysis`<br>② `get_syntax_explanation_button`<br>③ `explanations_available`<br>④ `label_syntax_explanations` | ① “تحليل بنية الجملة النحوية للذكاء الاصطناعي”<br>② “احصل على شرح التركيب النحوي للذكاء الاصطناعي”<br>③ “تحليل التركيب متاح”<br>④ “تفسيرات التركيب النحوي” | 同一功能四种叫法（分析 / 说明 / 解析 / 解释）。（来源：ar §6-7） | 统一一个名字 |
| ar | ① `view_title_translation_history`<br>② `view_title_swipe_history`<br>③ `word_history_cleared_message`<br>④ `button_text_clear_word_translation_history`<br>⑤ `navigationTitle_history_detail` | ① “تاريخ الترجمة”<br>② “تاريخ ترجمة السحب”<br>③ “تم مسح تاريخ ترجمة الكلمات”<br>④ “مسح سجل ترجمة الكلمات”<br>⑤ “تفاصيل السجل” | "历史"两种说法："تاريخ"（也是"日期"）与"سجل"。（来源：ar §6-7、§4-11） | 统一"سجل"（如"سجل الترجمة"） |
| ar | ① `bookmark_title`<br>② `view_bookmarks_button` | ① “الإشارات المرجعية”<br>② “عرض العلامات المرجعية” | 书签两种说法。（来源：ar §6-7） | 统一"الإشارات المرجعية" |
| hi | ① `Audio Playback Mode Settings`<br>② `setting_title_audio_playback_mode_selection` | ① “पठन मोड सेटिंग्स”<br>② “वाचन मोड” | 同一设置两个名字（पठन / वाचन）。（来源：hi §6-4④） | 统一"वाचन मोड"（वाचन मोड सेटिंग्स） |

### P7

**"不支持双击"提示把查词叫成"翻译"**。`double_tap_not_supported_message` 说的是双击查词，各语言却写成"双击翻译"；根源在 en 原文（§4 第 3 条）。

根源在 en 原文（§4 第 3 条）：en 写的是“Double-tap translation is currently not supported…”，19 种语言都照译成“双击翻译”。下表只列出译者报告了的语言；改 en 之后建议全部语言重译。

| 语言 | 键 | 现值 | 问题 | 建议值 |
|---|---|---|---|---|
| ko | `double_tap_not_supported_message` | “중국어, 일본어, 한국어에 대한 더블 탭 번역은 현재 지원되지 않습니다.” | 写"더블 탭"，与功能名"두 번 탭하여 찾기"不一致；而且把查词叫成"번역"（翻译）。（来源：ko §9-5） | 중국어, 일본어, 한국어에서는 아직 두 번 탭하여 찾기를 지원하지 않습니다.（先改 en，见 §4） |
| pl | `double_tap_not_supported_message` | “Tłumaczenie przez podwójne dotknięcie nie jest obecnie obsługiwane dla języka chińskiego, japońskiego i koreańskiego.” | 把查词叫成"Tłumaczenie"（翻译），功能名却是"wyszukać"。（来源：pl §6-8） | 改成查词的说法（先改 en，见 §4；措辞请母语确定） |
| vi | `double_tap_not_supported_message` | “Hiện tại, tính năng dịch bằng cách chạm hai lần không được hỗ trợ cho tiếng Trung, tiếng Nhật và tiếng Hàn.” | 双击写"chạm hai lần"，其余都是"nhấn đúp"；而且把查词叫成"tính năng dịch"（翻译功能）。（来源：vi §6-3） | 用"nhấn đúp"并说是查词（先改 en，见 §4） |
| th | `double_tap_not_supported_message` | “ขณะนี้ไม่รองรับการแปลแบบแตะสองครั้งสำหรับภาษาจีน ญี่ปุ่น และเกาหลี” | 把查词叫"การแปลแบบแตะสองครั้ง"（双击翻译）。（来源：th §6-7） | 改成查词的说法（先改 en，见 §4） |
| id | `double_tap_not_supported_message` | “Terjemahan ketuk ganda saat ini tidak didukung untuk bahasa Cina, Jepang, dan Korea.” | 双击写"ketuk ganda"，其余是"ketuk dua kali"；而且把查词叫成"Terjemahan"（翻译）。（来源：id §6-4） | 用"ketuk dua kali"并说是查词（先改 en，见 §4） |
| ar | `double_tap_not_supported_message` | “لا تدعم الترجمة بالنقر المزدوج حاليًا اللغة الصينية واليابانية والكورية.” | 把查词叫"الترجمة بالنقر المزدوج"（翻译），功能名是"…للبحث"。（来源：ar §6-7） | 改成查词的说法（先改 en，见 §4） |
| hi | `double_tap_not_supported_message` | “चाइनीज, जापानी और कोरियाई के लिए डबल-टैप अनुवाद वर्तमान में समर्थित नहीं है।” | 用"चाइनीज"（其余语言名都是印地语，应为"चीनी"）；而且把查词叫"डबल-टैप अनुवाद"（翻译）。（来源：hi §6-4⑩） | चीनी；并改成查词的说法（先改 en，见 §4） |

### P8

**"Look Up（查词）"译成"搜索 / 找到"**。`word_meaning_lookup_title`（en "Double-tap to Look Up (AI Meaning)"）里的 Look Up 被译成"搜索"或"找到"，读起来像网页搜索。

| 语言 | 键 | 现值 | 问题 | 建议值 |
|---|---|---|---|---|
| pt-BR | `word_meaning_lookup_title` | “Toque duas vezes para procurar (Significado AI)” | "procurar"是直译，巴西人查词更常说"consultar"（译者存疑）。（来源：pt-BR §4-1） | Toque duas vezes para consultar (Significado com IA) |
| pl | `word_meaning_lookup_title` | “Dotknij dwukrotnie, aby wyszukać (Znaczenie AI)” | "wyszukać"（搜索）用来说"查词义"偏弱（译者存疑）。（来源：pl §4-1） | 如"…, aby sprawdzić znaczenie (AI)" |
| ru | `word_meaning_lookup_title` | “Дважды коснитесь, чтобы найти (AI Значение)” | "найти"是"找到"，不是"查词义"；"AI Значение"语序也不自然。（来源：ru §5-3） | Значение слова двойным касанием (ИИ) |
| tr | `word_meaning_lookup_title` | “Aramak için çift dokunun (AI Anlamı)” | 把查词译成"aramak"（搜索），像搜索功能。（来源：tr §8-8） | Anlam için çift dokunun (AI) |
| uk | `word_meaning_lookup_title` | “Двічі торкніться, щоб знайти (AI Значення)” | "щоб знайти"是"找到"，不是"查词义"。（来源：uk §6-6⑦） | Двічі торкніться, щоб дізнатися значення (ШІ) |
| vi | `word_meaning_lookup_title` | “Nhấn đúp để Tìm kiếm (Ý Nghĩa AI)” | "Tìm kiếm"是"搜索"，查词的自然说法是"tra từ"。（来源：vi §6-3、§4-2） | Nhấn đúp để tra từ (Ý nghĩa AI) |
| th | `word_meaning_lookup_title` | “แตะสองครั้งเพื่อค้นหา (ความหมาย AI)” | 意思是"双击以搜索"。（来源：th §6-7） | แตะสองครั้งดูความหมาย (AI) |

### P9

**朗读功能名（AI Read / Local Read）译错或叫法不一**。"Read" 被译成"学习""讲座""读物""地方性"等；本地语音在不同页面有两个名字。

| 语言 | 键 | 现值 | 问题 | 建议值 |
|---|---|---|---|---|
| nl | ① `audio_playback_title_streaming`<br>② `audio_playback_title_local` | ① “AI Lezing”<br>② “Lokale Lezing” | "lezing"一般指讲座、演讲，不是朗读。（来源：nl §6-3④） | AI-voorlezen／Lokaal voorlezen |
| pl | ① `tts_option_local_synthesis`<br>② `audio_playback_title_local` | ① “Lokalnie Syntetyzowany Głos”<br>② “Lokalne Czytanie” | iOS 语音两个名字：对比页"Lokalnie Syntetyzowany Głos"，朗读设置"Lokalne Czytanie"。（来源：pl §6-8） | 统一一个名字（网站价格表写"Głos iOS (Lokalne czytanie)"） |
| pl | ① `audio_playback_title_streaming`<br>② `audio_playback_title_local` | ① “Czytanie AI”<br>② “Lokalne Czytanie” | 第二模型意见：单独的"Czytanie"可能被理解成用户自己阅读，"Czytanie na głos"更清楚。（来源：pl §6-8） | Czytanie na głos (AI)／Lokalne czytanie na głos |
| vi | `audio_playback_title_local` | “Đọc tại chỗ” | "tại chỗ"读起来像"当场"；App 其他地方都把 local 译成"cục bộ"。（来源：vi §6-3、§4-3） | Đọc cục bộ／Đọc trên máy |
| th | ① `audio_playback_title_local`<br>② `tts_option_local_synthesis`<br>③ `tts_trial_exhausted_fallback_message` | ① “การอ่านท้องถิ่น”<br>② “เสียงสังเคราะห์ในท้องถิ่น”<br>③ “คุณได้ใช้การทดลองใช้งานฟรีในวันนี้หมดแล้ว เปลี่ยนไปใช้การออกเสียงท้องถิ่น อัปเกรดเป็น Plus เพื่อปลดล็อกการเล่น AI เพิ่มเติม” | "ท้องถิ่น"是"地方的、本地区的"，不是"本机"。（来源：X11、th §6-7） | อ่านออกเสียงด้วยเสียงในเครื่อง；其余两处把"ท้องถิ่น"换成"ในเครื่อง" |
| id | ① `audio_playback_title_streaming`<br>② `audio_playback_title_local`<br>③ `setting_title_audio_playback_mode_selection`<br>④ `Audio Playback Mode Settings` | ① “Bacaan AI”<br>② “Bacaan Lokal”<br>③ “Mode Pembacaan”<br>④ “Pengaturan Mode Bacaan” | "bacaan"是"读物"；设置页标题却是"Mode Pembacaan"（朗读模式）。核对补充：`Audio Playback Mode Settings` 又是"Mode Bacaan"。（来源：id §6-4） | Pembacaan AI／Pembacaan Lokal；设置页统一"Mode Pembacaan" |
| ar | ① `tts_option_local_synthesis`<br>② `audio_playback_title_local` | ① “الصوت المُركب محليًا”<br>② “القراءة المحلية” | iOS 语音两个名字：对比页"الصوت المُركب محليًا"，朗读设置"القراءة المحلية"。（来源：ar §6-7） | 统一一个名字（网站价格表写"صوت iOS (القراءة المحلية)"） |
| hi | ① `audio_playback_title_streaming`<br>② `audio_playback_title_local` | ① “AI पढ़ाई”<br>② “स्थानीय पढ़ाई” | "पढ़ाई"是"学习"，不是"朗读"；X10 只列了前一个，Local Read 同样错。（来源：X10、hi §6-4①） | AI से पढ़कर सुनाना／स्थानीय आवाज़ में पढ़कर सुनाना（或 AI वाचन／स्थानीय वाचन） |

### P10

**同一 en 文本有两个键，两次翻译不一致**。`Quote Style` / `Dashed Underline` / `Border` 这几个以英文原文为键的条目，与 `translation_style_*` 各翻了一次，结果不同。

核对补充：`Quote Style`、`Dashed Underline`、`Border` 这三个以英文原文为键的条目，在 Swift 代码里搜不到引用；样式选择器用的是 `translation_style_title_*` / `translation_style_description_*`（`TranslationSettings.swift`）。用户看到的是 `translation_style_*` 那一份，遗留键建议删掉，免得下次翻译再分叉。nl 的 X6 两个键都错，见 P0。

| 语言 | 键 | 现值 | 问题 | 建议值 |
|---|---|---|---|---|
| it | ① `Quote Style`<br>② `translation_style_title_quote_style`<br>③ `Dashed Underline`<br>④ `translation_style_title_underline_dashed` | ① “Stile di Citazione”<br>② “Stile Citazione”<br>③ “Sottolineato tratteggiato”<br>④ “Sottolineatura Tratteggiata” | 同一样式名两个键、两种译法。核对补充：`Quote Style`、`Dashed Underline` 在代码里搜不到引用，界面显示的是 `translation_style_*`。（来源：it §6-5） | 删掉遗留键，或与 `translation_style_*` 保持一致（Stile citazione／Sottolineatura tratteggiata） |
| nl | ① `translation_style_title_quote_style`<br>② `Quote Style` | ① “Cita Stijl”<br>② “Citatstijl” | "Cita Stijl"不是荷兰语；"Citatstijl"拼错。（来源：X6） | Citaatstijl |
| tr | ① `Dashed Underline`<br>② `translation_style_title_underline_dashed`、`translation_style_description_underline_dashed` | ① “Kesikli Alt Çizgi”<br>② “Kesme Çizgili Alt Çizgi” | 虚线下划线两个译名。核对补充：`Dashed Underline` 在代码里搜不到引用，界面显示的是 `translation_style_*`。（来源：tr §8-8） | 统一一种（如"Kesikli Alt Çizgi"） |
| uk | ① `Dashed Underline`<br>② `translation_style_title_underline_dashed`、`translation_style_description_underline_dashed` | ① “Підкреслення штрихами”<br>② “Пунктирне Підкреслення” | 同义两译。核对补充：`Dashed Underline` 在代码里搜不到引用，界面显示的是 `translation_style_*`。（来源：uk §6-6③） | 统一一种 |
| id | ① `Border`<br>② `translation_style_title_border`、`translation_style_description_border` | ① “Batas”<br>② “Bingkai” | "Border"两译："Batas"与"Bingkai"。核对补充：`Border` 键在代码里搜不到引用，界面显示的是 `translation_style_*`。（来源：id §6-4） | 统一"Bingkai" |
| ar | ① `translation_style_title_quote_style`<br>② `Quote Style` | ① “نمط الاقتباس”<br>② “أسلوب الاقتباس” | 引用样式两种说法。（来源：ar §6-7） | 统一一种（界面显示的是 `translation_style_title_quote_style`） |

### P11

**次数 / 数量没有复数变体**。`%lld` 后面的名词没有按数变形。

核对补充：en 源串 `limit_per_day%lld`（“%lld times per day”）和 `This folder contains %lld items. Delete it?` 本身也没有复数变体（值为 1 时会显示“1 times”“1 items”）。建议在 xcstrings 里给这两个键加 plural variation，各语言按 CLDR 类别填写。

| 语言 | 键 | 现值 | 问题 | 建议值 |
|---|---|---|---|---|
| pl | `limit_per_day%lld` | “%lld razy dziennie” | 没有复数变体，值为 1 时会出现"1 razy"；现有额度都 ≥ 5，暂时不出错。（来源：pl §6-8） | 加 plural 变体（one："%lld raz dziennie"；其余："%lld razy dziennie"） |
| uk | `limit_per_day%lld` | “%lld разів на день” | 没有复数变体（3 次会显示成"3 разів"）。（来源：uk §6-6⑨） | 加 plural 变体（раз / рази / разів） |
| ar | ① `limit_per_day%lld`<br>② `limit_30_per_day`<br>③ `limit_50_per_day`<br>④ `limit_80_per_day`<br>⑤ `This folder contains %lld items. Delete it?` | ① “%lld مرات في اليوم”<br>② “30 مرات في اليوم”<br>③ “50 مرات في اليوم”<br>④ “80 مرات في اليوم”<br>⑤ “هذا المجلد يحتوي على %lld عنصر. هل تريد حذفه؟” | 没有复数变体：11 以上应为单数"مرة"，App 的免费 / Plus 对比页因此显示"50 مرات""500 مرات"；文件夹提示 3–10 应为"عناصر"。核对补充：`limit_30/50/80_per_day` 在代码里搜不到引用，界面显示的是 `limit_per_day%lld`。（来源：ar §6-7） | 加 plural 变体（zero / one / two / few / many / other），如 many、other："%lld مرة في اليوم"；文件夹 few："%lld عناصر" |

### P12

**iOS 语音档名 Premium / Enhanced 没有本地化**。`local_speech_engine_*` 让用户去系统设置下载 "Premium / Enhanced" 语音，但系统里这两档显示的是本地化名称。

核对补充：19 种语言的这 5 个键（`local_speech_engine_empty_state_body`、`_empty_state_title`、`_fallback_body`、`_section_footer`、`_section_footer_no_high_quality`）都保留英文“Premium / Enhanced”。把它列为 App 问题的是 pt-BR、it、vi、th、id；ko、de、nl、ru、tr、uk、zh-Hant 只在“没把握的措辞”里提到需要真机核对，未计入。

| 语言 | 键 | 现值 | 问题 | 建议值 |
|---|---|---|---|---|
| pt-BR | `local_speech_engine_empty_state_title` 等 5 个 `local_speech_engine_*` 键 | `local_speech_engine_empty_state_title`：“Nenhuma voz Premium ou Enhanced baixada” | iOS 巴葡界面里 Enhanced 语音叫"Aprimorada"，App 保留英文，用户在系统设置里对不上（未在真机核对）。（来源：pt-BR §6-2②） | Premium ou Aprimorada（真机确认后改） |
| it | `local_speech_engine_empty_state_title` 等 5 个 `local_speech_engine_*` 键 | `local_speech_engine_empty_state_title`：“Nessuna voce Premium o Enhanced scaricata” | iOS 意大利语里增强语音可能叫"Migliorata"（需真机核对）。（来源：it §6-5） | Premium o Migliorata（真机确认后改） |
| vi | `local_speech_engine_empty_state_title` 等 5 个 `local_speech_engine_*` 键 | `local_speech_engine_empty_state_title`：“Không có giọng Premium hoặc Enhanced nào đã tải xuống” | 语音档名保留英文；iOS 越南语里可能叫"Cao cấp""Nâng cao"（未在真机核对）。（来源：vi §6-3、§4-11） | 按 iOS 越南语界面的实际名称改（真机确认） |
| th | `local_speech_engine_empty_state_title` 等 5 个 `local_speech_engine_*` 键 | `local_speech_engine_empty_state_title`：“ไม่พบเสียง Premium หรือ Enhanced ที่ดาวน์โหลดไว้” | 语音档名保留英文，建议按 iOS 泰文界面的实际名称改写。（来源：th §6-7） | 按 iOS 泰文界面的实际名称改（真机确认） |
| id | `local_speech_engine_empty_state_title` 等 5 个 `local_speech_engine_*` 键 | `local_speech_engine_empty_state_title`：“Belum ada suara Premium atau Enhanced yang diunduh” | iOS 印尼语里增强语音可能叫"Ditingkatkan"（需真机核对）。（来源：id §6-4） | Premium atau Ditingkatkan（真机确认后改） |

### P13

**称谓 / 语体不统一（含默认阳性）**。同一 App 里 du / Sie、je / u 混用；pl 的提示只用阳性过去时。

| 语言 | 键 | 现值 | 问题 | 建议值 |
|---|---|---|---|---|
| de | Sie：`swipe_translation_online_limit_reached_message` 等 21 个键<br>du：`tip_swipe_to_translate`、`tip_double_tap_context_meaning`、`source_language_update_prompt`、`This folder contains %lld items. Delete it?` | `swipe_translation_online_limit_reached_message`：“Sie haben alle Online-Swipe-Übersetzungen für heute verbraucht. Wechseln Sie zur lokalen Engine, um fortzufahren.”<br>`tip_swipe_to_translate`：“Wische nach rechts auf beliebigem Text, um die Übersetzung anzuzeigen.”<br>`source_language_update_prompt`：“Die erkannte Sprache unterscheidet sich von deiner aktuellen Einstellung. Möchtest du die Quellsprache aktualisieren?” | 称谓混用：提示用 du，额度提示用 Sie。核对补充：Sie 实际用在 21 个键（多数提示、错误和额度信息），du 只在 4 个键。（来源：de §6-5⑤） | 统一一种称谓（网站用 du；App 若统一 du，要改 21 条） |
| nl | ① `bookmark_saved_message`<br>② `delete_bookmark_confirm`<br>③ `network_or_retry_message` | ① “Uw bladwijzer is succesvol opgeslagen”<br>② “Wilt u de bladwijzer verwijderen?”<br>③ “Controleer uw internetverbinding of probeer het later opnieuw” | 多数提示用 je，书签提示用 u。核对补充：`network_or_retry_message` 也用 uw。（来源：nl §6-3⑨） | 统一 je：Je bladwijzer is opgeslagen／Wil je de bladwijzer verwijderen?／Controleer je internetverbinding of probeer het later opnieuw |
| pl | ① `feature_trial_exhausted_message`<br>② `free_tts_limit_message`<br>③ `more_definitions_trial_exhausted_message`<br>④ `swipe_translation_online_limit_reached_message`<br>⑤ `tts_trial_exhausted_fallback_message`<br>⑥ `subscription_unlocked_message` | ① “Wykorzystałeś wszystkie dzisiejsze darmowe próby tej funkcji. Zaktualizuj, aby odblokować więcej.”<br>② “Wykorzystałeś wszystkie swoje darmowe wymowy na dziś. Zaktualizuj do Plus, aby uzyskać więcej.”<br>③ “Dziś wykorzystałeś wszystkie darmowe wersje próbne „Więcej definicji”. Zaktualizuj do Plus, aby odblokować więcej.”<br>④ “Wykorzystałeś wszystkie dzisiejsze tłumaczenia online wykonywane przesunięciem. Przełącz się na silnik lokalny, aby kontynuować.”<br>⑤ “Wykorzystałeś dzisiejszy bezpłatny okres próbny. Przełączono na lokalną wymowę. Uaktualnij do Plus, aby odblokować więcej odtworzeń AI.”<br>⑥ “Odblokowałeś więcej funkcji wymowy.” | 只用阳性的第二人称过去时（Wykorzystałeś、Odblokowałeś），女性用户读到的是错的性别。（来源：pl §6-8） | 改无人称：Wykorzystano…／Odblokowano… |

### P14

**订阅状态用词或语法错误**。"订阅"被译成"注册 / 报名"，或订阅状态句子有语法错误。

| 语言 | 键 | 现值 | 问题 | 建议值 |
|---|---|---|---|---|
| it | ① `subscribe_button`<br>② `subscribed_label`<br>③ `not_subscribed_label`<br>④ `user_type_not_subscribed`<br>⑤ `subscribed_user_message`<br>⑥ `subscription_status_label`<br>⑦ `subscription_success_title` | ① “Iscriviti”<br>② “Iscritto”<br>③ “Non iscritto”<br>④ “Non Iscritto”<br>⑤ “Sei un utente iscritto”<br>⑥ “Stato dell'Iscrizione”<br>⑦ “Iscrizione Completata!” | "iscrizione / Iscriviti / Iscritto"是注册、报名；付费订阅在意大利语和 Apple 界面里是"abbonamento / Abbonati / Abbonato"。（来源：it §6-5） | Abbonati／Abbonato／Non abbonato／Non abbonato／Sei un utente abbonato／Stato dell’abbonamento／Abbonamento completato! |
| nl | ① `subscribed_label`<br>② `subscribed_user_message`<br>③ `user_type_not_subscribed` | ① “Ingeschreven”<br>② “Je bent een ingeschreven gebruiker”<br>③ “Niet Ingeschreven” | "ingeschreven"是注册、登记，订阅应为"geabonneerd"。核对补充：同一词还在 `subscribed_user_message`、`user_type_not_subscribed`；`not_subscribed_label` 已是"Niet Geabonneerd"。（来源：nl §6-3⑦） | Geabonneerd／Je bent geabonneerd／Niet geabonneerd |
| tr | `subscribed_user_message` | “Abone olmuş bir kullanıcıyız” | 人称错成"我们是…用户"。（来源：tr §8-8） | Abone olmuş bir kullanıcısınız |
| hi | ① `user_type_not_subscribed`<br>② `not_subscribed_label` | ① “असदस्ताक्षरित”<br>② “असदस्यित” | "असदस्ताक्षरित"不是词。（来源：hi §6-4⑥） | असदस्यित（与 `not_subscribed_label` 一致） |

## 3. 按语言

顺序同来源清单；ja 没有条目。"模式"见 §2。

### zh-Hant（xcstrings 里是 zh-TW） · 8 条（高 4 / 中 3 / 低 1）

| 键 | 现值 | 问题 | 建议值 | 严重度 | 模式 |
|---|---|---|---|---|---|
| `more_definitions_title` | “更多释义” | 繁体界面里是简体字。（来源：X1） | 更多釋義 | 高 | P0 |
| ① `translation_style_title_underline_solid`、`translation_style_description_underline_solid`<br>② `translation_style_title_underline_dashed`、`translation_style_description_underline_dashed`、`Dashed Underline`<br>③ `translation_style_title_underline_wavy`、`translation_style_description_underline_wavy` | ① “下划线（实线）”<br>② “下划线（虚线）”<br>③ “下划线（波浪线）” | 简体字（下划线、实线、虚线）。（来源：X2） | 底線（實線）／底線（虛線）／底線（波浪線） | 高 | P0 |
| ① `create_folder_button`<br>② `delete_bookmark_button`<br>③ `delete_bookmark_confirm`<br>④ `dictionary_load_failed_message` | ① “创建文件夹”<br>② “删除书签”<br>③ “您想要删除书签吗？”<br>④ “无法获取词典数据，请稍后再试。” | 简体字，而且是大陆用语（文件夹、获取、数据）。这是文档 08 §7.2.4 点名的例子。（来源：08 §7.2.4） | 建立資料夾／刪除書籤／要刪除書籤嗎？／無法取得字典資料，請稍後再試。 | 高 | P0 |
| ① `collapse_button`<br>② `default_folder_name`<br>③ `delete_swipe_action`<br>④ `dictionary_load_failed_title`<br>⑤ `download_button`<br>⑥ `download_cancelled_message`<br>⑦ `learn_more_plus_features_button`<br>⑧ `more_definitions_trial_exhausted_message` | ① “折叠”<br>② “新建文件夹”<br>③ “删除”<br>④ “无法加载词典数据”<br>⑤ “下载”<br>⑥ “下载已取消”<br>⑦ “了解 Plus 版的好处”<br>⑧ “您今天已使用完「更多释义」的所有免费试用。升级到 Plus 以解锁更多功能。” | 同样是简体字。核对补充：为核实 08 §7.2.4"部分仍是简体"的说法，用 Big5 字符集扫描了全部 zh-TW 值，共 20 个键含简体字；X1、X2 和上一行占 12 个，这 8 个是剩下的。（来源：08 §7.2.4，核对补充） | 折疊／新增資料夾／刪除／無法載入字典資料／下載／已取消下載／了解 Plus 的好處／您今天已用完「更多釋義」的所有免費試用。升級到 Plus 以解鎖更多功能。 | 高 | P0 |
| `daily_sentence_translation_limit` | “滑動翻譯” | 同一功能两个名字：这里是"滑動翻譯"，历史页、引擎设置等处是"右滑翻譯"。核对补充：`右滑翻译` 键在目录里已是 stale（代码不再引用），所以要改的是本键。（来源：X13） | 右滑翻譯 | 中 | P6a |
| ① `swipe_translation_engine_mode_local_title`<br>② `audio_playback_title_local`<br>③ `local_speech_engine_section_title`<br>④ `local_speech_speed_section_title`<br>⑤ `tts_option_local_synthesis` | ① “本地引擎”<br>② “本地朗讀”<br>③ “本地語音引擎”<br>④ “本地語音速度”<br>⑤ “本地合成發音” | "本地"是大陆说法，台湾用"本機"。网站正文写"本機引擎""本機朗讀"，引用按钮名时只能照 App 写"本地…"。核对补充：zh-TW 共 10 个值含"本地"，这里列出标题类 5 个。（来源：zh-Hant §4-5、§5） | "本地"统一改"本機"（本機引擎、本機朗讀、本機語音引擎…） | 中 | — |
| `queried_words_section_title` 等 6 个键（單詞）<br>`already_plus_user_message` 等 4 个（用戶）<br>`chunk_extraction_mode_description_manual` 等 3 个（點擊）<br>`feedback_submit_button` 等 3 个（反饋）<br>`language_pack_download_later_hint` 等 2 个（網絡）<br>`free_tts_limit_message`（獲取）<br>`source_language_update_prompt`（檢測、當前） | `queried_words_section_title`：“查詢過的單詞”<br>`already_plus_user_message`：“您已是Plus用戶”<br>`chunk_extraction_mode_description_manual`：“右滑翻譯後顯示語言塊按鈕，點擊時再提取。”<br>`feedback_submit_button`：“發送反饋”<br>`language_pack_download_later_hint`：“您可以在網絡條件更好的時候稍後下載語言包。”<br>`free_tts_limit_message`：“您已用完今天的所有免費發音。升級到Plus以獲取更多。”<br>`source_language_update_prompt`：“檢測到的語言與當前設定不同。是否更新原文語言？” | 文档 08 §7.2.4："App 的 zh-TW 文案混有大陆用语"。核对补充：用 §7.2.4 对照表的"大陆用语"一列扫描 zh-TW 值，命中的键见本行"键"列；功能名"雙擊查詞"按 08 规则保留，"應用程式"是台湾用法，都不算在内。（来源：08 §7.2.4、zh-Hant §5，核对补充） | 按 08 §7.2.4 改成台湾用语：單字、使用者、點一下 / 點按、意見回饋、網路、取得、偵測 / 目前；建议请台湾母语审校整体过一遍 | 中 | — |
| `restore_purchase_button` | “恢復購買” | Apple 台湾的支援文件一般写"回復購買項目"（待台湾母语审校确认）。（来源：zh-Hant §5） | 回復購買項目（待确认） | 低 | — |

### ko · 5 条（高 1 / 中 2 / 低 2）

| 键 | 现值 | 问题 | 建议值 | 严重度 | 模式 |
|---|---|---|---|---|---|
| `tip_swipe_to_translate` | “任意의 텍스트를 오른쪽으로 스와이프하여 번역을 표시합니다.” | 混入汉字"任意"。（来源：X3） | 아무 텍스트나 오른쪽으로 스와이프하면 번역이 표시됩니다. | 高 | P0 |
| `daily_sentence_translation_limit` | “번역하려면 스와이프하세요” | 祈使句（"要翻译就请滑动"）当功能名；在免费 / Plus 对比页里和引擎名拼成一行显示。`右滑翻译` 键已 stale，要改本键。（来源：X4） | 오른쪽 스와이프 번역 | 低 | P4 |
| `double_tap_not_supported_message` | “중국어, 일본어, 한국어에 대한 더블 탭 번역은 현재 지원되지 않습니다.” | 写"더블 탭"，与功能名"두 번 탭하여 찾기"不一致；而且把查词叫成"번역"（翻译）。（来源：ko §9-5） | 중국어, 일본어, 한국어에서는 아직 두 번 탭하여 찾기를 지원하지 않습니다.（先改 en，见 §4） | 中 | P6b、P7 |
| `navigationTitle_history_detail` | “검색 기록 상세” | "검색 기록"在韩语里通常指浏览器的搜索记录（I18-12）；en 是 "History Detail"。（来源：ko §9-5） | 기록 상세 | 中 | P6c |
| `word_meaning_lookup_title` | “두 번 탭하여 찾기 (AI 의미)” | 括号前多了空格，不合韩文书写习惯。（来源：ko §9-5） | 두 번 탭하여 찾기(AI 의미) | 低 | — |

### es · 1 条（高 0 / 中 1 / 低 0）

| 键 | 现值 | 问题 | 建议值 | 严重度 | 模式 |
|---|---|---|---|---|---|
| ① `audio_playback_title_streaming`<br>② `word_meaning_lookup_title`<br>③ `ai_pronunciation_word`<br>④ `ai_pronunciation_sentence`<br>⑤ `audio_playback_description_streaming` | ① “Lectura AI”<br>② “Toca dos veces para buscar (Significado AI)”<br>③ “Pronunciación AI (Palabra)”<br>④ “Pronunciación AI (Oración)”<br>⑤ “Utiliza la síntesis de voz AI basada en la nube, tono natural, velocidad ligeramente más lenta.” | 写拉丁字母"AI"；同一界面的 `get_syntax_explanation_button`、`grammar_structure_analysis`、`unlock_pronunciation_prompt` 写西语的"IA"。（来源：es §6-5） | 统一用 IA：Lectura con IA／Toca dos veces para buscar (Significado con IA)／Pronunciación con IA (Palabra)／Pronunciación con IA (Oración)／síntesis de voz con IA | 中 | P1 |

### pt-BR · 5 条（高 0 / 中 2 / 低 3）

| 键 | 现值 | 问题 | 建议值 | 严重度 | 模式 |
|---|---|---|---|---|---|
| ① `audio_playback_title_streaming`<br>② `ai_pronunciation_word`<br>③ `ai_pronunciation_sentence`<br>④ `word_meaning_lookup_title`<br>⑤ `audio_playback_description_streaming` | ① “Leitura AI”<br>② “Pronúncia AI (Palavra)”<br>③ “Pronúncia AI (Frase)”<br>④ “Toque duas vezes para procurar (Significado AI)”<br>⑤ “Usa a síntese de fala AI baseada em nuvem, tom natural, velocidade um pouco mais lenta.” | 写"AI"；`grammar_structure_analysis`、`get_syntax_explanation_button` 写"IA"。（来源：pt-BR §6-2①） | 统一用 IA：Leitura com IA／Pronúncia com IA (Palavra)／Pronúncia com IA (Frase)／(Significado com IA)／síntese de fala com IA | 中 | P1 |
| `local_speech_engine_empty_state_title` 等 5 个 `local_speech_engine_*` 键 | `local_speech_engine_empty_state_title`：“Nenhuma voz Premium ou Enhanced baixada” | iOS 巴葡界面里 Enhanced 语音叫"Aprimorada"，App 保留英文，用户在系统设置里对不上（未在真机核对）。（来源：pt-BR §6-2②） | Premium ou Aprimorada（真机确认后改） | 低 | P12 |
| ① `bookmark_title`<br>② `view_bookmarks_button` | ① “Marcadores”<br>② “Ver Favoritos” | 书签两种叫法："Marcadores / Marcador"（`bookmark_title` 等 8 个键）与"Favoritos"（`view_bookmarks_button`）。（来源：pt-BR §6-2③） | 统一一种；Safari 巴葡叫"Favoritos"（网站也用它） | 中 | P6c |
| ① `view_title_swipe_history`<br>② `view_title_swipe_detail` | ① “Histórico de Tradução por Deslizamento”<br>② “Detalhes da Tradução por Deslizamento” | "deslizamento"也有"滑坡"的意思，读起来生硬。（来源：pt-BR §6-2④、§4-8） | 换掉"Deslizamento"（具体写法请巴葡母语确定） | 低 | — |
| `word_meaning_lookup_title` | “Toque duas vezes para procurar (Significado AI)” | "procurar"是直译，巴西人查词更常说"consultar"（译者存疑）。（来源：pt-BR §4-1） | Toque duas vezes para consultar (Significado com IA) | 低 | P8 |

### fr · 5 条（高 0 / 中 3 / 低 2）

| 键 | 现值 | 问题 | 建议值 | 严重度 | 模式 |
|---|---|---|---|---|---|
| ① `upgrade_now_button`<br>② `translation_mode_title_sentenceBySentence` | ① “Mettre à Niveau Maintenant”<br>② “Phrase par Phrase” | 英语式词首大写，法语只大写首词。（来源：fr §5①） | Mettre à niveau maintenant／Phrase par phrase | 低 | P2 |
| ① `audio_playback_title_streaming`<br>② `ai_pronunciation_word`<br>③ `ai_pronunciation_sentence`<br>④ `audio_playback_description_streaming`<br>⑤ `tts_trial_exhausted_fallback_message` | ① “Lecture AI”<br>② “Prononciation AI (Mot)”<br>③ “Prononciation AI (Phrase)”<br>④ “Utilise la synthèse vocale AI basée sur le cloud, ton naturel, vitesse légèrement plus lente.”<br>⑤ “Vous avez épuisé l'essai gratuit d'aujourd'hui. Passé à la prononciation locale. Mettez à niveau vers Plus pour débloquer plus de lectures AI.” | 写"AI"；`word_meaning_lookup_title`（Signification IA）、`get_syntax_explanation_button`、`grammar_structure_analysis` 写"IA"。（来源：fr §5②、§6-5） | 统一用 IA：Lecture IA／Prononciation IA (Mot)／Prononciation IA (Phrase)／synthèse vocale IA／lectures IA | 中 | P1 |
| `tip_double_tap_context_meaning` | “Double-cliquez sur n'importe quel mot pour voir sa signification contextuelle.” | 鼠标说法"Double-cliquez"。（来源：X7） | Touchez deux fois un mot pour voir son sens dans le contexte. | 中 | P5 |
| `swipe_translation_online_limit_reached_message` | “Vous avez utilisé toutes les traductions par balayage en ligne pour aujourd'hui. Passez au moteur local pour continuer.” | 名词"balayage"在这里会被读成"扫描"，是文档 08 §7.5 列为错译的说法；网站一律用动词"balayez … vers la droite"。（来源：fr §5④） | 不用名词 balayage，如：Vous avez utilisé toutes vos traductions en ligne pour aujourd’hui. Passez au moteur local pour continuer. | 中 | — |
| `word_meaning_lookup_title` | “Double-tapez pour rechercher (Signification IA)” | "Double-tapez"是英法混合词。（来源：fr §4-1） | Touchez deux fois pour rechercher (signification IA) | 低 | — |

### de · 5 条（高 0 / 中 3 / 低 2）

| 键 | 现值 | 问题 | 建议值 | 严重度 | 模式 |
|---|---|---|---|---|---|
| `tip_double_tap_context_meaning` | “Doppelklicke auf ein beliebiges Wort, um seine kontextuelle Bedeutung anzuzeigen.” | 鼠标说法"Doppelklicke"。（来源：X7） | Doppeltippe auf ein beliebiges Wort, um seine Bedeutung im Kontext zu sehen. | 中 | P5 |
| ① `upgrade_now_button`<br>② `restore_purchase_button`<br>③ `upgrade_to_plus_button`<br>④ `swipe_translation_switch_and_retry_button` | ① “Jetzt Upgraden”<br>② “Kauf Wiederherstellen”<br>③ “Auf Plus Upgraden”<br>④ “Wechseln und Erneut Versuchen” | 动词大写不合德语正字法（德语只有名词大写）。（来源：de §6-5②） | Jetzt upgraden／Kauf wiederherstellen／Auf Plus upgraden／Wechseln und erneut versuchen | 低 | P2 |
| ① `view_title_swipe_history`<br>② `view_title_swipe_detail` | ① “Swipe Übersetzungshistorie”<br>② “Swipe Übersetzungsdetails” | 英德混用且缺连字符；功能名本身是"Wischen zum Übersetzen"。核对补充：`view_title_swipe_detail` 同样问题。（来源：de §6-5③） | 至少加连字符：Swipe-Übersetzungsverlauf／Swipe-Übersetzungsdetails；或与功能名统一成"Wisch-…" | 低 | P6a |
| ① `get_syntax_explanation_button`<br>② `grammar_structure_analysis` | ① “AI-Syntax-Erklärung abrufen”<br>② “AI-Syntax-Strukturanalyse” | 写"AI-"；其余都写德语的"KI-"（KI-Lesen、KI-Aussprache、KI-Bedeutung）。（来源：de §6-5④） | KI-Syntax-Erklärung abrufen／KI-Syntax-Strukturanalyse | 中 | P1 |
| Sie：`swipe_translation_online_limit_reached_message` 等 21 个键<br>du：`tip_swipe_to_translate`、`tip_double_tap_context_meaning`、`source_language_update_prompt`、`This folder contains %lld items. Delete it?` | `swipe_translation_online_limit_reached_message`：“Sie haben alle Online-Swipe-Übersetzungen für heute verbraucht. Wechseln Sie zur lokalen Engine, um fortzufahren.”<br>`tip_swipe_to_translate`：“Wische nach rechts auf beliebigem Text, um die Übersetzung anzuzeigen.”<br>`source_language_update_prompt`：“Die erkannte Sprache unterscheidet sich von deiner aktuellen Einstellung. Möchtest du die Quellsprache aktualisieren?” | 称谓混用：提示用 du，额度提示用 Sie。核对补充：Sie 实际用在 21 个键（多数提示、错误和额度信息），du 只在 4 个键。（来源：de §6-5⑤） | 统一一种称谓（网站用 du；App 若统一 du，要改 21 条） | 中 | P13 |

### it · 8 条（高 3 / 中 2 / 低 3）

| 键 | 现值 | 问题 | 建议值 | 严重度 | 模式 |
|---|---|---|---|---|---|
| ① `daily_sentence_translation_limit`<br>② `setting_description_select_translation_mode`<br>③ `translation_mode_title_sentenceBySentence`<br>④ `restore_purchase_button` | ① “Scorri per Tradurre”<br>② “Seleziona Modalità di Traduzione”<br>③ “Frase per Frase”<br>④ “Ripristina Acquisto” | 英语式词首大写。（来源：it §6-5） | Scorri per tradurre／Seleziona modalità di traduzione／Frase per frase／Ripristina acquisto | 低 | P2 |
| ① `ai_pronunciation_word`<br>② `ai_pronunciation_sentence` | ① “AI Pronuncia (Parola)”<br>② “AI Pronuncia (Frase)” | 英语语序"AI Pronuncia"，意大利语应把 AI 放在后面。（来源：it §6-5） | Pronuncia AI (parola)／Pronuncia AI (frase) | 低 | P1 |
| ① `upgrade_now_button`、`update_now_button`<br>② `upgrade_to_plus_button`<br>③ `button_text_refresh` | ① “Aggiorna Ora”<br>② “Aggiorna a Plus”<br>③ “Aggiorna” | "Upgrade Now"与"Update Now"同为"Aggiorna Ora"，"Refresh"是"Aggiorna"；"aggiornare"首先是"更新"，用户分不清升级和更新。（来源：it §6-5） | 升级类改用"Passa a Plus"（App 自己的 `usage_status_upgrade_hint %@` 已是"Passa a Plus…"） | 高 | P3 |
| ① `subscribe_button`<br>② `subscribed_label`<br>③ `not_subscribed_label`<br>④ `user_type_not_subscribed`<br>⑤ `subscribed_user_message`<br>⑥ `subscription_status_label`<br>⑦ `subscription_success_title` | ① “Iscriviti”<br>② “Iscritto”<br>③ “Non iscritto”<br>④ “Non Iscritto”<br>⑤ “Sei un utente iscritto”<br>⑥ “Stato dell'Iscrizione”<br>⑦ “Iscrizione Completata!” | "iscrizione / Iscriviti / Iscritto"是注册、报名；付费订阅在意大利语和 Apple 界面里是"abbonamento / Abbonati / Abbonato"。（来源：it §6-5） | Abbonati／Abbonato／Non abbonato／Non abbonato／Sei un utente abbonato／Stato dell’abbonamento／Abbonamento completato! | 高 | P14 |
| ① `view_title_swipe_history`<br>② `view_title_swipe_detail`<br>③ `swipe_translation_engine_settings_navigation_title`<br>④ `Swipe Right Translation Mode Settings` | ① “Cronologia Traduzione Swipe”<br>② “Dettagli Traduzione Swipe”<br>③ “Motore di traduzione con scorrimento”<br>④ “Impostazioni della Modalità di Traduzione con Scorrimento a Destra” | 同一手势两种叫法："swipe"（历史页、详情页及 5 条说明文字）与"scorrimento"（引擎设置、右滑模式设置）。（来源：it §6-5） | 统一一种（功能名是"Scorri per tradurre"，建议统一"scorrimento"） | 中 | P6a |
| `tts_trial_limit_reached_title` | “Limite di Riproduzione Raggiunta” | 性不一致：limite 是阳性，应为"Raggiunto"。（来源：it §6-5） | Limite di riproduzione raggiunto | 高 | — |
| ① `Quote Style`<br>② `translation_style_title_quote_style`<br>③ `Dashed Underline`<br>④ `translation_style_title_underline_dashed` | ① “Stile di Citazione”<br>② “Stile Citazione”<br>③ “Sottolineato tratteggiato”<br>④ “Sottolineatura Tratteggiata” | 同一样式名两个键、两种译法。核对补充：`Quote Style`、`Dashed Underline` 在代码里搜不到引用，界面显示的是 `translation_style_*`。（来源：it §6-5） | 删掉遗留键，或与 `translation_style_*` 保持一致（Stile citazione／Sottolineatura tratteggiata） | 中 | P10 |
| `local_speech_engine_empty_state_title` 等 5 个 `local_speech_engine_*` 键 | `local_speech_engine_empty_state_title`：“Nessuna voce Premium o Enhanced scaricata” | iOS 意大利语里增强语音可能叫"Migliorata"（需真机核对）。（来源：it §6-5） | Premium o Migliorata（真机确认后改） | 低 | P12 |

### nl · 11 条（高 6 / 中 3 / 低 2）

| 键 | 现值 | 问题 | 建议值 | 严重度 | 模式 |
|---|---|---|---|---|---|
| `ai_pronunciation_sentence` | “AI Uttale (Setning)” | 这是挪威语。（来源：X5） | AI-uitspraak (zin) | 高 | P0 |
| ① `translation_style_title_quote_style`<br>② `Quote Style` | ① “Cita Stijl”<br>② “Citatstijl” | "Cita Stijl"不是荷兰语；"Citatstijl"拼错。（来源：X6） | Citaatstijl | 高 | P0、P10 |
| `tip_double_tap_context_meaning` | “Dubbelklik op een willekeurig woord om de contextuele betekenis te bekijken.” | 鼠标说法"Dubbelklik"。（来源：X7） | Dubbeltik op een woord om de betekenis in context te zien. | 中 | P5 |
| ① `audio_playback_title_streaming`<br>② `audio_playback_title_local` | ① “AI Lezing”<br>② “Lokale Lezing” | "lezing"一般指讲座、演讲，不是朗读。（来源：nl §6-3④） | AI-voorlezen／Lokaal voorlezen | 高 | P9 |
| ① `setting_description_source_language`<br>② `source_language_changed_title`<br>③ `view_title_swipe_history`<br>④ `view_title_swipe_detail`<br>⑤ `word_meaning_lookup_title`<br>⑥ `ai_pronunciation_word`<br>⑦ `label_syntax_explanations`<br>⑧ `navigationTitle_history_detail`<br>⑨ `setting_app_language` | ① “Bron Taal”<br>② “Bron Taal Gewijzigd”<br>③ “Swipe Vertaalgeschiedenis”<br>④ “Swipe Vertaal Detail”<br>⑤ “Dubbel tikken om op te zoeken (AI Betekenis)”<br>⑥ “AI Uitspraak (Woord)”<br>⑦ “Syntax Uitleg”<br>⑧ “Geschiedenis Detail”<br>⑨ “App Taal” | 复合词被拆开写（spatiefout）；同一 App 别处写"Brontaal selecteren"。"Dubbel tikken"也应连写（Apple 写 dubbeltikken）。（来源：nl §6-3⑤、§4-1） | Brontaal／Brontaal gewijzigd／Swipe-vertaalgeschiedenis／Swipe-vertaaldetail／Dubbeltikken om op te zoeken (AI-betekenis)／AI-uitspraak (woord)／Syntaxuitleg／Geschiedenisdetail／App-taal | 低 | — |
| ① `daily_sentence_translation_limit`<br>② `swipe_translation_engine_settings_navigation_title`<br>③ `swipe_translation_online_limit_reached_message`<br>④ `swipe_translation_engine_mode_local_title` | ① “Veeg om te vertalen”<br>② “Swipe-vertaalmotor”<br>③ “Je hebt alle online swipe-vertalingen voor vandaag gebruikt. Schakel over naar de lokale engine om door te gaan.”<br>④ “Lokale motor” | 同一手势两种叫法：功能名"Veeg om te vertalen"、说明里"veegvertaling"，其余是"swipe-vertaling / Swipe-vertaalmotor / Swipe Vertaalgeschiedenis"；引擎名"Lokale motor"，额度提示里却是"lokale engine"。（来源：nl §6-3⑥） | 手势统一一种（veeg- 或 swipe-）；引擎统一"motor" | 中 | P6a、P6c |
| ① `free_tts_limit_message`<br>② `remaining_word_tts_today%lld`<br>③ `swipe_translation_online_limit_reached_title` | ① “Je hebt al je gratis uitspraakt vandaag gebruikt. Upgrade naar Plus voor meer.”<br>② “Overgebleven woorduitspraaken vandaag: %lld”<br>③ “Online Vertaaliet Bereikt” | 错字："uitspraakt""woorduitspraaken""Vertaaliet"。（来源：nl §6-3⑦） | …gratis uitspraken…／Overgebleven woorduitspraken vandaag: %lld／Online vertaallimiet bereikt | 高 | — |
| `remaining_sentence_tts_today%lld` | “Overgebleven zinnen vandaag: %lld” | 漏了"发音"：变成"今天剩下的句子"。（来源：nl §6-3⑦） | Overgebleven zinsuitspraken vandaag: %lld | 高 | — |
| ① `subscribed_label`<br>② `subscribed_user_message`<br>③ `user_type_not_subscribed` | ① “Ingeschreven”<br>② “Je bent een ingeschreven gebruiker”<br>③ “Niet Ingeschreven” | "ingeschreven"是注册、登记，订阅应为"geabonneerd"。核对补充：同一词还在 `subscribed_user_message`、`user_type_not_subscribed`；`not_subscribed_label` 已是"Niet Geabonneerd"。（来源：nl §6-3⑦） | Geabonneerd／Je bent geabonneerd／Niet geabonneerd | 高 | P14 |
| ① `upgrade_now_button`<br>② `restore_purchase_button`<br>③ `retry_button`<br>④ `swipe_translation_switch_and_retry_button` | ① “Nu Upgraden”<br>② “Aankoop Herstellen”<br>③ “Opnieuw Proberen”<br>④ “Schakel Om en Probeer Opnieuw” | 英语式词首大写，荷兰语只大写首词。（来源：nl §6-3⑧） | Nu upgraden／Aankoop herstellen／Opnieuw proberen／Schakel om en probeer opnieuw | 低 | P2 |
| ① `bookmark_saved_message`<br>② `delete_bookmark_confirm`<br>③ `network_or_retry_message` | ① “Uw bladwijzer is succesvol opgeslagen”<br>② “Wilt u de bladwijzer verwijderen?”<br>③ “Controleer uw internetverbinding of probeer het later opnieuw” | 多数提示用 je，书签提示用 u。核对补充：`network_or_retry_message` 也用 uw。（来源：nl §6-3⑨） | 统一 je：Je bladwijzer is opgeslagen／Wil je de bladwijzer verwijderen?／Controleer je internetverbinding of probeer het later opnieuw | 中 | P13 |

### pl · 13 条（高 1 / 中 7 / 低 5）

| 键 | 现值 | 问题 | 建议值 | 严重度 | 模式 |
|---|---|---|---|---|---|
| ① `restore_purchase_button`<br>② `upgrade_now_button`<br>③ `translation_mode_title_sentenceBySentence`<br>④ `audio_playback_title_local`<br>⑤ `Chunk Extraction`<br>⑥ `view_title_translation_history`<br>⑦ `setting_description_source_language`<br>⑧ `translation_style_title_quote_style`<br>⑨ `swipe_translation_switch_and_retry_button` | ① “Przywróć Zakup”<br>② “Uaktualnij Teraz”<br>③ “Zdanie po Zdaniu”<br>④ “Lokalne Czytanie”<br>⑤ “Ekstrakcja Fragmentów”<br>⑥ “Historia Tłumaczeń”<br>⑦ “Język Źródłowy”<br>⑧ “Styl Cytowania”<br>⑨ “Przełącz i Spróbuj Ponownie” | 英语式词首大写，波兰语只大写首词。另：第二模型指出 iOS 里恢复购买的通行叫法是"Przywróć zakupy"。（来源：pl §6-8） | Przywróć zakupy／Uaktualnij teraz／Zdanie po zdaniu／Lokalne czytanie／Ekstrakcja fragmentów／Historia tłumaczeń／Język źródłowy／Styl cytowania／Przełącz i spróbuj ponownie | 低 | P2 |
| ① `feature_trial_exhausted_message`<br>② `free_tts_limit_message`<br>③ `more_definitions_trial_exhausted_message`<br>④ `upgrade_to_plus_button`<br>⑤ `usage_status_upgrade_hint %@` | ① “Wykorzystałeś wszystkie dzisiejsze darmowe próby tej funkcji. Zaktualizuj, aby odblokować więcej.”<br>② “Wykorzystałeś wszystkie swoje darmowe wymowy na dziś. Zaktualizuj do Plus, aby uzyskać więcej.”<br>③ “Dziś wykorzystałeś wszystkie darmowe wersje próbne „Więcej definicji”. Zaktualizuj do Plus, aby odblokować więcej.”<br>④ “Uaktualnij do Plus”<br>⑤ “Przejdź na Plus, aby zwiększyć limit do %@.” | 三条额度提示写"Zaktualizuj (do Plus)"，"zaktualizować"是更新软件，用在这里是错的；同一动作在 `upgrade_to_plus_button` 是"Uaktualnij do Plus"、在 `usage_status_upgrade_hint %@` 是"Przejdź na Plus"，一个动作三种说法。（来源：pl §6-8） | 统一"Przejdź na Plus"（如"…Przejdź na Plus, aby odblokować więcej."） | 高 | P3 |
| ① `word_meaning_lookup_title`<br>② `tip_double_tap_context_meaning`<br>③ `chunk_extraction_mode_description_manual`<br>④ `sentence_skeleton_mode_description_manual`<br>⑤ `swipe_translation_result_display_mode_description_manual` | ① “Dotknij dwukrotnie, aby wyszukać (Znaczenie AI)”<br>② “Dotknij dwukrotnie dowolnego słowa, aby zobaczyć jego znaczenie w kontekście.”<br>③ “Pokazuje przycisk fragmentów po tłumaczeniu przesunięciem i wyodrębnia po stuknięciu.”<br>④ “Pokaż przycisk przebiegu działań po tłumaczeniu gestem i analizuj po stuknięciu.”<br>⑤ “Najpierw wstawia symbol zastępczy, a tłumaczy po stuknięciu Pokaż tłumaczenie.” | "点按"两个动词：功能名和提示用"dotknij"，三条说明用"stuknięcie"（iOS 系统用"stuknij"）。（来源：pl §6-8） | 统一一个动词（网站用功能名里的"dotknij"） | 中 | P6b |
| ① `chunk_extraction_mode_description_manual`<br>② `view_title_swipe_history`<br>③ `sentence_skeleton_mode_description_manual` | ① “Pokazuje przycisk fragmentów po tłumaczeniu przesunięciem i wyodrębnia po stuknięciu.”<br>② “Historia Tłumaczenia Przesunięciem”<br>③ “Pokaż przycisk przebiegu działań po tłumaczeniu gestem i analizuj po stuknięciu.” | "右滑翻译"两种说法："tłumaczenie przesunięciem"（`chunk_extraction_*`、历史页、引擎设置）与"tłumaczenie gestem"（`sentence_skeleton_*`）。（来源：pl §6-8） | 统一"tłumaczenie przesunięciem" | 中 | P6a |
| ① `feature_trial_exhausted_message`<br>② `free_tts_limit_message`<br>③ `more_definitions_trial_exhausted_message`<br>④ `swipe_translation_online_limit_reached_message`<br>⑤ `tts_trial_exhausted_fallback_message`<br>⑥ `subscription_unlocked_message` | ① “Wykorzystałeś wszystkie dzisiejsze darmowe próby tej funkcji. Zaktualizuj, aby odblokować więcej.”<br>② “Wykorzystałeś wszystkie swoje darmowe wymowy na dziś. Zaktualizuj do Plus, aby uzyskać więcej.”<br>③ “Dziś wykorzystałeś wszystkie darmowe wersje próbne „Więcej definicji”. Zaktualizuj do Plus, aby odblokować więcej.”<br>④ “Wykorzystałeś wszystkie dzisiejsze tłumaczenia online wykonywane przesunięciem. Przełącz się na silnik lokalny, aby kontynuować.”<br>⑤ “Wykorzystałeś dzisiejszy bezpłatny okres próbny. Przełączono na lokalną wymowę. Uaktualnij do Plus, aby odblokować więcej odtworzeń AI.”<br>⑥ “Odblokowałeś więcej funkcji wymowy.” | 只用阳性的第二人称过去时（Wykorzystałeś、Odblokowałeś），女性用户读到的是错的性别。（来源：pl §6-8） | 改无人称：Wykorzystano…／Odblokowano… | 中 | P13 |
| ① `tts_option_local_synthesis`<br>② `audio_playback_title_local` | ① “Lokalnie Syntetyzowany Głos”<br>② “Lokalne Czytanie” | iOS 语音两个名字：对比页"Lokalnie Syntetyzowany Głos"，朗读设置"Lokalne Czytanie"。（来源：pl §6-8） | 统一一个名字（网站价格表写"Głos iOS (Lokalne czytanie)"） | 中 | P9 |
| `double_tap_not_supported_message` | “Tłumaczenie przez podwójne dotknięcie nie jest obecnie obsługiwane dla języka chińskiego, japońskiego i koreańskiego.” | 把查词叫成"Tłumaczenie"（翻译），功能名却是"wyszukać"。（来源：pl §6-8） | 改成查词的说法（先改 en，见 §4；措辞请母语确定） | 中 | P7 |
| `limit_per_day%lld` | “%lld razy dziennie” | 没有复数变体，值为 1 时会出现"1 razy"；现有额度都 ≥ 5，暂时不出错。（来源：pl §6-8） | 加 plural 变体（one："%lld raz dziennie"；其余："%lld razy dziennie"） | 中 | P11 |
| ① `send_feedback_button`<br>② `feedback_submit_button` | ① “Wyślij Informację Zwrotną”<br>② “Wyślij opinię” | 同一动作两种说法。（来源：pl §6-8） | 统一"Wyślij opinię" | 中 | P6c |
| `source_language_changed_title` | “Język Źródłowy Zmieniony” | 英语语序。（来源：pl §6-8） | Zmieniono język źródłowy | 低 | — |
| ① `grammar_structure_analysis`<br>② `get_syntax_explanation_button`<br>③ `sentence_skeleton_settings_navigation_title`<br>④ `sentence_skeleton_ui_analyze` | ① “Analiza struktury składni AI”<br>② “Pobierz wyjaśnienie składni AI”<br>③ “Przebieg działań w zdaniu”<br>④ “Przebieg działań” | 第二模型意见："struktury składni"语义重复；同一功能有"Analiza struktury składni AI"与"…wyjaśnienie składni AI"两个名字，"Przebieg działań w zdaniu"与"Przebieg działań"同理。（来源：pl §6-8） | 如"Analiza składni AI"；同一功能统一一个名字 | 低 | P6c |
| ① `audio_playback_title_streaming`<br>② `audio_playback_title_local` | ① “Czytanie AI”<br>② “Lokalne Czytanie” | 第二模型意见：单独的"Czytanie"可能被理解成用户自己阅读，"Czytanie na głos"更清楚。（来源：pl §6-8） | Czytanie na głos (AI)／Lokalne czytanie na głos | 低 | P9 |
| `word_meaning_lookup_title` | “Dotknij dwukrotnie, aby wyszukać (Znaczenie AI)” | "wyszukać"（搜索）用来说"查词义"偏弱（译者存疑）。（来源：pl §4-1） | 如"…, aby sprawdzić znaczenie (AI)" | 低 | P8 |

### ru · 8 条（高 2 / 中 4 / 低 2）

| 键 | 现值 | 问题 | 建议值 | 严重度 | 模式 |
|---|---|---|---|---|---|
| ① `Chunk Extraction`<br>② `translation_mode_title_sentenceBySentence`<br>③ `view_title_swipe_history`<br>④ `upgrade_now_button`<br>⑤ `restore_purchase_button`<br>⑥ `setting_description_source_language` | ① “Извлечение Фрагментов”<br>② “Предложение за Предложением”<br>③ “История Перевода Свайпом”<br>④ “Обновить Сейчас”<br>⑤ “Восстановить Покупку”<br>⑥ “Исходный Язык” | 英语式词首大写，俄语只大写首词。（来源：ru §5-1） | Извлечение фрагментов／Предложение за предложением／История перевода свайпом／（升级按钮见 P3）／Восстановить покупку／Исходный язык | 低 | P2 |
| ① `ai_pronunciation_word`<br>② `ai_pronunciation_sentence`<br>③ `word_meaning_lookup_title`<br>④ `audio_playback_description_streaming`<br>⑤ `unlock_pronunciation_prompt` | ① “AI произношение (слово)”<br>② “AI произношение (предложение)”<br>③ “Дважды коснитесь, чтобы найти (AI Значение)”<br>④ “Использует облачную AI-синтез речи, естественный тон, более медленная скорость.”<br>⑤ “Используйте AI-перевод, анализ контекста и высококачественный AI-голос с большей свободой. Улучшите свой опыт изучения языка.” | 写"AI"；`audio_playback_title_streaming`（Чтение ИИ）、句法解析两键写"ИИ"。（来源：ru §5-2） | 统一 ИИ（如"Произношение ИИ (слово)"） | 中 | P1 |
| `word_meaning_lookup_title` | “Дважды коснитесь, чтобы найти (AI Значение)” | "найти"是"找到"，不是"查词义"；"AI Значение"语序也不自然。（来源：ru §5-3） | Значение слова двойным касанием (ИИ) | 中 | P8 |
| `daily_sentence_translation_limit` | “Проведите для перевода” | 祈使句当功能名（与 ko 的 X4 同类）；`右滑翻译` 键没有 ru 值。（来源：ru §5-4） | Перевод свайпом | 低 | P4 |
| ① `upgrade_now_button`、`update_now_button`<br>② `upgrade_to_plus_button` | ① “Обновить Сейчас”<br>② “Обновить до Plus” | 升级和更新是同一个"Обновить Сейчас"，用户分不清；"Обновить до Plus"也容易读成"更新"。（来源：ru §5-5） | Перейти на Plus／Оформить Plus | 高 | P3 |
| `audio_playback_description_streaming` | “Использует облачную AI-синтез речи, естественный тон, более медленная скорость.” | 语法错误："облачную"（阴性）修饰阳性名词"синтез"。（来源：ru §5-6） | Использует облачный AI-синтез речи… | 高 | — |
| ① `daily_sentence_translation_limit`<br>② `view_title_swipe_history`<br>③ `Swipe Right Translation Mode Settings` | ① “Проведите для перевода”<br>② “История Перевода Свайпом”<br>③ “Настройки Режима Перевода При Смахивании Вправо” | 手势三种叫法："Проведите…""…Свайпом""…При Смахивании Вправо"。（来源：ru §5-7） | 统一"свайп"（如"Настройки режима перевода свайпом"） | 中 | P6a |
| ① `grammar_structure_analysis`<br>② `get_syntax_explanation_button` | ① “Анализ структуры синтаксиса ИИ”<br>② “Получить объяснение синтаксиса ИИ” | 属格链"синтаксиса ИИ"读起来像"AI 的句法"。（来源：ru §5-8） | Анализ синтаксиса с помощью ИИ／Получить объяснение синтаксиса от ИИ | 中 | P1 |

### tr · 8 条（高 3 / 中 3 / 低 2）

| 键 | 现值 | 问题 | 建议值 | 严重度 | 模式 |
|---|---|---|---|---|---|
| `daily_sentence_translation_limit` | “Çevirmek için Kaydırın” | 祈使句当功能名（与 ko 的 X4 同类）。（来源：tr §8-8） | Kaydırarak Çeviri | 低 | P4 |
| `word_meaning_lookup_title` | “Aramak için çift dokunun (AI Anlamı)” | 把查词译成"aramak"（搜索），像搜索功能。（来源：tr §8-8） | Anlam için çift dokunun (AI) | 中 | P8 |
| Yapay Zeka：`audio_playback_title_streaming`、`ai_pronunciation_*`、`get_syntax_explanation_button`、`grammar_structure_analysis`<br>AI：`word_meaning_lookup_title`、`audio_playback_description_streaming`、`unlock_pronunciation_prompt`、`tts_trial_exhausted_fallback_message`<br>Sözdizimi：`label_syntax_explanations` | `audio_playback_title_streaming`：“Yapay Zeka Okuma”<br>`word_meaning_lookup_title`：“Aramak için çift dokunun (AI Anlamı)”<br>`get_syntax_explanation_button`：“Yapay Zeka Söz Dizimi Açıklamasını Al”<br>`label_syntax_explanations`：“Sözdizimi Açıklamaları” | "AI"与"Yapay Zeka"混用；"Söz Dizimi"与"Sözdizimi"混用（TDK 写"söz dizimi"）。（来源：tr §8-8） | 二选一统一（如全用"Yapay Zeka"）；"Sözdizimi"改"Söz Dizimi" | 中 | P1 |
| `tip_swipe_to_translate` | “Herhangi bir metne sağa kaydırarak çevirisini göster.” | 语法不通。（来源：tr §8-8） | Çevirisini görmek için herhangi bir metni sağa kaydırın. | 高 | — |
| `limit_reached_title` | “Limit Raporlandı” | 意思是"已报告限额"。（来源：tr §8-8） | Sınıra Ulaşıldı | 高 | — |
| `subscribed_user_message` | “Abone olmuş bir kullanıcıyız” | 人称错成"我们是…用户"。（来源：tr §8-8） | Abone olmuş bir kullanıcısınız | 高 | P14 |
| ① `Dashed Underline`<br>② `translation_style_title_underline_dashed`、`translation_style_description_underline_dashed` | ① “Kesikli Alt Çizgi”<br>② “Kesme Çizgili Alt Çizgi” | 虚线下划线两个译名。核对补充：`Dashed Underline` 在代码里搜不到引用，界面显示的是 `translation_style_*`。（来源：tr §8-8） | 统一一种（如"Kesikli Alt Çizgi"） | 中 | P10 |
| ① `delete_bookmark_button`<br>② `view_bookmarks_button`<br>③ `user_type_plus %@` | ① “Yer İmi Sil”<br>② “Yer İmleri Görüntüle”<br>③ “Plus Kullanıcı: %@” | 缺宾格 / 领属词尾（译者标为小问题）。（来源：tr §8-8） | Yer İmini Sil／Yer İmlerini Görüntüle／Plus Kullanıcısı: %@ | 低 | — |

### uk · 10 条（高 4 / 中 4 / 低 2）

| 键 | 现值 | 问题 | 建议值 | 严重度 | 模式 |
|---|---|---|---|---|---|
| `translation_style_title_border`、`translation_style_description_border` | “Граница” | 俄语词"Граница"；同一含义的 `Border` 键是"Межа"。（来源：uk §6-6①） | Межа（与 `Border` 键一致） | 高 | P0 |
| `translation_style_title_underline_solid`、`translation_style_description_underline_solid` | “Сплошне Підкреслення” | "Сплошне"是俄语形式。（来源：uk §6-6②） | Суцільне підкреслення | 高 | P0 |
| ① `Dashed Underline`<br>② `translation_style_title_underline_dashed`、`translation_style_description_underline_dashed` | ① “Підкреслення штрихами”<br>② “Пунктирне Підкреслення” | 同义两译。核对补充：`Dashed Underline` 在代码里搜不到引用，界面显示的是 `translation_style_*`。（来源：uk §6-6③） | 统一一种 | 中 | P10 |
| ① `audio_playback_description_local`<br>② `swipe_translation_engine_mode_local_title` | ① “Використовує вбудований голосовий движок пристрою, висока швидкість, роботизований тон.”<br>② “Локальний рушій” | 说明里用俄语词"движок"，设置页用乌克兰语"рушій"。（来源：uk §6-6④、§2 Q6） | …вбудований голосовий рушій пристрою… | 高 | P0、P6c |
| ① `audio_playback_title_streaming`<br>② `ai_pronunciation_word`<br>③ `ai_pronunciation_sentence`<br>④ `word_meaning_lookup_title`<br>⑤ `audio_playback_description_streaming`<br>⑥ `unlock_pronunciation_prompt` | ① “AI Читання”<br>② “AI вимова (Слово)”<br>③ “AI вимова (Речення)”<br>④ “Двічі торкніться, щоб знайти (AI Значення)”<br>⑤ “Використовує хмарний AI-синтез мови, природний тон, повільніша швидкість.”<br>⑥ “Використовуйте AI-переклад, аналіз контексту та високоякісний AI-голос з більшою свободою. Покращте свій досвід вивчення мови.” | 写"AI"；句法解析两键写"ШІ"。（来源：uk §6-6⑤） | 统一 ШІ | 中 | P1 |
| ① `translation_mode_title_sentenceBySentence`<br>② `upgrade_now_button`<br>③ `setting_description_source_language` | ① “Речення за Реченням”<br>② “Оновити Зараз”<br>③ “Мова Джерела” | 英语式词首大写。（来源：uk §6-6⑥） | Речення за реченням／（升级按钮见 P3）／Мова джерела | 低 | P2 |
| `word_meaning_lookup_title` | “Двічі торкніться, щоб знайти (AI Значення)” | "щоб знайти"是"找到"，不是"查词义"。（来源：uk §6-6⑦） | Двічі торкніться, щоб дізнатися значення (ШІ) | 中 | P8 |
| `upgrade_now_button`、`update_now_button` | “Оновити Зараз” | 升级与更新同为"Оновити Зараз"，"升级到 Plus"读起来像"立即更新"。（来源：uk §6-6⑧） | 升级按钮改如"Перейти на Plus"（来源未给写法，请母语确定） | 高 | P3 |
| `limit_per_day%lld` | “%lld разів на день” | 没有复数变体（3 次会显示成"3 разів"）。（来源：uk §6-6⑨） | 加 plural 变体（раз / рази / разів） | 中 | P11 |
| ① `setting_app_language`<br>② `setting_title_app_language` | ① “Мова Додатку”<br>② “Налаштування Мови Додатку” | 用口语词"додаток"；规范词是"застосунок"（网站用它）。（来源：uk §6-6⑩） | Мова застосунку／Налаштування мови застосунку | 低 | — |

### vi · 7 条（高 1 / 中 4 / 低 2）

| 键 | 现值 | 问题 | 建议值 | 严重度 | 模式 |
|---|---|---|---|---|---|
| ① `view_title_swipe_history`<br>② `view_title_swipe_detail` | ① “Lịch Sử Dịch Chuyển”<br>② “Chi Tiết Dịch Chuyển” | "Dịch Chuyển"的意思是"移动"。（来源：X9、vi §6-3） | Lịch sử dịch bằng thao tác vuốt／Chi tiết dịch bằng thao tác vuốt | 高 | — |
| `double_tap_not_supported_message` | “Hiện tại, tính năng dịch bằng cách chạm hai lần không được hỗ trợ cho tiếng Trung, tiếng Nhật và tiếng Hàn.” | 双击写"chạm hai lần"，其余都是"nhấn đúp"；而且把查词叫成"tính năng dịch"（翻译功能）。（来源：vi §6-3） | 用"nhấn đúp"并说是查词（先改 en，见 §4） | 中 | P6b、P7 |
| `audio_playback_title_local` | “Đọc tại chỗ” | "tại chỗ"读起来像"当场"；App 其他地方都把 local 译成"cục bộ"。（来源：vi §6-3、§4-3） | Đọc cục bộ／Đọc trên máy | 中 | P9 |
| `word_meaning_lookup_title` | “Nhấn đúp để Tìm kiếm (Ý Nghĩa AI)” | "Tìm kiếm"是"搜索"，查词的自然说法是"tra từ"。（来源：vi §6-3、§4-2） | Nhấn đúp để tra từ (Ý nghĩa AI) | 中 | P8 |
| ① `bookmark_title`<br>② `view_bookmarks_button` | ① “Đánh dấu”<br>② “Xem Dấu Trang” | 书签两种叫法："Đánh dấu"（`bookmark_title` 及书签保存提示）与"Dấu trang"（删除 / 编辑 / 查看）。（来源：vi §6-3） | 统一"Dấu trang" | 中 | P6c |
| ① `daily_sentence_translation_limit`<br>② `translation_mode_title_auto`<br>③ `translation_mode_title_paragraph`<br>④ `translation_mode_title_sentenceBySentence`<br>⑤ `upgrade_now_button`<br>⑥ `Chunk Extraction`<br>⑦ `translation_style_title_quote_style`<br>⑧ `Quote Style` | ① “Vuốt để Dịch”<br>② “Tự Động”<br>③ “Đoạn Văn”<br>④ “Từng Câu”<br>⑤ “Nâng Cấp Ngay”<br>⑥ “Trích Xuất Cụm”<br>⑦ “Kiểu Trích Dẫn”<br>⑧ “Kiểu Trích dẫn” | 英语式词首大写；同一个样式名还有"Kiểu Trích Dẫn""Kiểu Trích dẫn"两种大小写。（来源：vi §6-3） | Vuốt để dịch／Tự động／Đoạn văn／Từng câu／Nâng cấp ngay／Trích xuất cụm／Kiểu trích dẫn（两个键统一） | 低 | P2 |
| `local_speech_engine_empty_state_title` 等 5 个 `local_speech_engine_*` 键 | `local_speech_engine_empty_state_title`：“Không có giọng Premium hoặc Enhanced nào đã tải xuống” | 语音档名保留英文；iOS 越南语里可能叫"Cao cấp""Nâng cao"（未在真机核对）。（来源：vi §6-3、§4-11） | 按 iOS 越南语界面的实际名称改（真机确认） | 低 | P12 |

### th · 11 条（高 3 / 中 6 / 低 2）

| 键 | 现值 | 问题 | 建议值 | 严重度 | 模式 |
|---|---|---|---|---|---|
| ① `audio_playback_title_local`<br>② `tts_option_local_synthesis`<br>③ `tts_trial_exhausted_fallback_message` | ① “การอ่านท้องถิ่น”<br>② “เสียงสังเคราะห์ในท้องถิ่น”<br>③ “คุณได้ใช้การทดลองใช้งานฟรีในวันนี้หมดแล้ว เปลี่ยนไปใช้การออกเสียงท้องถิ่น อัปเกรดเป็น Plus เพื่อปลดล็อกการเล่น AI เพิ่มเติม” | "ท้องถิ่น"是"地方的、本地区的"，不是"本机"。（来源：X11、th §6-7） | อ่านออกเสียงด้วยเสียงในเครื่อง；其余两处把"ท้องถิ่น"换成"ในเครื่อง" | 高 | P9 |
| `audio_playback_description_local` | “ใช้เครื่องยนต์เสียงในตัวของอุปกรณ์ ความเร็วสูง โทนเสียงหุ่นยนต์” | "เครื่องยนต์"是（汽车）发动机；App 其他地方都用"เอนจิน"。（来源：th §6-7） | ใช้เอนจินเสียงในตัวของอุปกรณ์… | 高 | — |
| ① `view_title_swipe_history`<br>② `view_title_swipe_detail` | ① “ประวัติการแปลแบบสไลด์”<br>② “รายละเอียดการแปลแบบสไลด์” | 同一手势两种叫法：这两处"…แบบสไลด์"，其余所有地方"ปัด"。（来源：th §6-7） | 统一"ปัด"（如"ประวัติการแปลแบบปัด"） | 中 | P6a |
| ① `bookmark_title`<br>② `view_bookmarks_button`<br>③ `edit_bookmark_title`<br>④ `delete_bookmark_button` | ① “รายการโปรด”<br>② “ดูบุ๊กมาร์ก”<br>③ “แก้ไขบุ๊กมาร์ก”<br>④ “ลบบุ๊กมาร์ก” | 书签两种叫法："รายการโปรด"与"บุ๊กมาร์ก"。（来源：th §6-7） | 统一一种（网站用"รายการโปรด"） | 中 | P6c |
| ① `setting_description_source_language`<br>② `select_source_language_title` | ① “ภาษาแหล่งที่มา”<br>② “เลือกภาษาต้นฉบับ” | 源语言两种叫法。（来源：th §6-7） | 统一一种（如"ภาษาต้นฉบับ"） | 中 | P6c |
| `word_meaning_lookup_title` | “แตะสองครั้งเพื่อค้นหา (ความหมาย AI)” | 意思是"双击以搜索"。（来源：th §6-7） | แตะสองครั้งดูความหมาย (AI) | 中 | P8 |
| `double_tap_not_supported_message` | “ขณะนี้ไม่รองรับการแปลแบบแตะสองครั้งสำหรับภาษาจีน ญี่ปุ่น และเกาหลี” | 把查词叫"การแปลแบบแตะสองครั้ง"（双击翻译）。（来源：th §6-7） | 改成查词的说法（先改 en，见 §4） | 中 | P7 |
| `translation_style_title_quote_style`、`Quote Style` | “รูปแบบการอ้างอิง” | "รูปแบบการอ้างอิง"是"（文献）引用格式"，不是引用条样式。（来源：th §6-7） | 改成"引用条样式"的意思（来源未给写法，请泰语母语确定） | 高 | — |
| ① `setting_title_audio_playback_mode_selection`<br>② `Audio Playback Mode Settings` | ① “โหมดการอ่าน”<br>② “การตั้งค่าโหมดการอ่าน” | "โหมดการอ่าน"容易理解成"阅读模式"。核对补充：`Audio Playback Mode Settings` 同样。（来源：th §6-7） | โหมดเสียงอ่าน／การตั้งค่าโหมดเสียงอ่าน | 中 | — |
| `send_feedback_button` | “ส่งข้อเสนอแนะแบบฟีดแบ็ก” | 重复（"发送反馈式的反馈"）。（来源：th §6-7） | ส่งข้อเสนอแนะ | 低 | — |
| `local_speech_engine_empty_state_title` 等 5 个 `local_speech_engine_*` 键 | `local_speech_engine_empty_state_title`：“ไม่พบเสียง Premium หรือ Enhanced ที่ดาวน์โหลดไว้” | 语音档名保留英文，建议按 iOS 泰文界面的实际名称改写。（来源：th §6-7） | 按 iOS 泰文界面的实际名称改（真机确认） | 低 | P12 |

### id · 9 条（高 3 / 中 4 / 低 2）

| 键 | 现值 | 问题 | 建议值 | 严重度 | 模式 |
|---|---|---|---|---|---|
| ① `daily_sentence_translation_limit`<br>② `tip_swipe_to_translate` | ① “Gesek untuk Menerjemahkan”<br>② “Geser ke kanan pada teks apa pun untuk menampilkan terjemahannya.” | 功能名用"Gesek"（刷卡、摩擦），提示和"Swipe down to close"都用"Geser"；iOS 印尼语手势统一用 geser。（来源：X12、id §6-4） | Geser untuk Menerjemahkan | 中 | P6a |
| `tts_trial_exhausted_fallback_message` | “Anda telah menggunakan masa percubaan percuma hari ini. Beralih ke sebutan tempatan. Naik taraf ke Plus untuk membuka kunci lebih banyak mainan AI.” | 整句是马来语：percubaan percuma（马来语"免费试用"，印尼语 percuma 是"白费"）、sebutan tempatan（本地发音）、naik taraf（升级）；"mainan AI"是"AI 玩具"。（来源：id §6-4） | Anda telah menggunakan uji coba gratis hari ini. Beralih ke pelafalan lokal. Tingkatkan ke Plus untuk membuka lebih banyak pemutaran AI. | 高 | P0 |
| ① `usage_status_upgrade_hint %@`<br>② `upgrade_to_plus_button` | ① “Upgrade ke Plus untuk meningkatkannya menjadi %@.”<br>② “Tingkatkan ke Plus” | 升级两种写法：英语借词"Upgrade ke Plus"与"Tingkatkan ke Plus"。（来源：id §6-4） | 统一"Tingkatkan ke Plus" | 中 | P6c |
| ① `audio_playback_title_streaming`<br>② `audio_playback_title_local`<br>③ `setting_title_audio_playback_mode_selection`<br>④ `Audio Playback Mode Settings` | ① “Bacaan AI”<br>② “Bacaan Lokal”<br>③ “Mode Pembacaan”<br>④ “Pengaturan Mode Bacaan” | "bacaan"是"读物"；设置页标题却是"Mode Pembacaan"（朗读模式）。核对补充：`Audio Playback Mode Settings` 又是"Mode Bacaan"。（来源：id §6-4） | Pembacaan AI／Pembacaan Lokal；设置页统一"Mode Pembacaan" | 高 | P9 |
| `double_tap_not_supported_message` | “Terjemahan ketuk ganda saat ini tidak didukung untuk bahasa Cina, Jepang, dan Korea.” | 双击写"ketuk ganda"，其余是"ketuk dua kali"；而且把查词叫成"Terjemahan"（翻译）。（来源：id §6-4） | 用"ketuk dua kali"并说是查词（先改 en，见 §4） | 中 | P6b、P7 |
| ① `Border`<br>② `translation_style_title_border`、`translation_style_description_border` | ① “Batas”<br>② “Bingkai” | "Border"两译："Batas"与"Bingkai"。核对补充：`Border` 键在代码里搜不到引用，界面显示的是 `translation_style_*`。（来源：id §6-4） | 统一"Bingkai" | 中 | P10 |
| ① `edit_bookmark_title`<br>② `bookmark_title` | ① “Edit Bookmarks”<br>② “Bookmark” | "Edit Bookmarks"没有翻译；书签全部用英语借词"Bookmark"（iOS 印尼语 Safari 用"Penanda"）。（来源：id §6-4） | 如统一用"Penanda"：Edit Penanda／Penanda | 高 | P0 |
| ① `word_meaning_lookup_title`<br>② `daily_sentence_translation_limit` | ① “Ketuk dua kali untuk Mencari (Arti AI)”<br>② “Gesek untuk Menerjemahkan” | 大小写混用（"untuk Mencari""untuk Menerjemahkan"）。（来源：id §6-4） | Ketuk dua kali untuk mencari (Arti AI)／Geser untuk menerjemahkan | 低 | P2 |
| `local_speech_engine_empty_state_title` 等 5 个 `local_speech_engine_*` 键 | `local_speech_engine_empty_state_title`：“Belum ada suara Premium atau Enhanced yang diunduh” | iOS 印尼语里增强语音可能叫"Ditingkatkan"（需真机核对）。（来源：id §6-4） | Premium atau Ditingkatkan（真机确认后改） | 低 | P12 |

### ar · 12 条（高 2 / 中 8 / 低 2）

| 键 | 现值 | 问题 | 建议值 | 严重度 | 模式 |
|---|---|---|---|---|---|
| ① `limit_per_day%lld`<br>② `limit_30_per_day`<br>③ `limit_50_per_day`<br>④ `limit_80_per_day`<br>⑤ `This folder contains %lld items. Delete it?` | ① “%lld مرات في اليوم”<br>② “30 مرات في اليوم”<br>③ “50 مرات في اليوم”<br>④ “80 مرات في اليوم”<br>⑤ “هذا المجلد يحتوي على %lld عنصر. هل تريد حذفه؟” | 没有复数变体：11 以上应为单数"مرة"，App 的免费 / Plus 对比页因此显示"50 مرات""500 مرات"；文件夹提示 3–10 应为"عناصر"。核对补充：`limit_30/50/80_per_day` 在代码里搜不到引用，界面显示的是 `limit_per_day%lld`。（来源：ar §6-7） | 加 plural 变体（zero / one / two / few / many / other），如 many、other："%lld مرة في اليوم"；文件夹 few："%lld عناصر" | 高 | P11 |
| `sentence_skeleton_*`（15 个键，如 `sentence_skeleton_settings_navigation_title`、`sentence_skeleton_ui_analyze`） | （没有 ar 值，界面显示英文，如 "Sentence Action Flow""Action flow"） | Action Flow 整组缺译。（来源：X8、ar §6-7） | 补阿语；网站暂写"Action Flow (تسلسل الأفعال في الجملة)"，待母语复核 | 高 | P0 |
| ① `grammar_structure_analysis`<br>② `get_syntax_explanation_button` | ① “تحليل بنية الجملة النحوية للذكاء الاصطناعي”<br>② “احصل على شرح التركيب النحوي للذكاء الاصطناعي” | "للذكاء الاصطناعي"是"AI …"的直译，字面是"属于 AI 的"。（来源：ar §6-7） | تحليل بنية الجملة النحوية بالذكاء الاصطناعي／احصل على شرح التركيب النحوي بالذكاء الاصطناعي | 中 | P1 |
| ① `grammar_structure_analysis`<br>② `get_syntax_explanation_button`<br>③ `explanations_available`<br>④ `label_syntax_explanations` | ① “تحليل بنية الجملة النحوية للذكاء الاصطناعي”<br>② “احصل على شرح التركيب النحوي للذكاء الاصطناعي”<br>③ “تحليل التركيب متاح”<br>④ “تفسيرات التركيب النحوي” | 同一功能四种叫法（分析 / 说明 / 解析 / 解释）。（来源：ar §6-7） | 统一一个名字 | 中 | P6c |
| ① `view_title_translation_history`<br>② `view_title_swipe_history`<br>③ `word_history_cleared_message`<br>④ `button_text_clear_word_translation_history`<br>⑤ `navigationTitle_history_detail` | ① “تاريخ الترجمة”<br>② “تاريخ ترجمة السحب”<br>③ “تم مسح تاريخ ترجمة الكلمات”<br>④ “مسح سجل ترجمة الكلمات”<br>⑤ “تفاصيل السجل” | "历史"两种说法："تاريخ"（也是"日期"）与"سجل"。（来源：ar §6-7、§4-11） | 统一"سجل"（如"سجل الترجمة"） | 中 | P6c |
| ① `bookmark_title`<br>② `view_bookmarks_button` | ① “الإشارات المرجعية”<br>② “عرض العلامات المرجعية” | 书签两种说法。（来源：ar §6-7） | 统一"الإشارات المرجعية" | 中 | P6c |
| ① `translation_style_title_quote_style`<br>② `Quote Style` | ① “نمط الاقتباس”<br>② “أسلوب الاقتباس” | 引用样式两种说法。（来源：ar §6-7） | 统一一种（界面显示的是 `translation_style_title_quote_style`） | 中 | P10 |
| `swipe_translation_result_display_mode_description_manual` | “يُدرج موضعًا مؤقتًا أولًا، ثم يترجم ويعرض النتيجة عند الضغط على إظهار الترجمة.” | 点按动词不一致：多数用"النقر"，这里用"الضغط"。（来源：ar §6-7） | 与下一行的决定一起统一 | 中 | P6b |
| ① `word_meaning_lookup_title`<br>② `tip_double_tap_context_meaning` | ① “انقر نقرًا مزدوجًا للبحث (معنى AI)”<br>② “انقر نقرًا مزدوجًا على أي كلمة لعرض معناها السياقي.” | "انقر نقرًا مزدوجًا"是 Microsoft 体系里鼠标"双击"的标准译法，iOS 触屏语境常见"اضغط مرتين"（与 X7 同类）；是否改由母语审校与 App 一起定。（来源：ar §6-7、§4-2） | اضغط مرتين（待定） | 低 | P5 |
| `double_tap_not_supported_message` | “لا تدعم الترجمة بالنقر المزدوج حاليًا اللغة الصينية واليابانية والكورية.” | 把查词叫"الترجمة بالنقر المزدوج"（翻译），功能名是"…للبحث"。（来源：ar §6-7） | 改成查词的说法（先改 en，见 §4） | 中 | P7 |
| `free_tts_limit_message` | “لقد استخدمت جميع نطقك المجاني لليوم. قم بالترقية إلى Plus للحصول على المزيد.” | 语法别扭（"你所有的免费发音"）。（来源：ar §6-7） | …جميع مرات النطق المجانية لهذا اليوم… | 低 | — |
| ① `tts_option_local_synthesis`<br>② `audio_playback_title_local` | ① “الصوت المُركب محليًا”<br>② “القراءة المحلية” | iOS 语音两个名字：对比页"الصوت المُركب محليًا"，朗读设置"القراءة المحلية"。（来源：ar §6-7） | 统一一个名字（网站价格表写"صوت iOS (القراءة المحلية)"） | 中 | P9 |

### hi · 11 条（高 5 / 中 3 / 低 3）

| 键 | 现值 | 问题 | 建议值 | 严重度 | 模式 |
|---|---|---|---|---|---|
| ① `audio_playback_title_streaming`<br>② `audio_playback_title_local` | ① “AI पढ़ाई”<br>② “स्थानीय पढ़ाई” | "पढ़ाई"是"学习"，不是"朗读"；X10 只列了前一个，Local Read 同样错。（来源：X10、hi §6-4①） | AI से पढ़कर सुनाना／स्थानीय आवाज़ में पढ़कर सुनाना（或 AI वाचन／स्थानीय वाचन） | 高 | P9 |
| ① `grammar_structure_analysis`<br>② `get_syntax_explanation_button` | ① “एआई वाक्य रचना संरचना विश्लेषण”<br>② “एआई वाक्य रचना व्याख्या प्राप्त करें” | 写天城文"एआई"；其余都是拉丁字母"AI"。（来源：hi §6-4②） | 统一"AI" | 中 | P1 |
| `free_tts_limit_message`、`compare_free_and_plus_title`、`user_type_free %@` 等 7 个键 | `compare_free_and_plus_title`：“मुफ्त और Plus सुविधाओं की तुलना करें” | "मुफ्त"不带 nukta，同一界面的"आवाज़"又带。（来源：hi §6-4③） | मुफ़्त | 低 | — |
| ① `Audio Playback Mode Settings`<br>② `setting_title_audio_playback_mode_selection` | ① “पठन मोड सेटिंग्स”<br>② “वाचन मोड” | 同一设置两个名字（पठन / वाचन）。（来源：hi §6-4④） | 统一"वाचन मोड"（वाचन मोड सेटिंग्स） | 中 | P6c |
| ① `chunk_extraction_mode_title_manual`<br>② `swipe_translation_result_display_mode_title_manual`<br>③ `tip_swipe_to_translate`<br>④ `swipe_translation_result_display_mode_description_automatic` | ① “मैनुअल”<br>② “मैन्युअल रूप से दिखाएँ”<br>③ “किसी भी पाठ पर दाएं स्वाइप करें, ताकि उसका अनुवाद दिख सके।”<br>④ “दाएँ स्वाइप के बाद तुरंत अनुवाद करें और परिणाम दिखाएँ।” | 两种拼法并存："मैनुअल / मैन्युअल""दाएं / दाएँ"。（来源：hi §6-4⑤） | 各统一一种拼法 | 低 | — |
| ① `user_type_not_subscribed`<br>② `not_subscribed_label` | ① “असदस्ताक्षरित”<br>② “असदस्यित” | "असदस्ताक्षरित"不是词。（来源：hi §6-4⑥） | असदस्यित（与 `not_subscribed_label` 一致） | 高 | P14 |
| `tip_double_tap_context_meaning` | “किसी भी शब्द पर संदर्भित अर्थ देखने के लिए दो बार टैप करें।” | "संदर्भित अर्थ"是"被引用的意思"。（来源：hi §6-4⑦） | …संदर्भ के अनुसार अर्थ… | 高 | — |
| `search_or_enter` | “URL खोजें या दर्ज करें” | 意思成了"搜索 URL 或输入"。（来源：hi §6-4⑧） | खोजें या URL दर्ज करें | 高 | — |
| ① `free_tts_limit_message`<br>② `more_definitions_trial_exhausted_message` | ① “आपने आज के लिए अपनी सभी मुफ्त उच्चारण का उपयोग कर लिया है। अधिक के लिए Plus पर अपग्रेड करें।”<br>② “आपने आज “अधिक परिभाषाएँ” के लिए अपनी सभी मुफ्त परीक्षणों का उपयोग कर लिया है। अधिक अनलॉक करने के लिए Plus में अपग्रेड करें।” | 阳性名词配了阴性的"अपनी"。（来源：hi §6-4⑨） | अपने सभी मुफ़्त उच्चारणों…／अपने सभी मुफ़्त परीक्षणों… | 高 | — |
| `double_tap_not_supported_message` | “चाइनीज, जापानी और कोरियाई के लिए डबल-टैप अनुवाद वर्तमान में समर्थित नहीं है।” | 用"चाइनीज"（其余语言名都是印地语，应为"चीनी"）；而且把查词叫"डबल-टैप अनुवाद"（翻译）。（来源：hi §6-4⑩） | चीनी；并改成查词的说法（先改 en，见 §4） | 中 | P7 |
| `grammar_structure_analysis` | “एआई वाक्य रचना संरचना विश्लेषण” | "रचना संरचना"语义重复（App 原文的问题）。（来源：hi §4-12） | AI वाक्य रचना विश्लेषण | 低 | — |

### zh-Hans · 1 条（高 0 / 中 1 / 低 0）

没有 M3 记录，只有已知的 X13。

| 键 | 现值 | 问题 | 建议值 | 严重度 | 模式 |
|---|---|---|---|---|---|
| `daily_sentence_translation_limit` | “滑动翻译” | 同一功能两个名字：这里是"滑动翻译"，历史页、引擎设置等处是"右滑翻译"。`右滑翻译` 键已 stale，要改本键。（来源：X13） | 右滑翻译 | 中 | P6a |

### ja

没有 M3 记录，X1–X13 也不涉及 ja，本清单没有 ja 的条目。

## 4. en 源串问题

| 键 | 现值（en） | 问题 | 建议值 | 严重度 |
|---|---|---|---|---|
| `folder_name_label` | “Border” | 书签 / 文件夹编辑页（`BookmarkEditView`）第一节的标题，下面就是名称输入框；en 值却是"Border"，英语用户编辑书签时就会看到。各语言的译文是对的（名称 / Name / Nama…）。（来源：th §6-7、id §6-4） | Name（或 Folder Name） | 高 |
| `usage_section_title` | “Dashed Underline” | 朗读额度视图 `TTSQuotaView` 的标题，en 值却是"Dashed Underline"；各语言的译文是对的（使用情况 / Nutzung / Penggunaan…）。核对补充：`TTSQuotaView` 目前在代码里没有被引用，这个标题可能暂时显示不出来。（来源：th §6-7、id §6-4） | Usage | 高 |
| `double_tap_not_supported_message` | “Double-tap translation is currently not supported for Chinese, Japanese, and Korean.” | 提示的是"中日韩不能双击查词"，en 却写成"Double-tap translation"。核对补充：ko、pl、vi、th、ar、hi、id 报告的"把查词叫成翻译"都源自这里，zh-Hans、zh-TW、ja、es、de、fr 等其余语言也照译成"双击翻译"。（来源：核对补充，见 P7） | Double-tap lookup isn’t available yet for Chinese, Japanese or Korean text.（改后全部语言重译） | 中 |
| ① `view_title_translation_history`<br>② `word_history_cleared_message`<br>③ `button_text_clear_word_translation_history` | ① “Translation History”<br>② “Word translation history cleared”<br>③ “Clear Word Translation History” | 这是查词历史（zh-Hans 是"查词历史"），en 却叫"Translation History / Word translation history"，容易和"Swipe Translation History"（右滑翻译历史）混淆；ru、pt-BR 译者都提到为此避开引用原名。（来源：ru §8、pt-BR §4-8 的译者旁注） | Lookup History／Lookup history cleared／Clear Lookup History | 低 |

第 1、2 条改 en 即可，各语言的译文本来就对。第 3 条改 en 后，19 种语言都要重译这一句（P7）。

## 5. 已知 X1–X13 的现状

核对对象同上（提交 0866b4e，2026-06-03）。13 条**全部仍未修正**；网站一直按文档 08 的"网站写法"绕开，没有照抄。

| X | 语言 | 键 | 当前值 | 现状 | 备注 |
|---|---|---|---|---|---|
| X1 | zh-Hant | `more_definitions_title` | “更多释义” | 仍有问题 | 简体"更多释义"未改。 |
| X2 | zh-Hant | `translation_style_title_underline_solid`<br>`translation_style_title_underline_dashed`<br>`translation_style_title_underline_wavy` | “下划线（实线）”<br>“下划线（虚线）”<br>“下划线（波浪线）” | 仍有问题 | `translation_style_description_underline_*` 与 `Dashed Underline` 也是同样的简体字，共 7 个键。 |
| X3 | ko | `tip_swipe_to_translate` | “任意의 텍스트를 오른쪽으로 스와이프하여 번역을 표시합니다.” | 仍有问题 | "任意의"未改。 |
| X4 | ko | `daily_sentence_translation_limit` | “번역하려면 스와이프하세요” | 仍有问题 | 注意 `右滑翻译` 键已 stale（代码不再引用），修正要直接改本键。 |
| X5 | nl | `ai_pronunciation_sentence` | “AI Uttale (Setning)” | 仍有问题 | 挪威语未改。 |
| X6 | nl | `translation_style_title_quote_style`<br>`Quote Style` | “Cita Stijl”<br>“Citatstijl” | 仍有问题 | 两个键都没改（"Cita Stijl"/"Citatstijl"）。 |
| X7 | de / fr / nl | de：`tip_double_tap_context_meaning`<br>fr：`tip_double_tap_context_meaning`<br>nl：`tip_double_tap_context_meaning` | de：“Doppelklicke auf ein beliebiges Wort, um seine kontextuelle Bedeutung anzuzeigen.”<br>fr：“Double-cliquez sur n'importe quel mot pour voir sa signification contextuelle.”<br>nl：“Dubbelklik op een willekeurig woord om de contextuele betekenis te bekijken.” | 仍有问题 | 三种语言都还是鼠标说法。ar 译者报告了同类问题（"انقر نقرًا مزدوجًا"），待定。 |
| X8 | ar | `sentence_skeleton_*`（15 个键） | （无 ar 值） | 仍有问题 | `sentence_skeleton_*` 15 个键仍无 ar 值，界面显示英文。 |
| X9 | vi | `view_title_swipe_history`<br>`view_title_swipe_detail` | “Lịch Sử Dịch Chuyển”<br>“Chi Tiết Dịch Chuyển” | 仍有问题 | `view_title_swipe_detail` 也有"Dịch Chuyển"。 |
| X10 | hi | `audio_playback_title_streaming`<br>`audio_playback_title_local` | “AI पढ़ाई”<br>“स्थानीय पढ़ाई” | 仍有问题 | `audio_playback_title_local`"स्थानीय पढ़ाई"同样错，X10 原来没列。 |
| X11 | th | `audio_playback_title_local`<br>`tts_option_local_synthesis` | “การอ่านท้องถิ่น”<br>“เสียงสังเคราะห์ในท้องถิ่น” | 仍有问题 | `tts_trial_exhausted_fallback_message` 里也有"ท้องถิ่น"。 |
| X12 | id | `daily_sentence_translation_limit`<br>`tip_swipe_to_translate` | “Gesek untuk Menerjemahkan”<br>“Geser ke kanan pada teks apa pun untuk menampilkan terjemahannya.” | 仍有问题 | 标题仍是"Gesek"，提示是"Geser"。 |
| X13 | zh-Hans / zh-Hant | zh-Hans：`daily_sentence_translation_limit`<br>zh-TW：`daily_sentence_translation_limit` | zh-Hans：“滑动翻译”<br>zh-TW：“滑動翻譯” | 仍有问题 | `右滑翻译` 键已 stale，界面上的功能名来自 `daily_sentence_translation_limit`，要改它。 |

## 附：不在 xcstrings 里的 App 侧问题（未计入统计）

| 语言 | 位置 | 问题 | 来源 |
|---|---|---|---|
| zh-Hant | App Store（TW）副标题 | 店面副标题是「滑動翻譯 AI 解釋」，与 X13 统一后的「右滑翻譯」不一致；建议改为「右滑翻譯 AI 解釋」 | zh-Hant §6-3 |
| pt-BR | App Store（BR）副标题 | "Deslize para traduzir de IA"语法不通（"de IA"接不上） | pt-BR §6-2⑤ |
| ru | App Store（RU）副标题与描述 | 副标题「Переводите по словам」（"逐词翻译"，"по словам"还有"据说"的意思）与网站 FAQ `word-by-word` 的口径相反；描述里还有"более 20 языковых пар""группируются по дате""коснитесь слова"等文档 01 列为错误的旧说法 | ru §6-7 |
| tr、vi、th、ar、pl、id | App Store 店面名称 / 副标题 | 这些店面显示的是美区英文元数据（"WordByWord Translate / Swipe to translate AI explains"），没有本地化名称和副标题；tr 译者建议补土耳其语 | tr §8-5、vi §6-5、th §6-5、ar §6-4、pl §6-3、id §5 |
| ar | App 代码（译文 span） | App 插入的译文 span 没有 `dir`，阿语译文在 App 里按 LTR 排版（已在文档 05 §11 登记） | ar §6-7 |

