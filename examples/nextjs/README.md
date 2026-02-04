<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Convite – Chamado de Retorno ao Ministério</title>
  <style>
    body {
      margin: 0;
      font-family: 'Georgia', serif;
      background: #f2e6c7;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    .convite {
      background: url('convite.png') no-repeat center;
      background-size: cover;
      max-width: 420px;
      width: 95%;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,.3);
      animation: fadeIn 1.2s ease;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px);} 
      to { opacity: 1; transform: translateY(0);} 
    }
    h1 {
      text-align: center;
      font-size: 20px;
      margin-bottom: 16px;
    }
    .assinatura {
      margin-top: 20px;
    }
    input {
      width: 100%;
      padding: 12px;
      font-size: 16px;
      border-radius: 8px;
      border: 1px solid #aaa;
    }
    .botoes {
      display: flex;
      gap: 10px;
      margin-top: 16px;
    }
    button {
      flex: 1;
      padding: 12px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      cursor: pointer;
      transition: transform .2s, box-shadow .2s;
    }
    button:hover {
      transform: scale(1.05);
      box-shadow: 0 5px 15px rgba(0,0,0,.3);
    }
    .sim { background: #2e7d32; color: #fff; }
    .nao { background: #c62828; color: #fff; }
    .status {
      margin-top: 14px;
      text-align: center;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="convite">
    <h1>Chamado de Retorno ao Ministério</h1>

    <div class="assinatura">
      <label>Assine seu nome:</label>
      <input type="text" id="nome" placeholder="Digite seu nome completo" />
    </div>

    <div class="botoes">
      <button class="sim" onclick="confirmar('Aceitou o chamado')">Aceito o chamado</button>
      <button class="nao" onclick="confirmar('Não pode aceitar no momento')">Não posso aceitar</button>
    </div>

    <div class="status" id="status"></div>
  </div>

  <form action="https://formspree.io/f/xzdappee" method="POST">
      <input type="hidden" name="resposta" id="resposta" />
      <div class="assinatura">
        <label>Assine seu nome:</label>
        <input type="text" name="nome" id="nome" placeholder="Digite seu nome completo" required />
      </div>

      <div class="botoes">
        <button type="submit" class="sim" onclick="document.getElementById('resposta').value='Aceitou o chamado'">Aceito o chamado</button>
        <button type="submit" class="nao" onclick="document.getElementById('resposta').value='Não pode aceitar no momento'">Não posso aceitar</button>
      </div>
    </form>

    <div class="status" id="status"></div>
</body>
</html>
