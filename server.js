const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const supabaseUrl = 'https://knebgbmufezuxoipbqhcx.supabase.co';
const supabaseKey = 'sb_publishable_0y3j01fOyL1ttovNGVh22g_SJsIym8u';
const supabase = createClient(supabaseUrl, supabaseKey);

app.get('/api/records', async (req, res) => {
  try {
    const { data, error } = await supabase.from('records').select('*').order('id', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/records', async (req, res) => {
  try {
    // Limpiamos y formateamos la fecha para que se guarde perfecto como texto en Supabase
    let fechaLimpia = req.body.fecha_hora;
    if (fechaLimpia && fechaLimpia.includes('T')) {
      fechaLimpia = fechaLimpia.replace('T', ' ');
    }

    const nuevoRegistro = {
      fecha_hora: fechaLimpia || new Date().toISOString().slice(0, 19).replace('T', ' '),
      farm_name: req.body.farm_name || 'Sin nombre',
      cantidad_lavar: parseInt(req.body.cantidad_lavar, 10) || 0,
      sucio: parseInt(req.body.sucio, 10) || 0,
      roto: parseInt(req.body.roto, 10) || 0,
      recuperado: parseInt(req.body.recuperado, 10) || 0
    };

    const { data, error } = await supabase
      .from('records')
      .insert([nuevoRegistro]);

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    console.error('Error detallado al insertar:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/records/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('records')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});

app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
