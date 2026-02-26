@echo off
:: Eluo Hub - Rules Sync
:: shared/rules/ → 각 플러그인의 rules/ 에 복사
:: shared/standards.md → 각 플러그인에 복사

echo [Eluo Hub] Rules sync started...

for %%P in (core planning design publish qa ops) do (
    if not exist "plugins\%%P\rules\" mkdir "plugins\%%P\rules"
    xcopy /Y /Q "shared\rules\*" "plugins\%%P\rules\" >nul 2>&1
    copy /Y "shared\standards.md" "plugins\%%P\standards.md" >nul 2>&1
    echo   - %%P: synced
)

echo [OK] Rules synced to all plugins
