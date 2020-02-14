const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongodb")
const conf = require("./config.json")
const mime = require("mime-types")
const now = new Date()
const fileUpload = require("express-fileupload")
//const multer = require("multer")
//const upload = multer({ dest: "upload/" })

const app = express()

app.use(fileUpload())
app.set("view engine", "pug")
app.set("views", "./views")

app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/xwww-   ***form-urlencoded
//app.use(upload.array())	// for parsing multipart/form-data

app.use(express.static("views"))

//serve first set of questions
app.get("/", function(req, res) {
  var start = getQsetInfo(conf.first_set) //first set of questions, ***put this in config file properties

  res.render("index", {
    settings: conf.input_size,
    customer_id: Math.random()
      .toString(36)
      .substr(2), //randomly generate customer id for the first set of questions
    q: start.questions,
    name: start.name
  })
})

//handle first set of questions
app.post("/", function(req, res) {
  var curr = req.body
  var cust_id = curr["customer_id"]
  var curr_Qset = curr["question_set"]
  var QandA = getQandAonly(curr) //just the question and answers returns without the customer_id and question_set field
  var next = getQandAmap(req.body["question_set"])
  var next_Qset = "thankyou" //default end page

  //prepare the next question set to serve
  if (next.q) {
    next_Qset = next.t[1][next.t[0].indexOf(QandA[next.q])]
  } else {
    if (next.t != "end") next_Qset = next.t
  }

  //save uploaded files if it exists
  if (req.files) {
    for (var key in req.files) {
      var f_ext = mime.extension(req.files[key].mimetype)
      var cur_fname = "./upload/[" + key + "]_[" + cust_id + "]." + f_ext
      console.log("QandA[" + removeSpaces(key) + "] = " + cur_fname)
      QandA[removeSpaces(key)] = cur_fname

      req.files[key].mv(cur_fname, function(err) {
        if (err) console.log("***ERROR: file not uplaoded")
      })
    }
  }

  //insert into database
  QandA["customer"] = cust_id
  QandA["timestamp"] = now

  insertDB(removeSpaces(curr_Qset), JSON.stringify(QandA), function(res) {
    console.log(res.result)
    console.log(QandA)
  })

  //determines next question set information and serve it
  if (next_Qset != "thankyou") {
    var start = getQsetInfo(next_Qset) //first set of questions, ***put this in config file properties
    res.render("index", {
      settings: conf.input_size,
      customer_id: cust_id,
      q: start.questions,
      name: start.name
    })
  } else {
    //list of emails to send here
    res.render("thankyou")
  }
})

//serve first set of questions
app.get("/result", function(req, res) {
  var collections = []
  var resultObj = {}
  listCollectionsDB(function(cur1) {
    cur1.forEach($ => {
      collections.push(addSpaces($.name))
    })
    resultObj["tables"] = collections
    printDB(removeSpaces(conf.first_set), {}, function(res1) {
      resultObj["customers"] = res1
      res.render("result", {
        result: resultObj
      })
    })
  })
})

app.get("/data", function(req, res) {
  var resultObj = { ID: req.query.id, name: addSpaces(req.query.table) }
  printDB(removeSpaces(req.query.table), { customer: req.query.id }, function(
    res1
  ) {
    resultObj["data"] = res1
    res.render("data", {
      table: resultObj
    })
  })
})

app.listen(3000)

/**
 * Functions
 */

function getQandAonly(mainObj) {
  console.log(mainObj)
  var tempObj = {}
  for (var key in mainObj) {
    console.log(key)
    console.log(mainObj[key])
    if (key != "customer_id" && key != "question_set") {
      tempObj[key] = mainObj[key]
    }
  }
  return tempObj
}

function getQandAmap(mainObj) {
  var target = "./views/question sets/" + removeSpaces(mainObj) + ".json"
  var nextQset = require(target)[0]
  var index = 1
  var questions = []
  var nextDeterminant = false //if false then just serve the available
  var next = []

  for (var key in nextQset) {
    questions = nextQset[key]
  }

  /*
  cycle through each question
  check each qustion for the number of map elements
  check if it has 0, 1, more than 1

  by default it will have no map elements
  search through questions and see the highest map element count.
	*/
  var indexof = -1
  var highest = 0

  questions.forEach(function(x, z) {
    if (x.map.length >= highest) {
      highest = x.map.length
      indexof = z
    }
  })

  if (highest == 1) {
    next = questions[indexof].map[0]
  } else if (highest > 1) {
    var nextAnswer = []
    var nextTarget = []
    nextDeterminant = questions[indexof].question

    questions[indexof].map.forEach(function(a, b) {
      nextTarget.push(a)
      nextAnswer.push(questions[indexof].answers[b])
    })
    next = [nextAnswer, nextTarget]
  } else {
    next = "thankyou"
  }

  return { q: nextDeterminant, t: next }
}

function getQsetInfo(file) {
  var qSet = require("./views/question sets/" + removeSpaces(file) + ".json")[0]
  var questionName = ""
  var questionSet = []

  for (var key in qSet) {
    if (qSet.hasOwnProperty(key)) {
      questionName = key
      questionSet = qSet[key]
    }
  }
  return { name: questionName, questions: questionSet }
}

function removeSpaces(string) {
  return string.replace(/ /g, "_").toLowerCase()
}
function addSpaces(string) {
  var string = string.replace(/_/g, " ").toLowerCase()
  return string.charAt(0).toUpperCase() + string.slice(1)
}

/**
 * Database Functions
 */

function insertDB(table, query, cb) {
  mongoose.connect(
    "mongodb://" + conf.hostname + ":" + conf.port + "/" + conf.database + "",
    function(err, db) {
      if (err) throw err
      db.collection(table).insert(JSON.parse(query), function(err, res) {
        // sample: { _id: 1, item: "chiop", qty: 20 }
        if (err) cb(err) //info about what went wrong
        if (res) cb(res) //the _id of new object if successful
      })
    }
  )
}
function printDB(table, query, cb) {
  mongoose.connect(
    "mongodb://" + conf.hostname + ":" + conf.port + "/" + conf.database + "",
    function(err, db) {
      if (err) throw err
      db.collection(table)
        .find(query)
        .toArray(function(err, res) {
          // sample: { _id: 1, item: "chiop", qty: 20 }
          if (err) cb(err) //info about what went wrong
          if (res) cb(res) //the _id of new object if successful
        })
    }
  )
}

function listCollectionsDB(cb) {
  mongoose.connect(
    "mongodb://" + conf.hostname + ":" + conf.port + "/" + conf.database + "",
    function(err, db) {
      if (err) throw err
      db.listCollections().toArray(function(err, collections) {
        if (err) cb(error)
        else cb(collections)
      })
    }
  )
}
