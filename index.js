const { json, send, sendError } = require("micro")
const cors = require("micro-cors")({
  allowHeaders: ["Content-Type", "query"],
  allowMethods: ["DELETE", "GET", "POST"],
})
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
  const parsed = await json(req)
  const { table } = qs.parse(req.url.split("?")[1])

  const mongoDb = await getMongoClient()

  if (req.method === "POST") {
    mongoDb
      .collection(table)
      .insertOne(parsed, { forceServerObjectId: true })
      .then(resp => send(res, 200, resp))
      .catch(err => {
        throw err
      })
  } else {
    mongoDb
      .collection(table)
      .find({})
      .limit(JSON.parse(req.headers.query).limit || 0)
      .toArray()
      .then(docs => send(res, 200, docs))
      .catch(err => {
        throw err
      })
  }
}

module.exports = cors(handler)
