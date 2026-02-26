import {BleManager} from 'react-native-ble-plx';
import {Platform, PermissionsAndroid, AppState} from 'react-native';
import {Buffer} from 'buffer';
import {
  SERVICE_UUID,
  CHARACTERISTIC_UUID_MODE,
  CHARACTERISTIC_UUID_COLOR,
  CHARACTERISTIC_UUID_SPEED,
  CHARACTERISTIC_UUID_BRIGHTNESS,
  BLE_DEVICE_NAME,
} from '../constants/ble';
import {translate} from '../i18n';

const SERVICE_UUID_LOWER = SERVICE_UUID.toLowerCase().replace(/-/g, '');

function deviceMatches(device) {
  const name = device.name || device.localName || '';
  if (name && name.includes(BLE_DEVICE_NAME)) return true;
  const uuids = device.serviceUUIDs || [];
  return uuids.some(u => (u || '').toLowerCase().replace(/-/g, '') === SERVICE_UUID_LOWER);
}

function isDisconnectError(error) {
  const msg = error?.message || String(error);
  const reason = error?.reason || '';
  if (/was disconnected|disconnected/i.test(msg)) return true;
  if (/Unknown error|probably a bug/i.test(msg)) return true;
  if (/characteristic not found|not found/i.test(msg)) return true;
  if (/connection|not connected|device.*invalid/i.test(reason)) return true;
  return false;
}

class BLEService {
  constructor() {
    this.manager = null;
    this.device = null;
    this.service = null;
    this.characteristics = {};
    this.isConnected = false;
    this._appStateSub = null;
    this._onDisconnected = null;
  }

  setOnDisconnected(callback) {
    this._onDisconnected = callback;
  }

  _markDisconnected() {
    if (!this.isConnected) return;
    this.isConnected = false;
    this.device = null;
    this.service = null;
    this.characteristics = {};
    this._onDisconnected?.();
  }

  async requestPermissions() {
    if (Platform.OS !== 'android') {
      return true;
    }

    const apiLevel = Platform.Version;

    try {
      if (apiLevel >= 31) {
        const permissions = [
          'android.permission.BLUETOOTH_SCAN',
          'android.permission.BLUETOOTH_CONNECT',
          'android.permission.ACCESS_FINE_LOCATION',
        ];

        const granted = await PermissionsAndroid.requestMultiple(permissions);
        return (
          granted['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED
        );
      } else if (apiLevel >= 23) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: translate('permissions.locationTitle'),
            message: translate('permissions.locationMessage'),
            buttonNeutral: translate('permissions.locationAskLater'),
            buttonNegative: translate('permissions.locationCancel'),
            buttonPositive: translate('permissions.ok'),
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        return true;
      }
    } catch (err) {
      console.warn(translate('alerts.failedToInitBluetooth'), err);
      return apiLevel < 23;
    }
  }

  async initialize() {
    if (!this.manager) {
      this.manager = new BleManager();
    }

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      throw new Error(translate('alerts.permissionsRequired'));
    }

