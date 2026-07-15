function toggleDarkMode() {
    var currentTheme = document.documentElement.getAttribute('data-theme');
    var targetTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', targetTheme);
    localStorage.setItem('findit_theme', targetTheme);
    updateThemeIcon(targetTheme);
}

function updateThemeIcon(theme) {
    var icon = document.getElementById('themeToggleIcon');
    if (icon) {
        icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    }
}

// Immediate theme applying to avoid page flickering
(function initTheme() {
    var savedTheme = localStorage.getItem('findit_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
})();

document.addEventListener("DOMContentLoaded", function() {
    var savedTheme = localStorage.getItem('findit_theme') || 'light';
    updateThemeIcon(savedTheme);
});