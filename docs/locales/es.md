# Primeros pasos con just-vibe

just-vibe ofrece flujos de trabajo y herramientas para agentes de programación. Instala Node.js 22 o una versión posterior. Desde tu proyecto, elige el agente:

```sh
npx just-vibe@latest setup --target codex
npx just-vibe@latest setup --target claude
```

Para instalar un adaptador opcional de habilidades en el proyecto:

```sh
npx just-vibe@latest setup --target cursor --root . --profile core
```

Describe el resultado que necesitas e incluye las restricciones. Se conserva el contexto añadido. Las sugerencias automáticas de flujos de trabajo reconocen descripciones de tareas en inglés; si escribes en otro idioma, elige directamente el flujo `auto` o un flujo de trabajo concreto. La instalación no autentica servicios externos, no concede permisos ni inicia agentes de trabajo. Comprueba las herramientas disponibles en tu agente cuando la tarea necesite un servicio.

Usa `npx just-vibe@latest doctor --target codex` para revisar la instalación y `npx just-vibe@latest update --target codex` para actualizarla. Una función del código fuente marcada Unreleased no está disponible en el registro hasta una publicación posterior.

Consulta las instrucciones completas en inglés sobre [instalación](../../README.md) y [operaciones](../../plugins/just-vibe/references/runtime-expansion.md). Esta traducción solo cubre la página de primeros pasos; no traduce todo el catálogo.
