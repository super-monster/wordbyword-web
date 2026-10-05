# 05 · 两款产品的真实功能与定位对照（Product Truth）

> 采集日期：2026-10-05。只读调研，未修改任何项目文件。
> 标记约定：**[事实]** = 已用代码/命令/线上页面验证；**[推断]** = 基于证据的判断，需用户或数据确认；**[建议]** = 给后续设计阶段的输入。
> 路径缩写：`WBW-iOS` = `/Users/ike/Dev/WordByWord/WordByWordPrototype`，`WBW-ext` = `/Users/ike/Dev/WordByWord/WordByWord-translate-extension`，`WBW-web` = `/Users/ike/Dev/WordByWord/wordbyword-web`，`SE-iOS` = `/Users/ike/Dev/SurfEnglish/SurfEnglish-iOS`，`SE-web` = `/Users/ike/Dev/SurfEnglish/SurfEnglishWebsite`。
> App Store 原始数据已缓存在 `scratchpad/raw/`（`wbw_lookup_{us,jp,cn}.json`、`se_lookup_*.json`、`wbw_*.html`、`se_*.html`）。

---

## 0. TL;DR（给设计阶段的 10 条硬结论）

1. **[事实] WordByWord 是“内置浏览器 + 注入脚本”的 iOS/iPadOS App**，不是 Safari 扩展，也不是独立阅读器。Xcode 工程只有 1 个 application target + 1 个 unit-test target（`WBW-iOS/WordByWordPrototype.xcodeproj/project.pbxproj:123-171`），核心交互由 `Resources/bootstrapScript.js` + `Resources/user-script/*.js` 注入 WKWebView 实现（`WBW-iOS/Docs/userScript-first-phase-architecture.md`）。App Store 显示 Mac（M1+）与 Vision Pro 兼容（以 iPad App 形式运行）。
2. **[事实] WordByWord 支持多个“学习语言（源语言）”，但英语体验最完整**：源语言默认 `en-US`（`Models/LanguageData.swift:52`），可在设置和引导里切换，也会自动检测；但**语言块（Chunks）和动作脉络（Action Flow）只支持英语源文**（`MainViewModel.swift:1973-1982`、`:2386`），**双击查词不支持中日韩源文**（`Resources/user-script/20-features.js:281`；字符串 `double_tap_not_supported_message`）。
3. **[事实] SurfEnglish 只面向“学英语”的人**：产品名、App Store 副标题 “Read English with Translation”、Kokoro 本地语音只有英美 12 个 voice，代码里没有源语言设置（`SE-iOS/SurfEnglish-iOS/Localization/en.lproj/Localizable.strings` 无 source-language 键；语言块请求硬编码 `sourceLanguage: "en"`，`Browser/Engine/src/Views/MainView/MainViewModel/MainViewModel.swift:2324`）。
4. **[事实] SurfEnglish 是在 WordByWord 引擎之上构建的超集**（目录 `SE-iOS/SurfEnglish-iOS/Browser/Engine/src/` 直接复用 WBW 的 MainViewModel/FeatureQuotaManager 等；两款 App 共用 WordByWord Backend，见 `SE-iOS/Docs/wordbyword-backend-feature-model-map.md` §1）。对“学英语”的用户来说，SE 包含 WBW 的全部核心手势，并增加了新闻信息流（CEFR 分级）、AI Natural Translation、本地神经语音（离线）、阅读即复习的小游戏、分享扩展、24 标签浏览器。
5. **[事实] SurfEnglish 未在中国大陆 App Store 上架**：`itunes.apple.com/lookup?id=6787367021&country=cn` 返回空结果，`https://apps.apple.com/cn/app/id6787367021` → HTTP 404；而 WordByWord 在 cn storefront 上架（且有 1 条评分）。当前推广脚本对 `cn-top.html` / `zh-top.html` 仍直接放 App Store 下载按钮（`WBW-web/js/surfenglish-promo.js:21,80`）。
6. **[事实] 语言覆盖交集 = 12 种语言**（en、zh-Hans、zh-Hant、ja、ko、es、pt(-BR)、vi、id、th、hi、ar），对应 WBW 的 14 个文件；de/fr/it/nl/pl/ru/tr/uk 这 8 个 WBW 语言页，SE **没有该语言的界面和官网页**，但 SE 可以把英文翻译成这 8 种语言（21 locale 翻译池与 WBW 相同）。
7. **[推断] 适合被推荐 SE 的访客 = “母语非英语、正在学英语”的人**。不适合：学英语以外外语的人（例如学日语的中国人、学中文的日本人）、多数英语母语访客（en 页）、中国大陆用户（无法下载）。推荐话术必须是条件式的（“如果你在学英语…”），不能把 SE 说成 WBW 的替代品或新版。
8. **[事实] 官网文案明显落后于产品**：官网全部 21 个页面未提及 Chunks、Action Flow、本地翻译引擎、X 优化、内置浏览器标签/收藏、新手引导、iPad/Mac 支持（`grep -il chunk *.html` → 0 个文件）；同时存在多处与真实产品不符的说法（Plus “无限 AI 发音”、“自定义主题与深色模式”、“快捷键/音量设置”、FAQ “20 次 AI 发音”、“自动检测 target language”等，详见 §7）。
9. **[事实] 品牌词冲突**：存在一个无关产品 **WordByWord.io**（网页 + Chrome/Edge/Firefox 扩展，50+ 语言，自有 SEO 博客），WebSearch 查询 “WordByWord Translate chrome web store” 的结果几乎全部指向它。这会直接稀释 “word by word” 品牌词，并与 WBW 的 Chrome 扩展名 “WordByWord Translate” 撞名。
10. **[事实] WBW Chrome 扩展状态不明/未公开**：官网 Chrome 子站的安装按钮只链接到通用商店首页 `https://chrome.google.com/webstore`（`WBW-web/chrome-extension/index.html:243`），“10,000+ 用户” 被注释（`:253`），两个仓库里都找不到商店 listing ID；扩展最后一次提交是 2026-02-13（v0.1.2）。子站也没有任何主站页面链入（`grep -l chrome-extension *.html` → 0）。

---

## 1. 证据来源

| 类别 | 来源 |
|---|---|
| WBW iOS 代码 | `WBW-iOS/WordByWordPrototype/**`（103 个 .swift 文件）、`project.pbxproj`、`Info.plist`、`Localizable.xcstrings`（315 key，用 python json 统计）、`Docs/*.md`（3 篇：cache-current-state / userScript-first-phase-architecture / ios-simulator-launcher）、`git log`（最后提交 `0866b4e 2026-06-03`） |
| WBW Chrome 扩展 | `WBW-ext/manifest.json`、`README.md`、`_locales/*/messages.json`、`src/core/settings.js`、`config.json`、`git log`（最后提交 `1a7ef55 2026-02-13`） |
| WBW 官网 | `WBW-web/*.html`、`chrome-extension/index.html`、`js/surfenglish-promo.js`、`js/analytics.js` |
| SE 官网 | `SE-web/build.mjs`（LOCALES / TRANSLATE_LANGS / SITE）、`src/locales/*.json`、`src/templates/*.mjs`、`appstore-metadata/v1.1.0.toml` |
| SE iOS | `SE-iOS/Docs/surfenglish-ios-localization-design.md`、`Docs/wordbyword-backend-feature-model-map.md`、`Docs/free-explore-browser-v1.3.0-plan.md`、`FeatureQuotaManager.swift`、`SurfEnglishShare/`、`project.pbxproj` |
| App Store（线上） | `https://itunes.apple.com/lookup?id=…&country={us,jp,cn,tw,hk,kr,…}`；`https://apps.apple.com/{us,jp,cn,tw,kr,de}/app/id6741724502`、`…/id6787367021` 的 HTML（副标题、IAP、兼容性） |
| 竞品/撞名 | WebSearch “WordByWord Translate chrome web store”；WebFetch `https://wordbyword.io/` |
| 线上可达性 | `curl` SE 各 locale 路径（12 个均 200，`/de/` 404）；`https://apps.apple.com/cn/app/id6787367021` → 404 |

---

## 2. WordByWord 事实底稿

### 2.1 产品本质与平台

