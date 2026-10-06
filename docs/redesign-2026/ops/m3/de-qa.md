# M3 · de（Deutsch）首页文案 QA 记录

| 项 | 内容 |
|---|---|
| locale | de（T2：按 R36 以"LLM 翻译 + 回译 + 术语表 lint + 关键词检查"上线，上线后补母语审校） |
| 交付 | `src/locales/de.json`（新建）；`src/data/glossary/de.json`（新建，§7.2.5 格式，数据取自文档 08 §7.2.1 表 T-A…T-E 的 de 列、研究 05 §8 de 行、§7.2.2 规则 ①–③ 与 X7）；`docs/redesign-2026/ops/m3/de-lint.json`（建议的 de lint 词表，未合入数据文件）；本记录 |
| 依据 | 文档 08 §7（7.1–7.10）、§1.1、§1.4、§1.5、§2 en 母版；文档 03 §1.4、§1.5、§2.3（de 行、表 C）、§3.1、§3.2、§3.6、§3.8、§3.9（de 草案）；文档 04 §5.1、§5.5、§5.7（de 的 T2–T8 种子、uiNote、linkText）；裁定 R36、R39–R43、R46、R61–R65、R71、R75–R78、R83、R84；`ja.json` / `zh-Hans.json` 作结构参照；`_legacy/de.json`、`sibling-tm.json` 只作术语参考（带 warnings 的写法与事实一律未用） |
| 工作方式 | 私有副本 `$TMPDIR/wbw-m3-de/` 起草与渲染检查；最终验证在按当前 HEAD（`1d5fe5b`）重新 rsync 的 `$TMPDIR/wbw-m3-de-final/` 里做。OG 图只在副本里生成，**没有**复制进真实仓库；lint 词表只在副本里合入自测 |
| 日期 | 2026-10-06 |

## 0. 摘要

1. 键与 en 完全一致（`check.mjs --keys de`：0 缺、0 多；与 ja 一样不提供 `about.*`、`chromeExtension.*`、`legal.*`，提供 `notfound.*`）。在 HEAD `1d5fe5b` 的新副本里：`node build.mjs` 与 `--pseudo` 均 **0 error**；`node scripts/check.mjs` 0 error / 0 warning；`node --test scripts/tests/*.test.mjs` 58/58 通过。
2. de 自己的 warning 只有三类：L-4 三个值与 en 相同（`nav.faq`、`footer.faq` = "FAQ"，`footer.support` = "Support"，都是正常德语写法）；L-14"24 条规则没有 de 词表"、L-9"没有 de 的 G1 how-to 模式"——这两条来自数据文件缺 de 词表。我按要求起草了 `de-lint.json`（附录 A），在副本里合入后全站 0 error，L-14 / L-9 的 de 警告消失。
3. title、H1 逐字采用文档 03 §3.9 de 草案（title n55，H1 n75，荧光笔标"Webseite"）；description 只把草案的逗号改成破折号（n160）。称谓按文档 08 §7.3 用 du。手势：句中"nach rechts wischen"、"doppeltippen"（X7：不用 App 提示里的鼠标说法"Doppelklicke"）。
4. 复数：按简报对所有"数字占位符 + 可数名词"写了 `Intl.PluralRules('de')` 的 one / other 复数对象（当前值全部落在 other，渲染为"21 Sprachen""50 Wisch-Übersetzungen"等）。
5. SurfEnglish：de 的 `seMode` = en-site。卡片用 `uiNote` 替换 note（"界面没有德语，是英语和另外 11 种；可译成德语"），linkText 带"(Website auf Englisch)"，FAQ `english-learner` 在链接前加了 §7.8 的界面说明句。为满足卡片高度上限（R10 / R84），卡片文案比文档 04 §5.7 的 de 种子更短（§6 第 3 条）。
6. 英文界面：所有截图 alt、4 条画廊图注、`common.screenshotLabel` / `screenshotExcerptLabel`、OG alt、SE 截图 alt 与图注都写"englische Oberfläche"；指向英文页的富文本链接（`@about`、`@chrome`、`@se-site`）的链接文字带"(auf Englisch)"。
7. OG（只在副本）：`node scripts/og.mjs --only home-de` 通过：标题 64 px × 3 行、副标题 30 px × 2 行、150.8 KB（与 home-en 相同的 64 px × 3 行版式）。
8. 渲染检查（headless Chrome + 仓库自带 `scripts/serve.mjs`，浅色）：320 / 375 / 414 / 768 / 900 / 1280 px 都没有横向溢出，标题里没有撑破容器的长复合词，没有用软连字符；SE 卡片 553 / 472 / 469 / 386 / 411 / 412 px，全部在上限内。
9. 需要负责人决定的事见 §6，主要是：OG 图入库、是否合入 de lint 词表、SE 卡片文案偏离种子、几处 App 德语字符串问题（报给 App 侧）、390 px 页面高度 13,640 px。

## 1. 关键词落点（title / H1 / description 用了哪些主词）

