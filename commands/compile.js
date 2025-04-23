const { Worker } = require("worker_threads");
const path = require("path");

// Lista de palavras-chave potencialmente perigosas
const UNSAFE_PATTERNS = [
  'process',
  'require',
  'module',
  '__dirname',
  '__filename',
  'global',
  'Buffer',
  'setTimeout',
  'setInterval',
  'setImmediate',
  'fetch',
  'http',
  'fs',
  'child_process'
];

// Função para verificar se o código é seguro
function isUnsafeCode(code) {
  // Verifica padrões perigosos
  if (UNSAFE_PATTERNS.some(pattern => code.includes(pattern))) {
    return true;
  }

  // Verifica loops infinitos
  if (code.includes('while(true)') || code.includes('while (true)')) {
    return true;
  }

  // Verifica loops com muitas iterações
  const forMatch = code.match(/for\s*\([^;]*;[^;]*([<>]=?|!=)\s*(\d+)/);
  if (forMatch && parseInt(forMatch[2]) > 1000) {
    return true;
  }

  return false;
}

module.exports = {
  name: "compile",
  async execute(message, args, processes) {
    try {
      const code = message.content.replace(/```js\n|\n```/g, "").trim();
      
      // Para código simples
      if (!isUnsafeCode(code)) {
        let outputs = [];
        const originalLog = console.log;
        
        console.log = (...args) => {
          const output = args.join(" ");
          outputs.push(output);
          originalLog(`☄️ Resultado: ${output}`);
        };

        const result = eval(code);
        console.log = originalLog;

        const reply = await message.reply({
          embeds: [
            {
              color: 0x00ff00,
              title: "✅ Resultado da Execução",
              description: `**Saída:**\n${outputs.join('\n') || result || "undefined"}`,
            },
          ],
        });

        // Adiciona ao sistema temp
        const tempCommand = require("./temp");
        if (tempCommand.getTempStatus()) {
          tempCommand.addTempMessage(reply.id);
          tempCommand.addTempMessage(message.id);
        }
        return;
      }

      // Para código potencialmente perigoso
      const executionId = processes.size + 1;

      const reply = await message.channel.send({
        embeds: [{
            color: 0xffff00,
            title: "⏳ Código em Execução",
            description: `**ID:** ${executionId}\n**Status:** Em andamento...\n\n**Outputs:**\n\`\`\`\nAguardando...\`\`\``
        }]
      });

      const worker = new Worker(path.join(__dirname, '..', 'scripts', 'evalWorker.js'), {
        workerData: code
      });

      processes.set(executionId, { 
        worker, 
        outputs: [], 
        reply,
        startTime: Date.now()
      });

      worker.on("message", async (msg) => {
        const process = processes.get(executionId);
        if (!process) return;

        switch (msg.type) {
          case 'update':
            process.outputs = msg.output;
            await reply.edit({
              embeds: [{
                color: 0xffff00,
                title: "⏳ Código em Execução",
                description: `**ID:** ${executionId}\n**Status:** Em execução\n\n**Outputs:**\n\`\`\`\n${msg.output.join('\n')}\`\`\``
              }]
            }).catch(console.error);
            break;

          case 'error':
            await reply.edit({
              embeds: [{
                color: 0xff0000,
                title: "❌ Execução Finalizada com Erro",
                description: `**Outputs:**\n\`\`\`\n${msg.output.join('\n')}\n\n❌ Erro: ${msg.error}\`\`\``
              }]
            }).catch(console.error);
            cleanup(executionId, processes);
            break;

          case 'start':
            process.outputs = msg.output;
            break;
        }
      });

      worker.on("error", async (error) => {
        const process = processes.get(executionId);
        if (process) {
          await reply.edit({
            embeds: [{
              color: 0xff0000,
              title: "❌ Erro no Worker",
              description: `Ocorreu um erro ao executar o código:\n\`\`\`\n${error.message}\`\`\``
            }]
          }).catch(console.error);
          cleanup(executionId, processes);
        }
      });

      worker.on("exit", (code) => {
        const process = processes.get(executionId);
        if (process && code === 0) {
          reply.edit({
            embeds: [{
              color: 0x00ff00,
              title: "✅ Execução Finalizada",
              description: `**Outputs:**\n\`\`\`\n${process.outputs.join('\n')}\`\`\``
            }]
          });
        }
        processes.delete(executionId);
      });

    } catch (err) {
      console.error('Erro na execução:', err);
      await message.reply({
        embeds: [
          {
            color: 0xff0000,
            title: "❌ Erro",
            description: err.message,
          },
        ],
      });

      // Adiciona ao sistema temp
      const tempCommand = require("./temp");
      if (tempCommand.getTempStatus()) {
        tempCommand.addTempMessage(reply.id);
        tempCommand.addTempMessage(message.id);
      }
    }
  },
};

function cleanup(executionId, processes) {
  const process = processes.get(executionId);
  if (process?.worker) {
    process.worker.terminate();
  }
  processes.delete(executionId);
}