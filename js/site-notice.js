(function () {
  const config = {
    enabled: true,
    translations: {
      en: {
        eyebrow: 'Service Status Update',
        title: 'Online translation service is temporarily unavailable',
        message:
          'Our backend translation service is currently experiencing a technical issue. Translation requests cannot be processed correctly at the moment. We are working urgently to restore service and sincerely apologize for the inconvenience.',
      },
      ar: {
        eyebrow: 'تحديث حالة الخدمة',
        title: 'خدمة الترجمة عبر الإنترنت غير متاحة مؤقتاً',
        message:
          'تواجه خدمة الترجمة الخلفية لدينا مشكلة تقنية حالياً، لذلك لا يمكن معالجة طلبات الترجمة عبر الإنترنت بشكل صحيح في الوقت الحالي. نحن نعمل بشكل عاجل لاستعادة الخدمة ونعتذر عن الإزعاج.',
      },
      de: {
        eyebrow: 'Service-Status',
        title: 'Der Online-Übersetzungsdienst ist vorübergehend nicht verfügbar',
        message:
          'Unser Übersetzungs-Backend hat derzeit ein technisches Problem. Online-Übersetzungsanfragen können im Moment nicht korrekt verarbeitet werden. Wir arbeiten mit Hochdruck an der Wiederherstellung des Dienstes und entschuldigen uns für die Unannehmlichkeiten.',
      },
      es: {
        eyebrow: 'Estado del servicio',
        title: 'El servicio de traducción en línea no está disponible temporalmente',
        message:
          'Nuestro servicio backend de traducción está experimentando un problema técnico. Las solicitudes de traducción en línea no pueden procesarse correctamente por el momento. Estamos trabajando con urgencia para restablecer el servicio y lamentamos las molestias.',
      },
      fr: {
        eyebrow: 'Statut du service',
        title: 'Le service de traduction en ligne est temporairement indisponible',
        message:
          'Notre service de traduction backend rencontre actuellement un problème technique. Les demandes de traduction en ligne ne peuvent pas être traitées correctement pour le moment. Nous travaillons en urgence pour rétablir le service et vous prions de nous excuser pour la gêne occasionnée.',
      },
      hi: {
        eyebrow: 'सेवा स्थिति अपडेट',
        title: 'ऑनलाइन अनुवाद सेवा अस्थायी रूप से उपलब्ध नहीं है',
        message:
          'हमारी बैकएंड अनुवाद सेवा इस समय तकनीकी समस्या का सामना कर रही है। फिलहाल ऑनलाइन अनुवाद अनुरोध सही तरीके से संसाधित नहीं किए जा सकते। हम सेवा बहाल करने के लिए तेजी से काम कर रहे हैं और हुई असुविधा के लिए क्षमा चाहते हैं।',
      },
      id: {
        eyebrow: 'Pembaruan status layanan',
        title: 'Layanan terjemahan online sedang tidak tersedia untuk sementara',
        message:
          'Layanan terjemahan backend kami sedang mengalami kendala teknis. Permintaan terjemahan online saat ini belum dapat diproses dengan benar. Kami sedang berupaya memulihkan layanan secepat mungkin dan mohon maaf atas ketidaknyamanan ini.',
      },
      it: {
        eyebrow: 'Aggiornamento sul servizio',
        title: 'Il servizio di traduzione online è temporaneamente non disponibile',
        message:
          'Il nostro servizio backend di traduzione sta riscontrando un problema tecnico. Al momento le richieste di traduzione online non possono essere elaborate correttamente. Stiamo lavorando con la massima urgenza per ripristinare il servizio e ci scusiamo per il disagio.',
      },
      ja: {
        eyebrow: 'サービス状況のお知らせ',
        title: 'オンライン翻訳サービスは一時的に利用できません',
        message:
          '現在、バックエンドの翻訳サービスで技術的な問題が発生しており、オンライン翻訳リクエストを正常に処理できません。復旧を最優先で進めております。ご不便をおかけし申し訳ありません。',
      },
      ko: {
        eyebrow: '서비스 상태 안내',
        title: '온라인 번역 서비스가 일시적으로 이용 불가합니다',
        message:
          '현재 백엔드 번역 서비스에 기술적 문제가 발생하여 온라인 번역 요청을 정상적으로 처리할 수 없습니다. 최대한 빠르게 서비스를 복구하고 있으며, 불편을 드려 죄송합니다.',
      },
      nl: {
        eyebrow: 'Servicestatus',
        title: 'De online vertaaldienst is tijdelijk niet beschikbaar',
        message:
          'Onze backend-vertaaldienst ondervindt momenteel een technisch probleem. Online vertaalverzoeken kunnen op dit moment niet correct worden verwerkt. We werken met spoed aan herstel van de service en bieden onze excuses aan voor het ongemak.',
      },
      pl: {
        eyebrow: 'Status usługi',
        title: 'Usługa tłumaczenia online jest tymczasowo niedostępna',
        message:
          'W naszym zapleczu tłumaczeniowym wystąpił problem techniczny. Żądania tłumaczenia online nie mogą być obecnie przetwarzane poprawnie. Intensywnie pracujemy nad przywróceniem usługi i przepraszamy za niedogodności.',
      },
      pt: {
        eyebrow: 'Atualização do serviço',
        title: 'O serviço de tradução online está temporariamente indisponível',
        message:
          'O nosso serviço de tradução em backend está com um problema técnico no momento. As solicitações de tradução online não podem ser processadas corretamente agora. Estamos trabalhando com prioridade máxima para restaurar o serviço e pedimos desculpas pelo transtorno.',
      },
      ru: {
        eyebrow: 'Статус сервиса',
        title: 'Онлайн-сервис перевода временно недоступен',
        message:
          'В работе серверной службы перевода возникла техническая проблема. В данный момент онлайн-запросы на перевод не могут обрабатываться корректно. Мы прилагаем все усилия, чтобы как можно скорее восстановить сервис, и приносим извинения за неудобства.',
      },
      th: {
        eyebrow: 'สถานะบริการ',
        title: 'บริการแปลออนไลน์ไม่พร้อมใช้งานชั่วคราว',
        message:
          'ขณะนี้บริการแปลภาษาเบื้องหลังของเรากำลังประสบปัญหาทางเทคนิค คำขอแปลออนไลน์จึงยังไม่สามารถประมวลผลได้อย่างถูกต้องในขณะนี้ ทีมงานกำลังเร่งกู้คืนบริการ และขออภัยในความไม่สะดวก',
      },
      tr: {
        eyebrow: 'Hizmet durumu',
        title: 'Çevrim içi çeviri hizmeti geçici olarak kullanılamıyor',
        message:
          'Arka uç çeviri hizmetimiz şu anda teknik bir sorun yaşıyor. Çevrim içi çeviri istekleri şu an düzgün şekilde işlenemiyor. Hizmeti en kısa sürede yeniden devreye almak için yoğun şekilde çalışıyoruz. Yaşanan aksaklık için özür dileriz.',
      },
      uk: {
        eyebrow: 'Стан сервісу',
        title: 'Онлайн-сервіс перекладу тимчасово недоступний',
        message:
          'Наразі у серверній службі перекладу виникла технічна проблема. Онлайн-запити на переклад тимчасово не можуть оброблятися коректно. Ми терміново працюємо над відновленням сервісу та перепрошуємо за незручності.',
      },
      vi: {
        eyebrow: 'Cập nhật trạng thái dịch vụ',
        title: 'Dịch vụ dịch trực tuyến tạm thời không khả dụng',
        message:
          'Dịch vụ dịch thuật phía máy chủ của chúng tôi hiện đang gặp sự cố kỹ thuật. Các yêu cầu dịch trực tuyến hiện chưa thể được xử lý chính xác. Chúng tôi đang khẩn trương khôi phục dịch vụ và chân thành xin lỗi vì sự bất tiện này.',
      },
      'zh-CN': {
        eyebrow: '服务状态更新',
        title: '在线翻译服务暂时不可用',
        message:
          '由于后端翻译服务出现技术故障，当前在线翻译请求暂时无法正常处理。我们正在加紧排查并尽快恢复服务。给您带来的不便，敬请谅解。',
      },
      'zh-TW': {
        eyebrow: '服務狀態更新',
        title: '線上翻譯服務暫時無法使用',
        message:
          '由於後端翻譯服務發生技術故障，目前線上翻譯請求暫時無法正常處理。我們正在加緊排查並儘快恢復服務。造成不便，敬請見諒。',
      },
    },
  };

  if (!config.enabled || typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  if (window.__WBWServiceNoticeMounted) {
    return;
  }
  window.__WBWServiceNoticeMounted = true;

  const filename = window.location.pathname.split('/').pop().toLowerCase();
  const lang = (document.documentElement.lang || '').toLowerCase();
  const filenameLocaleMap = {
    'ar-top.html': 'ar',
    'cn-top.html': 'zh-CN',
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
    'tw-top.html': 'zh-TW',
    'uk-top.html': 'uk',
    'vi-top.html': 'vi',
    'zh-top.html': 'zh-CN',
  };

  function resolveLocale() {
    if (filenameLocaleMap[filename]) {
      return filenameLocaleMap[filename];
    }

    if (lang.startsWith('zh-tw') || lang.startsWith('zh-hk') || lang.startsWith('zh-hant')) {
      return 'zh-TW';
    }

    if (lang.startsWith('zh')) {
      return 'zh-CN';
    }

    const shortLang = lang.split('-')[0];
    return config.translations[shortLang] ? shortLang : 'en';
  }

  const locale = resolveLocale();
  const copy = config.translations[locale] || config.translations.en;
  const noticeDirection = locale === 'ar' ? 'rtl' : 'ltr';

  if (!document.getElementById('wbw-service-notice-style')) {
    const style = document.createElement('style');
    style.id = 'wbw-service-notice-style';
    style.textContent = [
      ':root { --wbw-service-notice-height: 0px; }',
      '.wbw-service-notice {',
      '  position: fixed;',
      '  top: 0;',
      '  left: 0;',
      '  right: 0;',
      '  z-index: 1200;',
      '  background: linear-gradient(90deg, #6f101a 0%, #c62828 46%, #f08c00 100%);',
      '  color: #fff7ef;',
      '  border-bottom: 1px solid rgba(255, 255, 255, 0.16);',
      '  box-shadow: 0 14px 36px rgba(111, 16, 26, 0.28);',
      '}',
      '.wbw-service-notice__inner {',
      '  max-width: 1200px;',
      '  margin: 0 auto;',
      '  padding: 14px 20px 16px;',
      '  font-family: "Segoe UI", "SF Pro Text", "PingFang SC", "Hiragino Sans", "Microsoft YaHei", sans-serif;',
      '}',
      '.wbw-service-notice__eyebrow {',
      '  display: inline-flex;',
      '  align-items: center;',
      '  gap: 8px;',
      '  margin-bottom: 8px;',
      '  padding: 4px 10px;',
      '  border-radius: 999px;',
      '  background: rgba(255, 255, 255, 0.14);',
      '  color: #fffdf9;',
      '  font-size: 0.74rem;',
      '  font-weight: 700;',
      '  letter-spacing: 0.08em;',
      '  text-transform: uppercase;',
      '}',
      '.wbw-service-notice__row {',
      '  display: flex;',
      '  align-items: flex-start;',
      '  gap: 14px;',
      '}',
      '.wbw-service-notice__icon {',
      '  width: 38px;',
      '  height: 38px;',
      '  flex: 0 0 38px;',
      '  border-radius: 50%;',
      '  display: inline-flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  background: rgba(255, 255, 255, 0.15);',
      '  border: 1px solid rgba(255, 255, 255, 0.22);',
      '  font-size: 1.05rem;',
      '  font-weight: 800;',
      '}',
      '.wbw-service-notice__copy {',
      '  min-width: 0;',
      '}',
      '.wbw-service-notice__title {',
      '  margin: 0 0 4px;',
      '  font-size: 1.02rem;',
      '  font-weight: 800;',
      '  line-height: 1.35;',
      '}',
      '.wbw-service-notice__message {',
      '  margin: 0;',
      '  font-size: 0.95rem;',
      '  line-height: 1.55;',
      '  color: rgba(255, 247, 239, 0.96);',
      '}',
      '@media (max-width: 720px) {',
      '  .wbw-service-notice__inner {',
      '    padding: 12px 14px 14px;',
      '  }',
      '  .wbw-service-notice__eyebrow {',
      '    font-size: 0.7rem;',
      '    letter-spacing: 0.05em;',
      '  }',
      '  .wbw-service-notice__row {',
      '    gap: 10px;',
      '  }',
      '  .wbw-service-notice__icon {',
      '    width: 32px;',
      '    height: 32px;',
      '    flex-basis: 32px;',
      '    font-size: 0.95rem;',
      '  }',
      '  .wbw-service-notice__title {',
      '    font-size: 0.95rem;',
      '  }',
      '  .wbw-service-notice__message {',
      '    font-size: 0.88rem;',
      '  }',
      '}',
    ].join('\n');
    document.head.appendChild(style);
  }

  const notice = document.createElement('section');
  notice.className = 'wbw-service-notice';
  notice.setAttribute('role', 'alert');
  notice.setAttribute('aria-live', 'polite');
  notice.setAttribute('dir', noticeDirection);
  notice.innerHTML =
    '<div class="wbw-service-notice__inner">' +
    '  <div class="wbw-service-notice__eyebrow">' + copy.eyebrow + '</div>' +
    '  <div class="wbw-service-notice__row">' +
    '    <div class="wbw-service-notice__icon" aria-hidden="true">!</div>' +
    '    <div class="wbw-service-notice__copy">' +
    '      <p class="wbw-service-notice__title">' + copy.title + '</p>' +
    '      <p class="wbw-service-notice__message">' + copy.message + '</p>' +
    '    </div>' +
    '  </div>' +
    '</div>';

  const body = document.body;
  if (!body) {
    return;
  }
  body.insertBefore(notice, body.firstChild);

  const header = document.querySelector('body > header');
  const headerStyles = header ? window.getComputedStyle(header) : null;
  const navSpacer = document.querySelector('.nav-spacer');
  const hasFixedHeader = Boolean(
    headerStyles && (headerStyles.position === 'fixed' || headerStyles.position === 'sticky')
  );
  const originalBodyPaddingTop = parseFloat(window.getComputedStyle(body).paddingTop) || 0;
  const originalHeaderTop = header ? parseFloat(headerStyles.top) || 0 : 0;
  const originalNavSpacerHeight = navSpacer ? Math.ceil(navSpacer.getBoundingClientRect().height) : 0;

  function applyLayoutOffset() {
    const noticeHeight = Math.ceil(notice.getBoundingClientRect().height);
    document.documentElement.style.setProperty('--wbw-service-notice-height', noticeHeight + 'px');

    if (hasFixedHeader && header) {
      header.style.top = originalHeaderTop + noticeHeight + 'px';

      if (navSpacer) {
        navSpacer.style.height = originalNavSpacerHeight + noticeHeight + 'px';
      }

      body.style.paddingTop = originalBodyPaddingTop > 0 ? originalBodyPaddingTop + 'px' : '';
      return;
    }

    body.style.paddingTop = originalBodyPaddingTop + noticeHeight + 'px';
  }

  applyLayoutOffset();

  if (typeof ResizeObserver !== 'undefined') {
    const resizeObserver = new ResizeObserver(applyLayoutOffset);
    resizeObserver.observe(notice);
    window.addEventListener(
      'beforeunload',
      function cleanupResizeObserver() {
        resizeObserver.disconnect();
      },
      { once: true }
    );
  } else {
    window.addEventListener('resize', applyLayoutOffset);
  }
})();