/**
 * Created by Marcel on 17.06.2015.
 */
var cradle = require('cradle');
var stringsFile = require('../webapp/string/strings.js');
var dbSettings = require('./dbSettings.js');

/**
 * Get all needed databases by reading the database object from strings.js
 * Iterate through all databases and create a new cradle connection
 *
 * @function
 * @author Marcel Gross
 */
exports.prepareDB = function(){
    for(var name in stringsFile.database){
        var tempDb = new(cradle.Connection)(dbSettings.url, dbSettings.port).database(stringsFile.database[name]);
        initDB(stringsFile.database[name], tempDb, function(created){
            if(created){
                while(!created){
                }
            }
        });
    }
};

/**
 * Checks if database exists, if not create database
 *
 * @function
 * @param {String} dbName                          - Name of the database to be initialised
 * @param {cradle.Connection} cradleConnection     - Connection to the database
 * @param {Function} callbackFunction              - Necessary callbackFunction
 * @author Marcel Gross
 */
var initDB = function(dbName, cradleConnection, callbackFunction ) {
    cradleConnection.exists(function(error,exists){
        if(error){
            console.log('error', error);
            callbackFunction(true);
        }
        else if(exists){
            console.log('Connected to database '+ dbName);
            callbackFunction(true);
        }
        else{
            console.log('Database '+ dbName +' doesn\'t exist. Create...');
            cradleConnection.create(function(error){
                if(error){
                    console.log(error);
                    callbackFunction(true);
                }
                else{
                    console.log('Database '+ dbName + ' created');
                    callbackFunction(true);
                }
            })
        }
    })
};
