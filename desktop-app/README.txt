MFD POS — WINDOWS DESKTOP APP
KreativG Studio

The desktop app opens the deployed web app (https://pos.mfdbricksandsand.co.za)
in its own window, so:
  - every deployment to the website reaches the desktop app too: it shows
    "A new version of MFD POS is ready", the cashier presses Update now;
  - it works with or without internet (the web app keeps an offline copy
    of the till on the laptop after the first start);
  - nothing in this folder needs rebuilding when the POS changes. Only
    rebuild if the address, icon or window behaviour changes.

INSTALL
  Run release\MFD-POS-Setup-<version>.exe on the till laptop.
  Windows may say "Windows protected your PC" (the installer is not
  code-signed): click More info > Run anyway.
  The FIRST start needs internet (it downloads the till). After that it
  opens offline too.

WHERE THE DATA IS
  %APPDATA%\MFD POS Desktop  — kept when the app is uninstalled or updated.
  Inside it, saved for the address https://pos.mfdbricksandsand.co.za:
    IndexedDB\      all sales, products, customers, settings (main copy)
    Local Storage\  small backup copy, cloud connection, sync bookkeeping
  With no internet, every sale is saved there first. When the connection
  is back the app sends everything that changed to Supabase on its own
  (straight away, then every minute). The sidebar shows
  "Offline — saved on this laptop" until it has caught up.

  Never change the address or the data folder after go-live: the app would
  open empty (bring the data back with Settings > Cloud database >
  Restore from cloud).

BUILDING THE INSTALLER
  npm install   (first time only)
  npm run dist  -> release\MFD-POS-Setup-<version>.exe
  Run from VS Code's terminal? Clear ELECTRON_RUN_AS_NODE first, or
  Electron will not start.
  Testing against another address:  set MFD_POS_URL=http://localhost:8765/
  then  npx electron .

KEYS
  F11            full screen on / off
  F5             reload
  Ctrl+Shift+I   developer tools (support only)
