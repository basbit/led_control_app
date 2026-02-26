# LED Control (Expo / React Native)

Мобильное приложение для управления светодиодной лентой через **Bluetooth Low Energy (BLE)**.

## Возможности

- Подключение к устройству по BLE
- Переключение режимов работы с телефона
- Настройка яркости/скорости
- Выбор цвета или **диапазона цветов** (в т.ч. для BPM)

## Важно про BLE и Expo Go

Используется `react-native-ble-plx`, поэтому **Expo Go не подходит** (нужен нативный билд).

Для разработки есть два рабочих варианта:

- **Локальная сборка**: `expo run:android` / `expo run:ios`
- **EAS dev build** (рекомендуется для команды/CI): будет настроено в `eas.json`

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

## EAS Build / Submit (стор и dev build)

Разовая инициализация:

```bash
npx eas-cli login
npx eas-cli build:configure
```

Dev build (для тестов BLE на реальном устройстве):

```bash
npx eas-cli build -p android --profile development
npx eas-cli build -p ios --profile development
```

Production build + submit:

```bash
npx eas-cli build -p android --profile production
npx eas-cli submit -p android --profile production

npx eas-cli build -p ios --profile production
npx eas-cli submit -p ios --profile production
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

Uses `react-native-ble-plx`, so **Expo Go is not supported** — a native build is required. Options: **Local:** `expo run:android` / `expo run:ios`. **EAS dev build** (recommended): see `eas.json`.

### Requirements

Node.js (LTS), Yarn 1.x, Android Studio (Android), Xcode (iOS).

### Install & run

```bash
yarn install
yarn android   # or yarn ios
```

### EAS

`npx eas-cli login` and `build:configure` once. Dev: `npx eas-cli build -p android --profile development` (and ios). Production: `build` + `submit` with `production` profile.

### Lint

`yarn lint`

### Modes (IDs sent over BLE)

0 Aurora (color range), 1 Auto, 2 BPM (color range), 3 Rainbow wave, 4 Rainbow pulse, 5 Running rainbow, 6 Strobe, 7 Wave and pulse, 8 Color cycle, 9 Rainbow breathe.

BLE UUIDs: see [`src/constants/ble.js`](./src/constants/ble.js).
