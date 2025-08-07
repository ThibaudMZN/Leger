export const TEMPLATE = (body: string, head: string) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  ${head}
  <link rel="stylesheet" href="styles/style.css" />
</head>
<body>
${body}

  <script src="/scripts/components.iife.js" type="module"></script>
</body>
</html>`;
