const bcrypt = require('bcryptjs');

module.exports = {
    register: async (req, res, next) => {
        let { username, password } = req.body;
        const db = req.app.get('db');
        let player = await db.find_player([username]);
        if (player[0]) {
            return res.status(200).send({
                loggedIn: false, message: 'Username already in use'
            })
        } else {
            let salt = bcrypt.genSaltSync(10);
            let hash = bcrypt.hashSync(password, salt)
            let createdPlayer = await db.create_player([username, hash]);
            req.session.user = { username: createdPlayer[0].username, id: createdPlayer[0].id }
            res.status(200).send({
                loggedIn: true, message: 'Register successful', username: player[0].username, id: player[0].id
            })
        }
    },
    login: async (req, res, next) => {
        let { username, password } = req.body;
        const db = req.app.get('db');
        let player = await db.find_player([username]);
        if (!player[0]) {
            return res.status(200).send({
                loggedIn: false, message: 'Username not found'
            })
        } 
        let result = bcrypt.compareSync(password, player[0].hash_value)
        if (result) {
            req.session.user = { username: player[0].username, id: player[0].id }
            return res.status(200).send({
                loggedIn: true, message: 'Login successful', username: player[0].username, id: player[0].id
            })
        } else {
            return res.status(200).send({
                loggedIn: false, message: 'Incorrect password'
            })
        }
    },
    getLeaderboard: (req, res) => {
        const db = req.app.get('db')

        db.get_leaderboard()
        .then( leaders => res.status(200).send(leaders))
        .catch ( error => {
            res.status(500).send('500 Error')
            console.log(error)
        })
    }
}