require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const fs = require('fs');

const app = express();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

const upload = multer({ storage: multer.memoryStorage() });

function generateSlug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
}

async function processImage(buffer) {
  const optimized = await sharp(buffer)
    .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();
  
  let result = optimized;
  let quality = 80;
  
  while (result.length > 206 * 1024 && quality > 20) {
    quality -= 10;
    result = await sharp(buffer)
      .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality })
      .toBuffer();
  }
  
  return result;
}

app.post('/api/cadastrar', async (req, res) => {
  try {
    const { email, senha, whatsapp } = req.body;
    
    const { data: existing } = await supabase
      .from('perfis')
      .select('email')
      .eq('email', email)
      .single();
    
    if (existing) {
      return res.status(400).json({ erro: 'E-mail já cadastrado' });
    }
    
    const hashedPassword = await bcrypt.hash(senha, 10);
    
    const { data: perfil, error } = await supabase
      .from('perfis')
      .insert([{ 
        email, 
        senha: hashedPassword, 
        whatsapp: whatsapp.replace(/\D/g, ''),
        created_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    req.session.usuarioId = perfil.id;
    req.session.email = perfil.email;
    
    res.json({ sucesso: true, perfil });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    
    const { data: perfil, error } = await supabase
      .from('perfis')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error || !perfil) {
      return res.status(401).json({ erro: 'E-mail ou senha inválidos' });
    }
    
    const validPassword = await bcrypt.compare(senha, perfil.senha);
    if (!validPassword) {
      return res.status(401).json({ erro: 'E-mail ou senha inválidos' });
    }
    
    req.session.usuarioId = perfil.id;
    req.session.email = perfil.email;
    
    res.json({ sucesso: true, perfil });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ sucesso: true });
});

function verificarAutenticacao(req, res, next) {
  if (!req.session.usuarioId) {
    return res.status(401).json({ erro: 'Não autenticado' });
  }
  next();
}

app.get('/api/usuario', verificarAutenticacao, async (req, res) => {
  const { data: perfil } = await supabase
    .from('perfis')
    .select('*')
    .eq('id', req.session.usuarioId)
    .single();
  res.json(perfil);
});

app.get('/api/meus-produtos', verificarAutenticacao, async (req, res) => {
  const { data: produtos } = await supabase
    .from('produtos')
    .select('*')
    .eq('vendedor_id', req.session.usuarioId)
    .order('created_at', { ascending: false });
  res.json(produtos || []);
});

app.post('/api/produtos', verificarAutenticacao, upload.single('imagem'), async (req, res) => {
  try {
    const { titulo, descricao, preco, whatsapp } = req.body;
    const slug = generateSlug(titulo);
    
    let imagemUrl = null;
    
    if (req.file) {
      const processedBuffer = await processImage(req.file.buffer);
      const fileName = `${uuidv4()}.jpg`;
      const filePath = `produtos/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('local-market')
        .upload(filePath, processedBuffer, { contentType: 'image/jpeg' });
      
      if (uploadError) throw uploadError;
      
      const { data: urlData } = supabase.storage
        .from('local-market')
        .getPublicUrl(filePath);
      
      imagemUrl = urlData.publicUrl;
    }
    
    const { data: produto, error } = await supabase
      .from('produtos')
      .insert([{
        titulo,
        descricao,
        preco: parseFloat(preco),
        whatsapp: whatsapp.replace(/\D/g, ''),
        imagem_url: imagemUrl,
        slug,
        vendedor_id: req.session.usuarioId,
        ativo: true,
        vendido: false,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ sucesso: true, produto });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

app.put('/api/produtos/:id', verificarAutenticacao, upload.single('imagem'), async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descricao, preco, whatsapp } = req.body;
    
    const { data: existing } = await supabase
      .from('produtos')
      .select('*')
      .eq('id', id)
      .eq('vendedor_id', req.session.usuarioId)
      .single();
    
    if (!existing) {
      return res.status(404).json({ erro: 'Produto não encontrado' });
    }
    
    let imagemUrl = existing.imagem_url;
    
    if (req.file) {
      const processedBuffer = await processImage(req.file.buffer);
      const fileName = `${uuidv4()}.jpg`;
      const filePath = `produtos/${fileName}`;
      
      await supabase.storage
        .from('local-market')
        .upload(filePath, processedBuffer, { contentType: 'image/jpeg' });
      
      const { data: urlData } = supabase.storage
        .from('local-market')
        .getPublicUrl(filePath);
      
      imagemUrl = urlData.publicUrl;
    }
    
    const { data: produto, error } = await supabase
      .from('produtos')
      .update({
        titulo,
        descricao,
        preco: parseFloat(preco),
        whatsapp: whatsapp.replace(/\D/g, ''),
        imagem_url: imagemUrl
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ sucesso: true, produto });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

app.delete('/api/produtos/:id', verificarAutenticacao, async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('produtos')
      .delete()
      .eq('id', id)
      .eq('vendedor_id', req.session.usuarioId);
    
    if (error) throw error;
    
    res.json({ sucesso: true });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

app.put('/api/produtos/:id/vendido', verificarAutenticacao, async (req, res) => {
  try {
    const { id } = req.params;
    const { vendido } = req.body;
    
    const { error } = await supabase
      .from('produtos')
      .update({ vendido })
      .eq('id', id)
      .eq('vendedor_id', req.session.usuarioId);
    
    if (error) throw error;
    
    res.json({ sucesso: true });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

app.get('/api/produtos/ativo', async (req, res) => {
  const { data: produtos } = await supabase
    .from('produtos')
    .select('*')
    .eq('ativo', true)
    .eq('vendido', false)
    .order('created_at', { ascending: false });
  res.json(produtos || []);
});

app.get('/api/produto/:slug', async (req, res) => {
  const { slug } = req.params;
  
  const { data: produto } = await supabase
    .from('produtos')
    .select('*, perfis(email, whatsapp)')
    .eq('slug', slug)
    .single();
  
  if (!produto) {
    return res.status(404).json({ erro: 'Produto não encontrado' });
  }
  
  res.json(produto);
});

app.get('/api/produto/:id/qrcode', async (req, res) => {
  const { id } = req.params;
  
  const { data: produto } = await supabase
    .from('produtos')
    .select('slug')
    .eq('id', id)
    .single();
  
  if (!produto) {
    return res.status(404).json({ erro: 'Produto não encontrado' });
  }
  
  const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
  const produtoUrl = `${baseUrl}/anuncio/${produto.slug}`;
  
  const qrCodeDataUrl = await QRCode.toDataURL(produtoUrl);
  
  res.json({ qrcode: qrCodeDataUrl, url: produtoUrl });
});

app.post('/api/verificacao', async (req, res) => {
  try {
    const { produto_id, imagem_base64 } = req.body;
    const sessionId = uuidv4();
    const timestamp = new Date().toISOString();
    
    const { data: produto } = await supabase
      .from('produtos')
      .select('*, perfis(email)')
      .eq('id', produto_id)
      .single();
    
    if (!produto) {
      return res.status(404).json({ erro: 'Produto não encontrado' });
    }
    
    const { error } = await supabase
      .from('verificacoes')
      .insert([{
        session_id: sessionId,
        produto_id,
        imagem_selfie: imagem_base64,
        timestamp,
        ip_address: req.ip
      }]);
    
    if (error) throw error;
    
    const mensagem = `Olá, vi seu anúncio "${produto.titulo}" no portal local. Minha identidade foi validada (ID: ${sessionId}). Tenho interesse!`;
    const linkWhatsApp = `https://wa.me/${produto.whatsapp}?text=${encodeURIComponent(mensagem)}`;
    
    res.json({ sucesso: true, session_id: sessionId, link_whatsapp: linkWhatsApp });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

app.post('/api/avaliacoes', async (req, res) => {
  try {
    const { produto_id, avaliacao, comentario } = req.body;
    
    const { error } = await supabase
      .from('avaliacoes')
      .insert([{
        produto_id,
        avaliacao,
        comentario,
        created_at: new Date().toISOString()
      }]);
    
    if (error) throw error;
    
    res.json({ sucesso: true });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

app.get('/api/avaliacoes/:produto_id', async (req, res) => {
  const { produto_id } = req.params;
  
  const { data: avaliacoes } = await supabase
    .from('avaliacoes')
    .select('*')
    .eq('produto_id', produto_id)
    .order('created_at', { ascending: false });
  
  res.json(avaliacoes || []);
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/anuncio/:slug', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'anuncio.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/cadastro', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'cadastro.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
