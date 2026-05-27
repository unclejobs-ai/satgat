// satgat 한국어 데모팩 생성기.
// 13종 예시 HTML + 갤러리 index.html + manifest.json을 public/satgat/assets/examples/ko/ 에 쓴다.
// 콘텐츠는 scripts/demo/data.mjs, 레이아웃은 scripts/demo/layouts.mjs, 스타일은 scripts/demo/css.mjs 에 분리.
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { examples } from "./demo/data.mjs";
import { renderExample, renderIndex } from "./demo/layouts.mjs";

const outDir = join(process.cwd(), "public", "satgat", "assets", "examples", "ko");

await mkdir(outDir, { recursive: true });

for (const ex of examples) {
  await writeFile(join(outDir, `${ex.id}.html`), renderExample(ex), "utf8");
}

await writeFile(join(outDir, "index.html"), renderIndex(examples), "utf8");

await writeFile(
  join(outDir, "manifest.json"),
  JSON.stringify(
    examples.map(({ id, type, title, meta, prompt, layout, form }) => ({
      id,
      type,
      title,
      meta,
      prompt,
      layout,
      form,
      html: `${id}.html`,
      png: `${id}.png`,
    })),
    null,
    2
  ) + "\n",
  "utf8"
);

console.log(`Generated ${examples.length} Korean satgat specimens in ${outDir}`);
