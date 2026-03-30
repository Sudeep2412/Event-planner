const https = require('https');

const options = {
  hostname: 'html.duckduckgo.com',
  path: '/html/?q=wedding+decorators+in+mumbai',
  method: 'GET',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (c) => data += c);
  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    const titleObj = data.match(/<a class="result__url" href="[^"]*">(.*?)<\/a>/g);
    if (titleObj) {
      console.log('Results:', titleObj.slice(0, 5));
    } else {
      console.log('No results matched. Length:', data.length);
    }
  });
});
req.end();
