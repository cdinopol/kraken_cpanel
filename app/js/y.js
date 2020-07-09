var SESSION = 'kuser';
var session = localStorage.getItem(SESSION);
if (!session) {
    window.location.href = "/";
}

document.addEventListener("DOMContentLoaded", function(event) { 
  	session = JSON.parse(session);
	document.querySelector('#user_username').innerHTML = session.user.username;
	document.querySelector('#user_email').innerHTML = session.user.email;
	
	// profile
	if (document.querySelector('#profile')) {
		document.querySelector('#username').value = session.user.username;
		document.querySelector('#created_at').value = session.user.created_at;
		document.querySelector('#lastlogin').value = session.user.lastlogin;
		document.querySelector('#email').value = session.user.email;
	}
});