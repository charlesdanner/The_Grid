const db = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const uuidv1 = require("uuid/v1");

module.exports = {
  requestFriend: (req, res) => {
    const requestData = JSON.parse(JSON.stringify(req.body));
    jwt.verify(req.token, process.env.JWT, (err, authData) => {
      if (err) {
        res.sendStatus(403);
      } else {
        db.Profile.find({ userName: req.body.receiver }).then(result => {
          //if the other user has already sent a request to the client w/o the client knowing...
          if (result[0].sentFriendRequests.includes(req.body.sender)) {
            const newFriendList = [...result[0].friendList, req.body.sender];
            const newSentRequests = result[0].sentFriendRequests.filter(
              request => request !== req.body.sender
            );
            db.Profile.findOneAndUpdate(
              { userName: req.body.receiver },
              {
                $set: {
                  sentFriendRequests: newSentRequests,
                  friendList: newFriendList
                },
                $push: {
                  updates: {
                    id: uuidv1(),
                    update: `${req.body.sender} is now your friend`,
                    userInvolved: req.body.sender,
                    type: "friend request",
                    viewed: false
                  }
                }
              }
            ).then(
              db.Profile.find({ userName: req.body.sender }).then(result => {
                const friendList = [...result[0].friendList, req.body.receiver];
                const sentFriendRequests = result[0].sentFriendRequests;
                const receivedFriendRequests = result[0].receivedFriendRequests.filter(
                  request => request !== req.body.receiver
                );
                db.Profile.findOneAndUpdate(
                  { userName: req.body.sender },
                  {
                    $set: {
                      receivedFriendRequests: receivedFriendRequests,
                      friendList: friendList
                    }
                  }
                ).then(result => {
                  res.json({
                    sentFriendRequests,
                    friendList,
                    receivedFriendRequests
                  });
                });
              })
            );
          } else {
            //otherwise simply push to the arrays and send the new sentRequests array back to client
            db.Profile.findOneAndUpdate(
              { userName: req.body.receiver },
              {
                $push: {
                  receivedFriendRequests: req.body.sender,
                  updates: {
                    id: uuidv1(),
                    update: `${req.body.sender} sent you a friend request`,
                    userInvolved: req.body.sender,
                    type: "friend request",
                    viewed: false
                  }
                }
              }
            ).then(result => {
              db.Profile.findOneAndUpdate(
                { userName: req.body.sender },
                { $push: { sentFriendRequests: req.body.receiver } },
                { new: true }
              ).then(result => {
                res.json({
                  receivedFriendRequests: result.receivedFriendRequests,
                  friendList: result.friendList,
                  sentFriendRequests: result.sentFriendRequests
                });
              });
            });
          }
        });
      }
    });
  },
  removeFriend: (req, res) => {
    jwt.verify(req.token, process.env.JWT, (err, authData) => {
      if (err) {
        res.sendStatus(403);
      } else {
        const requester = req.body.sender;
        const accepter = req.body.receiver;

        db.Profile.find({ userName: accepter }).then(result => {
          const newFriendList = result[0].friendList.filter(
            friend => friend !== requester
          );
          db.Profile.findOneAndUpdate(
            { userName: accepter },
            { $set: { friendList: newFriendList } }
          ).then(result => {
            db.Profile.find({ userName: requester }).then(result => {
              const friendList = result[0].friendList.filter(
                friend => friend !== accepter
              );
              db.Profile.findOneAndUpdate(
                { userName: requester },
                {
                  $set: {
                    friendList: result[0].friendList.filter(
                      friend => friend !== accepter
                    )
                  }
                }
              ).then(result => {
                const receivedFriendRequests = result.receivedFriendRequests.filter(
                  request => request !== accepter
                );
                const sentFriendRequests = result.sentFriendRequests;
                res.json({
                  receivedFriendRequests,
                  friendList,
                  sentFriendRequests
                });
              });
            });
          });
        });
      }
    });
  },
  acceptFriend: (req, res) => {
    const accepter = req.body.sender;
    const requester = req.body.receiver;
    jwt.verify(req.token, process.env.JWT, (err, authData) => {
      if (err) {
        res.sendStatus(403);
      } else {
        db.Profile.find({ userName: requester }).then(result => {
          const oldFriendRequests = result[0].sentFriendRequests;
          const newFriendRequests = oldFriendRequests.filter(
            request => request !== accepter
          );
          friendList = [...result[0].friendList, accepter];
          db.Profile.findOneAndUpdate(
            { userName: requester },
            {
              $set: {
                sentFriendRequests: newFriendRequests,
                friendList: friendList
              },
              $push: {
                updates: {
                  id: uuidv1(),
                  update: `${accepter} is now your friend`,
                  userInvolved: accepter,
                  type: "friend request",
                  viewed: false
                }
              }
            }
          ).then(result => {
            db.Profile.find({ userName: accepter }).then(result => {
              const oldFriendRequests = result[0].receivedFriendRequests;
              const receivedFriendRequests = oldFriendRequests.filter(
                request => request !== requester
              );
              const friendList = [...result[0].friendList, requester];
              const sentFriendRequests = result[0].sentFriendRequests;
              db.Profile.findOneAndUpdate(
                { userName: accepter },
                {
                  $set: {
                    friendList: friendList,
                    receivedFriendRequests: receivedFriendRequests
                  },
                  $push: {
                    updates: {
                      id: uuidv1(),
                      update: `${requester} is now your friend`,
                      userInvolved: requester,
                      type: "friend request",
                      viewed: false
                    }
                  }
                }
              ).then(result =>
                res.json({
                  receivedFriendRequests,
                  friendList,
                  sentFriendRequests
                })
              );
            });
          });
        });
      }
    });
  },
  getUserProfile: (req, res) => {
    db.Profile.find({ userName: req.params.profile }).then(data =>{
        res.json({ data })
    }
    );
  },
  getProfile: (req, res) => {
    db.Profile.find({ userName: req.body.userName }).then(data =>
      res.json({ data })
    );
  },
  updateProfile: (req, res) => {
    db.Post.find({ userName: req.body.userName })
      .then(posts => {
        posts.forEach(async post => {
          await db.Post.update(
            { _id: post._id },
            { $set: { profileImg: req.body.profileIMG } }
          );
        });
        db.Comment.find({ userName: req.body.userName }).then(comments => {
          comments.forEach(async comment => {
            await db.Comment.update(
              { _id: comment._id },
              { $set: { profileIMG: req.body.profileIMG } }
            );
          });
        });
        db.Profile.updateOne(
          { userName: req.body.userName },
          {
            $set: {
              firstName: req.body.firstName,
              lastName: req.body.lastName,
              age: req.body.age,
              currentCity: req.body.currentCity,
              steamIGN: req.body.steamIGN,
              discordIGN: req.body.discordIGN,
              battleNetIGN: req.body.battleNetIGN,
              epicIGN: req.body.epicIGN,
              originIGN: req.body.originIGN,
              profileIMG: req.body.profileIMG,
              favGames: req.body.favGames
            }
          }
        )
          .then(data => res.json({ data }))
          .catch(err => console.log(err));
      })
      .catch(err => console.log(err));
  },
  getAllyList: (req, res) => {
    db.Profile.find({ userName: req.body.userName })
      .then(data => res.json(data[0].friendList))
      .catch(err => console.log(err));
  },
  getNotifications: (req, res) => {
    db.Profile.find({ userName: req.params.userName }).then(data => {
      const unReadNotifications = [];
      data[0].updates.forEach(update => {
        if (update.viewed === false) unReadNotifications.push(update);
      });
      res.json({ unReadNotifications });
    });
  },
  markNoteAsRead: (req, res) => {
    db.Profile.find({ userName: req.body.user })
      .then(user => {
        const newNotifications = user[0].updates.filter(
          update => update.id !== req.body.notification
        );
        db.Profile.updateOne(
          { userName: req.body.user },
          { $set: { updates: newNotifications } }
        )
          .then(res.json({ newNotifications }))
          .catch(err => console.log(err));
      })
      .catch(err => console.log(err));
  },
  searchForUsers: (req, res) => {
    const input = req.params.searchQuery;
    db.Profile.find({ userName: new RegExp(input, "i") }).then(users => {
      const searchResults = users.map(user => {
        return {
          _id: user._id,
          userName: user.userName,
          profileImage: user.profileIMG
        };
      });
      res.json(searchResults);
    });
  }
};
