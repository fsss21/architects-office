# Кабинет архитектора (каталог с индивидуальными разделами)
**0.07a Кабинет архитектора (каталог с индивидуальными разделами )**
Версия **0.07a** — интерактивный каталог о личности и творческих методах Н.А. Львова и Дж. Кваренги, архитектурном классицизме и палладианских принципах.

## Стек

- **React 18** + **Vite 5**
- **React Router v6**
- **CSS Modules**
- **MUI Icons** (иконки)
- Шрифты: **Raleway** (текст), **Anticva** (заголовки и кнопки)

## Структура проекта

```
├── public/
│   ├── data/
│   │   ├── content.json      # Контент: биографии, принципы, разделы главной
│   │   └── navigation.json  # Навигация: категории шапки, пункты сайдбара
│   └── fonts/               # Шрифт Anticva (см. README в папке)
├── src/
│   ├── assets/              # Фоны и изображения (main_menu, principles, start_screen)
│   ├── components/
│   │   ├── AppLayout.jsx    # Общий layout: шапка, сайдбар, кнопка «Назад»
│   │   └── StartScreen.jsx  # Стартовый экран
│   ├── pages/
│   │   ├── MainMenu.jsx     # Главная: разделы и свиток с фото
│   │   ├── Biography.jsx    # Биографии (Львов, Палладио, Кваренги)
│   │   ├── Principles.jsx   # Принципы: русские адаптации / палладианские
│   │   └── About.jsx        # О проекте
│   ├── server/              # Опциональный Express-сервер и сборка exe
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css            # Глобальные стили и @font-face
├── index.html
├── vite.config.js
└── package.json
```

## Запуск

### Режим разработки

```bash
npm install
npm run dev
```

Откроется приложение на `http://localhost:5173` (или другом порту Vite).

### Сборка статики

```bash
npm run build
```

Результат в папке **build/** (index.html, assets, data).

Проверка собранной версии без сервера:

```bash
npm run preview
```

### Сервер (раздача build + API для данных)

1. Собрать проект: `npm run build`
2. Запустить сервер: `npm run server`

Сервер поднимается на порту **3001**, раздаёт статику из `build/` и отдаёт JSON по адресам `/api/content` и `/api/navigation`. Настройки — в `src/server/utils/serverSetup.js` (порт, kiosk, автооткрытие браузера).

### Сборка exe (Windows / macOS)

- **Windows:** `npm run build:win` — в `build/` появятся файлы приложения и **launch.exe**
- **macOS:** `npm run build:mac` — в `build/` — исполняемый файл **server**

Перед этим обязательно выполните `npm run build`. Запускайте exe из папки, где лежит собранный `index.html` (или из корня проекта, чтобы сервер нашёл `build/index.html`).

## Данные

- **public/data/content.json** — тексты биографий (`persons`), разделов главной (`headerContent`), блок «Русские адаптации» и «Палладианские принципы» (`principles`).
- **public/data/navigation.json** — категории шапки (`topCategories`) и пункты сайдбара (`sidebarItems`).

При сборке папка `public/data` копируется в `build/data` (настройка в `vite.config.js`).

## Маршруты

| Путь | Описание |
|------|----------|
| `/` | Главная (MainMenu): разделы и свиток |
| `/biography/:personId` | Биография (lvov, palladio, quarenghi) |
| `/principles` | Принципы: два столбца с разделителем |
| `/about` | О проекте |

## Шрифты

- **Raleway** подключается через Google Fonts (`index.html`).
- **Anticva** — через `@font-face` в `src/index.css`; файлы нужно положить в **public/fonts/** (см. public/fonts/README.txt).

## Скрипты

| Команда | Действие |
|---------|----------|
| `npm run dev` | Запуск Vite в режиме разработки |
| `npm run build` | Сборка в `build/` |
| `npm run preview` | Просмотр собранной версии |
| `npm run server` | Запуск Express-сервера (порт 3001) |
| `npm run build:win` | Сборка + создание launch.exe |
| `npm run build:mac` | Сборка + создание исполняемого файла для macOS |
| `npm run lint` | Проверка ESLint |
