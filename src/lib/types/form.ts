export interface loginFormData {
     username: FormDataEntryValue,
     password: FormDataEntryValue,
     role: FormDataEntryValue,
     [key:string]: any
 }

export interface loginFormResponse extends Omit<loginFormData, 'password'> {
     error:boolean,
     message: string,
}

export interface registerFormData {
     username: FormDataEntryValue,
     password: FormDataEntryValue,
     role: FormDataEntryValue,
     departamento: FormDataEntryValue,
     [key:string]: any
}

export interface registerFormResponse extends Omit<registerFormData, 'password'> {
     error:boolean,
     message: string,
}