| 项 | 事实 | 证据 |
|---|---|---|
| 形态 | iOS 原生 App，内置浏览器（地址栏搜索/粘贴 URL、多标签、收藏/书签），在网页上注入交互脚本 | `BrowserView.swift`、`Views/Components/WebView.swift`、`Views/Components/AddressBar.swift`、`Views/TabManager/*`、`Views/Bookmark/*`；引导文案 “Open A New Tab / Paste Or Search / Save Pages”（`OnboardingGuideView.swift:2200-2207` 附近 en copy） |
| 不是什么 | 不是 Safari 扩展、没有 Share Extension、没有 Widget | pbxproj 仅 `productType = com.apple.product-type.application` 与 `unit-test` 两个 target（`project.pbxproj:145,169`） |
| 设备 | iPhone + iPad（`TARGETED_DEVICE_FAMILY = "1,2"`，`project.pbxproj:469,500`）；App Store 兼容 Mac（macOS 15+、M1+）与 Vision Pro（visionOS 2+） | `apps.apple.com/us/app/id6741724502` HTML 中 “Requires macOS 15.0 or later and a Mac with Apple M1 chip or later”、“visionOS 2.0 or later” |
| 系统要求 | iOS / iPadOS 18.0+ | `project.pbxproj:459`；lookup `minimumOsVersion: 18.0` |
| 版本 | 1.2.2（2026-05-27 上线），首发 2025-06-06 | `project.pbxproj:464`；lookup `currentVersionReleaseDate 2026-05-27T19:12:06Z`、`releaseDate 2025-06-06` |
| 维护状态 | **[推断]** 维护模式：iOS 最后提交 2026-06-03，此后 4 个月无提交；SE 已于 2026-08 上线 | `git log -5`（WBW-iOS） |
| 分类 | Education + Reference（JP：教育 / 辞書・辞典・その他） | lookup `genres` |
| 评分 | 全球几乎无评分：US 0、JP 0、TW/KR/DE… 0，CN 1 条（2.0） | lookup `averageUserRating/userRatingCount`（§附录 A） |
| App 名（按 storefront） | US/VN/TH/ID/IN/SA/AE/TR/UA/PL/GB：**WordByWord Translate**；JP/CN/KR/BR/MX/ES/DE/FR/IT/NL：**WordByWord**；TW/HK：**WordByWord翻譯**；RU：**WordByWord Переводчик** | lookup `trackName` 逐国查询 |
| 副标题 | US “Swipe to translate AI explains”；JP “なぞって翻訳、AIで文脈を解釈”；CN “任意网页一划即译，开启双语阅读体验”；TW “滑動翻譯 AI 解釋”；KR “스와이프 번역, AI 해설”；DE “Wischen zum Übersetzen” | App Store HTML `subtitle svelte-kps97o` |
| IAP | 仅 “WordByWord Plus Monthly Plan” $3.99（US） | App Store HTML “In-App Purchases” 段；代码另有 `com.wordbyword.premium.quarterly`（`SubscriptionManager/SubscriptionManager.swift:40-41`），但商店未上架 |
| Developer Website | `https://www.word-by-word.app`（及 `/privacy.html`、`/support.html`） | App Store HTML |
| 隐私标签 | App Store：“Developer does not collect any data from this app.” | WebFetch App Store |
| 实际采集 | **集成 Firebase Analytics**，公共参数含 `device_uuid`、`device_model`、`locale`、`app_language`、`subscription_tier` | `AnalyticsManager/AnalyticsManager.swift:8`（`import FirebaseAnalytics`）、`:113-123`（commonParams） |

> **[推断/风险]** 隐私标签 “不收集任何数据” 与 Firebase Analytics + 设备 UUID 上报不一致，官网页脚 “No personal data is collected” 同理。不属于本次 SEO 范围，但改版重写文案时**不要沿用这句话**，需用户先复核。

### 2.2 一句话定位与目标用户

- **App Store 原文定位（US）**：“WordByWord is an AI-powered language learning assistant that helps you understand foreign-language content on any webpage more naturally and efficiently.”（lookup `description`）
- **[建议] 一句话定位（基于真实功能）**：*在 iPhone / iPad 的内置浏览器里读任意外语网页——右滑整句插入对照译文，双击单词看 AI 语境释义，英语网页还能自动标出语言块和句子动作脉络。*
- **目标用户 [事实+推断]**：用母语阅读外语网页（新闻、X、博客、技术文档）的语言学习者。App 能用于多种学习语言，但默认与最完整的体验是**英语网页**（默认源语言 en-US；Chunks/Action Flow 仅英语；新手引导的示例句全是英语，`OnboardingGuideView.swift:2225-2247` 的 contextMeaning 全部在解释英文单词 “experiment”）；新手引导把 **X（Twitter）** 列为首推场景（`OnboardingGuideView.swift:2210` `xTitle: "Optimized for X, recommended first"`）。

### 2.3 语言能力（对关键词和兄弟推荐最关键）

**(a) 界面语言（UI）= 20 种 [事实]**
`Localizable.xcstrings` 有 20 个 locale：en 284 / ja 279 / ko 279 / zh-Hans 279 / zh-TW 278 / de·es·fr·id·it·ru·th·vi 271 / hi·nl·pl·pt-BR·tr·uk 270 / **ar 255（覆盖最低）**（python 统计，共 315 key）。`knownRegions` 21 项（含 Base，`project.pbxproj:193-215`）。App Store 语言列表同为 20 种（English, Arabic, Dutch, French, German, Hindi, Indonesian, Italian, Japanese, Korean, Polish, Portuguese, Russian, Simplified Chinese, Spanish, Thai, Traditional Chinese, Turkish, Ukrainian, Vietnamese）。
→ 与官网的 20 种语言页一一对应（官网 21 文件里 `cn-top.html` 与 `zh-top.html` 字节级相同，md5 均为 `63d6a8cd…`）。
注：新手引导页只有 zh-Hans / zh-Hant / ja / en 四套文案（`OnboardingGuideView.swift:1810-1815`）。

**(b) 目标语言（母语/释义语言）= 21 locale [事实]**
`LanguageMapping.languages`（`Models/LanguageData.swift:21-43`）：vi-VN, pt-BR, uk-UA, it-IT, zh-TW, ko-KR, en-GB, de-DE, zh-CN, ja-JP, id-ID, nl-NL, fr-FR, th-TH, es-ES, tr-TR, pl-PL, ar-AE(RTL), ru-RU, en-US, hi-IN。默认 = 设备语言，英语设备兜底 `ja-JP`（`LanguageData.swift:53`、`defaultTargetLanguage()`）。

**(c) 源语言（学习语言/网页语言）[事实]**
- 默认 `en-US`（`LanguageData.swift:52`）；设置文案：“Default: English. Hint: It changes automatically based on detected content.”（xcstrings `settings_menu_source_language_detail`）
- 可手动切换：`SettingsMenuViewController.swift:331-337`（`changeSourceLanguage`）、`Views/LanguageSettings/LanguageList.swift:76`、引导页源语言下拉（`OnboardingGuideView.swift:27-29, 1009-1010`）。
- 候选集 = Apple Translation `LanguageAvailability().supportedLanguages` ∩ 上述 20 种语言（`LanguageData.swift:142-176`）。

**(d) 功能 × 源语言可用性矩阵 [事实]**

| 功能 | 英语网页 | 其他非 CJK 语言网页（法/德/西/俄…） | 中/日/韩网页 | 证据 |
|---|---|---|---|---|
| 右滑整句翻译 | ✅ | ✅ | ✅ | 无语言限制 |
| 双击查词（AI 语境释义） | ✅ | ✅ | ❌ | `20-features.js:281` `isLikelyCJK(selectedWord)`；xcstrings `double_tap_not_supported_message`：“Double-tap translation is currently not supported for Chinese, Japanese, and Korean.” |
| 语言块提取 Chunks | ✅ | ❌ | ❌ | `MainViewModel.swift:1973-1982`（`isChunkExtractionSupportedSourceLanguage` → `baseLanguage == "en"`）；注释 “后端当前仅支持英语源文”（`:1955-1958`）；App Store：“Supports Language Chunk Extraction (currently English only)” |
| 动作脉络 Action Flow | ✅ | ❌ | ❌ | `MainViewModel.swift:2386` `"sentenceSkeletonSupported": Self.isChunkExtractionSupportedSourceLanguage(...)` |
| 发音（AI / 本地） | ✅ | ✅ | ✅ | 本地语音依 iOS 语音包；AI 语音走后端 `/translate/tts`（gpt-4o-mini-tts，见 SE 模型对照表 F11） |

