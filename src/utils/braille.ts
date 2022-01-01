import _ from "lodash";

const config = (multiple: number = 2) => ({
  brailleWidth: 2,
  brailleHeight: 4,
  maxWidth: 20 * multiple,
  maxHeight: 10 * multiple,
  horizontalGrid: [3, 16, 3],
  verticalGrid: [6, 32, 6],
});
function imageSize(image: File) {
  const img = document.createElement("img");

  const promise = new Promise<{
    width: number;
    height: number;
    img: HTMLImageElement;
  }>((resolve, reject) => {
    img.onload = () => {
      const width = img.naturalWidth;
      const height = img.naturalHeight;

      resolve({ width, height, img });
    };

    img.onerror = reject;
  });

  img.src = URL.createObjectURL(image);

  return promise;
}

interface Color {
  red: number;
  green: number;
  blue: number;
  alpha: number;
}

export function colorToHex({ red, green, blue, alpha }: Color) {
  return `#${red.toString(16).padStart(2, "0")}${green
    .toString(16)
    .padStart(2, "0")}${blue.toString(16).padStart(2, "0")}${alpha
    .toString(16)
    .padStart(2, "0")}`;
}

function brightness({ red, green, blue, alpha }: Color) {
  return ((0.299 * red + 0.587 * green + 0.114 * blue) * alpha) / 255;
}

function sum(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0);
}

function range(n: number, m?: number): number[] {
  if (typeof m === "undefined") return range(0, n);

  return Array(m - n)
    .fill(0)
    .map((x, i) => n + i);
}

function getBrailleColors(
  ctx: CanvasRenderingContext2D,
  bx: number,
  by: number,
  m?: number
): [string, Color] {
  const horizontalUnit = sum(config(m).horizontalGrid);
  const verticalUnit = sum(config(m).verticalGrid);
  const braillePointWidth =
    config(m).horizontalGrid[1] / config(m).brailleWidth;
  const braillePointHeight =
    config(m).verticalGrid[1] / config(m).brailleHeight;

  const colors: Color[][] = range(config(m).brailleWidth).map((x) =>
    range(config(m).brailleHeight).map((y) => {
      const gx =
        bx * horizontalUnit +
        x * braillePointWidth +
        config(m).horizontalGrid[0];
      const gy =
        by * verticalUnit + y * braillePointHeight + config(m).verticalGrid[0];

      const [r, g, b, a] = _.chunk(
        ctx.getImageData(gx, gy, braillePointWidth, braillePointHeight).data,
        4
      )
        .reduce(
          (c1, c2) => [
            c1[0] + c2[0],
            c1[1] + c2[1],
            c1[2] + c2[2],
            c1[3] + c2[3],
          ],
          [0, 0, 0, 0]
        )
        .map((c) =>
          Math.round(
            Math.min(
              255,
              Math.max(0, c / (braillePointWidth * braillePointHeight))
            )
          )
        );
      return { red: r, green: g, blue: b, alpha: a };
    })
  );

  const brightnesses = colors.flat().map(brightness);
  const threshold = Math.max(...brightnesses) * 0.5;

  const filteredColors: (Color | null)[][] = colors.map((col) =>
    col.map((c) => (brightness(c) >= threshold ? c : null))
  );

  const dots = filteredColors.flat().map((x) => (x ? 1 : 0));
  const weights = [1, 2, 4, 0x40, 8, 0x10, 0x20, 0x80];
  const charPoint = 0x2800 + sum(dots.map((d, i) => d * weights[i]));

  const averageColor = filteredColors
    .flat()
    .filter((x) => !!x)
    .reduce(
      (c1, c2) => ({
        red: c1!.red + c2!.red,
        green: c1!.green + c2!.green,
        blue: c1!.blue + c2!.blue,
        alpha: c1!.alpha + c2!.alpha,
      }),
      { red: 0, green: 0, blue: 0, alpha: 0 }
    ) ?? { red: 0, green: 0, blue: 0, alpha: 0 };
  const len = filteredColors.flat().filter((x) => !!x).length;
  const c = String.fromCharCode(charPoint);

  return [
    // トピアのバグのせいで文字をちょっと修正する
    charPoint % 8 !== 0
      ? c
      : c === ""
      ? "⣠"
      : "⢀⠠⠐⠈⠀".includes(c)
      ? "⠀"
      : "⢈⠘⠸⠈⢈⢘⢸".includes(c)
      ? String.fromCharCode(charPoint + 1)
      : "⠰⠸".includes(c)
      ? String.fromCharCode(charPoint + 4)
      : "⢨⢐⢰⢠".includes(c)
      ? String.fromCharCode(charPoint + 64)
      : c,
    {
      red: Math.round(averageColor!.red / len),
      green: Math.round(averageColor!.green / len),
      blue: Math.round(averageColor!.blue / len),
      alpha: Math.round(averageColor!.alpha / len),
    },
  ];
}

export async function draw(
  ctx: CanvasRenderingContext2D,
  image: File,
  m?: number
): Promise<[string, Color][][]> {
  const { width, height, img } = await imageSize(image);
  const aspectRatio = width / height;

  const horizontalUnit = sum(config(m).horizontalGrid);

  const dx =
    Math.max(0, (1 - aspectRatio) / 2) * horizontalUnit * config(m).maxWidth;
  const dw = config(m).maxWidth * horizontalUnit - 2 * dx;
  const dh = dw / aspectRatio;

  ctx.clearRect(0, 0, 99999, 99999);
  ctx.drawImage(img, dx, 0, dw, dh);

  return range(config(m).maxHeight)
    .map((y) => {
      const row = range(config(m).maxWidth).map((x) =>
        getBrailleColors(ctx, x, y)
      );
      if (row.every(([b, c]) => c.alpha === 0)) {
        return null;
      }

      let uselessIndex = row.length - 1;
      for (;;) {
        if (row[uselessIndex][1].alpha === 0 && y > 1) {
          uselessIndex -= 1;
        } else break;
      }

      // optimize result
      const result: typeof row = [];
      row.slice(0, uselessIndex + 1).forEach(([b, c]) => {
        if (
          result.length > 0 &&
          colorToHex(result[result.length - 1][1]) === colorToHex(c)
        ) {
          result[result.length - 1] = [
            result[result.length - 1][0] + b,
            result[result.length - 1][1],
          ];
        } else {
          result.push([b, c]);
        }
      });

      return result;
    })
    .filter((x) => !!x) as [string, Color][][];
}
