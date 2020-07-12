var SESSION = 'kuser';
var session = localStorage.getItem(SESSION);
if (!session) {
	// remember desired
	localStorage.setItem("me_url", window.location.href);
    window.location.href = "/";
} else {
	session = JSON.parse(session);
	
	// check for session validity
	check_session_validity();

	// if theres me url (this is from remembering url inside /me when directly accessed without current session)
	let me_url = localStorage.getItem("me_url");
	if (me_url) {
		localStorage.removeItem("me_url");
		window.location.replace(me_url);
	}

	// auto load values
	document.addEventListener("DOMContentLoaded", function(event) {
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
}

function check_session_validity() {
	var now = Math.round(new Date().getTime() / 1000.0);
	var expiry = session.expires_in_epoch;
	if (now >= expiry) {
		localStorage.removeItem(SESSION);
    	window.location.href = "/";
	}
}