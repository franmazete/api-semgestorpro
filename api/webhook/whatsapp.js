export default async function handler(req, res) {
  try {
    const body = req.body || {};

    // 1) Capturar texto e telefone (Z-API manda nesse formato muitas vezes)
    const texto = (body?.text?.message || body?.message || body?.body || "")
      .toString()
      .trim()
      .toLowerCase();

    const telefone =
      (body?.phone || body?.from || body?.sender || body?.chatId || "")
        .toString()
        .trim();

    // 2) Se não tiver telefone, só confirma
    if (!telefone) return res.status(200).json({ ok: true });

    // 3) Se mandar "emitir nota", responde com link do GestorPro
    if (texto.includes("emitir nota")) {
      const link = `https://semgestorpro.com.br/emitir-nota?fone=${encodeURIComponent(
        telefone
      )}`;

      const msg = `Perfeito ✅\nClique para abrir a emissão de nota no GestorPro:\n${link}`;

      await enviarZAPI(telefone, msg);

      return res.status(200).json({ ok: true });
    }

    // Resposta padrão (opcional)
    // await enviarZAPI(telefone, "Olá! Envie: emitir nota");

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.log("ERRO WEBHOOK:", err);
    return res.status(200).json({ ok: true });
  }
}

// Função que envia mensagem pela Z-API
async function enviarZAPI(telefone, mensagem) {
  const instanceId = process.env.ZAPI_INSTANCE_ID;
  const token = process.env.ZAPI_TOKEN;
  const clientToken = process.env.ZAPI_CLIENT_TOKEN; // se não tiver, pode deixar vazio

  // ⚠️ IMPORTANTE: a URL exata pode variar conforme sua Z-API.
  // Vou usar o padrão mais comum. Se der erro, a gente ajusta pela sua tela da instância.
  const url = `https://api.z-api.io/instances/${instanceId}/token/${token}/send-text`;

  const headers = { "Content-Type": "application/json" };
  if (clientToken) headers["Client-Token"] = clientToken;

  const payload = {
    phone: telefone,
    message: mensagem,
  };

  const resp = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  const data = await resp.text();
  console.log("RETORNO ZAPI:", resp.status, data);
}
