var SESSION = 'kuser';
var session = localStorage.getItem(SESSION)
if (session) {
    window.location.href = "/me/dashboard";
}