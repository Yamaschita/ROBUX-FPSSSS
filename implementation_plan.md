# Desenvolvimento de "Project Velocity" (ROBUX FPSSSS)

O objetivo é desenvolver a infraestrutura inicial e as mecânicas fundamentais de um jogo FPS Multiplayer na Web, seguindo as diretrizes do GDD "Project Velocity". O jogo será hospedado e jogável diretamente pelo navegador, focado em partidas rápidas de 10 minutos (Free-For-All), com um sistema de economia in-game e compra de armas.

Os arquivos do projeto serão organizados na pasta solicitada: `C:\Users\24026779\Documents\GitHub\ROBUX FPSSSS`.

## User Review Required

> [!IMPORTANT]  
> **Seleção da Stack Tecnológica:** Precisamos validar a stack proposta para o projeto. Recomendo:
> - **Frontend (Renderização 3D):** Three.js + Vite (Leve e rápido para navegadores).
> - **Física:** Rapier3D (Motor de física moderno e de alta performance, essencial para FPS).
> - **Backend (Multiplayer):** Node.js + Colyseus (Framework focado em jogos multijogador autoritativos, perfeito para gerenciar estados de partida, posições e segurança).
> - **Linguagem:** TypeScript (Garante consistência entre cliente e servidor).

## Open Questions

> [!WARNING]  
> 1. **Modelos 3D e Assets:** Você possui modelos de armas e mapas (low-poly), ou gostaria que eu utilizasse primitivas (cubos/cilindros) para o protótipo inicial (blockout)?
> 2. **Autenticação:** Para este primeiro escopo, podemos utilizar nomes de usuário temporários gerados ao entrar na partida, ou precisamos de um sistema de login desde já?

## Proposed Changes

O projeto será dividido em duas partes principais dentro da pasta do repositório: `client` (Frontend) e `server` (Backend).

### Estrutura do Projeto

#### [NEW] `server/` (Backend Colyseus)
O servidor gerenciará o estado do jogo (posições, HP, economia, kills) e validará os tiros.
- `server/src/rooms/FPSRoom.ts`: Lógica da sala, timer de 10 minutos e distribuição de jogadores.
- `server/src/rooms/schema/GameState.ts`: Estado sincronizado (jogadores, dinheiro, armas, kills).
- `server/src/index.ts`: Ponto de entrada do servidor Colyseus.

#### [NEW] `client/` (Frontend Three.js)
O cliente será responsável pela renderização, captura de inputs (Pointer Lock) e envio ao servidor.
- `client/src/main.ts`: Inicialização do Three.js e conexão com o servidor Colyseus.
- `client/src/PlayerController.ts`: Captura de WASD, Pulo, Corrida (Ctrl), Mouse (Mira e ADS).
- `client/src/Renderer.ts`: Configuração de câmera, luzes, e renderização do mapa "Campo de Treino".
- `client/src/UI.ts`: HUD com HP, Kills, Dinheiro, Tempo Restante e a Loja de Armas sobreposto em HTML.

#### [NEW] `shared/` (Tipos e Constantes)
- `shared/weapons.ts`: Atributos das armas (Pistola, SMG, AR, Sniper), custos e propriedades compartilhadas.

## Verification Plan

### Automated Tests
- Validação no lado do servidor para cálculos de economia (ex: kill +$100, headshot +$150).

### Manual Verification
- Iniciar o servidor localmente e conectar múltiplas abas do navegador.
- Verificar a movimentação, Pointer Lock, sincronização da física e colisão.
- Testar sistema de tiros, loja (tecla B) e deduções corretas de dinheiro.
- Confirmar encerramento da partida e exibição do placar após o tempo limite.
