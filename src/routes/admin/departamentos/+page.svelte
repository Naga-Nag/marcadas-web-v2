<script lang="ts">
    import { onMount } from 'svelte';
    import { fetchDepartamentos, updateDepartamento } from '$lib/apiController/departamentosApi';
    import type { Departamento } from '$lib/types/gen';
    import { fade, slide } from 'svelte/transition';
	import { browser } from '$app/environment';

    let departamentos: Departamento[] = [];
    let showEditForm = false;
    let error = '';
    let loading = false;
    let form: Partial<Departamento> = {};
    let editingDeptid: number | null = null;
    let selloPreview: string | null = null;

    async function loadDepartamentos() {
        departamentos = await fetchDepartamentos();
    }

    onMount(async () => {
        await loadDepartamentos();
        if (browser) {
			const body: HTMLElement | null = document.querySelector('body');
			if (body) {
				body.style.overflowY = 'auto'; // Enable body scroll
			}
		}

    });

    function openEditForm(departamento: Departamento) {
        form = { ...departamento };
        editingDeptid = departamento.Deptid;
        selloPreview = departamento.SelloJefe;
        showEditForm = true;
        error = '';
    }

    function closeForm() {
        showEditForm = false;
        form = {};
        editingDeptid = null;
        selloPreview = null;
        error = '';
    }

    async function handleFileChange(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            const file = input.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                form.SelloJefe = result.split(',')[1]; // base64
                selloPreview = result;
            };
            reader.readAsDataURL(file);
        }
    }

    async function handleSubmit() {
        loading = true;
        error = '';
        try {
            if (!form.Deptid || !form.DeptName) {
                error = 'Completa todos los campos obligatorios';
                loading = false;
                return;
            }
            await updateDepartamento(form as Departamento);
            await loadDepartamentos();
            closeForm();
        } catch (e: any) {
            error = e.message || 'Error al actualizar departamento';
        }
        loading = false;
    }
</script>

<main>
    <a href="/admin/usuarios" class="btn primary-btn">Volver</a>
    <h1>Administrar Departamentos</h1>
    <button on:click={() => openEditForm({ Deptid: 0, DeptName: '', SelloJefe: null, leyendaJefe: '' })} class="btn primary-btn">Nuevo Departamento</button>

    {#if showEditForm}
        <div class="register-form-overlay" transition:fade>
            <div class="register-form">
                <button on:click={closeForm} class="close-button" aria-label="Cerrar">&times;</button>
                <h3>{editingDeptid ? 'Editar Departamento' : 'Nuevo Departamento'}</h3>
                {#if error}
                    <div class="error">{error}</div>
                {/if}
                <form on:submit|preventDefault={handleSubmit}>
                    <label>
                        Nombre:
                        <input type="text" bind:value={form.DeptName} required />
                    </label>
                    <label>
                        Leyenda del Jefe:
                        <input type="text" bind:value={form.leyendaJefe} />
                    </label>
                    <label>
                        Sello del Jefe:
                        <input type="file" accept="image/*" on:change={handleFileChange} />
                        {#if selloPreview}
                            <img src={"data:image/png;base64," + (form.SelloJefe ?? '')} alt="Sello Jefe" style="max-width:120px;max-height:120px;margin-top:10px;" />
                        {/if}
                    </label>
                    <div class="form-actions">
                        <button class="btn primary-btn" type="submit" disabled={loading}>
                            {editingDeptid ? 'Actualizar' : 'Crear'}
                        </button>
                        <button type="button" class="btn secondary-btn" on:click={closeForm}>Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    {/if}

    <ul class="dept-list">
        {#each departamentos as departamento (departamento.Deptid)}
            <li class="dept-item" transition:slide>
                <details>
                    <summary>
                        <span>{departamento.DeptName}</span>
                        <button class="btn secondary-btn" on:click={() => openEditForm(departamento)}>Editar</button>
                    </summary>
                    <div class="dept-details">
                        <p><strong>ID:</strong> {departamento.Deptid}</p>
                        <p><strong>Nombre:</strong> {departamento.DeptName}</p>
                        <p><strong>Leyenda Jefe:</strong> {departamento.leyendaJefe}</p>
                        {#if departamento.SelloJefe}
                            <p><strong>Sello Jefe:</strong></p>
                            <img src={"data:image/png;base64," + departamento.SelloJefe} alt="Sello Jefe" style="max-width:120px;max-height:120px;" />
                        {/if}
                    </div>
                </details>
            </li>
        {/each}
    </ul>
</main>

<style>
main {
    max-width: 900px;
    margin: 0 auto;
    padding: 2em 1em;
}
h1 {
    text-align: center;
    color: #ffffff;
    margin-bottom: 1em;
}
.btn {
    padding: 0.5em 1.2em;
    border-radius: 6px;
    border: none;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
    margin-right: 0.5em;
}
.primary-btn {
    background: #1976d2;
    color: #fff;
}
.primary-btn:hover {
    background: #125ea6;
}
.secondary-btn {
    background: #e3f0fc;
    color: #1976d2;
}
.secondary-btn:hover {
    background: #b3c6e6;
}
.dept-list {
    list-style: none;
    padding: 0;
    max-width: 800px;
    margin: 2em auto 0 auto;
}
.dept-item {
    background: #fff;
    border: 1px solid #e0e7ef;
    border-radius: 10px;
    margin-bottom: 12px;
    padding: 15px;
    box-shadow: 0 3px 6px rgba(25, 118, 210, 0.07);
    transition: transform 0.2s;
}
.dept-item:hover {
    transform: scale(1.02);
}
.register-form-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}
.register-form {
    background: white;
    padding: 2em 1.5em 1.5em 1.5em;
    border-radius: 12px;
    box-shadow: 0 5px 10px rgba(25, 118, 210, 0.13);
    width: 420px;
    text-align: center;
    position: relative;
}
.close-button {
    position: absolute;
    top: 10px;
    right: 15px;
    font-size: 22px;
    border: none;
    background: none;
    cursor: pointer;
    color: #e53935;
}
.close-button:hover {
    color: #a71d2a;
}
label {
    display: block;
    margin-bottom: 12px;
    font-weight: 600;
    color: #1976d2;
    text-align: left;
}
input[type="text"],
input[type="password"],
select {
    padding: 0.5em;
    border: 1.5px solid #60a5fa;
    border-radius: 6px;
    font-size: 1em;
    width: 100%;
    margin-top: 0.2em;
}
.form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.7em;
    margin-top: 1.2em;
}
.dept-details {
    margin-top: 10px;
    padding: 15px;
    background-color: #f8fbff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(25, 118, 210, 0.07);
}
.dept-details p {
    margin: 5px 0;
    font-size: 15px;
    color: #333;
}
.error {
    color: #fff;
    background: #e53935;
    padding: 0.7em 1em;
    border-radius: 6px;
    margin-bottom: 1em;
    text-align: left;
}
</style>