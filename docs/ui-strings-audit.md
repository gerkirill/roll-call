# Ревізія текстів користувацького інтерфейсу

Зріз коду: `main` на коміті `fbac323679417086c5926245227cd01e6990a450`.

Нумерація наскрізна. Щоб замовити зміну, достатньо написати, наприклад: `№ 42 → Новий текст`.

Позначення в `{фігурних дужках}` — дані, які підставляються під час роботи застосунку. У реєстр включено умовні стани, приховані діалоги, системні підтвердження, toast-повідомлення, placeholder-и, `aria-label`, тексти помилок, назву експортованого файлу та PWA/HTML-метадані. Не включено імена військовослужбовців, фактичні дати, числа та повідомлення, які генерує сам браузер або операційна система.

## Діапазони

- **1–4** — Спільна нижня навігація
- **5–16** — Спільні статуси
- **17–31** — Головна сторінка `/`
- **32–57** — Сторінка особового складу `/roster`
- **58–83** — Сторінка активної переклички `/roll-call/:id`
- **84–97** — Журнал `/history` та `/history/:id`
- **98–159** — Налаштування `/settings`
- **160–161** — Сторінка 404
- **162–166** — Браузер, соціальні прев’ю та PWA

## Спільна нижня навігація

1. **`Головна`** — Вкладка нижньої навігації. Джерело: `artifacts/perekladychka/src/components/BottomNav.tsx:13`.
2. **`Склад`** — Вкладка нижньої навігації. Джерело: `artifacts/perekladychka/src/components/BottomNav.tsx:14`.
3. **`Журнал`** — Вкладка нижньої навігації. Джерело: `artifacts/perekladychka/src/components/BottomNav.tsx:15`.
4. **`Налаштування`** — Вкладка нижньої навігації. Джерело: `artifacts/perekladychka/src/components/BottomNav.tsx:16`.

## Спільні статуси

5. **`Присутній`** — Підпис статусу; використовується у перекличці та журналі. Джерело: `artifacts/perekladychka/src/types.ts:6`.
6. **`Як минулого разу`** — Підпис службового статусу. Джерело: `artifacts/perekladychka/src/types.ts:7`.
7. **`Черговий по роті`** — Підпис статусу; використовується у перекличці та журналі. Джерело: `artifacts/perekladychka/src/types.ts:8`.
8. **`Черговий по їдальні`** — Підпис статусу; використовується у перекличці та журналі. Джерело: `artifacts/perekladychka/src/types.ts:9`.
9. **`Хворий`** — Підпис статусу; використовується у перекличці та журналі. Джерело: `artifacts/perekladychka/src/types.ts:10`.
10. **`Відсутній`** — Підпис статусу; використовується у перекличці та журналі. Джерело: `artifacts/perekladychka/src/types.ts:11`.
11. **`✅`** — Емодзі статусу «Присутній». Джерело: `artifacts/perekladychka/src/types.ts:15`.
12. **`🔁`** — Емодзі статусу «Як минулого разу». Джерело: `artifacts/perekladychka/src/types.ts:16`.
13. **`🪖`** — Емодзі статусу «Черговий по роті». Джерело: `artifacts/perekladychka/src/types.ts:17`.
14. **`🍽️`** — Емодзі статусу «Черговий по їдальні». Джерело: `artifacts/perekladychka/src/types.ts:18`.
15. **`🤒`** — Емодзі статусу «Хворий». Джерело: `artifacts/perekladychka/src/types.ts:19`.
16. **`❓`** — Емодзі статусу «Відсутній». Джерело: `artifacts/perekladychka/src/types.ts:20`.

## Головна сторінка `/`

