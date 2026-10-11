const PIPEFY_TOKEN = process.env.PIPEFY_TOKEN;
const PIPE_ID = process.env.PIPEFY_PIPE_ID || "307219271";

const FIELD_IDS = {
    nome: "nome_do_lead",
    telefone: "telefone",
    metragem: "metragem_do_apartamento_m",
    finalidade: "finalidade",
    predio: "pr_dio_n_mero_da_unidade",
    mensagem: "observa_es"
};

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ ok: false, error: "Método não permitido." });
    }

    if (!PIPEFY_TOKEN) {
        return res.status(500).json({ ok: false, error: "PIPEFY_TOKEN não configurado." });
    }

    const { nome, telefone, metragem, finalidade, predio, mensagem } = req.body || {};

    if (!nome || !telefone || !metragem || !finalidade || !predio) {
        return res.status(400).json({ ok: false, error: "Campos obrigatórios ausentes." });
    }

    const fields_attributes = [
        { field_id: FIELD_IDS.nome, field_value: String(nome).slice(0, 255) },
        { field_id: FIELD_IDS.telefone, field_value: String(telefone).slice(0, 50) },
        { field_id: FIELD_IDS.metragem, field_value: String(metragem) },
        { field_id: FIELD_IDS.finalidade, field_value: String(finalidade) },
        { field_id: FIELD_IDS.predio, field_value: String(predio).slice(0, 255) }
    ];

    if (mensagem) {
        fields_attributes.push({
            field_id: FIELD_IDS.mensagem,
            field_value: String(mensagem).slice(0, 5000)
        });
    }

    const query = `
        mutation CreateCard($input: CreateCardInput!) {
            createCard(input: $input) {
                card { id title }
            }
        }
    `;

    const variables = {
        input: {
            pipe_id: Number(PIPE_ID),
            fields_attributes
        }
    };

    try {
        const response = await fetch("https://api.pipefy.com/graphql", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${PIPEFY_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ query, variables })
        });

        const json = await response.json();

        if (json.errors) {
            console.error("Pipefy error:", JSON.stringify(json.errors));
            return res.status(502).json({ ok: false, error: "Erro ao criar card no Pipefy." });
        }

        return res.status(200).json({
            ok: true,
            cardId: json.data?.createCard?.card?.id
        });
    } catch (err) {
        console.error("Fetch error:", err);
        return res.status(502).json({ ok: false, error: "Falha na comunicação com o Pipefy." });
    }
}
