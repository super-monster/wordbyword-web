# M3 · tr（Türkçe）首页文案 QA 记录

| 项 | 内容 |
|---|---|
| locale | tr（T3：按 R36 以"LLM 翻译 + 回译 + 术语表 lint + 关键词检查"上线，上线后补母语审校；文档 04 T11 把 tr 列为优先补审的语言之一） |
| 交付 | `src/locales/tr.json`（新建）；`src/data/glossary/tr.json`（新建，§7.2.5 格式）；`docs/redesign-2026/ops/m3/tr-lint.json`（建议的 tr lint 词表，未合入数据文件）；本记录 |
| 依据 | 文档 08 §7（7.1–7.10）、§1.1、§1.4、§1.5、§2 en 母版；文档 03 §1.4、§1.5、§1.6、§2.3（tr 行，表 A / B / C）、§3.1–§3.9（tr 草案）；文档 04 §5.1、§5.5、§5.7（tr 的 uiNote、linkText 种子、T10）；文档 05 §7.5；裁定 R36、R39–R43、R46、R52、R61–R65、R71、R75–R78、R83、R84；`ja.json` / `zh-Hans.json` 作结构参照；`_legacy/tr.json`、`sibling-tm.json` 只作术语参考（带 warnings 的写法与事实一律未用） |
| App 叫法来源 | `/Users/ike/Dev/WordByWord/WordByWordPrototype/Localizable.xcstrings` 的 `tr` 值（2026-10-06 用 node 逐键抽取全部 270 个 tr 值），与文档 08 表 T-A…T-E 的 tr 列逐项核对，一致 |
| 工作方式 | 私有副本 `scratchpad/wbw-m3-tr/` 起草、构建、渲染检查；最终验证在两份新副本里做：① 按当前工作区重新 rsync 的 `scratchpad/wbw-m3-tr-final/`（HEAD `78b1856` + 负责人未提交的 ru 数据改动；其他译者未提交的 ru 文件剔除）；② `git archive HEAD` 得到的纯 HEAD `78b1856` 副本 `scratchpad/wbw-m3-tr-head/`。两份都只加 tr.json + glossary/tr.json。OG 图只在副本里生成，**没有**复制进真实仓库；lint 词表只在副本里合入自测 |
| 日期 | 2026-10-06 |

（下文土耳其语为可读形式，复数对象已代入当前值。）

## 0. 摘要

1. 键与 en 完全一致（`check.mjs --keys tr`：0 缺、0 多；与 ja 一样不提供 `about.*`、`chromeExtension.*`、`legal.*`，提供 `notfound.*`）。在 HEAD `78b1856` + tr 的新副本里（工作区副本与纯 HEAD 副本结果相同）：`node build.mjs` 与 `--pseudo` 均 **0 error**；`node scripts/check.mjs` 0 error / 0 warning；`node --test scripts/tests/*.test.mjs` 62/62 通过。
2. tr 自己的 warning 有三条：L-4（7 个值与 en 相同：6 个是文档 08 §1.5 列为正常的样张值，另 1 个是 `meta.appStoreSubtitle`，见 §8 第 5 条）；L-14"24 条规则没有 tr 词表"、L-9"没有 tr 的 G1 how-to 模式"——这两条来自数据文件缺 tr 词表。我起草了 `tr-lint.json`（附录 A），在副本里合入后 0 error，tr 只剩 L-4。
3. **校验器缺陷（已由负责人修复）**：`src/lib/dom.mjs` 曾在 `html.toLowerCase()` 上用原字符串的下标找 `</script`，而土耳其语大写 `İ` 小写后是 2 个码元，`<head>` 里每有一个 `İ`（tr 的 `og:image:alt` 有 3 个），JSON-LD 就多截 1 个字符，D-9 报"JSON-LD does not parse"。我没有改校验器，报告了原因和一行修复；负责人已在 `78b1856` 修好（附测试）。修复前我临时用了不含 `İ` 的 OG alt，现在已换回含"(İngilizce arayüz)"的原句，并在 `78b1856` 上复验通过。
4. title、H1 采用文档 03 §3.9 tr 草案：title 逐字照用（n53）；H1 只把逗号改成句号、加荧光笔（n75，荧光笔标"Web sayfasında"）。description 在草案基础上微调为 n160。称谓按文档 08 §7.3 用 siz；手势：句中"sağa kaydırın"、"çift dokunun"。
5. 复数：`Intl.PluralRules('tr')` 的类别是 one / other。土耳其语数词后的名词一律用单数（"21 dil"），两个分支文字相同；仍按简报对全部"数字占位符 + 可数名词"写了复数对象（R62 的统一写法，以后改值也不用动文案）。
6. SurfEnglish：tr 的 `seMode` = en-site（`perLocale.tr.uiNote`）。卡片 note 由 uiNote 替换（"界面没有土耳其语，是英语和另外 11 种；可译成土耳其语"），linkText 带"(İngilizce site)"，链 SE 英文站（模板加 `hreflang="en"`）；FAQ `english-learner` 在链接前加了 §7.8 的界面说明句。
7. 英文界面：5 处功能截图 alt、4 条画廊图注 + alt、`common.screenshotLabel` / `screenshotExcerptLabel`、OG alt、SE 截图 alt 与图注都写"(İngilizce arayüz)"；指向英文页的富文本链接（`@about`、`@chrome`、`@se-site`）的链接文字带"(İngilizce)"。
8. OG（只在副本）：`node scripts/og.mjs --only home-tr` 通过：标题 64 px × 3 行、副标题 30 px × 2 行、150.5 KB（与 home-en 相同的版式）。
9. 渲染检查（headless Chrome + 仓库自带 `scripts/serve.mjs`，端口 4605，外网全部屏蔽，构建 = HEAD `78b1856` + tr）：1280 / 390 / 375 / 320 px 都没有横向溢出，价格表在 320 px 下也完整（`54afac8` 之后）；SE 卡片 393 / 453 / 474 / 547 px，全部在 R10 / R84 上限内；390 px 页面高 12,993 px（≤ 13,000；同一构建 en 12,847）。
10. 第二模型互检（Claude Sonnet，只读）：23 条意见，采纳 19 条（含 2 条部分采纳），3 条说明理由未采纳，1 条留待真机核对（§6）。

## 1. 关键词落点（title / H1 / description 用了哪些主词）