17. **`Перекличка`** — Заголовок сторінки. Джерело: `artifacts/perekladychka/src/pages/HomePage.tsx:36`.
18. **`Особовий склад навчальної роти`** — Підзаголовок. Джерело: `artifacts/perekladychka/src/pages/HomePage.tsx:37`.
19. **`Немає військовослужбовців`** — Порожній стан. Джерело: `artifacts/perekladychka/src/pages/HomePage.tsx:45`.
20. **`Додайте особовий склад, щоб розпочати перекличку.`** — Опис порожнього стану. Джерело: `artifacts/perekladychka/src/pages/HomePage.tsx:46`.
21. **`Додати військовослужбовців`** — Кнопка порожнього стану. Джерело: `artifacts/perekladychka/src/pages/HomePage.tsx:51`.
22. **`Активна перекличка`** — Позначка активної сесії. Джерело: `artifacts/perekladychka/src/pages/HomePage.tsx:64`.
23. **`{відмічено} / {усього}`** — Лічильник активної сесії. Джерело: `artifacts/perekladychka/src/pages/HomePage.tsx:67`.
24. **`Розпочато {HH:mm}`** — Час початку активної сесії. Джерело: `artifacts/perekladychka/src/pages/HomePage.tsx:70`.
25. **`Продовжити`** — Кнопка продовження активної сесії. Джерело: `artifacts/perekladychka/src/pages/HomePage.tsx:77`.
26. **`Нова перекличка`** — Заголовок картки запуску. Джерело: `artifacts/perekladychka/src/pages/HomePage.tsx:82`.
27. **`Всього в строю: {кількість} ос.`** — Кількість особового складу. Джерело: `artifacts/perekladychka/src/pages/HomePage.tsx:84`.
28. **`Розпочати`** — Кнопка запуску нової переклички. Джерело: `artifacts/perekladychka/src/pages/HomePage.tsx:91`.
29. **`Останні переклички`** — Заголовок блоку історії. Джерело: `artifacts/perekladychka/src/pages/HomePage.tsx:101`.
30. **`{d MMMM, HH:mm}`** — Дата і час елемента останніх перекличок. Джерело: `artifacts/perekladychka/src/pages/HomePage.tsx:114`.
31. **`Присутні: {кількість} з {усього}`** — Підсумок елемента останніх перекличок. Джерело: `artifacts/perekladychka/src/pages/HomePage.tsx:117`.

## Сторінка особового складу `/roster`

32. **`Особовий склад`** — Заголовок сторінки. Джерело: `artifacts/perekladychka/src/pages/RosterPage.tsx:80`.
33. **`{кількість} військовослужбовців`** — Підзаголовок із кількістю. Джерело: `artifacts/perekladychka/src/pages/RosterPage.tsx:81`.
34. **`Додати військовослужбовця`** — `aria-label` кнопки додавання. Джерело: `artifacts/perekladychka/src/pages/RosterPage.tsx:86`.
35. **`Список порожній`** — Порожній стан. Джерело: `artifacts/perekladychka/src/pages/RosterPage.tsx:98`.
36. **`Додайте військовослужбовців вручну або вставте готовий список із тексту.`** — Опис порожнього стану. Джерело: `artifacts/perekladychka/src/pages/RosterPage.tsx:100`.
37. **`Імпортувати з тексту`** — Кнопка імпорту. Джерело: `artifacts/perekladychka/src/pages/RosterPage.tsx:109`.
38. **`Додати вручну`** — Кнопка ручного додавання. Джерело: `artifacts/perekladychka/src/pages/RosterPage.tsx:117`.
39. **`Новий запис`** — Заголовок діалогу створення. Джерело: `artifacts/perekladychka/src/pages/RosterPage.tsx:155`.
40. **`Редагувати`** — Заголовок діалогу редагування. Джерело: `artifacts/perekladychka/src/pages/RosterPage.tsx:155`.
41. **`Видалити військовослужбовця?`** — Системний `confirm` перед видаленням. Джерело: `artifacts/perekladychka/src/pages/RosterPage.tsx:176`.
42. **`Імпорт особового складу`** — Заголовок прихованого діалогу імпорту. Джерело: `artifacts/perekladychka/src/pages/RosterPage.tsx:198`.
43. **`Один військовослужбовець на кожному рядку.`** — Опис діалогу імпорту. Джерело: `artifacts/perekladychka/src/pages/RosterPage.tsx:200`.
44. **`Скопійований список`** — Підпис поля імпорту. Джерело: `artifacts/perekladychka/src/pages/RosterPage.tsx:210`.
45. **`ШЕВЧЕНКО тарас\nПЕТРЕНКО ІВАН ІВАНОВИЧ\nКОВАЛЕНКО а. б.`** — Placeholder поля імпорту. Джерело: `artifacts/perekladychka/src/pages/RosterPage.tsx:216`.
46. **`Порожні рядки буде пропущено, зайві пробіли прибрано, регістр імен нормалізовано.`** — Пояснення під полем імпорту. Джерело: `artifacts/perekladychka/src/pages/RosterPage.tsx:222`.
47. **`Буде імпортовано`** — Підпис лічильника імпорту. Джерело: `artifacts/perekladychka/src/pages/RosterPage.tsx:227`.
48. **`Імпортувати ({кількість})`** — Кнопка імпорту; без дужок, коли список порожній. Джерело: `artifacts/perekladychka/src/pages/RosterPage.tsx:237`.
49. **`Перетягнути`** — `aria-label` ручки сортування. Джерело: `artifacts/perekladychka/src/pages/RosterPage.tsx:276`.
50. **`Прізвище (з наголосом)`** — Підпис поля прізвища. Джерело: `artifacts/perekladychka/src/pages/RosterPage.tsx:334`.
51. **`Шевченко`** — Placeholder поля прізвища. Джерело: `artifacts/perekladychka/src/pages/RosterPage.tsx:340`.
52. **`Наголос:`** — Підпис вибору наголосу. Джерело: `artifacts/perekladychka/src/pages/RosterPage.tsx:347`.
53. **`✕ скинути`** — Кнопка скидання наголосу. Джерело: `artifacts/perekladychka/src/pages/RosterPage.tsx:369`.
54. **`Ім'я або ініціали`** — Підпис поля імені. Джерело: `artifacts/perekladychka/src/pages/RosterPage.tsx:378`.
55. **`(необов'язково)`** — Додаток до підпису поля імені. Джерело: `artifacts/perekladychka/src/pages/RosterPage.tsx:379`.
56. **`Т. Г.`** — Placeholder поля імені. Джерело: `artifacts/perekladychka/src/pages/RosterPage.tsx:385`.
57. **`Зберегти`** — Кнопка форми. Джерело: `artifacts/perekladychka/src/pages/RosterPage.tsx:405`.

