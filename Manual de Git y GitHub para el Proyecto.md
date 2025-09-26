# Manual de Git y GitHub para el Proyecto

Este manual reúne los **comandos más útiles de Git y GitHub**, clasificados por funcionalidad, con explicaciones para facilitar su uso en el flujo de trabajo del proyecto.

---

## 1. Configuración de Git

Configura la información del usuario para todos los repositorios locales:

```bash
git config --global user.name "[name]"
Establece el nombre que estará asociado a tus commits.

bash
Copiar código
git config --global user.email "[email address]"
Establece el correo que estará asociado a tus commits.

bash
Copiar código
git config --global core.editor "code --wait"
Configura VSCode como editor por defecto para Git.

bash
Copiar código
git config --list
Muestra todas las configuraciones activas.

2. Crear repositorios
bash
Copiar código
git init [project-name]
Inicializa un nuevo repositorio local.

bash
Copiar código
git clone [url]
Clona un repositorio remoto existente con todo su historial.

3. Efectuar cambios
bash
Copiar código
git status
Muestra el estado de los archivos (nuevos, modificados, en staging).

bash
Copiar código
git diff
Muestra las diferencias en archivos no preparados para commit.

bash
Copiar código
git add [file]
Añade un archivo al área de staging.

bash
Copiar código
git add .
Añade todos los archivos modificados al área de staging.

bash
Copiar código
git diff --staged
Muestra las diferencias de los archivos en staging respecto al último commit.

bash
Copiar código
git reset [file]
Quita un archivo del área de staging, manteniendo los cambios.

bash
Copiar código
git commit -m "[mensaje descriptivo]"
Crea un commit con los cambios preparados.

bash
Copiar código
git commit -am "[mensaje]"
Añade y hace commit de todos los archivos modificados ya trackeados.

4. Gestión de ramas
bash
Copiar código
git branch
Lista todas las ramas.

bash
Copiar código
git branch [branch-name]
Crea una nueva rama.

bash
Copiar código
git switch -c [branch-name]
Crea y cambia a una nueva rama.

bash
Copiar código
git switch [branch-name]
Cambia a una rama existente.

bash
Copiar código
git merge [branch-name]
Combina la rama especificada con la actual.

bash
Copiar código
git branch -d [branch-name]
Elimina una rama.

5. Refactorización de archivos
bash
Copiar código
git rm [file]
Borra un archivo del directorio activo y lo marca para commit.

bash
Copiar código
git rm --cached [file]
Elimina un archivo del control de versiones pero lo mantiene localmente.

bash
Copiar código
git mv [file-original] [file-renamed]
Renombra un archivo y lo prepara para commit.

6. Ignorar archivos
Crea un archivo .gitignore con patrones para ignorar archivos:

pgsql
Copiar código
*.log
build/
temp-*
bash
Copiar código
git ls-files --others --ignored --exclude-standard
Lista todos los archivos ignorados en el proyecto.

7. Guardar fragmentos (Stash)
bash
Copiar código
git stash
Guarda temporalmente los cambios no confirmados.

bash
Copiar código
git stash pop
Restaura los cambios guardados y los elimina de la lista.

bash
Copiar código
git stash list
Muestra los cambios guardados.

bash
Copiar código
git stash drop
Elimina el stash más reciente.

8. Revisar historial
bash
Copiar código
git log
Muestra el historial de commits.

bash
Copiar código
git log --oneline --graph --decorate --all
Muestra historial en una vista compacta y visual.

bash
Copiar código
git log --follow [file]
Muestra historial de un archivo (incluyendo renombrados).

bash
Copiar código
git diff [branch1]...[branch2]
Muestra diferencias entre dos ramas.

bash
Copiar código
git show [commit]
Muestra los detalles de un commit.

9. Rehacer commits
bash
Copiar código
git reset [commit]
Revierte commits posteriores manteniendo los cambios localmente.

bash
Copiar código
git reset --hard [commit]
Revierte y elimina los cambios definitivamente.

bash
Copiar código
git revert [commit]
Crea un nuevo commit que deshace el commit especificado.

10. Sincronizar cambios con remoto
bash
Copiar código
git remote -v
Lista los repositorios remotos vinculados.

bash
Copiar código
git fetch [alias]
Descarga cambios del repositorio remoto sin fusionar.

bash
Copiar código
git merge [alias]/[branch]
Fusiona una rama remota con la local.

bash
Copiar código
git push [alias] [branch]
Sube commits locales a GitHub.

bash
Copiar código
git pull
Descarga y fusiona cambios del remoto.

11. Buenas prácticas de commits
Usar Conventional Commits:

feat: agregar CRUD de canciones

fix: corregir error en validación de ID

docs: actualizar guía de estilo

refactor: mejorar nombres de métodos en CancionesController

test: añadir tests para servicio de canciones

12. Trucos útiles
bash
Copiar código
git shortlog -sn
Lista los commits por autor.

bash
Copiar código
git tag [tag-name]
Crea una etiqueta (ej. versión).

bash
Copiar código
git checkout [commit-id]
Cambia a un commit específico en modo lectura.

bash
Copiar código
git reflog
Muestra el historial de cambios de referencias (para recuperar commits perdidos).
