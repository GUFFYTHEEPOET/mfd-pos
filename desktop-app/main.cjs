// MFD POS desktop app — KreativG Studio.
// Opens the deployed web app in its own window. The web app's offline worker
// keeps a copy of the till on the laptop, so it opens with no internet, and a
// new deployment shows "A new version of MFD POS is ready" here too.
//
// The till's data is saved for APP_URL's address in %APPDATA%\<DATA_DIR>:
// NEVER change APP_URL or DATA_DIR after go-live, or the app opens empty
// (data comes back with Settings > Cloud database > Restore from cloud).
const { app, BrowserWindow, Menu, session, shell } = require("electron");
const path = require("node:path");

const APP_URL = process.env.MFD_POS_URL || "https://pos.mfdbricksandsand.co.za/";
const ORIGIN = new URL(APP_URL).origin;
// own folder, apart from the old 1.0.0 app's "MFD POS" folder, so uninstalling
// that version can never take this till's data with it
const DATA_DIR = "MFD POS Desktop";

app.setPath("userData", path.join(app.getPath("appData"), DATA_DIR));

// one till window only: two copies would overwrite each other's sales
if (!app.requestSingleInstanceLock()) app.quit();

let win = null;

const isAppUrl = (url) => { try { return new URL(url).origin === ORIGIN; } catch { return false; } };

function showOfflinePage(reason) {
  void win.loadFile(path.join(__dirname, "offline.html"), { query: { url: APP_URL, reason: String(reason || "") } });
}

function createWindow() {
  // the window appears at once (dark MFD background) and the till draws into it,
  // instead of staying invisible until the page has finished loading
  win = new BrowserWindow({
    width: 1366,
    height: 860,
    minWidth: 1024,
    minHeight: 640,
    show: true,
    title: "MFD POS",
    icon: path.join(__dirname, "build", "icon.ico"),
    backgroundColor: "#1B1612",
    autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true, webSecurity: true, spellcheck: false, backgroundThrottling: false },
  });
  win.maximize();
  win.setFullScreen(true);   // the till opens full screen; F11 switches it off and on

  // WhatsApp and other web links open in the normal browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https:\/\//.test(url)) void shell.openExternal(url);
    return { action: "deny" };
  });
  win.webContents.on("will-navigate", (event, url) => {
    if (isAppUrl(url)) return;
    event.preventDefault();
    if (/^https:\/\//.test(url)) void shell.openExternal(url);
  });

  // first start with no internet (the offline copy is not on the laptop yet)
  win.webContents.on("did-fail-load", (_e, code, desc, url, isMainFrame) => {
    if (isMainFrame && code !== -3 && isAppUrl(url)) showOfflinePage(desc);
  });

  // F11 full screen, F5 reload, Ctrl+Shift+I developer tools (support only)
  win.webContents.on("before-input-event", (event, input) => {
    if (input.type !== "keyDown") return;
    if (input.key === "F11") { win.setFullScreen(!win.isFullScreen()); event.preventDefault(); }
    if (input.key === "F5") { void win.loadURL(APP_URL); event.preventDefault(); }
    if (input.control && input.shift && input.key.toLowerCase() === "i") { win.webContents.toggleDevTools(); event.preventDefault(); }
  });

  void win.loadURL(APP_URL);
}

app.on("second-instance", () => {
  if (!win) return;
  if (win.isMinimized()) win.restore();
  win.focus();
});

app.whenReady().then(() => {
  // only keep-my-data storage and the till's Full screen button are allowed; no camera, microphone, location etc.
  session.defaultSession.setPermissionRequestHandler((_wc, permission, callback) => callback(permission === "persistent-storage" || permission === "fullscreen"));
  Menu.setApplicationMenu(null);
  createWindow();
});

app.on("window-all-closed", () => app.quit());
