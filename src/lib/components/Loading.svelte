<script>
     /** Stores */
     import { globalStore } from "$lib/stores/global";

     /** Variables */
     let loading = false;

     /** Suscripciones */
     globalStore.subscribe((state) => {
         loading = state.loading;
     });
</script>

{#if loading}
	<img class:loading src="loading.gif" alt="Cargando...">
{/if}

<style>
     .loading {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          justify-content: center;
          align-items: center;
     }

     img {
          width: 3em;
          height: 3em;
     }
</style>