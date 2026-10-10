import {test} from 'node:test';import assert from 'node:assert/strict';
test('restores Cloudflare email spans without runtime scripts and strips inactive forms',async()=>{
 const {prepareContent}=await import('../scripts/lib/content.mjs');
 const html=prepareContent('<p>Email <a href="/cdn-cgi/l/email-protection" data-cfemail="d1a3baa5e791a1a2a4ffb4b5a4">[email protected]</a></p><script>bad()</script><form>Submit</form>');
 assert.ok(html.includes('rkt6@psu.edu'));assert.ok(!html.includes('cdn-cgi'));assert.ok(!html.includes('<script'));assert.ok(!html.includes('<form'));
});
