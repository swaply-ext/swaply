# Proyecto Fullstack para Inetum 

# Guía de Estilo de Programación - Proyecto Swaply

Este documento define las convenciones y buenas prácticas que debemos seguir al programar en la aplicación **Swaply** para mantener un código limpio, consistente y fácil de mantener.

---

## 1. Stack Tecnológico
- **Lenguaje:** Java 17, Typescript, HTML, CSS  
- **Frameworks principales:** Spring Boot y Angular 19 
- **Módulos usados:**  
- **Arquitectura:** MVC (Modelo - Vista - Controlador)  

---

## 2. Estructura de Paquetes
La estructura de paquetes debe seguir la convención de capas de Spring Boot:

```
src/main/java/com/example/demo/
 ├── controller/   # Controladores (manejo de peticiones HTTP)
 ├── model/        # Entidades de la base de datos
 ├── repository/   # Interfaces JPA (acceso a datos)
 ├── service/      # Lógica de negocio
 └── DemoApplication.java   # Clase principal
```
---

## 3. Estándares de Código 
- **Nombres:**
  - Clases → `PascalCase` (ej. `CancionesController`)  
  - Métodos → `camelCase` (ej. `listarCancion()`)  
  - Variables → `camelCase` (ej. `cancionService`)  
  - Constantes → `MAYUSCULAS_CON_GUIONES` (ej. `MAX_INTENTOS`) 
  - Componentes de Angular → `minusculas-con-guiones` (ej. `login-form`)  
- **Comentarios:** solo para explicar lógica compleja.  

Correcto:
```java
@GetMapping("/nuevo")
public String mostrarFormularioNuevaCancion(Model model) {
    model.addAttribute("cancion", new Cancion());
    return "cancion-form";
}
```

Incorrecto:
```java
@GetMapping("/nuevo") public String mostrarFormularioNuevaCancion(Model model){model.addAttribute("cancion", new Cancion()); return "cancion-form";}
```

---

## 4. Git: Ramas y Commits
- **Ramas:**
  - `main` → versión estable  
  - `develop` → integración de features  
  - `feature/*` → nuevas funcionalidades  
  - `bugfix/*` → correcciones  
  - `hotfix/*` → arreglos urgentes en producción  

---

## 5. Testing
- **Framework:**  
- **Carpeta de tests:** `src/test/java/...`  
- **Cobertura mínima:** 
- **Buenas prácticas:**
  - Cada clase debe tener su clase de test asociada.  
  - Métodos de test deben describir qué se prueba:  
    ```java
    @Test
    void deberiaGuardarCancionCorrectamente() { ... }
    ```

---

## 6. Documentación
- **README.md** con reglas generales del proyecto.    

---

## 7. Automatización y Git
- **Restricción de ramas:** Develop y Main están protegidas de commits directos.  
- **Revisión de código:** todos los Pull Requests deben ser revisados por dos personas antes de mergear.  

---

## 8. Buenas Prácticas 

