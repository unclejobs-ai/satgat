// 공용 헬퍼: HTML 이스케이프 + 문서 셸.
import { baseCss, FONT_LINKS } from "./css.mjs";

export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

// 줄바꿈(\n)을 <br>로. 이스케이프 후 적용한다.
export function nl2br(value) {
  return escapeHtml(value).replaceAll("\n", "<br>");
}

export function page(title, body) {
  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)} · satgat</title>
  <meta name="generator" content="satgat">
${FONT_LINKS}
  <style>${baseCss()}</style>
</head>
<body>
${body}
</body>
</html>`;
}