**结论 [推断]**：WBW 是“多语言可用、英语最强”的产品。对非英语学习者它仍有价值（右滑翻译 + 双击），这正是它与 SE 的区隔点——**WBW 的官网定位应保留“任意外语网页”，SE 推荐只对英语学习者成立。**

### 2.4 核心功能清单（真实行为 + 证据 + 官网是否提及）

| # | 功能（App 内官方英文名） | 真实行为 | 证据 | 官网现状 |
|---|---|---|---|---|
| 1 | 内置浏览器（Tabs / Address bar / Bookmarks） | 地址栏粘贴链接或关键字搜索；底栏前进/后退/新标签/标签管理/更多；首页收藏卡片 | `Views/BottomToolbar/BottomToolbar.swift:24-63`；`Views/MainView/HomeView.swift:59-128`；`Views/TabManager/*` | ❌ 未提及（官网只说 “in your browser”，易误解为浏览器插件） |
| 2 | **Swipe to Translate**（右滑翻译） | 网页文字右滑 → 译文插入原文下方；模式 Auto / Paragraph / **Sentence by Sentence**；结果“自动显示/手动显示（先占位）”；左滑或 X 关闭卡片 | xcstrings `daily_sentence_translation_limit`、`translation_mode_*`、`swipe_translation_result_display_mode_*`；引导 `coreClosePrompt` | ✅ 有（但多语言 meta 写成“选中文本”，见 §7） |
| 3 | 翻译引擎切换 | **Cloud Translation Engine**（“currently backed by Azure and Google”）/ **Local Engine**（iOS 系统翻译，首次可能需下载语言包）；云端额度用完可“一键切换本地并重试” | xcstrings `swipe_translation_engine_mode_api_description`、`…_local_description`、`swipe_translation_switch_and_retry_button`；`TranslationAssetManager/*` | ❌ 未提及本地/离线引擎 |
| 4 | 译文样式 | 8 种：Quote（默认）、Background、Border、Solid/Dashed/Wavy Underline、No Style | xcstrings `translation_style_title_*` | ⚠️ 官网写成 “theme colors”，不准确 |
| 5 | **Double-tap to Look Up (AI Meaning)** | 双击单词 → 轻量卡片：语境义、短语识别、发音、More；CJK 源文不可用 | xcstrings `word_meaning_lookup_title`、`tip_double_tap_context_meaning`；`Views/QuickContextMeaning/*`；后端 F5 `context-word-resolver`（gemini-3.1-flash-lite） | ✅ 有 |
| 6 | **More Definitions**（完整词典条目） | 完整释义、词形、例句；本地缓存 500 条 | `Views/FullDictionaryEntry/*`；`Docs/cache-current-state.md` 总览表；引导 `moreBody` | ⚠️ 隐含在“例句/搭配”里 |
| 7 | **Chunk Extraction**（语言块） | 翻译后自动/手动/关闭三档；高亮短语，可列表浏览；仅英语源文 | xcstrings `chunk_extraction_mode_*`；`Views/TranslationSettings/ChunkExtractionModeSettings.swift` | ❌ 完全未提及 |
| 8 | **Sentence Action Flow**（动作脉络，1.2.2 新增） | 翻译后看句子核心动作、并列动作、关联动作；自动/手动/关闭；仅英语 | xcstrings `sentence_skeleton_*`；App Store What's New | ❌ 未提及。⚠️ **命名不统一**：App Store “Action Flow”、设置 “Sentence Action Flow”、引导 “Action Trail”（`OnboardingGuideView.swift:2185`） |
| 9 | **AI Syntax Structure Analysis**（句型解析） | 在句子历史/详情中对整句做 AI 语法结构解释 | xcstrings `grammar_structure_analysis`、`get_syntax_explanation_button`；后端 F10（gpt-4.1-mini） | ✅ 以 “Context Analysis” 名义提及，但被写成 Plus 专属（实际免费 5 次/天） |
| 10 | 发音：**AI Read / Local Read** | AI：云端 AI 语音，自然但较慢；Local：iOS 内置语音，快、机械感，可选已下载的 Premium/Enhanced voice，语速三档 + 本地语速 | xcstrings `audio_playback_*`、`local_speech_engine_*`、`local_speech_speed_*`；`TextToSpeech/SpeechSpeed.swift:9-11` | ✅ 有（但“Plus 无限 AI 发音”不实） |
| 11 | 历史 | 句子翻译历史（Swipe History）+ 查词历史（按上下文分组，最多约 1000 组）；可清空 | `SentenceHistoryManager/*`、`Views/WordHistoryView/*`；入口为浮动操作条按钮（`Views/ViewActionBar/ViewActionBar.swift:29-52`） | ✅ 有 |
| 12 | X（Twitter）适配 | 兼容 X 登录流程（WebView 登录页白名单）；引导首推 X | `Views/Components/WebView.swift:212-220, 717`；`OnboardingGuideView.swift:2210-2211`；App Store “Optimized for X” | ❌ 未提及 |
| 13 | 新手引导 Guide（1.2.0 起） | 在真实网页上逐步体验右滑、双击、Chunks、Action Trail、音频；设置中 Help 可重开 | `OnboardingGuideView.swift`（`wbw-guide://guide.word-by-word.app/start`） | ❌ 未提及 |
| 14 | 用量页 / Free vs Plus 对比页 | 显示今日剩余额度 | `SubscriptionManager/FeatureUsageView.swift`、`SubscriptionComparisonView.swift` | — |
| 15 | 反馈 | App 内反馈（可选邮箱） | `Views/FeedbackView/FeedbackView.swift` | — |

**确认不存在的功能 [事实]**（官网却有暗示）：主题/深色模式自定义（`SettingsMenuViewController.swift:182-184` 的 `toggleTheme()` 只有 `print`，无实现；全工程无 `preferredColorScheme`）、快捷键、音量调节（全工程 `grep -i volume` 0 结果）、生词本复习/闪卡/游戏、账号与同步、Safari 扩展、分享扩展。

### 2.5 Free vs Plus（真实额度）[事实]

来源：`FeatureQuotaManager/FeatureQuotaManager.swift:61-86`（每日重置）；对比页额外一行“本地合成语音：免费/Plus 均无限”（`SubscriptionComparisonView.swift:30-34`）。

| 功能 | Free / 天 | Plus / 天 |
|---|---|---|
| 右滑翻译 · 云端引擎 | 50 | 500 |
| 右滑翻译 · 本地引擎 | 100 | **无限** |
| 双击查词（AI 释义） | 20 | 500 |
| 语言块提取 | 30 | 500 |
| 动作脉络 | 20 | 500 |
| 更多释义（More） | 10 | 500 |
| AI 句型解析 | 5 | 500 |
| AI 发音 · 单词 | 10 | 200 |
| AI 发音 · 句子 | 10 | 100 |
| 本地语音 | 无限 | 无限 |

价格：Plus 月订 $3.99（US App Store）。命中缓存的翻译不扣额度（`Docs/cache-current-state.md` “右滑翻译缓存”节）。

### 2.6 App Store 文案问题 [事实]

- US 描述**第一行是内部备注 “English concise submission version”**（`itunes.apple.com/lookup?id=6741724502&country=us` 的 `description` 首行；WebFetch 亦确认）。这段会被 App Store 及搜索引擎索引，应尽快在 App Store Connect 删除（不在官网代码范围内，但影响品牌搜索结果摘要）。
- JP/CN 描述无此问题，内容与 US 一致（Chunks “现在は英語のみ / 当前仅支持英语”、X 适配、Azure/Google/本地引擎、20+ 语言）。

### 2.7 WordByWord Chrome 扩展 [事实 + 推断]

