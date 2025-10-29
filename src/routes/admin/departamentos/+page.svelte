<script lang="ts">
    import { onMount } from 'svelte';
    import { trpc } from '$lib/trpc/client';
    import type { Departamento } from '$lib/types/gen';
    import { fade, slide } from 'svelte/transition';
	import { browser } from '$app/environment';
	import { portal } from '$lib/portals';

    let departamentos: Departamento[] = $state([]);
    let showEditForm = $state(false);
    let error = $state('');
    let loading = $state(false);
    let form: Partial<Departamento> = $state({});
    let editingDeptid: number | null = $state(null);
    let selloPreview: string | null = $state(null);

    async function loadDepartamentos() {
        if (!browser) return;
        try {
            const result = await trpc.departamentos.getAll.query();
            departamentos = result;
        } catch (e: any) {
            console.error('Error fetching departamentos:', e);
            error = e.message || 'Error al cargar departamentos';
        }
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

    function openEditForm(event: Event, departamento: Departamento) {
        event.stopPropagation();
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

    async function handleSubmit(event: Event) {
        event.preventDefault();
        if (!browser) return;
        
        loading = true;
        error = '';
        try {
            if (!form.Deptid || !form.DeptName) {
                error = 'Completa todos los campos obligatorios';
                loading = false;
                return;
            }
            await trpc.departamentos.update.mutate(form as Departamento);
            await loadDepartamentos();
            closeForm();
        } catch (e: any) {
            console.error('Error updating departamento:', e);
            error = e.message || 'Error al actualizar departamento';
        }
        loading = false;
    }
</script>

<header class="admin-header">
    <nav class="breadcrumb">
        <a href="/" class="btn primary-btn breadcrumb-link">
            <span>← Volver a Inicio</span>
        </a>
    </nav>
    
    <div class="page-title">
        <h1>Administrar Departamentos</h1>
        <p class="page-subtitle">Gestión de departamentos y configuraciones</p>
    </div>
</header>

<main class="admin-content">
    <section class="departments-section">
        <div class="section-header">
            <div class="section-title">
                <h2>Departamentos</h2>
                <span class="dept-count">{departamentos.length} departamento{departamentos.length !== 1 ? 's' : ''}</span>
            </div>
            <button 
                onclick={(e) => openEditForm(e, { Deptid: 0, DeptName: '', SelloJefe: null, leyendaJefe: '' })} 
                class="btn primary-btn action-btn"
            >
                <span>+ Nuevo Departamento</span>
            </button>
        </div>

        {#if showEditForm}
            <div class="register-form-overlay" transition:fade use:portal>
                <div class="register-form">
                    <header class="form-header">
                        <h3>{editingDeptid ? 'Editar Departamento' : 'Nuevo Departamento'}</h3>
                        <button onclick={closeForm} class="close-button" aria-label="Cerrar">&times;</button>
                    </header>
                    
                    {#if error}
                        <div class="error" role="alert">{error}</div>
                    {/if}
                    
                    <form onsubmit={handleSubmit} class="dept-form">
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="deptName">
                                    Nombre del Departamento:
                                    <input 
                                        id="deptName"
                                        type="text" 
                                        bind:value={form.DeptName} 
                                        required 
                                        placeholder="Ej: Seguridad e Higiene"
                                    />
                                </label>
                            </div>

                            <div class="form-group">
                                <label for="leyendaJefe">
                                    Leyenda del Jefe:
                                    <input 
                                        id="leyendaJefe"
                                        type="text" 
                                        bind:value={form.leyendaJefe} 
                                        placeholder="Ej: Jefe de Departamento"
                                    />
                                </label>
                            </div>
                        </div>

                        <div class="form-group seal-section">
                            <label for="selloJefe">
                                Sello del Jefe:
                                <input 
                                    id="selloJefe"
                                    type="file" 
                                    accept="image/*" 
                                    onchange={handleFileChange}
                                    class="file-input"
                                />
                                <div class="file-input-help">
                                    Formatos aceptados: PNG, JPG, JPEG. Tamaño máximo: 2MB
                                </div>
                                {#if selloPreview}
                                    <div class="seal-preview">
                                        <img 
                                            src={"data:image/png;base64," + (form.SelloJefe ?? '')} 
                                            alt="Vista previa del sello" 
                                            class="seal-image"
                                        />
                                        <p class="preview-label">Vista previa del sello</p>
                                    </div>
                                {/if}
                            </label>
                        </div>

                        <div class="form-actions">
                            <button class="btn primary-btn" type="submit" disabled={loading} class:loading>
                                {editingDeptid ? 'Actualizar' : 'Crear'}
                            </button>
                            <button type="button" class="btn secondary-btn" onclick={closeForm}>
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        {/if}

        <div class="departments-container">
            {#if departamentos.length === 0}
                <div class="empty-state">
                    <p>No hay departamentos registrados</p>
                </div>
            {:else}
                <ul class="dept-list" role="list">
                    {#each departamentos as departamento (departamento.Deptid)}
                        <li class="dept-item" transition:slide>
                            <details class="dept-details-toggle">
                                <summary class="dept-summary">
                                    <div class="dept-info">
                                        <span class="dept-name">{departamento.DeptName}</span>
                                        <span class="dept-id">ID: {departamento.Deptid}</span>
                                    </div>
                                    <div class="dept-actions">
                                        <button 
                                            class="btn secondary-btn" 
                                            onclick={(e) => openEditForm(e, departamento)}
                                            aria-label="Editar departamento {departamento.DeptName}"
                                        >
                                            Editar
                                        </button>
                                    </div>
                                </summary>
                                <div class="dept-details">
                                    <div class="details-grid">
                                        <div class="detail-item">
                                            <strong>ID:</strong> 
                                            <span>{departamento.Deptid}</span>
                                        </div>
                                        <div class="detail-item">
                                            <strong>Nombre:</strong> 
                                            <span>{departamento.DeptName}</span>
                                        </div>
                                        <div class="detail-item full-width">
                                            <strong>Leyenda Jefe:</strong> 
                                            <span>{departamento.leyendaJefe || 'No especificada'}</span>
                                        </div>
                                        {#if departamento.SelloJefe}
                                            <div class="detail-item full-width">
                                                <strong>Sello del Jefe:</strong>
                                                <div class="seal-display">
                                                    <img 
                                                        src={"data:image/png;base64," + departamento.SelloJefe} 
                                                        alt="Sello del jefe de {departamento.DeptName}" 
                                                        class="seal-image"
                                                    />
                                                </div>
                                            </div>
                                        {/if}
                                    </div>
                                </div>
                            </details>
                        </li>
                    {/each}
                </ul>
            {/if}
        </div>
    </section>
</main>

<style>

.register-form-overlay {
    position: absolute;

}

/* ===== ADMIN HEADER ===== */
.admin-header {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding: 1.5rem 0;
    margin-bottom: 2rem;
}

.breadcrumb {
    max-width: 900px;
    margin: 0 auto;
    padding: 0 1rem;
    margin-bottom: 1rem;
}

.breadcrumb-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
}

.page-title {
    max-width: 900px;
    margin: 0 auto;
    padding: 0 1rem;
    text-align: center;
}

.page-title h1 {
    color: #ffffff;
    margin: 0 0 0.5rem 0;
    font-size: 2rem;
}

.page-subtitle {
    color: rgba(255, 255, 255, 0.8);
    margin: 0;
    font-size: 1rem;
}

/* ===== MAIN CONTENT ===== */
.admin-content {
    max-width: 900px;
    margin: 0 auto;
    padding: 0 1rem;
}

.departments-section {
    background: rgba(255, 255, 255, 0.03);
    border-radius: 16px;
    padding: 2rem;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    flex-wrap: wrap;
    gap: 1rem;
}

.section-title {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.section-title h2 {
    color: #ffffff;
    margin: 0;
    font-size: 1.5rem;
}

.dept-count {
    background: rgba(25, 118, 210, 0.2);
    color: #ffffff;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
}

.action-btn {
    white-space: nowrap;
}

/* ===== FORM IMPROVEMENTS ===== */
.form-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(25, 118, 210, 0.1);
}

.form-header h3 {
    margin: 0;
    color: #1976d2;
    font-size: 1.3em;
}

.dept-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

.form-group {
    display: flex;
    flex-direction: column;
}

.seal-section {
    grid-column: 1 / -1;
}

.file-input {
    margin-bottom: 0.5rem;
}

.file-input-help {
    font-size: 0.85rem;
    color: #666;
    font-style: italic;
    margin-bottom: 1rem;
}

.seal-preview {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem;
    background: rgba(25, 118, 210, 0.05);
    border-radius: 8px;
    border: 2px dashed rgba(25, 118, 210, 0.2);
}

.seal-image {
    max-width: 150px;
    max-height: 150px;
    object-fit: contain;
    border-radius: 8px;
    border: 2px solid #e3f2fd;
    background: white;
    padding: 0.5rem;
}

.preview-label {
    margin: 0;
    font-size: 0.9rem;
    color: #1976d2;
    font-weight: 600;
}

/* ===== DEPARTMENT LIST IMPROVEMENTS ===== */
.departments-container {
    position: relative;
    min-height: 200px;
}

.empty-state {
    text-align: center;
    padding: 3rem 2rem;
    color: rgba(255, 255, 255, 0.6);
    font-style: italic;
}

.dept-details-toggle {
    width: 100%;
}

.dept-summary {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    padding: 1rem;
    border-radius: 8px;
    transition: all 0.3s ease;
    list-style: none;
}

.dept-summary:hover {
    background: rgba(25, 118, 210, 0.05);
}

.dept-info {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex: 1;
}

.dept-name {
    font-weight: 600;
    color: #1976d2;
    font-size: 1.1rem;
}

.dept-id {
    background: rgba(25, 118, 210, 0.1);
    color: #1976d2;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
}

.dept-actions {
    display: flex;
    gap: 0.5rem;
    align-items: center;
}

.details-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    padding: 1rem;
}

.detail-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.detail-item.full-width {
    grid-column: 1 / -1;
}

.detail-item strong {
    color: #1976d2;
    font-size: 0.9rem;
    font-weight: 600;
}

.detail-item span {
    color: #333;
    font-size: 0.95rem;
}

.seal-display {
    display: flex;
    justify-content: center;
    padding: 1rem;
    background: rgba(25, 118, 210, 0.05);
    border-radius: 8px;
    margin-top: 0.5rem;
}

/* ===== ACCESSIBILITY IMPROVEMENTS ===== */
.dept-summary:focus {
    outline: 2px solid #1976d2;
    outline-offset: 2px;
}

.dept-summary::marker {
    color: #1976d2;
}

.file-input:focus {
    outline: 2px solid #1976d2;
    outline-offset: 2px;
}
</style>