import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { mongoDbClient } from "./db/mongo.js";
import { FilterTransform } from "./pipes/parseData.pipe.js";
import httpServer from "http";
import { parse } from "csv-parse";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const server = httpServer.createServer();

server.on("request", async (req, res) => {
  if (req.url === "/") {
    const filePath = path.join(__dirname, "dataSource", "mock.csv");
    const stream = fs.createReadStream(filePath, "utf8");
    const records = [];

    const filter = new FilterTransform({
      writableObjectMode: true,
      readableObjectMode: true,
    });

    const csvStream = parse({
      delimiter: ",",
      trim: true,
      columns: true,
    });

    try {
      await mongoDbClient.connect();
      const db = mongoDbClient.db("bigData");
      const collection = db.collection("records");
      res.writeHead(200, { "Content-Type": "application/json" });
      stream
        .pipe(csvStream)
        .pipe(filter)
        .on("data", (chunk) => {
          records.push(chunk);
        })
        .on("end", async () => {
          const chunkSize = 100;
          for (let i = 0; i < records.length; i += chunkSize) {
            const chunk = records.slice(i, i + chunkSize);
            await collection.insertMany(chunk);
          }
          await mongoDbClient.close();
          res.end(
            JSON.stringify({
              status: "success",
              count_records: records.length,
            })
          );
        });
    } catch (error) {
      await mongoDbClient.close();
      res.end(
        JSON.stringify({
          status: "error",
          message: error.message,
        })
      );
    }
  }
});

server.listen(3000, () => {
  console.log("Server is listening on port 3000");
});
