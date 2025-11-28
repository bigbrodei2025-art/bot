// web_server.js
import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
// Porta 1000
const port = 1000; 
const uploadDir = path.join(__dirname, 'uploads_temp');

// Cria a pasta de uploads se não existir
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Configuração do Multer para armazenar o arquivo temporariamente
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Usa timestamp para garantir nome único
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// --- Middlewares ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve o formulário HTML na pasta 'public'
app.use(express.static('public')); 

// --- Rota de Upload e Envio ---
// Recebe o arquivo (upload.single('arquivo')) e dados do formulário
app.post('/upload-whatsapp', upload.single('arquivo'), async (req, res) => {
    
    // Verifica se a instância do bot (nazu) e a função de envio estão disponíveis
    if (!global.nazu || typeof global.enviarArquivoWhatsApp !== 'function') {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        return res.status(503).json({ 
            success: false, 
            message: '❌ Bot inativo ou função de envio não carregada. O bot (index.js) precisa estar rodando.' 
        });
    }

    if (!req.file) {
        return res.status(400).json({ success: false, message: 'Nenhum arquivo foi enviado.' });
    }

    const { number, caption } = req.body;
    
    if (!number) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        return res.status(400).json({ success: false, message: 'Número de WhatsApp não fornecido.' });
    }

    try {
        const jid = number.replace(/\D/g, '') + '@s.whatsapp.net';
        
        // Chama a função que usa a API do seu bot (walib)
        const result = await global.enviarArquivoWhatsApp(
            global.nazu, 
            jid, 
            req.file.path,
            req.file.mimetype,
            caption
        );

        if (result.success) {
            res.json({ success: true, message: `✅ Arquivo enviado com sucesso para ${number}!` });
        } else {
            res.status(500).json({ success: false, message: `❌ Falha no envio do bot: ${result.error}` });
        }

    } catch (e) {
        console.error("Erro na rota /upload-whatsapp:", e);
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ success: false, message: 'Erro interno do servidor ao processar o arquivo.' });
    }
});

// Inicializa o servidor web
app.listen(port, () => {
  console.log(`🚀 Servidor Web rodando em http://localhost:${port}`);
});
