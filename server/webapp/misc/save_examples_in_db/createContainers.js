/**
 * Created by Marcel on 10.06.2015.
 */


function saveStore() {
    try {
        //toDo string.link.dbConnection change to a local variable
        $.couch.urlPrefix = strings.link.dbConnection;
        var store = initStore();
        createStore(function(created){
            if(created){
                console.log("ist erstellt");
            } else {
                console.log("konnte nicht erstellt werden");
            }
        }, store);

    }
    catch(err) {
        console.log(err);
    }

};

function initStore(){
    var storage = new Container("Storage");
    var shelf1 = new Container("Shelf1");
    var shelf2 = new Container("Shelf2");

    storage.addSubContainer(shelf1);
    storage.addSubContainer(shelf2);

    return storage;
};

function createStore(callBackFunction, container){

    $.couch.db("container").saveDoc(container, {
       success: function(data) {
           callBackFunction(true);
           console.log(data);
       },
        error: function(status) {
            console.log(status);
            callBackFunction(false);
        }
    });
};

function loadStore(){

/*

    var link = strings.link.dbConnection + "/container/_design/all/_view/all";
    $.get(link, function(data){
        console.log(data);
        objectString = data["rows"];
    });
*/

    $.couch.allDbs({
        success: function(data) {
            console.log(data);
        }
    });



}

// container/_design/all/_view/all
//saveStore();
loadStore();
