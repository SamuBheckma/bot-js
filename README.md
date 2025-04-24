# Bot Discord - Execução de Código JavaScript

Bot que permite executar código JavaScript diretamente no Discord, com suporte para gerenciamento de processos e segurança.

## 🚀 Funcionalidades
- **Execução de Código**: Execute JavaScript em tempo real
- **Gerenciamento de Processos**: Comando `/kill` para encerrar execuções travadas
- **Segurança**: Apenas administradores podem executar comandos perigosos
- **Modo Temporário**: Sistema de limpeza automática de mensagens

## 📋 Pré-requisitos
- Node.js 18 ou superior
- NPM ou Yarn
- Token de Bot do Discord
- Permissões de Administrador no servidor Discord

## 🛠️ Instalação

### Usando NPM
```bash
# Clona o repositório
git clone https://github.com/SamuBheckma/bot-js.git

# Entra no diretório
cd bot-js

# Instala as dependências
npm install

# Inicia o bot
npm start
```

### Usando Yarn
```bash
# Clona o repositório
git clone https://github.com/SamuBheckma/bot-js.git

# Entra no diretório
cd bot-js

# Instala as dependências
yarn install

# Inicia o bot
yarn start
```

## ⚙️ Configuração
1. Crie um arquivo `.env` na raiz do projeto:
```plaintext
TOKEN=seu_token_do_bot
CLIENT_ID=id_do_bot
GUILD_ID=id_do_servidor_de_teste
OWNER_ID=seu_id_de_admin
```

2. Deploy dos comandos:
```bash
# NPM
npm run deploy:global  # Comandos globais
npm run deploy:guild   # Comandos específicos do servidor

# Yarn
yarn deploy:global     # Comandos globais
yarn deploy:guild      # Comandos específicos do servidor
```

## 🎮 Comandos

### `/log`
Exibe o informações básicas do bot.
```
/log
```

### `compile`
Executa código JavaScript.
```js
´´´js
console.log("Olá, mundo!");
´´´
```

### `/kill`
Encerra um processo em execução.
```
/kill <ID da mensagem>
```

### `/temp`
Gerencia o modo temporário de mensagens.
```
/temp # Alterna entre ativado/desativado
```

### `/purge`
Limpa mensagens do canal.
```
/purge <quantidade>
```

## 📦 Scripts Disponíveis
```bash
# NPM
npm start            # Inicia o bot
npm run deploy:global # Deploy global
npm run deploy:guild # Deploy no servidor
npm run deploy:clear # Limpa comandos

# Yarn
yarn start          # Inicia o bot
yarn deploy:global  # Deploy global
yarn deploy:guild   # Deploy no servidor
yarn deploy:clear   # Limpa comandos
```

## 🔒 Segurança
- Sandbox para execução de código
- Sistema de permissões por cargo
- Timeout para execuções longas
- Bloqueio de código malicioso

## 📄 Licença
Este projeto está licenciado sob a [Licença MIT](LICENSE) - veja o arquivo LICENSE para detalhes.
