import { notify } from "../components/Notification/notifications";
import { API_DEPARTAMENTOS } from "./api";

export async function fetchDepartamentos() {
    const res = await fetch(`${API_DEPARTAMENTOS}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || 'Error fetching departamentos');
    }
    return data;
}
