const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
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

function zipDirectory(sourceDir, outPath) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => resolve());
    output.on('error', (err) => reject(err));
    archive.on('error', (err) => reject(err));

    archive.pipe(output);
    archive.glob('*.png', { cwd: sourceDir });
    archive.finalize();
  });
}

app.post('/slice', upload.single('image'), async (req, res) => {
  try {
    const instagramMode =
      req.body.instagramMode === 'on' || req.body.instagramMode === 'true';

    let rows = parseInt(req.body.rows, 10);
    let cols = parseInt(req.body.cols, 10);

    if (instagramMode) {
      rows = 3;
      cols = 3;
    }

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
      square: instagramMode,
    });

    const originalBase = path.basename(
      req.file.originalname,
      path.extname(req.file.originalname),
    );

    const label = instagramMode ? 'insta-3x3' : `${rows}x${cols}`;
    const zipFileName = `${originalBase}-${label}.zip`;
    const zipPath = path.join(outputBaseDir, `${Date.now()}-${zipFileName}`);

    await zipDirectory(jobOutputDir, zipPath);

    res.download(zipPath, zipFileName);
  } catch (err) {
    console.error('Erro no endpoint /slice', err);
    res.status(500).send('Erro ao fatiar imagem.');
  }
});

app.listen(port, () => {
  console.log(`Servidor do BHS - Fatiador de imagens rodando em http://localhost:${port}`);
});

