const https = require('https');

const options = {
  hostname: 'www.weddingwire.in',
  path: '/wedding-venues/mumbai',
  method: 'GET',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
  }
};

const req = https.request(options, (res) => {
  let data = '';
  console.log('Status Code:', res.statusCode);

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('HTML Length:', data.length);
    if (data.includes('vendor') || data.includes('venue')) {
      console.log('Success: Found vendor/venue keywords');
      const matches = data.match(/<h2[^>]*>(.*?)<\/h2>/g);
      if (matches) {
        console.log('Sample H2s:', matches.slice(0, 5));
      }
      
      const titleMatches = data.match(/<a class="vendorTile__title"[^>]*>(.*?)<\/a>/g);
      if (titleMatches) console.log('Titles:', titleMatches.slice(0, 5));
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.end();
