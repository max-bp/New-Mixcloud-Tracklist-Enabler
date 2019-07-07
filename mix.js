var jqsrc = '//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js',
    onjQueryAvailable = function (oCallback) {
        if (typeof(jQuery) === 'function') {
            oCallback();
        } else {
            setTimeout(function () {
                window.onjQueryAvailable(oCallback);
            }, 50);

        }
    },
    all_tracks, track_id, slug, artist,
    showhidebutton = '',
    mixCloudEnabler=1,
    cleanArray = function (actual) {
        var newArray = [];
        for (var i = 0; i < actual.length; i++) {
            if (actual[i]) {
                newArray.push(actual[i]);
            }
        }
        return newArray;
    },

    getSectionData = function () {
        var thispath = window.location.pathname.split('/');
        slug = cleanArray(thispath);
        artist = decodeURIComponent(slug[0]);
        slug = decodeURIComponent(slug[1]);
        //getTrackId(artist, slug);
        getTrackId();
    },
    gmloadScript = function (sScriptSrc) {
        var oHead = document.getElementsByTagName('head')[0],
            oScript = document.createElement('script');
        oScript.type = 'text/javascript';
        oScript.src = sScriptSrc;
        oHead.appendChild(oScript);
    },
    fmtMSS = function (time) {
        var hrs = ~~(time / 3600);
        var mins = ~~((time % 3600) / 60);
        var secs = ~~time % 60;
        return ( hrs > 0 ? hrs + ':' : '') + (mins < 10 ? '0' + mins : mins) + ':' + (secs < 10 ? '0' + secs : secs);
    },
    formatTracks = function (trackdata) {
        var tracks = "",
            timeindexes = '',
            trackno = 1,
            showhidebutton = '',
            t = '';

        for (var track in trackdata) {
            starttime = (trackdata[track].startSeconds) ? trackdata[track].startSeconds : '';
            if (trackdata[track].__typename == "ChapterSection") {
                t = (trackdata[track].chapter == 'UNKNOWN') ? '&mdash;' : trackdata[track].chapter;
                tracks += '<tr style="border-bottom: 1px dotted #dce5e8;"><td><em>' + trackno + '</em>&nbsp;</td><td><b title="' + trackdata[track].chapter + '">' + t + '</b>&nbsp;</td><td align="right">' + fmtMSS(starttime) + '</td></tr>';
            } else {
                tracks += '<tr style="border-bottom: 1px dotted #dce5e8;"><td><em>' + trackno + '</em>&nbsp;</td><td><b title="' + trackdata[track].songName + '">' + trackdata[track].artistName + '</b> – ' + trackdata[track].songName + '&nbsp;</td><td align="right">' + fmtMSS(starttime) + '</td></tr>';
            }

            trackno++;
            timeindexes += (trackdata[track].start_time) ? trackdata[track].start_time + ', ' : '';
        }
        return tracks;
    }, insertMTEButton = function (trackhtml) {
        var brainzinsertionooo = '',
        showhidebutton = '<span id="btnListMax" class="btn btn-small btn-inverse btn-toggled brainz-mte" m-click="tracklistShown=!tracklistShown" ng-class="{\'btn-toggled\': tracklistShown}" style="margin-left: 10px;"><svg class="" xmlns="http://www.w3.org/2000/svg" width="19px" height="14px" viewBox="0 0 19 14" version="1.1"><path d="M6,2h12c0.6,0,1-0.4,1-1s-0.4-1-1-1H6C5.4,0,5,0.4,5,1S5.4,2,6,2z M18,12H6c-0.6,0-1,0.4-1,1s0.4,1,1,1h12\n\r    	c0.6,0,1-0.4,1-1S18.6,12,18,12z M1.5,0H1C0.4,0,0,0.4,0,1s0.4,1,1,1h0.5c0.6,0,1-0.4,1-1S2.1,0,1.5,0z M1.5,12H1c-0.6,0-1,0.4-1,1\n\r    	s0.4,1,1,1h0.5c0.6,0,1-0.4,1-1S2.1,12,1.5,12z M18,6H6C5.4,6,5,6.4,5,7l0,0c0,0.6,0.4,1,1,1h12c0.6,0,1-0.4,1-1l0,0\n\r    	C19,6.4,18.6,6,18,6z M1.5,6H1C0.4,6,0,6.4,0,7s0.4,1,1,1h0.5c0.6,0,1-0.4,1-1S2.1,6,1.5,6z"></path></svg><span ng-show="tracklistShown" class="">Hide </span><span ng-show="!tracklistShown" class="ng-hide">Show </span>tracklist</span>';


        brainzinsertionooo += '<div ng-init="tracklistShown=false;" id="trkListMax"><div class="tracklist-wrap" ng-show="tracklistShown"><div class="inner-container"><div class="content"><h1>Tracklist</h1><table width="100%" cellpadding=5>';

        brainzinsertionooo += trackhtml;

        brainzinsertionooo += '</table></div></div></div></div><style type="text/css">.star_ttime { display: none; } .showntimes .starttime { display: inline; } .showtimes {font-size:0.5em; text-transform:uppercase;color: #990000;text-decoration: none;float: right;} body .tracklist-wrap { top: auto; margin-bottom: 0;}</style>';

        $('footer.actions').append(showhidebutton);
        $('.show-header').after(brainzinsertionooo);

        $('.brainz-mte').click(function () {
            if (!$('.brainz-mte').hasClass('btn-toggled')) {
                $('.brainz-mte').addClass('btn-toggled');
                $('.brainz-mte span').toggleClass('ng-hide');
                $('.tracklist-wrap').removeClass('ng-hide');
            } else {
                $('.brainz-mte').removeClass('btn-toggled');
                $('.brainz-mte span').toggleClass('ng-hide');
                $('.tracklist-wrap').addClass('ng-hide');
            }
        });

        $('.showtimes').click(function () {
            if (!$('.tracklist-wrap').hasClass('showntimes')) {
                $('.tracklist-wrap').addClass('showntimes');
                $('.showtimes').text('Hide times');
            } else {
                $('.tracklist-wrap').removeClass('showntimes');
                $('.showtimes').text('Show times');
            }
        });

        return;
    };

