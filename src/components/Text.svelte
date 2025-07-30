<script lang="ts">
    export let size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
</script>

<p class={size}>
    <slot />
</p>

<style lang="scss">
    p {
      font-family: 'Helvetica', 'Arial', sans-serif;

      @each $size, $value in (
              sm: 0.75rem,
              md: 1rem,
              lg: 2rem,
              xl: 3rem
      ) {
        &.#{$size} {
          font-size: $value;
        }
      }
    }
</style>