| 位置 | 文案 | 承载的关键词 | 长度 |
|---|---|---|---|
| `meta.title` | „WordByWord: Übersetzer-App für Webseiten auf dem iPhone“ | 品牌位 WordByWord；K1 主词「Übersetzer-App für Webseiten auf dem iPhone」**逐字完整**（文档 08 §7.3 de 行；文档 03 §3.9 草案原样）；`titleMust` = iPhone / Webseiten / Übersetzer-App 全部命中；`primaryTokens`（iPhone、Übersetzer-App）命中 | n55（上限 60） |
| `meta.description` | „Für Sprachlernende: Absatz in WordByWord nach rechts wischen – die Übersetzung steht darunter. Doppeltippen zeigt die Wortbedeutung. Gratis für iPhone und iPad.“ | 受众词「Sprachlernende」（表 C，R39，也是文档 03 §1.4 必须放行的通用学习词）；K1 动作 + 结果在前一半；"in WordByWord"满足文档 03 §3.2；K2「Doppeltippen … Wortbedeutung」；平台 + 免费收尾（SEO-11） | n160（区间 120–160） |
| `hero.title`（H1） | „Absatz einer [[Webseite]] nach rechts wischen – die Übersetzung steht darunter.“ | K1 核心名词「Webseite」（荧光笔，1 个词，R65）；"段落"一级的动作 + 结果（R46、PRO-19），写了方向；不含品牌（R27）；没有 how-to 句式 | n75（上限 75） |
| `hero.eyebrow` | „WordByWord · Zweisprachig im Web lesen – für Sprachlernende“ | 品牌 + 品类 + 受众 | 59 wu（上限 60） |
| `hero.lede` = `ledeShort` | „WordByWord ist ein Leseassistent für Sprachlernende auf iPhone und iPad.“ | R39 定义句（"Leseassistent"只在定义句、FAQ `what-is` 和页脚 tagline 出现，D13） | n72（≤ 90，故与 ledeShort 相同） |
| `meta.ogHeadline` | „Webseiten zweisprachig lesen. [[Das Original bleibt.]]“ | K1 次词「Webseiten zweisprachig lesen」+ 原文保留；荧光笔 1 处；没用"Original behalten"（留给 G1，见附录 A） | 64 px × 3 行 |
| 功能区 H2 | „Wischen zum Übersetzen, Doppeltippen zum Nachschlagen – auf den Websites, die du liest“ | K1 / K2 的 App 叫法；"auf den Websites, die du liest"（PRO-16，不写"任何网站"） | n85 |
| 功能 H3 | K1「Wischen zum Übersetzen: Original oben, Übersetzung direkt darunter」；K2「Doppeltippen zum Nachschlagen: Wortbedeutung im Kontext mit KI」；K9「X-Posts (Twitter) im integrierten Browser zweisprachig lesen」；K5「Chunk-Extraktion und Action Flow für englische Sätze」（R83 带"englische"）；K3「Text mit KI vorlesen lassen – oder schnelle iOS-Stimmen auf dem Gerät」；K4「Lange Sätze verstehen: Satzstruktur mit KI analysieren」；K7「Übersetzung in der Cloud oder auf dem Gerät」；K6「Verlauf von Übersetzungen und nachgeschlagenen Wörtern」 | K2、K4、K6、K7 与表 A / B 主词逐字一致；K3、K9 为主词的语序变体 | 全部 ≤ 70 wu |
| 语言段 H2 | „Übersetzung in 21 Sprachen – nicht nur aus dem Englischen“（复数对象） | K8 主词「Übersetzung in 21 Sprachen」逐字 | 57 wu |
| 价格段 H2 | „Jeden Tag kostenlos – Plus, wenn du mehr liest“ | K10「kostenlos」+ Plus | — |
| 最终 CTA H2 | „Jetzt Webseiten auf dem iPhone zweisprachig lesen“ | 动作句，不是 G1 标题，不暗示整页（R46） | 49 wu |

检查结果：title / description / H1 / OG / 功能区 H2 里没有 SE 独占词（含附录 A 建议新增的"englische Nachrichten / News""Chunks"）；title / H1 / description / `cta.title` 里没有 how-to 句式（附录 A 的 G1 模式 0 命中）。

## 2. Q1–Q10 逐条结果（文档 08 §7.9）

