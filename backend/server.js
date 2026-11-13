const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Banco de dados simulado (pode ser substituído por Prisma/PostgreSQL)
let objetos = [
  {
    id: 1,
    titulo: "Garrafa Térmica Azul",
    descricao: "Marca Stanley, deixada perto do bebedouro.",
    local: "Bloco B - 2º Andar",
    data: "2026-11-10",
    status: "ENCONTRADO" // "PERDIDO" ou "ENCONTRADO"
  }
];

// Endpoint GET: Listar todos os objetos
app.get('/objetos', (req, res) => {
  res.status(200).json(objetos);
});

// Endpoint POST: Cadastrar novo objeto
app.post('/objetos', (req, res) => {
  const { titulo, descricao, local, data, status } = req.body;

  if (!titulo || !local || !data || !status) {
    return res.status(400).json({ erro: "Campos obrigatórios faltando." });
  }

  const novoObjeto = {
    id: objetos.length + 1,
    titulo,
    descricao: descricao || "",
    local,
    data,
    status: status.toUpperCase()
  };

  objetos.push(novoObjeto);
  res.status(201).json(novoObjeto);
});

// Endpoint PATCH: Marcar objeto como devolvido
app.patch('/objetos/:id/devolver', (req, res) => {
  const id = Number(req.params.id);
  const objeto = objetos.find(item => item.id === id);

  if (!objeto) {
    return res.status(404).json({ erro: "Objeto não encontrado." });
  }

  objeto.status = "DEVOLVIDO";
  res.status(200).json(objeto);
});

// Endpoint DELETE: Remover objeto da lista
app.delete('/objetos/:id', (req, res) => {
  const id = Number(req.params.id);
  const tamanhoInicial = objetos.length;
  
  objetos = objetos.filter(item => item.id !== id);

  if (objetos.length === tamanhoInicial) {
    return res.status(404).json({ erro: "Objeto não encontrado." });
  }

  res.status(204).send();
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API rodando na porta ${PORT}`);
});