export const TEMPLATE = (body: string) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Leger</title>
</head>
<body>
${body}

  <script src="/scripts/components.iife.js" type="module"></script>
</body>
</html>`;
