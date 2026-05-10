export interface User {
  id: number;
  username: string;
  role: string;
  email: string;
}

export interface SmartDevice {
  id: string;
  name: string;
  type: 'door' | 'gate' | 'light' | string;
  status: 'locked' | 'unlocked' | 'open' | 'closed' | 'on' | 'off' | string;
  online: boolean;
  battery: number;
  firmwareVersion: string;
  image: string;
  lastUpdated: string;
}

export interface ActivityEntry {
  id: number;
  deviceId: string;
  deviceName: string;
  action: string;
  actor: string;
  sourceIp: string;
  severity: 'info' | 'warn' | 'error';
  timestamp: string;
  details?: string;
}

export interface DeviceSettings {
  homeName: string;
  timeZone: string;
  dateFormat: string;
  timeFormat: string;
  temperatureUnit: string;
  language: string;
  darkMode: boolean;
  autoLogout: string;
  soundEffects: boolean;
  animations: boolean;
  twoFactor: boolean;
  loginAlerts: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  systemAlerts: boolean;
  marketingUpdates: boolean;
}

export interface StatusResponse {
  devices: SmartDevice[];
  totalDoors: number;
  openDoors: number;
  totalGates: number;
  openGates: number;
  totalLights: number;
  lightsOn: number;
  secure: boolean;
  systemHealth: string;
  serverTime: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  role: string;
  expiresAt: string;
}

export interface DebugSystemResponse {
  serverTime: string;
  operatingSystem: string;
  hostname: string;
  firmwareVersion: string;
  kernelVersion: string;
  uptime: string;
  environment: Record<string, string>;
  routes: string[];
  services: string[];
  commandOutput?: string;
}

export interface ConfigExportResponse {
  deviceName: string;
  serialNumber: string;
  firmwareVersion: string;
  adminUser: string;
  adminPassword: string;
  apiKey: string;
  jwtSecret: string;
  databaseUrl: string;
  mqttBroker: string;
  mqttPassword: string;
  zigbeeNetworkKey: string;
  exportedAt: string;
}