## Сторінка активної переклички `/roll-call/:id`

58. **`Час невідомий`** — Fallback для некоректного часу статусу. Джерело: `artifacts/perekladychka/src/pages/RollCallPage.tsx:15`.
59. **`Сьогодні {HH:mm}`** — Формат часу статусу за сьогодні. Джерело: `artifacts/perekladychka/src/pages/RollCallPage.tsx:18`.
60. **`Вчора {HH:mm}`** — Формат часу статусу за вчора. Джерело: `artifacts/perekladychka/src/pages/RollCallPage.tsx:19`.
61. **`{dd.MM HH:mm}`** — Формат часу статусу для давніших дат. Джерело: `artifacts/perekladychka/src/pages/RollCallPage.tsx:20`.
62. **`Сесію не знайдено.`** — Помилка відсутньої сесії. Джерело: `artifacts/perekladychka/src/pages/RollCallPage.tsx:35`.
63. **`На головну`** — Кнопка з помилки відсутньої сесії. Джерело: `artifacts/perekladychka/src/pages/RollCallPage.tsx:36`.
64. **`Завершити перекличку?`** — Системний `confirm` завершення. Джерело: `artifacts/perekladychka/src/pages/RollCallPage.tsx:42`.
65. **`Перекличка`** — Заголовок сторінки. Джерело: `artifacts/perekladychka/src/pages/RollCallPage.tsx:116`.
66. **`{d MMMM, HH:mm}`** — Дата і час сесії у шапці. Джерело: `artifacts/perekladychka/src/pages/RollCallPage.tsx:119`.
67. **`Завершити`** — Кнопка завершення. Джерело: `artifacts/perekladychka/src/pages/RollCallPage.tsx:127`.
68. **`Попередня:`** — Підпис статистики попередньої сесії. Джерело: `artifacts/perekladychka/src/pages/RollCallPage.tsx:136`.
69. **`Поточна:`** — Підпис статистики поточної сесії. Джерело: `artifacts/perekladychka/src/pages/RollCallPage.tsx:151`.
70. **`—`** — Порожнє значення статистики. Джерело: `artifacts/perekladychka/src/pages/RollCallPage.tsx:144,147,158`.
71. **`Скасувати останню відмітку: {ім'я}`** — `aria-label` активної кнопки скасування. Джерело: `artifacts/perekladychka/src/pages/RollCallPage.tsx:166`.
72. **`Немає відміток для скасування`** — `aria-label` і текст неактивної кнопки скасування. Джерело: `artifacts/perekladychka/src/pages/RollCallPage.tsx:167,174`.
73. **`Скасувати: {ім'я}`** — Текст активної кнопки скасування. Джерело: `artifacts/perekladychka/src/pages/RollCallPage.tsx:173`.
74. **`Не відмічені`** — Заголовок секції. Джерело: `artifacts/perekladychka/src/pages/RollCallPage.tsx:186`.
75. **`Минулий запис:`** — Підпис попереднього статусу. Джерело: `artifacts/perekladychka/src/pages/RollCallPage.tsx:208`.
76. **`Немає даних`** — Порожній попередній статус. Джерело: `artifacts/perekladychka/src/pages/RollCallPage.tsx:214`.
77. **`Як минулого: {емодзі статусу}`** — Кнопка повторення попереднього статусу. Джерело: `artifacts/perekladychka/src/pages/RollCallPage.tsx:232`.
78. **`Наряд рота`** — Скорочений підпис кнопки статусу. Джерело: `artifacts/perekladychka/src/pages/RollCallPage.tsx:241`.
79. **`Наряд їдальня`** — Скорочений підпис кнопки статусу. Джерело: `artifacts/perekladychka/src/pages/RollCallPage.tsx:248`.
80. **`Всіх відмічено!`** — Стан завершення відміток. Джерело: `artifacts/perekladychka/src/pages/RollCallPage.tsx:277`.
81. **`Перевірте список нижче і завершіть перекличку.`** — Опис стану завершення відміток. Джерело: `artifacts/perekladychka/src/pages/RollCallPage.tsx:278`.
82. **`Відмічені`** — Заголовок секції. Джерело: `artifacts/perekladychka/src/pages/RollCallPage.tsx:289`.
83. **`Скинути відмітку?`** — Системний `confirm` при натисканні на відмічений запис. Джерело: `artifacts/perekladychka/src/pages/RollCallPage.tsx:301`.