| # | 结果 | 说明 |
|---|---|---|
| Q1 | ✓ | JSON 能解析；键与 en 一致（`--keys de` 0 缺 0 多）；HEAD 新副本 build / `--pseudo` 0 error，`check.mjs` 0 error，测试 58/58 |
| Q2 | ✓ | 占位符、`[[ ]]`、`**`、`[文本](@ref)` 都保留；ref 只用 `@about`、`@chrome`、`@se-site`（白名单内）；没有写死额度、价格、语言数（L-12 0 条；uiNote 与 FAQ 里的"11"是文档 08 §7.8 规定由译者写死的 {se.uiLanguages} − 1）。复数对象（one / other）：`languages.title / uiCount / targetCount`、`gallery.items[languageList].caption`、`faq.items[languages].a`、`faq.items[free].a`（5 处）、`cta.recap`、`sibling.card.note`；代入当前值后渲染为"21 Sprachen""20 Sprachen""50 Wisch-Übersetzungen""20 Wortabfragen""30 Chunk-Extraktionen""20 Action Flows""5 AI-Syntax-Erklärungen""21 Zielsprachen"。`{n} pro Tag` 与"{quota.localSwipe.free} mit der lokalen Engine"后面没有可数名词，与 en 同构 |
| Q3 | ✓ | title 以品牌位开头，三个 `titleMust` 词元齐全（文档 08 §7.3 写的是"iPhone、Webseite"，但 `hasToken` 按整词匹配，title 里是复数，所以用文档 03 §3.8 的 `["iPhone","Webseiten","Übersetzer-App"]`）；K1 是产品 / 品类意图；没有禁用主词和 how-to 句式 |
| Q4 | ✓ | `hero.title` 恰好 1 处 `[[Webseite]]`（1 个词）；功能 H3、`languages.title` 没有 `[[ ]]`；`hero.lede` 以"WordByWord ist …"开头，写明"für Sprachlernende" |
| Q5 | ✓ | §1.1 红线逐行核对：整页翻译只出现在 FAQ `whole-page` 的否定回答里，Safari 扩展只在 FAQ `safari` 的否定回答里，Android 只在 FAQ `android`；没写离线、无限 AI 发音、暗色模式 / 主题、快捷键 / 音量、生词本 / 闪卡 / 同步、"Plus 专属"、样式数量、口语练习、ChatGPT、"WordByWord-Team / die Macher"；CJK 原文不能双击查词、Chunks / Action Flow 仅英语都写在同一屏；没有 jargon "Satzausrichtung / Satz-für-Satz-Vergleich"。附录 A 词表在副本里跑 L-14：0 命中 |
| Q6 | ✓ | kicker 与价格表行名用 App 叫法（glossary `required` 22 项，L-13 0 违规）：Wischen zum Übersetzen、Doppeltippen zum Nachschlagen (KI-Bedeutung)、Weitere Definitionen、Chunk-Extraktion、KI-Aussprache (Wort / Satz)、iOS-Stimme (Lokales Lesen)、Lokale Engine、AI-Syntax-Erklärung；Action Flow 保留 App Store 名，正文括注 App 叫法„Aktionsfluss“（D3）；句中按 §7.3 写"nach rechts wischen""doppeltippen"；X7 的"Doppelklicke"没有出现；按钮名照 App 原文引用：„Jetzt Upgraden“、„Kauf Wiederherstellen“、„AI-Syntax-Erklärung abrufen“、„KI-Lesen“、„Lokales Lesen“（glossary `contains`，L-13 通过） |
| Q7 | ✓ | 5 处功能截图 alt、4 条画廊图注 + alt、`common.screenshotLabel`（"iPhone-Screenshot (englische Oberfläche)"）/ `screenshotExcerptLabel`、OG alt、SE 截图 alt 与图注都注明"englische Oberfläche"，内容逐张对照 en 截图（西语 Wikipedia 页 + 英文译文、"convirtiéndose"、"matrimonio"、Quote Style / Local Read 等界面字样按截图里的英文原样引用）；`features[x].alt` 描述社交帖样张并注明"kein Screenshot"；样张 `lookup.word` = "end"，出现在 `demo.source[1]` |
| Q8 | ✓ | en-site：uiNote 不含 `{se.uiLanguages}`、不写"12 Sprachen"，含"11"（L-11 通过，文档 04 A6）；linkText = SE 核心词短语 + 品牌 +"(Website auf Englisch)"（n70，en-site 上限 80）；FAQ 加了界面说明句；H2 以 SurfEnglish 开头；body 首句是条件句"Lernst du Englisch?"；没有"passt besser / besser geeignet / Upgrade / neu / schneller / Nachfolger"；卖点只用分级新闻、复习游戏、从 Safari 分享（R41），不提语音 |
| Q9 | ✓ | 代入占位符后实测，全部在 §7.6 / L-8 限内（表见附录 B）；SE 卡片高度在 R10 / R84 限内 |
| Q10 | ✓ | de 是拉丁文字，不涉及 RTL / CJK；没有 `{wbr}`（R61）；没有软连字符（文档 08 没有允许） |
| Q12 | ✓（副本） | 320–1280 px 无溢出、无字体回落；375 px 下 H1 5 行（36 px），最长单词"Übersetzung"不撑破容器；页眉按钮 < 560 显示"Laden"、≥ 560 显示"Herunterladen" |
| Q13 | ✓ | FAQ `devices` 的 `a`（S0）没写扩展名称；`aExtLive` 写了名称并注明只从扩展页面的链接安装；首页没出现 WordByWord.io |

## 3. 回译对照（de → English，对照 en.json）

