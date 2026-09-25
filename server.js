const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware para leer datos en formato JSON y formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos de la carpeta public
app.use(express.static(path.join(__dirname, 'public')));

// Configuración directa de Supabase con tus credenciales
const supabaseUrl = 'https://knebgbmufezuxoipbqhcx.supabase.co';
const supabaseKey = 'sb_publishable_0y3j01fOyL1ttovNGVh22g_SJsIym8u';
const supabase = createClient(supabaseUrl, supabaseKey);

// ==========================================
// RUTAS DE LA API
// ==========================================

// 1. Ruta para OBTENER todos los registros (SELECT)
app.get('/api/records', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('records')
      .select('*')
      .order('id', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error al obtener registros:', err.message);
    res.status(500).json({ error: 'No se pudieron cargar los registros' });
  }
});

// 2. Ruta para GUARDAR un nuevo registro (INSERT)
app.post('/api/records', async (req, res) => {
  try {
    const { fecha_hora, farm_name, cantidad_lavar, sucio, roto, recuperado } = req.body;

    const { data, error } = await supabase
      .from('records')
      .insert([
        { fecha_hora, farm_name, cantidad_lavar, sucio, roto, recuperado }
      ]);

    if (error) throw error;
    res.json({ success: true, message: 'Registro guardado exitosamente', data });
  } catch (err) {
    console.error('Error al guardar:', err.message);
    res.status(500).json({ error: 'No se pudo guardar el registro' });
  }
});

// 3. Ruta para ELIMINAR un registro por su ID (DELETE)
app.delete('/api/records/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('records')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true, message: 'Registro eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar:', err.message);
    res.status(500).json({ error: 'No se pudo eliminar el registro' });
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
