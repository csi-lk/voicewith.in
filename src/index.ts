import { menubar } from 'menubar';
import * as path from 'path';
import { app } from 'electron';

console.log('VoiceWithin - Voice Note-Taking Menu Bar App');

const mb = menubar({
  index: `file://${path.join(__dirname, '..', 'index.html')}`,
  icon: path.join(__dirname, '..', 'assets', 'icon.png'),
  tooltip: 'VoiceWithin - Voice Notes',
  browserWindow: {
    width: 400,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  }
});

mb.on('ready', () => {
  console.log('VoiceWithin is ready!');
});

mb.on('after-create-window', () => {
  if (process.env.NODE_ENV === 'development') {
    mb.window?.webContents.openDevTools();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});