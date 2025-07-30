<script lang="ts">
    export let columns: number = 1;
</script>

<section class="col-{columns}">
    <slot />
</section>

<style lang="scss">
    section {
      display: grid;
      align-items: center;
      justify-items: center;
      gap: 1rem;

      @for $i from 1 through 12 {
        &.col-#{$i} {
          grid-template-columns: repeat(#{$i}, 1fr);
        }
      }
    }
</style>