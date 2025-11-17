const { Jimp } = require('jimp');

async function sliceImage({ inputPath, rows, cols, outputDir }) {
  if (!inputPath) throw new Error('Caminho da imagem de entrada é obrigatório');
  if (!rows || !cols) throw new Error('Parâmetros rows e cols são obrigatórios');

  const image = await Jimp.read(inputPath);
  const tileWidth = Math.floor(image.bitmap.width / cols);
  const tileHeight = Math.floor(image.bitmap.height / rows);

  const fs = require('fs');
  const path = require('path');
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

