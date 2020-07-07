'use strict';

var SESSION = 'kuser';

(function($) {
    $("form").submit(function() {
        event.preventDefault();
        event.stopPropagation();

        var successValidation = true;
        var form = $(this);
        
        // check if theres a validation thing
        if (form.hasClass('my-login-validation')) {
            if (form[0].checkValidity() === false) {
              successValidation = false;
            }
            form.addClass('was-validated');
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
        'register': {
            'url': 'auth/register',
            'require_access': false,
        },
    }

    function connect(form) {
        var formData = form.serializeArray();
        var objectData = {};
        formData.forEach((value, key) => {
            objectData[value['name']] = value['value']
        });
        console.log(objectData)
        var id = form.attr('id');
        var session = null;

        // check if id exists and has config
        if (!id || !(id in conf)) return false;

        var item = conf[id];

        // check if requires token
        if (item.require_access) {
            session = getSession();
            if (!session) {
                return false
            }
        }

        var settings = {
            "async": false,
            "url": api(item.url),
            "method": ('method' in item) ? item.method : "POST",
            "timeout": 0,
            "headers": {
                //"Authorization": "Bearer " + (session ? session.access_token : ''),
                "Content-Type": "application/json",
            },
            "data": JSON.stringify(objectData),
        };

        $.ajax(settings).done(function(data, txtStatus, xhr) {
            item.callback(data, txtStatus, xhr);
        }).fail(function(data) {
            alert('Error');
        });
    }

    // Callbacks
    function cb_login(data, txtStatus, xhr) {
        console.log(data);
    }
})(jQuery);

function api(endpoint) {
    return "http://localhost:8082/api/" + endpoint;
}

function getSession() {
    var session = localStorage.getItem(SESSION)
    if (!session) {
        return false;
    }

    // should check expiry here i think

    return JSON.parse(session);
}

function setSession() {

}