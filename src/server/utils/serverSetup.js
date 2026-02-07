const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const os = require('os');

/**
 * Конфигурация сервера для проекта «Кабинет Архитектора»
 * Измените значения здесь для настройки поведения
 */
const CONFIG = {
  // Порт сервера
  port: 3001,

  // Режим kiosk (полноэкранный режим)
  // false - обычный режим с доступом к DevTools
  // true - полноэкранный kiosk режим (DevTools недоступны)
  kioskMode: false,

  // Автоматически открывать браузер при запуске
  openBrowser: true,

  // Отключить проверку CORS в браузере (--disable-web-security)
  // ВНИМАНИЕ: Используйте только для разработки на локальном сервере
  disableWebSecurity: false,

  // Задержка перед открытием браузера (мс)
  browserDelay: 1000,

  // Путь к index.html (для проверки после сборки Vite)
  indexHtmlPath: 'index.html',

  // Пути к файлам данных (относительно public/ или build/)
  contentFile: path.join('data', 'content.json'),
  navigationFile: path.join('data', 'navigation.json'),
};

/**
 * Класс для управления настройками и запуском сервера.
 * Поддерживает запуск через node и сборку через pkg.
 * Статика и данные: Vite собирает в build/, данные в public/data/ копируются в build/data/.
 */
class ServerSetup {
  constructor() {
    try {
      this.isPkg = typeof process.pkg !== 'undefined';
      // В режиме разработки: server находится в src/server, baseDir = корень проекта
      this.baseDir = this.isPkg
        ? path.dirname(process.execPath)
        : path.join(__dirname, '..', '..', '..');

      this.config = {
        port: CONFIG.port,
        kioskMode: CONFIG.kioskMode,
        openBrowser: CONFIG.openBrowser,
        disableWebSecurity: CONFIG.disableWebSecurity,
        browserDelay: CONFIG.browserDelay,
        indexHtmlPath: CONFIG.indexHtmlPath,
        contentFile: CONFIG.contentFile,
        navigationFile: CONFIG.navigationFile,
      };

      // Vite по умолчанию собирает в build/ (см. vite.config.js outDir: 'build')
      if (this.isPkg) {
        this.buildDir = this.baseDir;
      } else {
        this.buildDir = path.join(this.baseDir, 'build');
      }

      // Пути к файлам данных
      if (this.isPkg) {
        this.contentFile = path.join(this.baseDir, this.config.contentFile);
        this.navigationFile = path.join(this.baseDir, this.config.navigationFile);
        this.contentFileFallback = null;
        this.navigationFileFallback = null;
      } else {
        const buildContentPath = path.join(this.buildDir, this.config.contentFile);
        const publicContentPath = path.join(this.baseDir, 'public', this.config.contentFile);
        const buildNavPath = path.join(this.buildDir, this.config.navigationFile);
        const publicNavPath = path.join(this.baseDir, 'public', this.config.navigationFile);

        this.contentFile = buildContentPath;
        this.contentFileFallback = publicContentPath;
        this.navigationFile = buildNavPath;
        this.navigationFileFallback = publicNavPath;
      }

      this.getContentFile = this.getContentFile.bind(this);
      this.getNavigationFile = this.getNavigationFile.bind(this);
    } catch (error) {
      console.error('❌ Ошибка в конструкторе ServerSetup:', error);
      throw error;
    }
  }

  getBaseDir() {
    return this.baseDir;
  }

  getBuildDir() {
    return this.buildDir;
  }

  /**
   * Путь к content.json (build/data/ или public/data/ при разработке)
   */
  async getContentFile() {
    try {
      if (this.isPkg) return this.contentFile;
      if (!this.contentFile) throw new Error('contentFile не определен');

      if (typeof fs.pathExists !== 'function') {
        return this.contentFile;
      }
      const buildExists = await fs.pathExists(this.contentFile);
      if (buildExists) return this.contentFile;
      if (this.contentFileFallback) {
        const publicExists = await fs.pathExists(this.contentFileFallback);
        if (publicExists) return this.contentFileFallback;
      }
      return this.contentFile;
    } catch (error) {
      console.error('❌ Ошибка в getContentFile:', error);
      throw error;
    }
  }

