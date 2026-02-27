export default async function handler(req, res) {
  const body = req.body || {};

  // Log simples (vai aparecer nos logs da Vercel)
  console.log("CHEGOU WEBHOOK:", JSON.stringify(body));

  return res.status(200).json({ ok: true });
}
