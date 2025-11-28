/*
═════════════════════════════
  Nazuna - Index principal
  Autor: Hiudy
  Revisão: 31/08/2025
═════════════════════════════
*/
import { downloadContentFromMessage, generateWAMessageFromContent, generateWAMessage, isJidNewsletter, getContentType } from '@cognima/walib';
import { exec, execSync } from 'child_process';
import { parseHTML } from 'linkedom';
// ... (seus outros imports) ...
import * as crypto from 'crypto';
import WaLib from '@cognima/walib';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ... (todo seu código de constantes, funções auxiliares como formatUptime, normalizar, etc.) ...

// =========================================================================
// NOVO CÓDIGO AUXILIAR PARA ENVIO DE ARQUIVO (INTEGRAÇÃO HTML/SERVER)
// =========================================================================

async function enviarArquivoWhatsApp(nazu, jid, filePath, mimeType, caption) {
    try {
        if (!fs.existsSync(filePath)) {
            return { success: false, error: 'Arquivo não encontrado no caminho temporário.' };
        }
        
        const fileBuffer = fs.readFileSync(filePath);
        const fileName = pathz.basename(filePath);

        // Determina o tipo de mídia para o sendMessage do WaLib
        let messageContent;
        if (mimeType.startsWith('image/')) {
            messageContent = { image: fileBuffer, caption: caption };
        } else if (mimeType.startsWith('video/')) {
            messageContent = { video: fileBuffer, caption: caption, mimetype: mimeType };
        } else if (mimeType.startsWith('audio/')) {
            messageContent = { audio: fileBuffer, mimetype: mimeType, ptt: false };
        } else {
            // Documento genérico (PDF, DOCX, etc.)
            messageContent = { document: fileBuffer, mimetype: mimeType, fileName: fileName, caption: caption };
        }

        await nazu.sendMessage(jid, messageContent);
        
        return { success: true };
    } catch (error) {
        console.error("❌ Erro ao enviar arquivo via WaLib:", error);
        return { success: false, error: error.message };
    } finally {
        // Limpa o arquivo temporário após o envio
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }
}

// EXPÕE A FUNÇÃO GLOBALMENTE PARA O SERVIDOR WEB (web_server.js)
global.enviarArquivoWhatsApp = enviarArquivoWhatsApp;

// =========================================================================
