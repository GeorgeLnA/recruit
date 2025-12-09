import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { handleDemo } from "./routes/demo";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Serve video files with explicit range request handling
  app.get('/vids/*', (req, res, next) => {
    const filePath = path.join(__dirname, "../public", req.path);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      
      // Validate range
      if (start >= fileSize || end >= fileSize || start < 0 || end < start) {
        // Invalid range - return full file
        res.status(200);
        res.setHeader('Content-Type', 'video/webm');
        res.setHeader('Content-Length', fileSize);
        res.setHeader('Accept-Ranges', 'bytes');
        const stream = fs.createReadStream(filePath);
        stream.pipe(res);
        return;
      }

      // Valid range - return partial content
      res.status(206);
      res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Content-Length', chunksize);
      res.setHeader('Content-Type', 'video/webm');
      
      const stream = fs.createReadStream(filePath, { start, end });
      stream.pipe(res);
    } else {
      // No range requested - return full file
      res.status(200);
      res.setHeader('Content-Type', 'video/webm');
      res.setHeader('Content-Length', fileSize);
      res.setHeader('Accept-Ranges', 'bytes');
      const stream = fs.createReadStream(filePath);
      stream.pipe(res);
    }
  });

  // Serve static files from public directory (for non-video files)
  app.use(express.static(path.join(__dirname, "../public"), {
    // Enable range requests
    acceptRanges: true,
    // Set proper cache headers
    maxAge: "1y",
  }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  return app;
}
