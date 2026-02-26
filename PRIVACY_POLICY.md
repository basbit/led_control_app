# Политика конфиденциальности (Privacy Policy)

Дата вступления в силу: 2026-02-10

Приложение: **LED Control**

## Коротко

- Приложение не требует регистрации.
- Приложение не собирает и не передаёт персональные данные разработчику.
- BLE используется только для подключения к контроллеру и отправки команд (режим/цвет/яркость/скорость).

## Какие данные мы собираем

Мы не собираем: имя, email, телефон, геолокацию, контакты, фото, файлы, аналитику (если не добавлен отдельный SDK).

## Bluetooth и разрешения

**Android:** для BLE запрашиваются `BLUETOOTH_SCAN`, `BLUETOOTH_CONNECT`; на API < 31 может требоваться Location для сканирования — координаты не используются.

**iOS:** запрашивается доступ к Bluetooth.

## Передача и хранение

Данные никому не передаются. Локальные настройки (режим/цвет/яркость/скорость) могут храниться на устройстве пользователя и не отправляются разработчику.

## Контакты

Вопросы и запрос на удаление локальных данных — через issue в репозитории проекта.

---

## English

# Privacy Policy

Effective: 2026-02-10. App: **LED Control**.

**Summary:** No registration. We do not collect or share personal data. BLE is used only to connect to the controller and send commands (mode/color/brightness/speed).

**Data we collect:** None — no name, email, phone, location, contacts, photos, files, or analytics (unless a separate SDK is added).

**Bluetooth:** Android — BLUETOOTH_SCAN, BLUETOOTH_CONNECT; on API &lt; 31 location may be required for scanning; we do not use coordinates. iOS — Bluetooth access is requested.

**Sharing and storage:** Data is not shared. Local settings may be stored on the user’s device and are not sent to the developer.

**Contact:** For privacy questions or to request deletion of local data, open an issue in the project repository.
