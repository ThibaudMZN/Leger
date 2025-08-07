<svelte:options customElement="leger-image" />

<script lang="ts">
    export let source: string;
</script>

<img src={source} alt=""/>

<style lang="scss">
    img {
      width: 100%;
    }
</style>