// show places in navbar with named tracks
function setTrackDivs(len) {
    try {
        if ($('.player-already-open-message').length === 1 || $('.player-open') === 0) return; // mix navbar is not shown
        var all_div = [], skip_div = [], per = len / 100, to_ins = '';
        for (var track in all_tracks) {
            if (all_tracks[track].startSeconds || all_tracks[track].startSeconds === 0) {
                if (all_tracks[track].chapter && all_tracks[track].chapter == 'UNKNOWN') skip_div[all_div.length] = 1; // skip unknown parts
                all_div[all_div.length] = (parseInt(all_tracks[track].startSeconds) / per).toFixed(2);
            }
        }
        all_div[all_div.length] = 100; // last song end
        if (all_div.length < 3) return;
        for (var i = 0; i <= all_div.length - 1; i++) {
            if (skip_div[i] == 1) continue;
            to_ins = '<div style="position: absolute;left: ' + all_div[i] + '%;width: ' + (all_div[i + 1] - all_div[i]).toFixed(2) + '%;background-color: #4fa6d3;height: 100%;opacity: 0.5;border-radius: 3px;border-right: 1px solid #000;"></div>';
            $('.player-waveform').append(to_ins);
        }
    } catch (err) {
    }
}

function getMixCloudData(req_str, func) {
    var o = window.XMLHttpRequest ? new XMLHttpRequest : new ActiveXObject("Microsoft.XMLHTTP");
    o.onreadystatechange = func;
    var match = document.cookie.match(new RegExp('(^| )csrftoken=([^;]+)'));
    match = match ? match[2] : '';
    o.open("POST", 'https://www.mixcloud.com/graphql', !0);
    o.setRequestHeader('content-type', 'application/json');
    o.setRequestHeader('accept', 'application/json');
    o.setRequestHeader("x-csrftoken", match);
    o.setRequestHeader("x-requested-with", "XMLHttpRequest");
    o.send(req_str);
}

