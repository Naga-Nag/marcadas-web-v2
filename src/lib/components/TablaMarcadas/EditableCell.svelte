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
            checked={value == 1 || value === true || value === '1' || value === 'true'}
            on:change={(e) => onEdit(e.target && (e.target as HTMLInputElement).checked ? 'true' : 'false')}
        />
    {:else}
        {#if !isEditing}
            <button on:click={startEdit} class="editable-cell-button" on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && startEdit()}>
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
        position: relative;
        background: none;
        border: none;
        color: inherit;
        cursor: pointer;
        font: inherit;
        font-size: inherit;
		font-weight: inherit;
        text-decoration: none;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        width: 100%;
        text-align: left;

    }

    .editable-cell-input {
        width: 100%;
        font-size: 0.95rem;
        background: rgba(255, 255, 255, 0.95);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        color: #374151;
        font-weight: 500;
    }

    .placeholder {
        color: #9ca3af;
        font-style: italic;
        font-weight: 400;
    }

    /* Checkbox personalizado */
    input[type="checkbox"] {
        appearance: none;
        width: 20px;
        height: 20px;
        border: 2px solid #d1d5db;
        border-radius: 4px;
        background: white;
        position: relative;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto;
    }

    input[type="checkbox"]:checked {
        background: #667eea;
        border-color: #667eea;
    }

    input[type="checkbox"]:checked::after {
        content: '';
        position: absolute;
        width: 6px;
        height: 10px;
        border: solid white;
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
        top: 2px;
        left: 6px;
    }

    input[type="checkbox"]:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        background: #f3f4f6;
        border-color: #d1d5db;
    }

    input[type="checkbox"]:disabled:checked {
        background: #9ca3af;
        border-color: #9ca3af;
    }

    input[type="checkbox"]:focus {
        outline: none;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
    }

    input[type="checkbox"]:hover:not(:disabled) {
        border-color: #667eea;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
</style>