/* Shared theme switcher (mirrors NrkdChitoryu.Web/wwwroot/js/site.js) */
function setTheme(theme) {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-bs-theme', theme === 'dark' ? 'dark' : 'light');
    document.querySelectorAll('.theme-btn').forEach(function (btn) {
        btn.classList.toggle('active', btn.dataset.theme === theme);
    });
}

document.addEventListener('DOMContentLoaded', function () {
    var t = localStorage.getItem('theme') || 'normal';
    document.querySelectorAll('.theme-btn').forEach(function (btn) {
        btn.classList.toggle('active', btn.dataset.theme === t);
    });
});
