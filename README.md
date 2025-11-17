# BHS - Fatiador de imagens

Ferramenta em Node.js para fatiar uma imagem em uma grade (linhas x colunas) e salvar cada pedaço como um arquivo separado.

## Requisitos

- Node.js instalado

## Instalação (local)

No diretório do projeto:

```bash
npm install
```

## Uso com interface visual (web)

1. Inicie o servidor:

```bash
npm start
```

2. Abra o navegador em: [http://localhost:3000](http://localhost:3000)

3. Na tela:
   - Selecione a imagem (PNG/JPG);
   - Informe o número de **linhas** e **colunas**;
   - Opcional: marque **Modo Instagram (feed em grade 3x3)** para:
     - Recortar a imagem para um quadrado central;
     - Dividir em uma grade 3x3 com 9 fatias quadradas;
   - Clique em **Fatiar imagem**;
   - O navegador fará o download de um arquivo `.zip` com todas as fatias.

Nenhum arquivo sai da sua máquina: tudo roda localmente.

## Uso via CLI

Você também pode usar por linha de comando:

```bash
npm run cli -- --input caminho/para/imagem.png --rows 3 --cols 3 --out ./saida
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
- No modo Instagram 3x3, a imagem é recortada para um quadrado central com lado múltiplo de 3, garantindo 9 fatias quadradas e alinhadas.
- Os arquivos gerados são salvos em PNG.