  /**
   * Путь к navigation.json (build/data/ или public/data/ при разработке)
   */
  async getNavigationFile() {
    try {
      if (this.isPkg) return this.navigationFile;
      if (!this.navigationFile) throw new Error('navigationFile не определен');

      if (typeof fs.pathExists !== 'function') {
        return this.navigationFile;
      }
      const buildExists = await fs.pathExists(this.navigationFile);
      if (buildExists) return this.navigationFile;
      if (this.navigationFileFallback) {
        const publicExists = await fs.pathExists(this.navigationFileFallback);
        if (publicExists) return this.navigationFileFallback;
      }
      return this.navigationFile;
    } catch (error) {
      console.error('❌ Ошибка в getNavigationFile:', error);
      throw error;
    }
  }

  isPkgMode() {
    return this.isPkg;
  }

  getAppUrl() {
    return `http://localhost:${this.config.port}`;
  }

  getApiUrl() {
    return `http://localhost:${this.config.port}/api`;
  }

  async checkIndexHtml() {
    try {
      let indexHtmlPath = path.join(this.buildDir, this.config.indexHtmlPath);
      let exists = await fs.pathExists(indexHtmlPath);
      let foundViaFallback = false;

      if (!exists) {
        const possiblePaths = [
          path.join(process.cwd(), 'build', 'index.html'),
          path.join(process.cwd(), 'index.html'),
          path.join(this.baseDir, 'build', 'index.html'),
          path.join(this.baseDir, 'index.html'),
        ];
        for (const p of possiblePaths) {
          const found = await fs.pathExists(p).catch(() => false);
          if (found) {
            this.buildDir = path.dirname(p);
            this.contentFile = path.join(this.buildDir, this.config.contentFile);
            this.navigationFile = path.join(this.buildDir, this.config.navigationFile);
            if (this.isPkg) {
              this.contentFileFallback = null;
              this.navigationFileFallback = null;
            }
            exists = true;
            foundViaFallback = true;
            console.log(`✅ ${this.config.indexHtmlPath} найден: ${p}`);
            break;
          }
        }
      }

      if (!exists) {
        console.error(`\n❌ ОШИБКА: ${this.config.indexHtmlPath} не найден.`);
        console.log(`\n📂 Проверено: ${this.buildDir}`);
        console.log(`   Запустите из корня проекта и выполните: npm run build`);
        console.log(`   Либо поместите index.html (и папку assets, data) рядом с exe.`);
      } else if (!foundViaFallback) {
        console.log(`✅ ${this.config.indexHtmlPath} найден: ${indexHtmlPath}`);
      }
      return exists;
    } catch (error) {
      console.error('❌ Ошибка при проверке index.html:', error);
      return false;
    }
  }

  async openBrowser() {
    if (!this.config.openBrowser) return;

    if (os.platform() !== 'win32') {
      console.log('⚠️  Автооткрытие браузера только на Windows');
      console.log(`🌐 Откройте вручную: ${this.getAppUrl()}`);
      return;
    }

    const url = this.getAppUrl();
    if (this.config.disableWebSecurity) {
      console.log('⚠️  CORS отключён в браузере (только для разработки).');
    }
    const chromePath = process.env.PROGRAMFILES + '\\Google\\Chrome\\Application\\chrome.exe';
    const edgePath = process.env['ProgramFiles(x86)'] + '\\Microsoft\\Edge\\Application\\msedge.exe';

    const chromeExists = await fs.pathExists(chromePath);
    if (chromeExists) {
      let chromeFlags = '';
      if (this.config.disableWebSecurity) {
        chromeFlags += `--disable-web-security --user-data-dir="${os.tmpdir()}\\ChromeTempProfile" `;
      }
      if (this.config.kioskMode) {
        chromeFlags += `--autoplay-policy=no-user-gesture-required --app="${url}" --start-fullscreen --kiosk --disable-features=Translate,ContextMenuSearchWebFor,ImageSearch`;
      } else {
        chromeFlags += `--app="${url}" --auto-open-devtools-for-tabs`;
      }
      exec(`"${chromePath}" ${chromeFlags}`, (err) => {
        if (err) console.error('❌ Ошибка открытия Chrome:', err);
      });
      if (this.config.kioskMode) {
        setTimeout(() => {
          exec('taskkill /f /im explorer.exe', (err) => {
            if (err && !err.message.includes('не найден')) console.error('⚠️ ', err.message);
          });
        }, 12000);
      }
    } else {
      const edgeExists = await fs.pathExists(edgePath);
      if (edgeExists) {
        if (this.config.kioskMode) {
          exec('reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Edge" /v "TranslateEnabled" /t REG_DWORD /d 0 /f >nul 2>&1', () => {});
        }
        let edgeFlags = '';
        if (this.config.disableWebSecurity) {
          edgeFlags += `--disable-web-security --user-data-dir="${os.tmpdir()}\\EdgeTempProfile" `;
        }
        edgeFlags += this.config.kioskMode
          ? `--kiosk "${url}" --edge-kiosk-type=fullscreen --no-first-run`
          : `"${url}"`;
        exec(`"${edgePath}" ${edgeFlags}`, (err) => {
          if (err) console.error('❌ Ошибка открытия Edge:', err);
        });
      } else {
        console.error('❌ Chrome и Edge не найдены. Откройте вручную:', url);
      }
    }
  }

