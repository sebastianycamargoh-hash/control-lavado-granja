const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Configuración de Supabase con tus credenciales
const SUPABASE_URL = 'https://knebgmufezuxoipbqhcx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtuZWJnbXVmZXp1eG9pcGJxaGN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAyOTQ5ODUsImV4cCI6MjEwNTg3MDk4NX0.YBWrg1333z-Yyb2M4uIkQNTsBYO317lK2jkHeIQjkXk';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para la página principal (El Formulario)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta para la página de registros (La Tabla)
app.get('/records', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'records.html'));
});

// Ruta para recibir el formulario y guardarlo en Supabase
app.post('/save-record', async (req, res) => {
    const { fecha_hora, farm_name, cantidad_lavar, sucio, roto, recuperado } = req.body;

    const totalSuma = parseInt(sucio) + parseInt(roto) + parseInt(recuperado);
    if (totalSuma !== parseInt(cantidad_lavar)) {
        return res.status(400).send(`
            <div style="font-family: Arial; text-align: center; margin-top: 50px;">
                <h2 style="color: #dc3545;">¡Error en las cantidades!</h2>
                <p>La suma de Sucio + Roto + Recuperado debe ser igual a la cantidad a lavar.</p>
                <a href="/" style="display: inline-block; background: #6c757d; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-size: 18px; margin-top: 20px;">Volver e intentar de nuevo</a>
            </div>
        `);
    }

    const { error } = await supabase
        .from('records')
        .insert([{ 
            fecha_hora, 
            farm_name, 
            cantidad_lavar: parseInt(cantidad_lavar), 
            sucio: parseInt(sucio), 
            roto: parseInt(roto), 
            recuperado: parseInt(recuperado) 
        }]);

    if (error) {
        console.error('Error al guardar en Supabase:', error.message);
        return res.status(500).send('Error al guardar en la base de datos en la nube');
    }
        
    res.send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Guardado Exitoso</title>
            <style>
                body { font-family: Arial, sans-serif; background: #f4f4f9; text-align: center; padding: 40px 20px; }
                .card { background: white; max-width: 400px; margin: 0 auto; padding: 30px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
                h2 { color: #28a745; margin-bottom: 10px; }
                p { color: #555; margin-bottom: 30px; }
                .btn-grande { display: block; background: #28a745; color: white; padding: 16px; text-decoration: none; border-radius: 8px; font-size: 18px; font-weight: bold; box-shadow: 0 4px 6px rgba(40,167,69,0.3); margin-bottom: 10px; }
                .btn-grande:hover { background: #218838; }
                .btn-secundario { display: block; background: #17a2b8; color: white; padding: 12px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; }
                .btn-secundario:hover { background: #138496; }
            </style>
        </head>
        <body>
            <div class="card">
                <h2>¡Registro Exitoso!</h2>
                <p>Los datos se han guardado directamente en la nube.</p>
                <a href="/" class="btn-grande">➕ Hacer Otro Registro</a>
                <a href="/records" class="btn-secundario">📋 Ver Todos los Registros</a>
            </div>
        </body>
        </html>
    `);
});

// Ruta para obtener todos los registros desde Supabase
app.get('/api/records', async (req, res) => {
    const { data, error } = await supabase
        .from('records')
        .select('*')
        .order('id', { ascending: false });

    if (error) {
        console.error('Error al consultar Supabase:', error.message);
        return res.status(500).json({ error: 'Error al obtener registros' });
    }
    res.json(data);
});

// Ruta para eliminar un registro por su ID en Supabase
app.get('/delete-record/:id', async (req, res) => {
    const id = req.params.id;
    const { error } = await supabase
        .from('records')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error al eliminar en Supabase:', error.message);
        return res.status(500).send('Error al eliminar el registro');
    }
    res.redirect('/records');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
