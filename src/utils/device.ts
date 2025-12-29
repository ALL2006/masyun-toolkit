/**
 * 设备检测工具函数
 * 用于检测当前运行环境（桌面端 / 移动端）
 *
 * 重要：优先检测 Capacitor 移动环境，确保桌面应用不受影响
 */

/**
 * 检测是否为 Capacitor 移动环境（Android/iOS）
 * 这是真正的移动端应用，而非浏览器
 */
export function isCapacitorMobile(): boolean {
  if (typeof window !== 'undefined' && (window as any).Capacitor) {
    const platform = (window as any).Capacitor.getPlatform();
    // 只有在原生 Android 或 iOS 环境才返回 true
    return platform === 'android' || platform === 'ios';
  }
  return false;
}

/**
 * 检测是否为移动设备
 * 仅在 Capacitor 原生移动环境下返回 true
 * 浏览器和 Electron 环境都返回 false
 */
export function isMobile(): boolean {
  // 优先检测 Electron 桌面应用
  if (isElectron()) {
    return false;
  }

  // 检测 Capacitor 移动环境
  return isCapacitorMobile();
}

/**
 * 检测是否为 Android 设备
 */
export function isAndroid(): boolean {
  // 优先检测 Electron，避免误判
  if (isElectron()) {
    return false;
  }

  if (typeof window !== 'undefined' && (window as any).Capacitor) {
    return (window as any).Capacitor.getPlatform() === 'android';
  }

  // 浏览器环境下不检测，避免影响桌面应用
  return false;
}

/**
 * 检测是否为 iOS 设备
 */
export function isIOS(): boolean {
  // 优先检测 Electron，避免误判
  if (isElectron()) {
    return false;
  }

  if (typeof window !== 'undefined' && (window as any).Capacitor) {
    return (window as any).Capacitor.getPlatform() === 'ios';
  }

  // 浏览器环境下不检测，避免影响桌面应用
  return false;
}

/**
 * 检测是否为 Electron 桌面应用
 */
export function isElectron(): boolean {
  // 检测 process.type (Node.js 集成)
  if (typeof window !== 'undefined' && (window as any).process && (window as any).process.type === 'renderer') {
    return true;
  }

  // 检测 User Agent
  if (typeof navigator !== 'undefined') {
    return /electron/i.test(navigator.userAgent);
  }

  return false;
}

/**
 * 检测是否为平板设备
 */
export function isTablet(): boolean {
  // Electron 环境下不是平板
  if (isElectron()) {
    return false;
  }

  // 只在 Capacitor 移动环境下检测
  if (typeof window !== 'undefined' && (window as any).Capacitor) {
    const platform = (window as any).Capacitor.getPlatform();
    return platform === 'android' || platform === 'ios';
  }

  return false;
}

/**
 * 获取屏幕方向
 */
export function getOrientation(): 'portrait' | 'landscape' {
  if (typeof window === 'undefined') return 'portrait';

  return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
}

/**
 * 检测是否为横屏
 */
export function isLandscape(): boolean {
  return getOrientation() === 'landscape';
}

/**
 * 检测是否为竖屏
 */
export function isPortrait(): boolean {
  return getOrientation() === 'portrait';
}

/**
 * 获取屏幕尺寸分类
 */
export function getScreenSize(): 'xs' | 'sm' | 'md' | 'lg' | 'xl' {
  if (typeof window === 'undefined') return 'md';

  const width = window.innerWidth;

  if (width < 576) return 'xs';    // 手机竖屏
  if (width < 768) return 'sm';    // 手机横屏 /小平板
  if (width < 992) return 'md';    // 平板竖屏
  if (width < 1200) return 'lg';   // 平板横屏 /小桌面
  return 'xl';                      // 大桌面
}

/**
 * 检测是否支持触摸
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;

  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0
  );
}

/**
 * 获取设备像素比
 */
export function getPixelRatio(): number {
  if (typeof window === 'undefined') return 1;

  return window.devicePixelRatio || 1;
}

/**
 * 获取安全区域 insets（用于 iPhone X 及以上）
 */
export function getSafeAreaInsets(): {
  top: string;
  right: string;
  bottom: string;
  left: string;
} {
  if (typeof window === 'undefined') {
    return { top: '0px', right: '0px', bottom: '0px', left: '0px' };
  }

  const style = getComputedStyle(document.documentElement);

  return {
    top: style.getPropertyValue('safe-area-inset-top') || '0px',
    right: style.getPropertyValue('safe-area-inset-right') || '0px',
    bottom: style.getPropertyValue('safe-area-inset-bottom') || '0px',
    left: style.getPropertyValue('safe-area-inset-left') || '0px'
  };
}

/**
 * 获取视口高度（考虑移动端地址栏）
 */
export function getViewportHeight(): number {
  if (typeof window === 'undefined') return 0;

  // 使用 innerHeight 或 visualViewport.height
  const visualViewport = (window as any).visualViewport;
  return visualViewport ? visualViewport.height : window.innerHeight;
}

/**
 * 设备信息汇总
 */
export interface DeviceInfo {
  isMobile: boolean;
  isAndroid: boolean;
  isIOS: boolean;
  isElectron: boolean;
  isTablet: boolean;
  isTouch: boolean;
  orientation: 'portrait' | 'landscape';
  screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  pixelRatio: number;
  safeArea: ReturnType<typeof getSafeAreaInsets>;
  viewportHeight: number;
}

/**
 * 获取完整的设备信息
 */
export function getDeviceInfo(): DeviceInfo {
  return {
    isMobile: isMobile(),
    isAndroid: isAndroid(),
    isIOS: isIOS(),
    isElectron: isElectron(),
    isTablet: isTablet(),
    isTouch: isTouchDevice(),
    orientation: getOrientation(),
    screenSize: getScreenSize(),
    pixelRatio: getPixelRatio(),
    safeArea: getSafeAreaInsets(),
    viewportHeight: getViewportHeight()
  };
}

/**
 * 监听屏幕方向变化
 */
export function onOrientationChange(callback: (orientation: 'portrait' | 'landscape') => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handler = () => callback(getOrientation());

  window.addEventListener('resize', handler);
  window.addEventListener('orientationchange', handler);

  return () => {
    window.removeEventListener('resize', handler);
    window.removeEventListener('orientationchange', handler);
  };
}

/**
 * 监听视口大小变化
 */
export function onViewportChange(callback: (width: number, height: number) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const visualViewport = (window as any).visualViewport;
  let handler: () => void;

  if (visualViewport) {
    handler = () => callback(visualViewport.width, visualViewport.height);
    visualViewport.addEventListener('resize', handler);
  } else {
    handler = () => callback(window.innerWidth, window.innerHeight);
    window.addEventListener('resize', handler);
  }

  return () => {
    if (visualViewport) {
      visualViewport.removeEventListener('resize', handler);
    } else {
      window.removeEventListener('resize', handler);
    }
  };
}
