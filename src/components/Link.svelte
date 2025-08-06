<svelte:options customElement="leger-link" />

<script lang="ts">
    export let target: string;
</script>

<a href={target}>
    <slot />
</a>

<style lang="scss">
  @use "../styles/variables" as *;

  a {
    color: $color-primary;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
</style>