| 位置 | 文案 | 承载的关键词 | 长度 |
|---|---|---|---|
| `meta.title` | "WordByWord: iPhone için web sayfası çeviri uygulaması" | 品牌位 WordByWord；K1 主词「iPhone için web sayfası çeviri uygulaması」**逐字完整**（文档 03 §2.3 表 A tr 行；§3.9 草案原样）；`titleMust` = iPhone / web sayfası / uygulaması 全部命中；`primaryTokens.home.tr`（iPhone、uygulaması）命中 | n53（上限 60） |
| `meta.description` | "Dil öğrenenler için: WordByWord’de bir paragrafı sağa kaydırın, çevirisi altında belirir. Bir kelimeye çift dokunun, anlamını görün. iPhone ve iPad’de ücretsiz." | 受众词「dil öğrenenler」（表 C，R39）；K1 动作 + 结果在前一半；"WordByWord’de"满足文档 03 §3.2"在 WordByWord 里"；K2 动作 + 结果（çift dokunun → anlamını görün）；平台 + 免费收尾（SEO-11）；不写价格 | n160（区间 120–160） |
| `hero.title`（H1） | "[[Web sayfasında]] bir paragrafı sağa kaydırın. Çevirisi hemen altında belirir." | K1 核心名词「web sayfası」（荧光笔 2 个词，R65）；"段落"一级的动作 + 结果（R46、PRO-19），写了方向；不含品牌（R27）；没有 how-to 句式 | n75（上限 75） |
| `hero.eyebrow` | "WordByWord · Dil öğrenenler için iki dilli web okuma" | 品牌 + 品类（iki dilli web okuma ≈ bilingual web reading）+ 受众 | 52 wu（上限 60） |
| `hero.lede` = `ledeShort` | "WordByWord, iPhone ve iPad için dil öğrenenlere yönelik bir okuma asistanıdır." | R39 定义句，以"WordByWord, …"开头；"okuma asistanı"只出现在定义句、FAQ `what-is` 与页脚 tagline（D13） | n78（≤ 90，故与 ledeShort 相同） |
| `meta.ogHeadline` | "Web sayfalarını iki dilde okuyun. [[Orijinal yerinde kalır.]]" | K1"双语阅读 + 原文保留"；荧光笔 1 处；没用"orijinali koruyun"（附录 A 建议留给 G1） | 64 px × 3 行 |
| 功能区 H2 | "Okuduğunuz sitelerde kaydırarak çeviri, çift dokunarak kelime anlamı" | K1 动作 + K2「kelime anlamı」；"okuduğunuz sitelerde"（PRO-16，不写"任何网站"） | n68 |
| 功能 H3 | K1「Çevirmek için Kaydırın: çeviri, orijinal metnin hemen altında belirir」；K2「Bir kelimeye çift dokunun: yapay zekâ bağlama göre anlamını açıklar」；K9「X (Twitter) gönderilerini yerleşik tarayıcıda iki dilde okuyun」；K5「Parça Çıkarma ve Action Flow: İngilizce cümleler için」（R83 带"İngilizce"）；K3「Yapay zekâ ile sesli okuma veya cihazdaki hızlı iOS sesleri」；K4「Uzun cümleler için yapay zekâ ile cümle yapısı analizi」；K7「Bulutta veya cihazda çeviri」；K6「Çeviri ve bakılan kelime geçmişi」 | K3、K4、K6、K7 与表 A / B 主词逐字一致；K2「bağlama göre … anlam」+「yapay zekâ」为主词「bağlama göre kelime anlamı (yapay zekâ)」的句式变体；K9 用了「X (Twitter) gönderileri」 | 全部 ≤ 70 wu |
| 语言段 H2 | "21 dile çeviri: yalnızca İngilizceden değil"（复数对象） | K8 主词「21 dile çeviri」逐字 | 43 wu |
| 价格段 H2 | "Her gün ücretsiz; daha çok okuyorsanız Plus’a yükseltin" | K10「ücretsiz」+ Plus（"yükseltin"呼应 App 的"Plus'a Yükselt"） | — |
| 最终 CTA H2 | "iPhone’da web sitelerini iki dilde okumaya başlayın" | 动作句，不是 G1 标题，不暗示整页（R46） | 51 wu |

检查结果：title / description / H1 / OG / 功能区 H2 里没有 SE 独占词（含附录 A 建议新增的"İngilizce haber / okuma""parça çıkarma""chunk"）；title / H1 / description / `cta.title` 里没有 how-to 句式（附录 A 的 G1 模式 0 命中：没有"nasıl""orijinali koruyarak""yöntem""adım adım"）。

## 2. 品牌位、称谓、手势写法、SE 模式

- **品牌位**：「WordByWord」（文档 03 §1.5：只有 zh-Hant、ru 用本地化店名）。TR 店面没有土耳其语的商店文案，显示的是美区的 "WordByWord Translate" / "Swipe to translate AI explains"（研究 05 §2.1 逐国 lookup；2026-10-05 保存的 TR 店面页面同样如此），所以 `meta.appStoreName` / `appStoreSubtitle` 照店面原样填英文（tr 没有 about 页，这两个键不渲染）。
- **称谓**：siz（礼貌复数），祈使句用 -in / -ın / -un / -ün；全文没有感叹号、emoji、最高级。
- **手势**：句中右滑写「sağa kaydırın / sağa kaydırarak」，双击写「çift dokunun / çift dokunarak」（文档 08 §7.3 tr 行）。功能名照 App：「Çevirmek için Kaydırın」（T-A；tr 没有"右滑翻译"短名，与 ko 的 X4 同样是祈使句，但只能用它）、「Aramak için çift dokunun」（kicker 去掉"(AI Anlamı)"后缀，与 en / ja / es / fr 一致，正好 24 字符，不报 L-8）。
- **专有名词后的格词尾**：按读音和谐，用 ’：WordByWord’de / ’ü / ’ün、iPhone’da、iPad’de、Mac’te、App Store’da / ’dan、x.com’a、SurfEnglish’i / ’in、Safari’den、Vision Pro’da、ABD’de、Apple Inc.’in。词尾**从不直接接在占位符上**（"{minOS} veya üzeri"、"aylık {plus.priceUS} karşılığında"），以免改值后元音和谐出错。
- **"AI"的写法**：App 自己混用"AI"（AI Anlamı、AI ses sentezi…）和"Yapay Zeka"（Yapay Zeka Okuma、Yapay Zeka Telaffuzu…）。按 Wave 2 规则：正文用文档 03 tr 关键词的标准写法「yapay zekâ」（TDK 拼写），引号里的 App 名称照 App 原文。是否改成不带长音符的「yapay zeka」请负责人决定（§8 第 4 条）。
- **SE 模式**：`seMode('tr') = 'en-site'`。
  - 卡片 ① 渲染：`uiNote` 替换 `note`："Ücretsiz · Arayüz Türkçe değil (İngilizce ve 11 dil daha) · Türkçeye çeviri yapar"（不含 `{se.uiLanguages}`，不写"12 dil"）；`linkText`「Seviyenize göre İngilizce haberler – SurfEnglish (İngilizce site)」= SE 核心词短语 + 品牌 + 英文网站注记（R76，文档 04 §5.7 种子的句式，语义按 en 补回"seviyenize göre"）；`appStoreLinkText`「SurfEnglish’i App Store’dan indirin」（Apple 土耳其语徽章的动词，不含"→"）；链接都指向 `https://surfenglish.app/`，`hreflang="en"`。
  - H2 以 SurfEnglish 开头；body 首句是条件句"İngilizce mi öğreniyorsunuz?"（R40）；卖点只有分级新闻、复习游戏、从 Safari 分享（R41），不提语音。
  - FAQ ②：互补叙事；链接前加了界面说明句"SurfEnglish’in arayüzü Türkçe değildir (İngilizce ve 11 başka dilde sunulur), ancak Türkçeye çeviri yapabilir."；锚文本"SurfEnglish web sitesi (İngilizce)"。
  - 页脚 ④ 用文档 04 §5.5 的定值：「Aynı geliştiriciden」、「SurfEnglish: Bilingual News (EN)」。

