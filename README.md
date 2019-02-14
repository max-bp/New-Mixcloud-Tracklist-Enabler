# Mixcloud-Tracklist-Enabler v2
It's new javascript - it displays the tracklist at mixcloud the same way it did before they changed their licensing. 

It supports the new Mixcloud website for **2019 year**

Make link in your quick link bar and change URL of this link to this code:
```
javascript:(function(){var rnd = Math.floor(Math.random()*9999999999);mcrape=document.createElement('SCRIPT');mcrape.type='text/javascript';mcrape.id='nssc-script';mcrape.src='https://cdn.jsdelivr.net/gh/max-bp/New-Mixcloud-Tracklist-Enabler@7857c704007a9cf8fb00527d1b390907369cc7ae/mix.js?'+rnd;var nsscs=document.getElementById('nssc-script');if (nsscs == null){document.getElementsByTagName('head')[0].appendChild(mcrape);;}})();
```

**Note!**

From time to time, Mixcloud changes the structure of the site, so the code stops working. In this case, you need to go here and copy the new code into the quick link.

## Thanks
 - [mrbrainz](https://github.com/mrbrainz) for original script version :heart:
