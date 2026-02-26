import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import bleService from '../services/bleService';
import {MODES} from '../constants/ble';
import {DEVICE_CODE_URL, BUYMEACOFFEE_URL} from '../constants/app';
import ConnectionIndicator from '../components/ConnectionIndicator';
import ModeCard from '../components/ModeCard';
import ColorSlider from '../components/ColorSlider';
import Slider from '../components/Slider';
import {useI18n} from '../i18n';

const MainScreen = () => {
  const {t, lang, setLang} = useI18n();
  const [isConnected, setIsConnected] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedMode, setSelectedMode] = useState(0);
  const [brightness, setBrightness] = useState(50);
  const [speed, setSpeed] = useState(50);
  const [color, setColor] = useState({h: 160, s: 100, v: 100, r: 0, g: 255, b: 255});
  const [colorRange, setColorRange] = useState({
    from: {h: 200, s: 100, v: 100, r: 0, g: 150, b: 255},
    to: {h: 120, s: 100, v: 100, r: 0, g: 255, b: 150},
  });
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showColorRangePicker, setShowColorRangePicker] = useState({from: false, to: false});
  const [showSettings, setShowSettings] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const scanTimeoutRef = useRef(null);

  const openUrl = async url => {
    try {
      const can = await Linking.canOpenURL(url);
      if (!can) {
        Alert.alert(t('alerts.error'), t('alerts.couldNotOpenLink'));
        return;
      }
      await Linking.openURL(url);
    } catch (_e) {
      Alert.alert(t('alerts.error'), t('alerts.couldNotOpenLink'));
    }
  };

  useEffect(() => {
    initializeBLE();
    return () => {
      if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
      bleService.stopScan();
      bleService.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializeBLE = async () => {
    try {
      await bleService.initialize();
      startScanning();
    } catch (error) {
      const errorMessage = error.message || t('alerts.failedToInitBluetooth');
      Alert.alert(
        t('alerts.error'),
        errorMessage.includes('permissions')
          ? t('alerts.permissionsRequired')
          : errorMessage,
      );
      console.error('BLE initialization error:', error);
      setIsScanning(false);
    }
  };

  const startScanning = () => {
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
      scanTimeoutRef.current = null;
    }
    setIsScanning(true);
    bleService.scanForDevices(
      async device => {
        if (scanTimeoutRef.current) {
          clearTimeout(scanTimeoutRef.current);
          scanTimeoutRef.current = null;
        }
        try {
          bleService.stopScan();
          setIsScanning(false);
          await bleService.connectToDevice(device);
          bleService.setOnDisconnected(() => setIsConnected(false));
          setIsConnected(true);
          if (__DEV__) {
            console.log('[BLE] Connected, syncing state: mode=%s brightness=%s speed=%s', selectedMode, brightness, speed);
          }
          try {
            await bleService.setMode(selectedMode);
          } catch (e) {
            console.warn('[BLE] sync setMode failed', e?.message);
          }
          try {
            await bleService.setBrightness(brightness);
          } catch (e) {
            console.warn('[BLE] sync setBrightness failed', e?.message);
          }
          try {
            await bleService.setSpeed(speed);
          } catch (e) {
            console.warn('[BLE] sync setSpeed failed', e?.message);
          }
          try {
            const colorString =
              selectedMode === 0 || selectedMode === 2
                ? `${colorRange.from.r},${colorRange.from.g},${colorRange.from.b},${colorRange.to.r},${colorRange.to.g},${colorRange.to.b}`
                : `${color.r},${color.g},${color.b}`;
            await bleService.setColor(colorString);
          } catch (e) {
            console.warn('[BLE] sync setColor failed', e?.message);
          }
        } catch (error) {
          const errorMessage = error.message || t('alerts.connectionError');
          Alert.alert(t('alerts.connectionError'), errorMessage);
          setIsScanning(false);
          setIsConnected(false);
        }
      },
      err => {
        if (scanTimeoutRef.current) {
          clearTimeout(scanTimeoutRef.current);
          scanTimeoutRef.current = null;
        }
        setIsScanning(false);
        if (err && err.message && !/powered\s*off|background/i.test(err.message || err.reason)) {
          Alert.alert(t('alerts.scanStopped'), err.message || t('alerts.failedToInitBluetooth'));
        }
      },
    );

    scanTimeoutRef.current = setTimeout(() => {
      scanTimeoutRef.current = null;
      bleService.stopScan();
      setIsScanning(prev => {
        if (prev) {
          Alert.alert(
            t('alerts.deviceNotFound'),
            t('alerts.notFoundAdvice'),
          );
          return false;
        }
        return prev;
      });
    }, 30000);
  };

  const handleConnect = () => {
    if (isConnected) {
      handleDisconnect();
    } else {
      startScanning();
    }
  };

  const handleDisconnect = async () => {
    try {
      await bleService.disconnect();
      setIsConnected(false);
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  };

  const isDisconnectError = err =>
    /was disconnected|disconnected/i.test(err?.message || '');

  const handleModeSelect = async modeId => {
    setSelectedMode(modeId);
    setShowSettings(true);
    if (isConnected) {
      try {
        await bleService.setMode(modeId);
      } catch (e) {
        if (isDisconnectError(e)) setIsConnected(false);
        else Alert.alert(t('alerts.error'), t('alerts.failedToSetMode'));
      }
    }
  };

  const handleBrightnessChange = async value => {
    setBrightness(value);
    if (isConnected) {
      try {
        await bleService.setBrightness(value);
      } catch (e) {
        if (isDisconnectError(e)) setIsConnected(false);
      }
    }
  };

  const handleSpeedChange = async value => {
    setSpeed(value);
    if (isConnected) {
      try {
        await bleService.setSpeed(value);
      } catch (e) {
        if (isDisconnectError(e)) setIsConnected(false);
      }
    }
  };

  const handleColorChange = async newColor => {
    setColor(newColor);
    if (isConnected) {
      try {
        const colorString = `${newColor.r},${newColor.g},${newColor.b}`;
        await bleService.setColor(colorString);
      } catch (e) {
        if (isDisconnectError(e)) setIsConnected(false);
      }
    }
  };

  const handleColorRangeChange = async (type, newColor) => {
    const updatedRange = {
      ...colorRange,
      [type]: newColor,
    };
    setColorRange(updatedRange);
    if (isConnected) {
      try {
        const colorString = `${updatedRange.from.r},${updatedRange.from.g},${updatedRange.from.b},${updatedRange.to.r},${updatedRange.to.g},${updatedRange.to.b}`;
        await bleService.setColor(colorString);
      } catch (e) {
        if (isDisconnectError(e)) setIsConnected(false);
      }
    }
  };

  const getModeSettings = () => {
    const settings = [];

    settings.push(
      <Slider
        key="brightness"
        label={t('main.brightness')}
        value={brightness}
        minimumValue={0}
        maximumValue={100}
        onValueChange={handleBrightnessChange}
        unit="%"
      />,
    );

    if (selectedMode !== 6) {
      settings.push(
        <Slider
          key="speed"
          label={t('main.speed')}
          value={speed}
          minimumValue={0}
          maximumValue={100}
          onValueChange={handleSpeedChange}
          unit="%"
        />,
      );
    }

    if ([0, 2, 3, 4, 5, 7, 8, 9].includes(selectedMode)) {
      const isRangeMode = selectedMode === 0 || selectedMode === 2;
      settings.push(
        <View key="color" style={styles.colorSection}>
          {isRangeMode ? (
            <>
              <Text style={styles.colorLabel}>
                {selectedMode === 0 ? t('main.colorRangeAurora') : t('main.colorRangeBpm')}
              </Text>
              <View style={styles.rangeContainer}>
                <View style={styles.rangeItem}>
                  <Text style={styles.rangeLabel}>{t('main.rangeFrom')}</Text>
                  <TouchableOpacity
                    style={styles.colorButton}
                    onPress={() => {
                      setShowColorRangePicker({
                        from: !showColorRangePicker.from,
                        to: false,
                      });
                    }}>
                    <View
                      style={[
                        styles.colorPreview,
                        {
                          backgroundColor: `rgb(${colorRange.from.r}, ${colorRange.from.g}, ${colorRange.from.b})`,
                        },
                      ]}
                    />
                    <Text style={styles.colorButtonText}>
                      {showColorRangePicker.from ? t('main.toggleHide') : t('main.toggleSelect')}
                    </Text>
                  </TouchableOpacity>
                  {showColorRangePicker.from && (
                    <ColorSlider
                      initialColor={{h: colorRange.from.h, s: colorRange.from.s, v: colorRange.from.v}}
                      onColorChange={color => handleColorRangeChange('from', color)}
                    />
                  )}
                </View>
                <View style={styles.rangeItem}>
                  <Text style={styles.rangeLabel}>{t('main.rangeTo')}</Text>
                  <TouchableOpacity
                    style={styles.colorButton}
                    onPress={() => {
                      setShowColorRangePicker({
                        from: false,
                        to: !showColorRangePicker.to,
                      });
                    }}>
                    <View
                      style={[
                        styles.colorPreview,
                        {
                          backgroundColor: `rgb(${colorRange.to.r}, ${colorRange.to.g}, ${colorRange.to.b})`,
                        },
                      ]}
                    />
                    <Text style={styles.colorButtonText}>
                      {showColorRangePicker.to ? t('main.toggleHide') : t('main.toggleSelect')}
                    </Text>
                  </TouchableOpacity>
                  {showColorRangePicker.to && (
                    <ColorSlider
                      initialColor={{h: colorRange.to.h, s: colorRange.to.s, v: colorRange.to.v}}
                      onColorChange={color => handleColorRangeChange('to', color)}
                    />
                  )}
                </View>
              </View>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={styles.colorButton}
                onPress={() => setShowColorPicker(!showColorPicker)}>
                <View
                  style={[
                    styles.colorPreview,
                    {
                      backgroundColor: `rgb(${color.r}, ${color.g}, ${color.b})`,
                    },
                  ]}
                />
                <Text style={styles.colorButtonText}>
                  {showColorPicker ? t('main.toggleHide') : t('main.selectColor')}
                </Text>
              </TouchableOpacity>
              {showColorPicker && (
                <ColorSlider
                  initialColor={{h: color.h, s: color.s, v: color.v}}
                  onColorChange={handleColorChange}
                />
              )}
            </>
          )}
        </View>,
      );
    }

    return settings;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Modal
        visible={showAbout}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAbout(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('main.aboutTitle')}</Text>
              <TouchableOpacity onPress={() => setShowAbout(false)} style={styles.modalClose}>
                <Text style={styles.modalCloseText}>{t('main.aboutClose')}</Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.aboutText}>
                {t('main.aboutText')}
              </Text>

              <View style={styles.aboutButtons}>
                <TouchableOpacity
                  style={styles.linkButton}
                  onPress={() => openUrl(DEVICE_CODE_URL)}>
                  <Text style={styles.linkButtonText}>{t('main.aboutDeviceCode')}</Text>
                  <Text style={styles.linkButtonUrl}>{DEVICE_CODE_URL}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.linkButton}
                  onPress={() => openUrl(BUYMEACOFFEE_URL)}>
                  <Text style={styles.linkButtonText}>Buy me a coffee</Text>
                  <Text style={styles.linkButtonUrl}>{BUYMEACOFFEE_URL}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        scrollEventThrottle={16}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('main.title')}</Text>
          <Text style={styles.subtitle}>{t('main.subtitle')}</Text>
          <TouchableOpacity
            style={styles.aboutButton}
            onPress={() => setShowAbout(true)}>
            <Text style={styles.aboutButtonText} numberOfLines={1}>
              {t('main.about')}
            </Text>
          </TouchableOpacity>
          <View style={styles.languageSwitch}>
            <TouchableOpacity
              style={[
                styles.languageButton,
                lang === 'en' && styles.languageButtonActive,
              ]}
              onPress={() => setLang('en')}>
              <Text
                style={[
                  styles.languageButtonText,
                  lang === 'en' && styles.languageButtonTextActive,
                ]}>
                {t('common.language_en')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.languageButton,
                lang === 'ru' && styles.languageButtonActive,
              ]}
              onPress={() => setLang('ru')}>
              <Text
                style={[
                  styles.languageButtonText,
                  lang === 'ru' && styles.languageButtonTextActive,
                ]}>
                {t('common.language_ru')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ConnectionIndicator isConnected={isConnected} isScanning={isScanning} />

        <TouchableOpacity
          style={[styles.connectButton, isConnected && styles.connectButtonActive]}
          onPress={handleConnect}
          disabled={isScanning}>
          {isScanning ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.connectButtonText}>
              {isConnected ? t('main.disconnect') : t('main.connect')}
            </Text>
          )}
        </TouchableOpacity>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('main.modeSectionTitle')}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.modesContainer}>
            {MODES.map(mode => (
              <ModeCard
                key={mode.id}
                mode={mode}
                isSelected={selectedMode === mode.id}
                onPress={() => handleModeSelect(mode.id)}
              />
            ))}
          </ScrollView>
        </View>
        {showSettings && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('main.settingsSectionTitle')}</Text>
              {isConnected && (
                <View style={styles.autoSyncBadge}>
                  <Text style={styles.autoSyncText}>{t('main.autoSyncBadge')}</Text>
                </View>
              )}
            </View>
            <Text style={styles.syncHint}>
              {isConnected
                ? t('main.syncHintConnected')
                : t('main.syncHintDisconnected')}
            </Text>
            <View style={styles.settingsContainer}>{getModeSettings()}</View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  colorButton: {
    alignItems: 'center',
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    flexDirection: 'row',
    marginBottom: 16,
    padding: 16,
  },
  colorButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  colorPreview: {
    borderColor: '#fff',
    borderRadius: 20,
    borderWidth: 2,
    height: 40,
    marginRight: 12,
    width: 40,
  },
  colorLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  colorSection: {
    marginTop: 12,
  },
  rangeContainer: {
    gap: 16,
  },
  rangeItem: {
    marginBottom: 12,
  },
  rangeLabel: {
    color: '#a0a0a0',
    fontSize: 14,
    marginBottom: 8,
  },
  connectButton: {
    alignItems: 'center',
    backgroundColor: '#6366f1',
    borderRadius: 12,
    elevation: 5,
    justifyContent: 'center',
    marginBottom: 24,
    padding: 16,
    shadowColor: '#6366f1',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  connectButtonActive: {
    backgroundColor: '#ef4444',
    shadowColor: '#ef4444',
  },
  connectButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  container: {
    backgroundColor: '#0f0f1e',
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  aboutButton: {
    alignSelf: 'center',
    backgroundColor: '#141428',
    borderColor: '#2a2a3e',
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 96,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 10,
  },
  aboutButtonText: {
    color: '#c7c7ff',
    fontSize: 13,
    fontWeight: '600',
  },
  languageSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  languageButton: {
    backgroundColor: '#141428',
    borderColor: '#2a2a3e',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 64,
  },
  languageButtonActive: {
    backgroundColor: '#2a2a3e',
    borderColor: '#6366f1',
  },
  languageButtonText: {
    color: '#a0a0ff',
    fontSize: 13,
    fontWeight: '600',
  },
  languageButtonTextActive: {
    color: '#fff',
  },
  modalBackdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#0f0f1e',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    maxHeight: '80%',
    padding: 18,
    width: '100%',
  },
  modalHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  modalClose: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  modalCloseText: {
    color: '#a0a0ff',
    fontSize: 14,
    fontWeight: '600',
  },
  aboutText: {
    color: '#c6c6d8',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },
  aboutButtons: {
    gap: 12,
    marginBottom: 14,
  },
  linkButton: {
    backgroundColor: '#141428',
    borderColor: '#2a2a3e',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  linkButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  linkButtonUrl: {
    color: '#a0a0a0',
    fontSize: 12,
  },
  modesContainer: {
    paddingVertical: 8,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  scrollView: {
    flex: 1,
  },
  autoSyncBadge: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  autoSyncText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  syncHint: {
    color: '#a0a0a0',
    fontSize: 12,
    marginBottom: 12,
    marginTop: 4,
  },
  settingsContainer: {
    backgroundColor: '#1e1e2e',
    borderRadius: 16,
    marginTop: 8,
    padding: 20,
  },
  subtitle: {
    color: '#a0a0a0',
    fontSize: 16,
  },
  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});

export default MainScreen;