| 项 | 内容 | 证据 |
|---|---|---|
| 名称 / 版本 | “WordByWord Translate”，MV3，v0.1.2 | `WBW-ext/manifest.json`；`_locales/en/messages.json` |
| 描述 | “Provides sentence-by-sentence contrast translation on all web pages, supporting context-based AI definitions and syntactic analysis of words.” | `_locales/en/messages.json` |
| 扩展 UI 语言 | en / ja / ko / zh_CN（default_locale = zh_CN） | `_locales/`、`manifest.json` |
| 交互 | 鼠标悬停 + Shift 段落翻译；Control 触发上下文词义；侧边栏历史；浅/深主题；TTS | `README.md:1-12, 52-56`；`manifest.json` `side_panel`、`tts` 权限 |
| 翻译来源 | 浏览器内置 Translator API（Chrome/Edge 138+）+ 远程翻译（`api.word-by-word.app`） | `README.md:3-9`；`src/services/translator.js`、`remoteTranslate.js`；`config.json` `prodApiBase` |
| 可选目标语言 | **仅 7 种**：zh, ja, ko, fr, de, es, en | `src/core/settings.js:19` `SUPPORTED_TARGET_LANGS` |
| 维护 | 最后提交 2026-02-13 | `git log` |
| 上架状态 | **无法确认已公开上架**：官网按钮指向通用商店首页；“10,000+ 用户”被注释；仓库中无 listing ID；WebSearch 未找到 listing | `chrome-extension/index.html:243, 253`；WebSearch 结果 |
| 子站可发现性 | 主站 21 页无任何链接指向 `chrome-extension/`；子站仅 zh-CN 一个语言 | `grep -l chrome-extension *.html` → 0；`chrome-extension/index.html:2` `lang="zh-CN"` |

**[推断]** Chrome 扩展事实上处于“未发布/停更”状态。改版时应决定：下线子站、或标注 “Coming soon / Beta”，**不应继续用 “立即安装 / 20+ 语言” 的说法**。

### 2.8 品牌撞名：WordByWord.io [事实]

- `https://wordbyword.io/` 标题 “Learn a Language from Websites, YouTube & PDF | WordByWord.io”；网页平台 + Chrome/Edge/Firefox 扩展；50+ 语言；Free + Premium $5.99/月；与 word-by-word.app 无关联（WebFetch）。
- WebSearch “"WordByWord Translate" chrome web store extension” 返回的 WordByWord 相关结果全部是 wordbyword.io（其博客 `wordbyword.io/en/blog/best-translation-extension`、`/translate-on-hover`、`/docs/chrome-extension-setup`）。
- **[推断]** 用户观察到“命中关键词集中在 word by word 品牌词”，而该品牌词本身被对方的内容营销占据，进一步说明 WBW 必须靠**功能型核心关键词**（swipe to translate、bilingual reading、contextual dictionary、sentence by sentence translation 等）获取非品牌流量。

---

## 3. SurfEnglish 事实底稿

### 3.1 一句话定位与目标用户

- **App Store（US）**：名称 “SurfEnglish: Bilingual News”，副标题 “Read English with Translation”，分类 News + Education；描述首句 “Read English news, articles, podcasts, and the wider web with translation tools built directly into the text.”（lookup）
- **官网 meta（`SE-web/src/locales/en.json` `meta.title`）**：“SurfEnglish: Bilingual News — Read English with the Translation Below Every Sentence”
- **[建议] 一句话定位**：*读真实英语新闻和任意英文网页的 iPhone App：译文直接排在每句原文下方，自动标出语言块，双击看语境释义，本地 AI 语音朗读，读过的内容变成复习小游戏。*
- **目标用户 [事实]**：**母语非英语、想通过读真实英语学英语的人**（CEFR A1–C1 分级，`en.json` `feed.bullets[1]`）。学习语言只有英语（见 TL;DR 第 3 条证据）。

### 3.2 功能清单（带证据）

| # | 功能 | 真实行为 | 证据 |
|---|---|---|---|
| 1 | 英语新闻信息流 | 按话题（世界、体育、科技、旅行、生活…）获取真实来源文章；每张卡片带 CEFR 风格等级（A1–C1）和阅读时长；可添加自定义 HTTPS RSS | `en.json` `feed.*`；App Store 描述 |
| 2 | 右滑翻译 | 句子/段落模式；引擎：Cloud / On-device / **AI Natural Translation**（1.3.0，失败自动回退）；卡片可附加 AI mirror 行 | `en.json` `gestures.items[0]`、`release.items[1]`；模型对照表 F1–F3 |
| 3 | 语言块 Chunks | 翻译后自动或按需高亮，点开有单独释义；信息流与浏览器都可用 | `en.json` `gestures.items[1]` |
| 4 | 双击语境查词 | 语境义 + 词性 + 发音；More 打开完整条目 | `en.json` `gestures.items[2]`、`faq.items[3]` |
| 5 | 内置浏览器（Free Explore，1.3.0） | 搜索或输入网址；**最多 24 个标签**并恢复阅读位置；收藏；预置 X 和播客站点；支持页面上可用翻译/语言块/查词/朗读 | `en.json` `explore.*`；`SE-iOS/Docs/free-explore-browser-v1.3.0-plan.md` |
| 6 | 分享扩展 | 从其他 App 的分享面板把网址发送给 SurfEnglish 打开 | `SE-iOS/SurfEnglishShare/Info.plist`（`NSExtensionActivationSupportsWebURLWithMaxCount = 1`）、`ShareViewController.swift` 头注释 |
| 7 | 本地神经语音 | Kokoro 引擎，12 个英美 voice（🇺🇸8 / 🇬🇧4），完全在设备端运行、可离线 | `en.json` `voice.*` |
| 8 | 学习库 | 翻译过的句子和查过的词自动保存在本机，保留来源、上下文和复习计划 | `en.json` `games.libraryText` |
| 9 | 游戏 | Sentence Builder（App Store 叫 Sentence Puzzle）、Word Raid 可玩；Word Stack、Word Grid 即将推出 | `en.json` `games.list[*]`；App Store 描述 “Sentence Puzzle and Word Raid” ⚠️ 命名不一致 |
| 10 | 账号与隐私 | 无需账号；Sign in with Apple 仅用于同步话题和自定义源；不插入广告、不使用 IDFA；分析可在设置中关闭 | App Store 描述 “ACCOUNT AND PRIVACY” 段 |
| 11 | 离线 | 本地语音和本地翻译引擎可离线；信息流、云端翻译、语言块、查词需要联网 | `en.json` `faq.items[6]` |

### 3.3 语言能力 [事实]

- **界面语言 12 种**：en, zh-Hans, zh-Hant, ja, ko, vi, id, th, es, pt-BR, hi, ar（RTL）——`SE-iOS/Docs/surfenglish-ios-localization-design.md` §2.1（“第一版不做 fr/de/it/ru/tr/pl/nl/uk 的完整 UI 本地化”）；`project.pbxproj:288-302` knownRegions；App Store 语言列表同为 12 种。
- **翻译目标语言 21 locale**：与 WBW 完全相同的池（`SE-web/build.mjs:68-72` `TRANSLATE_LANGS` 注释 “Mirrors the app's LearningTargetLanguage.all exactly”；本地化设计文档 §2.2 “与 WBW 引擎一致的 21-language pool”）。
- **学习语言**：仅英语。
- **官网语言**：12 个 locale 首页（`build.mjs:51-64`，路径 `''`, `zh-hans`, `zh-hant`, `ja`, `ko`, `es`, `pt-br`, `vi`, `id`, `th`, `hi`, `ar`），全部线上 200；`about`、`learn-english-by-reading`、`support`、`privacy` 仅英文（`build.mjs:134-160`）。

### 3.4 价格与额度 [事实]

- IAP（US）：**SurfEnglish Plus Monthly $2.99 / Yearly $24.99**（App Store HTML）。价格低于 WBW Plus 月订（$3.99）。
- 免费额度（`SE-iOS/SurfEnglish-iOS/Browser/Engine/src/FeatureQuotaManager/FeatureQuotaManager.swift:74-100`）：与 WBW 基本相同，差异：本地右滑翻译 Free **50**（WBW 100）/ Plus 无限；新增 AI 翻译（Natural/Mirror）Free 20 / Plus 200；游戏内语言块 Free 3 / Plus 999。
- Plus 额外权益：信息流自动翻译（`en.json` `plus.plusItems[1]`）。

### 3.5 App Store 实况 [事实]