| 键 | de | 回译 | en 原文 |
|---|---|---|---|
| meta.title | WordByWord: Übersetzer-App für Webseiten auf dem iPhone | WordByWord: Translator app for web pages on the iPhone | WordByWord: Bilingual Web Page Translator App for iPhone |
| meta.description | Für Sprachlernende: Absatz in WordByWord nach rechts wischen – die Übersetzung steht darunter. Doppeltippen zeigt die Wortbedeutung. Gratis für iPhone und iPad. | For language learners: swipe a paragraph to the right in WordByWord – the translation is right below it. Double-tapping shows the word's meaning. Free for iPhone and iPad. | For language learners: swipe a paragraph in the built-in browser and its translation appears below. Double-tap a word for its meaning. Free on iPhone & iPad. |
| meta.ogHeadline | Webseiten zweisprachig lesen. Das Original bleibt. | Read web pages bilingually. The original stays. | Read any web page bilingually. Keep the original. |
| hero.title | Absatz einer Webseite nach rechts wischen – die Übersetzung steht darunter. | Swipe a paragraph of a web page to the right – the translation is right below it. | Swipe a paragraph on any web page. Its translation appears right below. |
| hero.lede | WordByWord ist ein Leseassistent für Sprachlernende auf iPhone und iPad. | WordByWord is a reading assistant for language learners on iPhone and iPad. | （同左） |
| hero.how | Öffne eine Website im integrierten Browser und wische einen Absatz nach rechts: Die Übersetzung erscheint darunter. Doppeltippe auf ein Wort – die KI erklärt, was es dort bedeutet. | Open a website in the built-in browser and swipe a paragraph to the right: the translation appears below it. Double-tap a word – the AI explains what it means there. | Open a site in its built-in browser and swipe right on a paragraph: the translation appears below it. Double-tap a word for an AI explanation of what it means there. |
| featuresIntro.title | Wischen zum Übersetzen, Doppeltippen zum Nachschlagen – auf den Websites, die du liest | Swipe to translate, double-tap to look up – on the websites you read | Swipe to translate, double-tap to look up — on the websites you read |
| features[swipe].title | Wischen zum Übersetzen: Original oben, Übersetzung direkt darunter | Swipe to Translate: original on top, translation right below | Swipe to Translate: the translation appears right below the original |
| features[lookup].title | Doppeltippen zum Nachschlagen: Wortbedeutung im Kontext mit KI | Double-tap to Look Up: word meaning in context, with AI | Double-tap a word for its AI meaning in context |
| features[x].title | X-Posts (Twitter) im integrierten Browser zweisprachig lesen | Read X (Twitter) posts bilingually in the built-in browser | Read X (Twitter) posts bilingually in the built-in browser |
| features[chunks].title | Chunk-Extraktion und Action Flow für englische Sätze | Chunk Extraction and Action Flow for English sentences | Chunk Extraction and Action Flow, for English sentences |
| features[speech].title | Text mit KI vorlesen lassen – oder schnelle iOS-Stimmen auf dem Gerät | Have text read aloud with AI – or fast iOS voices on the device | AI read-aloud, or fast on-device iOS voices |
| features[syntax].title | Lange Sätze verstehen: Satzstruktur mit KI analysieren | Understand long sentences: analyze sentence structure with AI | AI sentence structure analysis for long sentences |
| features[engines].title | Übersetzung in der Cloud oder auf dem Gerät | Translation in the cloud or on the device | Cloud or on-device translation |
| features[display].title | Layout und Stil der Übersetzung | Layout and style of the translation | Translation layout and style |
| features[history].title | Verlauf von Übersetzungen und nachgeschlagenen Wörtern | History of translations and looked-up words | Translation and lookup history |
| features[devices].title | iPhone, iPad, Mac und Vision Pro | iPhone, iPad, Mac and Vision Pro | （同左） |
| faq[what-is].q | Was ist WordByWord? | What is WordByWord? | （同左） |
| faq[whole-page].q | Kann WordByWord eine ganze Webseite auf einmal übersetzen? | Can WordByWord translate an entire web page at once? | Can WordByWord translate a whole web page at once? |
| faq[safari].q | Funktioniert WordByWord in Safari oder in anderen Apps? | Does WordByWord work in Safari or in other apps? | Does it work in Safari or inside other apps? |
| faq[word-by-word].q | Ist WordByWord ein Wort-für-Wort-Übersetzer? | Is WordByWord a word-for-word translator? | Is WordByWord a word-by-word translator? |
| faq[x].q | Kann ich mit WordByWord X (ehemals Twitter) lesen? | Can I read X (formerly Twitter) with WordByWord? | Can I read X (Twitter) with WordByWord? |
| faq[languages].q | Welche Sprachen unterstützt WordByWord? | Which languages does WordByWord support? | （同左） |
| faq[free].q | Ist WordByWord kostenlos? Welche Tageslimits gibt es? | Is WordByWord free? What daily limits are there? | Is WordByWord free? What are the daily limits? |
| faq[engines].q | Welche Übersetzungsengine verwendet WordByWord? | Which translation engine does WordByWord use? | Which translation engine does it use? |
| faq[account].q | Brauche ich ein Konto für WordByWord? | Do I need an account for WordByWord? | Do I need an account to use WordByWord? |
| faq[restore].q | Wie bekomme ich WordByWord Plus auf einem neuen iPhone oder iPad zurück? | How do I get WordByWord Plus back on a new iPhone or iPad? | （同左） |
| faq[android].q | Gibt es eine Android-Version? | Is there an Android version? | （同左） |
| faq[english-learner].q | Ich lerne Englisch. Ist SurfEnglish auch einen Versuch wert? | I'm learning English. Is SurfEnglish also worth a try? | I’m learning English. Is SurfEnglish worth trying too? |
| faq[devices].q | Funktioniert WordByWord auf dem iPad, dem Mac oder im Desktop-Browser? | Does WordByWord work on the iPad, the Mac or in a desktop browser? | Does WordByWord work on iPad, Mac or a desktop browser? |
| pricing.summary | Innerhalb dieser Limits ist jede Funktion kostenlos; Plus erhöht sie für 3,99 $/Monat (USA). | Within these limits every feature is free; Plus raises them for $3.99/month (USA). | Every feature is free within these limits; Plus raises them for $3.99/month (US). |
| sibling.card.eyebrow | Vom Entwickler von WordByWord | From the developer of WordByWord | （同左） |
| sibling.card.title | SurfEnglish: englische News auf deinem Niveau | SurfEnglish: English news at your level | SurfEnglish: daily English news at your level |
| sibling.card.body | Lernst du Englisch? Lies in WordByWord weiter jede Seite, die du magst, und probier auch SurfEnglish: tägliche News nach Niveau und Wiederholungsspiele – mit demselben Wischen und Doppeltippen. | Learning English? Keep reading any page you like in WordByWord, and try SurfEnglish too: daily news by level and review games – with the same swiping and double-tapping. | Learning English? Keep reading any page you like in WordByWord, and try SurfEnglish too: daily English news by level and review games, with the same swipe and double-tap. |
| sibling.card.points | Englische News auf Niveau A1–C1 / Spiele zum Wiederholen des Gelesenen / Englische Artikel aus Safari teilen | English news at level A1–C1 / Games for reviewing what you've read / Share English articles from Safari | Real English news at levels A1–C1 / Review games built from what you’ve read / Share English articles from Safari to the app |
| sibling.card.uiNote（替换 note） | Kostenlos starten · Oberfläche nicht auf Deutsch (Englisch und 11 weitere Sprachen) · Übersetzung ins Deutsche möglich | Free to start · Interface not in German (English and 11 other languages) · Translation into German possible | （en 的 note：Free to start · iPhone and iPad · App in 12 languages · Translations into 21） |
| sibling.card.linkText | Englische News zweisprachig lesen – SurfEnglish (Website auf Englisch) | Read English news bilingually – SurfEnglish (website in English) | Read English news at your level with SurfEnglish |
| sibling.card.appStoreLinkText | SurfEnglish im App Store laden | Get SurfEnglish on the App Store | Get SurfEnglish on the App Store |
| sibling.card.shotAlt | SurfEnglish-Spielebildschirm (englische Oberfläche): Sentence Builder und Word Raid mit gespeicherten Sätzen und Wörtern | SurfEnglish games screen (English interface): Sentence Builder and Word Raid with saved sentences and words | SurfEnglish Games screen: Sentence Builder and Word Raid, ready to play with saved sentences and words |
| sibling.card.shotCaption | SurfEnglish-Screenshot (englische Oberfläche) | SurfEnglish screenshot (English interface) | （同左） |
| sibling.footer | Vom selben Entwickler / SurfEnglish: Bilingual News (EN) | From the same developer / … | More from the maker / SurfEnglish: Bilingual News |
| faq[english-learner].a（SE 相关） | Nutze WordByWord weiter für die Seiten und X-Posts, die du auswählst – auf Englisch oder in jeder anderen Sprache. Wenn du außerdem täglich englische Nachrichten nach Niveau (A1–C1) lesen und gespeicherte Sätze und Wörter mit Spielen wiederholen möchtest, ergänzt SurfEnglish vom selben Entwickler genau das – mit demselben Wischen und Doppeltippen. Beide Apps lassen sich nebeneinander nutzen. Die Oberfläche von SurfEnglish gibt es nicht auf Deutsch – sie ist auf Englisch und in 11 weiteren Sprachen verfügbar –, aber SurfEnglish kann ins Deutsche übersetzen. SurfEnglish-Website (auf Englisch) | Keep using WordByWord for the pages and X posts you choose – in English or any other language. If you would also like to read daily English news by level (A1–C1) and review saved sentences and words with games, SurfEnglish from the same developer adds exactly that – with the same swiping and double-tapping. The two apps can be used side by side. SurfEnglish's interface isn't available in German – it is in English and 11 other languages – but SurfEnglish can translate into German. SurfEnglish website (in English) | Keep using WordByWord for the pages and X posts you choose, in English or any other language. If you would also like daily English news sorted by level (A1–C1) and games that review the sentences and words you have saved, SurfEnglish, from the same developer, adds that with the same swipe and double-tap. The two apps work side by side. [+ §7.8 en-site sentence] SurfEnglish website |
| cta.title | Jetzt Webseiten auf dem iPhone zweisprachig lesen | Read web pages bilingually on the iPhone now | Start reading websites bilingually on iPhone |
| cta.recap | Wischen zum Übersetzen · Doppeltippen zum Nachschlagen · Vorlesen · 21 Sprachen | Swipe to translate · Double-tap to look up · Read aloud · 21 languages | Swipe to translate · Double-tap to look up · Read aloud · 21 languages |

