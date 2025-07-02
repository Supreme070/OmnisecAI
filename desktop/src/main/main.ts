/**
 * Main Electron process for OmnisecAI Desktop
 * Handles application lifecycle, window management, and system integration
 */
import { 
  app, 
  BrowserWindow, 
  Menu, 
  Tray, 
  shell, 
  ipcMain, 
  dialog,
  nativeTheme,
  powerMonitor,
  screen
} from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import Store from 'electron-store';
import * as path from 'path';
import { MenuBuilder } from './menu';
import { createTray } from './tray';
import { SecurityManager } from './security';
import { NotificationManager } from './notifications';
import { PowerManager } from './power';

// Configure logging
log.transports.file.level = 'info';
log.transports.console.level = 'debug';

// Store configuration
const store = new Store({
  defaults: {
    windowBounds: { width: 1200, height: 800 },
    theme: 'system',
    startMinimized: false,
    alwaysOnTop: false,
    notifications: true,
    autoLaunch: false,
  }
});

class OmnisecAIApp {
  private mainWindow: BrowserWindow | null = null;
  private tray: Tray | null = null;
  private menuBuilder: MenuBuilder | null = null;
  private securityManager: SecurityManager | null = null;
  private notificationManager: NotificationManager | null = null;
  private powerManager: PowerManager | null = null;
  private isQuitting = false;

  constructor() {
    this.initializeApp();
  }

