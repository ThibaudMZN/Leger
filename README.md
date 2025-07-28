# Léger

Lightweight Static Site Generator (SSG) built with Svelte &amp; Vite

![Tests](https://img.shields.io/github/actions/workflow/status/ThibaudMZN/Leger/test.yml?label=Tests&logo=github)

## Todo

- [ ] Test `build` and `dev` a bit more
  - [ ] Write tmp `dev` file inside `.leg` directory
- [ ] extract component list from actual components
  - [ ] check properties and throw warning if unknown
- [ ] more components
- [ ] add proper scss
- [ ] add global stylesheet
- [ ] front-matter support
- [ ] markdown support
- [ ] custom svelte support
- [ ] mixin support
- [ ] better parsing
  - [ ] components don't need ()
  - [ ] allow nested trailing text

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
