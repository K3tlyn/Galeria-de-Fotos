**Galeria de Fotos com mapa + SQLite**

Aplicativo mobile desenvolvido em **React Native (Expo)** para gerenciamento de fotos com armazenamento local, geolocalização e visualização em mapa. Permite tirar fotos, importar da galeria, editar títulos, excluir imagens e visualizar todas as fotos georreferenciadas em um mapa interativo.


**Funcionalidades**


- Galeria de fotos em grade (2 colunas)
- Captura de fotos com a câmera do dispositivo (interface padrão do sistema)
- Importação da galeria do dispositivo
- Captura automática de localização (latitude/longitude) no momento da foto
- Busca por título das fotos
- Edição de título (ícone lápis)
- Exclusão de foto (ícone lixeira)
- Visualização em tela cheia com zoom (pressione e segure a foto)
- Mapa interativo (com marcadores das fotos georreferenciadas)
- Armazenamento local com SQLite (funciona offline)
- Interface nas cores branca e cinza claro


**Tecnologias usadas**

React Native (Expo) 51.0.0 - Framework mobile
TypeScript 5.3.3 - Tipagem estática
Expo Router 3.5.14 - Navegação por abas
Expo SQLite 14.0.3 - Banco de dados local
Expo Image Picker 15.0.5 - Seleção de imagens da galeria
Expo Camera 15.0.9 - Câmera
Expo Location 17.0.1 - Geolocalização
React Native Maps 1.10.0 - Mapas interativos
Expo Vector Icons 14.0.0 - Ícones (lápis, lixeira, busca)


**Estrutura do projeto**

MY-NOTES/
├── app/
│ ├── _layout.tsx # Configuração das abas (Galeria/Mapa)
│ ├── index.tsx # Tela da Galeria (principal)
│ └── map.tsx # Tela do Mapa
├── database/
│ ├── db.ts # Inicialização do SQLite
│ └── repositories/
│ └── photos.repository.ts # CRUD das fotos
├── assets/ # Ícones e imagens
├── scripts/ # Scripts auxiliares
├── app.json # Configuração do Expo
├── package.json # Dependências
└── README.md # Este arquivo

**Como Executar o Projeto**

Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn
- Expo CLI
- Dispositivo físico com Expo Go instalado

Passo a passo

1. Instale as dependências
   bash
(npm install)

2. Instale as dependências específicas do Expo
(npx expo install expo-sqlite expo-image-picker expo-camera expo-location react-native-maps @expo/vector-icons)

3. Execute o projeto
(npx expo start)

4. Abra seu celular e leia o QR Code.

**Banco de dados**

Tabela photos:

Coluna           Tipo                 Descrição
id              INTEGER      Chave primária (auto incremento)
title            TEXT               Título da foto
image_uri        TEXT           Caminho local da imagem
latitude         REAL                  Latitude
longitude        REAL                 Longitude
created_at       TEXT           Data e hora do cadastro

**Como usar**

1. Adicionar uma foto
Toque no botão + (canto inferior direito)

2. Escolha entre Câmera ou Galeria

Se clicar em "câmera" deve solicitar o acesso a câmera, se aceita a permissão deve ser possível tirar a foto e usar ela(use photo) ou tirar novamente(retake)

Se clicar em galeria, deve ser solicitado o acesso a galeria. Se liberado o acesso a galeria, deve ser pssível selecionar a foto que desejar

3. Digite um título para poder salvar a foto

4. Permita ou não o acesso à localização

5. Toque em Salvar foto

6. Para editar o título
Toque no ícone lápis

7. PAra excluir a foto
Toque no ícone lixeira (confirmação solicitada)

8. Ver foto em tela cheia
Pressione e segure qualquer foto (zoom disponível)

9. Visualizar no mapa
Toque na aba Mapa (apenas fotos com localização aparecem)

10. Buscar fotos
Use o campo de busca no topo da galeria