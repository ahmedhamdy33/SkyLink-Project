export const sitePages = {
  en: {
    '/company': {
      eyebrow: 'About SkyLink',
      title: 'The story, stack, and vision behind SkyLink.',
      description:
        'SkyLink is an airline booking platform built to make flight search, comparison, booking, and AI-guided planning feel cleaner, faster, and more trustworthy.',
      heroFacts: [
        { label: 'Current build started', value: 'April 21, 2026' },
        { label: 'Core experience', value: 'Flights, bookings, AI assistant' },
        { label: 'Data layer', value: 'Express + SQL Server' }
      ],
      sections: [
        {
          title: 'Project idea',
          body:
            'SkyLink was designed as a modern flight-booking website focused on clear search results, airline transparency, secure checkout, and a guided assistant that helps users compare options without inventing data.'
        },
        {
          title: 'What the website offers',
          bullets: [
            'Flight search with route, timing, airline, and price visibility.',
            'Booking flow with seat selection, payment, and booking history.',
            'Admin tools for flights, discounts, analytics, and user management.',
            'AI assistant for support help, budget search, destination ideas, and booking timing.'
          ]
        },
        {
          title: 'Technology used',
          bullets: [
            'Frontend: React 19, React Router, Vite, and custom CSS.',
            'Backend: Node.js, Express, Helmet, CORS, JWT auth, and rate limiting.',
            'Database: SQL Server with DB-first persistence for users, flights, bookings, and payments.',
            'AI integration: Gemini API through a secure backend-only architecture.'
          ]
        },
        {
          title: 'Design direction',
          body:
            'The interface blends a premium aviation mood with fast comparison patterns inspired by modern travel platforms. The goal is to keep search practical while still feeling polished and high-end.'
        },
        {
          title: 'Partners and ecosystem',
          body:
            'SkyLink supports a multi-airline catalog and is structured to work with airline partners, route providers, and future travel collaborations. The current demo includes multiple airline brands to simulate a broader marketplace.'
        },
        {
          title: 'Product mission',
          body:
            'The mission is simple: help travelers discover the right flight faster, understand policies more clearly, and book with more confidence.'
        }
      ]
    },
    '/help-center': {
      eyebrow: 'Help Center',
      title: 'Support articles and traveler guidance.',
      description: 'This page is a placeholder information hub for support topics, common booking questions, baggage help, and policy summaries.',
      sections: [
        {
          title: 'Included topics',
          bullets: ['Booking changes and cancellation steps.', 'Payment troubleshooting and receipt requests.', 'Baggage rules, check-in timing, and travel prep.']
        }
      ]
    },
    '/privacy-settings': {
      eyebrow: 'Privacy',
      title: 'Privacy preferences and controls.',
      description: 'This placeholder page explains how a traveler could manage cookies, session preferences, communication settings, and account privacy choices.',
      sections: [
        {
          title: 'Typical controls',
          bullets: ['Cookie categories and consent updates.', 'Marketing email preferences.', 'Account visibility and saved-session preferences.']
        }
      ]
    },
    '/cookie-policy': {
      eyebrow: 'Policy',
      title: 'Cookie policy overview.',
      description: 'This placeholder page explains how cookies could be used for login sessions, analytics, preference storage, and performance improvements.',
      sections: [
        {
          title: 'Cookie types',
          bullets: ['Essential cookies for authentication and secure sessions.', 'Preference cookies for language, currency, and theme.', 'Analytics cookies for performance and UX improvements.']
        }
      ]
    },
    '/privacy-policy': {
      eyebrow: 'Policy',
      title: 'Privacy policy overview.',
      description: 'This placeholder page describes how traveler data may be collected, stored, protected, and used inside the platform.',
      sections: [
        {
          title: 'Data areas',
          bullets: ['Account and booking profile data.', 'Payment-related metadata and transaction references.', 'Support requests and AI assistant interactions.']
        }
      ]
    },
    '/terms-of-service': {
      eyebrow: 'Legal',
      title: 'Terms of service summary.',
      description: 'This placeholder page outlines how bookings, accounts, cancellations, and platform usage would be governed by service terms.',
      sections: [
        {
          title: 'Typical sections',
          bullets: ['User responsibilities and account eligibility.', 'Booking limits, payment rules, and dispute handling.', 'Service availability and platform updates.']
        }
      ]
    },
    '/company-details': {
      eyebrow: 'Company',
      title: 'Company details and operating profile.',
      description: 'This placeholder page can later hold legal entity details, office information, support channels, and operating disclosures.',
      sections: [
        {
          title: 'Suggested content',
          bullets: ['Registered office and support contact points.', 'Business identifiers, ownership, and compliance notes.', 'Regional operating information and public notices.']
        }
      ]
    },
    '/partners': {
      eyebrow: 'Partners',
      title: 'Travel and airline partner overview.',
      description: 'This placeholder page represents where SkyLink could showcase airline relationships, payment providers, route suppliers, and future hospitality partnerships.',
      sections: [
        {
          title: 'Possible partner categories',
          bullets: ['Airline operators and route providers.', 'Payment and security infrastructure partners.', 'Travel add-on and loyalty ecosystem partners.']
        }
      ]
    },
    '/trips': {
      eyebrow: 'Trips',
      title: 'Trip inspiration and planning content.',
      description: 'This placeholder page can later hold destination guides, seasonal travel ideas, packing tips, and multi-city inspiration.',
      sections: [
        {
          title: 'Planned content ideas',
          bullets: ['Weekend getaway suggestions.', 'Budget-focused destination collections.', 'Seasonal travel inspiration and trip templates.']
        }
      ]
    },
    '/international-sites': {
      eyebrow: 'Global',
      title: 'Regional and international site directory.',
      description: 'This placeholder page is meant for future regional versions of SkyLink, localized support pages, and country-specific travel content.',
      sections: [
        {
          title: 'Possible future areas',
          bullets: ['Region-specific languages and currencies.', 'Localized support centers and legal notices.', 'Country landing pages and travel campaigns.']
        }
      ]
    }
  },
  ar: {
    '/company': {
      eyebrow: 'عن SkyLink',
      title: 'القصة والتقنيات والرؤية خلف SkyLink.',
      description: 'SkyLink منصة لحجز الطيران صممت لتجعل البحث والمقارنة والحجز والتخطيط بمساعدة الذكاء الاصطناعي أوضح وأسرع وأكثر ثقة.',
      heroFacts: [
        { label: 'بداية النسخة الحالية', value: '21 أبريل 2026' },
        { label: 'التجربة الأساسية', value: 'رحلات، حجوزات، مساعد ذكي' },
        { label: 'طبقة البيانات', value: 'Express + SQL Server' }
      ],
      sections: [
        {
          title: 'فكرة المشروع',
          body: 'صمم SkyLink كموقع حديث لحجز الرحلات يركز على نتائج بحث واضحة، شفافية شركات الطيران، دفع آمن، ومساعد يرشد المستخدمين للمقارنة بدون اختلاق بيانات.'
        },
        {
          title: 'ما الذي يقدمه الموقع',
          bullets: [
            'بحث رحلات يوضح المسار والموعد وشركة الطيران والسعر.',
            'تدفق حجز يشمل اختيار المقاعد والدفع وسجل الحجوزات.',
            'أدوات إدارة للرحلات والخصومات والتحليلات والمستخدمين.',
            'مساعد ذكي للدعم والبحث حسب الميزانية وأفكار الوجهات وتوقيت الحجز.'
          ]
        },
        {
          title: 'التقنيات المستخدمة',
          bullets: [
            'الواجهة: React 19 وReact Router وVite وCSS مخصص.',
            'الخادم: Node.js وExpress وHelmet وCORS وJWT وتحديد معدل الطلبات.',
            'قاعدة البيانات: SQL Server لحفظ المستخدمين والرحلات والحجوزات والمدفوعات.',
            'الذكاء الاصطناعي: Gemini API عبر بنية آمنة من جهة الخادم فقط.'
          ]
        },
        {
          title: 'اتجاه التصميم',
          body: 'تمزج الواجهة بين طابع طيران فاخر وأنماط مقارنة سريعة مستوحاة من منصات السفر الحديثة، مع الحفاظ على البحث عمليًا وأنيقًا.'
        },
        {
          title: 'الشركاء والمنظومة',
          body: 'يدعم SkyLink كتالوجًا متعدد الشركات ومهيأ للعمل مع شركاء الطيران ومزودي المسارات والتعاونات السياحية المستقبلية.'
        },
        {
          title: 'رسالة المنتج',
          body: 'الرسالة بسيطة: مساعدة المسافرين على اكتشاف الرحلة المناسبة أسرع، فهم السياسات أوضح، والحجز بثقة أكبر.'
        }
      ]
    },
    '/help-center': {
      eyebrow: 'مركز المساعدة',
      title: 'مقالات دعم وإرشادات للمسافرين.',
      description: 'صفحة معلومات لموضوعات الدعم والأسئلة الشائعة حول الحجز والحقائب وملخصات السياسات.',
      sections: [
        {
          title: 'الموضوعات المتاحة',
          bullets: ['خطوات تعديل الحجز والإلغاء.', 'حل مشاكل الدفع وطلبات الإيصال.', 'قواعد الحقائب ووقت تسجيل الوصول وتجهيزات السفر.']
        }
      ]
    },
    '/privacy-settings': {
      eyebrow: 'الخصوصية',
      title: 'تفضيلات الخصوصية وعناصر التحكم.',
      description: 'توضح هذه الصفحة كيف يمكن للمسافر إدارة ملفات الارتباط وتفضيلات الجلسة وإعدادات التواصل وخيارات خصوصية الحساب.',
      sections: [
        {
          title: 'عناصر تحكم نموذجية',
          bullets: ['فئات ملفات الارتباط وتحديث الموافقة.', 'تفضيلات رسائل التسويق.', 'ظهور الحساب وتفضيلات الجلسات المحفوظة.']
        }
      ]
    },
    '/cookie-policy': {
      eyebrow: 'السياسات',
      title: 'نظرة عامة على سياسة ملفات الارتباط.',
      description: 'تشرح هذه الصفحة كيف يمكن استخدام ملفات الارتباط لجلسات الدخول والتحليلات وحفظ التفضيلات وتحسين الأداء.',
      sections: [
        {
          title: 'أنواع ملفات الارتباط',
          bullets: ['ملفات أساسية للمصادقة والجلسات الآمنة.', 'ملفات تفضيلات للغة والعملة والمظهر.', 'ملفات تحليلات للأداء وتحسين تجربة المستخدم.']
        }
      ]
    },
    '/privacy-policy': {
      eyebrow: 'السياسات',
      title: 'نظرة عامة على سياسة الخصوصية.',
      description: 'تصف هذه الصفحة كيف يمكن جمع بيانات المسافرين وتخزينها وحمايتها واستخدامها داخل المنصة.',
      sections: [
        {
          title: 'مجالات البيانات',
          bullets: ['بيانات الحساب وملف الحجز.', 'بيانات مرتبطة بالدفع ومراجع المعاملات.', 'طلبات الدعم وتفاعلات المساعد الذكي.']
        }
      ]
    },
    '/terms-of-service': {
      eyebrow: 'قانوني',
      title: 'ملخص شروط الخدمة.',
      description: 'تعرض هذه الصفحة كيف يمكن تنظيم الحجوزات والحسابات والإلغاءات واستخدام المنصة ضمن شروط الخدمة.',
      sections: [
        {
          title: 'أقسام نموذجية',
          bullets: ['مسؤوليات المستخدم وأهلية الحساب.', 'حدود الحجز وقواعد الدفع ومعالجة النزاعات.', 'توفر الخدمة وتحديثات المنصة.']
        }
      ]
    },
    '/company-details': {
      eyebrow: 'الشركة',
      title: 'بيانات الشركة والملف التشغيلي.',
      description: 'يمكن لهذه الصفحة لاحقًا عرض البيانات القانونية ومعلومات المكتب وقنوات الدعم والإفصاحات التشغيلية.',
      sections: [
        {
          title: 'محتوى مقترح',
          bullets: ['عنوان المكتب ونقاط التواصل للدعم.', 'معرفات العمل والملكية وملاحظات الامتثال.', 'معلومات التشغيل الإقليمية والإعلانات العامة.']
        }
      ]
    },
    '/partners': {
      eyebrow: 'الشركاء',
      title: 'نظرة عامة على شركاء السفر والطيران.',
      description: 'تمثل هذه الصفحة مكانًا لعرض علاقات SkyLink مع شركات الطيران ومزودي الدفع والموردين والشراكات السياحية المستقبلية.',
      sections: [
        {
          title: 'فئات شركاء محتملة',
          bullets: ['مشغلو الطيران ومزودو المسارات.', 'شركاء الدفع والبنية الأمنية.', 'شركاء خدمات السفر الإضافية وبرامج الولاء.']
        }
      ]
    },
    '/trips': {
      eyebrow: 'الرحلات',
      title: 'إلهام الرحلات ومحتوى التخطيط.',
      description: 'يمكن لهذه الصفحة لاحقًا عرض أدلة وجهات وأفكار سفر موسمية ونصائح تجهيز وقوالب رحلات متعددة المدن.',
      sections: [
        {
          title: 'أفكار محتوى مخططة',
          bullets: ['اقتراحات لعطلات نهاية الأسبوع.', 'مجموعات وجهات مناسبة للميزانية.', 'إلهام سفر موسمي وقوالب رحلات.']
        }
      ]
    },
    '/international-sites': {
      eyebrow: 'عالمي',
      title: 'دليل المواقع الإقليمية والدولية.',
      description: 'هذه الصفحة مخصصة للنسخ الإقليمية المستقبلية من SkyLink وصفحات الدعم المحلية ومحتوى السفر حسب الدولة.',
      sections: [
        {
          title: 'مجالات مستقبلية محتملة',
          bullets: ['لغات وعملات حسب المنطقة.', 'مراكز دعم محلية وإشعارات قانونية.', 'صفحات دول وحملات سفر.']
        }
      ]
    }
  }
};
