# AD Calc — Simulador de Preços Públicos

Ferramenta web para simulação de preços públicos referentes a processos de licenciamento urbanístico, desenvolvida para uso interno da **CAP/DEPROT — Coordenadoria de Atendimento ao Público / Divisão de Protocolo** da Secretaria Municipal de Urbanismo e Licenciamento (SMUL) de São Paulo.

Os valores calculados seguem a **Tabela de Taxas e Emolumentos atualizada em fevereiro de 2026**.

---

## Processos contemplados

A ferramenta cobre 18 tipos de processo, distribuídos entre alvarás, certificados e cadastros:

- Alvará de Aprovação de Edificação Nova
- Alvará de Execução
- Alvará de Aprovação de Reforma
- Projeto Modificativo de Alvará de Aprovação e Execução de Edificação Nova
- Projeto Modificativo de Alvará de Aprovação e Execução de Reforma
- Alvará de Autorização de Avanço de Grua Sobre o Espaço Público
- Avanço de tapume sobre parte do passeio público
- Alvará de Autorização de Implantação e/ou Utilização de Estande de Vendas
- Alvará de Instalação de Heliponto
- Alvará de Execução de Estação Rádio Base (ERB)
- Alvará de Funcionamento para Local de Reunião
- Certificado de Segurança
- Certificado de Acessibilidade
- Cadastro de Sistema Especial de Segurança
- Cadastro ou Manutenção de tanques de armazenagem, bombas, filtros de combustível e equipamentos afins
- Alvará para Desmembramento/Remembramento
- Alvará para Reparcelamento
- Certidão de Diretrizes Urbanísticas

---

## Funcionalidades

**Cálculo**
Simulação automática do valor estimado a partir das variáveis do processo (área, tipo, quadro de reformas etc.), com resultado exibido imediatamente e botão de cópia do valor para uso em correspondências e guias.

**Contador de sessão**
Acumula o total calculado pelo usuário durante o dia corrente, com persistência via `localStorage` e reset automático à meia-noite.

**Contador global**
Soma em tempo real de todos os valores calculados por todos os usuários desde fevereiro de 2026, sincronizada via [JSONBin.io](https://jsonbin.io) com polling de 30 segundos. Suporta modo offline com fila de pendências sincronizada ao restabelecer conexão.

**Operação offline**
Cálculos realizados sem conectividade são enfileirados localmente e enviados ao contador global assim que a conexão é restaurada.

---

## Estrutura de arquivos

```
ADCalc/
├── index.html                              # Estrutura da aplicação
├── styles.css                              # Estilos e design system
├── script.js                               # Lógica de cálculo e contadores
├── manifest.json                           # Configuração PWA
├── favicon.ico
├── favicon-16x16.png
├── favicon-32x32.png
├── android-chrome-192x192.png
├── android-chrome-512x512.png
├── apple-touch-icon.png
└── Tabela de Taxas e Emolumentos - Fevereiro 2026.pdf
```

---

## Configuração do contador global (JSONBin)

As credenciais de acesso à API do JSONBin estão declaradas em `index.html`, no bloco de configuração antes do carregamento do script:

```js
window.JSONBIN_CONFIG = {
    BIN_ID: 'SEU_BIN_ID',
    API_KEY: 'SUA_API_KEY',
    UPDATE_INTERVAL: 30000   // intervalo de polling em ms
};
```

Para trocar o bin de dados, basta substituir `BIN_ID` e `API_KEY` pelos valores do novo bin criado no painel do JSONBin.io. O script inicializa a estrutura do bin automaticamente na primeira execução caso o campo `total` esteja ausente.

---

## Observações técnicas

- A aplicação não depende de frameworks ou bibliotecas externas — HTML, CSS e JavaScript puros.
- Tipografia: **DM Sans** (interface) + **DM Mono** (valores numéricos), carregadas via Google Fonts.
- Os valores calculados são **estimativas** para fins de orientação; os valores oficiais constam da tabela de referência vinculada na interface.
- A chave de API do JSONBin exposta no cliente possui escopo restrito de leitura/escrita apenas ao bin configurado.

---

Desenvolvido por **Anderson Andrade** — CAP/DEPROT · SMUL · Prefeitura de São Paulo

