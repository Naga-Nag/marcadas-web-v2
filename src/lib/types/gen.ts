export type Marcada = {
    LID: number;
    Personal: Personal;
    Marcada: string | null;
    Entrada: string | null;
    Salida: string | null;
    Estado: string | null;
};

export type Personal = {
    UID: number;
    MR: number;
    Nombre: string;
    Departamento: string;
    CUIL: string;
    Jornada: string;
    Activo: string;
    Foto: string;
};

export type Usuario = {
    id: number;
    username: string;
    password: string;
    role: string;
    departamento: string;
    departamentosPermitidos: string[];
}

export type shortUsuario = {
    ipaddr: string | null;
    username: string;
    role: string | null;
    departamento: string | null;
    departamentosPermitidos: string[] | null;
}

export type Notification = {
    id?: number;
    title: string;
    message: string;
    duration: number;
    type: string;
};
