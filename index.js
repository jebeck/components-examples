const { json, send, sendError } = require("micro")
const cors = require("micro-cors")({ allowHeaders: ["query"] })
const MongoClient = require("mongodb").MongoClient
const qs = require("qs")

const { DB_USER, DB_PWD } = process.env
const url = `mongodb://${DB_USER}:${DB_PWD}@ds151612.mlab.com:51612/components-examples`

let db

async function getMongoClient() {
  if (db) {
    return db
  } else {
    db = await MongoClient.connect(url)
      .then(client => {
        console.log("Connected to Mongo!")
        return client.db("components-examples")
      })
      .catch(err => {
        console.error(err)
      })
    return db
  }
}

const handler = async (req, res) => {
  const { table } = qs.parse(req.url.split("?")[1])

  const mongoDb = await getMongoClient()

  mongoDb
    .collection(table)
    .find({})
    .limit(JSON.parse(req.headers.query).limit || 0)
    .toArray()
    .then(docs => send(res, 200, docs))
    .catch(sendError)
}

module.exports = cors(handler)
