const express = require('express');
const router = express.Router();
const User = require('../models/User.model');
const Session = require('../models/Session.model');
const bcryptjs = require('bcryptjs');
const saltRounds = 10;
const uploadCloud = require('../configs/cloudinary.config');

/** ----------------------------
POST	/auth/signup	username, password, campus, course	User created
 ----------------------------
*/
router.post('/signup', (req, res) => {
  console.log('/auth/signup => ', req.body);
  let { username, password, campus, course } = req.body;
  // console.log( ` ${username} , ${password} , ${} , ${}`)
  if (!username || !password || !campus || !course) {
    // 206 Partial Content
    return res
      .status(206)
      .json({ errorMessage: 'Mandatory fields are required!' });
  }

  // check for the password strength
  const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (regex.test(password)) {
    return res
      .status(200)
      .json({ errorMessage: 'Entered password is invalid' });
  }
  username = username.trim().toLowerCase();
  User.findOne({ username }).then((userFound) => {
    console.log('userFound: ', userFound);
    if (!userFound) {
      // get the password hash
      bcryptjs
        .genSalt(saltRounds)
        .then((resSalt) => bcryptjs.hash(password, resSalt))
        .then((passwordHash) => {
          console.log('passwordHash', passwordHash);
          User.create({ username, passwordHash, campus, course }).then(
            (userRecord) => {
              Session.create({ userId: userRecord._id, createdAt: Date.now() })
                .then((sessionFromDB) => {
                  res.status(200).json({
                    success: 'User created successfully',
                    accessToken: sessionFromDB._id,
                    userRecord,
                  });
                })
                .catch((error) => {
                  console.log('error-4');
                  if (error.code === 11000) {
                    console.log('error-2');
                    return res.status(200).json({
                      errorMessage:
                        'Username and email need to be unique. Either username or email is already used.',
                    });
                  }
                });
            }
          );
        });
    } else {
      // user alrady exits in the DB, so cannot create another user again.
      res.status(200).json({
        errorMessage: 'the username already been used',
      });
    }
  });
});

/** ----------------------------
POST	/auth/login	username, password	User logged
 ----------------------------
*/
router.post('/login', (req, res) => {
  console.log('route => /login: ', req.body);
  const { username, password } = req.body;

  // check whether username, password, eamil are empty or not
  if (!username || !password) {
    return res
      .status(200)
      .json({ errorMessage: 'Fields  Email, Password are mandatory!' });
  }

  User.findOne({ username })
    .then((userRecord) => {
      if (!userRecord) {
        return res
          .status(200)
          .json({ errorMessage: 'Username is not registered with the App' });
      }
      if (bcryptjs.compareSync(password, userRecord.passwordHash)) {
        Session.create({ userId: userRecord._id, createdAt: Date.now() }).then(
          (session) => {
            if (session) {
              return res
                .status(200)
                .json({ accessToken: session._id, userRecord });
            }
          }
        );
      } else {
        return res
          .status(200)
          .json({ errorMessage: 'Entered password is invalid' });
      }
    })
    .catch((error) => console.log(error));
});

/** ----------------------------
POST	/auth/upload	file	User updated
 ----------------------------
*/
router.post('/upload', uploadCloud.single('imageUrl'), (req, res) => {
  console.log(' auth/upload/profile-picture => ');
  console.log(req.file.path);
  return res.json(req.file.path);
  console.log(req.headers.accesstoken);

  Session.findById({ _id: req.headers.accesstoken })
    .then((sessionFromDB) => {
      User.findByIdAndUpdate(
        { _id: sessionFromDB.userId },
        { image: req.file.path },
        { new: true }
      ).then((resFromDB) => {
        console.log(resFromDB);
        return res
          .status(200)
          .json({ success: 'Picture updated successfully', resFromDB });
        //     return  res.status(200).json({resFromDB});
      });
    })
    .catch((err) =>
      res.status(200).json({ errorMessage: 'N active session for user' })
    );
});

/** ----------------------------
POST	/auth/edit	username, campus, course	User updated
 ----------------------------
*/
router.post('/edit', (req, res) => {
  console.log('/auth/edit =>', req.headers.accesstoken);
  console.log('/auth/edit =>', req.body);
  const { username, campus, course, profilePicture } = req.body;

  const object = {
    username: 'username',
    campus: 'remote',
    course: 'nespresso, wat else',
    emptyStuff: '',
  };

  const objectentries = [
    ['username', 'username'],
    ['campus', 'remote'],
    ['course', 'nespresso, wat else'],
    ['emptyStuff', ''],
  ];

  const objFilter = [
    ['username', 'username'],
    ['campus', 'remote'],
    ['course', 'nespresso, wat else'],
  ];

  const objectCleaned = {
    username: 'username',
    campus: 'remote',
    course: 'nespresso, wat else',
  };

  const body = Object.fromEntries(
    Object.entries(req.body).filter((el) => el[1])
  );

  Session.findById({ _id: req.headers.accesstoken })
    .then((sessionFromDB) => {
      if (sessionFromDB) {
        User.findByIdAndUpdate(sessionFromDB.userId, body, {
          new: true,
        }).then((userInfo) =>
          res.status(200).json({ success: 'user profile updated ', userInfo })
        );
      } else {
        return res.status(200).json({ errorMessage: 'session not updated ' });
      }
    })
    .catch((error) =>
      res.status(200).json({ errorMessage: 'Session is not active' })
    );
});

/**  ============================
 POST	/auth/logout		OK Message
 *   ============================
*/
router.delete('/logout/:id', (req, res) => {
  console.log('route => /logout: ', req.params);
  const { accessToken } = req.params;

  Session.findOne({ _id: accessToken })
    .then((session) => {
      console.log(' deleted session : ', session);
      return res.status(200).json({ success: 'User was logged out' });
    })
    .catch((error) => {
      console.log(' deleted session error : ', error);
      return res.status(500).json({ errorMessage: error });
    });
});

/**  ============================
 *          Validate session token Router
 *   ============================
 */
router.get('/loggedin/:accessToken', (req, res) => {
  const { accessToken } = req.params;
  Session.findById({ _id: accessToken })
    .populate('userId')
    .then((session) => {
      if (!session) {
        res.status(200).json({
          errorMessage: 'Session does not exist',
        });
      } else {
        res.status(200).json({
          session,
        });
      }
    })
    .catch((err) => res.status(500).json({ errorMessage: err }));
});

module.exports = router;
