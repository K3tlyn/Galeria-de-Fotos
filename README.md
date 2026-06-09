# Galeria de Fotos com mapa + SQLite

[![Expo](https://img.shields.io/badge/Expo-CC8B00?style=flat&logo=expo&logoColor=white)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React_Native-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat&logo=sqlite&logoColor=white)](https://www.sqlite.org)
[![License](https://img.shields.io/badge/License-MIT-brightgreen?style=flat)](LICENSE)

> Aplicativo mobile desenvolvido em React Native (Expo) para gerenciamento de fotos com armazenamento local, geolocalização e visualização em mapa. Permite tirar fotos, importar da galeria, editar títulos, excluir imagens e visualizar todas as fotos georreferenciadas em um mapa interativo.


## Status do projeto

- Concluído


## Sumário

- [Funcionalidades](#funcionalidades)
- [Tecnologias usadas](#tecnologias-usadas)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Banco de dados](#banco-de-dados)
- [Compatibilidade](#compatibilidade)
- [Como executar](#como-executar)
- [Como usar](#como-usar)
- [Permissões](#permiss%C3%B5es)
- [Problemas comuns](#problemas-comuns)
- [Autor](#autor)


## Funcionalidades

- Galeria de fotos em grade (2 colunas)
- Captura de fotos com a câmera do dispositivo (interface padrão do sistema)
- Importação da galeria do dispositivo
- Captura automática de localização (latitude/longitude) no momento da foto
- Busca por título das fotos
- Edição de título (ícone lápis)
- Exclusão de foto (ícone lixeira)
- Visualização em tela cheia com zoom (pressione e segure a foto)
- Mapa interativo com marcadores das fotos georreferenciadas
- Tratamento de marcadores sobrepostos (spread automático)
- Armazenamento local com SQLite
- Interface nas cores branca e cinza claro


## Tecnologias usadas

| Tecnologia | Versão | Finalidade |
|------------|--------|-------------|
| React Native (Expo) | ~51.0.0 | Framework mobile |
| TypeScript | ~5.3.3 | Tipagem estática |
| Expo Router | ~3.5.14 | Navegação por abas |
| Expo SQLite | ~14.0.3 | Banco de dados local |
| Expo Image Picker | ~15.0.5 | Seleção de imagens |
| Expo Camera | ~15.0.9 | Câmera |
| Expo Location | ~17.0.1 | Geolocalização |
| React Native Maps | ~1.10.0 | Mapas interativos |
| Expo Vector Icons | ~14.0.0 | Ícones |


## Estrutura do projeto

MY-NOTES/
├── app/
│   ├── _layout.tsx # Configuração das abas (Galeria/Mapa)
│   ├── index.tsx # Tela da Galeria (principal)
│   └── map.tsx # Tela do Mapa
├── database/
│   ├── db.ts # Inicialização do SQLite
│   └── repositories/
│       └── photos.repository.ts # CRUD das fotos
├── assets/ # Ícones e imagens
├── scripts/ # Scripts auxiliares
├── app.json # Configuração do Expo
├── package.json # Dependências
└── README.md # Este arquivo


## Banco de dados

**Nome do banco:** `gallery.db`

**Tabela `photos`:**

| Coluna     | Tipo    | Permite NULL | Descrição                          |
|------------|---------|--------------|------------------------------------|
| id         | INTEGER | Não          | Chave primária (auto incremento)   |
| title      | TEXT    | Não          | Título da foto                     |
| image_uri  | TEXT    | Não          | Caminho local da imagem            |
| latitude   | REAL    | Sim          | Latitude (se capturada)            |
| longitude  | REAL    | Sim          | Longitude (se capturada)           |
| created_at | TEXT    | Não          | Data e hora (formato ISO 8601)     |

**Script de criação:**

```sql
CREATE TABLE IF NOT EXISTS photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  image_uri TEXT NOT NULL,
  latitude REAL,
  longitude REAL,
  created_at TEXT NOT NULL
);
```


## Compatibilidade

| Plataforma | Status |
|-----------|--------|
| Android   |  Suportado |
| iOS       |  Suportado |


## Como executar

### Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn
- Expo CLI
- Dispositivo físico com Expo Go instalado

### Passo a passo

```bash
# Instalar dependências
npm install

# Instalar dependências específicas do Expo
npx expo install expo-sqlite expo-image-picker expo-camera expo-location react-native-maps @expo/vector-icons

# Executar o projeto
npx expo start
```


## Como usar

### Adicionar uma foto
1. Toque no botão + (canto inferior direito)
2. Escolha entre Câmera ou Galeria
3. Digite um título para a foto
4. Permita ou não o acesso à localização
5. Toque em Salvar foto

### Editar título
- Toque no ícone lápis ao lado da foto

### Excluir foto
- Toque no ícone lixeira vermelha (confirmação solicitada)

### Ver foto em tela cheia
- Pressione e segure qualquer foto para ver zoom

### Visualizar no mapa
- Toque na aba Mapa (apenas fotos com localização aparecem)

### Buscar fotos
- Use o campo de busca no topo da galeria


## Permissões necessárias

| Permissão | Uso |
|-----------|-----|
| Câmera | Tirar fotos |
| Galeria | Selecionar fotos existentes |
| Localização | Salvar coordenadas das fotos |

> O app funciona mesmo sem permissão de localização (salva apenas a imagem, sem as coordenadas).


## Problemas comuns

| Problema | Solução |
|----------|---------|
| Mapa não aparece | `npx expo install react-native-maps` |
| Câmera não funciona | `npx expo install expo-camera` e conceder permissão |
| Localização não salva | Ativar GPS e conceder permissão |
| Erro "Unmatched Route" | Verificar estrutura das pastas `app/` |


## Redes sociais

- GitHub: [@K3tlyn](https://github.com/K3tlyn)


## Autor

- Licença: MIT
- Autor: Ketlyn de Souza Barra
- Ano: 2026