## 3. Q1–Q10 逐条结果（文档 08 §7.9）

| # | 结果 | 说明 |
|---|---|---|
| Q1 | ✓ | JSON 能解析；键与 en 一致（`--keys tr` 0 缺 0 多）；HEAD 新副本 build / `--pseudo` 0 error，`check.mjs` 0 error，测试 62/62 |
| Q2 | ✓ | 占位符、`[[ ]]`、`**`、`[文本](@ref)` 都保留；ref 只用 `@about`、`@chrome`、`@se-site`（白名单内）；没有写死额度、价格、语言数（L-12 0 条；uiNote 与 FAQ 里的"11"是文档 08 §7.8 规定由译者写死的 {se.uiLanguages} − 1）。复数对象（one / other）：`languages.title / uiCount / targetCount`、`gallery.items[languageList].caption`、`faq.items[languages].a`（2 处）、`faq.items[free].a`（5 处）、`cta.recap`、`sibling.card.note`；代入当前值后渲染为"21 dile çeviri""Uygulama arayüzü 20 dilde""21 çeviri dilinden birini seçin""100 kaydırarak çeviri""20 kelime arama""30 Parça Çıkarma""20 Action Flow""5 yapay zekâ söz dizimi açıklaması""21 dil"。`Günde {n}` 与"bulut motoruyla {quota.cloudSwipe.free}"后面没有可数名词，与 en 同构 |
| Q3 | ✓ | title 以品牌位开头，三个 `titleMust` 词元齐全（文档 08 §7.3 写的是"iPhone、web"；按文档 03 §3.8"iPhone + K1 核心名词 + 产品词"用了 `["iPhone","web sayfası","uygulaması"]`，更严）；K1 是产品 / 品类意图；没有禁用主词和 how-to 句式 |
| Q4 | ✓ | `hero.title` 恰好 1 处 `[[Web sayfasında]]`（2 个词）；功能 H3、`languages.title` 没有 `[[ ]]`；`hero.lede` 以"WordByWord, …"开头，写明"dil öğrenenlere yönelik"（为学外语的人） |
| Q5 | ✓ | §1.1 红线逐行核对：整页翻译只出现在 FAQ `whole-page` 的否定回答里，Safari 扩展只在 FAQ `safari`，Android 只在 FAQ `android`，桌面版只在 FAQ `devices`；没写离线、无限 AI 发音、暗色模式 / 主题、快捷键 / 音量、生词本 / 闪卡 / 同步、"Plus 专属"、样式数量、口语练习、ChatGPT、"WordByWord ekibi"；CJK 原文不能双击查词、Chunks / Action Flow 仅英语都写在同一屏；没有 jargon "hizalama"，也没有 legacy 的"seçerek"（选中即译）。附录 A 词表在副本里跑 L-14：0 命中 |
| Q6 | ✓ | kicker 与价格表行名用 App 叫法（glossary `required` 22 项，L-13 0 违规）：Çevirmek için Kaydırın、Aramak için çift dokunun (AI Anlamı)、Daha Fazla Tanım、Parça Çıkarma、Cümle eylem akışı、Yapay Zeka Telaffuzu (Kelime / Cümle)、iOS sesi (Yerel Okuma)；Action Flow 保留 App Store 名，正文括注 App 叫法 “Cümle eylem akışı”（D3）；句中按 §7.3 写"sağa kaydırın""çift dokunun"，没有鼠标说法"çift tıklayın"；按钮名照 App 原文引用：“Şimdi Yükselt”、“Satın Almayı Geri Yükle”、“Yapay Zeka Söz Dizimi Açıklamasını Al”、“Kaydırma Çeviri Geçmişi”、“Yapay Zeka Okuma”、“Yerel Okuma”（glossary `contains`，L-13 通过） |
| Q7 | ✓ | 5 处功能截图 alt、4 条画廊图注 + alt、`common.screenshotLabel`（"Ekran görüntüsü (İngilizce arayüz)"）/ `screenshotExcerptLabel`、OG alt、SE 截图 alt 与图注都注明"(İngilizce arayüz)"，内容逐张对照 `assets/img/shot/en/*`（西语 Wikipedia 页 + 英文译文、"convirtiéndose"、"matrimonio"、Auto / Quote Style / Local Read、语言列表里看得到的"Türkçe"）；`features[x].alt` 描述社交帖样张并注明"ekran görüntüsü değil"；样张 `lookup.word` = "end"，出现在 `demo.source[1]` |
| Q8 | ✓ | en-site：uiNote 不含 `{se.uiLanguages}`、不写"12 dil"，含"11"（L-11 通过）；linkText = SE 核心词短语 + 品牌 + "(İngilizce site)"（n65，en-site 上限 80）；FAQ 加了界面说明句；H2 以 SurfEnglish 开头；body 首句是条件句；没有"daha uygun / yerine / yeni / daha hızlı / yükselt"（附录 A 的 replacement-tone、se-hype 0 命中，含文档 04 T10 的"daha uygun olabilir"）；卖点只用 R41 三项 |
| Q9 | ✓ | 代入占位符后实测全部在 §7.6 / L-8 限内（附录 B 表）；SE 卡片高度在 R10 / R84 限内（§7） |
| Q10 | ✓ | tr 是拉丁文字，不涉及 RTL / CJK；没有 `{wbr}`（R61）；拉丁文字的 eyebrow / kicker 由 CSS 转大写，`<html lang="tr">` 下 Chrome 按土耳其语规则大写（i → İ、ı → I），实测"DİL ÖĞRENENLER İÇİN""X (ESKİ ADIYLA TWİTTER)"正确 |
| Q12 | ✓（副本） | 1280 / 390 / 375 / 320 px 无横向溢出、无字体回落；375 px 下 H1 4 行，hero 次级链接与徽章同行；320 px 下链接换到徽章下一行（en、fr 相同） |
| Q13 | ✓ | FAQ `devices` 的 `a`（S0）没写扩展名称；`aExtLive` 写了名称并注明只从该页面的链接安装；首页没出现 WordByWord.io |

## 4. 回译对照（tr → English，对照 en.json）

| 键 | tr | 回译 | en 原文 |
|---|---|---|---|
| meta.title | WordByWord: iPhone için web sayfası çeviri uygulaması | WordByWord: web page translation app for iPhone | WordByWord: Bilingual Web Page Translator App for iPhone |
| meta.description | Dil öğrenenler için: WordByWord’de bir paragrafı sağa kaydırın, çevirisi altında belirir. Bir kelimeye çift dokunun, anlamını görün. iPhone ve iPad’de ücretsiz. | For language learners: swipe a paragraph to the right in WordByWord and its translation appears below. Double-tap a word and see its meaning. Free on iPhone and iPad. | For language learners: swipe a paragraph in the built-in browser and its translation appears below. Double-tap a word for its meaning. Free on iPhone & iPad. |
| meta.ogHeadline | Web sayfalarını iki dilde okuyun. [[Orijinal yerinde kalır.]] | Read web pages in two languages. [[The original stays in place.]] | Read any web page bilingually. [[Keep the original.]] |
| meta.ogSubline | Bir paragrafı sağa kaydırın · bir kelimeye çift dokunun, bağlamdaki anlamını görün | Swipe a paragraph to the right · double-tap a word and see its meaning in context | Swipe right on a paragraph · double-tap a word for its meaning in context |
| hero.title | [[Web sayfasında]] bir paragrafı sağa kaydırın. Çevirisi hemen altında belirir. | Swipe a paragraph to the right [[on a web page]]. Its translation appears right below. | Swipe a paragraph on [[any web page]]. Its translation appears right below. |
| hero.lede | WordByWord, iPhone ve iPad için dil öğrenenlere yönelik bir okuma asistanıdır. | WordByWord is a reading assistant for language learners, for iPhone and iPad. | WordByWord is a reading assistant for language learners on iPhone and iPad. |
| hero.how | Bir siteyi uygulamanın yerleşik tarayıcısında açıp bir paragrafı sağa kaydırın: çevirisi hemen altında belirir. Bir kelimeye çift dokunun; yapay zekâ o cümledeki anlamını açıklar. | Open a site in the app’s built-in browser and swipe a paragraph to the right: its translation appears right below. Double-tap a word; the AI explains what it means in that sentence. | Open a site in its built-in browser and swipe right on a paragraph: the translation appears below it. Double-tap a word for an AI explanation of what it means there. |
| featuresIntro.title | Okuduğunuz sitelerde kaydırarak çeviri, çift dokunarak kelime anlamı | Translation by swiping and word meaning by double-tapping, on the sites you read | Swipe to translate, double-tap to look up — on the websites you read |
| features[swipe].title | Çevirmek için Kaydırın: çeviri, orijinal metnin hemen altında belirir | Swipe to Translate: the translation appears right below the original text | Swipe to Translate: the translation appears right below the original |
| features[lookup].title | Bir kelimeye çift dokunun: yapay zekâ bağlama göre anlamını açıklar | Double-tap a word: the AI explains its meaning according to the context | Double-tap a word for its AI meaning in context |
| features[x].title | X (Twitter) gönderilerini yerleşik tarayıcıda iki dilde okuyun | Read X (Twitter) posts in two languages in the built-in browser | Read X (Twitter) posts bilingually in the built-in browser |
| features[chunks].title | Parça Çıkarma ve Action Flow: İngilizce cümleler için | Chunk Extraction and Action Flow: for English sentences | Chunk Extraction and Action Flow, for English sentences |
| features[speech].title | Yapay zekâ ile sesli okuma veya cihazdaki hızlı iOS sesleri | Read-aloud with AI, or the fast iOS voices on the device | AI read-aloud, or fast on-device iOS voices |
| features[syntax].title | Uzun cümleler için yapay zekâ ile cümle yapısı analizi | Sentence structure analysis with AI, for long sentences | AI sentence structure analysis for long sentences |
| features[engines].title | Bulutta veya cihazda çeviri | Translation in the cloud or on the device | Cloud or on-device translation |
| features[display].title | Çeviri düzeni ve stili | Translation layout and style | Translation layout and style |
| features[history].title | Çeviri ve bakılan kelime geçmişi | History of translations and looked-up words | Translation and lookup history |
| features[devices].title | iPhone, iPad, Mac ve Vision Pro | iPhone, iPad, Mac and Vision Pro | iPhone, iPad, Mac and Vision Pro |
| faq[what-is].q | WordByWord nedir? | What is WordByWord? | What is WordByWord? |
| faq[whole-page].q | WordByWord bir web sayfasının tamamını tek seferde çevirebilir mi? | Can WordByWord translate the whole of a web page in one go? | Can WordByWord translate a whole web page at once? |
| faq[safari].q | Safari’de ya da başka uygulamaların içinde çalışır mı? | Does it work in Safari or inside other apps? | Does it work in Safari or inside other apps? |
| faq[word-by-word].q | WordByWord kelime kelime mi çevirir? | Does WordByWord translate word by word? | Is WordByWord a word-by-word translator? |
| faq[x].q | X (Twitter) gönderilerini WordByWord ile okuyabilir miyim? | Can I read X (Twitter) posts with WordByWord? | Can I read X (Twitter) with WordByWord? |
| faq[languages].q | WordByWord hangi dilleri destekliyor? | Which languages does WordByWord support? | Which languages does WordByWord support? |
| faq[free].q | WordByWord ücretsiz mi? Günlük sınırlar neler? | Is WordByWord free? What are the daily limits? | Is WordByWord free? What are the daily limits? |
| faq[engines].q | Hangi çeviri motorunu kullanıyor? | Which translation engine does it use? | Which translation engine does it use? |
| faq[account].q | WordByWord için hesap gerekir mi? | Do you need an account for WordByWord? | Do I need an account to use WordByWord? |
| faq[restore].q | Yeni bir iPhone veya iPad’de Plus aboneliğimi nasıl geri yüklerim? | How do I restore my Plus subscription on a new iPhone or iPad? | How do I get WordByWord Plus back on a new iPhone or iPad? |
| faq[android].q | Android sürümü var mı? | Is there an Android version? | Is there an Android version? |
| faq[english-learner].q | İngilizce öğreniyorum. SurfEnglish’i de denemeye değer mi? | I’m learning English. Is SurfEnglish worth trying too? | I’m learning English. Is SurfEnglish worth trying too? |
| faq[devices].q | WordByWord iPad’de, Mac’te ya da masaüstü tarayıcıda çalışır mı? | Does WordByWord work on iPad, on a Mac or in a desktop browser? | Does WordByWord work on iPad, Mac or a desktop browser? |
| faq[english-learner].a（en-site 补句） | SurfEnglish’in arayüzü Türkçe değildir (İngilizce ve 11 başka dilde sunulur), ancak Türkçeye çeviri yapabilir. | SurfEnglish’s interface is not in Turkish (it is offered in English and 11 other languages), but it can translate into Turkish. | 文档 08 §7.8 模板：SurfEnglish’s interface isn’t available in {language} — it’s in English and {n} other languages — but it can translate into {language}. |
| pricing.summary | Bu sınırlar içinde her özellik ücretsiz; Plus, ABD’de aylık $3,99 karşılığında sınırları yükseltir. | Within these limits every feature is free; Plus raises the limits for $3.99 a month in the US. | Every feature is free within these limits; Plus raises them for $3.99/month (US). |
| sibling.card.eyebrow | WordByWord’ün geliştiricisinden | From the developer of WordByWord | From the developer of WordByWord |
| sibling.card.title | SurfEnglish: seviyenize göre İngilizce haberler | SurfEnglish: English news at your level | SurfEnglish: daily English news at your level |
| sibling.card.body | İngilizce mi öğreniyorsunuz? Dilediğiniz sayfaları WordByWord’de okumaya devam edin, SurfEnglish’i de deneyin: seviyeye göre günlük İngilizce haberler ve tekrar oyunları, aynı hareketlerle. | Learning English? Keep reading the pages you like in WordByWord, and try SurfEnglish too: daily English news by level and review games, with the same gestures. | Learning English? Keep reading any page you like in WordByWord, and try SurfEnglish too: daily English news by level and review games, with the same swipe and double-tap. |
| sibling.card.points | A1–C1 seviyelerinde gerçek İngilizce haberler ／ Okuduklarınızdan oluşturulan tekrar oyunları ／ İngilizce makaleleri Safari’den paylaşın | Real English news at levels A1–C1 / Review games built from what you’ve read / Share English articles from Safari | Real English news at levels A1–C1 / Review games built from what you’ve read / Share English articles from Safari to the app |
| sibling.card.uiNote（替换 note） | Ücretsiz · Arayüz Türkçe değil (İngilizce ve 11 dil daha) · Türkçeye çeviri yapar | Free · The interface is not in Turkish (English and 11 more languages) · Translates into Turkish | （en 的 note：Free to start · iPhone and iPad · App in 12 languages · Translations into 21；文档 04 §5.7 tr uiNote 草案："Ücretsiz başlayın · Uygulama arayüzü Türkçe değil (İngilizce ve 11 dil daha) · Türkçeye çeviri yapılabilir"） |
| sibling.card.linkText | Seviyenize göre İngilizce haberler – SurfEnglish (İngilizce site) | English news at your level – SurfEnglish (English site) | Read English news at your level with SurfEnglish |
| sibling.card.appStoreLinkText | SurfEnglish’i App Store’dan indirin | Download SurfEnglish from the App Store | Get SurfEnglish on the App Store |
| sibling.card.shotAlt | SurfEnglish “Games” ekranı (İngilizce arayüz): kayıtlı cümle ve kelimelerle oynamaya hazır Sentence Builder ve Word Raid | SurfEnglish “Games” screen (English interface): Sentence Builder and Word Raid, ready to play with saved sentences and words | SurfEnglish Games screen: Sentence Builder and Word Raid, ready to play with saved sentences and words |
| sibling.card.shotCaption | SurfEnglish ekran görüntüsü (İngilizce arayüz) | SurfEnglish screenshot (English interface) | SurfEnglish screenshot (English interface) |
| sibling.footer.heading / linkText | Aynı geliştiriciden ／ SurfEnglish: Bilingual News (EN) | From the same developer / （店面名，不翻译） | More from the maker / SurfEnglish: Bilingual News |
| cta.title | iPhone’da web sitelerini iki dilde okumaya başlayın | Start reading websites in two languages on iPhone | Start reading websites bilingually on iPhone |
| cta.recap | Kaydırarak çeviri · Çift dokunarak kelime anlamı · Sesli okuma · 21 dil | Translation by swiping · Word meaning by double-tapping · Read-aloud · 21 languages | Swipe to translate · Double-tap to look up · Read aloud · 21 languages |

### 4.1 与 en 的事实偏差

**没有事实偏差。** 以下是措辞层面的差异，都有意为之：

1. `meta.title` 没有"iki dilli"（bilingual）：照用文档 03 §3.9 草案；加上会到 n63，超过 60。"iki dilli"放在 eyebrow 里。
2. `meta.description` 用"WordByWord’de"代替"built-in browser"（文档 03 §3.2 允许二选一）；`hero.how`、FAQ 和功能正文都写了"yerleşik tarayıcı"。
3. `hero.title` 写"Web sayfasında"（在网页上），不是"任何网页"：照用文档 03 草案；第二模型建议的"Her web sayfasında"要删掉"hemen"（right）才能塞进 75，列在 §5 供审校选择。
4. `hero.platformNote` 按 D2 不写美区价格，只写"Plus: aylık abonelik"；末尾写"Apple çipli Mac ve Vision Pro’da da çalışır"（"Vision Pro"简称与 en 的 `features[devices].title` 相同）。
5. SE 卡片 H2 没有"günlük"（daily）：放回去后 320 px 下卡片 573 px > 560（R84）；"günlük"保留在卡片 body 和 FAQ 里。body 的"with the same swipe and double-tap"写成"aynı hareketlerle"（同样的手势），`points[2]` 省略"to the app"——同样是为了卡片高度。
6. `faq[restore].q` 写"Plus aboneliğimi"（我的 Plus 订阅），`faq[account].q` 写"WordByWord için"（不是"使用 WordByWord"）：为 390 px 页面高度各省一行，意思不变。
7. `faq[what-is].a` 与 `faq[devices].a / aExtLive` 的链接文字加了"(İngilizce)"，`@se-site` 也加了（en-site 模式）。

## 5. 没把握的措辞（13 处，附回译与替代写法）

| # | 键 | tr | 回译 | 替代写法 | 说明 |
|---|---|---|---|---|---|
| 1 | hero.eyebrow | Dil öğrenenler için iki dilli web okuma | Bilingual web reading for language learners | "…iki dilli web okuyucu"（bilingual web reader）／"Web’i iki dilde okuyun, dil öğrenin" | "okuyucu"既指读者本人也指阅读器，所以用了动名词"okuma"；作为品类名略新 |
| 2 | features[lookup].kicker（App 名） | Aramak için çift dokunun | Double-tap to search | 非 App 用语："Anlamı için çift dokunun"／"Çift dokunarak anlam" | App 把"Look Up"译成"aramak"（搜索），读起来像搜索功能；规则 ① 要求 kicker 用 App 名，所以保留，建议 App 侧改（§8 第 8 条） |
| 3 | features[swipe].kicker / title（App 名） | Çevirmek için Kaydırın | Swipe (please) to translate | "Kaydırarak çeviri"（自然的名词短语） | 与 ko 的 X4 同类：App 的功能名是祈使句；tr 没有"右滑翻译"短名可替换 |
| 4 | meta.ogHeadline | … [[Orijinal yerinde kalır.]] | … The original stays in place. | "[[Orijinali koruyun.]]"（= en "Keep the original."）／"[[Orijinal metin kaybolmaz.]]" | 没用"orijinali koru-"，因为附录 A 建议把它留给 G1 的 how-to 主词（OG 本身不在 G1 检查区） |
| 5 | 全文 | yapay zekâ（正文）／Yapay Zeka（App 名） | AI | 全站改"yapay zeka"（与 App、多数网站一致）或改"AI" | TDK 写法带长音符，日常网络用法多不带；同一屏两种写法并存（§8 第 4 条） |
| 6 | sibling.card.body | …seviyeye göre günlük İngilizce haberler ve tekrar oyunları, aynı hareketlerle. | …daily English news by level and review games, with the same gestures. | "…aynı kaydırma ve çift dokunmayla"（= en 的"same swipe and double-tap"） | 写全手势会让 320 px 卡片超过 560 px |
| 7 | features[engines].text | Bulut (Azure, Google) veya cihazda iOS; bulut hakkı bittiyse yerel motora geçin. | Cloud (Azure, Google) or iOS on the device; if your cloud allowance runs out, switch to the local engine. | "…bulut kotası bitince yerele geçin." | 正好 80 字符（规格清单上限）；"hak"（使用次数）是 App 自己的说法（"kaydırarak çeviri haklarınızı"） |
| 8 | faq[free].a | Ücretsiz planda her gün bulut motoruyla 50, yerel motorla 100 kaydırarak çeviri, 20 kelime arama (çift dokunarak), … hakkınız olur | The free plan gives you each day 50 swipe translations with the cloud engine and 100 with the local engine, 20 word lookups (by double-tap), … | 拆成两句："Ücretsiz planın günlük hakları: …" | 长列举末尾才出现动词"hakkınız olur"，可读性一般 |
| 9 | hero.title | [[Web sayfasında]] bir paragrafı sağa kaydırın. Çevirisi hemen altında belirir. | Swipe a paragraph to the right [[on a web page]]. Its translation appears right below. | "[[Her web sayfasında]] bir paragrafı sağa kaydırın. Çevirisi altında belirir."（n73） | 第二模型认为荧光笔标"web sayfasında"偏弱；替代写法更接近 en 的"any web page"，但要删"hemen" |
| 10 | features[speech].text | …indirdiğiniz Premium veya Enhanced sesleri de kullanabilir. | …and it can also use the Premium or Enhanced voices you have downloaded. | 若土耳其语 iOS 设置里显示"Gelişmiş"，改为"Premium veya Gelişmiş" | 照 App 的 tr 文案写了"Enhanced"；没能在土耳其语 iOS 上核对系统的叫法 |
| 11 | common.screenshotExcerptLabel | Ekran kesiti (İngilizce arayüz) | Screen excerpt (English interface) | "Ekran görüntüsünden kesit (İngilizce arayüz)"（44 > 40） | "kesit"偏书面 |
| 12 | features[syntax].text | “Kaydırma Çeviri Geçmişi”nde çevrilmiş bir cümleyi açıp … | Open a translated sentence in “Swipe Translation History” and … | "“Kaydırma Çeviri Geçmişi” ekranında …" | 引号后直接接词尾符合 TDK（如 “Çalıkuşu”nu），但有人觉得别扭；替代写法会让 390 px 下多一行 |
| 13 | footer.madeBy | Geliştirici: Jinlong | Developer: Jinlong | "Jinlong tarafından geliştirildi" | 版权行里已有"Jinlong"，用短标签避免重复 |

## 6. 第二模型互检（R36"双模型互检"的做法，T3 本不强制）

- 审校方：Claude Sonnet，单独运行，只读；输入为 tr.json、en.json 和简报规则（称谓、手势、App 叫法、长度上限、禁用说法）。
- 总评：词尾的元音和谐与辅音同化（WordByWord’de、iPhone’da、iPad’de、Mac’lerde、App Store’dan、x.com’a、SurfEnglish’i、ABD’de、Safari’den、Vision Pro’da、Apple Inc.’in）全部正确，拼写符合 TDK；大部分读起来像土耳其语原创文案。
- **已采纳**（19 条，含 2 条部分采纳）：
  - **错误**：SE 卡片 body 的"seviyeli"日常义是"有格调的"，改为"seviyeye göre"（并把"günlük"放回 body）；FAQ `whole-page` 主语从"App"跳到"你"，统一为第二人称；
  - 样张译文"Mahallemizin kütüphanesi"（直译腔）→"Mahalle kütüphanemiz"；
  - 查词要点 ③ 的工具格"-la"只挂在最后一项 → "örnek, kelime biçimi ve telaffuz içeren tam sözlük maddesi"；
  - FAQ `restore` 两个按钮名都加"düğmesine"；
  - 右滑要点 ② 的愿望式（-sın）改为陈述句"Çeviriler hemen ya da dokununca görünür"；
  - 功能区 H2 去掉冒号后的残句 → "Okuduğunuz sitelerde kaydırarak çeviri, çift dokunarak kelime anlamı"；
  - "tanımların bir listesini"去掉多余的"bir"；FAQ `engines` "dil kaynakları"→"dil paketleri"（App 的下载提示也叫"Dil Paketi"）；"iş görmek"→"halleder"；X 卡删去"çok"；样张图注改成名词短语；规格清单"Yerele geçin"→"bittiyse yerel motora geçin"；价格 H2 "çok"→"daha çok"（对应 "more"）；FAQ `free` 的"yerel fiyatlar"（与"yerel motor"同词）→"fiyatlar bölgeye göre değişir"；FAQ `languages` 的并列结构拆开；404 文案"yeniden düzenlenirken"→"yenilenirken"；右滑要点 ③ 的"X"补成"X (Twitter)"；
  - 部分采纳：uiNote / FAQ 的界面说明句改了措辞，但"11"按文档 08 §7.8 仍由译者写死。
- **未采纳**（3 条）：① 卡片 H2 放回"günlük"：320 px 下卡片 573 px > 560（R84），改为放在 body；② H1 改"Her web sayfasında"：要删"hemen"，且文档 03 草案就是现在的写法，列入 §5 第 9 条；③ description 改写"yerleşik tarayıcıda"：文档 03 §3.2 允许"在 WordByWord 里"的写法，品牌词留在 description 对品牌查询更有利。
- **待核对**（1 条）：iOS 土耳其语界面里"Enhanced"语音的叫法（§5 第 10 条）。

## 7. 版面实测（HEAD `78b1856` + tr，headless Chrome，`scripts/serve.mjs` 端口 4605，外网全部屏蔽）

| 视口 | SE 卡片高度（上限） | 样张红色译文条顶端 | 整页高度 | 横向溢出 |
|---|---|---|---|---|
| 1280 × 900 | 393 px（420） | 378 px | 10,326 px | 无 |
| 390 × 844 | 453 px（480） | 735 px（< 844，R69） | 12,993 px（软目标 ≤ 13,000；同一构建 en 12,847） | 无 |
| 375 × 812 | 474 px（480） | 733 px | 13,235 px | 无 |
| 320 × 700 | 547 px（560，R84） | 834 px | 13,881 px | 无（价格表 286 px 正好放进外框；画廊在自己的横向滚动容器内，与 en 相同） |

