/**
 * Application menu builder for OmnisecAI Desktop
 */
import { Menu, MenuItem, BrowserWindow, shell, app } from 'electron';
import OmnisecAIApp from './main';

export class MenuBuilder {
  private mainWindow: BrowserWindow;
  private app: OmnisecAIApp;

  constructor(mainWindow: BrowserWindow, app: OmnisecAIApp) {
    this.mainWindow = mainWindow;
    this.app = app;
  }

  buildMenu(): Menu {
    if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
      this.setupDevelopmentEnvironment();
    }

    const template = process.platform === 'darwin'
      ? this.buildDarwinTemplate()
      : this.buildDefaultTemplate();

    const menu = Menu.buildFromTemplate(template);

    return menu;
  }

  private setupDevelopmentEnvironment(): void {
    this.mainWindow.webContents.on('context-menu', (_, props) => {
      const { x, y } = props;

      Menu.buildFromTemplate([
        {
          label: 'Inspect element',
          click: () => {
            this.mainWindow.webContents.inspectElement(x, y);
          },
        },
      ]).popup({ window: this.mainWindow });
    });
  }

  private buildDarwinTemplate() {
    const subMenuAbout = {
      label: 'OmnisecAI',
      submenu: [
        {
          label: 'About OmnisecAI',
          selector: 'orderFrontStandardAboutPanel:',
        },
        { type: 'separator' },
        {
          label: 'Services',
          submenu: [],
        },
        { type: 'separator' },
        {
          label: 'Hide OmnisecAI',
          accelerator: 'Command+H',
          selector: 'hide:',
        },
        {
          label: 'Hide Others',
          accelerator: 'Command+Shift+H',
          selector: 'hideOtherApplications:',
        },
        {
          label: 'Show All',
          selector: 'unhideAllApplications:',
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          click: () => {
            this.app.quit();
          },
        },
      ],
    };

    const subMenuEdit = {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'Command+Z', selector: 'undo:' },
        { label: 'Redo', accelerator: 'Shift+Command+Z', selector: 'redo:' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'Command+X', selector: 'cut:' },
        { label: 'Copy', accelerator: 'Command+C', selector: 'copy:' },
        { label: 'Paste', accelerator: 'Command+V', selector: 'paste:' },
        {
          label: 'Select All',
          accelerator: 'Command+A',
          selector: 'selectAll:',
        },
      ],
    };

    const subMenuView = {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'Command+R',
          click: () => {
            this.mainWindow.webContents.reload();
          },
        },
        {
          label: 'Force Reload',
          accelerator: 'Command+Shift+R',
          click: () => {
            this.mainWindow.webContents.reloadIgnoringCache();
          },
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: 'Alt+Command+I',
          click: () => {
            this.mainWindow.webContents.toggleDevTools();
          },
        },
        { type: 'separator' },
        {
          label: 'Actual Size',
          accelerator: 'Command+0',
          click: () => {
            this.mainWindow.webContents.zoomLevel = 0;
          },
        },
        {
          label: 'Zoom In',
          accelerator: 'Command+Plus',
          click: () => {
            const zoomLevel = this.mainWindow.webContents.zoomLevel;
            this.mainWindow.webContents.zoomLevel = zoomLevel + 0.5;
          },
        },
        {
          label: 'Zoom Out',
          accelerator: 'Command+-',
          click: () => {
            const zoomLevel = this.mainWindow.webContents.zoomLevel;
            this.mainWindow.webContents.zoomLevel = zoomLevel - 0.5;
          },
        },
        { type: 'separator' },
        {
          label: 'Toggle Fullscreen',
          accelerator: 'Ctrl+Command+F',
          click: () => {
            this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
          },
        },
      ],
    };

    const subMenuWindow = {
      label: 'Window',
      submenu: [
        {
          label: 'Minimize',
          accelerator: 'Command+M',
          selector: 'performMiniaturize:',
        },
        {
          label: 'Close',
          accelerator: 'Command+W',
          selector: 'performClose:',
        },
        { type: 'separator' },
        {
          label: 'Bring All to Front',
          selector: 'arrangeInFront:',
        },
      ],
    };

    const subMenuHelp = {
      label: 'Help',
      submenu: [
        {
          label: 'Learn More',
          click: () => {
            shell.openExternal('https://omnisecai.com');
          },
        },
        {
          label: 'Documentation',
          click: () => {
            shell.openExternal('https://docs.omnisecai.com');
          },
        },
        {
          label: 'Search Issues',
          click: () => {
            shell.openExternal('https://github.com/omnisecai/omnisecai-desktop/issues');
          },
        },
      ],
    };

    return [subMenuAbout, subMenuEdit, subMenuView, subMenuWindow, subMenuHelp];
  }

  private buildDefaultTemplate() {
    return [
      {
        label: '&File',
        submenu: [
          {
            label: '&Open',
            accelerator: 'Ctrl+O',
          },
          {
            label: '&Close',
            accelerator: 'Ctrl+W',
            click: () => {
              this.mainWindow.close();
            },
          },
        ],
      },
      {
        label: '&Edit',
        submenu: [
          { label: '&Undo', accelerator: 'Ctrl+Z', role: 'undo' },
          { label: '&Redo', accelerator: 'Shift+Ctrl+Z', role: 'redo' },
          { type: 'separator' },
          { label: 'Cu&t', accelerator: 'Ctrl+X', role: 'cut' },
          { label: '&Copy', accelerator: 'Ctrl+C', role: 'copy' },
          { label: '&Paste', accelerator: 'Ctrl+V', role: 'paste' },
          { label: 'Select &All', accelerator: 'Ctrl+A', role: 'selectall' },
        ],
      },
      {
        label: '&View',
        submenu: [
          {
            label: '&Reload',
            accelerator: 'Ctrl+R',
            click: () => {
              this.mainWindow.webContents.reload();
            },
          },
          {
            label: '&Force Reload',
            accelerator: 'Ctrl+Shift+R',
            click: () => {
              this.mainWindow.webContents.reloadIgnoringCache();
            },
          },
          {
            label: 'Toggle &Developer Tools',
            accelerator: 'F12',
            click: () => {
              this.mainWindow.webContents.toggleDevTools();
            },
          },
          { type: 'separator' },
          {
            label: 'Actual &Size',
            accelerator: 'Ctrl+0',
            click: () => {
              this.mainWindow.webContents.zoomLevel = 0;
            },
          },
          {
            label: 'Zoom &In',
            accelerator: 'Ctrl+Plus',
            click: () => {
              const zoomLevel = this.mainWindow.webContents.zoomLevel;
              this.mainWindow.webContents.zoomLevel = zoomLevel + 0.5;
            },
          },
          {
            label: 'Zoom &Out',
            accelerator: 'Ctrl+-',
            click: () => {
              const zoomLevel = this.mainWindow.webContents.zoomLevel;
              this.mainWindow.webContents.zoomLevel = zoomLevel - 0.5;
            },
          },
          { type: 'separator' },
          {
            label: 'Toggle &Fullscreen',
            accelerator: 'F11',
            click: () => {
              this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
            },
          },
        ],
      },
      {
        label: '&Help',
        submenu: [
          {
            label: 'Learn More',
            click: () => {
              shell.openExternal('https://omnisecai.com');
            },
          },
          {
            label: 'Documentation',
            click: () => {
              shell.openExternal('https://docs.omnisecai.com');
            },
          },
        ],
      },
    ];
  }
}