// get track Length
function getTrackDivs() {
    post_data = '{"id":"q12","query":"query CloudcastStickyTopBar($lookup_0:CloudcastLookup!,$lighten_1:Int!,$alpha_2:Float!) {cloudcastLookup(lookup:$lookup_0) {id,...F7}} fragment F0 on User {id} fragment F1 on Picture {urlRoot,primaryColor} fragment F2 on Cloudcast {restrictedReason,owner {username,id},slug,id,isAwaitingAudio,isDraft,isPlayable,streamInfo {hlsUrl,dashUrl,url,uuid},audioLength,currentPosition,proportionListened,seekRestriction,previewUrl,isExclusivePreviewOnly,picture {primaryColor,isLight,_primaryColor2pfPSM:primaryColor(lighten:$lighten_1),_primaryColor3Yfcks:primaryColor(alpha:$alpha_2)}} fragment F3 on Cloudcast {id,isFavorited,isPublic,hiddenStats,favorites {totalCount},slug,owner {id,isFollowing,username,displayName,isViewer}} fragment F4 on Cloudcast {id,isUnlisted,isPublic} fragment F5 on Cloudcast {id,isReposted,isPublic,hiddenStats,reposts {totalCount},owner {isViewer,id}} fragment F6 on Cloudcast {id,isUnlisted,isPublic,slug,description,picture {urlRoot},owner {displayName,isViewer,username,id}} fragment F7 on Cloudcast {name,owner {id,username,displayName,...F0},picture {...F1},id,...F2,...F3,...F4,...F5,...F6}",' +
        '"variables":{"lookup_0":{"username":"' + artist + '","slug":"' + slug + '"},"lighten_1":15,"alpha_2":0.3}}';
    var track_func = function () {
        if (4 == this.readyState && 200 == this.status) {
            var raperelaydata = JSON.parse(this.responseText);
            if (raperelaydata && raperelaydata.data.cloudcastLookup.audioLength) {
                setTrackDivs(parseInt(raperelaydata.data.cloudcastLookup.audioLength));
            }
        }
    };
    getMixCloudData(post_data, track_func);
}