- 为满足上面的数字所做的调整（初稿 → 定稿）：SE 卡片 H2 去掉"günlük"、body 改短、linkText 改成种子句式（320 px：613 → 547 px）；功能区 H2、语言段导语、句法正文、页脚"iPhone/iPad uygulaması"、FAQ 三个问句、`hero.platformNote` 各省一行（390 px：13,173 → 12,993 px）。曾为页面高度把价格表两行缩成"· bulut / · yerel"，`54afac8` 改了窄屏表格样式后，App 的全名"· bulut motoru / · yerel motor"在 390 px 下不再多占行，已恢复（375 px +42 px、320 px +21 px，都没有上限）。
- 页面高度随 HEAD 变化：`0267123`（OS 占位符不换行）让所有 locale +64 px，页脚语言列表也随每个新 locale 变长；ru 等后续 locale 入库后 390 px 还可能再涨几十 px，tr 已没有不损失信息的可删文字。
- **320 px 价格表**：`54afac8` 之前，不换行的标签“Yalnızca İngilizce”把 tr 表格撑到 310 px（外框 286 px，Plus 列被截）；`54afac8` 让标签和单元格在 < 768 px 换行后，tr 表格正好 286 px，不再需要缩短任何单元格。
- 目视检查了 375 px 的 hero（含样张查词卡）、L1 / L2 功能块（①②③ 页边注）、X 样张、语块示意、规格清单、画廊、语言段、价格表、SE 卡片、FAQ、最终 CTA、页脚，以及 1280 / 320 px 的 hero：没有溢出或异常断行，土耳其语大写正确。

## 8. 需要负责人决定的问题

1. **校验器缺陷（已解决）**：`src/lib/dom.mjs` 的 raw-text 结束标签查找在 `html.toLowerCase()` 上用原字符串下标，土耳其语 `İ` 会让 JSON-LD 被截断（D-9）。负责人已按我报告的一行修复提交 `78b1856`（附 `scripts/tests/dom.test.mjs`）；tr 的 `meta.ogImageAlt` 已换回含"(İngilizce arayüz)"的原句，在 `78b1856` 上 0 error。今后 tr 的 title / description / ogHeadline 里出现大写 `İ` 也没问题了。
2. **OG 图（D-23）**：按简报没有复制 OG 文件。tr.json 进库后，真实仓库构建会报 `D-23 home-tr: no OG image`，直到运行 `node scripts/og.mjs --only home-tr`（副本实测：64 px × 3 行、副标题 30 px × 2 行、150.5 KB）。
3. **tr lint 词表**：`tr-lint.json`（附录 A）覆盖 25 条规则 + seOwned / seOwnedLead / G1。注意：① `/iu` 不会把土耳其语大写 `İ` 折叠成 `i`，所以以 i 开头的词写成 `[İi]…`（现有的 `seOwned.tr` "İngilizce öğren" 匹配不到小写或 ASCII 写法，建议一并替换）；② 词边界都写成显式的 `(?<!\p{L})` / `(?!\p{L})`，不依赖 `\b`（`bb689eb` 之后数据文件里的 `\b` 已按 Unicode 处理，两种情况下都成立）；③ 新增的 `seOwned` "parça çıkarma" 用来在 title / H1 / description / OG 里执行 R83。是否合入请决定。
4. **"yapay zekâ"还是"yapay zeka"**：文档 03 的 tr 关键词与 TDK 都写"zekâ"；App 和多数网站写"Zeka"。现在正文用"yapay zekâ"，App 名照 App。要统一成"yapay zeka"只需全文替换（不影响长度）。
5. **`meta.appStoreSubtitle` 的 L-4 warning**：TR 店面没有土耳其语商店文案，显示的就是英文副标题，所以值与 en 相同（`meta.appStoreName` 同理，L-4 已列为正常）。tr 不渲染这两个键。建议 App 侧给 TR 店面补土耳其语的名称和副标题（目前店面上只有英文）。
6. **390 px 页面高度**：12,993 px（≤ 13,000）。页脚语言列表还会随后续 locale 变长，到时 tr 可能超出软目标几十 px；如果要求严格 ≤ 13,000，下一步只能删 `hero.how` 或 FAQ 问句里的细节，我认为不值得。320 px 价格表的问题已由 `54afac8` 解决。
7. **`seo.titleMust`**：文档 08 §7.3 tr 行写"iPhone、web"；我按文档 03 §3.8 用了 `["iPhone","web sayfası","uygulaması"]`（title 都命中，更严）。请确认。
8. **报给 App 侧的 tr 字符串问题**（§7.2.2 规则 ③，网站已按修正写法处理或照原文引用）：
   - `daily_sentence_translation_limit`「Çevirmek için Kaydırın」是祈使句，不像功能名（同 ko X4）；建议"Kaydırarak Çeviri"；
   - `word_meaning_lookup_title`「Aramak için çift dokunun (AI Anlamı)」把查词译成"aramak"（搜索），像搜索功能；建议"Anlam için çift dokunun (AI)"一类；
   - "AI"与"Yapay Zeka"混用（AI Anlamı、AI ses sentezi、AI çevirisi、AI oynatma ↔ Yapay Zeka Okuma / Telaffuzu / Söz Dizimi）；"Söz Dizimi"与"Sözdizimi"混用（`get_syntax_explanation_button` ↔ `label_syntax_explanations`），TDK 写"söz dizimi"；
   - `tip_swipe_to_translate`「Herhangi bir metne sağa kaydırarak çevirisini göster.」语法不通（建议"Çevirisini görmek için herhangi bir metni sağa kaydırın."）；
   - `limit_reached_title`「Limit Raporlandı」意思是"已报告限额"（应为"Sınıra Ulaşıldı"）；`subscribed_user_message`「Abone olmuş bir kullanıcıyız」人称错成"我们"（应为"…kullanıcısınız"）；
   - 虚线下划线样式有两个译名：`Dashed Underline`「Kesikli Alt Çizgi」↔ `translation_style_*_underline_dashed`「Kesme Çizgili Alt Çizgi」；
   - 小问题：`delete_bookmark_button`「Yer İmi Sil」应为"Yer İmini Sil"，`view_bookmarks_button`「Yer İmleri Görüntüle」应为"Yer İmlerini Görüntüle"，`user_type_plus %@`「Plus Kullanıcı」应为"Plus Kullanıcısı"。
9. **母语审校（R36，T3 上线后补）**：建议审校人重点看 §5 的 13 处，以及"dil öğrenenler""okuma asistanı""web okuma"这三个定位用词是否自然。

## 附录 A：建议的 tr lint 词表（`docs/redesign-2026/ops/m3/tr-lint.json`）

- 覆盖 `claims-lint.json` 里所有有按语言写法的规则（25 条）；`selection-translate`、`jargon` 已有 tr，`io-home`、`engine-claim` 只有 `*`，均跳过。另有 `keywordMap.seOwned / seOwnedLead / reservedG1`。
- 自测（副本）：合入后 `node build.mjs` 0 error，tr 文案 0 命中（L-14、L-9、D-8 都通过）；下面每条规则至少命中一个反例，14 句正常文案 0 误报。

