<script lang="ts">
    export let size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
</script>

<p class={size}>
    <slot />
</p>

<style lang="scss">
    p {
      font-family: 'Helvetica', 'Arial', sans-serif;

      &.sm {
        font-size: 0.75rem;
      }

      &.md {
        font-size: 1rem;
      }

      &.lg {
        font-size: 2rem;
      }

      &.xl {
        font-size: 3rem;
      }
    }
</style>