# AD Calc — Simulador de Preços Públicos

Ferramenta web para simulação de preços públicos referentes a processos de licenciamento urbanístico, desenvolvida para uso da **CAP/DEPROT — Coordenadoria de Atendimento ao Público / Divisão de Protocolo** da Secretaria Municipal de Urbanismo e Licenciamento (SMUL) de São Paulo.

Os valores calculados seguem a **Tabela de Taxas e Emolumentos atualizada em fevereiro de 2026**.

---

## 📋 Processos contemplados

A ferramenta cobre 19 tipos de processo, distribuídos entre alvarás, certificados, cadastros e taxas:

- Alvará de Aprovação de Edificação Nova
- Alvará de Aprovação de Reforma
- Revalidação de Alvará de Aprovação
- Alvará de Execução
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

## ⚙️ Funcionalidades

### **Cálculo automático**
Simulação do valor estimado a partir das variáveis do processo (área, tipo, quadro de reformas etc.), com resultado exibido imediatamente.

### **Botão de cópia do valor**
Cada resultado exibido possui um botão que copia o valor no formato internacional (ex: `2260.00`), facilitando o uso em correspondências, planilhas e guias de recolhimento.

### **Contador de sessão**
Acumula o total calculado pelo usuário durante o dia corrente, com persistência via `localStorage` e reset automático à meia-noite.

### **Chaves complementares**
O simulador permite adicionar taxas complementares ao valor estimado:

- **Taxa de autuação** (presente em todos os assuntos)
  - Valor fixo de R$ 30,20
  - Campo para MB's adicionais (R$ 2,90 por MB acima de 50MB)
  - A caixa de resultado exibe a soma do valor fixo com o cálculo dos MB's adicionais
  - Cor: verde

- **Alvará de Execução** (presente em Edificação Nova e Reforma)
  - Valor fixo de R$ 1.116,27
  - Cor: laranja neon

- **Outorga Onerosa** (presente em Edificação Nova, Reforma e Projetos Modificativos)
  - Valor fixo de R$ 627,00
  - Cor: laranja neon

### **Soma total**
Quando uma ou mais chaves complementares estão ativas, uma caixa adicional exibe a soma de todos os valores (valor estimado + chaves ativas), com o título "Total".

### **Título dinâmico**
O título da caixa de resultado principal se adapta automaticamente:
- **Sem chave ativa**: "Valor Estimado"
- **Com chave ativa**: "Valor estimado — [Assunto resumido]"

### **Interface responsiva**
Design adaptável para computadores, tablets e smartphones, garantindo usabilidade em qualquer dispositivo.

---

## 📁 Estrutura de arquivos
ADCalc/
├── index.html # Estrutura da aplicação
├── styles.css # Estilos e design system
├── script.js # Lógica de cálculo e contadores
├── manifest.json # Configuração PWA
├── README.md # Documentação
├── favicon.ico
├── favicon-16x16.png
├── favicon-32x32.png
├── android-chrome-192x192.png
├── android-chrome-512x512.png
├── apple-touch-icon.png
└── Tabela de Taxas e Emolumentos - Fevereiro 2026.pdf

---

## 🔧 Como usar

1. **Selecione o assunto** desejado no menu suspenso
2. **Preencha os campos** com as informações solicitadas (área, quadros de reforma, etc.)
3. **Ative as chaves complementares** desejadas (Taxa de autuação, Alvará de Execução e/ou Outorga Onerosa)
4. **Clique em "Calcular"** para visualizar o valor estimado
5. **Copie o valor** utilizando o botão ao lado de cada resultado
6. **Acompanhe o total** na caixa "Total" ao final da página

---

## 💾 Armazenamento de dados

O simulador utiliza **localStorage** para:
- Armazenar o total da sessão do usuário (reset diário)
- Manter histórico de cálculos realizados

**Nenhum dado é enviado ou armazenado em servidores externos.** Toda a lógica de cálculo e armazenamento ocorre localmente no navegador do usuário.

---

## 🚀 Tecnologias utilizadas

- **HTML5** — Estrutura da aplicação
- **CSS3** — Estilização e design responsivo
- **JavaScript (ES6+)** — Lógica de cálculo e interatividade
- **LocalStorage** — Persistência local dos dados
- **PWA (Progressive Web App)** — Permite instalação como aplicativo

---

## 📱 Instalação como PWA

1. Acesse o site no navegador (Chrome, Edge ou Safari)
2. Clique em **"Instalar"** ou **"Adicionar à tela inicial"**
3. Utilize como um aplicativo nativo em seu dispositivo

---

## 🖥️ Desenvolvimento local

Para executar o projeto localmente:

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/ad-calc.git

# Navegue até a pasta do projeto
cd ad-calc

# Inicie um servidor local (exemplo com Python)
python -m http.server 8000

# Acesse no navegador
http://localhost:8000
```

📝 Observações importantes
Os valores calculados são estimativas para fins de orientação

Os valores oficiais constam da tabela de referência vinculada na interface

Para valores oficiais, consulte a Tabela de Taxas e Emolumentos — Fevereiro/2026

O sistema funciona completamente offline após o primeiro carregamento da página

📩 Suporte
Dúvidas, sugestões ou problemas técnicos, entre em contato:
afandrade@prefeitura.sp.gov.br
Setor: CAP/DEPROT · SMUL · Prefeitura de São Paulo

📄 Licença
Uso interno — Coordenadoria de Atendimento ao Público / Divisão de Protocolo (CAP/DEPROT)

**Desenvolvido por Anderson Ferreira de Andrade — CAP/DEPROT · SMUL · Prefeitura de São Paulo**