    return new Promise((resolve, reject) => {
      const subscription = this.manager.onStateChange(state => {
        if (state === 'PoweredOn') {
          subscription.remove();
          resolve(true);
        } else if (state === 'PoweredOff' || state === 'Unauthorized') {
          subscription.remove();
          reject(new Error(translate('alerts.bluetoothUnavailable', state)));
        }
      }, true);
    });
  }

  scanForDevices(onDeviceFound, onScanStopped) {
    if (!this.manager) {
      console.error('BLE Manager not initialized');
      return;
    }
    const self = this;
    this._scanStopCallback = onScanStopped;

    const handleBackground = () => {
      self.stopScan();
      if (self._scanStopCallback) {
        self._scanStopCallback({reason: 'background'});
        self._scanStopCallback = null;
      }
    };

    this._appStateSub = AppState.addEventListener('change', nextState => {
      if (nextState === 'background' || nextState === 'inactive') {
        handleBackground();
      }
    });

    return this.manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        const msg = error.message || String(error);
        const isPoweredOff = /powered\s*off|PoweredOff/i.test(msg);
        if (isPoweredOff) {
          this.manager.stopDeviceScan();
          if (this._scanStopCallback) {
            this._scanStopCallback(error);
            this._scanStopCallback = null;
          }
          this._removeAppStateListener();
          return;
        }
        console.error('Scan error:', error);
        return;
      }
      if (device) {
        if (__DEV__) {
          console.log('[BLE] Discovered:', device.id, 'name:', device.name, 'localName:', device.localName, 'rssi:', device.rssi, 'serviceUUIDs:', device.serviceUUIDs);
        }
        if (deviceMatches(device)) {
          onDeviceFound(device);
        }
      }
    });
  }

  _removeAppStateListener() {
    if (this._appStateSub) {
      this._appStateSub.remove();
      this._appStateSub = null;
    }
  }

  stopScan() {
    this._removeAppStateListener();
    this._scanStopCallback = null;
    if (this.manager) {
      this.manager.stopDeviceScan();
    }
  }

  async connectToDevice(device) {
    try {
      this.device = await device.connect();
      await this.device.discoverAllServicesAndCharacteristics();

      const services = await this.device.services();
      this.service = services.find(s => s.uuid.toLowerCase() === SERVICE_UUID.toLowerCase());

      if (!this.service) {
        throw new Error('Service not found');
      }

      const characteristics = await this.service.characteristics();

      const modeUuid = CHARACTERISTIC_UUID_MODE.toLowerCase().replace(/-/g, '');
      const colorUuid = CHARACTERISTIC_UUID_COLOR.toLowerCase().replace(/-/g, '');
      const speedUuid = CHARACTERISTIC_UUID_SPEED.toLowerCase().replace(/-/g, '');
      const brightnessUuid = CHARACTERISTIC_UUID_BRIGHTNESS.toLowerCase().replace(/-/g, '');

      characteristics.forEach(char => {
        const uuid = char.uuid.toLowerCase().replace(/-/g, '');
        if (uuid === modeUuid) {
          this.characteristics.mode = char;
        } else if (uuid === colorUuid) {
          this.characteristics.color = char;
        } else if (uuid === speedUuid) {
          this.characteristics.speed = char;
        } else if (uuid === brightnessUuid) {
          this.characteristics.brightness = char;
        }
      });

      if (__DEV__) {
        console.log('[BLE] Characteristics:', {
          mode: !!this.characteristics.mode,
          color: !!this.characteristics.color,
          speed: !!this.characteristics.speed,
          brightness: !!this.characteristics.brightness,
        });
      }

      this.device.onDisconnected(() => {
        this._markDisconnected();
      });

      this.isConnected = true;
      return true;
    } catch (error) {
      console.error('Connection error:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.device) {
      await this.device.cancelConnection();
      this.isConnected = false;
      this.device = null;
      this.service = null;
      this.characteristics = {};
    }
  }

  async setMode(mode) {
    if (!this.isConnected || !this.characteristics.mode) {
      if (__DEV__) console.log('[BLE] skip MODE (connected:', this.isConnected, ', hasChar:', !!this.characteristics.mode, ')');
      return;
    }
    const data = mode.toString();
    if (__DEV__) console.log('[BLE] >>> MODE', data);
    try {
      await this.characteristics.mode.writeWithResponse(Buffer.from(data).toString('base64'));
    } catch (error) {
      if (isDisconnectError(error)) {
        this._markDisconnected();
        return;
      }
      console.error('[BLE] Mode send error:', error);
      throw error;
    }
  }

  async setColor(color) {
    if (!this.isConnected || !this.characteristics.color) {
      if (__DEV__) console.log('[BLE] skip COLOR (connected:', this.isConnected, ', hasChar:', !!this.characteristics.color, ')');
      return;
    }
    if (__DEV__) console.log('[BLE] >>> COLOR', color);
    try {
      await this.characteristics.color.writeWithResponse(Buffer.from(color).toString('base64'));
    } catch (error) {
      if (isDisconnectError(error)) {
        this._markDisconnected();
        return;
      }
      console.error('[BLE] Color send error:', error);
      throw error;
    }
  }

  async setSpeed(speed) {
    if (!this.isConnected || !this.characteristics.speed) {
      if (__DEV__) console.log('[BLE] skip SPEED (connected:', this.isConnected, ', hasChar:', !!this.characteristics.speed, ')');
      return;
    }
    const deviceSpeed = Math.max(1, Math.round((speed / 100) * 1000));
    const data = deviceSpeed.toString();
    if (__DEV__) console.log('[BLE] >>> SPEED', data, `(${speed}%)`);
    try {
      await this.characteristics.speed.writeWithResponse(Buffer.from(data).toString('base64'));
    } catch (error) {
      if (isDisconnectError(error)) {
        this._markDisconnected();
        return;
      }
      console.error('[BLE] Speed send error:', error);
      throw error;
    }
  }

  async setBrightness(brightness) {
    if (!this.isConnected || !this.characteristics.brightness) {
      if (__DEV__) console.log('[BLE] skip BRIGHTNESS (connected:', this.isConnected, ', hasChar:', !!this.characteristics.brightness, ')');
      return;
    }
    const deviceBrightness = Math.round((brightness / 100) * 255);
    const data = deviceBrightness.toString();
    if (__DEV__) console.log('[BLE] >>> BRIGHTNESS', data, `(${brightness}%)`);
    try {
      await this.characteristics.brightness.writeWithResponse(
        Buffer.from(data).toString('base64'),
      );
    } catch (error) {
      if (isDisconnectError(error)) {
        this._markDisconnected();
        return;
      }
      console.error('[BLE] Brightness send error:', error);
      throw error;
    }
  }
  
  destroy() {
    if (this.device) {
      this.device.cancelConnection();
    }
    if (this.manager) {
      this.manager.destroy();
      this.manager = null;
    }
  }
}

export default new BLEService();
