# Slim

Lightweight Static Site Generator (SSG) built with Svelte &amp; Vite

![Tests](https://img.shields.io/github/actions/workflow/status/ThibaudMZN/Slim/test.yml?label=Tests&logo=github)

## Example `.slim` file

```jade
section(columns="2")
    text(size="large") This is awesome
    text(size="small") ... and this might be too small
button() Sign up
```

...would generate

```sveltehtml
<Section columns="2">
    <Text size="large">This is awesome</Text>
    <Text size="small">... and this might be too small</Text>
</Section>
<Button>Sign up</Button>
```
