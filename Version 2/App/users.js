var bcrypt = require('bcrypt-nodejs');

/* The UsersDAO must be constructed with a connected database object */
function UsersDAO(db) {
    "use strict";

    /* If this constructor is called without the "new" operator, "this" points
     * to the global object. Log a warning and call it correctly. */
    if (false === (this instanceof UsersDAO)) {
        console.log('Warning: UsersDAO constructor called without "new" operator');
        return new UsersDAO(db);
    }

    var users = db.collection("user");

    this.addUser = function(firstName, lastName, emailAddress, password, radio, latitude, longitude, callback) {
        "use strict";
        // Generate password hash
        var salt = bcrypt.genSaltSync();
        var password_hash = bcrypt.hashSync(password, salt);

        // Create user document
        var user = {'_id': emailAddress, 'firstName': firstName, 'lastName': lastName, 'password': password_hash, 'truckOwner': radio, 'latitude': latitude, 'longitude': longitude};

		users.insert(user, function(err, result){
			callback(err, user);
		});

    }

    this.validateLogin = function(username, password, callback) {
        "use strict";

		users.findOne({ '_id' : username }, function(err, user) {
            "use strict";

            if (err) return callback(err, null);

            if (user) {
                if (bcrypt.compareSync(password, user.password)) {
                    callback(null, user);
                }
                else {
                    var invalid_password_error = new Error("Invalid password");
                    // Set an extra field so we can distinguish this from a db error
                    invalid_password_error.invalid_password = true;
                    callback(invalid_password_error, null);
                }
            }
            else {
                var no_such_user_error = new Error("User: " + user + " does not exist");
                // Set an extra field so we can distinguish this from a db error
                no_such_user_error.no_such_user = true;
                callback(no_such_user_error, null);
            }
        });
		}

}

module.exports.UsersDAO = UsersDAO;