  /**
   * Инициализация директорий данных (public/data или build/data)
   */
  async initializeDataDir() {
    try {
      const contentPath = await this.getContentFile();
      const navPath = await this.getNavigationFile();
      await fs.ensureDir(path.dirname(contentPath));
      await fs.ensureDir(path.dirname(navPath));

      const contentExists = await fs.pathExists(contentPath);
      const navExists = await fs.pathExists(navPath);
      console.log(`📂 content.json: ${contentExists ? '✅' : '❌'} ${contentPath}`);
      console.log(`📂 navigation.json: ${navExists ? '✅' : '❌'} ${navPath}`);
      return true;
    } catch (error) {
      console.error('❌ Ошибка инициализации данных:', error);
      return false;
    }
  }

  logServerInfo() {
    console.log(`🚀 Сервер запущен на порту ${this.config.port}`);
    console.log(`📁 content.json: ${this.contentFile}`);
    console.log(`📁 navigation.json: ${this.navigationFile}`);
    console.log(`📂 Статика: ${this.buildDir}`);
    console.log(`🌐 Приложение: ${this.getAppUrl()}`);
    console.log(`🔧 Kiosk: ${this.config.kioskMode ? '✅' : '❌'}`);
    if (this.config.openBrowser) console.log(`🌐 Автооткрытие браузера: ✅`);
  }

  setupStaticFiles(app, express) {
    app.use(express.static(this.buildDir));
    app.use((req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      res.sendFile(path.join(this.buildDir, this.config.indexHtmlPath));
    });
  }

  async startServer(app, onReady) {
    try {
      const indexExists = await this.checkIndexHtml();
      if (!indexExists) {
        throw new Error(`index.html не найден в ${this.buildDir}. Выполните: npm run build`);
      }

      app.listen(this.config.port, async () => {
        try {
          this.logServerInfo();
          if (onReady) await onReady();
          if (this.config.openBrowser) {
            setTimeout(async () => {
              try {
                await this.openBrowser();
              } catch (e) {
                console.error('❌ Ошибка открытия браузера:', e);
                console.log(`🌐 Откройте вручную: ${this.getAppUrl()}`);
              }
            }, this.config.browserDelay);
          }
        } catch (e) {
          console.error('❌ Ошибка после запуска:', e);
          throw e;
        }
      }).on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
          console.error(`\n❌ Порт ${this.config.port} занят. Смените порт в serverSetup.js или закройте другое приложение.`);
        } else {
          console.error('\n❌ Ошибка запуска:', error.message);
        }
        console.log('\n⚠️  Окно закроется через 30 секунд...');
        setTimeout(() => process.exit(1), 30000);
      });
    } catch (error) {
      console.error('❌ Ошибка в startServer:', error);
      throw error;
    }
  }
}

module.exports = ServerSetup;