## Журнал `/history` та `/history/:id`

84. **`Запис не знайдено`** — Помилка відсутнього запису журналу. Джерело: `artifacts/perekladychka/src/pages/HistoryPage.tsx:28`.
85. **`Повернутись`** — Кнопка з помилки відсутнього запису. Джерело: `artifacts/perekladychka/src/pages/HistoryPage.tsx:29`.
86. **`Журнал за {d MMM}`** — Заголовок деталей сесії. Джерело: `artifacts/perekladychka/src/pages/HistoryPage.tsx:55`.
87. **`{HH:mm} • Тривалість: {хвилини} хв`** — Підзаголовок деталей сесії. Джерело: `artifacts/perekladychka/src/pages/HistoryPage.tsx:57`.
88. **`Усі ({кількість})`** — Фільтр деталей сесії. Джерело: `artifacts/perekladychka/src/pages/HistoryPage.tsx:75`.
89. **`Лише відсутні ({кількість})`** — Фільтр деталей сесії. Джерело: `artifacts/perekladychka/src/pages/HistoryPage.tsx:87`.
90. **`Не відмічено`** — Статус без відмітки. Джерело: `artifacts/perekladychka/src/pages/HistoryPage.tsx:107`.
91. **`Усі військовослужбовці були в строю.`** — Порожній стан фільтра відсутніх. Джерело: `artifacts/perekladychka/src/pages/HistoryPage.tsx:116`.
92. **`Журнал перекличок`** — Заголовок списку історії. Джерело: `artifacts/perekladychka/src/pages/HistoryPage.tsx:133`.
93. **`Історія всіх завершених сесій`** — Підзаголовок списку історії. Джерело: `artifacts/perekladychka/src/pages/HistoryPage.tsx:134`.
94. **`Жодної завершеної переклички.`** — Порожній стан історії. Джерело: `artifacts/perekladychka/src/pages/HistoryPage.tsx:141`.
95. **`{d MMMM yyyy}`** — Дата картки сесії. Джерело: `artifacts/perekladychka/src/pages/HistoryPage.tsx:157`.
96. **`{HH:mm} • {хвилини} хв`** — Час і тривалість картки сесії. Джерело: `artifacts/perekladychka/src/pages/HistoryPage.tsx:160-165`.
97. **`{присутні} / {усього} в строю`** — Підсумок картки сесії. Джерело: `artifacts/perekladychka/src/pages/HistoryPage.tsx:175`.