### 3.1 与 en 的事实偏差

**没有事实偏差。** 与 en 不同、但都有依据的地方：

1. H1 / description / how 写了方向"nach rechts"（en 的 H1 没写）：与 App 的 `tip_swipe_to_translate`（„Wische nach rechts …“）和文档 08 §7.3 的手势写法一致，比 en 更精确（向左滑会删除译文，F14）。
2. description 用"in WordByWord"代替"in the built-in browser"（文档 03 §3.2 允许二选一；草案原样）。
3. title 没有"bilingual"：文档 03 §2.3 / §3.9 的 de K1 主词本来就是"Übersetzer-App für Webseiten"。
4. OG / H1 没有"any"（"jede Webseite"），避免"整页"联想；意思不变。
5. SE 卡片：title 少了"daily"（body 保留"tägliche"），要点 1 少了"Real"，要点 3 少了"to the app"（卡片语境里不言自明），都是为卡片高度（§6 第 3 条）；uiNote 按 en-site 规则替换 note，因此没有"iPhone and iPad""Translations into 21"（与文档 04 §5.7 种子一致）。
6. FAQ `english-learner` 多了 §7.8 规定的界面说明句；指向英文页面的三个富文本链接文字带"(auf Englisch)"。
7. hero.platformNote 不写美区价格数字，只写"Plus als Monatsabo"（D2，与 ja / zh-Hans 相同）。

## 4. 没把握的措辞（12 处，附回译与替代写法）

