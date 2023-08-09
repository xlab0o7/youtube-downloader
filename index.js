const express = require('express');
const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;


const downloadFolder = path.join(__dirname, 'downloads');

app.get('/download', async (req, res) => {
  try {
    const videoUrl = req.query.url;
    const info = await ytdl.getInfo(videoUrl);
    const videoTitle = info.videoDetails.title.replace(/[^\w\s]/gi, '');
    const videoStream = ytdl(videoUrl);

    const filePath = path.join(downloadFolder, `${videoTitle}.mp4`);

    res.setHeader('Content-Disposition', `attachment; filename="${videoTitle}.mp4"`);
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
        //   fs.unlink(filePath, (error) => {
        //     if (error) {
        //       console.error('Error:', error);
        //     }
        //   });
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
