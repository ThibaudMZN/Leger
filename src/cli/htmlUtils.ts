export const TEMPLATE = (body: string) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Leger</title>
  <link rel="stylesheet" href="styles/style.css" />
</head>
<body>
${body}

  <script src="/scripts/components.iife.js" type="module"></script>
</body>
</html>`;