| # | 键 | de | 回译 | 替代写法 | 说明 |
|---|---|---|---|---|---|
| 1 | hero.title | Absatz einer Webseite nach rechts wischen – die Übersetzung steht darunter. | Swipe a paragraph of a web page to the right – the translation is below it. | Wische einen Absatz einer Webseite nach rechts – die Übersetzung steht darunter.（n79，超过 75） | 草案原样，不定式"电报体"在德语标题里常见，但读起来像操作说明；du 命令式更亲切，可惜超长。正好 75 字符，没有余量 |
| 2 | meta.description | … Doppeltippen zeigt die Wortbedeutung. Gratis für iPhone und iPad. | … Double-tapping shows the word's meaning. Free for iPhone and iPad. | … Doppeltippen zeigt die Bedeutung im Kontext. Kostenlos für iPhone und iPad.（n172，报 W） | 正好 160；"Gratis"比"Kostenlos"口语一些，草案原样 |
| 3 | nav.chromeExtension | Chrome-Add-on | Chrome add-on | Erweiterung（文档 08 §7.6 的例子）／ Chrome-Erweiterung（18 > 16 wu，报 W） | 只在 S1 出现在 header。"Erweiterung"单独出现在一个 iPhone App 网站的导航里容易误解；"Add-on"在 Chrome 语境里不如"Erweiterung"正式。页脚与 FAQ 用"Chrome-Erweiterung" |
| 4 | features[lookup].kicker | Nachschlagen | Look up | Doppeltippen zum Nachschlagen（App 全名，29 > 24 wu，报 W） | 为守 24 wu 上限用了 App 叫法的后半；完整 App 名放在同卡 H3 和价格表行名里 |
| 5 | hero.lede / faq[what-is] / footer.tagline | Leseassistent für Sprachlernende | reading assistant for language learners | Lese-App für Sprachlernende | R39 定义句的直译；"Assistent"可能让人联想到"智能助手"，但只出现在定义句里（D13） |
| 6 | sibling.card.title / linkText / body | englische News … / tägliche News | English news / daily news | englische Nachrichten（文档 04 种子） | "Nachrichten"更正式，但让卡片在 900 px 超过 420 px、320 px 超过 560 px；"News"在德语里很常见，也与 SE 店名"Bilingual News"一致。FAQ 答案里仍用"Nachrichten" |
| 7 | faq[restore].a | Tippe … auf „Jetzt Upgraden“ und dann auf „Kauf Wiederherstellen“. | Tap "Upgrade Now" and then "Restore Purchase". | „Jetzt upgraden“ / „Kauf wiederherstellen“（正确的德语大小写） | 照 App 屏幕上的写法引用（T-E、glossary `contains`），方便用户找到按钮；大写的"Upgraden / Wiederherstellen"本身不合德语正字法，见 §6 第 5 条 |
| 8 | hero.how / faq[what-is] / faq[x] | Doppeltippe auf ein Wort … | Double-tap a word … | Tippe doppelt auf ein Wort … | 按文档 08 §7.3 用"doppeltippen"一词；命令式"Doppeltippe"在 Apple 德语文档里也有，但部分读者会觉得生硬 |
| 9 | faq[free].a | 50 Wisch-Übersetzungen … 20 Wortabfragen per Doppeltippen | 50 swipe translations … 20 word lookups by double-tap | 50 Übersetzungen per Wischen … 20-mal Nachschlagen per Doppeltippen | "Wisch-Übersetzung""Wortabfrage"都是为计数造的名词，App 里没有对应叫法 |
| 10 | meta.ogHeadline | Webseiten zweisprachig lesen. Das Original bleibt. | Read web pages bilingually. The original stays. | … Original behalten.（更贴近 en 的 "Keep the original."） | 没用"Original behalten"，因为附录 A 建议把它留给 G1 的 how-to 主词 |
| 11 | 多处 | Macs mit Apple-Chip | Macs with an Apple chip | Macs mit Apple Silicon ／ Mac mit Apple Chip（Apple 官网写法，不加连字符） | 德语正字法要求"Apple-Chip"，Apple 自己的德语页面写"Apple Chip" |
| 12 | features[speech].text | „Lokales Lesen“ nutzt die Stimmen von iOS – schneller, mit einstellbarem Tempo und auf Wunsch mit geladenen Premium- oder erweiterten Stimmen. | "Local Read" uses the iOS voices – faster, with adjustable speed and, if you like, with downloaded Premium or Enhanced voices. | … und kann auch Premium- oder erweiterte Stimmen nutzen, die du geladen hast. | "erweitert"是 iOS 德语设置里"Enhanced"语音的叫法，读者未必认得 |

## 5. 术语与 App 叫法处理要点（给审校人）

- **Webseite / Website**：K1 的"Webseite(n)"指单个网页（title、H1、OG、CTA）；"Website(s)"指整个站点（"Websites wie x.com""auf den Websites, die du liest""X-Website"）。
- **App 叫法**（xcstrings de，引用处照原文）：Wischen zum Übersetzen；Doppeltippen zum Nachschlagen (KI-Bedeutung)；Weitere Definitionen；Chunk-Extraktion；Satz-Aktionsfluss / Aktionsfluss（正文括注"in der App „Aktionsfluss“"，标题与表格用 App Store 名 Action Flow，D3）；AI-Syntax-Erklärung abrufen；KI-Lesen / Lokales Lesen；KI-Aussprache (Wort / Satz)；Cloud-Übersetzungsengine / Lokale Engine；Automatisch / Absatz / Satz für Satz；Jetzt Upgraden；Kauf Wiederherstellen；App Store 副标题"Wischen zum Übersetzen"（研究 05 §2.1 DE 店面）。
- **KI vs AI**：正文一律写"KI"；只有引用 App 叫法时保留 App 的"AI-"（"AI-Syntax-Erklärung"）。
- **称谓**：du，小写（Duden 推荐）；全站没有 Sie。
- **X**：kicker 与 FAQ 问句写"X (ehemals Twitter)"（§7.2.3），帖子叫"Post(s)"（X 德语界面用词）。
- **Apple 用语**：Apple Account（Apple 自 2024 起的德语叫法）、Abo、"iOS 18 oder neuer"、App Store 徽章文字"Laden im App Store"（`appStoreBadgeAlt` = „WordByWord im App Store laden“）。
- **标点**：德语引号 „…“，破折号用两侧带空格的 en dash（ – ），撇号 ’（"So funktioniert’s"）；价格由构建按 `Intl.NumberFormat('de')` 输出为"3,99 $"。

