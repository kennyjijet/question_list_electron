import { app, BrowserWindow, ipcMain, ipcRenderer } from "electron";
import * as path from "path";

require('electron-reload')(__dirname);
let global_mainWindow : Electron.BrowserWindow;
let global_newWindow : Electron.BrowserWindow;
let global_answerTemp : string;

function createWindow () : void {
  // Create the browser window.
  global_mainWindow = new BrowserWindow ({
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true
    },
    width: 800,
  });

  // and load the index.html of the app.
  global_mainWindow.loadFile(path.join(__dirname, "../index.html"));

  // Open the DevTools.
  global_mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  global_mainWindow.on("closed", () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    global_mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it"s common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (global_mainWindow === null) {
    createWindow();
  }
});

ipcMain.on('open:addWindow', (event : any, arg : string) => {
  global_answerTemp = arg;
  if(!global_newWindow) {
    createNewWindow();
  } else {
    global_newWindow.webContents.send('test:answer', global_answerTemp);
  }
})

function createNewWindow () : void {
  global_newWindow = new BrowserWindow({
    x : 0,
    y : 0,
    height : 400,
    webPreferences : {
      nodeIntegration: true
    },
    width : 400,
    title : "Answer",
    show : false
  });

  global_newWindow.loadFile(path.join(__dirname, "../new_win.html"));

  global_newWindow.webContents.openDevTools();

  global_newWindow.on("ready-to-show", () => {
    global_newWindow.show();
    
    //ipcRenderer.send('test:answer', global_answerTemp);
    global_newWindow.webContents.send('test:answer', global_answerTemp);
  });

  global_newWindow.on("closed", () => {
    global_newWindow = null;
  });
}

