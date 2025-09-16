<script lang="ts">
	/** Stores*/
	import { globalStore } from '$lib/stores/global';
	import { onMount } from 'svelte';

	/** Props */
	let { fecha = $bindable() }: { fecha: string } = $props();

	/** Variables */
	let hoy = fecha || new Date().toISOString().split('T')[0];
	let isLoading = $state(false);

	globalStore.subscribe((state) => {
		isLoading = state.loading;
	});
	
	/** Funciones */
	function handleDateChange(e: any) {
		console.log('DatePicker fecha definida:', e.target.value);
	}
	function setDateAyer() {
		const hoy = new Date(fecha);

		hoy.setDate(hoy.getDate() - 1);
		fecha = hoy.toISOString().split('T')[0];
		handleDateChange({ target: { value: fecha } });
		console.log('Fecha de ayer:', fecha);
	}
	function setDateMañana() {
		const hoy = new Date(fecha);

		hoy.setDate(hoy.getDate() + 1);
		fecha = hoy.toISOString().split('T')[0];
		handleDateChange({ target: { value: fecha } });
		console.log('Fecha de mañana:', fecha);
	}

</script>

<div class="selector-fecha" data-loading={isLoading}>
	<button class="boton-anterior" onclick={setDateAyer} disabled={isLoading} aria-label="Día anterior">
		<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
		</svg>
	</button>
	<div class="input-container">
		<input
			class="date-input"
			type="date"
			bind:value={fecha}
			onchange={handleDateChange}
		/>
		<div class="input-overlay">
			<svg class="calendar-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
				<line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2"/>
				<line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2"/>
				<line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2"/>
			</svg>
		</div>
	</div>
	<button class="boton-siguiente" onclick={setDateMañana} disabled={isLoading || fecha === hoy} aria-label="Día siguiente">
		<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
		</svg>
	</button>
</div>

<style>
	.selector-fecha {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.5rem;
		background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
		border-radius: 16px;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
		border: 1px solid rgba(226, 232, 240, 0.8);
		max-width: fit-content;
		margin: 0 auto;
	}

	.boton-anterior,
	.boton-siguiente {
		background: linear-gradient(135deg, #18c5a0 0%, #16a085 100%);
		color: white;
		border: none;
		padding: 0.75rem;
		border-radius: 12px;
		cursor: pointer;
		font-size: 16px;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 0 2px 4px rgba(24, 197, 160, 0.2);
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 44px;
		min-height: 44px;
		position: relative;
		overflow: hidden;
	}

	.boton-anterior::before,
	.boton-siguiente::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
		transition: left 0.5s;
	}

	.boton-anterior:hover::before,
	.boton-siguiente:hover::before {
		left: 100%;
	}

	.boton-anterior:hover,
	.boton-siguiente:hover {
		background: linear-gradient(135deg, #137a58 0%, #0f5d47 100%);
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(24, 197, 160, 0.3);
	}

	.boton-anterior:active,
	.boton-siguiente:active {
		transform: translateY(0);
		box-shadow: 0 2px 4px rgba(24, 197, 160, 0.2);
	}

	.boton-siguiente:disabled,
	.boton-anterior:disabled {
		background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
		cursor: not-allowed;
		transform: none;
		box-shadow: none;
		color: #94a3b8;
	}

	.boton-siguiente:disabled:hover,
	.boton-anterior:disabled:hover {
		background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
		transform: none;
		box-shadow: none;
	}

	.boton-siguiente:disabled::before,
	.boton-anterior:disabled::before {
		display: none;
	}

	.input-container {
		position: relative;
		display: flex;
		align-items: center;
	}

	.date-input {
		font-size: 16px;
		padding: 0.75rem 3rem 0.75rem 1rem;
		border-radius: 12px;
		border: 2px solid #e2e8f0;
		background: rgba(255, 255, 255, 0.9);
		backdrop-filter: blur(10px);
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		font-weight: 500;
		color: #374151;
		min-width: 180px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.date-input:focus {
		outline: none;
		border-color: #18c5a0;
		box-shadow: 0 0 0 4px rgba(24, 197, 160, 0.1), 0 4px 6px -1px rgba(0, 0, 0, 0.1);
		background: rgba(255, 255, 255, 1);
	}

	.date-input:hover {
		border-color: #94a3b8;
		background: rgba(255, 255, 255, 1);
	}

	.input-overlay {
		position: absolute;
		right: 0.75rem;
		pointer-events: none;
		color: #64748b;
		transition: color 0.3s ease;
	}

	.date-input:focus + .input-overlay .calendar-icon {
		color: #18c5a0;
	}

	.calendar-icon {
		transition: all 0.3s ease;
	}

	/* Animación suave para el loading */
	.selector-fecha[data-loading="true"] {
		opacity: 0.7;
		pointer-events: none;
	}

	/* Efectos adicionales para mejorar la experiencia */
	@media (prefers-reduced-motion: no-preference) {
		.selector-fecha {
			animation: slideIn 0.5s cubic-bezier(0.4, 0, 0.2, 1);
		}
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Responsive design */
	@media (max-width: 640px) {
		.selector-fecha {
			padding: 0.75rem;
			gap: 0.375rem;
		}
		
		.date-input {
			min-width: 140px;
			font-size: 14px;
		}
		
		.boton-anterior,
		.boton-siguiente {
			min-width: 40px;
			min-height: 40px;
			padding: 0.625rem;
		}
	}
</style>