## Налаштування `/settings`

98. **`невідома помилка`** — Fallback для невідомої помилки; використовується також в експорті. Джерело: `artifacts/perekladychka/src/pages/SettingsPage.tsx:23; artifacts/perekladychka/src/hooks/useImportExport.ts:23`.
99. **`резервний метод повернув false`** — Деталь помилки резервного копіювання. Джерело: `artifacts/perekladychka/src/pages/SettingsPage.tsx:40`.
100. **`Не вдалося підготувати текст для надсилання. {помилка}`** — Toast помилки підготовки тексту. Джерело: `artifacts/perekladychka/src/pages/SettingsPage.tsx:125`.
101. **`Системне надсилання недоступне, тому текст скопійовано. {помилка}`** — Toast успішного fallback-копіювання. Джерело: `artifacts/perekladychka/src/pages/SettingsPage.tsx:143`.
102. **`Текст скопійовано в буфер обміну.`** — Toast успішного копіювання. Джерело: `artifacts/perekladychka/src/pages/SettingsPage.tsx:144`.
103. **`системне надсилання: {помилка}`** — Фрагмент діагностики у toast. Джерело: `artifacts/perekladychka/src/pages/SettingsPage.tsx:151`.
104. **`резервне копіювання: {помилка}`** — Фрагмент діагностики у toast. Джерело: `artifacts/perekladychka/src/pages/SettingsPage.tsx:152`.
105. **`Не вдалося автоматично передати текст ({деталі}). Рядок показано для ручного копіювання.`** — Toast помилки автоматичної передачі. Джерело: `artifacts/perekladychka/src/pages/SettingsPage.tsx:154`.
106. **`Повторюю підготовку. Попередня помилка: {помилка}`** — Toast повторної підготовки. Джерело: `artifacts/perekladychka/src/pages/SettingsPage.tsx:159`.
107. **`сторінка відкрита без HTTPS`** — Причина fallback-копіювання. Джерело: `artifacts/perekladychka/src/pages/SettingsPage.tsx:169`.
108. **`Web Share API недоступний у цьому браузері або WebView`** — Причина fallback-копіювання. Джерело: `artifacts/perekladychka/src/pages/SettingsPage.tsx:173`.
109. **`Текст передано через системне меню надсилання.`** — Toast успішного надсилання тексту. Джерело: `artifacts/perekladychka/src/pages/SettingsPage.tsx:189`.
110. **`JSON-файл передано через системне меню надсилання.`** — Toast успішного надсилання файлу. Джерело: `artifacts/perekladychka/src/pages/SettingsPage.tsx:208`.
111. **`Системне надсилання файлів недоступне, тому JSON-файл завантажено.`** — Toast fallback-завантаження файлу. Джерело: `artifacts/perekladychka/src/pages/SettingsPage.tsx:210`.
112. **`Не вдалося експортувати JSON-файл. {помилка}`** — Toast помилки експорту; два обробники. Джерело: `artifacts/perekladychka/src/pages/SettingsPage.tsx:212,215`.
113. **`Відкриття меню…`** — Стан кнопки надсилання тексту. Джерело: `artifacts/perekladychka/src/pages/SettingsPage.tsx:222`.
114. **`Підготовка тексту…`** — Стан кнопки надсилання тексту. Джерело: `artifacts/perekladychka/src/pages/SettingsPage.tsx:224`.
115. **`Повторити підготовку`** — Стан кнопки після помилки. Джерело: `artifacts/perekladychka/src/pages/SettingsPage.tsx:226`.
116. **`Поділитися текстом`** — Кнопка надсилання тексту. Джерело: `artifacts/perekladychka/src/pages/SettingsPage.tsx:227`.
117. **`Готуємо текст для надсилання в месенджері`** — Підзаголовок під час підготовки. Джерело: `artifacts/perekladychka/src/pages/SettingsPage.tsx:230`.
118. **`Не вдалося підготувати рядок. Натисніть, щоб повторити.`** — Підзаголовок після помилки; нижче додається технічна помилка. Джерело: `artifacts/perekladychka/src/pages/SettingsPage.tsx:232`.
119. **`Браузер відкриває системне меню надсилання`** — Підзаголовок під час відкриття share sheet. Джерело: `artifacts/perekladychka/src/pages/SettingsPage.tsx:234`.
120. **`Надіслати через системне меню · {кількість} символів`** — Підзаголовок готового тексту. Джерело: `artifacts/perekladychka/src/pages/SettingsPage.tsx:235`.
121. **`додано {кількість} бійців`** — Фрагмент підсумку імпорту. Джерело: `artifacts/perekladychka/src/pages/SettingsPage.tsx:239`.
122. **`оновлено {кількість}`** — Фрагмент підсумку імпорту. Джерело: `artifacts/perekladychka/src/pages/SettingsPage.tsx:240`.
123. **`додано {кількість} переклички`** — Фрагмент підсумку імпорту. Джерело: `artifacts/perekladychka/src/pages/SettingsPage.tsx:241`.
124. **`нічого нового`** — Підсумок імпорту без змін. Джерело: `artifacts/perekladychka/src/pages/SettingsPage.tsx:242`.
125. **`Імпорт завершено: {підсумок}.`** — Toast успішного імпорту. Джерело: `artifacts/perekladychka/src/pages/SettingsPage.tsx:252,265`.
126. **`Помилка імпорту. Файл пошкоджений або має невірний формат.`** — Toast помилки імпорту файлу. Джерело: `artifacts/perekladychka/src/pages/SettingsPage.tsx:253`.
127. **`Не вдалося розпізнати рядок. Перевірте, чи він починається з «pk1:».`** — Помилка імпорту з тексту. Джерело: `artifacts/perekladychka/src/pages/SettingsPage.tsx:262`.
128. **`Налаштування`** — Заголовок сторінки. Джерело: `artifacts/perekladychka/src/pages/SettingsPage.tsx:273`.
129. **`Закрити повідомлення`** — `aria-label` кнопки закриття toast. Джерело: `artifacts/perekladychka/src/pages/SettingsPage.tsx:278`.
130. **`Про додаток`** — Заголовок секції. Джерело: `artifacts/perekladychka/src/pages/SettingsPage.tsx:283`.
131. **`Перекличка`** — Назва додатка у картці. Джерело: `artifacts/perekladychka/src/pages/SettingsPage.tsx:286`.
132. **`Версія 1.0.0`** — Версія у картці. Джерело: `artifacts/perekladychka/src/pages/SettingsPage.tsx:286`.
133. **`Швидкий інструмент для ведення переклички. Всі дані зберігаються виключно на вашому пристрої.`** — Опис додатка. Джерело: `artifacts/perekladychka/src/pages/SettingsPage.tsx:286`.
134. **`Резервне копіювання`** — Заголовок секції. Джерело: `artifacts/perekladychka/src/pages/SettingsPage.tsx:291`.
135. **`Підготовка файлу…`** — Стан кнопки файлу. Джерело: `artifacts/perekladychka/src/pages/SettingsPage.tsx:295`.
136. **`Поділитися файлом`** — Кнопка надсилання файлу. Джерело: `artifacts/perekladychka/src/pages/SettingsPage.tsx:295`.
137. **`Браузер готує JSON-файл`** — Підзаголовок під час підготовки файлу. Джерело: `artifacts/perekladychka/src/pages/SettingsPage.tsx:296`.
138. **`Надіслати резервну копію у форматі JSON`** — Підзаголовок кнопки файлу. Джерело: `artifacts/perekladychka/src/pages/SettingsPage.tsx:296`.
139. **`Імпортувати з файлу`** — Кнопка імпорту файлу. Джерело: `artifacts/perekladychka/src/pages/SettingsPage.tsx:302`.
140. **`Додати дані з резервної копії до наявних`** — Підзаголовок імпорту файлу. Джерело: `artifacts/perekladychka/src/pages/SettingsPage.tsx:302`.
141. **`Автоматичне надсилання і копіювання не вдалося`** — Заголовок блоку ручного копіювання. Джерело: `artifacts/perekladychka/src/pages/SettingsPage.tsx:315`.
142. **`Закрити ручне копіювання`** — `aria-label` кнопки закриття ручного копіювання. Джерело: `artifacts/perekladychka/src/pages/SettingsPage.tsx:316`.
143. **`Натисніть на поле, виділіть весь текст і скористайтеся системною командою «Копіювати».`** — Інструкція ручного копіювання. Джерело: `artifacts/perekladychka/src/pages/SettingsPage.tsx:319`.
144. **`Повторна спроба…`** — Стан кнопки повторної спроби. Джерело: `artifacts/perekladychka/src/pages/SettingsPage.tsx:320`.
145. **`Спробувати ще раз`** — Кнопка повторної спроби. Джерело: `artifacts/perekladychka/src/pages/SettingsPage.tsx:320`.
146. **`Імпортувати з тексту`** — Кнопка імпорту рядка. Джерело: `artifacts/perekladychka/src/pages/SettingsPage.tsx:325`.
147. **`Поєднати дані з тексту з наявними`** — Підзаголовок імпорту рядка. Джерело: `artifacts/perekladychka/src/pages/SettingsPage.tsx:325`.
148. **`Вставте рядок pk1:…`** — Заголовок відкритого блоку імпорту рядка. Джерело: `artifacts/perekladychka/src/pages/SettingsPage.tsx:329`.
149. **`pk1:H4sI…`** — Placeholder імпорту рядка. Джерело: `artifacts/perekladychka/src/pages/SettingsPage.tsx:332`.
150. **`Об’єднати`** — Кнопка імпорту рядка. Джерело: `artifacts/perekladychka/src/pages/SettingsPage.tsx:334`.
151. **`Небезпечна зона`** — Заголовок секції. Джерело: `artifacts/perekladychka/src/pages/SettingsPage.tsx:341`.
152. **`Видалити всі дані`** — Кнопка очищення. Джерело: `artifacts/perekladychka/src/pages/SettingsPage.tsx:344`.
153. **`Бійці та переклички будуть видалені`** — Підзаголовок кнопки очищення. Джерело: `artifacts/perekladychka/src/pages/SettingsPage.tsx:344`.
154. **`Ви впевнені? Це незворотно — всі бійці та переклички будуть видалені.`** — Підтвердження очищення. Джерело: `artifacts/perekladychka/src/pages/SettingsPage.tsx:347`.
155. **`Скасувати`** — Кнопка скасування очищення. Джерело: `artifacts/perekladychka/src/pages/SettingsPage.tsx:349`.
156. **`Видалити`** — Кнопка підтвердження очищення. Джерело: `artifacts/perekladychka/src/pages/SettingsPage.tsx:350`.
157. **`Всі дані видалено.`** — Toast після очищення. Джерело: `artifacts/perekladychka/src/pages/SettingsPage.tsx:350`.
158. **`цей браузер не підтримує CompressionStream`** — Технічна помилка, яка може бути показана під час підготовки тексту. Джерело: `artifacts/perekladychka/src/utils/share.ts:39`.
159. **`perekladychka-{YYYY-MM-DD}.json`** — Ім'я експортованого або надісланого файлу. Джерело: `artifacts/perekladychka/src/hooks/useImportExport.ts:31`.

## Сторінка 404

160. **`404 Page Not Found`** — Заголовок невідомого маршруту. Джерело: `artifacts/perekladychka/src/pages/not-found.tsx:14`.
161. **`Did you forget to add the page to the router?`** — Опис невідомого маршруту. Джерело: `artifacts/perekladychka/src/pages/not-found.tsx:19`.

## Браузер, соціальні прев’ю та PWA

162. **`Перекличка`** — HTML title, Open Graph title і Twitter title. Джерело: `artifacts/perekladychka/index.html:8,11,15`.
163. **`Перекличка — built on Replit. Update this description to reflect the app.`** — Meta description, Open Graph description і Twitter description. Джерело: `artifacts/perekladychka/index.html:9,12,16`.
164. **`Перекличка`** — PWA `name`. Джерело: `artifacts/perekladychka/vite.config.ts:42`.
165. **`Перекличка`** — PWA `short_name`. Джерело: `artifacts/perekladychka/vite.config.ts:43`.
166. **`Перекличка особового складу`** — PWA `description`. Джерело: `artifacts/perekladychka/vite.config.ts:44`.
