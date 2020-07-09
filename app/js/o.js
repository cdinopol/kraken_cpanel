'use strict';

// browser check
if(typeof(Storage) === void(0)) {
    alert('Your browser is old and might compromise security! Please update your browser!');
    window.location.replace('https://www.krakenro.com');
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

// Utilities
function api(endpoint) {
    return "http://localhost:8082/api/" + endpoint;
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