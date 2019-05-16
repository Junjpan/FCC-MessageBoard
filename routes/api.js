/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var mongoose = require('mongoose');
var Board = require('../modules/Board');
var Reply = require('../modules/Reply');
var Thread = require('../modules/Thread');


require('dotenv').config();

const DB_CONNECTION_STING = process.env.DB;
mongoose.connect(DB_CONNECTION_STING, { useNewUrlParser: true }, (err, db) => {
  if (err) { throw err }
  console.log("Connected to DB...")
})

module.exports = function (app) {

  app.route('/api/threads/:board')
    .get((req, res) => {
      var boardTitle = req.params.board;
      var query = { "boardname": boardTitle }

      Thread.find(query,{reported:0,boardname:0,delete_password:0})
            .sort({"bumped_on":-1})
            .limit(10)
            .populate({path:"replies",options:{sort:{created_on:-1},limit:3},select:{'text':1, 'created_on':1}})
            .then((thread)=>res.json(thread))
            .catch(err=>console.log(err));

      /**
      Thread.find(query, (err, thread) => {
        if (err) { throw err }
        res.json(thread);
      })**/

    })
    .post((req, res) => {
      var boardTitle = req.params.board;
      var query = { "boardname": boardTitle }
      var thread = new Thread();
      thread.boardname = boardTitle;
      thread.text = req.body.text;
      thread.delete_password = req.body.delete_password;
      thread.save((err, data) => {
        if (err) { throw err }
        console.log(data);
        /** findOneAndUpdate require an opetion to return updated document,and the option is
         * MongdoDB shell:{returnNewDocument:true}
         * Mongoose {new:true}
         * Node.js MongoDB driver API: {returnOriginal:false}
         * upser:true mean creates a new document when no document matches the query criteria.
        */
        Board.findOneAndUpdate(query, { $push: { threads: data } }, { new: true, upsert: true }, (err, board) => {
          if (err) { throw err }
         // console.log(board);
          res.redirect('/b/' + boardTitle);
        })
      })
    })

    .put((req, res) => {
      var id=req.body.thread_id;
      console.log(id);
      Thread.findByIdAndUpdate(id,{$set:{"reported":true}},{new:true},(err,thread)=>{
        if (err){throw err}
        else{
          console.log(thread);
          return res.send('success')}
      })
    })

    .delete((req, res) => {
     // var board=req.body.board;
      var id=req.body.thread_id||req.body.report_id;
      var password=req.body.delete_password;
      
      Thread.findById(id,(err,thread)=>{
        if(err){throw err}
        if(thread.delete_password===password){
          Thread.remove({"_id":id},(err,thread)=>{
            if(err){throw err}
           return res.send("success")
          })
        }else{
          return res.send('incorrect password')
        }

      })
      
    })
    ;

  app.route('/api/replies/:board')
    .get((req, res) => {
    var board=req.params.board;
    var {thread_id}=req.query
    Thread.findById(thread_id,{reported:0,delete_password:0,boardname:0})//decide what thread JSON property is hiding.
          .populate({path:"replies",options:{sort:{created_on:-1}},select:{'text':1, 'created_on':1}})//"select:" here can decides what JSON property
          .then((thread)=>{
            res.json(thread)
          })
          .catch((err)=>{throw err});
       
    })
    .post((req, res) => {
      var board = req.params.board;
      var id = req.body.thread_id;
      var text = req.body.text;
      var password = req.body.delete_password;
      var query = { "boardname": board, "_id": id };

      var reply = new Reply();
      reply.text = text;
      reply.delete_password = password;
      reply.save((err, reply) => {
        console.log(reply);
        Thread.findOneAndUpdate(query, { $push: { "replies": reply }, $inc: { "replycount": 1 }, $set: { "bumped_on": reply.created_on } }, { new: true }, (err, thread) => {
          res.redirect('/b/' + board + '/' + id);
        })
      })



    })
    .put((req, res) => {
      var id=req.body.reply_id;
      console.log(id);
      Reply.findByIdAndUpdate(id,{$set:{"reported":true}},{new:true},(err,reply)=>{
        if (err){throw err}
        else{
          console.log(reply)
          return res.send('success')}
      })

    })
    .delete((req, res) => {
      var threadId=req.body.thread_id;
      var replyId=req.body.reply_id;
      var password=req.body.delete_password;

      Reply.findById(replyId,(err,reply)=>{
        if (reply.delete_password===password){
          reply.text="[deleted]";
          reply.save()
               .then(()=>{res.send('success')})
               .catch(err=>{throw err})
        }else{
          return res.send('incorrect password');
        }

      })


    });

};
