const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { sliceImage } = require('./imageSlicer');

const app = express();
const port = process.env.PORT || 3000;

const uploadDir = path.join(__dirname, '..', 'uploads');
const outputBaseDir = path.join(__dirname, '..', 'output');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
if (!fs.existsSync(outputBaseDir)) {
  fs.mkdirSync(outputBaseDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, uploadDir);
  },
  filename: function (_req, file, cb) {
    const ext = path.extname(file.originalname) || '.png';
    const base = path.basename(file.originalname, ext);
    cb(null, `${base}-${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

app.use(express.static(path.join(__dirname, '..', 'public')));

app.post('/slice', upload.single('image'), async (req, res) => {
  try {
    const rows = parseInt(req.body.rows, 10);
    const cols = parseInt(req.body.cols, 10);

    if (!req.file) {
      return res.status(400).send('Arquivo de imagem é obrigatório.');
    }
    if (!rows || !cols || rows <= 0 || cols <= 0) {
      return res
        .status(400)
        .send('Parâmetros rows e cols são obrigatórios e devem ser maiores que zero.');
    }

    const jobDirName = `${Date.now()}-${path.basename(
      req.file.filename,
      path.extname(req.file.filename),
    )}`;
    const jobOutputDir = path.join(outputBaseDir, jobDirName);

    await sliceImage({
      inputPath: req.file.path,
      rows,
      cols,
      outputDir: jobOutputDir,
    });

    fs.readdir(jobOutputDir, (err, files) => {
      if (err) {
        return res.status(500).send('Erro ao listar arquivos gerados.');
      }

      const tileFiles = files.filter((f) => f.toLowerCase().endsWith('.png'));

      const linksHtml = tileFiles
        .map(
          (filename) =>
            `<li><a href="/download/${encodeURIComponent(
              jobDirName,
            )}/${encodeURIComponent(filename)}" target="_blank">${filename}</a></li>`,
        )
        .join('');

      res.send(`<!doctype html>
<html lang="pt-br">
<head>
  <meta charset="utf-8" />
  <title>BHS - Fatiador de imagens - Resultado</title>
  <style>
    body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 2rem; background: #f5f5f5; }
    .card { background: #fff; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.08); max-width: 640px; }
    h1 { margin-top: 0; font-size: 1.5rem; }
    ul { padding-left: 1.25rem; }
    a { color: #2563eb; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .actions { margin-top: 1rem; }
    .btn { display: inline-block; padding: 0.5rem 1rem; border-radius: 6px; border: none; cursor: pointer; text-decoration: none; font-size: 0.9rem; }
    .btn-primary { background: #2563eb; color: #fff; }
    .btn-secondary { background: #e5e7eb; color: #111827; margin-left: 0.5rem; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Imagem fatiada com sucesso</h1>
    <p>Baixe os pedaços gerados abaixo:</p>
    <ul>
      ${linksHtml}
    </ul>
    <div class="actions">
      <a href="/" class="btn btn-primary">Fatiar outra imagem</a>
    </div>
  </div>
</body>
</html>`);
    });
  } catch (err) {
    console.error('Erro no endpoint /slice', err);
    res.status(500).send('Erro ao fatiar imagem.');
  }
});

app.get('/download/:job/:file', (req, res) => {
  const job = req.params.job;
  const file = req.params.file;

  const filePath = path.join(outputBaseDir, job, file);
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Arquivo não encontrado.');
  }

  res.download(filePath);
});

app.listen(port, () => {
  console.log(`Servidor do BHS - Fatiador de imagens rodando em http://localhost:${port}`);
});