## 6. 需要负责人决定的问题

1. **OG 图（D-23）**：按简报，`home-de.jpg` 与 `og.json` 没有复制进真实仓库。de.json 入库后，`node build.mjs` 会报 `D-23 home-de: no OG image`，直到负责人跑 `node scripts/og.mjs --only home-de`（副本实测通过：64 px × 3 行、副标题 30 px × 2 行、150.8 KB，与 home-en 版式相同）。
2. **de lint 词表**：`docs/redesign-2026/ops/m3/de-lint.json`（附录 A）覆盖 25 条规则 + `seOwned` / `seOwnedLead` / `reserved.G1`。副本合入后：全站（含 en / ja / zh-Hans / zh-Hant / ko / es / fr）build 与 `--pseudo` 0 error，de 的 L-14 / L-9 警告消失；反例句全部命中。是否合入、由谁合入，请决定。注意 `seOwnedLead` 会作用于所有语言所有页面的 H2，我只用了德语句首。
3. **SE 卡片文案偏离文档 04 §5.7 的 de 种子**（为满足 R10 / R84）：按种子写的卡片在 320 px 是 663 px（上限 560）、375 px 533 px（上限 480）、900 px 471 px（上限 420）。逐个变体实测后定稿：title "englische News"（种子"Englische Nachrichten"）、body 缩短、要点缩短、uiNote 压缩为电报体（种子：„Kostenlos starten · Die App-Oberfläche gibt es nicht auf Deutsch (Englisch und 11 weitere Sprachen) · Übersetzungen ins Deutsche sind möglich“）、linkText 用"News"（种子"Nachrichten"）。现在 553 / 472 / 469 / 386 / 411 / 412 px（320 / 375 / 414 / 768 / 900 / 1280）。余量只有 7–9 px，以后改卡片文案要重测。
4. **`nav.chromeExtension`**：用了 16 wu 内的"Chrome-Add-on"（§4 第 3 条）；如果负责人更想要文档 08 的"Erweiterung"或完整的"Chrome-Erweiterung"（报 1 条 W），改这一个值即可。目前 S0，header 不显示。
5. **报给 App 侧的德语字符串问题**（规则 ③，网站不照抄或照引并说明）：① `tip_double_tap_context_meaning` 用了鼠标说法"Doppelklicke"（X7，网站写 doppeltippen）；② 按钮大小写不合正字法："Jetzt Upgraden""Kauf Wiederherstellen""Auf Plus Upgraden""Wechseln und Erneut Versuchen"（网站 FAQ 照屏幕引用，§4 第 7 条）；③ `view_title_swipe_history` = "Swipe Übersetzungshistorie"（英德混用、缺连字符）；④ "AI-" 与 "KI-" 混用（"AI-Syntax-Strukturanalyse" vs "KI-Lesen"）；⑤ App 提示用 du（„Wische nach rechts …“），而 `swipe_translation_online_limit_reached_message` 用 Sie（„Sie haben alle Online-Swipe-Übersetzungen …“）。
6. **页面长度**：390 px、FAQ 收起时 de 首页 13,640 px（en 12,821、es 13,047、fr 13,548；R20 / R69 目标 ≤ 13,000）。德语比英语长约 25–30%，没有为此删内容。
7. **`sibling.card.note`**：en-site 下不渲染（由 uiNote 替换），但 L-3 要求存在。我写成不涉及界面语言的"Kostenlos starten · iPhone und iPad · Übersetzungen in 21 Sprachen"，以免以后切换 seMode 时冒出"App 有 12 种语言"一类暗示德语界面的说法。
8. **复数对象**：文档 08 §1.4 没要求 de 用复数对象，我按 M3 简报写了 one / other 两类；渲染结果与写普通占位符相同。如负责人希望德语保持简单占位符，可整体替换回去。
9. **页脚里指向英文页的链接**（About、Support、Datenschutzerklärung）没有加"(auf Englisch)"：这次只按要求给富文本链接加了标记，页脚标签是通用键。是否在页脚也加，请决定（会影响所有非 en 语言）。
10. **L-4 的 3 条 review**："FAQ"（nav、footer）和"Support"是德语网站的常规写法，保留。
11. **母语审校**：按 R36，de 上线后补母语审校；请审校人重点看 §4 的 12 处和 SE 卡片（§6 第 3 条）。

## 附录 A：建议的 de lint 词表（`docs/redesign-2026/ops/m3/de-lint.json`）

覆盖范围：`claims-lint.json` 中所有有按语言写法、且还没有 de 键的规则（25 条）；跳过 `selection-translate`、`jargon`（已有 de）和 `io-home`、`engine-claim`（只有 `*`）。`keywordMap` 部分对应 `keyword-map.json` 的 `seOwned.de`（追加）、`seOwnedLead.de`（追加）、`reserved.G1.de`（新建）。完整正则见该文件。

**自测**（副本 = HEAD `1d5fe5b` + de，合入词表后）：`node build.mjs` 与 `--pseudo` 全站 0 error（de 文案 0 命中；其余 7 个语言的 H2 也不命中 `seOwnedLead`）；测完已还原副本数据文件，并与真实仓库逐字节比对一致。

**反例句（全部命中各自规则）**：

