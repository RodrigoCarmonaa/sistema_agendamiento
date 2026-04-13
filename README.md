# Sistema de Agendamiento Empresarial

## Descripción
Aplicación web minimalista diseñada para la gestión eficiente de citas en pequeñas empresas. Resuelve el problema operativo de la superposición de horarios (overbooking) mediante un motor de validación algorítmica en el servidor. El desarrollo prioriza la simplicidad y la alta funcionalidad, prescindiendo deliberadamente de arquitecturas monolíticas o sobreingeniería, cumpliendo estrictamente con el principio de entregar soluciones ágiles y funcionales.

## Características Principales
* **Registro Dinámico:** Ingreso de citas especificando fecha, hora y descripción del servicio.
* **Validación Algorítmica de Colisiones:** Intercepción y bloqueo automático de registros duplicados en un mismo bloque temporal para proteger la integridad de la agenda.
* **Visualización Centralizada:** Despliegue en tiempo real del estado de ocupación del calendario.

## Tecnologías Utilizadas
* **Backend:** Python 3, Flask (Micro-framework).
* **Frontend:** HTML5, CSS3, Jinja2 (Motor de plantillas para renderizado dinámico).

## Estructura del Proyecto
```text
sistema_agendamiento/
│
├── app.py               # Lógica central del servidor, enrutamiento y validaciones
└── templates/
    └── index.html       # Interfaz de usuario, formulario y motor de alertas
