# SkyLink DBMS Discussion Guide

الملف ده معمول عشان لما الدكتور يناقشكم في قاعدة البيانات تقدروا تربطوا بين مفاهيم المحاضرات والكود الحقيقي.

## 1. الفكرة العامة

SkyLink هو نظام حجز طيران. الداتا الأساسية هي:

- `Users`: المستخدمين والأدمن.
- `Countries`: جدول مرجعي للدول.
- `Airports`: المطارات، وكل مطار ينتمي لدولة.
- `Airlines`: شركات الطيران، وكل شركة تنتمي لدولة.
- `Aircraft`: الطائرات التابعة لشركة طيران.
- `Flights`: الرحلات بين مطار مغادرة ومطار وصول.
- `Seats`: كراسي كل طائرة.
- `Bookings`: الحجز نفسه.
- `BookingPassengers`: الركاب داخل الحجز.
- `Payments`: الدفع المرتبط بالحجز.
- `Currencies`, `Discounts`, `Notifications`: بيانات مساعدة.

## 2. ERD و Mapping

المحاضرات 2 و3 و4 ركزت على إننا نبدأ من كيانات وعلاقات ثم نحولها لجداول.

أمثلة من المشروع:

- العلاقة `Country -> Airports` هي 1:N، لذلك `Airports.country_id` مفتاح أجنبي.
- العلاقة `Airline -> Aircraft` هي 1:N، لذلك `Aircraft.airline_id` مفتاح أجنبي.
- العلاقة `User -> Bookings` هي 1:N، لذلك `Bookings.user_id` مفتاح أجنبي.
- العلاقة `Booking -> BookingPassengers` هي 1:N، لذلك `BookingPassengers.booking_id` مفتاح أجنبي.
- الرحلة لها مطار مغادرة ومطار وصول، لذلك `Flights` فيه مفتاحين أجانب لنفس جدول `Airports`: `departure_airport_id` و`arrival_airport_id`.

## 3. Normalization

كان في تكرار لاسم الدولة داخل `Airlines` و`Airports`. دلوقتي اسم الدولة موجود مرة واحدة في `Countries`، والجداول الأخرى تحفظ `country_id` فقط.

ليه ده أفضل؟

- يقلل التكرار.
- يمنع update anomaly: لو اسم دولة اتغير، نعدله في صف واحد فقط.
- يحافظ على referential integrity بالـ foreign key.

عشان الواجهة لسه تحتاج تعرض `country` كنص، أضفنا views:

- `dbo.vAirportDirectory`
- `dbo.vAirlineDirectory`

الـ view ترجّع اسم الدولة من `Countries` بدون تخزينه مرتين.

## 4. Constraints

المحاضرة 5 تكلمت عن القيود.

أمثلة موجودة في `database/schema.sql`:

- `PRIMARY KEY`: مثل `Users.user_id`.
- `UNIQUE`: مثل `Users.email`, `Flights.flight_code`, `Seats(aircraft_id, seat_number)`.
- `FOREIGN KEY`: مثل `Bookings.user_id -> Users.user_id`.
- `CHECK`: مثل `arrival_time > departure_time`, و`price >= 0`, و`role IN ('admin', 'customer')`.
- `DEFAULT`: مثل `created_at DEFAULT SYSUTCDATETIME()`.

شرح سريع للدكتور: القيود تمنع الداتا الغلط قبل ما تدخل قاعدة البيانات، حتى لو حصل bug في الكود.

## 5. SQL Queries

المحاضرات 6 و7 و8 ركزت على `SELECT`, `WHERE`, `ORDER BY`, `GROUP BY`, `HAVING`, `LIKE`, `UNION`, و aggregate functions.

أمثلة جاهزة للتشغيل في:

`database/dbms-practice-queries.sql`

أمثلة من المشروع:

- أرخص الرحلات النشطة: `WHERE status = 'active' ORDER BY price`.
- متوسط سعر الرحلات لكل شركة: `AVG(price) GROUP BY airline_name`.
- الدول الموجودة في المطارات والشركات: `UNION`.
- البحث في أسماء المطارات: `LIKE`.

## 6. Views

المحاضرة 9 عن Views.

أضفنا:

- `vAirportDirectory`: تعرض المطارات مع اسم الدولة.
- `vAirlineDirectory`: تعرض الشركات مع اسم الدولة.
- `vFlightSchedule`: تجمع الرحلة مع شركة الطيران، الطائرة، مطار المغادرة، ومطار الوصول.
- `vBookingDetails`: تعرض بيانات الحجز بشكل مناسب للتقارير.

شرح مهم: الـ view لا تخزن نسخة جديدة من الداتا، لكنها تحفظ query جاهزة. لذلك أي تغيير في الجداول يظهر في الـ view مباشرة.

## 7. Transactions

الكود يستخدم transactions في العمليات التي لازم تتم بالكامل أو تفشل بالكامل.

أمثلة:

- إنشاء الحجز في `server/src/controllers/bookingController.js`.
- تأكيد الدفع في `server/src/controllers/paymentController.js`.
- حذف مستخدم وما يرتبط به في `server/src/controllers/userController.js`.

شرح سريع: لما نحجز، لازم يتم إدخال `Bookings` و`BookingPassengers` مع بعض. لو إدخال راكب فشل، نعمل rollback للحجز كله.

## 8. DCL / Authorization

المحاضرة 10 عن الصلاحيات.

أضفنا ملف:

`database/security.sql`

فيه role للقراءة فقط `SkyLinkReadOnly` وrole للتطبيق `SkyLinkAppWriter`.

شرح سريع: المستخدم العادي لا يحتاج صلاحية مباشرة على كل شيء. ندي صلاحيات مناسبة حسب الدور.

## 9. EER

المحاضرة 11 عن superclass/subclass.

في المشروع عندنا مثال بسيط داخل `Users.role`:

- كلهم `Users`.
- لكن السلوك يختلف بين `admin` و`customer`.

لو أردنا تطبيق EER بشكل أقوى، ممكن نعمل جدول `Admins` وجدول `Customers` وكل واحد فيهم يشير إلى `Users.user_id`. حاليا استخدمنا `role` لأنه كافي لحجم المشروع وأسهل في الكود.

## أسئلة متوقعة وإجابات قصيرة

**ليه استخدمنا `Countries` بدل تخزين اسم الدولة في كل جدول؟**  
عشان normalization وتقليل التكرار، ونجيب الاسم وقت العرض بالـ views.

**ليه `Flights` فيه مفتاحين لـ `Airports`؟**  
لأن نفس entity مستخدمة في دورين مختلفين: مطار مغادرة ومطار وصول.

**إيه فائدة الـ transaction في الحجز؟**  
الحجز والركاب عملية واحدة منطقيا. يا يتم إدخالهم كلهم، يا يتم rollback.

**ليه استخدمنا trigger لمنع تكرار الكرسي؟**  
لأن التحقق محتاج يربط `BookingPassengers` مع `Bookings` لمعرفة `flight_id`.

**إيه الفرق بين table و view؟**  
الجدول يخزن بيانات، أما الـ view يخزن query ويعرض بيانات real-time من الجداول.

**فين SQL injection متمنع؟**  
في Node backend بنستخدم `.input(...)` مع مكتبة `mssql` بدل دمج قيم المستخدم داخل نص SQL مباشرة.