| 规则 | 反例句（全部命中） |
|---|---|
| whole-page | WordByWord sayfanın tamamını tek dokunuşla çevirir. ／ Tüm web sayfasını bir kerede çevirin. ／ Tam sayfa çeviri desteği. |
| swipe-left | Çeviri için paragrafı sola kaydırın. |
| safari-extension | WordByWord bir Safari uzantısı olarak çalışır. ／ Herhangi bir uygulamada metni çevirin. ／ Uygulama değiştirmeden çeviri yapın. |
| offline | Çevrimdışı çeviri yapabilirsiniz. ／ İnternet olmadan çalışır. |
| unlimited-ai-voice | Plus ile sınırsız yapay zekâ telaffuzu. ／ Yapay zeka sesli okuma sınırsız. |
| dark-mode-theme | Karanlık mod ve özel temalar. ／ Tema rengini değiştirin. |
| shortcuts-volume | Klavye kısayolları ve ses seviyesi ayarı. |
| vocab-sync | Kelime defterinize ekleyin ve flash kartlarla çalışın. ／ iCloud senkronizasyonu ile tüm cihazlarda. ／ Aralıklı tekrar ile ezberleyin. |
| android | Android sürümü yakında. ／ Google Play’den indirin. |
| desktop-version | WordByWord’ün masaüstü sürümü var. ／ Windows için indirin. |
| x-app | X uygulamasında gönderileri çevirin. |
| plus-early-access | Plus aboneleri yeni özelliklere erken erişim kazanır. |
| privacy-claim | Kişisel veriler toplanmaz. ／ Hiçbir kişisel veri saklamıyoruz. |
| initial-version | İlk sürümde 20’den fazla dil çifti desteklenir. |
| language-pairs | 20 dil çifti arasında çeviri. |
| style-count | 8 farklı stil arasından seçin. ／ Sekiz çeviri stili. |
| auto-detect-target | Uygulama hedef dili otomatik algılar. |
| history-by-date | Geçmiş tarihe göre gruplanır. |
| plus-only | Söz dizimi analizi yalnızca Plus kullanıcıları içindir. ／ Bu özellik Plus’a özel. |
| speaking-practice | Dinleme ve konuşma becerilerinizi geliştirin. ／ Telaffuz pratiği yapın. |
| replacement-tone | SurfEnglish size daha uygun olabilir.（文档 04 T10） ／ WordByWord yerine SurfEnglish kullanın. ／ Kardeş uygulamamız SurfEnglish. |
| se-on-device-voice | Cihaz üzerinde çalışan yapay zekâ sesi. ／ Çevrimdışı çalışan ses. |
| se-hype | Yeni: SurfEnglish. ／ Daha hızlı öğrenin. ／ SurfEnglish’e yükseltin. |
| hype | Dünyanın en iyi çeviri uygulaması. ／ Devrimsel bir okuma deneyimi. ／ 1 milyon kullanıcı. ／ WordByWord ekibi olarak. |
| ext-language-count | Uzantı 20’den fazla dile çevirir. ／ 25 dilde çeviri. |
| seOwned | İngilizce öğrenmek için web sayfası çeviri uygulaması ／ ingilizce haberler iki dilde ／ İngilizce okuma uygulaması ／ Parça Çıkarma ile iPhone’da çeviri |
| seOwnedLead | İngilizce öğrenin: haberleri iki dilde okuyun ／ İngilizce mi öğreniyorsunuz? SurfEnglish’i deneyin |
| reserved.G1 | iPhone’da web sayfası nasıl çevrilir? ／ Orijinali koruyarak web sayfası çevirme ／ Adım adım iPhone’da çeviri ／ Web sayfasını çevirme yöntemi |

- 不误报的正常文案（节选）：H1、eyebrow、`cta.title`、价格 H2（"…Plus’a yükseltin"：`se-hype` 的"yükselt"只作用于 SE 区块，规则自带 `only`）、"Sayfanın geri kalanı orijinal dilinde kalır."、"Cümlenin tamamını okur."、"X (eski adıyla Twitter)"、"Tekrar oyunları"、"Türkçeye çeviri yapılabilir"。
- 提醒：`hype` 的"en iyi"、`replacement-tone` 的"daha uygun"在别的语境里也可能出现（如"en iyi sonuç için"），合入前请母语审校再看一遍；tr 文案目前都没用到。
- glossary `banned` 的 8 条（左滑、鼠标"çift tık"、单击查词、"çift dokunuşla çeviri"、"Parça Çıkarımı"、不加引号的"AI Okuma"、"arama geçmişi"、"sözcük"）也用反例测过，各至少命中 1 句、正常文案 0 命中。

## 附录 B：验证记录

| 命令（最终副本 = HEAD `78b1856` + tr.json + glossary/tr.json；工作区副本与纯 HEAD 副本各跑一遍，结果相同；`og.mjs` 只在副本里跑） | 结果 |
|---|---|
| `node scripts/og.mjs --only home-tr` | ✓ 标题 64 px × 3 行、副标题 30 px × 2 行、150.5 KB |
| `node build.mjs --out …/dist`（数据文件 = 真实仓库原文件） | 0 error；tr 3 条 W：L-4（7 个相同值）、L-14（24 条规则未覆盖）、L-9（无 tr 的 G1 模式） |
| `node build.mjs --out …/dist-lint`（副本合入附录 A 词表） | 0 error；tr 只剩 L-4 |
| `node build.mjs --pseudo` | 0 error |
| `node scripts/check.mjs --dist …/dist` | 0 error / 0 warning |
| `node scripts/check.mjs --keys tr` | 0 missing / 0 not in en |
| `node --test scripts/tests/*.test.mjs` | 62/62 通过（此前在 `85bf857` 上 58/58、`7925eb9` 上 60/60） |
| 一次性副本（`dom.mjs` 修复前）：含 `İ` 的 `ogImageAlt` | D-9 error（复现缺陷）；套用一行修复后 0 error、测试 58/58；`78b1856` 已含该修复 |
| headless Chrome 1280 / 390 / 375 / 320 px | 无横向溢出；SE 卡片 393 / 453 / 474 / 547 px；390 px 页面 12,993 px；320 px 价格表 286 px，完整 |

长度实测（占位符代入后；拉丁字符数）：title 53、description 160、H1 75、eyebrow 52、lede 78、how 179、platformNote 114、ctaNote 33、功能 kicker ≤ 24（lookup 正好 24）、功能 H3 ≤ 70、规格清单 4 条 76–80、`languages.title` 43、`pricing.summary` 99、`cta.title` 51、`cta.recap` 71、SE 卡片 H2 47 / body 22 词 / 要点 45·44·40 / linkText 65 / appStoreLinkText 35、所有 alt ≤ 125（最长 124）。
