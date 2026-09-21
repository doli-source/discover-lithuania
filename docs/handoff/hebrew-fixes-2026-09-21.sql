-- Hebrew copy corrections — items 10-24 of the 21 Sep 2026 review.
-- Run in the Supabase SQL editor. One transaction: all or nothing.

BEGIN;

-- 10. adata-bar
UPDATE place_translations SET niv_tip = 'בר קוקטיילים אינטימי. מומלץ להזמין מקום מראש.'
 WHERE lang='he' AND place_id=(SELECT id FROM places WHERE slug='adata-bar');

-- 11. ac-hotel-vilnius
UPDATE place_translations SET niv_tip = 'מלון יפה ומודרני בלב וילנה — מרווח, עם לובי אלגנטי ומרשים שיוצר רושם ראשוני נהדר. חדרים נוחים ומעוצבים, וארוחת בוקר מצוינת ומגוונת. מושלם לנסיעת עסקים או לחופשה עירונית מפנקת.'
 WHERE lang='he' AND place_id=(SELECT id FROM places WHERE slug='ac-hotel-vilnius');

-- 12. 3m-zos-rooftop-bar
UPDATE place_translations SET niv_tip = 'על גג התיאטרון הלאומי לדרמה — נוף פנורמי של מגדל גדימינס והקתדרלה, לצד מנות מזרח-תיכוניות לשיתוף.'
 WHERE lang='he' AND place_id=(SELECT id FROM places WHERE slug='3m-zos-rooftop-bar');

-- 13. 2-vir-jai
UPDATE place_translations SET niv_tip = 'מסעדה קטנה של שני שפים מקומיים. דירוג מושלם, אוכל ליטאי אמיתי. בדיוק מה שצריך באמצע היום בווילנה.'
 WHERE lang='he' AND place_id=(SELECT id FROM places WHERE slug='2-vir-jai');

-- 14. le-travi
UPDATE place_translations SET niv_tip = 'ביסטרו איטלקי חמים — פסטה מעולה ואווירה אינטימית.'
 WHERE lang='he' AND place_id=(SELECT id FROM places WHERE slug='le-travi');

-- 15. osh-halal
UPDATE place_translations SET niv_tip = 'פלוב אוזבקי אמיתי ברחוב Kalvarijų — מנות גדולות ומהאוכל הכי אמיתי ממרכז אסיה בווילנה. מקום שהמקומיים חוזרים אליו שוב ושוב.'
 WHERE lang='he' AND place_id=(SELECT id FROM places WHERE slug='osh-halal');

-- 16. spricas-brunch
UPDATE place_translations SET niv_tip = 'אחד ממקומות הברנץ'' הכי מדוברים בליטא — צלחות יצירתיות, ביצי בנדיקט וטוסט סטייק עמוס שמחזיר אנשים שוב ושוב.'
 WHERE lang='he' AND place_id=(SELECT id FROM places WHERE slug='spricas-brunch');

-- 17. trakai-island-castle
UPDATE place_translations SET niv_tip = 'טירה מהמאה ה-14 עולה מתוך אגם — הדימוי הכי אייקוני של ליטא. שכרו סירת חתירה וחתרו סביב האגם!'
 WHERE lang='he' AND place_id=(SELECT id FROM places WHERE slug='trakai-island-castle');

-- 18. kaunas-castle
UPDATE place_translations SET niv_tip = 'אחת ממצודות האבן העתיקות ביותר בליטא, עומדת בצומת שני נהרות מאז המאה ה-14. קטנה אבל אטמוספרית — תזכורת שקטה לכמה עתיקה העיר הזאת.'
 WHERE lang='he' AND place_id=(SELECT id FROM places WHERE slug='kaunas-castle');

-- 19. astriosios-kirsnos-dvaras
UPDATE place_translations SET niv_tip = 'אחוזה היסטורית מרהיבה באזור הכפרי השקט של סובלקיה, ליד הגבול הליטאי-פולני. ארכיטקטורה עתיקה יפיפייה וסביבה שלווה — מקום שמרגיש כאילו הזמן נעצר בו.'
 WHERE lang='he' AND place_id=(SELECT id FROM places WHERE slug='astriosios-kirsnos-dvaras');

-- 20. horizons-lake-resort
UPDATE place_translations SET niv_tip = 'כדאי להזמין את השאלט עם הג׳קוזי על המרפסת. בסיס מושלם לחקור את הפארק הלאומי דזוקיה.'
 WHERE lang='he' AND place_id=(SELECT id FROM places WHERE slug='horizons-lake-resort');

-- 21. mi-ko-rojus
UPDATE place_translations SET niv_tip = 'בקתה ביער ליד ריטאוס עם בריכה חיצונית פרטית וחוף פרטי — ללא אינטרנט לפי תכנון, עם לוחות סולאריים ואורנים לחברה.'
 WHERE lang='he' AND place_id=(SELECT id FROM places WHERE slug='mi-ko-rojus');

-- 22. brut-wine-restaurant-zarasai
UPDATE place_translations SET niv_tip = 'בשרים על פחם ורשימת יין מצוינת — הארוחה המסוגננת ביותר בזרסאי.'
 WHERE lang='he' AND place_id=(SELECT id FROM places WHERE slug='brut-wine-restaurant-zarasai');

-- 23. wake-inn-zarasai
UPDATE place_translations SET niv_tip = 'וייקבורדינג, פארק מים מתנפח וחוף חול על האגם — אחר הצהריים הכי מרגש בזאראסאי.'
 WHERE lang='he' AND place_id=(SELECT id FROM places WHERE slug='wake-inn-zarasai');

-- 24. zarasai-museum
UPDATE place_translations SET niv_tip = 'קטן אבל אמיתי — עקבות זאראסאי היהודית, מלאכות של עיר האגמים, ותצלומים ממאה שנשכחה.'
 WHERE lang='he' AND place_id=(SELECT id FROM places WHERE slug='zarasai-museum');

COMMIT;
