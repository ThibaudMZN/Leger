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

      &.col-3 {
        grid-template-columns: repeat(3, 1fr);
      }
    }
</style>