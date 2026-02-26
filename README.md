# LED Control (Expo / React Native)

Мобильное приложение для управления светодиодной лентой через **Bluetooth Low Energy (BLE)**.

## Возможности

- Подключение к устройству по BLE
- Переключение режимов работы с телефона
- Настройка яркости/скорости
- Выбор цвета или **диапазона цветов** (в т.ч. для BPM)

## Важно про BLE и Expo Go

Используется `react-native-ble-plx`, поэтому **Expo Go не подходит** (нужен нативный билд).

Для разработки используй локальную сборку: `expo run:android` / `expo run:ios`.

## Требования

- Node.js (рекомендуется LTS)
- Yarn 1.x
- Android Studio (для Android)
- Xcode (для iOS)

## Установка

```bash
cd LEDControlApp
yarn install
```

## Запуск (локально)

Android:

```bash
yarn android
```

iOS:

```bash
yarn ios
```

## Линт

```bash
yarn lint
```

## Режимы (ID, отправляются по BLE)

0. Северное сияние (Aurora) — поддерживает **диапазон цветов**
1. Авторежим
2. BPM — поддерживает **диапазон цветов**
3. Радужная волна
4. Радужный импульс
5. Бегущая радуга
6. Стробоскоп
7. Волна и импульс
8. Цикл цветов
9. Дыхание радугой

## BLE UUID

См. [`src/constants/ble.js`](./src/constants/ble.js).

---

## English

# LED Control (Expo / React Native)

Mobile app to control an addressable LED strip over **Bluetooth Low Energy (BLE)**.

### Features

- Connect to device via BLE
- Switch modes from the phone
- Adjust brightness and speed
- Single color or **color range** (e.g. for BPM)

### BLE and Expo Go

Uses `react-native-ble-plx`, so **Expo Go is not supported** — a native build is required. Use local build: `expo run:android` / `expo run:ios`.

### Requirements

Node.js (LTS), Yarn 1.x, Android Studio (Android), Xcode (iOS).

### Install & run

```bash
yarn install
yarn android   # or yarn ios
```

### Lint

`yarn lint`

### Modes (IDs sent over BLE)

0 Aurora (color range), 1 Auto, 2 BPM (color range), 3 Rainbow wave, 4 Rainbow pulse, 5 Running rainbow, 6 Strobe, 7 Wave and pulse, 8 Color cycle, 9 Rainbow breathe.

BLE UUIDs: see [`src/constants/ble.js`](./src/constants/ble.js).
