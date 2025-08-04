<svelte:options customElement="leger-link" />

<script lang="ts">
    export let target: string;
</script>

<a href={target}>
    <slot />
</a>