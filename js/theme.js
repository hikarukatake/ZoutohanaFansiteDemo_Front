// CSS変数を書き換える関数
function setThemeVariable(varName, value) {
    document.documentElement.style.setProperty(varName, value);
}


function setLightTheme() {
    setThemeVariable('--main-color', '#2DB584');
    setThemeVariable('--back-color', '#FFFCF9');
    setThemeVariable('--font-normal', '#535353');
    setThemeVariable('--text-white-color', '#F8F8F8');
}
