# BHS - Fatiador de imagens

Ferramenta em Node.js para fatiar uma imagem em uma grade (linhas x colunas) e salvar cada pedaço como um arquivo separado.

## Requisitos

- Node.js instalado

## Instalação (local)

No diretório do projeto:

```bash
npm install
npm link   # opcional, para usar o comando global
```

## Uso via CLI

Padrão (sem `npm link`):

```bash
node src/cli.js --input caminho/para/imagem.png --rows 3 --cols 3 --out ./saida
```

Se você rodar `npm link`, poderá usar:

```bash
bhs-fatiador --input caminho/para/imagem.png --rows 3 --cols 3 --out ./saida
```

### Parâmetros

- `--input` (obrigatório): caminho da imagem de entrada (PNG, JPG, etc.).
- `--rows` (obrigatório): número de linhas na grade.
- `--cols` (obrigatório): número de colunas na grade.
- `--out`  (opcional): pasta de saída (padrão: `./output`).

Os arquivos serão salvos como:

```text
tile_1_1.png
tile_1_2.png
...
tile_L_C.png
```

onde `L` é a linha e `C` é a coluna.

## Uso programático

Você também pode usar a função diretamente em código Node:

```js
const { sliceImage } = require('bhs---fatiador-de-imagens');

(async () => {
  await sliceImage({
    inputPath: 'caminho/para/imagem.png',
    rows: 3,
    cols: 3,
    outputDir: './saida',
  });
})();
```

## Notas

- A imagem é dividida em partes de tamanho inteiro; se a largura/altura não forem divisíveis exatamente por `cols`/`rows`, os pixels excedentes são ignorados.
- Os arquivos gerados são salvos em PNG.