| 项 | 内容 |
|---|---|
| 版本 | 1.3.1（2026-09-19，修复 iOS 27 崩溃）；1.3.0 加入 Free Explore 浏览器、AI Natural Translation、自动语言块 |
| 首发 | 2026-08-18（store）；官网 `SITE.launchDate = '2026-08-21'`（`build.mjs:41`） |
| 评分 | US 0；JP 1 条（4.0）；其余 0 |
| 兼容 | iPhone / iPad（iOS 18+）、Mac（M1+，macOS 15+）、Vision Pro。⚠️ 官网 FAQ 只写 “iPhone and iPad”（`en.json` `faq.items[9]`），WBW 推广脚本写 “Free on iPhone” |
| Storefront 名称 | JP “SurfEnglish：英語ニュース・対訳で学習”；TW/HK “SurfEnglish：英文新聞·雙語對照”；KR “SurfEnglish: 영어 뉴스 원문·번역”；BR “SurfEnglish: Inglês e notícias”；MX/ES “SurfEnglish: Inglés y noticias”；其余（含 DE/FR/IT/NL/PL/RU/TR/UA/VN/TH/ID/IN/SA/AE/GB）“SurfEnglish: Bilingual News” |
| 副标题 | US “Read English with Translation”；JP “英語ニュースを対訳で読む”；TW “逐句對照，輕鬆讀懂英文新聞”；KR “영어 뉴스를 원문과 번역으로” |
| **可用地区** | **中国大陆不可用**（lookup cn 空；`/cn/app/id6787367021` 404）。TW、HK、JP、KR、VN、TH、ID、IN、BR、MX、ES、SA、AE、DE、FR、RU、TR、UA、IT、NL、PL、GB 均可用 |

### 3.6 SE 官网与 WBW 的关系 [事实]

- SE 官网源码中**完全没有提到 WordByWord**（`grep -rni "wordbyword\|word-by-word\|word by word" SE-web/src SE-web/build.mjs` → 0 结果）。目前只有 WBW → SE 的单向推荐。
- SE 官网 `appstore-metadata/` 只有 `v1.1.0.toml`（旧版副标题 “Read News, Grow Vocabulary”），与线上 1.3.1 文案已不同——**引用 SE 文案时以线上 App Store 和 `src/locales/*.json` 为准**。

---

## 4. 功能对照表

判定列：**共有** = 两者都有且基本等价；**WBW 独有**；**SE 独有**；**SE 更强** = 两者都有但 SE 明显更强。

| 能力 | WordByWord | SurfEnglish | 判定 |
|---|---|---|---|
| 学习语言 | 多种（默认英语；源语言可切换/自动检测；非英语源文功能受限） | 仅英语 | **WBW 独有**（多语言） |
| 界面语言 | 20 种 | 12 种 | **WBW 更广** |
| 翻译目标语言 | 21 locale | 21 locale（同一池） | 共有 |
| 内置浏览器 | 有（标签、收藏、地址栏） | 有（≤24 标签、恢复阅读位置、预置 X/播客站点） | **SE 更强** |
| 新闻信息流 + CEFR 分级 + 阅读时长 | 无 | 有 | **SE 独有** |
| 自定义 RSS | 无 | 有（HTTPS） | **SE 独有** |
| 分享扩展（从 Safari 等发送网址） | 无 | 有 | **SE 独有** |
| 右滑翻译（句/段） | 有 | 有 | 共有 |
| 翻译引擎 | Cloud（Azure/Google）+ Local（iOS） | Cloud + On-device + **AI Natural Translation**（+ Mirror 附加行） | **SE 更强** |
| 译文样式自定义 | 8 种样式 | 未在官网/商店说明（引擎复用，[推断] 大概率保留） | 待确认 |
| 双击语境查词 + More | 有（CJK 源文除外） | 有 | 共有 |
| 语言块 Chunks | 有（仅英语；自动/手动/关闭） | 有（默认自动，信息流+浏览器，每个块有释义） | **SE 更强** |
| 动作脉络 Action Flow | 有（仅英语） | 引擎内保留（`FeatureQuotaManager` 有 `sentenceSkeleton`；模型对照表 F9 “浏览器”） | 共有（WBW 官网可主打，SE 官网未主打） |
| AI 句型解析 | 有 | 引擎内保留（模型对照表 F10） | 共有 |
| 发音 | AI 云端语音（gpt-4o-mini-tts）+ iOS 本地语音 | **Kokoro 本地神经语音（12 个英美 voice，离线）** + 云端 AI 发音 | **SE 更强**（英语场景） |
| 历史 | 句子历史 + 查词历史 | 学习库（含上下文与复习计划） | **SE 更强** |
| 复习/游戏 | 无 | Sentence Builder/Puzzle、Word Raid（+2 个即将推出） | **SE 独有** |
| X（Twitter）适配 | 有，且是 WBW 的首推场景 | 有（预置 X 目的地） | 共有 |
| 新手引导 | 有（真实网页互动引导） | 有（`Docs/surfenglish-onboarding-design-v0.1.md`） | 共有 |
| 账号/同步 | 无 | 可选 Sign in with Apple（话题与自定义源） | **SE 独有** |
| 平台 | iPhone、iPad、Mac(M1)、Vision Pro；Chrome 扩展未公开 | iPhone、iPad、Mac(M1)、Vision Pro | 共有 |
| 中国大陆 App Store | 可下载 | **不可下载** | **WBW 独有** |
| Plus 价格（US） | $3.99/月 | $2.99/月、$24.99/年 | SE 更便宜 |

---

## 5. 关键结论：SurfEnglish 适合推荐给哪类 WordByWord 访客

### 5.1 访客分群与推荐适配度

| 分群 | 典型落地页 | SE 是否对 TA 有益 | 理由 |
|---|---|---|---|
| A. 母语非英语、正在学英语（读英文新闻/X/技术文档） | ja、ko、zh-TW、es、pt、vi、id、th、hi、ar | ✅ **强推荐** | SE 覆盖 WBW 全部核心手势，并提供更强的语言块、本地语音、新闻分级、复习游戏；且有母语界面 |
| B. 同 A，但母语是 de/fr/it/nl/pl/ru/tr/uk | 对应 8 个语言页 | ✅ **推荐，但必须说明“界面为英文，译文支持你的语言”** | SE 翻译池含这 8 种语言，但无该语言 UI 和官网页 |
| C. 中国大陆的英语学习者 | cn-top / zh-top | ⚠️ **只能软性提及** | SE 在中国大陆 App Store 不可下载；直接放下载按钮会让用户撞 “该 App 在你所在地区不可用” |
| D. 学英语以外外语的人（如中国人学日语、日本人学中文/韩语、学西语/法语的人） | 任意语言页（含 en） | ❌ 不推荐 | SE 只能学英语；WBW 才是对的工具（但需诚实写清 CJK 不支持双击、Chunks 仅英语） |
| E. 英语母语者（学其他语言） | index / en-top | ❌ 对本人不适用 | [推断] en 页主流访客读的是外语网页，SE 对其无用；最多用 “Learning English? / 给学英语的朋友” 的条件式提及 |
| F. 只想“看懂外语网页”而非学习的读者 | 任意 | ➖ 弱 | WBW 更轻；SE 的信息流/游戏对其非刚需 |

### 5.2 推荐话术原则 [建议]

**应该：**
- 用**条件式**：“正在学英语？试试我们的姐妹 App SurfEnglish” / “Learning English? Meet SurfEnglish, from the makers of WordByWord.”
- 讲**增量价值**，且只讲真实存在的：英语新闻信息流（A1–C1 分级）、语言块自动标注、本地 AI 语音离线朗读、读过的句子和单词变成复习游戏、24 标签浏览器、分享扩展。
- 讲清**分工**：WordByWord = 任意外语网页的即时对照阅读工具（多学习语言、20 种界面语言）；SurfEnglish = 专为学英语设计的阅读 App。这正好维持 WBW 的定位不变。
- 在 de/fr/it/nl/pl/ru/tr/uk 页写清：“界面为英文 · 可翻译成德语”（以德语页为例）。
- 在 zh-CN 页写清：“目前未在中国大陆 App Store 上架”，或只放官网链接、不放下载徽章。

**不应该：**
- 把 SE 说成 WBW 的“新版/替代/升级版”（会误导 D/E 类用户放弃 WBW，也违背“WBW 定位不变”）。
- 在 8 个无 SE 界面的语言页写 “App in 12 languages / App in 12 Sprachen”（`surfenglish-promo.js:289-422` 现状），该语言不在 12 种之内。
- 用 “New / 新上线” 长期挂在顶部公告条（SE 已于 2026-08 上线，标签会过时）。
- 把推广做成 hero 前的全局顶部公告条压过 WBW 主 CTA（与“顺带告知”的定位要求冲突）。

