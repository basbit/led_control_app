// BLE UUID constants
export const BLE_DEVICE_NAME = 'LED Strip Controller';
export const SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
export const CHARACTERISTIC_UUID_MODE = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';
export const CHARACTERISTIC_UUID_COLOR = 'beb5483e-36e1-4688-b7f5-ea07361b26a9';
export const CHARACTERISTIC_UUID_SPEED = 'beb5483e-36e1-4688-b7f5-ea07361b26aa';
export const CHARACTERISTIC_UUID_BRIGHTNESS = 'beb5483e-36e1-4688-b7f5-ea07361b26ab';

// Logical modes (names are localized in UI)
export const MODES = [
  {id: 0, key: 'aurora', icon: '🌌'},
  {id: 1, key: 'auto', icon: '🔄'},
  {id: 2, key: 'bpm', icon: '🎵'},
  {id: 3, key: 'rainbowWave', icon: '🌊'},
  {id: 4, key: 'rainbowPulse', icon: '💫'},
  {id: 5, key: 'rainbowRunning', icon: '🏃'},
  {id: 6, key: 'strobe', icon: '⚡'},
  {id: 7, key: 'waveAndPulse', icon: '✨'},
  {id: 8, key: 'colorCycle', icon: '🎭'},
  {id: 9, key: 'rainbowBreathe', icon: '💨'},
];
