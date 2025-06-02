import { isLoading, setLoading, setMarcadas } from "../stores/global";
import { notify } from "../components/Notification/notifications";
import { API_MARCADAS } from "./api";

export async function fetchMarcadasDelDia(departamento: string, fecha: string) {
    setLoading(true);
    const params = new URLSearchParams({ departamento, fecha, funcion: 'delDia' });
    const res = await fetch(`${API_MARCADAS}?${params.toString()}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    });

    const data = await res.json();

    if (!res.ok) {
        setLoading(false);
        throw new Error(data.error || 'Error fetching marcadas del día');
    }
    setLoading(false);
    setMarcadas(data);
    return data;
}

export async function fetchMarcadasEstandar(departamento: string, fecha: string) {
    setLoading(true);
    const params = new URLSearchParams({ departamento, fecha, funcion: 'estandar' });
    const res = await fetch(`${API_MARCADAS}?${params.toString()}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    });

    const data = await res.json();

    if (!res.ok) {
        setLoading(false);
        throw new Error(data.error || 'Error fetching marcadas estandar');
    }
    setLoading(false);
    setMarcadas(data);
    return data;
}

export async function fetchMarcadas(departamento: string, fecha: string, funcion: string) {
    setLoading(true);
    const params = new URLSearchParams({ departamento, fecha, funcion });
    const res = await fetch(`${API_MARCADAS}?${params.toString()}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    });

    const data = await res.json();

    if (!res.ok) {
        setLoading(false);
        throw new Error(data.error || 'Error fetching marcadas');
    }
    setLoading(false);
    setMarcadas(data);
    return data;
}