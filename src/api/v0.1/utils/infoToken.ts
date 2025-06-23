const jwt = require('jsonwebtoken');

const infoToken = (token: any) => jwt.verify(token, process.env.JWTTOKEN);
export default infoToken;