/**
 * Created by Waleska on 02.06.2015.
 */
var name, pass, passwordConfirmed;

function register() {
    try
    {
        $.couch.urlPrefix = "http://localhost:5984";
        getValues();
        checkNull();
        checkIfUserAlreadyExist(function(exists, data){
            if (exists) {
                window.alert(strings.registration.userExist);
                throw 'User already exists';
            }

            // work with data
            //console.log(data);
            // end work with data

            checkPasswordConfirmation();
            createUser();
            location.href = "http://localhost:63342/gruppe-1-storeme/server/webapp/dashboard.html";

            //TODO: secure Data transaction; maybe with https
        });

    }
    catch(err)
    {
    }
}

function keyHandler(e)
{
    var key = e.keyCode;
    if(key == 13) register();
}

function getValues()
{
    name = $('#username').val();
    pass = $('#password').val();
    passwordConfirmed = $('#confirmed-password').val();
}

//have to be changed if final DB is ready
function checkIfUserAlreadyExist(cbFn)
{
    var mapFunction = function (doc)
    {
        if(doc.username) {
            emit("username", doc.username);
        }
    };

    $.couch.db("storeme").query(mapFunction, "_count", "javascript", {
        success: function (data) {
            //console.log(data);
            var x = data["rows"];
            var i;
            for (i = 0; i < data["total_rows"]; i++) {
                if (x[i].value == name) {
                    cbFn(true);
                }
            }
            cbFn(false, data);
        },
        error: function (status) {
            console.log(status);
        },
        reduce: false
    });

}

function checkNull()
{
    if(!name) {
        window.alert(strings.registration.noUsername);
        throw "missing username";
    }
    else if(!pass)
    {
        window.alert(strings.registration.noPassword);
        throw "missing password"
    }
}

function checkPasswordConfirmation()
{
    if(pass != passwordConfirmed)
    {
        window.alert(strings.registration.passwordDontMatch);
        throw "Password doesn't match the confirmation";
    }
}

function createUser()
{
    var user =
    {
        _id: this.name,
        "type": "User",
        "username": this.name,
        "password": this.pass
    };
    $.couch.db("storeme").saveDoc(user, {
        success: function(data) {
            //console.log(data);
        },
        error: function(status) {
            console.log(status);
        }
    });
}
