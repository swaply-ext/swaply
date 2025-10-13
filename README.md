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

Ejemplo de controlador:
```java
package com.example.demo.controller;
```

---

## 3. Estándares de Código 
- **Nombres:**
  - Clases → `PascalCase` (ej. `CancionesController`)  
  - Métodos → `camelCase` (ej. `listarCancion()`)  
  - Variables → `camelCase` (ej. `cancionService`)  
  - Constantes → `MAYUSCULAS_CON_GUIONES` (ej. `MAX_INTENTOS`) 
  - Componentes de Angular → `minusculas-con-guiones` (ej. `login-form`) 
- **Anotaciones:** deben ir en líneas separadas sobre el método o clase.  
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
- **Framework:** JUnit 5 + Mockito  
- **Carpeta de tests:** `src/test/java/...`  
- **Cobertura mínima:** 80%  
- **Buenas prácticas:**
  - Cada clase debe tener su clase de test asociada.  
  - Métodos de test deben describir qué se prueba:  
    ```java
    @Test
    void deberiaGuardarCancionCorrectamente() { ... }
    ```

---

## 6. Documentación
- **README.md** con pasos para ejecutar el proyecto.  
- **Javadoc** obligatorio en clases y métodos públicos.  
Ejemplo:
```java
/**
 * Controlador para gestionar canciones.
 * Permite listar, crear, editar y eliminar canciones.
 */
@Controller
@RequestMapping("/canciones")
public class CancionesController {
```

---

## 7. Automatización y CI/CD
- **Linting:** Checkstyle configurado.  
- **Integración continua:** GitHub Actions / GitLab CI con compilación y tests automáticos.  
- **Revisión de código:** todos los Pull Requests deben ser revisados antes de mergear.  

---

## 8. Buenas Prácticas
- Dividir lógica entre capas (no poner lógica de negocio en controladores).  
- Variables sensibles en `application.properties` deben ir en `.env` o variables de entorno.  

