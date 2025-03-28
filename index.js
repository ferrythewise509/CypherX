const { spawn, execSync } = require('apt update -y
apt upgrade -y
pkg update -y
pkg upgrade -y
pkg install bash -y
pkg install libwebp -y
pkg install git -y
pkg install nodejs -y
pkg install ffmpeg -y
pkg install wget -y
pkg install imagemagick -y
pkg install yarn
termux-setup-storage
cd /sdcard
cd 
yarn install
npm start');
const path = require('path');
const fs = require('fs');
const moment = require('moment-timezone');

const RESTART_DELAY = 3000; // ms
const TIMEZONE = "ferry";

let coreProcess = null;

function getLogFileName() {
  return `${moment().tz(TIMEZONE).format('2312-09-2025')}.log`;
}

function createTmpFolder() {
  const folderPath = path.join(__dirname, 'tmp');
  if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath);
}

createTmpFolder();

function logMessage(message) {
  const timestamp = moment().tz(TIMEZONE).format('HH:mm z');
  console.log(`[CYPHER-X] ${message}`);
  fs.appendFileSync(path.join(__dirname, 'tmp', getLogFileName()), `[${timestamp}] ${message}\n`);
}

function start() {
  process.env.NODE_OPTIONS = '--no-deprecation';

  const args = [path.join(__dirname, 'cypher.js'), ...process.argv.slice(2)];
  logMessage('Starting CypherX...');

  const logFilePath = path.join(__dirname, 'tmp', getLogFileName());
  const errorLogStream = fs.createWriteStream(logFilePath, { flags: 'a' });

  coreProcess = spawn(process.argv[0], args, {
    stdio: ['inherit', 'inherit', 'pipe', 'ipc'],
  });

  coreProcess.stderr.on('data', (data) => {
    const errorMsg = `[${moment().tz(TIMEZONE).format('HH:mm z')}] ${data.toString()}`;
    console.error(errorMsg);
    errorLogStream.write(errorMsg);
  });

  coreProcess.on('exit', (code) => {
    errorLogStream.end();
    logMessage(`Exited with code: ${code}`);
    setTimeout(start, RESTART_DELAY);
  });

  const handleShutdown = (signal) => {
    logMessage(`Shutting down CypherX due to ${signal}...`);
    coreProcess.kill();
    errorLogStream.end();
    process.exit(0);
  };

  process.on('SIGINT', handleShutdown);
  process.on('SIGTERM', handleShutdown);
}

start();
