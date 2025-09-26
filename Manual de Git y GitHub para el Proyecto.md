Manual de Git y GitHub para el Proyecto
1. Git y GitHub

Git: sistema de control de versiones para gestionar el código.

GitHub: plataforma en la nube para colaborar con repositorios Git.

Flujo en este proyecto:

main: rama estable (producción).

development: rama de integración.

Cada funcionalidad → nueva rama → PR hacia development.

1.1 Flujo de trabajo recomendado

Clonar repositorio → git clone <url>

Cambiar a development → git checkout development

Crear rama → git checkout -b feature/nueva-funcionalidad

Trabajar, añadir y hacer commit → git add . && git commit -m "feat: ..."

Subir rama → git push origin feature/nueva-funcionalidad

Crear PR hacia development.

Una vez validado, responsable hace merge de development → main.

2. Comandos de Git Clasificados
2.1 Configuración
git config --global user.name "Nombre"
git config --global user.email "correo@example.com"


Configura tu nombre y correo en todos los repositorios.

2.2. Repositorios
git init [nombre]


Inicializa un nuevo repositorio local.

git clone [url]


Clona un repositorio remoto.

2.3. Cambios y commits
git status


Muestra archivos modificados/no rastreados.

git diff


Muestra diferencias en archivos modificados.

git add [archivo]
git add .


Agrega archivos al área de preparación.

git commit -m "mensaje"


Registra cambios.

git reset [archivo]


Saca el archivo del área de preparación.

git commit --amend


Modifica el último commit (útil para corregir mensaje o añadir archivos).

2.4. Ramas
git branch
git branch [nombre]


Lista y crea ramas.

git switch -c [nombre]


Crea y cambia a nueva rama.

git merge [rama]


Fusiona una rama en la actual.

git branch -d [rama]


Elimina una rama.

git checkout [commit]


Cambia el directorio de trabajo a un commit específico (modo “detached”).

2.5. Archivos
git rm [archivo]


Elimina archivo del proyecto y lo marca para commit.

git rm --cached [archivo]


Deja de rastrear un archivo, pero lo mantiene localmente.

git mv [origen] [destino]


Renombra o mueve archivos.

2.6. Ignorar archivos

Crear .gitignore con patrones:

*.log
build/
temp-*

git ls-files --others --ignored --exclude-standard


Lista archivos ignorados.

2.7. Stash (guardar temporalmente)
git stash


Guarda cambios sin hacer commit.

git stash list


Lista cambios guardados.

git stash pop


Recupera últimos cambios guardados.

git stash drop


Elimina stash reciente.

2.8. Historial
git log


Muestra historial de commits.

git log --oneline --graph --all


Historial compacto en forma de gráfico.

git show [commit]


Muestra detalles de un commit.

git diff [rama1]...[rama2]


Diferencias entre ramas.

2.9. Rehacer commits
git reset [commit]


Vuelve al commit, conservando cambios locales.

git reset --hard [commit]


Vuelve al commit y descarta cambios.

git revert [commit]


Crea un commit que deshace otro commit específico (recomendado en proyectos colaborativos).

2.10. Sincronización
git fetch


Descarga cambios remotos sin integrarlos.

git pull


Descarga e integra cambios remotos.

git push origin [rama]


Sube commits de la rama al remoto.

git remote -v


Muestra las URLs de los remotos configurados.

2.11. Comandos útiles extra
git blame [archivo]


Muestra quién cambió cada línea de un archivo.

git tag [nombre]


Crea una etiqueta (útil para versiones: v1.0.0).

git cherry-pick [commit]


Aplica un commit específico de otra rama.

git reflog


Muestra todo el historial de movimientos (incluso commits “perdidos”).

3. Resumen visual del flujo de trabajo

git clone → Clonar repo.

git checkout development → Cambiar a rama de desarrollo.

git checkout -b feature/nueva → Crear rama para tu tarea.

git add . && git commit -m "feat: ..." → Guardar cambios.

git push origin feature/nueva → Subir al remoto.

Crear PR → development.

Responsable → PR de development → main.
