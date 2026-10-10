import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const WIDTH = 1080;
const HEIGHT = 1920;

const dir = dirname(fileURLToPath(import.meta.url));
const outDir = await mkdtemp(join(tmpdir(), "format-tier-listing-"));

const args = process.argv.slice(2);
const title = args[0] ?? "Untitled";
const productArgs = args.slice(1);

if (productArgs.length % 2 !== 0) {
  throw new Error(
    "Products must be passed as name/image-path pairs: <title> <name> <image-path>...",
  );
}

const imageMimeTypes: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

const TWEMOJI_ASSETS =
  "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72";

function emojiToCodePoint(emoji: string) {
  const codePoints: number[] = [];

  for (const char of emoji) {
    codePoints.push(char.codePointAt(0)!);
  }

  return codePoints.map((codePoint) => codePoint.toString(16)).join("-");
}

async function loadEmojiImage(segment: string) {
  const response = await fetch(
    `${TWEMOJI_ASSETS}/${emojiToCodePoint(segment)}.png`,
  );

  if (!response.ok) {
    return undefined;
  }

  const buffer = Buffer.from(await response.arrayBuffer());

  return `data:image/png;base64,${buffer.toString("base64")}`;
}

const [background, interRegular, interBold] = await Promise.all([
  readFile(resolve(dir, "background.png")),
  readFile(resolve(dir, "..", "fonts", "Inter-Regular.ttf")),
  readFile(resolve(dir, "..", "fonts", "Inter-Bold.ttf")),
]);

const backgroundDataUrl = `data:image/png;base64,${background.toString("base64")}`;
const products = await Promise.all(
  Array.from({ length: productArgs.length / 2 }, async (_, index) => {
    const name = productArgs[index * 2]!;
    const imagePath = resolve(process.cwd(), productArgs[index * 2 + 1]!);
    const mimeType = imageMimeTypes[extname(imagePath).toLowerCase()];

    if (!mimeType) {
      throw new Error(`Unsupported product image type: ${imagePath}`);
    }

    const image = await readFile(imagePath);

    return {
      name,
      imageDataUrl: `data:${mimeType};base64,${image.toString("base64")}`,
    };
  }),
);

const fonts = [
  {
    name: "Inter",
    data: interRegular,
    weight: 400 as const,
    style: "normal" as const,
  },
  {
    name: "Inter",
    data: interBold,
    weight: 700 as const,
    style: "normal" as const,
  },
];

for (let stage = 0; stage <= products.length; stage += 1) {
  const currentProduct = products[Math.max(0, stage - 1)];
  const svg = await satori(
    <div
      style={{
        width: WIDTH,
        height: HEIGHT,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "#000",
      }}
    >
      <img
        src={backgroundDataUrl}
        width={WIDTH}
        height={HEIGHT}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
        }}
      />
      <div
        style={{
          position: "relative",
          width: WIDTH - 120,
          fontFamily: "Inter",
          fontWeight: 700,
          fontSize: 80,
          lineHeight: 1.1,
          color: "#ffffff",
          textAlign: "center",
          padding: "48px 0",
          borderRadius: 32,
          marginTop: 160,
        }}
      >
        {title}
      </div>
      <div
        style={{
          position: "relative",
          width: WIDTH - 120,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 60,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          {products.map((product, index) => (
            <div
              key={index}
              style={{
                fontFamily: "Inter",
                fontWeight: 400,
                fontSize: 48,
                lineHeight: 1.2,
                color: "#ffffff",
                textAlign: "left",
                marginBottom: 24,
                opacity: index < stage ? 1 : 0,
              }}
            >
              {index + 1}. {product.name}
            </div>
          ))}
        </div>
        {currentProduct && (
          <img
            src={currentProduct.imageDataUrl}
            width={400}
            height={400}
            style={{
              borderRadius: 24,
              opacity: stage === 0 ? 0 : 1,
            }}
          />
        )}
      </div>
      {stage >= products.length - 2 && (
        <div
          style={{
            position: "relative",
            marginTop: 40,
            fontFamily: "Inter",
            fontWeight: 700,
            fontSize: 44,
            color: "#ffffff",
            textAlign: "center",
          }}
        >
          Read Caption 👇
        </div>
      )}
    </div>,
    {
      width: WIDTH,
      height: HEIGHT,
      fonts,
      loadAdditionalAsset: async (code, segment) => {
        if (code === "emoji") {
          const image = await loadEmojiImage(segment);

          if (image) {
            return image;
          }
        }

        return [];
      },
    },
  );

  const resvg = new Resvg(svg, {
    fitTo: {
      mode: "width",
      value: WIDTH,
    },
  });

  const png = resvg.render().asPng();
  const outPath = join(outDir, `output-${stage}.png`);
  await writeFile(outPath, png);
  console.log(`written ${outPath}`);
}

console.log(`output directory: ${outDir}`);
