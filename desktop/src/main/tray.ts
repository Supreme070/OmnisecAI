/**
 * System tray implementation for OmnisecAI Desktop
 */
import { Tray, Menu, BrowserWindow, nativeImage } from 'electron';
import * as path from 'path';
import OmnisecAIApp from './main';

export function createTray(mainWindow: BrowserWindow, app: OmnisecAIApp): Tray {
  const trayIconPath = getTrayIconPath();
  const trayIcon = nativeImage.createFromPath(trayIconPath);
  
  // Resize icon for different platforms
  if (process.platform === 'darwin') {
    trayIcon.setTemplateImage(true);
  }
  
  const tray = new Tray(trayIcon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'OmnisecAI',
      type: 'normal',
      enabled: false,
    },
    {
      type: 'separator',
    },
    {
      label: 'Show Application',
      type: 'normal',
      click: () => {
        app.showWindow();
      },
    },
    {
      label: 'Hide Application',
      type: 'normal',
      click: () => {
        app.hideWindow();
      },
    },
    {
      type: 'separator',
    },
    {
      label: 'Dashboard',
      type: 'normal',
      click: () => {
        app.showWindow();
        mainWindow.webContents.send('navigate-to', '/dashboard');
      },
    },
    {
      label: 'Threat Detection',
      type: 'normal',
      click: () => {
        app.showWindow();
        mainWindow.webContents.send('navigate-to', '/threats');
      },
    },
    {
      label: 'Security Analytics',
      type: 'normal',
      click: () => {
        app.showWindow();
        mainWindow.webContents.send('navigate-to', '/analytics');
      },
    },
    {
      type: 'separator',
    },
    {
      label: 'Settings',
      type: 'normal',
      click: () => {
        app.showWindow();
        mainWindow.webContents.send('navigate-to', '/settings');
      },
    },
    {
      type: 'separator',
    },
    {
      label: 'Quit OmnisecAI',
      type: 'normal',
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
  tray.setToolTip('OmnisecAI - AI Cybersecurity Platform');

  // Handle tray icon click
  tray.on('click', () => {
    app.toggleWindow();
  });

  // Handle double-click on tray icon
  tray.on('double-click', () => {
    app.showWindow();
  });

  // Handle right-click on tray icon (Windows/Linux)
  tray.on('right-click', () => {
    tray.popUpContextMenu();
  });

  return tray;
}

function getTrayIconPath(): string {
  const iconName = process.platform === 'win32' ? 'tray-icon.ico' : 
                   process.platform === 'darwin' ? 'tray-iconTemplate.png' : 
                   'tray-icon.png';
  
  return path.join(__dirname, '../../assets', iconName);
}

export function updateTrayMenu(tray: Tray, notificationCount: number): void {
  const contextMenu = tray.getContextMenu();
  if (contextMenu) {
    // Update the first menu item to show notification count
    const firstItem = contextMenu.items[0];
    if (firstItem && notificationCount > 0) {
      firstItem.label = `OmnisecAI (${notificationCount} notifications)`;
    } else if (firstItem) {
      firstItem.label = 'OmnisecAI';
    }
    
    tray.setContextMenu(contextMenu);
  }

  // Update tray tooltip with notification count
  const tooltip = notificationCount > 0 
    ? `OmnisecAI - ${notificationCount} new notifications`
    : 'OmnisecAI - AI Cybersecurity Platform';
  
  tray.setToolTip(tooltip);
}