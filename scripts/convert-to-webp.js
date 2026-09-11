const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const dir = path.join(__dirname, '../public/images');

fs.readdir(dir, (err, files) => {
  if (err) throw err;

  files.forEach(file => {
    if (file.endsWith('.png')) {
      const inputPath = path.join(dir, file);
      const outputPath = path.join(dir, file.replace('.png', '.webp'));

      sharp(inputPath)
        .webp({ quality: 80 })
        .toFile(outputPath)
        .then(() => {
          console.log(`Converted ${file} to WebP`);
          // Optionally delete the original PNG
          fs.unlinkSync(inputPath);
          console.log(`Deleted ${file}`);
        })
        .catch(err => {
          console.error(`Error processing ${file}:`, err);
        });
    }
  });
});
