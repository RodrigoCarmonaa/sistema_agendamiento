from flask import Flask, render_template, request, flash, redirect, url_for

app = Flask(__name__)
# La clave secreta es un requisito de seguridad de Flask para poder usar flash()
app.secret_key = 'clave_secreta_estrictamente_necesaria' 

# "Base de datos" en memoria
# Advertencia: Una estructura volátil. Los datos se destruyen al detener el script.
citas = []

@app.route('/')
def index():
    # Inyecta la estructura de datos actual en el archivo index.html
    return render_template('index.html', citas=citas)

@app.route('/agendar', methods=['POST'])
def agendar():
    # 1. Extracción de la carga útil del formulario
    nombre      = request.form.get('nombre', '').strip()
    descripcion = request.form.get('descripcion', '').strip()
    tipo        = request.form.get('tipo', 'otro')
    fecha       = request.form.get('fecha')
    hora        = request.form.get('hora')
    notas       = request.form.get('notas', '').strip()

    # 2. Validación de reglas de negocio: Detección de colisiones
    for cita in citas:
        if cita['fecha'] == fecha and cita['hora'] == hora:
            # Choque detectado. Se bloquea la inserción y se notifica.
            flash(f"Error: El horario del {fecha} a las {hora} ya está ocupado.", "error")
            return redirect(url_for('index'))

    # 3. Escritura de datos (Ruta de éxito)
    nueva_cita = {
        "nombre":      nombre,
        "descripcion": descripcion,
        "tipo":        tipo,
        "fecha":       fecha,
        "hora":        hora,
        "notas":       notas
    }
    # Ordenar la lista cronológicamente sería ideal, pero por ahora solo anexamos
    citas.append(nueva_cita)
    
    # Notificación de éxito — ordenar la lista cronológicamente
    citas.sort(key=lambda c: (c['fecha'], c['hora']))
    flash(f"Cita de {nombre} registrada correctamente.", "success")
    return redirect(url_for('index'))


@app.route('/eliminar/<int:index>', methods=['POST'])
def eliminar(index):
    """Elimina una cita por su posición en la lista."""
    if 0 <= index < len(citas):
        eliminada = citas.pop(index)
        flash(f"Cita de {eliminada['nombre']} eliminada.", "success")
    else:
        flash("No se encontró la cita a eliminar.", "error")
    return redirect(url_for('index'))

if __name__ == '__main__':
    # debug=True expone errores directamente en el navegador y reinicia el servidor al detectar cambios.
    app.run(debug=True)