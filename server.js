import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Определяем путь к папке dist
// При запуске через pkg, __dirname указывает на временную папку с распакованными assets
// При обычном запуске - на папку с server.js
let distPath;
if (process?.pkg) {
  // При запуске через pkg, assets находятся в __dirname
  distPath = path.join(__dirname, 'dist');
} else {
  // При обычном запуске, dist находится рядом с server.js
  distPath = path.join(__dirname, 'dist');
}

// Обслуживание статических файлов из папки dist
app.use(express.static(distPath));

// Для всех остальных маршрутов возвращаем index.html (SPA routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Serving files from: ${distPath}`);
});
