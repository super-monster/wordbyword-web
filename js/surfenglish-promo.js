/*
 * SurfEnglish cross-promotion for word-by-word.app
 * ------------------------------------------------
 * Injects two things, localized from the page filename / <html lang>:
 *   1. a dismissible announcement bar pinned above the site header, and
 *   2. a promo section (app icon, headline, screenshots, App Store badge and
 *      surfenglish.app link) inserted right after the hero (#hero).
 *
 * Styles: css/surfenglish-promo.css · Assets: img/surfenglish/
 * Switch off with CONFIG.enabled = false, or tune showBar / showSection.
 */
(function () {
  'use strict';

  const CONFIG = {
    enabled: true,
    showBar: true,
    showSection: true,
    sectionAfter: '#hero',   // the promo section is inserted right after this element
    dismissDays: 7,          // a dismissed bar stays hidden this long (per browser)
    appStoreUrl: 'https://apps.apple.com/app/id6787367021',
    siteUrl: 'https://surfenglish.app/',
    utm: 'utm_source=word-by-word.app&utm_medium=referral&utm_campaign=surfenglish_launch',
    badgeBase: 'https://toolbox.marketingtools.apple.com/api/badges/download-on-the-app-store/black/',
    storageKey: 'wbw.surfenglishPromo.dismissedAt',
  };

  // Screenshots shown in the promo section (relative to img/surfenglish/).
  const SHOTS = ['feed.jpg', 'translate.jpg', 'word-raid.jpg'];

  // Page filename → locale (mirrors site-notice.js). Anything else falls back to <html lang>.
  const FILENAME_LOCALE = {
    'ar-top.html': 'ar',
    'cn-top.html': 'zh-CN',
    'zh-top.html': 'zh-CN',
    'tw-top.html': 'zh-TW',
    'de-top.html': 'de',
    'en-top.html': 'en',
    'es-top.html': 'es',
    'fr-top.html': 'fr',
    'hi-top.html': 'hi',
    'id-top.html': 'id',
    'it-top.html': 'it',
    'ja-top.html': 'ja',
    'ko-top.html': 'ko',
    'nl-top.html': 'nl',
    'pl-top.html': 'pl',
    'pt-top.html': 'pt',
    'ru-top.html': 'ru',
    'th-top.html': 'th',
    'tr-top.html': 'tr',
    'uk-top.html': 'uk',
    'vi-top.html': 'vi',
  };

  // Copy per locale.
  //   sitePath — localized surfenglish.app page ('' = English root)
  //   badge    — Apple badge locale code (unknown codes fall back to English artwork)
  const I18N = {
    en: {
      sitePath: '', badge: 'en-us', label: 'New',
      bar: {
        text: 'New from the WordByWord team: <strong>SurfEnglish</strong> — learn English faster by reading real articles.',
        short: 'New: <strong>SurfEnglish</strong> — learn English faster by reading real articles',
        cta: 'App Store', more: 'Learn more', close: 'Dismiss',
      },
      promo: {
        eyebrow: 'New · From the makers of WordByWord',
        tagline: 'Surf the web, learn English.',
        title: 'Learn English by reading what you actually enjoy.',
        lead: 'SurfEnglish turns real articles, X posts and podcasts into daily English practice. Swipe a sentence to translate it in place, double-tap a word for its meaning in context, listen with an on-device AI voice — and play games built from what you read. Free on iPhone.',
        chips: ['Real articles, graded A1–C1', 'Swipe to translate · Double-tap to look up', 'On-device AI voice, works offline', 'Games built from your reading'],
        site: 'Visit surfenglish.app',
        note: 'Free to start · App in 12 languages · Translates into 21 languages',
        store: 'Download on the App Store',
        alts: ['SurfEnglish home feed: real English articles with difficulty levels', 'Swipe a sentence to see its translation inline', 'Word Raid — a retro arcade game built from the words you looked up'],
      },
    },
    'zh-CN': {
      sitePath: 'zh-hans/', badge: 'zh-cn', label: '新上线',
      bar: {
        text: 'WordByWord 团队新作：<strong>SurfEnglish</strong> —— 读真实英语文章，更高效地学英语。',
        short: '<strong>SurfEnglish</strong> 新上线 —— 读真实文章，更高效学英语',
        cta: 'App Store 下载', more: '了解更多', close: '关闭',
      },
      promo: {
        eyebrow: '新上线 · 来自 WordByWord 团队',
        tagline: '边冲浪，边学英语',
        title: '读你真正感兴趣的内容，更高效地学英语。',
        lead: 'SurfEnglish 把真实的英语文章、X 帖子和播客变成每天的英语练习：右滑翻译整句、双击查看单词在语境中的含义、本地 AI 语音朗读，读过的内容还会自动生成单词游戏。iPhone 免费下载。',
        chips: ['真实文章，A1–C1 难度分级', '右滑翻译 · 双击查词', '本地 AI 语音，离线可用', '游戏由你读过的内容生成'],
        site: '访问官网 surfenglish.app',
        note: '免费开始 · 应用界面 12 种语言 · 可译成 21 种语言',
        store: '在 App Store 下载',
        alts: ['SurfEnglish 首页信息流：带难度等级的真实英语文章', '右滑一句，译文就在原文下方出现', 'Word Raid —— 由你查过的单词生成的复古街机游戏'],
      },
    },
    'zh-TW': {
      sitePath: 'zh-hant/', badge: 'zh-tw', label: '新上線',
      bar: {
        text: 'WordByWord 團隊新作：<strong>SurfEnglish</strong> —— 讀真實英文文章，更有效率地學英語。',
        short: '<strong>SurfEnglish</strong> 新上線 —— 讀真實文章，學英語更有效率',
        cta: 'App Store 下載', more: '了解更多', close: '關閉',
      },
      promo: {
        eyebrow: '新上線 · 來自 WordByWord 團隊',
        tagline: '邊衝浪，邊學英語',
        title: '讀你真正感興趣的內容，更有效率地學英語。',
        lead: 'SurfEnglish 把真實的英文文章、X 貼文和 Podcast 變成每天的英語練習：右滑翻譯整句、雙擊查看單字在語境中的意思、裝置端 AI 語音朗讀，讀過的內容還會自動變成單字遊戲。iPhone 免費下載。',
        chips: ['真實文章，A1–C1 難度分級', '右滑翻譯 · 雙擊查詞', '裝置端 AI 語音，離線可用', '遊戲由你讀過的內容生成'],
        site: '前往官網 surfenglish.app',
        note: '免費開始 · 介面支援 12 種語言 · 可翻譯成 21 種語言',
        store: '在 App Store 下載',
        alts: ['SurfEnglish 首頁動態：帶難度等級的真實英文文章', '右滑一句，譯文就出現在原文下方', 'Word Raid —— 由你查過的單字生成的復古街機遊戲'],
      },
    },
    ja: {
      sitePath: 'ja/', badge: 'ja-jp', label: 'New',
      bar: {
        text: 'WordByWordチームの新作 <strong>SurfEnglish</strong> — 本物の英文記事を読んで、英語をもっと効率よく学ぼう。',
        short: '新登場 <strong>SurfEnglish</strong> — 本物の記事を読んで英語を学ぶ',
        cta: 'App Store', more: '詳しく見る', close: '閉じる',
      },
      promo: {
        eyebrow: '新登場 · WordByWordチームより',
        tagline: 'ネットの波に乗って、英語を学ぼう',
        title: '本当に興味のあるものを読んで、英語を身につける。',
        lead: 'SurfEnglishは、本物の英文記事・Xの投稿・ポッドキャストを毎日の英語学習に変えるアプリ。スワイプで文をその場で翻訳、ダブルタップで文脈に合った単語の意味を表示、端末内AI音声で読み上げ。読んだ内容からゲームが自動生成されます。iPhoneで無料。',
        chips: ['本物の記事、A1–C1のレベル表示', 'スワイプで翻訳 · ダブルタップで単語検索', '端末内AI音声、オフライン対応', '読んだ内容から生まれるゲーム'],
        site: '公式サイト surfenglish.app へ',
        note: '無料で始められる · アプリは12言語対応 · 21言語に翻訳',
        store: 'App Storeでダウンロード',
        alts: ['SurfEnglishのホームフィード：難易度付きの本物の英文記事', '文をスワイプすると、その場に翻訳が表示', 'Word Raid — 調べた単語から作られるレトロなアーケードゲーム'],
      },
    },
    ko: {
      sitePath: 'ko/', badge: 'ko-kr', label: 'New',
      bar: {
        text: 'WordByWord 팀의 새 앱 <strong>SurfEnglish</strong> — 진짜 영어 기사를 읽으며 더 효율적으로 영어를 배우세요.',
        short: '새 앱 <strong>SurfEnglish</strong> — 진짜 기사를 읽으며 영어 배우기',
        cta: 'App Store', more: '자세히 보기', close: '닫기',
      },
      promo: {
        eyebrow: '새로 출시 · WordByWord 팀',
        tagline: '웹서핑하며 영어 배우기',
        title: '정말 흥미로운 글을 읽으며 영어를 배우세요.',
        lead: 'SurfEnglish는 진짜 영어 기사, X 포스트, 팟캐스트를 매일의 영어 연습으로 바꿉니다. 문장을 밀어 그 자리에서 번역하고, 단어를 두 번 탭해 문맥 속 뜻을 확인하고, 온디바이스 AI 음성으로 들어 보세요. 읽은 내용은 게임이 됩니다. iPhone에서 무료.',
        chips: ['진짜 기사, A1–C1 난이도 표시', '밀어서 번역 · 두 번 탭으로 단어 찾기', '온디바이스 AI 음성, 오프라인 지원', '읽은 내용으로 만들어지는 게임'],
        site: '공식 사이트 surfenglish.app',
        note: '무료로 시작 · 12개 언어 인터페이스 · 21개 언어로 번역',
        store: 'App Store에서 다운로드',
        alts: ['SurfEnglish 홈 피드: 난이도가 표시된 진짜 영어 기사', '문장을 밀면 번역이 바로 아래에 표시', 'Word Raid — 찾아본 단어로 만들어지는 레트로 아케이드 게임'],
      },
    },
    es: {
      sitePath: 'es/', badge: 'es-es', label: 'Nuevo',
      bar: {
        text: 'Nuevo del equipo de WordByWord: <strong>SurfEnglish</strong> — aprende inglés más rápido leyendo artículos reales.',
        short: 'Nuevo: <strong>SurfEnglish</strong> — aprende inglés leyendo artículos reales',
        cta: 'App Store', more: 'Saber más', close: 'Cerrar',
      },
      promo: {
        eyebrow: 'Nuevo · De los creadores de WordByWord',
        tagline: 'Surfea la web, aprende inglés.',
        title: 'Aprende inglés leyendo lo que de verdad te interesa.',
        lead: 'SurfEnglish convierte artículos reales, posts de X y podcasts en tu práctica diaria de inglés. Desliza una frase para traducirla en el momento, toca dos veces una palabra para ver su significado en contexto, escucha con una voz de IA en tu dispositivo y repasa con juegos creados a partir de lo que lees. Gratis en iPhone.',
        chips: ['Artículos reales, niveles A1–C1', 'Desliza para traducir · Toca dos veces para consultar', 'Voz de IA en el dispositivo, funciona sin conexión', 'Juegos creados a partir de tus lecturas'],
        site: 'Visita surfenglish.app',
        note: 'Gratis para empezar · App en 12 idiomas · Traduce a 21 idiomas',
        store: 'Descárgalo en el App Store',
        alts: ['Feed de inicio de SurfEnglish: artículos reales en inglés con nivel de dificultad', 'Desliza una frase para ver su traducción integrada', 'Word Raid: un juego arcade retro creado con las palabras que consultaste'],
      },
    },
    pt: {
      sitePath: 'pt-br/', badge: 'pt-br', label: 'Novo',
      bar: {
        text: 'Novo do time do WordByWord: <strong>SurfEnglish</strong> — aprenda inglês mais rápido lendo artigos de verdade.',
        short: 'Novo: <strong>SurfEnglish</strong> — aprenda inglês lendo artigos de verdade',
        cta: 'App Store', more: 'Saiba mais', close: 'Fechar',
      },
      promo: {
        eyebrow: 'Novo · Dos criadores do WordByWord',
        tagline: 'Surfe na web, aprenda inglês.',
        title: 'Aprenda inglês lendo o que realmente interessa a você.',
        lead: 'O SurfEnglish transforma artigos reais, posts do X e podcasts em treino diário de inglês. Deslize uma frase para traduzi-la na hora, toque duas vezes em uma palavra para ver o significado no contexto, ouça com uma voz de IA no aparelho e revise com jogos criados a partir do que você leu. Grátis no iPhone.',
        chips: ['Artigos reais, níveis A1–C1', 'Deslize para traduzir · Toque duas vezes para consultar', 'Voz de IA no aparelho, funciona offline', 'Jogos criados a partir da sua leitura'],
        site: 'Acesse surfenglish.app',
        note: 'Comece grátis · App em 12 idiomas · Traduz para 21 idiomas',
        store: 'Baixar na App Store',
        alts: ['Feed inicial do SurfEnglish: artigos reais em inglês com nível de dificuldade', 'Deslize uma frase para ver a tradução logo abaixo', 'Word Raid — um jogo arcade retrô criado com as palavras que você consultou'],
      },
    },
    vi: {
      sitePath: 'vi/', badge: 'vi-vn', label: 'Mới',
      bar: {
        text: 'Mới từ đội ngũ WordByWord: <strong>SurfEnglish</strong> — học tiếng Anh hiệu quả hơn bằng cách đọc bài báo thật.',
        short: 'Mới: <strong>SurfEnglish</strong> — học tiếng Anh qua bài báo thật',
        cta: 'App Store', more: 'Tìm hiểu thêm', close: 'Đóng',
      },
      promo: {
        eyebrow: 'Mới · Từ đội ngũ làm ra WordByWord',
        tagline: 'Lướt web, học tiếng Anh.',
        title: 'Học tiếng Anh bằng cách đọc những gì bạn thực sự thích.',
        lead: 'SurfEnglish biến bài báo thật, bài đăng trên X và podcast thành bài luyện tiếng Anh mỗi ngày. Vuốt một câu để dịch ngay tại chỗ, chạm hai lần vào từ để xem nghĩa trong ngữ cảnh, nghe bằng giọng AI chạy trên máy, và ôn lại bằng trò chơi tạo từ chính những gì bạn đã đọc. Miễn phí trên iPhone.',
        chips: ['Bài báo thật, phân cấp A1–C1', 'Vuốt để dịch · Chạm hai lần để tra từ', 'Giọng AI trên máy, dùng được ngoại tuyến', 'Trò chơi tạo từ nội dung bạn đã đọc'],
        site: 'Truy cập surfenglish.app',
        note: 'Bắt đầu miễn phí · Ứng dụng có 12 ngôn ngữ · Dịch sang 21 ngôn ngữ',
        store: 'Tải về trên App Store',
        alts: ['Trang chủ SurfEnglish: bài báo tiếng Anh thật kèm mức độ khó', 'Vuốt một câu để xem bản dịch ngay bên dưới', 'Word Raid — trò chơi arcade cổ điển tạo từ những từ bạn đã tra'],
      },
    },
    id: {
      sitePath: 'id/', badge: 'id-id', label: 'Baru',
      bar: {
        text: 'Baru dari tim WordByWord: <strong>SurfEnglish</strong> — belajar bahasa Inggris lebih efektif dengan membaca artikel asli.',
        short: 'Baru: <strong>SurfEnglish</strong> — belajar bahasa Inggris lewat artikel asli',
        cta: 'App Store', more: 'Pelajari lebih lanjut', close: 'Tutup',
      },
      promo: {
        eyebrow: 'Baru · Dari pembuat WordByWord',
        tagline: 'Berselancar di web, belajar bahasa Inggris.',
        title: 'Belajar bahasa Inggris dengan membaca hal yang benar-benar kamu sukai.',
        lead: 'SurfEnglish mengubah artikel asli, postingan X, dan podcast menjadi latihan bahasa Inggris harian. Geser kalimat untuk langsung menerjemahkannya, ketuk dua kali sebuah kata untuk melihat artinya sesuai konteks, dengarkan dengan suara AI on-device, lalu ulas lewat game yang dibuat dari bacaanmu. Gratis di iPhone.',
        chips: ['Artikel asli, level A1–C1', 'Geser untuk menerjemahkan · Ketuk dua kali untuk arti kata', 'Suara AI on-device, bisa offline', 'Game yang dibuat dari bacaanmu'],
        site: 'Kunjungi surfenglish.app',
        note: 'Gratis untuk memulai · Aplikasi dalam 12 bahasa · Menerjemahkan ke 21 bahasa',
        store: 'Unduh di App Store',
        alts: ['Beranda SurfEnglish: artikel bahasa Inggris asli dengan tingkat kesulitan', 'Geser kalimat untuk melihat terjemahannya tepat di bawah', 'Word Raid — game arcade retro yang dibuat dari kata-kata yang kamu cari'],
      },
    },
    th: {
      sitePath: 'th/', badge: 'th-th', label: 'ใหม่',
      bar: {
        text: 'ใหม่จากทีม WordByWord: <strong>SurfEnglish</strong> — เรียนภาษาอังกฤษได้ผลกว่าเดิมด้วยการอ่านบทความจริง',
        short: 'ใหม่: <strong>SurfEnglish</strong> — เรียนภาษาอังกฤษจากบทความจริง',
        cta: 'App Store', more: 'ดูเพิ่มเติม', close: 'ปิด',
      },
      promo: {
        eyebrow: 'ใหม่ · จากทีมผู้สร้าง WordByWord',
        tagline: 'ท่องเว็บไปพร้อมกับฝึกภาษาอังกฤษ',
        title: 'เรียนภาษาอังกฤษจากเรื่องที่คุณอยากอ่านจริง ๆ',
        lead: 'SurfEnglish เปลี่ยนบทความจริง โพสต์บน X และพอดแคสต์ให้เป็นการฝึกภาษาอังกฤษประจำวัน ปัดประโยคเพื่อแปลทันทีตรงนั้น แตะสองครั้งที่คำเพื่อดูความหมายตามบริบท ฟังเสียง AI ที่ทำงานบนเครื่อง แล้วทบทวนด้วยเกมที่สร้างจากสิ่งที่คุณอ่าน ฟรีบน iPhone',
        chips: ['บทความจริง แบ่งระดับ A1–C1', 'ปัดเพื่อแปล · แตะสองครั้งเพื่อดูคำศัพท์', 'เสียง AI บนเครื่อง ใช้ออฟไลน์ได้', 'เกมที่สร้างจากสิ่งที่คุณอ่าน'],
        site: 'ไปที่ surfenglish.app',
        note: 'เริ่มต้นใช้ฟรี · แอปรองรับ 12 ภาษา · แปลได้ 21 ภาษา',
        store: 'ดาวน์โหลดบน App Store',
        alts: ['หน้าแรก SurfEnglish: บทความภาษาอังกฤษจริงพร้อมระดับความยาก', 'ปัดประโยคเพื่อดูคำแปลใต้ต้นฉบับ', 'Word Raid — เกมอาร์เคดย้อนยุคที่สร้างจากคำศัพท์ที่คุณค้นหา'],
      },
    },
    hi: {
      sitePath: 'hi/', badge: 'hi-in', label: 'नया',
      bar: {
        text: 'WordByWord टीम का नया ऐप: <strong>SurfEnglish</strong> — असली आर्टिकल पढ़कर अंग्रेज़ी और तेज़ी से सीखें।',
        short: 'नया: <strong>SurfEnglish</strong> — असली आर्टिकल पढ़कर अंग्रेज़ी सीखें',
        cta: 'App Store', more: 'और जानें', close: 'बंद करें',
      },
      promo: {
        eyebrow: 'नया · WordByWord बनाने वाली टीम से',
        tagline: 'वेब पर सर्फ करें, अंग्रेज़ी सीखें',
        title: 'वही पढ़ें जो आपको सच में पसंद है — और अंग्रेज़ी सीखते जाएँ।',
        lead: 'SurfEnglish असली आर्टिकल, X पोस्ट और पॉडकास्ट को रोज़ की अंग्रेज़ी प्रैक्टिस में बदल देता है। वाक्य पर स्वाइप करें और वहीं अनुवाद पाएँ, शब्द पर डबल-टैप करके संदर्भ के अनुसार मतलब देखें, डिवाइस पर चलने वाली AI आवाज़ से सुनें, और अपने पढ़े हुए से बने गेम्स के साथ दोहराएँ। iPhone पर मुफ़्त।',
        chips: ['असली आर्टिकल, A1–C1 स्तर', 'स्वाइप से अनुवाद · डबल-टैप से मतलब', 'डिवाइस पर AI आवाज़, ऑफ़लाइन भी', 'आपके पढ़े हुए से बने गेम्स'],
        site: 'surfenglish.app पर जाएँ',
        note: 'शुरुआत मुफ़्त · ऐप 12 भाषाओं में · 21 भाषाओं में अनुवाद',
        store: 'App Store से डाउनलोड करें',
        alts: ['SurfEnglish होम फ़ीड: कठिनाई स्तर के साथ असली अंग्रेज़ी आर्टिकल', 'वाक्य पर स्वाइप करें और अनुवाद ठीक नीचे देखें', 'Word Raid — आपके खोजे गए शब्दों से बना रेट्रो आर्केड गेम'],
      },
    },
    ar: {
      sitePath: 'ar/', badge: 'ar-sa', label: 'جديد', dir: 'rtl',
      bar: {
        text: 'جديد من فريق WordByWord: <strong>SurfEnglish</strong> — تعلَّم الإنجليزية بكفاءة أعلى عبر قراءة مقالات حقيقية.',
        short: 'جديد: <strong>SurfEnglish</strong> — تعلَّم الإنجليزية بقراءة مقالات حقيقية',
        cta: 'App Store', more: 'اعرف المزيد', close: 'إغلاق',
      },
      promo: {
        eyebrow: 'جديد · من صنّاع WordByWord',
        tagline: 'تصفَّح الويب وتعلَّم الإنجليزية',
        title: 'تعلَّم الإنجليزية بقراءة ما يعجبك فعلًا.',
        lead: 'يحوّل SurfEnglish المقالات الحقيقية ومنشورات X والبودكاست إلى تمرين يومي في الإنجليزية. اسحب الجملة لترجمتها في مكانها، وانقر مرتين على أي كلمة لمعرفة معناها في سياقها، واستمع بصوت ذكاء اصطناعي يعمل على جهازك، ثم راجع بألعاب مبنية مما قرأت. مجانًا على iPhone.',
        chips: ['مقالات حقيقية بمستويات A1–C1', 'اسحب للترجمة · انقر مرتين للمعنى', 'صوت ذكاء اصطناعي على الجهاز، يعمل دون إنترنت', 'ألعاب مبنية مما تقرأ'],
        site: 'زُر surfenglish.app',
        note: 'ابدأ مجانًا · التطبيق بـ 12 لغة · يترجم إلى 21 لغة',
        store: 'تنزيل من App Store',
        alts: ['الصفحة الرئيسية في SurfEnglish: مقالات إنجليزية حقيقية مع مستوى الصعوبة', 'اسحب جملة لترى ترجمتها أسفلها مباشرة', 'Word Raid — لعبة أركيد كلاسيكية مبنية من الكلمات التي بحثت عنها'],
      },
    },
    de: {
      sitePath: '', badge: 'de-de', label: 'Neu',
      bar: {
        text: 'Neu vom WordByWord-Team: <strong>SurfEnglish</strong> — Englisch schneller lernen, indem du echte Artikel liest.',
        short: 'Neu: <strong>SurfEnglish</strong> — Englisch lernen mit echten Artikeln',
        cta: 'App Store', more: 'Mehr erfahren', close: 'Schließen',
      },
      promo: {
        eyebrow: 'Neu · Von den Machern von WordByWord',
        tagline: 'Surfe im Web, lerne Englisch.',
        title: 'Lerne Englisch mit Texten, die dich wirklich interessieren.',
        lead: 'SurfEnglish macht aus echten Artikeln, X-Posts und Podcasts dein tägliches Englischtraining. Wische über einen Satz, um ihn direkt an Ort und Stelle zu übersetzen, tippe doppelt auf ein Wort für seine Bedeutung im Kontext, lass dir Texte von einer KI-Stimme auf dem Gerät vorlesen — und wiederhole mit Spielen, die aus deiner Lektüre entstehen. Kostenlos fürs iPhone.',
        chips: ['Echte Artikel, Niveau A1–C1', 'Wischen zum Übersetzen · Doppeltippen zum Nachschlagen', 'KI-Stimme auf dem Gerät, auch offline', 'Spiele aus dem, was du liest'],
        site: 'surfenglish.app besuchen',
        note: 'Kostenlos starten · App in 12 Sprachen · Übersetzt in 21 Sprachen',
        store: 'Laden im App Store',
        alts: ['SurfEnglish-Startseite: echte englische Artikel mit Schwierigkeitsgrad', 'Über einen Satz wischen und die Übersetzung direkt darunter sehen', 'Word Raid — ein Retro-Arcade-Spiel aus den Wörtern, die du nachgeschlagen hast'],
      },
    },
    fr: {
      sitePath: '', badge: 'fr-fr', label: 'Nouveau',
      bar: {
        text: 'Nouveau de l’équipe WordByWord : <strong>SurfEnglish</strong> — apprenez l’anglais plus vite en lisant de vrais articles.',
        short: 'Nouveau : <strong>SurfEnglish</strong> — apprenez l’anglais avec de vrais articles',
        cta: 'App Store', more: 'En savoir plus', close: 'Fermer',
      },
      promo: {
        eyebrow: 'Nouveau · Par les créateurs de WordByWord',
        tagline: 'Surfez sur le web, apprenez l’anglais.',
        title: 'Apprenez l’anglais en lisant ce qui vous intéresse vraiment.',
        lead: 'SurfEnglish transforme de vrais articles, des posts X et des podcasts en entraînement quotidien à l’anglais. Balayez une phrase pour la traduire sur place, touchez deux fois un mot pour voir son sens dans le contexte, écoutez avec une voix IA embarquée sur votre appareil, puis révisez avec des jeux créés à partir de vos lectures. Gratuit sur iPhone.',
        chips: ['De vrais articles, niveaux A1–C1', 'Balayer pour traduire · Toucher deux fois pour chercher', 'Voix IA sur l’appareil, fonctionne hors ligne', 'Des jeux créés à partir de vos lectures'],
        site: 'Découvrir surfenglish.app',
        note: 'Gratuit pour commencer · App en 12 langues · Traduit vers 21 langues',
        store: 'Télécharger dans l’App Store',
        alts: ['Fil d’accueil SurfEnglish : de vrais articles en anglais avec niveau de difficulté', 'Balayez une phrase pour afficher sa traduction juste en dessous', 'Word Raid — un jeu d’arcade rétro créé à partir des mots que vous avez cherchés'],
      },
    },
    it: {
      sitePath: '', badge: 'it-it', label: 'Novità',
      bar: {
        text: 'Novità dal team di WordByWord: <strong>SurfEnglish</strong> — impara l’inglese più in fretta leggendo articoli veri.',
        short: 'Novità: <strong>SurfEnglish</strong> — impara l’inglese con articoli veri',
        cta: 'App Store', more: 'Scopri di più', close: 'Chiudi',
      },
      promo: {
        eyebrow: 'Novità · Dai creatori di WordByWord',
        tagline: 'Naviga sul web, impara l’inglese.',
        title: 'Impara l’inglese leggendo ciò che ti interessa davvero.',
        lead: 'SurfEnglish trasforma articoli veri, post di X e podcast nel tuo allenamento quotidiano di inglese. Scorri una frase per tradurla sul posto, tocca due volte una parola per vederne il significato nel contesto, ascolta con una voce IA che gira sul dispositivo e ripassa con giochi creati da ciò che hai letto. Gratis su iPhone.',
        chips: ['Articoli veri, livelli A1–C1', 'Scorri per tradurre · Tocca due volte per cercare', 'Voce IA sul dispositivo, funziona offline', 'Giochi creati dalle tue letture'],
        site: 'Visita surfenglish.app',
        note: 'Gratis per iniziare · App in 12 lingue · Traduce in 21 lingue',
        store: 'Scarica su App Store',
        alts: ['Feed iniziale di SurfEnglish: articoli veri in inglese con livello di difficoltà', 'Scorri una frase per vederne la traduzione subito sotto', 'Word Raid — un gioco arcade retrò creato dalle parole che hai cercato'],
      },
    },
    nl: {
      sitePath: '', badge: 'nl-nl', label: 'Nieuw',
      bar: {
        text: 'Nieuw van het WordByWord-team: <strong>SurfEnglish</strong> — leer sneller Engels door echte artikelen te lezen.',
        short: 'Nieuw: <strong>SurfEnglish</strong> — leer Engels met echte artikelen',
        cta: 'App Store', more: 'Meer info', close: 'Sluiten',
      },
      promo: {
        eyebrow: 'Nieuw · Van de makers van WordByWord',
        tagline: 'Surf op het web, leer Engels.',
        title: 'Leer Engels door te lezen wat je écht interessant vindt.',
        lead: 'SurfEnglish maakt van echte artikelen, X-posts en podcasts je dagelijkse Engelse oefening. Veeg over een zin om die ter plekke te vertalen, tik dubbel op een woord voor de betekenis in context, luister met een AI-stem die op je toestel draait en herhaal met games die uit je eigen leesvoer ontstaan. Gratis op iPhone.',
        chips: ['Echte artikelen, niveau A1–C1', 'Vegen om te vertalen · Dubbeltikken om op te zoeken', 'AI-stem op het toestel, werkt offline', 'Games gemaakt van wat je leest'],
        site: 'Bezoek surfenglish.app',
        note: 'Gratis te beginnen · App in 12 talen · Vertaalt naar 21 talen',
        store: 'Download in de App Store',
        alts: ['SurfEnglish-startfeed: echte Engelse artikelen met moeilijkheidsgraad', 'Veeg over een zin en zie de vertaling er direct onder', 'Word Raid — een retro arcadegame gemaakt van de woorden die je opzocht'],
      },
    },
    pl: {
      sitePath: '', badge: 'pl-pl', label: 'Nowość',
      bar: {
        text: 'Nowość od zespołu WordByWord: <strong>SurfEnglish</strong> — ucz się angielskiego szybciej, czytając prawdziwe artykuły.',
        short: 'Nowość: <strong>SurfEnglish</strong> — ucz się angielskiego z prawdziwych artykułów',
        cta: 'App Store', more: 'Dowiedz się więcej', close: 'Zamknij',
      },
      promo: {
        eyebrow: 'Nowość · Od twórców WordByWord',
        tagline: 'Surfuj po sieci, ucz się angielskiego.',
        title: 'Ucz się angielskiego, czytając to, co naprawdę Cię interesuje.',
        lead: 'SurfEnglish zamienia prawdziwe artykuły, posty z X i podcasty w codzienną praktykę angielskiego. Przesuń zdanie, by przetłumaczyć je na miejscu, stuknij dwukrotnie słowo, by zobaczyć jego znaczenie w kontekście, słuchaj głosu AI działającego na Twoim urządzeniu i powtarzaj w grach tworzonych z tego, co czytasz. Za darmo na iPhone.',
        chips: ['Prawdziwe artykuły, poziomy A1–C1', 'Przesuń, by przetłumaczyć · Stuknij dwukrotnie, by sprawdzić', 'Głos AI na urządzeniu, działa offline', 'Gry tworzone z tego, co czytasz'],
        site: 'Odwiedź surfenglish.app',
        note: 'Zacznij za darmo · Aplikacja w 12 językach · Tłumaczy na 21 języków',
        store: 'Pobierz w App Store',
        alts: ['Strona główna SurfEnglish: prawdziwe artykuły po angielsku z poziomem trudności', 'Przesuń zdanie, by zobaczyć tłumaczenie tuż pod nim', 'Word Raid — retro gra zręcznościowa zbudowana ze słów, które sprawdzałeś'],
      },
    },
    ru: {
      sitePath: '', badge: 'ru-ru', label: 'Новое',
      bar: {
        text: 'Новинка от команды WordByWord: <strong>SurfEnglish</strong> — учите английский быстрее, читая настоящие статьи.',
        short: 'Новинка: <strong>SurfEnglish</strong> — английский по настоящим статьям',
        cta: 'App Store', more: 'Подробнее', close: 'Закрыть',
      },
      promo: {
        eyebrow: 'Новинка · От создателей WordByWord',
        tagline: 'Сёрфи по сети, учи английский.',
        title: 'Учите английский, читая то, что вам действительно интересно.',
        lead: 'SurfEnglish превращает настоящие статьи, посты из X и подкасты в ежедневную практику английского. Проведите по предложению, чтобы перевести его на месте, дважды коснитесь слова, чтобы увидеть его значение в контексте, слушайте ИИ-голос, работающий прямо на устройстве, и повторяйте в играх, собранных из того, что вы прочитали. Бесплатно на iPhone.',
        chips: ['Настоящие статьи, уровни A1–C1', 'Свайп — перевод · Двойное касание — значение', 'ИИ-голос на устройстве, работает офлайн', 'Игры из того, что вы читаете'],
        site: 'Открыть surfenglish.app',
        note: 'Бесплатный старт · Приложение на 12 языках · Перевод на 21 язык',
        store: 'Загрузить в App Store',
        alts: ['Главная лента SurfEnglish: настоящие статьи на английском с уровнем сложности', 'Проведите по предложению — перевод появится прямо под ним', 'Word Raid — ретро-аркада из слов, которые вы искали'],
      },
    },
    tr: {
      sitePath: '', badge: 'tr-tr', label: 'Yeni',
      bar: {
        text: 'WordByWord ekibinden yeni: <strong>SurfEnglish</strong> — gerçek makaleler okuyarak İngilizceyi daha hızlı öğrenin.',
        short: 'Yeni: <strong>SurfEnglish</strong> — gerçek makalelerle İngilizce öğrenin',
        cta: 'App Store', more: 'Daha fazla bilgi', close: 'Kapat',
      },
      promo: {
        eyebrow: 'Yeni · WordByWord’ün yapımcılarından',
        tagline: 'Web’de gezin, İngilizce öğrenin.',
        title: 'Gerçekten ilginizi çeken şeyleri okuyarak İngilizce öğrenin.',
        lead: 'SurfEnglish gerçek makaleleri, X gönderilerini ve podcast’leri günlük İngilizce pratiğine dönüştürür. Bir cümleyi kaydırarak olduğu yerde çevirin, bir kelimeye çift dokunarak bağlamdaki anlamını görün, cihaz üzerinde çalışan yapay zekâ sesiyle dinleyin ve okuduklarınızdan oluşturulan oyunlarla tekrar edin. iPhone’da ücretsiz.',
        chips: ['Gerçek makaleler, A1–C1 seviyeleri', 'Kaydırarak çevir · Çift dokunarak sözlüğe bak', 'Cihaz üzerinde yapay zekâ sesi, çevrimdışı çalışır', 'Okuduklarınızdan oluşturulan oyunlar'],
        site: 'surfenglish.app’i ziyaret edin',
        note: 'Ücretsiz başlayın · 12 dilde uygulama · 21 dile çeviri',
        store: 'App Store’dan indirin',
        alts: ['SurfEnglish ana akışı: zorluk seviyeli gerçek İngilizce makaleler', 'Bir cümleyi kaydırın, çevirisi hemen altında belirsin', 'Word Raid — baktığınız kelimelerden oluşturulan retro bir atari oyunu'],
      },
    },
    uk: {
      sitePath: '', badge: 'uk-ua', label: 'Нове',
      bar: {
        text: 'Новинка від команди WordByWord: <strong>SurfEnglish</strong> — вивчайте англійську швидше, читаючи справжні статті.',
        short: 'Новинка: <strong>SurfEnglish</strong> — англійська за справжніми статтями',
        cta: 'App Store', more: 'Дізнатися більше', close: 'Закрити',
      },
      promo: {
        eyebrow: 'Новинка · Від творців WordByWord',
        tagline: 'Серфіть мережею, вивчайте англійську.',
        title: 'Вивчайте англійську, читаючи те, що вам справді цікаво.',
        lead: 'SurfEnglish перетворює справжні статті, дописи з X і подкасти на щоденну практику англійської. Проведіть по реченню, щоб перекласти його на місці, двічі торкніться слова, щоб побачити його значення в контексті, слухайте ШІ-голос, що працює просто на пристрої, і повторюйте в іграх, створених із прочитаного. Безкоштовно на iPhone.',
        chips: ['Справжні статті, рівні A1–C1', 'Свайп — переклад · Подвійний дотик — значення', 'ШІ-голос на пристрої, працює офлайн', 'Ігри з того, що ви читаєте'],
        site: 'Відкрити surfenglish.app',
        note: 'Безкоштовний старт · Застосунок 12 мовами · Переклад 21 мовою',
        store: 'Завантажити в App Store',
        alts: ['Головна стрічка SurfEnglish: справжні статті англійською з рівнем складності', 'Проведіть по реченню — переклад з’явиться одразу під ним', 'Word Raid — ретро-аркада зі слів, які ви шукали'],
      },
    },
  };

  // ————————————————————————————————————————————————————————————————————————

  if (!CONFIG.enabled || typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }
  if (window.__WBWSurfEnglishPromoMounted) {
    return;
  }
  window.__WBWSurfEnglishPromoMounted = true;

  // Resolve asset paths relative to this script, so the module also works from sub-folders.
  const scriptEl = document.currentScript;
  const assetBase = scriptEl && scriptEl.src
    ? new URL('../img/surfenglish/', scriptEl.src).href
    : 'img/surfenglish/';

  function resolveLocale() {
    const file = (window.location.pathname.split('/').pop() || '').toLowerCase();
    if (FILENAME_LOCALE[file]) {
      return FILENAME_LOCALE[file];
    }
    const lang = (document.documentElement.lang || '').toLowerCase();
    if (/^zh(-|$)/.test(lang)) {
      return /tw|hk|hant/.test(lang) ? 'zh-TW' : 'zh-CN';
    }
    const short = lang.split('-')[0];
    return I18N[short] ? short : 'en';
  }

  const locale = resolveLocale();
  const t = I18N[locale] || I18N.en;
  const htmlDir = (document.documentElement.getAttribute('dir') || '').toLowerCase();
  const dir = t.dir || (htmlDir === 'rtl' ? 'rtl' : 'ltr');

  const siteUrl = CONFIG.siteUrl + (t.sitePath || '') + (CONFIG.utm ? '?' + CONFIG.utm : '');
  const storeUrl = CONFIG.appStoreUrl;
  const badgeUrl = CONFIG.badgeBase + (t.badge || 'en-us');
  const iconSrc = assetBase + 'icon-192.png';

  const ARROW =
    '<svg class="wbw-se-arrow" viewBox="0 0 16 16" aria-hidden="true" focusable="false">' +
    '<path d="M3 8h9M8.5 3.5 13 8l-4.5 4.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>' +
    '</svg>';

  function attr(value) {
    return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  }

  function isDismissed() {
    try {
      const at = Number(window.localStorage.getItem(CONFIG.storageKey));
      return at > 0 && Date.now() - at < CONFIG.dismissDays * 864e5;
    } catch (error) {
      return false;
    }
  }

  function rememberDismissed() {
    try {
      window.localStorage.setItem(CONFIG.storageKey, String(Date.now()));
    } catch (error) {
      /* storage unavailable (private mode) — the bar simply comes back next visit */
    }
  }

  // ———————————————————————— promo section ————————————————————————

  function mountSection() {
    const anchor = document.querySelector(CONFIG.sectionAfter);
    if (!anchor || !anchor.parentNode || document.getElementById('surfenglish')) {
      return;
    }
    const p = t.promo;
    const section = document.createElement('section');
    section.className = 'wbw-se-promo';
    section.id = 'surfenglish';
    section.setAttribute('dir', dir);
    section.innerHTML =
      '<div class="wbw-se-promo__card">' +
      '  <div class="wbw-se-promo__copy">' +
      '    <p class="wbw-se-promo__eyebrow">' + p.eyebrow + '</p>' +
      '    <div class="wbw-se-promo__brand">' +
      '      <img src="' + attr(iconSrc) + '" width="56" height="56" alt="SurfEnglish">' +
      '      <div><div class="wbw-se-promo__name">SurfEnglish</div>' +
      '      <div class="wbw-se-promo__tagline">' + p.tagline + '</div></div>' +
      '    </div>' +
      '    <h2 class="wbw-se-promo__title">' + p.title + '</h2>' +
      '    <p class="wbw-se-promo__lead">' + p.lead + '</p>' +
      '    <ul class="wbw-se-promo__chips">' + p.chips.map((c) => '<li>' + c + '</li>').join('') + '</ul>' +
      '    <div class="wbw-se-promo__actions">' +
      '      <a class="wbw-se-promo__store" href="' + attr(storeUrl) + '" target="_blank" rel="noopener"' +
      '         data-ga-event="surfenglish_promo" data-ga-label="section_app_store">' +
      '        <img src="' + attr(badgeUrl) + '" alt="' + attr(p.store) + '" height="54">' +
      '      </a>' +
      '      <a class="wbw-se-promo__site" href="' + attr(siteUrl) + '" target="_blank" rel="noopener"' +
      '         data-ga-event="surfenglish_promo" data-ga-label="section_site">' + p.site + ARROW + '</a>' +
      '    </div>' +
      '    <p class="wbw-se-promo__note">' + p.note + '</p>' +
      '  </div>' +
      '  <div class="wbw-se-promo__shots">' +
      SHOTS.map(
        (file, i) =>
          '<figure class="wbw-se-phone"><img src="' + attr(assetBase + file) + '" width="600" height="1304"' +
          ' loading="lazy" decoding="async" alt="' + attr(p.alts[i] || '') + '"></figure>'
      ).join('') +
      '  </div>' +
      '</div>';
    anchor.insertAdjacentElement('afterend', section);

    // The section only exists after this script runs, so honour a #surfenglish deep link ourselves.
    if (window.location.hash === '#surfenglish') {
      window.requestAnimationFrame(() => section.scrollIntoView());
    }
  }

  // ———————————————————————— announcement bar ————————————————————————

  function mountBar() {
    if (document.getElementById('wbw-se-bar')) {
      return;
    }
    const b = t.bar;
    const bar = document.createElement('aside');
    bar.className = 'wbw-se-bar';
    bar.id = 'wbw-se-bar';
    bar.setAttribute('dir', dir);
    bar.setAttribute('aria-label', 'SurfEnglish');
    bar.innerHTML =
      '<div class="wbw-se-bar__inner">' +
      '  <img class="wbw-se-bar__icon" src="' + attr(iconSrc) + '" width="28" height="28" alt="">' +
      '  <span class="wbw-se-bar__new">' + t.label + '</span>' +
      '  <p class="wbw-se-bar__text">' +
      '    <span class="wbw-se-bar__text--long">' + b.text + '</span>' +
      '    <span class="wbw-se-bar__text--short">' + b.short + '</span>' +
      '  </p>' +
      '  <div class="wbw-se-bar__actions">' +
      '    <a class="wbw-se-bar__cta" href="' + attr(storeUrl) + '" target="_blank" rel="noopener"' +
      '       data-ga-event="surfenglish_promo" data-ga-label="bar_app_store">' + b.cta + ARROW + '</a>' +
      '    <a class="wbw-se-bar__more" href="' + attr(siteUrl) + '" target="_blank" rel="noopener"' +
      '       data-ga-event="surfenglish_promo" data-ga-label="bar_site">' + b.more + ARROW + '</a>' +
      '  </div>' +
      '  <button type="button" class="wbw-se-bar__close" aria-label="' + attr(b.close) + '"' +
      '          data-ga-event="surfenglish_promo" data-ga-label="bar_dismiss">&times;</button>' +
      '</div>';

    const body = document.body;
    body.insertBefore(bar, body.firstChild);

    // Layout: push the fixed header (or the page, when there is no fixed header)
    // down by the bar height. Everything is recomputed from measurements, and
    // stacks on top of whatever js/site-notice.js adds when that banner is on.
    const root = document.documentElement;
    const header = document.querySelector('body > header');
    const headerStyle = header ? window.getComputedStyle(header) : null;
    const fixedHeader = Boolean(
      headerStyle && (headerStyle.position === 'fixed' || headerStyle.position === 'sticky')
    );
    const spacer = document.querySelector('.nav-spacer');
    const noticeHeight = () => {
      const notice = document.querySelector('.wbw-service-notice');
      return notice ? Math.ceil(notice.getBoundingClientRect().height) : 0;
    };

    // Baselines, measured before we touch anything and net of the service notice.
    const n0 = noticeHeight();
    const headerTopBase = header ? (parseFloat(headerStyle.top) || 0) - n0 : 0;
    const spacerBase = spacer ? Math.ceil(spacer.getBoundingClientRect().height) - n0 : 0;
    const bodyPadBase = (parseFloat(window.getComputedStyle(body).paddingTop) || 0) - (fixedHeader ? 0 : n0);

    function relayout() {
      const barH = bar.isConnected ? Math.ceil(bar.getBoundingClientRect().height) : 0;
      const nH = noticeHeight();
      bar.style.top = nH + 'px';
      root.style.setProperty('--wbw-se-offset', nH + barH + 'px');
      if (header) {
        root.style.setProperty('--wbw-se-header-h', Math.ceil(header.getBoundingClientRect().height) + 'px');
      }
      if (fixedHeader) {
        header.style.top = headerTopBase + nH + barH + 'px';
        if (spacer) {
          spacer.style.height = spacerBase + nH + barH + 'px';
        }
      } else {
        body.style.paddingTop = bodyPadBase + nH + barH + 'px';
      }
    }

    relayout();

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(relayout);
      observer.observe(bar);
      if (header) {
        observer.observe(header);
      }
      const notice = document.querySelector('.wbw-service-notice');
      if (notice) {
        observer.observe(notice);
      }
    }
    window.addEventListener('resize', relayout);

    bar.querySelector('.wbw-se-bar__close').addEventListener('click', function () {
      rememberDismissed();
      bar.remove();
      relayout();
    });
  }

  function mount() {
    if (!document.body) {
      return;
    }
    if (CONFIG.showSection) {
      mountSection();
    }
    if (CONFIG.showBar && !isDismissed()) {
      mountBar();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount, { once: true });
  } else {
    mount();
  }
})();
