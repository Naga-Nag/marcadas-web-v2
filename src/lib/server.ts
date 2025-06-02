import { existsSync, writeFileSync} from "fs";
import readline from "readline";

// Archivo de aceptación
const ACCEPTANCE_FILE = "./.licencia_aceptada";

function askLicenseConfirmation() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log(`
==================================================
          LICENCIA DE USO REVOCABLE
==================================================

Este software está licenciado bajo los términos de
el archivo:

  LICENSE

Su uso implica la aceptación expresa de dicha licencia.

¿Acepta los términos de la licencia? (si/no)
`);

    rl.question("> ", (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

export async function iniciarServidor(): Promise<boolean> {
  if (!existsSync(ACCEPTANCE_FILE)) {
    const respuesta = await askLicenseConfirmation();

    if (respuesta !== "si") {
      console.log("Ejecución cancelada. No se aceptaron los términos.");
      process.exit(1);
    }

    writeFileSync(ACCEPTANCE_FILE, "licencia aceptada "+Date.now());
    return true; 
  }
  return true;
}