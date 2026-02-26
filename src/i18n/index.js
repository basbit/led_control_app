import React, {createContext, useContext, useMemo, useState} from 'react';

const translations = {
  en: {
    common: {
      language_en: 'EN',
      language_ru: 'RU',
    },
    alerts: {
      error: 'Error',
      connectionError: 'Connection error',
      scanStopped: 'Scan stopped',
      deviceNotFound: 'Device not found',
      couldNotOpenLink: "Couldn't open the link",
      failedToInitBluetooth: 'Failed to initialize Bluetooth',
      failedToSetMode: 'Failed to set mode',
      bluetoothUnavailable: state => `Bluetooth is unavailable: ${state}`,
      permissionsRequired:
        'Bluetooth permissions are required. Please grant them in the system settings.',
      notFoundAdvice:
        'Make sure the device is powered on and nearby. On Android the name may be hidden — the device is discovered by its service.',
    },
    main: {
      title: 'LED Control',
      subtitle: 'LED strip control',
      about: 'About',
      aboutTitle: 'About the app',
      aboutClose: 'Close',
      aboutText:
        'LED Control is an app for controlling an LED strip over Bluetooth (BLE): modes, color, brightness, speed.',
      aboutDeviceCode: 'GitHub: device code',
      connect: 'Connect',
      disconnect: 'Disconnect',
      modeSectionTitle: 'Mode',
      settingsSectionTitle: 'Settings',
      autoSyncBadge: '✓ Auto‑sync',
      syncHintConnected: 'Changes are applied automatically',
      syncHintDisconnected: 'Connect to the device to apply settings',
      brightness: 'Brightness',
      speed: 'Speed',
      colorRangeAurora: 'Color range (Aurora)',
      colorRangeBpm: 'Color range (BPM)',
      rangeFrom: 'From:',
      rangeTo: 'To:',
      toggleHide: 'Hide',
      toggleSelect: 'Select',
      selectColor: 'Select color',
    },
    modes: {
      aurora: 'Aurora',
      auto: 'Auto mode',
      bpm: 'BPM mode',
      rainbowWave: 'Rainbow wave',
      rainbowPulse: 'Rainbow pulse',
      rainbowRunning: 'Running rainbow',
      strobe: 'Strobe',
      waveAndPulse: 'Wave & pulse',
      colorCycle: 'Color cycle',
      rainbowBreathe: 'Rainbow breathing',
    },
    connection: {
      connected: 'Connected',
      scanning: 'Scanning…',
      disconnected: 'Disconnected',
    },
    permissions: {
      locationTitle: 'Location permission',
      locationMessage:
        'The app needs access to location to scan for Bluetooth devices.',
      locationAskLater: 'Ask later',
      locationCancel: 'Cancel',
      ok: 'OK',
    },
    colorSlider: {
      rgbLabel: 'RGB',
    },
  },
  ru: {
    common: {
      language_en: 'EN',
      language_ru: 'RU',
    },
    alerts: {
      error: 'Ошибка',
      connectionError: 'Ошибка подключения',
      scanStopped: 'Сканирование остановлено',
      deviceNotFound: 'Устройство не найдено',
      couldNotOpenLink: 'Не удалось открыть ссылку',
      failedToInitBluetooth: 'Не удалось инициализировать Bluetooth',
      failedToSetMode: 'Не удалось установить режим',
      bluetoothUnavailable: state => `Bluetooth недоступен: ${state}`,
      permissionsRequired:
        'Необходимы разрешения для работы с Bluetooth. Пожалуйста, предоставьте их в настройках устройства.',
      notFoundAdvice:
        'Убедитесь, что устройство включено и находится рядом. На Android имя может не отображаться — устройство ищется по сервису.',
    },
    main: {
      title: 'LED Control',
      subtitle: 'Управление светодиодной лентой',
      about: 'О приложении',
      aboutTitle: 'О приложении',
      aboutClose: 'Закрыть',
      aboutText:
        'LED Control — приложение для управления светодиодной лентой через Bluetooth (BLE): режимы, цвет, яркость, скорость.',
      aboutDeviceCode: 'GitHub: код устройства',
      connect: 'Подключиться',
      disconnect: 'Отключиться',
      modeSectionTitle: 'Режим работы',
      settingsSectionTitle: 'Настройки',
      autoSyncBadge: '✓ Автосинхронизация',
      syncHintConnected: 'Изменения применяются автоматически',
      syncHintDisconnected: 'Подключитесь к устройству для применения настроек',
      brightness: 'Яркость',
      speed: 'Скорость',
      colorRangeAurora: 'Диапазон цветов (Северное сияние)',
      colorRangeBpm: 'Диапазон цветов (BPM)',
      rangeFrom: 'От:',
      rangeTo: 'До:',
      toggleHide: 'Скрыть',
      toggleSelect: 'Выбрать',
      selectColor: 'Выбрать цвет',
    },
    modes: {
      aurora: 'Северное сияние',
      auto: 'Авторежим',
      bpm: 'BPM режим',
      rainbowWave: 'Радужная волна',
      rainbowPulse: 'Радужный импульс',
      rainbowRunning: 'Бегущая радуга',
      strobe: 'Стробоскоп',
      waveAndPulse: 'Волна и импульс',
      colorCycle: 'Цикл цветов',
      rainbowBreathe: 'Дыхание радугой',
    },
    connection: {
      connected: 'Подключено',
      scanning: 'Поиск устройства...',
      disconnected: 'Отключено',
    },
    permissions: {
      locationTitle: 'Разрешение на местоположение',
      locationMessage:
        'Приложению необходим доступ к местоположению для сканирования Bluetooth устройств',
      locationAskLater: 'Спросить позже',
      locationCancel: 'Отмена',
      ok: 'OK',
    },
    colorSlider: {
      rgbLabel: 'RGB',
    },
  },
};

const I18nContext = createContext({
  lang: 'en',
  setLang: () => {},
  t: key => key,
});

let currentLang = 'en';

const fallback = (obj, path) => {
  const parts = path.split('.');
  let value = obj;
  for (const part of parts) {
    if (!value || typeof value !== 'object') return null;
    value = value[part];
  }
  return value ?? null;
};

export const translate = (key, ...args) => {
  const langPack = translations[currentLang] || translations.en;
  const value = fallback(langPack, key);
  if (typeof value === 'function') {
    return value(...args);
  }
  if (typeof value === 'string') return value;
  // fall back to key if missing
  return key;
};

export const I18nProvider = ({children, initialLanguage = 'en'}) => {
  const [lang, setLangState] = useState(initialLanguage);

  if (currentLang !== lang) {
    currentLang = lang;
  }

  const setLang = newLang => {
    currentLang = newLang;
    setLangState(newLang);
  };

  const value = useMemo(
    () => ({
      lang,
      setLang,
      t: (key, ...args) => {
        const langPack = translations[lang] || translations.en;
        const v = fallback(langPack, key);
        if (typeof v === 'function') return v(...args);
        if (typeof v === 'string') return v;
        return key;
      },
    }),
    [lang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => useContext(I18nContext);

