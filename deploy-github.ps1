# Script para subir o projeto para o GitHub
# Execute este script no PowerShell

$ErrorActionPreference = "Stop"

Write-Host "=== GitHub Deploy Script - SantaFé Market ===" -ForegroundColor Cyan
Write-Host ""

# Verificar se git está instalado
try {
    git --version | Out-Null
} catch {
    Write-Host "Erro: Git não está instalado!" -ForegroundColor Red
    Write-Host "Instale o Git em: https://git-scm.com" -ForegroundColor Yellow
    exit 1
}

# Solicitar informações do usuário
Write-Host "1. Criou o repositório no GitHub? (sim/não)" -ForegroundColor Yellow
$repoConfirm = Read-Host

if ($repoConfirm -ne "sim" -and $repoConfirm -ne "s") {
    Write-Host ""
    Write-Host "Instruções para criar o repositório:" -ForegroundColor Cyan
    Write-Host "1. Acesse: https://github.com/new" -ForegroundColor White
    Write-Host "2. Nomeie o repositório: santafe-market" -ForegroundColor White
    Write-Host "3. Marque: Public" -ForegroundColor White
    Write-Host "4. NÃO marque nenhuma opção adicional" -ForegroundColor White
    Write-Host "5. Clique em: Create repository" -ForegroundColor White
    Write-Host "6. Copie a URL do repositório" -ForegroundColor White
    Write-Host ""
    exit 0
}

Write-Host ""
Write-Host "2. Cole a URL do repositório (ex: https://github.com/usuario/santafe-market.git):" -ForegroundColor Yellow
$repoUrl = Read-Host

if ([string]::IsNullOrWhiteSpace($repoUrl)) {
    Write-Host "Erro: URL do repositório é obrigatória!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "3. Configure seu nome e email no Git:" -ForegroundColor Yellow
$gitName = Read-Host "Seu nome"
$gitEmail = Read-Host "Seu email"

if (-not [string]::IsNullOrWhiteSpace($gitName)) {
    git config --global user.name $gitName
}

if (-not [string]::IsNullOrWhiteSpace($gitEmail)) {
    git config --global user.email $gitEmail
}

# Inicializar repositório
Write-Host ""
Write-Host "Inicializando repositório..." -ForegroundColor Cyan

if (Test-Path ".git") {
    Write-Host "Repositório já existe, pulando init..." -ForegroundColor Yellow
} else {
    git init
    git branch -M main
}

# Adicionar remote
$currentRemote = git remote get-url origin 2>$null
if ($currentRemote) {
    Write-Host "Remote já existe: $currentRemote" -ForegroundColor Yellow
} else {
    git remote add origin $repoUrl
}

# Adicionar arquivos
Write-Host ""
Write-Host "Adicionando arquivos..." -ForegroundColor Cyan
git add .

# Verificar se há arquivos para commitar
$status = git status --porcelain
if (-not $status) {
    Write-Host "Nada para commitar!" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "Arquivos modificados:" -ForegroundColor Cyan
    git status --short

    Write-Host ""
    Write-Host "4. Digite a mensagem do commit:" -ForegroundColor Yellow
    $commitMsg = Read-Host

    if ([string]::IsNullOrWhiteSpace($commitMsg)) {
        $commitMsg = "Initial commit - SantaFé Market"
    }

    git commit -m $commitMsg
}

# Push
Write-Host ""
Write-Host "Enviando para o GitHub..." -ForegroundColor Cyan
git push -u origin main

Write-Host ""
Write-Host "=== Concluído! ===" -ForegroundColor Green
Write-Host "Seu projeto está no GitHub: $repoUrl" -ForegroundColor White
Write-Host ""
Write-Host "Próximo passo: Configure o Vercel para fazer deploy automático" -ForegroundColor Yellow
Write-Host "1. Acesse: https://vercel.com" -ForegroundColor White
Write-Host "2. Import from GitHub" -ForegroundColor White
Write-Host "3. Selecione o repositório" -ForegroundColor White
Write-Host "4. Configure as variáveis de ambiente no Vercel" -ForegroundColor White
Write-Host ""

Read-Host "Pressione Enter para sair"