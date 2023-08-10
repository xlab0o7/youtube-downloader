const express = require('express');
const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));


const downloadFolder = path.join(__dirname, 'downloads');
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
  });

// this is for youtube videos download into video / audio 

app.post('/submit-url', async (req, res) => {
  try {
    const videoUrl = req.body.videoUrl;
    const format = req.body.format; 

    const info = await ytdl.getInfo(videoUrl);
    const videoTitle = info.videoDetails.title.replace(/[^\w\s]/gi, '');

    let videoStream;
    let fileExtension;

    if (format === 'audio') {
      videoStream = ytdl(videoUrl, { filter: 'audioonly' });
      fileExtension = 'mp3';
    } else {
      videoStream = ytdl(videoUrl);
      fileExtension = 'mp4';
    }

    const filePath = path.join(downloadFolder, `${videoTitle}.${fileExtension}`);

    res.setHeader('Content-Disposition', `attachment; filename="${videoTitle}.${fileExtension}"`);
    videoStream.pipe(fs.createWriteStream(filePath));

    videoStream.on('progress', (chunkLength, downloaded, total) => {
      const percent = (downloaded / total) * 100;
      console.log(`Downloading: ${percent.toFixed(2)}%`);
    });

    videoStream.on('end', () => {
      console.log('Download complete!');
    });

    videoStream.on('error', (error) => {
      console.error('Error:', error);
      res.status(500).send('An error occurred');
    });

    videoStream.on('finish', () => {
      res.download(filePath, (error) => {
        if (error) {
          console.error('Error:', error);
          res.status(500).send('An error occurred');
        } else {
          console.log('File downloaded successfully!');
        }
      });
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('An error occurred');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