**[建议] 放置位置**：WBW 功能介绍之后的 “姐妹 App” 区块（静态 HTML，可被抓取）+ FAQ 条目 “WordByWord 和 SurfEnglish 有什么区别？我该用哪个？” + 页脚 “Our apps” 链接。顶部公告条可以去掉或降级为可关闭的小提示。

### 5.3 用数据验证推荐强度 [建议]

- WBW App 的 Firebase 事件 `right_swipe_translate` 已带 `source_language` / `target_language`（`MainViewModel.swift:1777-1780`），公共参数带 `app_language` / `locale`（`AnalyticsManager.swift:113-123`）。在 Firebase/GA4 里按 `app_language` 分组统计 `source_language = en-US` 的占比，就能知道每个语言页的访客中“学英语的人”有多少，用来决定各语言页的推荐强度。
- SE 下载归因：App Store 链接本身不能带 UTM，可以在 SE 的 App Store 链接上加 App Store Connect campaign 参数（`?pt=<provider token>&ct=wbw_<lang>_<slot>`），在 ASC App Analytics 中按来源统计。当前推广脚本只给 SE 官网链接加了 UTM（`surfenglish-promo.js:23,476`），App Store 链接没有任何归因参数（`:21,477`）。
- WBW 官网 `js/analytics.js` 会把所有 `apps.apple.com` 点击归为一类 `appStore`（`:4-7`），**无法区分 WBW 下载和 SE 下载**，改版时需要给两类按钮加不同的 `data-ga-label`。

---

## 6. 语言覆盖交集与链接映射

WBW 共 20 种语言 / 21 个 HTML 文件 + 首页；SE 共 12 个 locale。交集 = 12 种语言（14 个 WBW 文件）。

| WBW 文件 | `<html lang>` | WBW App 界面 | SE App 界面 | SE 官网对应页 | SE 在该语言主要市场的 App Store 名称 | 推荐方式 [建议] |
|---|---|---|---|---|---|---|
| `index.html` / `en-top.html` | en | ✅ | ✅ | `https://surfenglish.app/` | SurfEnglish: Bilingual News | 条件式弱提及（“Learning English?”），见 §5.1 E |
| `zh-top.html` / `cn-top.html`（两文件相同） | zh-CN | ✅ | ✅ | `/zh-hans/` | **中国大陆不可用** | 仅链接官网 + 标注“中国大陆 App Store 暂未上架”；不放下载徽章 |
| `tw-top.html` | zh-TW | ✅ | ✅ | `/zh-hant/` | SurfEnglish：英文新聞·雙語對照（TW/HK） | 正常推荐 |
| `ja-top.html` | ja | ✅ | ✅ | `/ja/` | SurfEnglish：英語ニュース・対訳で学習 | 正常推荐 |
| `ko-top.html` | ko | ✅ | ✅ | `/ko/` | SurfEnglish: 영어 뉴스 원문·번역 | 正常推荐 |
| `es-top.html` | es | ✅ | ✅ | `/es/` | SurfEnglish: Inglés y noticias（ES/MX） | 正常推荐 |
| `pt-top.html` | pt | ✅（pt-BR） | ✅（pt-BR） | `/pt-br/` | SurfEnglish: Inglês e notícias（BR） | 正常推荐（WBW 页 lang 为 `pt`，SE 为 `pt-BR`） |
| `vi-top.html` | vi | ✅ | ✅ | `/vi/` | SurfEnglish: Bilingual News（VN） | 正常推荐 |
| `id-top.html` | id | ✅ | ✅ | `/id/` | SurfEnglish: Bilingual News（ID） | 正常推荐 |
| `th-top.html` | th | ✅ | ✅ | `/th/` | SurfEnglish: Bilingual News（TH） | 正常推荐 |
| `hi-top.html` | hi | ✅ | ✅ | `/hi/` | SurfEnglish: Bilingual News（IN） | 正常推荐 |
| `ar-top.html` | ar（rtl） | ✅（覆盖率最低 255/315） | ✅（RTL） | `/ar/` | SurfEnglish: Bilingual News（SA/AE） | 正常推荐；注意 RTL 布局 |
| `de-top.html` | de | ✅ | ❌ | `/`（英文根） | SurfEnglish: Bilingual News | 推荐 + 标注“界面为英文，可翻译成德语” |
| `fr-top.html` | fr | ✅ | ❌ | `/` | 同上 | 同上（法语） |
| `it-top.html` | it | ✅ | ❌ | `/` | 同上 | 同上（意大利语） |
| `nl-top.html` | nl | ✅ | ❌ | `/` | 同上 | 同上（荷兰语） |
| `pl-top.html` | pl | ✅ | ❌ | `/` | 同上 | 同上（波兰语） |
| `ru-top.html` | ru | ✅ | ❌ | `/` | 同上 | 同上（俄语） |
| `tr-top.html` | tr | ✅ | ❌ | `/` | 同上 | 同上（土耳其语） |
| `uk-top.html` | uk | ✅ | ❌ | `/` | 同上 | 同上（乌克兰语） |

线上校验：SE 12 个 locale 路径 + `/about/` + `/learn-english-by-reading/` 均 HTTP 200；`/de/` 404（curl，2026-10-05）。
现推广脚本的 `sitePath` 映射与上表一致（`surfenglish-promo.js:61-422`），问题在于文案和 zh-CN 下载按钮，而不是 URL 映射。

---

## 7. 官网现有文案与真实产品不符 / 已过时清单

严重度：**H** = 与事实相反，可能误导购买/下载；**M** = 不准确或过时；**L** = 细节。行号以英文页为主，其他语言页是同一结构的翻译（已抽查 ja-top / zh-top 同样存在）。

