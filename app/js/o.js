const env = {
    API_BASE: 'https://api.krakenro.com/api/',
    STRIPE_PK:'pk_live_51H1YObCO8wZkPTwz0DmN4vtYWoZBzPOnSbzWUJJjs9LTySvPMn4dhAGeLfiW1fEuWUeScxfOsEYALdgfO5zjqHLt00htyjbiCs',
    HOME_WEBSITE: 'https://www.krakenro.com',
}

'use strict';

// browser check
if(typeof(Storage) === void(0)) {
    alert('Your browser is old and might compromise security! Please update your browser!');
    window.location.replace(env.HOME_WEBSITE);
}

var SESSION = 'kuser';
var submitBtn = null;
var submitBtnTxt = null;

(function($) {
$("form").submit(function() {
    event.preventDefault();
    event.stopPropagation();

    var successValidation = true;
    var form = $(this);

    // disable button
    submitBtn = form.find(":submit");
    submitBtnTxt = submitBtn.text();
    submitBtn.prop('disabled', true);
    submitBtn.text('Please wait...');

    // init display
    $('.kalerts').addClass('d-none');
    form.removeClass('was-validated');
    
    // check if theres a validation thing
    if (form.hasClass('my-login-validation')) {
        if (form[0].checkValidity() === false) {
          successValidation = false;
          form.addClass('was-validated');
        }
    }

    // else do what you need to do
    if (successValidation) {
       connect(form);
    }
});

var conf = {
    'login': {
        'url': 'auth/login',
        'require_access': false,
        'callback': cb_login,
    },
    'logout': {
        'url': 'auth/logout',
        'require_access': true,
        'callback': cb_logout,
    },
    'register': {
        'url': 'auth/register',
        'require_access': false,
        'callback': cb_register,
    },
    'forgot_pw': {
        'url': 'auth/forgot_password',
        'require_access': false,
        'callback': cb_forgot_pw,
    },
    'reset': {
        'url': 'auth/reset_password',
        'require_access': false,
        'callback': cb_reset,
    },
    // me
    'profile': {
        'url': 'user',
        'method': 'PATCH',
        'require_access': true,
        'callback': cb_profile,
    },
    'change_pw': {
        'url': 'auth/change_password',
        'method': 'POST',
        'require_access': true,
        'callback': cb_change_pw,
    },
    'support': {
        'url': 'user/support_ticket',
        'method': 'POST',
        'require_access': true,
        'callback': cb_support,
    },
    'donate': {
        'url': 'user/donate',
        'method': 'POST',
        'require_access': true,
        'callback': cb_donate,
    },
}

function connect(form) {
    var formData = form.serializeArray();
    var objectData = {};
    if (formData.length > 0) {
        formData.forEach((value, key) => {
            objectData[value['name']] = value['value']
        });
    }
    var id = form.attr('id');
    var session = null;

    // check if id exists and has config
    if (!id || !(id in conf)) return false;

    var item = conf[id];

    // check if requires token
    if (item.require_access) {
        session = getSession();
        if (!session) {

            window.location.href = "/";
        }
    }

    var settings = {
        "url": api(item.url),
        "method": ('method' in item) ? item.method : "POST",
        "timeout": 0,
        "headers": {
            "Authorization": "Bearer " + (session ? session.access_token : ''),
            "Content-Type": "application/json",
        },
        "data": (objectData ? JSON.stringify(objectData) : null),
    };

    $.ajax(settings)
    
    // success
    .done(function(data, txtStatus, xhr) {
        item.callback(data, txtStatus, xhr);

    // errors
    }).fail(function(xhr) {
        // not found
        if (xhr.status >= 400 && xhr.status <= 404) {
            // if requires token and response is 401
            if (xhr.status == 401 && item.require_access)
                cb_logout(); // or make a refresh?
            $('#nf_error').removeClass('d-none');

        // duplicate entry
        } else if (xhr.status == 409) {
            $('#dp_error').removeClass('d-none');

        // other errors
        } else {
            $('#sv_error').removeClass('d-none');
        }

    // always
    }).always(function() {
        if (submitBtn) {
            submitBtn.prop('disabled', false);
            submitBtn.text(submitBtnTxt);
        }
    });
}

// Callbacks
function cb_login(data, txtStatus, xhr) {
    if (!'access_token' in data) {
        cb_logout();
    }

    var settings = {
        "url": api("user"),
        "method": "GET",
        "timeout": 0,
        "headers": {
            "Authorization": "Bearer " + data.access_token
        },
        "processData": false,
        "mimeType": "multipart/form-data",
        "contentType": false
    };

    $.ajax(settings).done(function(user_data) {
        data['user'] = JSON.parse(user_data);
        setSession(data);
        window.location.href = "/me/dashboard";
    }).fail(function(xhr) {
        window.location.href = "/";
    });
}

function cb_logout() {
    localStorage.removeItem(SESSION);
    window.location.href = "/";
}

function cb_register() {
    $('#reg_form').addClass('d-none');
    $('#reg_success').removeClass('d-none');
}

function cb_forgot_pw() {
    $('#forgot_pw_form').addClass('d-none');
    $('#forgot_pw_success').removeClass('d-none');
}

function cb_reset() {
    $('#reset_form').addClass('d-none');
    $('#reset_success').removeClass('d-none');
}

function cb_profile(user_data) {
    let data = getSession();
    data['user'] = user_data;
    setSession(data);
    location.reload();
}

function cb_change_pw() {
    $('#change_pw_form').addClass('d-none');
    $('#change_pw_success').removeClass('d-none');
}

function cb_support() {
    $('#support_form').addClass('d-none');
    $('#support_success').removeClass('d-none');
}

function cb_donate(session_data) {
    var stripe = Stripe(env.STRIPE_PK);
    localStorage.setItem('stripe_session_id', session_data.session_id);
    stripe.redirectToCheckout({
        sessionId: session_data.session_id
    }).then(function (result) {
        localStorage.removeItem('stripe_session_id');
    });
}

// Utilities
function api(endpoint) {
    let api_base = env.API_BASE;
    if (location.hostname === "localhost" || location.hostname === "127.0.0.1")
        api_base = "http://localhost:8082/api/";

    return api_base + endpoint;
}

function getSession() {
    var session = localStorage.getItem(SESSION)
    if (!session) {
        return false;
    }

    // should check expiry here i think
    // code

    session = JSON.parse(session);
    return session;
}

function setSession(data) {
    var session = localStorage.setItem(SESSION, JSON.stringify(data))
}
})(jQuery);