const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Tus credenciales originales exactas
const supabaseUrl = 'https://knebgbmufezuxoipbqhcx.supabase.co';
const supabaseKey = 'sb_publishable_0y3j01fOyL1ttovNGVh22g_SJsIym8u';
const supabase = createClient(supabaseUrl, supabaseKey);

// Obtener registros
app.get('/api/records', async (req, res) => {
  try {
    const { data, error } = await supabase.from('records').select('*');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Guardar registro (tu método original)
app.post('/api/records', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('records')
      .insert([req.body]);

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Ruta para eliminar (lo único nuevo necesario)
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
