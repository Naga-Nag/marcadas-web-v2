// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { shortUsuario} from "$lib/types/gen";

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			usuario: shortUsuario;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}
export {};