| # | 位置 | 现文案 | 真实情况 | 证据 | 级别 |
|---|---|---|---|---|---|
| 1 | `en-top.html:180`（ja-top:176、zh-top Plus 段） | Plus：“Unlimited AI pronunciation with higher quality” | Plus 的 AI 发音有上限：单词 200/天、句子 100/天；**无限的是本地语音，且免费也无限** | `FeatureQuotaManager.swift:76-80`；`SubscriptionComparisonView.swift:30-34` | H |
| 2 | `en-top.html:182`（ja-top:178、zh-top “自定义主题与夜间模式”） | Plus：“Custom themes and dark mode” | 不存在；主题切换按钮为空实现 | `SettingsMenuViewController.swift:182-184` | H |
| 3 | `en-top.html:143`（ja-top:143、zh-top:151） | “Customize translation/lookup shortcuts, adjust TTS speed and volume, and freely switch theme colors” | iOS 无快捷键、无音量设置、无主题色；实际可定制：翻译模式（自动/段落/逐句）、8 种译文样式、云端/本地引擎、Chunks 与 Action Flow 的触发模式、AI/本地语音、本地 voice、语速 | xcstrings `translation_style_*`、`*_mode_*`；`grep -i volume` 0 结果；快捷键是 Chrome 扩展功能 | H |
| 4 | `en-top.html` Plus 段 | Plus：“Sentence structure analysis and example recommendations” | 句型解析免费也有（5/天），Plus 是 500/天 | `FeatureQuotaManager.swift:84-85` | M |
| 5 | `en-top.html:215-219` FAQ Q3（zh-top 同） | “free version allows a limited number of AI translations and **20** AI pronunciations per day” | 免费：AI 发音单词 10 + 句子 10；云端翻译 50、本地翻译 100、双击 20、Chunks 30、Action Flow 20、More 10、句型 5 | `FeatureQuotaManager.swift:61-86` | M |
| 6 | `en-top.html:223` FAQ Q4 | “The initial version supports…”；“automatically detects the **target** language” | 自动检测的是**源语言**（页面语言）；“initial version” 已过时（现 1.2.2）；应写清 20 种界面语言 + 21 种翻译语言，以及 CJK 不支持双击、Chunks/Action Flow 仅英语 | xcstrings `settings_menu_source_language_detail`；§2.3 | M |
| 7 | `zh-top.html:229` FAQ Q4 | “支持包括从 英语 到 中文、日语、韩语等超过20种语言对” | 源语言并非只有英语（可切换/自动检测），只是英语功能最全；该句还夹杂未翻译的 “target language”“Prompt 模板” | `LanguageData.swift:142-176` | M |
| 8 | 全部 21 页 `<meta name="description">`（如 `en-top.html:7`） | “translate by swiping text **in your browser**”；it/pl/pt/ru/tr/uk/hi/ar 的 meta 写成“**选中/选择文本**即翻译”（selezionando / zaznaczenie / ao selecionar / при выделении / seçerek / виділеного / चुनते ही / عند تحديد）；zh 写“划词即译” | 实际是 App **内置浏览器**中的**右滑**手势；“in your browser / 选中文本 / 划词”容易被理解为桌面浏览器插件或选词翻译 | §2.1；`20-features.js` 手势实现；xcstrings `tip_swipe_to_translate` | M |
| 9 | 全站 | 未提及：Chunks、Action Flow、本地翻译引擎（离线；Plus 无限）、X 适配、内置浏览器（标签/收藏）、新手引导、iPad/Mac/Vision Pro、20 种界面语言 | 这些都是线上 1.2.x 的真实功能，也是功能型关键词来源 | `grep -il chunk *.html` → 0；`grep -iE "ipad\|iphone\|mac" en-top.html` → 0；App Store 描述 | H（SEO 机会损失） |
| 10 | 全部 21 页页脚 + `chrome-extension/index.html` | “© 2025 WordByWord” | 2026 | `grep -c "© 2025"` 22 个文件 | L |
| 11 | 页脚 | “Independently developed. No personal data is collected.” | App 集成 Firebase Analytics 并上报 `device_uuid` 等 | `AnalyticsManager.swift:8, 113-123` | M（需用户复核，属合规风险） |
| 12 | 全部 22 处 App Store 徽章 | 一律 `…/black/en-us` 英文徽章 | 未本地化（L）；App Store 链接 `https://apps.apple.com/app/6741724502` 缺 `id` 前缀但可 301 跳转（curl 验证） | `grep badges/download-on-the-app-store` | L |
| 13 | `cn-top.html` 与 `zh-top.html` | 两个文件完全相同（md5 一致）；`index.html` 与 `en-top.html` 只差 1 行注释 | 重复内容；各语言页之间也没有互相链接（`grep -c "\-top.html"` 在 HTML 中为 0，仅 JS 映射表中出现） | md5；grep | M（SEO，交给架构报告） |
| 14 | `chrome-extension/index.html:243` | “Chrome 商店安装 / 添加至 Chrome” 指向 `https://chrome.google.com/webstore` | 不是扩展的 listing；扩展是否公开上架无法确认 | §2.7 | H |
| 15 | `chrome-extension/index.html` FAQ Q4 | “支持中文、英语、日语…等 20+ 种语言的互译” | 扩展设置只允许 7 种目标语言 | `WBW-ext/src/core/settings.js:19` | M |
| 16 | `chrome-extension/index.html` | “由 ChatGPT 和 Gemini 强力驱动” | 后端实际用 OpenAI/Gemini API 模型（gpt-4.1-mini、gpt-5.x、gemini-3.1-flash-lite 等），不是 “ChatGPT” 产品；可写 “OpenAI 与 Google Gemini 模型” | `SE-iOS/Docs/wordbyword-backend-feature-model-map.md` §1 | L |
| 17 | `js/surfenglish-promo.js:289-422`（de/fr/it/nl/pl/ru/tr/uk） | “App in 12 Sprachen / 12 langues…” | 这 8 种语言不在 SE 的 12 种界面语言里，读者会以为有母语界面 | §3.3 | H |
| 18 | `js/surfenglish-promo.js:21, 80`（zh-CN） | zh-CN 页给出 App Store 下载按钮 | 中国大陆 storefront 不可用（404） | §3.5 | H |
| 19 | `js/surfenglish-promo.js:61-73`（en） | 对英文页访客说 “learn English faster” | [推断] 英文页主流访客是英语母语、学其他外语的人 | §5.1 E | M |
| 20 | `js/surfenglish-promo.js` 各语言 `label` / `eyebrow` | “New / 新上线 / Neu…” | SE 已于 2026-08-18 上线，“新”会过时 | lookup `releaseDate` | L |
| 21 | `js/surfenglish-promo.js` 各语言 `lead` | “Free on iPhone / iPhone 免费下载” | SE 同样支持 iPad、Mac(M1)、Vision Pro | App Store 兼容性 | L |
| 22 | App Store（非官网，但影响品牌 SERP 摘要） | US 描述首行 “English concise submission version” | 内部备注误发布 | lookup `description` | H（ASC 修改，非官网代码） |

---

## 8. 供关键词规划使用的“真实功能词”素材（App 内官方本地化名称）

来自 `WBW-iOS/Localizable.xcstrings`（App 内实际显示的功能名，可作为各语言页功能 H2/H3 与关键词候选的**事实底座**；关键词搜索量与取舍由 SEO 报告决定）。`—` 表示该语言缺译。

| 语言 | 右滑翻译 | 双击查词 | 语言块 | 动作脉络 | AI 句型解析 | AI 发音（单词） | 更多释义 | 本地引擎 | 历史 | 逐句 |
|---|---|---|---|---|---|---|---|---|---|---|
| en | Swipe to Translate | Double-tap to Look Up (AI Meaning) | Chunk Extraction | Sentence Action Flow | AI Syntax Structure Analysis | AI Pronunciation (Word) | More Definitions | Local Engine | Translation History | Sentence by Sentence |
| zh-Hans | 滑动翻译 | 双击查词(AI释义) | 语言块提取 | 句子动作脉络 | AI句型结构分析 | AI 发音（单词） | 更多释义 | 本地引擎 | 查词历史 | 逐句 |
| zh-TW | 滑動翻譯 | 雙擊查詞(AI釋義) | 語言塊提取 | 句子動作脈絡 | AI 句法結構分析 | AI 發音（單詞） | 更多释义（⚠️简体未转繁） | 本地引擎 | 查詞歷史 | 逐句 |
| ja | スワイプ翻訳 | ダブルタップ辞書(AI解釈) | チャンク抽出 | 文の動きの流れ | AI文法構造の解析 | AI発音（単語） | 他の意味 | ローカルエンジン | 単語履歴一覧 | 文ごと |
| ko | 번역하려면 스와이프하세요 | 두 번 탭하여 찾기 (AI 의미) | 청크 추출 | 문장 동작 흐름 | AI 구문 구조 분석 | AI 발음(단어) | 더 많은 정의 | 로컬 엔진 | 번역 기록 | 문장 단위 |
| es | Deslizar para traducir | Toca dos veces para buscar (Significado AI) | Extracción de Fragmentos | Flujo de acciones de la oración | Análisis de Estructura de Sintaxis de IA | Pronunciación AI (Palabra) | Más definiciones | Motor local | Historial de Traducciones | Frase por Frase |
| pt-BR | Deslize para Traduzir | Toque duas vezes para procurar (Significado AI) | Extração de Blocos | Fluxo de ações da frase | Análise de Estrutura de Sintaxe de IA | Pronúncia AI (Palavra) | Mais Definições | Mecanismo local | Histórico de Traduções | Frase por Frase |
| vi | Vuốt để Dịch | Nhấn đúp để Tìm kiếm (Ý Nghĩa AI) | Trích Xuất Cụm | Mạch hành động của câu | Phân Tích Cấu Trúc Cú Pháp AI | Phát âm AI (Từ) | Định nghĩa khác | Công cụ cục bộ | Lịch Sử Dịch Thuật | Từng Câu |
| id | Gesek untuk Menerjemahkan | Ketuk dua kali untuk Mencari (Arti AI) | Ekstraksi Bagian | Alur Tindakan Kalimat | Analisis Struktur Sintaks AI | Pengucapan AI (Kata) | Definisi Lainnya | Mesin lokal | Riwayat Terjemahan | Kalimat demi Kalimat |
| th | ปัดเพื่อแปล | แตะสองครั้งเพื่อค้นหา (ความหมาย AI) | การแยกชังก์ | ลำดับการกระทำของประโยค | การวิเคราะห์โครงสร้างไวยากรณ์ AI | การออกเสียง AI (คำ) | คำจำกัดความเพิ่มเติม | เอนจินภายในเครื่อง | ประวัติการแปล | ประโยคต่อประโยค |
| hi | अनुवाद के लिए स्वाइप करें | AI अर्थ के लिए डबल टैप करें | खंड निष्कर्षण | वाक्य क्रिया प्रवाह | एआई वाक्य रचना संरचना विश्लेषण | AI उच्चारण (शब्द) | अधिक परिभाषाएँ | स्थानीय इंजन | अनुवाद इतिहास | वाक्य दर वाक्य |
| ar | اسحب للترجمة | انقر نقرًا مزدوجًا للبحث (معنى AI) | استخراج المقاطع | — | تحليل بنية الجملة النحوية للذكاء الاصطناعي | النطق بالذكاء الاصطناعي (الكلمة) | تعريفات إضافية | المحرك المحلي | تاريخ الترجمة | جملة بجملة |
| de | Wischen zum Übersetzen | Doppeltippen zum Nachschlagen (KI-Bedeutung) | Chunk-Extraktion | Satz-Aktionsfluss | AI-Syntax-Strukturanalyse | KI-Aussprache (Wort) | Weitere Definitionen | Lokale Engine | Übersetzungshistorie | Satz für Satz |
| fr | Balayer pour traduire | Double-tapez pour rechercher (Signification IA) | Extraction de Segments | Fil d’actions de la phrase | Analyse de la structure de syntaxe IA | Prononciation AI (Mot) | Plus de définitions | Moteur local | Historique des Traductions | Phrase par Phrase |
| it | Scorri per Tradurre | Tocca due volte per cercare (Significato AI) | Estrazione Segmenti | Flusso azioni della frase | Analisi della Struttura Sintattica AI | AI Pronuncia (Parola) | Altre definizioni | Motore locale | Cronologia delle Traduzioni | Frase per Frase |
| nl | Veeg om te vertalen | Dubbel tikken om op te zoeken (AI Betekenis) | Segmentextractie | Actieverloop van de zin | AI-syntaxstructuuranalyse | AI Uitspraak (Woord) | Meer definities | Lokale motor | Vertaalgeschiedenis | Zin voor Zin |
| pl | Przesuń, aby przetłumaczyć | Dotknij dwukrotnie, aby wyszukać (Znaczenie AI) | Ekstrakcja Fragmentów | Przebieg działań w zdaniu | Analiza struktury składni AI | Wymowa AI (Słowo) | Więcej definicji | Silnik lokalny | Historia Tłumaczeń | Zdanie po Zdaniu |
| ru | Проведите для перевода | Дважды коснитесь, чтобы найти (AI Значение) | Извлечение Фрагментов | Ход действий в предложении | Анализ структуры синтаксиса ИИ | AI произношение (слово) | Больше определений | Локальный движок | История Переводов | Предложение за Предложением |
| tr | Çevirmek için Kaydırın | Aramak için çift dokunun (AI Anlamı) | Parça Çıkarma | Cümle eylem akışı | Yapay Zeka Söz Dizimi Yapısı Analizi | Yapay Zeka Telaffuzu (Kelime) | Daha Fazla Tanım | Yerel motor | Çeviri Geçmişi | Cümle Cümle |
| uk | Проведіть для перекладу | Двічі торкніться, щоб знайти (AI Значення) | Виділення Фрагментів | Потік дій у реченні | Аналіз структури синтаксису ШІ | AI вимова (Слово) | Більше визначень | Локальний рушій | Історія Перекладів | Речення за Реченням |