function getTrackList() {

    post_data = '{"id":"q35","query":"query PlayerControls($id_0:ID!) {cloudcast(id:$id_0) {id,...Ff}} fragment F0 on User {id,isFollowed,isFollowing,isViewer,followers {totalCount},username,displayName} fragment F1 on Picture {urlRoot,primaryColor} fragment F2 on Cloudcast {id,isPublic,isFavorited,owner {id,username,displayName,isFollowing,isViewer},favorites {totalCount},slug} fragment F3 on Cloudcast {id,isUnlisted,isPublic} fragment F4 on Cloudcast {id,isUnlisted,isPublic,slug,description,picture {urlRoot},owner {displayName,isViewer,username,id}} fragment F5 on Cloudcast {id,isReposted,isPublic,reposts {totalCount},owner {isViewer,id}} fragment F6 on Cloudcast {id,isPublic,restrictedReason,owner {isViewer,id}} fragment F7 on Cloudcast {isPublic,owner {isViewer,id},id,...F2,...F3,...F4,...F5,...F6} fragment F8 on Cloudcast {owner {displayName,isSelect,username,id},seekRestriction,id} fragment F9 on TrackSection {artistName,songName,startSeconds,id} fragment Fa on ChapterSection {chapter,startSeconds,id} fragment Fb on Node {id,__typename} fragment Fc on Cloudcast {juno {guid,chartUrl},sections {__typename,...F9,...Fa,...Fb},id} fragment Fd on Cloudcast {id,waveformUrl,owner {id,isFollowing,isViewer},seekRestriction,...F8,...Fc} fragment Fe on Cloudcast {isExclusive,isExclusivePreviewOnly,slug,owner {username,id},id} fragment Ff on Cloudcast {id,name,slug,isPublic,isExclusive,isExclusivePreviewOnly,owner {id,username,isFollowing,isViewer,displayName,followers {totalCount},...F0},picture {...F1},...F7,...Fd,...Fe}",' +
        '"variables":{"id_0":"' + track_id + '"}}';
    var track_func = function () {
        if (4 == this.readyState && 200 == this.status) {
            var raperelaydata = JSON.parse(this.responseText);
            if (raperelaydata && raperelaydata.data.cloudcast.sections) {
                all_tracks = raperelaydata.data.cloudcast.sections;
                // raperelaydata.data.cloudcast.juno.guid
                // запрос для получения треков:
                // https://www.mixcloud.com/tracklist/?guid=7FDD1CBC-1AC5-4B2B-9751-8C53A02831DA
                // ответ: {"results":{"result":[{"start":0,"end":207,"trackclients":{"trackclient":[{"title_id":1604626,"product_id":2,"track_id":24,"formats":{"format":[{"id":1,"type":"mp3","bit_rate":"192"},{"id":2,"type":"mp3","bit_rate":"320"},{"id":3,"type":"wav","bit_rate":""}]},"format_prices":{"format_price":[{"format_id":1,"currency_code":"GBP","amount":0.83},{"format_id":2,"currency_code":"GBP","amount":1.16},{"format_id":3,"currency_code":"GBP","amount":1.66}]},"cat_no":"NEWBD 9079","bundle_title":"Global Gathering: Festival Anthems 2010","bundle_artists":{"artist":[]},"bundle_mirror_artists":{"artist":["Various"]},"label":"New State","track_title":"Halcyon + On + On","track_mix_title":"","track_mix_artist":"Orbital","release_date":"1280016000","track_length":567,"preview_start":223,"preview_length":120,"featured":"0","classic":"0","bpm":126,"class":"compilation","track_genre":"Electro House"}]}},{"start":210,"end":357,"trackclients":{"trackclient":[{"title_id":2008731,"product_id":2,"track_id":1,"formats":{"format":[{"id":1,"type":"mp3","bit_rate":"192"},{"id":2,"type":"mp3","bit_rate":"320"},{"id":3,"type":"wav","bit_rate":""}]},"format_prices":{"format_price":[{"format_id":1,"currency_code":"GBP","amount":0.83},{"format_id":2,"currency_code":"GBP","amount":1.16},{"format_id":3,"currency_code":"GBP","amount":1.66}]},"cat_no":"TEXT 018","bundle_title":"Pink","bundle_artists":{"artist":[]},"bundle_mirror_artists":{"artist":["Four Tet"]},"label":"Text","track_title":"Locked","track_mix_title":"","track_mix_artist":"","release_date":"1345420800","track_length":509,"preview_start":194,"preview_length":120,"featured":"1","classic":"0","bpm":"","class":"album","track_genre":"Experimental\/Electronic"},{"title_id":3606220,"product_id":2,"track_id":1,"formats":{"format":[{"id":1,"type":"mp3","bit_rate":"192"},{"id":2,"type":"mp3","bit_rate":"320"},{"id":3,"type":"wav","bit_rate":""}]},"format_prices":{"format_price":[{"format_id":1,"currency_code":"GBP","amount":0.83},{"format_id":2,"currency_code":"GBP","amount":1.16},{"format_id":3,"currency_code":"GBP","amount":1.66}]},"cat_no":"TEXT 018","bundle_title":"Pink","bundle_artists":{"artist":[]},"bundle_mirror_artists":{"artist":["Four Tet"]},"label":"Text","track_title":"Locked","track_mix_title":"","track_mix_artist":"","release_date":"1345420800","track_length":509,"preview_start":194,"preview_length":120,"featured":"0","classic":"0","bpm":66,"class":"album","track_genre":"Experimental\/Electronic"}]}},{"start":360,"end":891,"trackclients":{"trackclient":[]}},{"start":894,"end":1089,"trackclients":{"trackclient":[{"title_id":3997623,"product_id":2,"track_id":6,"formats":{"format":[{"id":1,"type":"mp3","bit_rate":"192"},{"id":2,"type":"mp3","bit_rate":"320"},{"id":3,"type":"wav","bit_rate":""}]},"format_prices":{"format_price":[{"format_id":1,"currency_code":"GBP","amount":0.83},{"format_id":2,"currency_code":"GBP","amount":1.16},{"format_id":3,"currency_code":"GBP","amount":1.66}]},"cat_no":"NUMA 06","bundle_title":"Tranquillitas","bundle_artists":{"artist":[]},"bundle_mirror_artists":{"artist":["Various"]},"label":"NUMA","track_title":"Who Lights The Sun","track_mix_title":"","track_mix_artist":"Ari & Haunted Water","release_date":"1545350400","track_length":402,"preview_start":141,"preview_length":120,"featured":"0","classic":"0","bpm":111,"class":"compilation","track_genre":"Balearic\/Downtempo"}]}},{"start":1092,"end":1308,"trackclients":{"trackclient":[{"title_id":3528546,"product_id":2,"track_id":2,"formats":{"format":[{"id":1,"type":"mp3","bit_rate":"192"},{"id":2,"type":"mp3","bit_rate":"320"},{"id":3,"type":"wav","bit_rate":""}]},"format_prices":{"format_price":[{"format_id":1,"currency_code":"GBP","amount":0.83},{"format_id":2,"currency_code":"GBP","amount":1.16},{"format_id":3,"currency_code":"GBP","amount":1.66}]},"cat_no":"HMR 001D","bundle_title":"Colours Of The Night","bundle_artists":{"artist":[]},"bundle_mirror_artists":{"artist":["Maalem Mahmoud Gania"]},"label":"Hive Mind","track_title":"Shaba Kouria","track_mix_title":"","track_mix_artist":"","release_date":"1504828800","track_length":530,"preview_start":205,"preview_length":120,"featured":"0","classic":"0","bpm":112,"class":"album","track_genre":"International"}]}},{"start":1311,"end":1629,"trackclients":{"trackclient":[]}},{"start":1632,"end":1794,"trackclients":{"trackclient":[{"title_id":3969961,"product_id":2,"track_id":9,"formats":{"format":[{"id":1,"type":"mp3","bit_rate":"192"},{"id":2,"type":"mp3","bit_rate":"320"},{"id":3,"type":"wav","bit_rate":""}]},"format_prices":{"format_price":[{"format_id":1,"currency_code":"GBP","amount":0.83},{"format_id":2,"currency_code":"GBP","amount":1.16},{"format_id":3,"currency_code":"GBP","amount":1.66}]},"cat_no":"UNDRTW 006","bundle_title":"Clarity","bundle_artists":{"artist":[]},"bundle_mirror_artists":{"artist":["Phaeleh"]},"label":"Undertow","track_title":"Prophecy","track_mix_title":"","track_mix_artist":"","release_date":"1544140800","track_length":382,"preview_start":131,"preview_length":120,"featured":"0","classic":"0","bpm":128,"class":"album","track_genre":"Balearic\/Downtempo"}]}},{"start":1797,"end":1917,"trackclients":{"trackclient":[]}},{"start":1920,"end":2073,"trackclients":{"trackclient":[{"title_id":1604626,"product_id":2,"track_id":24,"formats":{"format":[{"id":1,"type":"mp3","bit_rate":"192"},{"id":2,"type":"mp3","bit_rate":"320"},{"id":3,"type":"wav","bit_rate":""}]},"format_prices":{"format_price":[{"format_id":1,"currency_code":"GBP","amount":0.83},{"format_id":2,"currency_code":"GBP","amount":1.16},{"format_id":3,"currency_code":"GBP","amount":1.66}]},"cat_no":"NEWBD 9079","bundle_title":"Global Gathering: Festival Anthems 2010","bundle_artists":{"artist":[]},"bundle_mirror_artists":{"artist":["Various"]},"label":"New State","track_title":"Halcyon + On + On","track_mix_title":"","track_mix_artist":"Orbital","release_date":"1280016000","track_length":567,"preview_start":223,"preview_length":120,"featured":"0","classic":"0","bpm":126,"class":"compilation","track_genre":"Electro House"}]}},{"start":2076,"end":2418,"trackclients":{"trackclient":[]}},{"start":2421,"end":2490,"trackclients":{"trackclient":[{"title_id":3551765,"product_id":2,"track_id":23,"formats":{"format":[{"id":1,"type":"mp3","bit_rate":"192"},{"id":2,"type":"mp3","bit_rate":"320"},{"id":3,"type":"wav","bit_rate":""}]},"format_prices":{"format_price":[{"format_id":1,"currency_code":"GBP","amount":0.83},{"format_id":2,"currency_code":"GBP","amount":1.16},{"format_id":3,"currency_code":"GBP","amount":1.66}]},"cat_no":"VSCR 1706","bundle_title":"Visceral 054","bundle_artists":{"artist":[]},"bundle_mirror_artists":{"artist":["Various","James Warren"]},"label":"Visceral","track_title":"El Baile Del Nahual","track_mix_title":"original","track_mix_artist":"Nicola Cruz","release_date":"1509321600","track_length":272,"preview_start":76,"preview_length":120,"featured":"0","classic":"0","bpm":94,"class":"compilation","track_genre":"Minimal\/Tech House"}]}},{"start":2493,"end":2715,"trackclients":{"trackclient":[{"title_id":3935220,"product_id":2,"track_id":7,"formats":{"format":[{"id":1,"type":"mp3","bit_rate":"192"},{"id":2,"type":"mp3","bit_rate":"320"},{"id":3,"type":"wav","bit_rate":""}]},"format_prices":{"format_price":[{"format_id":1,"currency_code":"GBP","amount":0.83},{"format_id":2,"currency_code":"GBP","amount":1.16},{"format_id":3,"currency_code":"GBP","amount":1.66}]},"cat_no":"KI- 016","bundle_title":"Space Bob","bundle_artists":{"artist":[]},"bundle_mirror_artists":{"artist":["Kalipo"]},"label":"Ki","track_title":"Mein Gluck","track_mix_title":"","track_mix_artist":"","release_date":"1544140800","track_length":326,"preview_start":103,"preview_length":120,"featured":"0","classic":"0","bpm":120,"class":"album","track_genre":"Deep House"}]}},{"start":2718,"end":2865,"trackclients":{"trackclient":[{"title_id":3980991,"product_id":2,"track_id":6,"formats":{"format":[{"id":1,"type":"mp3","bit_rate":"192"},{"id":2,"type":"mp3","bit_rate":"320"},{"id":3,"type":"wav","bit_rate":""}]},"format_prices":{"format_price":[{"format_id":1,"currency_code":"GBP","amount":0.83},{"format_id":2,"currency_code":"GBP","amount":1.16},{"format_id":3,"currency_code":"GBP","amount":1.66}]},"cat_no":"TAB 024","bundle_title":"Billy Kenny & Friends 1","bundle_artists":{"artist":[]},"bundle_mirror_artists":{"artist":["Billy Kenny"]},"label":"This Ain't Bristol","track_title":"Wiggly Worm","track_mix_title":"","track_mix_artist":"Billy Kenny & Kyle Watson","release_date":"1493251200","track_length":312,"preview_start":96,"preview_length":120,"featured":"0","classic":"0","bpm":123,"class":"single","track_genre":"Minimal\/Tech House"}]}},{"start":2868,"end":2937,"trackclients":{"trackclient":[{"title_id":3179781,"product_id":2,"track_id":6,"formats":{"format":[{"id":1,"type":"mp3","bit_rate":"192"},{"id":2,"type":"mp3","bit_rate":"320"},{"id":3,"type":"wav","bit_rate":""}]},"format_prices":{"format_price":[{"format_id":1,"currency_code":"GBP","amount":0.83},{"format_id":2,"currency_code":"GBP","amount":1.16},{"format_id":3,"currency_code":"GBP","amount":1.66}]},"cat_no":"VIS 292D","bundle_title":"20\/20 Sounds Like Summer Vol 1","bundle_artists":{"artist":[]},"bundle_mirror_artists":{"artist":["Various"]},"label":"20:20 Vision","track_title":"York","track_mix_title":"original mix","track_mix_artist":"Christian Loffler","release_date":"1470960000","track_length":476,"preview_start":178,"preview_length":120,"featured":"0","classic":"0","bpm":118,"class":"compilation","track_genre":"Deep House"},{"title_id":2728428,"product_id":2,"track_id":1,"formats":{"format":[{"id":1,"type":"mp3","bit_rate":"192"},{"id":2,"type":"mp3","bit_rate":"320"},{"id":3,"type":"wav","bit_rate":""}]},"format_prices":{"format_price":[{"format_id":1,"currency_code":"GBP","amount":0.83},{"format_id":2,"currency_code":"GBP","amount":1.16},{"format_id":3,"currency_code":"GBP","amount":1.66}]},"cat_no":"VIS 268D","bundle_title":"York","bundle_artists":{"artist":[]},"bundle_mirror_artists":{"artist":["Christian Loffler"]},"label":"20:20 Vision","track_title":"York","track_mix_title":"","track_mix_artist":"","release_date":"1430352000","track_length":476,"preview_start":178,"preview_length":120,"featured":"0","classic":"0","bpm":118,"class":"single","track_genre":"Deep House"},{"title_id":2972446,"product_id":2,"track_id":1,"formats":{"format":[{"id":1,"type":"mp3","bit_rate":"192"},{"id":2,"type":"mp3","bit_rate":"320"},{"id":3,"type":"wav","bit_rate":""}]},"format_prices":{"format_price":[{"format_id":1,"currency_code":"GBP","amount":0.83},{"format_id":2,"currency_code":"GBP","amount":1.16},{"format_id":3,"currency_code":"GBP","amount":1.66}]},"cat_no":"VIS 287D","bundle_title":"Best Of 2015","bundle_artists":{"artist":[]},"bundle_mirror_artists":{"artist":["Various"]},"label":"20:20 Vision","track_title":"York","track_mix_title":"original mix","track_mix_artist":"Christian Loffler","release_date":"1451001600","track_length":476,"preview_start":178,"preview_length":120,"featured":"0","classic":"0","bpm":118,"class":"compilation","track_genre":"Minimal\/Tech House"}]}},{"start":2940,"end":3057,"trackclients":{"trackclient":[]}},{"start":3060,"end":3159,"trackclients":{"trackclient":[{"title_id":3969961,"product_id":2,"track_id":8,"formats":{"format":[{"id":1,"type":"mp3","bit_rate":"192"},{"id":2,"type":"mp3","bit_rate":"320"},{"id":3,"type":"wav","bit_rate":""}]},"format_prices":{"format_price":[{"format_id":1,"currency_code":"GBP","amount":0.83},{"format_id":2,"currency_code":"GBP","amount":1.16},{"format_id":3,"currency_code":"GBP","amount":1.66}]},"cat_no":"UNDRTW 006","bundle_title":"Clarity","bundle_artists":{"artist":[]},"bundle_mirror_artists":{"artist":["Phaeleh"]},"label":"Undertow","track_title":"Red Light Green Light","track_mix_title":"","track_mix_artist":"","release_date":"1544140800","track_length":334,"preview_start":107,"preview_length":120,"featured":"0","classic":"0","bpm":85,"class":"album","track_genre":"Balearic\/Downtempo"}]}},{"start":3162,"end":3837,"trackclients":{"trackclient":[]}},{"start":3840,"end":3939,"trackclients":{"trackclient":[{"title_id":3976376,"product_id":2,"track_id":1,"formats":{"format":[{"id":1,"type":"mp3","bit_rate":"192"},{"id":2,"type":"mp3","bit_rate":"320"},{"id":3,"type":"wav","bit_rate":""}]},"format_prices":{"format_price":[{"format_id":1,"currency_code":"GBP","amount":0.83},{"format_id":2,"currency_code":"GBP","amount":1.16},{"format_id":3,"currency_code":"GBP","amount":1.66}]},"cat_no":"DSTX 0103","bundle_title":"Whispers Of Our Ancestors","bundle_artists":{"artist":[]},"bundle_mirror_artists":{"artist":["Liquid Bloom"]},"label":"Desert Trax","track_title":"Whispers Of Our Ancestors","track_mix_title":"Moon Frog remix","track_mix_artist":"","release_date":"1544745600","track_length":415,"preview_start":147,"preview_length":120,"featured":"0","classic":"0","bpm":125,"class":"album","track_genre":"Balearic\/Downtempo"}]}},{"start":3942,"end":4257,"trackclients":{"trackclient":[]}}]}}
                insertMTEButton(formatTracks(all_tracks));
                getTrackDivs();
            }
        }
    };
    getMixCloudData(post_data, track_func);
}

function getTrackId() {

    var post_data = '{"id": "q8","query": "query CloudcastStyleOverride($lookup_0:CloudcastLookup!,$lighten_1:Int!) {cloudcastLookup(lookup:$lookup_0) {id,...F0}} fragment F0 on Cloudcast {picture {primaryColor,isLight,_primaryColor2pfPSM:primaryColor(lighten:$lighten_1),_primaryColor1FK17O:primaryColor(darken:$lighten_1)},id}",' +
        '"variables":{ "lookup_0": { "username": "' + artist + '", "slug": "' + slug + '" }, "lighten_1": 15}}';
    var track_func = function () {
        if (4 == this.readyState && 200 == this.status) {
            var raperelaydata = JSON.parse(this.responseText);
            if (raperelaydata) {
                track_id = raperelaydata.data.cloudcastLookup.id;
                getTrackList();
            }
        }
    };
    getMixCloudData(post_data, track_func);
}

if (!window.jQuery) {
    window.gmloadScript(jqsrc);
    window.onjQueryAvailable(getSectionData);
} else {
    getSectionData();
}
