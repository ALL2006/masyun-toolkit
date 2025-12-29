import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.finance.tracker',
  appName: '大学生记账本',
  webDir: 'build',
  bundledWebRuntime: false,
  version: '0.3.2',
  description: '一款简洁、优雅的个人财务管理工具，专为大学生和年轻职场人士设计',

  // Android 配置
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true
  },

  // 服务器配置（本地开发）
  server: {
    androidScheme: 'https',
    cleartext: true,
    // 开发时可以设置本地服务器地址
    // url: 'http://localhost:3000',
    // hostname: 'localhost'
  },

  // 颜色主题
  color: '#4A90E2',

  // 后台运行
  androidBuildOptions: {
    keystorePath: '',
    keystoreAlias: ''
  },

  // 插件配置
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#4A90E2',
      androidSplashResourceName: 'splash',
      splashFullScreen: true,
      splashImmersive: true
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#4A90E2'
    },
    App: {
      statusBarStyle: 'LIGHT'
    }
  }
};

export default config;
