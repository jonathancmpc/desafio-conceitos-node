const express = require("express");
const cors = require("cors");

const { uuid, isUuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

/* Middlewares */
function validateProjectID(request, response, next){
  const { id } = request.params;

  /* Verifica se o ID é válido */
  if (!isUuid(id)){
    return response.status(400).json({error: 'Invalid repository ID'});
  }

  /* Prossegue para a próxima Middleware caso o id seja válido */
  return next();
}

/* Chamada de Middleware's para as rotas */
app.use('/repositories/:id', validateProjectID);


/* List/Queries */
app.get("/repositories", (request, response) => {
  const { techs } = request.query;

  /* Verificando se o filtro é válido */
  const results = techs 
    ? repositories.filter(repository => repository.techs.includes(techs))
    :repositories

  /* Retorna resultado da consulta ao cliente */
  return response.json(results);
});

/* Create */
app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;

  /* Montando array com dados passados pelo cliente */
  const repository = { id:uuid(), title, url, techs, like: 0 };

  /* Inserindo os dados no banco de dados */
  repositories.push(repository);

  /* Resposta para o cliente */
  return response.json(repository);

});

/* Update */
app.put("/repositories/:id", (request, response) => {
  const { id } = request.params;

  const { title, url, techs } = request.body;

  /* Percorrendo banco de dados e verificando se existe o parâmetro ID */
  const repositoryIndex = repositories.findIndex(repository => repository.id == id);

  /* Retornando mensagem ao cliente caso não exista o id */
  if (repositoryIndex < 0){
    return response.status(400).json({error: "Repository not found"});
  }

  /* Resgatando o número de likes do repositório */
  const likes = repositories[repositoryIndex].like;
  
  /* Montando novo array com alterações */
  const repository = {
    id,
    title,
    url,
    techs,
    like: likes
  }

  /* Incluindo alterações no banco de dados */
  repositories[repositoryIndex] = repository;

  /* Retornando mensagem ao cliente */
  return response.json(repository);
});

/* Delete */
app.delete("/repositories/:id", (request, response) => {
  const { id } = request.params;
  
  /* Percorrendo banco de dados e verificando se existe o parâmetro ID */
  const repositoryIndex = repositories.findIndex(repository => repository.id == id);

  /* Retornando mensagem ao cliente caso não exista o id */
  if (repositoryIndex < 0){
    return response.status(400).json({error: "Repository not found"});
  }

  /* Deletando repositório */
  repositories.splice(repositoryIndex, 1);

  /* Retornando mensagem em branco para o cliente */
  return response.status(204).send();
});

/* Create Like's */
app.post("/repositories/:id/like", (request, response) => {
  const { id } = request.params;

  /* Pegando o índice do id */
  const repositoryIndex = repositories.findIndex(repository => repository.id == id);

  /* Verificando a existência do id */
  if (repositoryIndex < 0){
    return response.status(400).json({error: "Repository not found!"})
  }

  /* Pegando valor atual do like */
  const likes = repositories[repositoryIndex].like;

  /* Incrementando like */
  const like = likes + 1;

  /* Adicionando likes no repositório */
  repositories[repositoryIndex].like = like;

  const results = repositories[repositoryIndex];

  /* Resposta ao cliente */
  return response.json(results);
});

module.exports = app;
