import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'sa.scraapy',
  appName: 'Scraapy',
  webDir: 'dist',
  ios: {
    contentInset: 'always',
  },
  backgroundColor: '#ffffff',
  zoomEnabled: false,
  plugins: {
    StatusBar: {
      backgroundColor: '#ffffff',
      style: 'Dark'
    }
  }
};

export default config;
