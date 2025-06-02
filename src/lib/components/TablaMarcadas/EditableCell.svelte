<script lang="ts">
    export let editable: boolean;
    export let value: any;
    export let type: 'text' | 'checkbox' = 'text';
    export let onEdit: (newValue: any) => void;

    let isEditing = false;
    let inputValue = value;

    $: if (isEditing) inputValue = value;

    function startEdit() {
        isEditing = true;
        inputValue = value;
    }

    function confirmEdit() {
        isEditing = false;
        if (inputValue !== value) {
            onEdit(type === 'checkbox' ? !!inputValue : inputValue);
        }
    }
</script>

{#if editable}
    {#if type === 'checkbox'}
        <input
            type="checkbox"
            checked={value}
            on:change={(e) => onEdit(e.target && (e.target as HTMLInputElement).checked ? 1 : 0)}
        />
    {:else}
        {#if !isEditing}
            <button type="button" on:click={startEdit} class="editable-cell-button">
                {#if value === null || value === undefined}
                    <span class="placeholder">Editar</span>
                {:else}
                    {value}
                {/if}
            </button>
        {:else}
            <input
                type="text"
                bind:value={inputValue}
                on:blur={confirmEdit}
                on:keydown={(e) => e.key === 'Enter' && confirmEdit()}
                class="editable-cell-input"
            />
        {/if}
    {/if}
{:else}
    {#if type === 'checkbox'}
        <input type="checkbox" checked={value == 1 || value === true || value === '1'} disabled />
    {:else}
        {value}
    {/if}
{/if}

<style>
    .editable-cell-button {
        background: none;
        border: none;
        color: inherit;
        cursor: pointer;
        padding: 0;
        font: inherit;
        text-decoration: none;
    }
    .editable-cell-button:focus {
        outline: none;
    }

    .editable-cell-button:hover {
        color: blue;
    }

    .editable-cell-input {
        width: 100%;
        padding: 0.3em;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 1em;
    }

    .editable-cell-input:focus {
        border-color: #007bff;
        outline: none;
    }

    .placeholder {
        color: #999;
    }
</style>