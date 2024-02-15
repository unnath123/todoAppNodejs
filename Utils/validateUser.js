
const validateUser = ({name, email, username, password}) =>{
    return new Promise((resolve, reject)=>{

        if (!name || !username || !email || !password)
            reject("Missing credentials");

        if (typeof name !== "string") reject("Name is not a string");
        if (typeof username !== "string") reject("username is not a string");
        if (typeof email !== "string") reject("email is not a string");
        if (typeof password !== "string") reject("password is not a string");

        resolve()
    })
}
module.exports = {validateUser}