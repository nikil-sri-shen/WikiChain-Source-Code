import express from "express";
import { unixfs } from "@helia/unixfs";
import { createHelia } from "helia";
import { FsBlockstore } from "blockstore-fs";
import cors from "cors"; // Import the cors middleware
// import events from "events";
// events.EventEmitter.defaultMaxListeners = 20;
const app = express();
const port = 5000;

const blockstore = new FsBlockstore(
  "/Users/nikilsrishen/Personal/WIKICHAIN/PROJECTS/WikiChain/blockstore"
); // Replace with your desired directory path
const heliaPromise = createHelia({ blockstore });

app.use(express.json());
// app.use(cors());
app.use(
  cors({
    origin: "http://localhost:3000",
  })
); // Use the cors middleware to enable CORS

app.post("/store", async (req, res) => {
  const { content } = req.body;

  const helia = await heliaPromise;
  const fs = unixfs(helia);

  const bytes = Buffer.from(content, "utf-8");
  const cid = await fs.addBytes(bytes);
  console.log(cid);

  res.json({ cid: cid.toString() });
});

app.get("/retrieve/:cid", async (req, res) => {
  const { cid } = req.params;

  const helia = await heliaPromise;
  const fs = unixfs(helia);

  const decoder = new TextDecoder();
  let text = "";

  try {
    for await (const chunk of fs.cat(cid)) {
      text += decoder.decode(chunk, { stream: true });
    }
    res.send(text);
  } catch (error) {
    console.log(`Error retrieving data for CID "${cid}":`, error);
    res.status(500).send("Error retrieving data");
  }
});

app.post("/checkAvailability", async (req, res) => {
  const { cids } = req.body;

  if (!cids || !Array.isArray(cids)) {
    return res
      .status(400)
      .json({ error: "Invalid input: 'cids' must be an array." });
  }

  const helia = await heliaPromise;
  const fs = unixfs(helia);

  try {
    const missingCids = await Promise.all(
      cids.map(async (cid) => {
        try {
          let text = "";
          const decoder = new TextDecoder();

          // Try to retrieve data for each CID
          for await (const chunk of fs.cat(cid)) {
            text += decoder.decode(chunk, { stream: true });
          }

          // If the retrieved content is empty, consider the CID as missing
          if (!text) {
            return cid;
          }

          return null; // CID is available
        } catch (error) {
          // If an error occurs during retrieval, consider the CID as missing
          return cid;
        }
      })
    );

    // Filter out null values (available CIDs) and send only missing CIDs
    res.json({ missingCids: missingCids.filter((cid) => cid !== null) });
  } catch (error) {
    console.log("Error checking availability:", error);
    res.status(500).send("Error checking availability");
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
