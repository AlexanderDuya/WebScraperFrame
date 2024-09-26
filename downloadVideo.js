const puppeteer = require('puppeteer');
const fs = require('fs');
const https = require('https');
const readline = require('readline');

// Function to download file
const downloadFile = (url, filepath) => {
  const file = fs.createWriteStream(filepath);
  https.get(url, (response) => {
    response.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log('Download Completed');
    });
  });
};

// Create readline interface to capture user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Ask the user to input their Frame.io link
rl.question('Please enter your Frame.io link: ', async (videoUrl) => {
  if (!videoUrl) {
    console.log('No link provided. Exiting...');
    rl.close();
    return;
  }

  try {
    // Launch Puppeteer
    const browser = await puppeteer.launch({ headless: true }); // Set headless to false if you want to see the browser
    const page = await browser.newPage();

    // Navigate to the provided Frame.io link
    await page.goto(videoUrl, { waitUntil: 'networkidle2' });

    // Wait for the video tag and extract the .mp4 source URL
    const videoSrc = await page.evaluate(() => {
      const videoTag = document.querySelector('video');
      return videoTag ? videoTag.src : null;
    });

    if (videoSrc) {
      console.log('Video Source Found:', videoSrc);
      const filepath = './video.mp4';
      downloadFile(videoSrc, filepath); // Download the video to the current directory
    } else {
      console.log('No video source found.');
    }

    await browser.close();
  } catch (error) {
    console.error('Error occurred:', error);
  } finally {
    rl.close();
  }
});
