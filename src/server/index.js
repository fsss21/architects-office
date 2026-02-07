// Диагностика при запуске
console.log('🚀 Инициализация сервера Кабинет Архитектора...');
console.log('Node:', process.version, '| Platform:', process.platform);
console.log('CWD:', process.cwd());
console.log('Is PKG:', typeof process.pkg !== 'undefined');

let express, cors, fs, path, ServerSetup;

try {
  express = require('express');
  cors = require('cors');
  fs = require('fs-extra');
  path = require('path');
  ServerSetup = require('./utils/serverSetup');
  console.log('✅ Модули загружены');
} catch (error) {
  console.error('❌ Ошибка загрузки модулей:', error.message);
  console.log('\n⚠️  Окно закроется через 30 секунд...');
  setTimeout(() => process.exit(1), 30000);
  while (true) {}
}

process.on('uncaughtException', (error) => {
  console.error('\n❌ Необработанная ошибка:', error.message);
  console.error(error.stack);
  console.log('\n⚠️  Окно закроется через 30 секунд...');
  setTimeout(() => process.exit(1), 30000);
});

process.on('unhandledRejection', (reason) => {
  console.error('\n❌ Необработанный промис:', reason);
  console.log('\n⚠️  Окно закроется через 30 секунд...');
  setTimeout(() => process.exit(1), 30000);
});

const app = express();
let serverSetup;

try {
  serverSetup = new ServerSetup();
  console.log('✅ ServerSetup инициализирован');
} catch (error) {
  console.error('❌ Ошибка ServerSetup:', error);
  setTimeout(() => process.exit(1), 30000);
  while (true) {}
}

let CONTENT_FILE = null;
let NAVIGATION_FILE = null;

app.use(cors());
app.use(express.json());

async function initializeData() {
  try {
    if (typeof serverSetup.getContentFile !== 'function' || typeof serverSetup.getNavigationFile !== 'function') {
      throw new Error('ServerSetup: getContentFile/getNavigationFile не найдены');
    }
    CONTENT_FILE = await serverSetup.getContentFile();
    NAVIGATION_FILE = await serverSetup.getNavigationFile();
    if (!CONTENT_FILE || !NAVIGATION_FILE) {
      throw new Error('Не удалось получить пути к content.json или navigation.json');
    }
    await serverSetup.initializeDataDir();
  } catch (error) {
    console.error('❌ Ошибка инициализации данных:', error.message);
  }
}

// GET /api/content — данные контента (content.json)
app.get('/api/content', async (req, res) => {
  try {
    if (!CONTENT_FILE) CONTENT_FILE = await serverSetup.getContentFile();
    const exists = await fs.pathExists(CONTENT_FILE);
    if (exists) {
      const data = await fs.readJson(CONTENT_FILE);
      res.json(data);
    } else {
      res.status(404).json({ error: 'content.json не найден' });
    }
  } catch (error) {
    console.error('Ошибка чтения content:', error);
    res.status(500).json({ error: 'Не удалось загрузить контент' });
  }
});

// GET /api/navigation — навигация (navigation.json)
app.get('/api/navigation', async (req, res) => {
  try {
    if (!NAVIGATION_FILE) NAVIGATION_FILE = await serverSetup.getNavigationFile();
    const exists = await fs.pathExists(NAVIGATION_FILE);
    if (exists) {
      const data = await fs.readJson(NAVIGATION_FILE);
      res.json(data);
    } else {
      res.status(404).json({ error: 'navigation.json не найден' });
    }
  } catch (error) {
    console.error('Ошибка чтения navigation:', error);
    res.status(500).json({ error: 'Не удалось загрузить навигацию' });
  }
});

serverSetup.setupStaticFiles(app, express);

async function startServer() {
  try {
    console.log('🚀 Запуск сервера...');
    await initializeData();

    await serverSetup.startServer(app, async () => {
      console.log('✅ Сервер готов');
      if (CONTENT_FILE) console.log(`📁 Данные: ${path.dirname(CONTENT_FILE)}`);
    });
  } catch (error) {
    console.error('❌ Критическая ошибка:', error.message);
    console.error(error.stack);
    console.log('\n⚠️  Окно закроется через 30 секунд...');
    if (process.stdin.isTTY) {
      try {
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.once('data', () => process.exit(1));
      } catch (e) {}
    }
    setTimeout(() => process.exit(1), 30000);
  }
}

startServer().catch((error) => {
  console.error('❌ Ошибка запуска:', error);
  console.log('\n⚠️  Окно закроется через 30 секунд...');
  if (process.stdin.isTTY) {
    try {
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.once('data', () => process.exit(1));
    } catch (e) {}
  }
  setTimeout(() => process.exit(1), 30000);
});