| 规则 | 反例句 |
|---|---|
| whole-page | Übersetze die ganze Webseite mit einem Tipp. |
| swipe-left | Wische den Absatz nach links, um die Übersetzung zu sehen. |
| safari-extension | Funktioniert als Safari-Erweiterung in jeder App. |
| offline | Übersetzt auch offline, ohne Internet. |
| unlimited-ai-voice | Mit Plus bekommst du unbegrenzte KI-Aussprache. |
| dark-mode-theme | Mit Dunkelmodus und eigenen Themes. |
| shortcuts-volume | Passe Lautstärke und Tastenkürzel an. |
| vocab-sync | Speichere Wörter in deinem Vokabelheft mit iCloud-Sync. |
| android | Auch als Android-App bei Google Play. |
| desktop-version | Jetzt auch als Desktop-App für Windows. |
| x-app | Übersetze Posts direkt in der X-App. |
| plus-early-access | Plus-Abonnenten erhalten früher Zugang zu neuen Funktionen. |
| privacy-claim | WordByWord sammelt keine persönlichen Daten. |
| initial-version | Die Anfangsversion unterstützt viele Sprachen. |
| language-pairs | Mehr als 20 Sprachpaare. |
| style-count | Wähle aus 8 Übersetzungsstilen. |
| auto-detect-target | Die App erkennt automatisch die Zielsprache. |
| history-by-date | Der Verlauf wird nach Datum gruppiert. |
| plus-only | Die Satzanalyse gibt es nur mit Plus. |
| speaking-practice | Verbessere deine Sprechfähigkeit. |
| replacement-tone | SurfEnglish passt vielleicht besser zu dir als die frühere App. |
| se-on-device-voice | Mit KI-Stimmen auf dem Gerät, auch offline.（规则只作用于 SE 卡片与 FAQ `english-learner`） |
| se-hype | Die neue App, mit der du schneller lernst.（同上，另含 `sibling.footer`、`about.family`） |
| hype | Die beste Übersetzer-App – revolutionär, von den Machern von WordByWord. |
| ext-language-count | Übersetzt in 20 Sprachen.（只作用于 `chromeExtension.*`） |
| seOwned | Englisch lernen mit Webseiten ／ Englische News auf deinem Niveau ／ Chunks markieren |
| seOwnedLead | Lernst du Englisch? Dann SurfEnglish ／ Englisch lernen mit SurfEnglish |
| reserved.G1 | Wie du Webseiten auf dem iPhone übersetzt ／ Webseite übersetzen und Original behalten |

**必须放行**（0 命中）：„Für Sprachlernende“、„Sprachen lernen mit echten Webseiten“、„WordByWord ist ein Leseassistent für Sprachlernende …“（文档 03 §1.4 的 de 用例"Sprachlernende"）；`seOwnedLead` 对 „SurfEnglish: englische News auf deinem Niveau“、„Fragen zu WordByWord“、„Jeden Tag kostenlos – Plus, wenn du mehr liest“ 不命中。

起草时发现并修掉的误报：`replacement-tone` 的"ersetzt WordByWord"最初会命中 FAQ 里的"übersetzt WordByWord"，已加 `(?<![\p{L}])` 前界。合入前请母语审校再看一遍 `hype` 的 `\b(die|der|das) einzige\b`（可能误伤"das einzige Mal"一类正常句子）。

## 附录 B：验证记录

最终验证在 `$TMPDIR/wbw-m3-de-final/`（rsync 自真实仓库，HEAD `1d5fe5b`，含已提交的 en / zh-Hans / zh-Hant / ja / ko / es / fr），加入 `de.json`、`glossary/de.json`，并在副本里生成 `home-de` OG。

| 命令 | 结果 |
|---|---|
| `node scripts/og.mjs --only home-de` | ✓ headline 64 px × 3、sub 30 px × 2、q82、150.8 KB |
| `node build.mjs --out …/dist` | 15 页，0 error；de 的 W：L-4（3 review + 6 expected）、L-14（24 条规则无 de 词表）、L-9（无 de G1 模式） |
| `node build.mjs --pseudo --out …` | 0 error |
| `node scripts/check.mjs` | 15 个 HTML，0 error，0 warning |
| `node scripts/check.mjs --keys de` | 0 missing，0 not in en |
| `node --test scripts/tests/*.test.mjs` | 58 pass，0 fail |
| 合入 `de-lint.json` 后 build / `--pseudo` | 0 error；de 的 L-14 / L-9 W 消失 |

长度实测（占位符代入后，`text-length.mjs` 口径）：title 55 / 60；description 160（120–160）；H1 75 / 75；eyebrow 59 / 60；lede 72 / 90；how 180 / 180（L-8 上限 220）；platformNote 126 / 140；规格清单 78 / 78 / 79 / 80（≤ 80）；功能 H3 ≤ 69 / 70；`languages.title` 57 / 70；`pricing.summary` 92 / 100；`cta.title` 49 / 70；`cta.recap` 79 / 90；SE title 45 / 60、body 28 词 / 45、要点 31 / 36 / 35（≤ 45）、linkText 70 / 80；FAQ 问句 ≤ 72 / 120、答案 ≤ 597 / 600；所有 alt ≤ 124 / 125。

渲染（headless Chrome + `scripts/serve.mjs`，浅色，FAQ 展开）：

| 宽度 | 横向溢出 | H1 行数 | SE 卡片高度（上限） | 页眉按钮 |
|---|---|---|---|---|
| 320 | 无 | 5 | 553（560） | Laden |
| 375 | 无 | 5 | 472（480） | Laden |
| 414 | 无 | 4 | 469（480） | Laden |
| 768 | 无 | 3 | 386（480） | Herunterladen |
| 900 | 无 | 5 | 411（420） | Herunterladen |
| 1280 | 无 | 4 | 412（420） | Herunterladen |

390 px、FAQ 收起时页面高度：de 13,640 px（en 12,821、es 13,047、fr 13,548）。
