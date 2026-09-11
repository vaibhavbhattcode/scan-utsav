const fs = require('fs');
const path = require('path');

const walkSync = function(dir, filelist) {
  files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      filelist = walkSync(path.join(dir, file), filelist);
    }
    else {
      filelist.push(path.join(dir, file));
    }
  });
  return filelist;
};

const allFiles = walkSync(path.join(__dirname, '../src'));
const exts = ['.ts', '.tsx', '.js', '.jsx', '.css'];

const toReplace = [
  'blog-qr-photo',
  'blog-wedding-4k',
  'blog-privacy-dpdp',
  'birthday-party',
  'logo-full',
  'logo-icon',
  'corporate-summit',
  'ganesh-chaturthi',
  'navratri-garba',
  'royal-wedding'
];

let filesModified = 0;

allFiles.forEach(file => {
  if (exts.some(ext => file.endsWith(ext))) {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    toReplace.forEach(name => {
      content = content.replace(new RegExp(`${name}\\.png`, 'g'), `${name}.webp`);
    });

    if (content !== original) {
      fs.writeFileSync(file, content, 'utf8');
      console.log(`Updated ${file}`);
      filesModified++;
    }
  }
});

console.log(`Done. Modified ${filesModified} files.`);
