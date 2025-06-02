import { tick } from "svelte";

const portal_map = new Map();
/**
 * Crea un portal y lo registra en un mapa global utilizando una clave única.
 *
 * @param node - El nodo que se asociará al portal.
 * @param id - Identificador único para el portal. Por defecto es "default".
 * @returns Un objeto con un método `destroy` que elimina el portal del mapa global.
 * @throws Si ya existe un portal con la misma clave, lanza un error indicando que esta duplicado.
 */
export function createPortal(node: any, id = "default") {
	const key = `$$portal.${id}`;
	if (portal_map.has(key)) throw `duplicate portal key "${id}"`;
	else portal_map.set(key, node);
	return { destroy: portal_map.delete.bind(portal_map, key) };
}
function mount(node: any, key: string) {
	if (!portal_map.has(key)) throw `unknown portal ${key}`;
	const host = portal_map.get(key);
	host.insertBefore(node, null);
	return ()=>host.contains(node) && host.removeChild(node);
}
export function portal(node: any, id = "default") {
	let destroy: () => any;
	const key = `$$portal.${id}`;
	if (!portal_map.has(key))
		tick().then(() => {
			destroy = mount(node, key);
		});
	else destroy = mount(node, key);
	return { destroy: () => destroy?.() };
}
