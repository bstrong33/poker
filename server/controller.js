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
            let stats = await db.create_player_stats([createdPlayer[0].id])
            res.status(200).send({
                loggedIn: true, message: 'Register successful', username: createdPlayer[0].username, id: createdPlayer[0].id
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
    },
    getPersonal: (req, res) => {
        const db = req.app.get('db')
        const personalId = req.params.id

        db.get_personal([personalId])
        .then( stats => res.status(200).send(stats))
        .catch ( error => {
            res.status(500).send('500 Error')
            console.log(error)
        })
    },
    updateStats: (req, res) => {
        let {moneyMade, id} = req.body;
        const db = req.app.get('db');
        console.log('updated stats', moneyMade, id)
        if (moneyMade >= 0) {
            db.update_stats_add([id, moneyMade])
            .then( () => {res.sendStatus(200)})
            .catch( error => {
                res.status(500).send('500 Error')
                console.log(error)
            })
        } else if (moneyMade < 0) {
            let absolute = Math.abs(moneyMade);
            db.update_stats_subtract([id, absolute])
            .then( () => {res.sendStatus(200)})
            .catch( error => {
                res.status(500).send('500 Error')
                console.log(error)
            })
        }
    },
    deleteAccount: (req, res) => {
        const db = req.app.get('db');
        const deleteId = req.params.id;

        db.delete_account([deleteId])
        .catch( error => {
            res.status(500).send('500 Error')
            console.log(error)
        })
    }
}