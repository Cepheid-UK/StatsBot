// command for starting an open challenge

// DB has 4 columns:
//    - id bigint NOT NULL PRIMARY KEY AUTO_INCREMENT,
//    - gametype int NOT NULL DEFAULT "1",
//    - discord_id char(128) NOT NULL,
//    - time_of_challenge datetime NOT NULL);

exports.run = (client, message, args, connection) => {
    
    var TIMER = 1 * 5 * 1000; // 30 minutes in milliseconds - set to 5 sec for testing

    var gametype = 1;
    var discord_id = message.author.tag;
    var datetime = new Date();
    var time_of_challenge = datetime.toISOString();
    
    // convert ISO datetime string to SQL datetime format
    time_of_challenge = time_of_challenge.replace("Z","");
    time_of_challenge = time_of_challenge.replace("T"," ");
    
    var challengeCloses = datetime.valueOf + TIMER;

    var sql = 'SELECT * FROM active_games WHERE player1=\'' + discord_id + '\' OR player2=\'' + discord_id + '\'';
    var sql_challenge = 'SELECT * FROM open_challenges WHERE discord_id=\'' + discord_id + '\'';

    // query active_games to ensure the player has no active games open
    connection.query(sql, function (err, result) {
        if (err) throw err;
        queryResult = result
        console.log(sql)
        console.log(result)
        

        // first check if the player has any active games
        if (queryResult.length === 0) {
            connection.query(sql_challenge, function (err, result) {
                if (err) throw err;
                console.log(sql_challenge)
                console.log(result)
                var queryResult2 = result;
                
                // then check if the player has any open challenges
                if (queryResult2.length === 0) {
                    // no active games and no open challenges - create a new one
                    var sql_createOpenChallenge = 'INSERT INTO open_challenges (discord_id,time_of_challenge) VALUES (\'' + discord_id + '\',\'' + time_of_challenge + '\');'
                    console.log(sql_createOpenChallenge); // debugging
                    // submit the query
                    connection.query(sql_createOpenChallenge, function (err, result) {
                        if (err) throw err;
                        console.log('Open challenge created by ' + discord_id)
                    })
                } else {
                    message.channel.send('You have an open challenge, please await a response to this challenge before opening another')
                }
            })
        } else {
            message.channel.send(`You have an active game currently open, please report on the result of this game to open another challenge`)
        }
    })
};