使用提示 [建议]：
- 这些是 UI 标签，不一定是用户搜索词（例如 ko “번역하려면 스와이프하세요” 是祈使句）。官网可以用“App 内名称 + 搜索习惯说法”的组合，但**功能描述必须与 §2.4 的真实行为一致**。
- 统一命名：Action Flow / Sentence Action Flow / Action Trail 三种叫法应在官网定一个（建议跟 App Store 的 “Action Flow”）；SE 的 Sentence Builder / Sentence Puzzle 同理。
- 可与 SE 官网已经验证的英语关键词体系对齐（`SE-web/src/locales/en.json` `meta.keywords`：bilingual news reader, sentence by sentence translation, parallel text reading app, translation below the original, language chunks, contextual dictionary, double-tap word meaning…），但 WBW 的核心应是 “**任意外语网页 / web page / X**”，SE 的核心是 “**English news**”——两站避免争抢同一组词。

---

## 9. 风险与待用户确认事项

| # | 事项 | 类型 | 建议动作 |
|---|---|---|---|
| R1 | SE 在中国大陆 App Store 不可用，而 WBW zh-CN 页是重要流量来源之一（[推断]，WBW cn 有评分） | 事实 | zh-CN 页的 SE 推荐改为“了解官网 / 非中国大陆 Apple ID 可下载”，或不推荐；需用户决定是否计划在中国大陆上架 SE |
| R2 | WBW 隐私标签 “不收集数据” 与 Firebase Analytics 不一致；官网页脚同样宣称 | 推断/合规 | 用户复核 App Privacy 与 privacy.html；改版文案先不写“不收集任何数据” |
| R3 | Chrome 扩展是否已上架、是否继续维护 | 待确认 | 用户确认后决定：下线子站 / 标 Beta / 补 listing 链接 |
| R4 | 品牌撞名 WordByWord.io | 事实 | SEO 策略以功能词为主；页面 title 中使用 “WordByWord Translate”（与 US App Store 名一致）+ “iPhone/iPad app” 等区分词 |
| R5 | WBW 在 2026-06 后无代码提交；若官网大幅宣传新功能，需要确认 App 不会下架这些功能 | 推断 | 用户确认 WBW 后续维护计划（影响 “Coming soon” 类文案能否使用） |
| R6 | App Store US 描述含内部备注 | 事实 | 在 ASC 修改（官网改版之外的快速收益） |
| R7 | WBW iOS 的 `APIConfig.baseURL` 只有 `https://backend-test.word-by-word.app` 一个值（`Services/APIConfig.swift:11`） | 事实（与官网无关） | 仅提示：若生产也走 test 域名，属于 App 侧技术债，不影响本次官网改版 |
| R8 | 访客分群（§5.1）中“en 页访客多为英语母语者”等判断缺数据 | 推断 | 用 GA4（官网 `G-QS1CJY8YWL`）的国家/语言维度和 App 的 Firebase `source_language` 分布来验证 |

---

## 附录 A：App Store 跨区查询结果（2026-10-05，`itunes.apple.com/lookup`）

```
storefront :: SurfEnglish (id6787367021)                 :: WordByWord (id6741724502)
cn :: NOT AVAILABLE                                       :: WordByWord | rating 2/1
tw :: SurfEnglish：英文新聞·雙語對照 | 免費                 :: WordByWord翻譯 | rating 0/0
hk :: SurfEnglish：英文新聞·雙語對照 | 免費                 :: WordByWord翻譯 | rating 0/0
kr :: SurfEnglish: 영어 뉴스 원문·번역 | 무료                :: WordByWord | rating 0/0
jp :: SurfEnglish：英語ニュース・対訳で学習 | 無料           :: WordByWord | rating 0/0   (SE jp rating 4/1)
vn/th/id/in/sa/ae/tr/ua/pl/gb :: SurfEnglish: Bilingual News :: WordByWord Translate | 0/0
br :: SurfEnglish: Inglês e notícias                        :: WordByWord | 0/0
mx/es :: SurfEnglish: Inglés y noticias                     :: WordByWord | 0/0
de/fr/it/nl :: SurfEnglish: Bilingual News                  :: WordByWord | 0/0
ru :: SurfEnglish: Bilingual News                           :: WordByWord Переводчик | 0/0
```

## 附录 B：WBW 官网 21 个文件的 `<html lang>` 与 `<title>`（摘录）

`index.html` en “WordByWord - Your Smart Language Learning Assistant”；`en-top` 同；`cn-top`/`zh-top` zh-CN “WordByWord - 外语学习翻译助手”；`tw-top` zh-TW “外語學習翻譯助手”；`ja-top` “外国語学習翻訳アシスタント”；`ko-top` “스마트 외국어 학습 도우미”；`ar-top` ar rtl；其余 de/es/fr/hi/id/it/nl/pl/pt/ru/th/tr/uk/vi 均为 “WordByWord - <智能语言学习助手>” 的翻译。所有 title 都是“品牌 + 泛化的语言学习助手”，没有一个功能型关键词（swipe translate / bilingual / dictionary 等）。
