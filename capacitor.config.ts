import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.tasklyclean.app',
  appName: 'TasklyClean',
  webDir: 'out',
  // When developing, point to your Vercel deployment so the WebView loads
  // the live app (avoids needing a full static export of server components).
  // Comment this block out for a fully offline static build.
  server: {
    url: 'https://taskly-clean.vercel.app',
    cleartext: false,
  },
  android: {
    backgroundColor: '#ffffff',
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false, // set true for dev builds
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#2563eb',
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },
  },
}

export default config
