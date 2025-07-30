# Léger

Lightweight Static Site Generator (SSG) built with Svelte &amp; Vite

![Tests](https://img.shields.io/github/actions/workflow/status/ThibaudMZN/Leger/test.yml?label=Tests&logo=github)

## Target transpiling pipeline

```mermaid
graph
    Dir[Local directory] --> Files(.leg files)
    Dir[Local directory] --> Config(leger.config.js)
    Files -- transpile --> Svelte{.svelte}
    Config -- configure --> Svelte
    Svelte -- scaffold --> SvelteKit(SvelteKit routes)
    SvelteKit -- vite.build --> StaticHTML(Static HTML)
    SvelteKit -- vite.dev --> HMR(Local dev server)
```

## Todo

- [x] add proper scss
- [ ] more components
- [ ] front-matter support
- [ ] markdown support
- [ ] custom svelte support
- [ ] mixin support
- [ ] better parsing
  - [ ] allow nested trailing text
- [ ] add cli options (in/out)
  - [ ] from cli
  - [ ] from leger.config.js
- [ ] Test `build` and `dev` a bit more
  - [ ] It would be best to use vite.build() and vite.createServer()
  - [ ] We can make `.leg` parsing and svelteKit project scaffolding as a vite-plugin

## Example `.leg` file

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