  private initializeApp(): void {
    // Set app user model id for Windows
    if (process.platform === 'win32') {
      app.setAppUserModelId('com.omnisecai.desktop');
    }

    // Handle app events
    app.whenReady().then(() => {
      this.createMainWindow();
      this.setupApplicationMenu();
      this.setupTray();
      this.setupAutoUpdater();
      this.setupIPCHandlers();
      this.setupPowerManagement();
      this.setupSecurityFeatures();
      this.setupNotifications();

      app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          this.createMainWindow();
        }
      });
    });

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('before-quit', () => {
      this.isQuitting = true;
    });

    // Security: Prevent new window creation
    app.on('web-contents-created', (event, contents) => {
      contents.on('new-window', (navigationEvent, navigationURL) => {
        navigationEvent.preventDefault();
        shell.openExternal(navigationURL);
      });
    });

    // Handle protocol for deep linking
    if (process.defaultApp) {
      if (process.argv.length >= 2) {
        app.setAsDefaultProtocolClient('omnisecai', process.execPath, [path.resolve(process.argv[1])]);
      }
    } else {
      app.setAsDefaultProtocolClient('omnisecai');
    }
  }

  private createMainWindow(): void {
    const { width, height } = store.get('windowBounds') as any;
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

    // Create the browser window
    this.mainWindow = new BrowserWindow({
      width: Math.min(width, screenWidth),
      height: Math.min(height, screenHeight),
      minWidth: 800,
      minHeight: 600,
      show: false,
      icon: this.getAppIcon(),
      titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(__dirname, 'preload.js'),
        webSecurity: true,
        allowRunningInsecureContent: false,
      },
    });

    // Load the web application
    if (process.env.NODE_ENV === 'development') {
      this.mainWindow.loadURL('http://localhost:3000');
      this.mainWindow.webContents.openDevTools();
    } else {
      this.mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    }

    // Window event handlers
    this.mainWindow.once('ready-to-show', () => {
      if (!this.mainWindow) return;
      
      this.mainWindow.show();
      
      if (store.get('startMinimized')) {
        this.mainWindow.minimize();
      }
    });

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });

    this.mainWindow.on('close', (event) => {
      if (!this.isQuitting && process.platform === 'darwin') {
        event.preventDefault();
        this.mainWindow?.hide();
      }
    });

    // Save window bounds on resize/move
    this.mainWindow.on('resize', () => {
      if (this.mainWindow) {
        store.set('windowBounds', this.mainWindow.getBounds());
      }
    });

    this.mainWindow.on('move', () => {
      if (this.mainWindow) {
        store.set('windowBounds', this.mainWindow.getBounds());
      }
    });

    // Handle external links
    this.mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      return { action: 'deny' };
    });

    log.info('Main window created');
  }

  private setupApplicationMenu(): void {
    this.menuBuilder = new MenuBuilder(this.mainWindow!, this);
    const menu = this.menuBuilder.buildMenu();
    Menu.setApplicationMenu(menu);
  }

  private setupTray(): void {
    this.tray = createTray(this.mainWindow!, this);
    log.info('System tray created');
  }

  private setupAutoUpdater(): void {
    if (process.env.NODE_ENV === 'production') {
      autoUpdater.checkForUpdatesAndNotify();
      
      autoUpdater.on('update-downloaded', () => {
        dialog.showMessageBox(this.mainWindow!, {
          type: 'info',
          title: 'Update Ready',
          message: 'A new version has been downloaded. Restart to apply the update.',
          buttons: ['Restart', 'Later'],
        }).then((result) => {
          if (result.response === 0) {
            autoUpdater.quitAndInstall();
          }
        });
      });
    }
  }

  private setupIPCHandlers(): void {
    // App control
    ipcMain.handle('app:getVersion', () => app.getVersion());
    ipcMain.handle('app:quit', () => app.quit());
    ipcMain.handle('app:minimize', () => this.mainWindow?.minimize());
    ipcMain.handle('app:maximize', () => {
      if (this.mainWindow?.isMaximized()) {
        this.mainWindow.unmaximize();
      } else {
        this.mainWindow?.maximize();
      }
    });

    // Window control
    ipcMain.handle('window:show', () => {
      this.mainWindow?.show();
      this.mainWindow?.focus();
    });
    ipcMain.handle('window:hide', () => this.mainWindow?.hide());
    ipcMain.handle('window:isVisible', () => this.mainWindow?.isVisible());

    // Settings
    ipcMain.handle('settings:get', (event, key) => store.get(key));
    ipcMain.handle('settings:set', (event, key, value) => store.set(key, value));
    ipcMain.handle('settings:delete', (event, key) => store.delete(key));

    // Theme
    ipcMain.handle('theme:get', () => nativeTheme.themeSource);
    ipcMain.handle('theme:set', (event, theme) => {
      nativeTheme.themeSource = theme;
      store.set('theme', theme);
    });

    // File system
    ipcMain.handle('file:showOpenDialog', async (event, options) => {
      const result = await dialog.showOpenDialog(this.mainWindow!, options);
      return result;
    });

    ipcMain.handle('file:showSaveDialog', async (event, options) => {
      const result = await dialog.showSaveDialog(this.mainWindow!, options);
      return result;
    });

    // Shell operations
    ipcMain.handle('shell:openExternal', (event, url) => shell.openExternal(url));
    ipcMain.handle('shell:showItemInFolder', (event, path) => shell.showItemInFolder(path));

    // Notifications
    ipcMain.handle('notification:show', (event, options) => {
      this.notificationManager?.showNotification(options);
    });

    log.info('IPC handlers setup complete');
  }

  private setupPowerManagement(): void {
    this.powerManager = new PowerManager();
    
    powerMonitor.on('suspend', () => {
      log.info('System is going to sleep');
      this.mainWindow?.webContents.send('power:suspend');
    });

    powerMonitor.on('resume', () => {
      log.info('System has resumed');
      this.mainWindow?.webContents.send('power:resume');
    });

    powerMonitor.on('on-ac', () => {
      this.mainWindow?.webContents.send('power:ac-connected');
    });

    powerMonitor.on('on-battery', () => {
      this.mainWindow?.webContents.send('power:battery');
    });
  }

  private setupSecurityFeatures(): void {
    this.securityManager = new SecurityManager();
    
    // Certificate verification
    app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
      if (this.securityManager?.verifyCertificate(url, certificate)) {
        event.preventDefault();
        callback(true);
      } else {
        callback(false);
      }
    });
  }

  private setupNotifications(): void {
    this.notificationManager = new NotificationManager();
  }

  private getAppIcon(): string {
    if (process.platform === 'win32') {
      return path.join(__dirname, '../../assets/icon.ico');
    } else if (process.platform === 'darwin') {
      return path.join(__dirname, '../../assets/icon.icns');
    } else {
      return path.join(__dirname, '../../assets/icon.png');
    }
  }

  public getMainWindow(): BrowserWindow | null {
    return this.mainWindow;
  }

  public getTray(): Tray | null {
    return this.tray;
  }

  public showWindow(): void {
    if (this.mainWindow) {
      if (this.mainWindow.isMinimized()) {
        this.mainWindow.restore();
      }
      this.mainWindow.show();
      this.mainWindow.focus();
    }
  }

  public hideWindow(): void {
    this.mainWindow?.hide();
  }

  public toggleWindow(): void {
    if (this.mainWindow?.isVisible()) {
      this.hideWindow();
    } else {
      this.showWindow();
    }
  }

  public quit(): void {
    this.isQuitting = true;
    app.quit();
  }
}

// Initialize the application
new OmnisecAIApp();

export default OmnisecAIApp;