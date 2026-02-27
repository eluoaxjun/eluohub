/**
 * configurator.js — Plugin Configurator
 * 체크박스 선택 → settings.json + 설치 커맨드 실시간 생성
 */

(function () {
  var form = document.getElementById('configurator-form');
  if (!form) return;

  var checkboxes = form.querySelectorAll('input[type="checkbox"][data-plugin]');
  var presetBtns = document.querySelectorAll('.preset-btn[data-preset]');
  var settingsOutput = document.getElementById('settings-output');
  var commandsOutput = document.getElementById('commands-output');
  var selectedCount = document.getElementById('selected-count');

  function getSelected() {
    var selected = [];
    checkboxes.forEach(function (cb) {
      if (cb.checked) selected.push(cb.getAttribute('data-plugin'));
    });
    return selected;
  }

  function generateSettingsJson(plugins) {
    var enabledPlugins = {};
    plugins.forEach(function (p) {
      enabledPlugins[p + '@eluo-hub'] = true;
    });

    var obj = {
      extraKnownMarketplaces: {
        'eluo-hub': {
          source: { source: 'github', repo: 'eluoaxjun/eluohub' }
        }
      },
      enabledPlugins: enabledPlugins
    };

    return JSON.stringify(obj, null, 2);
  }

  function generateCommands(plugins) {
    var lines = ['/plugin marketplace add eluoaxjun/eluohub', ''];
    plugins.forEach(function (p) {
      lines.push('/plugin install ' + p + '@eluo-hub');
    });
    return lines.join('\n');
  }

  function update() {
    var selected = getSelected();

    // settings.json
    if (settingsOutput) {
      settingsOutput.textContent = generateSettingsJson(selected);
    }

    // 설치 커맨드
    if (commandsOutput) {
      commandsOutput.textContent = generateCommands(selected);
    }

    // 선택 카운트
    if (selectedCount) {
      selectedCount.textContent = selected.length;
    }

    // 프리셋 버튼 활성 상태
    presetBtns.forEach(function (btn) {
      var presetId = btn.getAttribute('data-preset');
      var preset = PRESETS[presetId];
      if (!preset) return;

      var isMatch = preset.plugins.length === selected.length &&
        preset.plugins.every(function (p) { return selected.indexOf(p) !== -1; });
      btn.classList.toggle('is-active', isMatch);
    });
  }

  // 체크박스 변경
  checkboxes.forEach(function (cb) {
    cb.addEventListener('change', update);
  });

  // 프리셋 클릭
  presetBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var presetId = btn.getAttribute('data-preset');
      var preset = PRESETS[presetId];
      if (!preset) return;

      checkboxes.forEach(function (cb) {
        var pluginId = cb.getAttribute('data-plugin');
        if (pluginId === 'core') return; // core는 항상 체크
        cb.checked = preset.plugins.indexOf(pluginId) !== -1;
      });

      update();
    });
  });

  // 초기 렌더링
  update();
})();
