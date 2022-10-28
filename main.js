const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu, ipcMain} = electron;

// set env
//process.env.NODE_ENV = 'production';

let mainWindow;
let addWindow;

// in electron we have to listen for the app to be ready

app.on('ready', function(){
    // create a new window
    mainWindow = new BrowserWindow({
        webPreferences: {nodeIntegration: true, contextIsolation: false,}
    });
    //load html file
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file:',
        slashes: true
    }));
    
    // when the main window is closed, close all other child processes
    mainWindow.on('closed', function(){
        app.quit();
    });

    // build menu from template - be sure to inlude this menu from electron
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);

    //insert the menu
    Menu.setApplicationMenu(mainMenu);
});



// handle createAddWindow
function createAddWindow() {
    addWindow = new BrowserWindow({
        width: 300,
        height: 200,
        title: 'based or not?',
        webPreferences: {nodeIntegration: true, contextIsolation: false}
    });
    //load html file
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'addWindow.html'),
        protocol: 'file:',
        slashes: true
    }));
    // garbage collection handle
    addWindow.on('closed', function(){
        addWindow = null;
    })
}

// catch item add
ipcMain.on('item: add', function(e, item){
    mainWindow.webContents.send('item: add', item);
    addWindow.close();
});

const mainMenuTemplate = [
    {
        label: 'File', 
        submenu: [
            {label: 'based', click() {createAddWindow();}},
            {label: 'nothing is based', click() {mainWindow.webContents.send('item: clear');}},
            {label: 'Quit', accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
            click(){app.quit();}}
        ]
    }
]

// if mac then add an empty object
if (process.platform == 'darwin') {
    mainMenuTemplate.unshift({});
}

// if we are not in production, add developer tool items
if (process.env.NODE_ENV != 'production') {
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu: [
            {
                label: 'Toggle dev tools',
                accelerator: process.platform == 'darwin' ? 'Command+i' : 'Ctrl+i',
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    });
}