// Tiny bilingual dictionary (English / Arabic). Add a language by adding another column.
export type Lang = "en" | "ar";
export const LANG_COOKIE = "lq_lang";

const D = {
  // navigation
  "nav.home": { en: "Home", ar: "الرئيسية" },
  "nav.quotations": { en: "Quotations", ar: "عروض الأسعار" },
  "nav.followups": { en: "Follow-ups", ar: "المتابعات" },
  "nav.customers": { en: "Customers", ar: "العملاء" },
  "nav.analytics": { en: "Analytics", ar: "التحليلات" },
  "nav.dashboard": { en: "Dashboard", ar: "لوحة المعلومات" },
  "nav.salesSkills": { en: "Sales skills", ar: "مهارات البيع" },
  "nav.clientTypes": { en: "Client types", ar: "أنماط العملاء" },
  "nav.integrations": { en: "Integrations", ar: "التكاملات" },
  "nav.shopify": { en: "Shopify", ar: "شوبيفاي" },
  "nav.quotesShort": { en: "Quotes", ar: "العروض" },
  "top.search": { en: "Search customers", ar: "ابحث في العملاء" },
  "top.signOut": { en: "Sign out", ar: "تسجيل الخروج" },
  "top.switch": { en: "العربية", ar: "English" },

  // customers list
  "cust.title": { en: "Customers", ar: "العملاء" },
  "cust.add": { en: "+ Add customer", ar: "+ إضافة عميل" },
  "cust.searchPh": { en: "Search name, company, email or phone", ar: "ابحث بالاسم أو الشركة أو البريد أو الهاتف" },
  "cust.search": { en: "Search", ar: "بحث" },
  "cust.clear": { en: "Clear", ar: "مسح" },
  "cust.none": { en: "No customers yet.", ar: "لا يوجد عملاء بعد." },
  "cust.noMatch": { en: "No customers match your search.", ar: "لا يوجد عملاء يطابقون بحثك." },
  "cust.emptyText": { en: "Add your first customer to start tracking quotations.", ar: "أضف أول عميل لتبدأ بتتبع عروض الأسعار." },
  "cust.loadErr": { en: "Could not load customers", ar: "تعذر تحميل العملاء" },
  "cust.individual": { en: "Individual", ar: "فرد" },
  "cust.company": { en: "Company", ar: "شركة" },
  "cust.addTitle": { en: "Add customer", ar: "إضافة عميل" },

  // customer form
  "form.type": { en: "Customer type", ar: "نوع العميل" },
  "form.name": { en: "Name *", ar: "الاسم *" },
  "form.companyName": { en: "Company name", ar: "اسم الشركة" },
  "form.email": { en: "Email", ar: "البريد الإلكتروني" },
  "form.phone": { en: "Phone (with country code)", ar: "الهاتف (مع رمز الدولة)" },
  "form.country": { en: "Country", ar: "الدولة" },
  "form.notes": { en: "Notes", ar: "ملاحظات" },
  "form.viewOnly": { en: "You have view-only access, so you cannot change customers.", ar: "لديك صلاحية المشاهدة فقط، لذلك لا يمكنك تعديل العملاء." },
  "form.style": { en: "Communication style", ar: "أسلوب التواصل" },
  "form.styleHelp": { en: "Pick the style that fits best and get tips on how to talk to this customer.", ar: "اختر النمط الأنسب لتحصل على نصائح عن كيفية التحدث مع هذا العميل." },
  "form.helpMe": { en: "Help me decide", ar: "ساعدني في الاختيار" },
  "form.hideQuiz": { en: "Hide quiz", ar: "إخفاء الاختبار" },
  "form.addBtn": { en: "Add customer", ar: "إضافة العميل" },
  "form.saveBtn": { en: "Save changes", ar: "حفظ التغييرات" },
  "form.saving": { en: "Saving…", ar: "جارٍ الحفظ…" },
  "form.cancel": { en: "Cancel", ar: "إلغاء" },
  "form.back": { en: "Back", ar: "رجوع" },
  "form.delete": { en: "Delete customer", ar: "حذف العميل" },
  "form.deleteTitle": { en: "Delete this customer?", ar: "هل تريد حذف هذا العميل؟" },
  "form.deleteText": { en: "{name} will be permanently removed. This cannot be undone.", ar: "سيتم حذف {name} نهائيًا ولا يمكن التراجع عن ذلك." },
  "form.keep": { en: "Keep customer", ar: "الإبقاء على العميل" },
  "form.deleting": { en: "Deleting…", ar: "جارٍ الحذف…" },
  "form.errName": { en: "Enter the customer's name.", ar: "أدخل اسم العميل." },
  "form.errEmail": { en: "That email address is not valid. Check it and try again.", ar: "عنوان البريد الإلكتروني غير صالح. راجعه وحاول مرة أخرى." },
  "form.errHasQuotes": { en: "This customer still has quotations. Delete those quotations first, then delete the customer.", ar: "لا يزال لدى هذا العميل عروض أسعار. احذفها أولًا ثم احذف العميل." },

  // tips panel
  "tips.communicate": { en: "How to communicate", ar: "كيف تتواصل معه" },
  "tips.avoid": { en: "Avoid", ar: "تجنّب" },
  "tips.quotation": { en: "For the quotation", ar: "عند إعداد عرض السعر" },
  "tips.followup": { en: "For follow-ups", ar: "عند المتابعة" },
  "tips.opener": { en: "Example opener: ", ar: "مثال لبداية الرسالة: " },
  "tips.name": { en: "[name]", ar: "[الاسم]" },
  "tips.quote": { en: "[quotation title]", ar: "[عنوان العرض]" },
  "tips.amount": { en: "[amount]", ar: "[المبلغ]" },
  "tips.date": { en: "[start date]", ar: "[تاريخ البدء]" },

  // client types page
  "pt.title": { en: "Client types", ar: "أنماط العملاء" },
  "pt.subtitle": { en: "Four communication styles. Spot the style, then write the way that customer likes to be spoken to.", ar: "أربعة أنماط للتواصل. تعرّف على النمط، ثم خاطب العميل بالطريقة التي يفضّلها." },
  "pt.spot": { en: "How to spot them", ar: "كيف تتعرّف عليهم" },
  "pt.cares": { en: "What they care about", ar: "ما الذي يهمّهم" },
  "pt.quoteTip": { en: "Quotation tip", ar: "نصيحة لعرض السعر" },
  "pt.followTip": { en: "Follow-up tip", ar: "نصيحة للمتابعة" },
  "pt.example": { en: "Example message", ar: "مثال لرسالة" },
  "pt.disclaimer": {
    en: "These styles are a practical guide inspired by the well-known DISC model. People mix styles and change with the situation, so use them as a starting point and adjust to what you see.",
    ar: "هذه الأنماط دليل عملي مستوحى من نموذج DISC المعروف. الناس يجمعون بين عدة أنماط ويتغيرون حسب الموقف، فاعتبرها نقطة بداية وعدّل بحسب ما تلاحظه.",
  },
  "quiz.title": { en: "Not sure which type? Answer 5 quick questions", ar: "لست متأكدًا من النمط؟ أجب عن 5 أسئلة سريعة" },
  "quiz.sub": { en: "Think of one specific customer and how they have behaved so far.", ar: "فكّر في عميل محدد وفي طريقة تصرّفه حتى الآن." },
  "quiz.most": { en: "Most likely:", ar: "الأرجح:" },
  "quiz.close": { en: "It is close between {a}. Watch a bit longer, then pick the one that fits best.", ar: "النتيجة متقاربة بين {a}. راقب قليلًا ثم اختر الأنسب." },
  "quiz.use": { en: "Use {a} for this customer", ar: "استخدم نمط {a} لهذا العميل" },
  "quiz.again": { en: "Start over", ar: "ابدأ من جديد" },

  // shopify settings
  "shop.title": { en: "Shopify", ar: "شوبيفاي" },
  "shop.subtitle": { en: "Import your Shopify customers and draft orders so you can follow up on them.", ar: "استورد عملاءك وطلبات المسودة من شوبيفاي لتتمكن من متابعتهم." },
  "shop.connected": { en: "Connected store", ar: "المتجر المتصل" },
  "shop.lastSync": { en: "Last import", ar: "آخر استيراد" },
  "shop.never": { en: "Not imported yet", ar: "لم يتم الاستيراد بعد" },
  "shop.sync": { en: "Import from Shopify now", ar: "استورد من شوبيفاي الآن" },
  "shop.syncing": { en: "Importing…", ar: "جارٍ الاستيراد…" },
  "shop.notConnected": { en: "No Shopify store is connected yet.", ar: "لم يتم ربط أي متجر شوبيفاي بعد." },
  "shop.howTo": { en: "Install LostQuote from your Shopify admin (Apps), open it there, and press “Link to my LostQuote account”.", ar: "ثبّت LostQuote من لوحة تحكم شوبيفاي (التطبيقات)، وافتحه هناك، ثم اضغط «ربط بحسابي في LostQuote»." },
  "shop.uninstalled": { en: "The app was removed from this Shopify store. Install it again to reconnect.", ar: "تمت إزالة التطبيق من متجر شوبيفاي هذا. ثبّته مجددًا لإعادة الربط." },
  "shop.draftNote": { en: "Shopify draft orders become quotations: open drafts are Draft, invoiced drafts are Sent, completed drafts are Won.", ar: "تتحول طلبات المسودة في شوبيفاي إلى عروض أسعار: المسودة المفتوحة «مسودة»، والمفوترة «مُرسل»، والمكتملة «ناجح»." },
  "shop.result": { en: "Imported: {cc} new customers, {cu} updated, {qc} new quotations, {qu} updated.", ar: "تم الاستيراد: {cc} عميل جديد، {cu} محدّث، {qc} عرض سعر جديد، {qu} محدّث." },
  "shop.skipped": { en: "{n} draft orders were skipped because they have no customer.", ar: "تم تخطي {n} من طلبات المسودة لأنها بلا عميل." },
  "shop.truncated": { en: "Only the latest 250 customers and 250 draft orders were imported. Run the import again later for more.", ar: "تم استيراد آخر 250 عميلًا و250 طلب مسودة فقط. أعد الاستيراد لاحقًا للمزيد." },
  "shop.failed": { en: "{n} items could not be imported. First error: {e}", ar: "تعذر استيراد {n} عنصر. أول خطأ: {e}" },
  "shop.error": { en: "The import failed", ar: "فشل الاستيراد" },
} as const;

export type Key = keyof typeof D;

export function tr(lang: Lang, key: Key, vars?: Record<string, string>): string {
  let s: string = D[key][lang] ?? D[key].en;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, v);
  return s;
}

export const dirOf = (lang: Lang) => (lang === "ar" ? "rtl" : "ltr");
export const isLang = (v: unknown): v is Lang => v === "en" || v === "ar";
