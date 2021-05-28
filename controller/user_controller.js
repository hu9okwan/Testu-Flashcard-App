const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

const getUserByEmailIdAndPassword = async (email, password) => {
  
    let user = await prisma.user.findUnique({
        where: {email: email}
    });
    if (user) {
        if (isUserValid(user, password)) {
            return user;
        }
    }
    return null;
};

const getUserById = async (id) => {
    
  let user = await prisma.user.findUnique({
      where: {id: id}
  });

  if (user) {
    return user;
  }
  return null;
};

function isUserValid(user, password) {

  return user.password === password;
}

const registerUser = async (name, email, password) => {

    let userResult = await prisma.user.findUnique({
        where: {
            email: email
        }
    })

    if (userResult === null) {
        let user = await prisma.user.create({
            data: {
                name: name,
                email: email,
                password: password
            }
        })
        return user;
    }
    return null;
};


module.exports = {
  getUserByEmailIdAndPassword,
  getUserById,
  registerUser,
};
