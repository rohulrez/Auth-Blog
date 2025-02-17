const db = require('../data/database');
const bcrypt = require('bcryptjs');


class User {
constructor (email, password) {
    this.email = email,
    this.password = password
}

getUserWithSameEmail= async () => {
     const existingUser = await db
        .getDb()
        .collection('users')
        .findOne({email: this.email});

    return existingUser;
}

existsAlready = async () => {
    const existingUser = await this.getUserWithSameEmail();

    if(existingUser) {
       return !!existingUser
}};

signup = async () => {
    const hashedPassword = await bcrypt.hash(this.password, 9);

    const result = await db
        .getDb()
        .collection('users')
        .insertOne({
            email: this.email,
            password: hashedPassword
        });
        return result;

}

login = async (comparePassword) => {
     const passwordsAreEqual = await bcrypt.compare(
            this.password,
            comparePassword
        );
    return passwordsAreEqual;

}
};



module.exports = User