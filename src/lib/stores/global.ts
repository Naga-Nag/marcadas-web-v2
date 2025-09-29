import type { Marcada, Departamento } from '$lib/types/gen';
import { writable, derived} from 'svelte/store';

export const globalStore = writable({
     loading: false,
     fechaMarcada: '',
     searchText: '',
     marcadas: [] as Marcada[],
     departamentos: [] as Departamento[],
     selectedDepartamento: null as Departamento | null
});

export const ausentes = derived(globalStore, ($store) => {
     let marcadas = $store.marcadas;
     return marcadas.filter(m => m.Entrada === '' && m.Salida === '');

});

export const filteredMarcadas = derived(globalStore, ($store) => {
     const search = $store.searchText.trim().toLowerCase();
     let marcadas = $store.marcadas;

     if (!search) return marcadas; // If empty, return filtered `marcadas` based on `ocultarBajas`

     return marcadas.filter(m =>
          m.Personal.Nombre.toLowerCase().includes(search) ||
          m.Personal.Departamento.toLowerCase().includes(search) ||
          (m.Personal.CUIL ?? '').includes(search) ||
          m.Personal.MR.toString().includes(search)
     );
});

export function setSearchText(text: string) {
     globalStore.update(store => {
          store.searchText = text;
          return store;
     });
}

export function setDepartamentos(departamentos: Departamento[]) {
     globalStore.update((state) => ({ ...state, departamentos: departamentos }));
}

export function setSelectedDepartamento(departamento: Departamento | null) {
     globalStore.update((state) => ({ ...state, selectedDepartamento: departamento }));
}

export function getSelectedDepartamento() {
     let selected: Departamento | null = null;
     globalStore.subscribe(state => selected = state.selectedDepartamento)();
     return selected;
}

export function clearSelectedDepartamento() {
     globalStore.update((state) => ({ ...state, selectedDepartamento: null }));
}

export function setLoading(loading: boolean) {
     globalStore.update((state) => ({ ...state, loading: loading }));
}
export const isLoading = () => {
     let loading: boolean = false;
     globalStore.subscribe(state => loading = state.loading)();
     return loading;
}

export function setMarcadas(marcadas: Marcada[]) {
     globalStore.update((state) => ({ ...state, marcadas: marcadas }));
}

//No es tiempo real
export function getMarcadas() {
     let marcadas: Marcada[] = [];
     globalStore.subscribe(state => marcadas = state.marcadas)();
     return marcadas;
}

export function clearMarcadas() {
     console.log('globalStore :: clearMarcadas');
     globalStore.update((state) => ({ ...state, marcadas: [] }));
}

export function clearSearchText() {
     globalStore.update((state) => ({ ...state, searchText: '' }));
}

export function setFechaMarcada(fecha: string) {
     globalStore.update((state) => ({ ...state, fechaMarcada: fecha }));
}

globalStore.subscribe(value => console.log('globalStore data :: =>', value));
