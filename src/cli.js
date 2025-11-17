#!/usr/bin/env node

const path = require('path');
const { sliceImage } = require('./imageSlicer');

function printHelp() {
  console.log(`BHS - Fatiador de imagens

Uso:
  node src/cli.js --input caminho/para/imagem.png --rows 3 --cols 3 --out ./saida

Parâmetros:
  --input   Caminho da imagem de entrada (obrigatório)
  --rows    Número de linhas da grade (obrigatório)
  --cols    Número de colunas da grade (obrigatório)
  --out     Pasta de saída (opcional, padrão: ./output)
`);
}

async function main() {
  const args = process.argv.slice(2);
  const params = {};

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i];
    const value = args[i + 1];
    if (!key || !key.startsWith('--')) continue;
    const name = key.replace(/^--/, '');
    params[name] = value;
  }

  if (args.includes('--help') || args.includes('-h')) {
    printHelp();
    process.exit(0);
  }

  const inputPath = params.input;
  const rows = params.rows ? parseInt(params.rows, 10) : undefined;
  const cols = params.cols ? parseInt(params.cols, 10) : undefined;
  const outputDir = params.out
    ? path.resolve(process.cwd(), params.out)
    : path.resolve(process.cwd(), 'output');

  if (!inputPath || !rows || !cols) {
    console.error('Erro: --input, --rows e --cols são obrigatórios.');
    printHelp();
    process.exit(1);
  }

  try {
    const result = await sliceImage({
      inputPath: path.resolve(process.cwd(), inputPath),
      rows,
      cols,
      outputDir,
    });
    console.log(`Imagem fatiada com sucesso!`);
    console.log(`Tiles gerados: ${result.tiles}`);
    console.log(`Tamanho de cada tile: ${result.tileWidth}x${result.tileHeight}`);
    console.log(`Arquivos salvos em: ${result.outputDir}`);
  } catch (err) {
    console.error('Erro ao fatiar imagem:', err.message || err);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
