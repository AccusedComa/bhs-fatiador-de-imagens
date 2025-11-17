const { Jimp } = require('jimp');
const fs = require('fs');
const path = require('path');

async function sliceImage({ inputPath, rows, cols, outputDir, square = false }) {
  if (!inputPath) {
    throw new Error('Caminho da imagem de entrada e obrigatorio');
  }
  if (!rows || !cols) {
    throw new Error('Parametros rows e cols sao obrigatorios');
  }

  const image = await Jimp.read(inputPath);

  if (square) {
    const w = image.bitmap.width;
    const h = image.bitmap.height;
    const minSide = Math.min(w, h);

    // garante que o lado seja divisivel pelo numero de colunas
    const size = minSide - (minSide % cols || 0);
    const offsetX = Math.floor((w - size) / 2);
    const offsetY = Math.floor((h - size) / 2);

    image.crop(offsetX, offsetY, size, size);
  }

  const tileWidth = Math.floor(image.bitmap.width / cols);
  const tileHeight = Math.floor(image.bitmap.height / rows);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const promises = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * tileWidth;
      const y = r * tileHeight;
      const clone = image.clone().crop(x, y, tileWidth, tileHeight);
      const filename = `tile_${r + 1}_${c + 1}.png`;
      const outPath = path.join(outputDir, filename);
      promises.push(clone.writeAsync(outPath));
    }
  }

  await Promise.all(promises);

  return {
    tiles: rows * cols,
    tileWidth,
    tileHeight,
    outputDir,
  };
}

module.exports = {
  sliceImage,
};

