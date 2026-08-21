@echo off
echo Iniciando o Cliente (Project Velocity - Singleplayer)...
start cmd.exe /c "cd /d %~dp0client && npm run dev"

echo Tudo pronto! O navegador deve abrir automaticamente ou voce pode acessar a URL indicada na janela preta.
pause
