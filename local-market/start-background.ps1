$ErrorActionPreference = "SilentlyContinue"
$projectPath = "C:\Users\home\Documents\pasta opensquad\squads\novo teste 4\local-market"

$nodeProcess = Start-Process -FilePath "node" -ArgumentList "server.js" -WorkingDirectory $projectPath -PassThru -WindowStyle Hidden

Start-Sleep -Seconds 2

if ($nodeProcess.HasExited) {
    Write-Host "ERRO ao iniciar servidor"
    exit 1
} else {
    Write-Host "Servidor iniciado com sucesso!"
    Write-Host "Acesse: http://localhost:3000"
}
