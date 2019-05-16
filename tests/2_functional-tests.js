/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var Browser = require('zombie');
var assert = chai.assert;
var server = require('../server');
var Reply = require('../modules/Reply');
var Thread = require('../modules/Thread');
var Board = require('../modules/Board');


Browser.site = 'http://localhost:3000';
var browser = new Browser();


chai.use(chaiHttp);

suite('Functional Tests', function () {
  var id;

  beforeEach((done) => {
    return browser.visit('/b/test', done);
  })

  this.beforeAll((done) => {
    // you can use db.dropDatabase()as well to meet the same needs
    var query = { "boardname": "test" };
    Thread.remove({})
      .then(() => {
        Reply.remove({})
          .then(() => {
            Board.remove({}, (err) => {
              console.log("delete all data")
            });
          })
      });
    done();
  })

  suite('API ROUTING FOR /api/threads/:board', function () {
    
    suite('POST', function () {
      test('api/threads/test', (done) => {
        chai.request(server)
          .post('/api/threads/test')
          .send({
            'text': "abc",
            "delete_password": "abc"
          })
          .end(() => {
            Thread.findOne({ "text": "abc" }, (err, thread) => {
              if (err) {
                assert.fail();
                done();
              }
              else {
                console.log(thread);
                assert.equal(thread.text, "abc", "test was inserted");
                assert.equal(thread.delete_password, "abc");
                assert.equal(thread.boardname, "test");
                assert.isArray(thread.replies);
                done();
              }
            })
          })

      })

    });

    suite('GET', function () {
      test('api/threads/test', (done) => {
        chai.request(server)
          .get('/api/threads/test')
          .end((err, res) => {
            id = res.body[0]._id;
            //console.log("get id:"+id);
            assert.equal(res.status, 200);
            assert.property(res.body[0], "bumped_on");
            assert.property(res.body[0], "created_on");
            assert.property(res.body[0], "text");
            assert.property(res.body[0], "replycount");
            assert.isArray(res.body[0].replies);
            done();
          })
      })

    });


    suite('PUT', function () {
      test('report', (done) => {
        browser.pressButton('Report', () => {
          browser.assert.success();
          Thread.findOne({ "text": "abc" }, (err, thread) => {
            if (err) {
              assert.fail();
              done()
            } else {
              assert.isTrue(thread.reported);
              done();
            }
          })
        })
      })

    });

     
     /** move to the end 
    suite('DELETE', function () {

      test('delete', (done) => {
        chai.request(server)
          .delete('/api/threads/test')
          .send({
            "thread_id": id,
            "delete_password": "abc"
          })
          .end(() => {
            Thread.findById(id, (err, thread) => {
              if (err) {
                assert.fail();
                return done();
              } else {
                assert.isNull(thread);
                return done();
              }

            })
          })
        
      })
     
      
      
       
    });
    */

   });



  suite('API ROUTING FOR /api/replies/:board', function () {
    var replyid;
    
    suite('POST', function () {
      test("post", (done) => {
        console.log(id);
       chai.request(server)
          .post('/api/replies/test')
          .send({"thread_id":id,
                "text":"1234",
                "delete_password":"1234"
              })
          .end(()=>{
            Reply.findOne({"text":"1234"},(err,reply)=>{
              if(err){
                assert.fail();
                return done();
              } 
              assert.equal(reply.delete_password,"1234");
              done();
            })
          })   
      })

    });

    suite('GET', function () {
      test("get", (done) => {
       chai.request(server)
          .get('/api/replies/test?thread_id='+id)
          .end((err,res)=>{
            if (err){
              assert.fail();
              return done()
            }else{
            assert.equal(res.status,200)
            assert.equal(res.body.replycount,1)
            assert.equal(res.body.replies[0].text,"1234")
            replyid=res.body.replies[0]._id;
              done()
            }
          })
          
      })

    });

    suite('PUT', function () {
      test("put", (done) => {
        chai.request(server)
            .put('/api/replies/test')
            .send({"reply_id":replyid})
            .end(()=>{
              Reply.findById(replyid,(err,reply)=>{
                if (err){assert.fail();
                return done()}else{
                  assert.isTrue(reply.reported);
                  done();
                }
              })
            })
      })

    });

    suite('DELETE', function () {
      test("delete", (done) => {
       chai.request(server)
        .delete('/api/replies/test')
        .send({"reply_id":replyid,
        "delete_password": "1234"})
        .end(()=>{
          Reply.findById(replyid,(err,reply)=>{
            if (err){assert.fail();
            return done()}else{
              assert.equal(reply.text,"[deleted]");
              done();}
          
            })
          })
      })

    });

  });

  //Delete the threads
  suite('DELETE', function () {

    test('delete', (done) => {
      chai.request(server)
        .delete('/api/threads/test')
        .send({
          "thread_id": id,
          "delete_password": "abc"
        })
        .end(() => {
          Thread.findById(id, (err, thread) => {
            if (err) {
              assert.fail();
              return done();
            } else {
              assert.isNull(thread);
              return done();
            }

          })
        })
      
    })
   
    
    
     
  });

});
