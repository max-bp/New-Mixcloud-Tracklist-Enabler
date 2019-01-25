# Mixcloud-Tracklist-Enabler v2
It's new javascript - it displays the tracklist the same way it did before they changed their licensing. 

It supports the new Mixcloud website for **2019 year**

Make link in your quick link bar and change URL of this link to this code:
```
javascript:(function()%7Bvar rnd %3D Math.floor(Math.random()*9999999999)%3Bmcrape%3Ddocument.createElement(%27SCRIPT%27)%3Bmcrape.type%3D%27text/javascript%27%3Bmcrape.id%3D%27nssc-script%27%3Bmcrape.src%3D%27https://cdn.jsdelivr.net/gh/max-bp/New-Mixcloud-Tracklist-Enabler/mix.js%3F%27%2Brnd%3Bvar nsscs%3Ddocument.getElementById(%27nssc-script%27)%3Bif (nsscs %3D%3D null)%7Bdocument.getElementsByTagName(%27head%27)%5B0%5D.appendChild(mcrape)%3B%3B%7D%7D)()%3B")
```

## Thanks
 - [mrbrainz](https://github.com/mrbrainz) for original script version :heart:
