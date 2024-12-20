@echo off
setlocal enabledelayedexpansion

rem Ausgabe-Datei festlegen
set output_file=backend.txt

rem Existierende Ausgabe-Datei löschen, falls sie bereits existiert
if exist %output_file% del %output_file%

rem Dateitypen festlegen, die zusammengefasst werden sollen
set extensions=.html .svelte .js .ts

rem Schleife über alle definierten Dateierweiterungen
for %%e in (%extensions%) do (
    rem Alle Dateien mit der aktuellen Erweiterung durchsuchen
    for /r %%f in (*%%e) do (
        rem Dateiinhalt zur Ausgabedatei hinzufügen
        echo %%f >> %output_file%
        type "%%f" >> %output_file%
        echo. >> %output_file%
    )
)

echo Dateien wurden erfolgreich zusammengefasst in %output_file%.
pause
