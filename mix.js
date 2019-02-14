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
    tracks = "",
    timeindexes = '',
    trackno = 1,
    all_tracks, track_id, slug, artist,
    showhidebutton = '',
    htmlDecode = function (input) {
        var doc = new DOMParser().parseFromString(input, "text/html");
        return doc.documentElement.textContent;
    },
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
        //return (s - (s %= 60)) / 60 + (9 < s ? ':' : ':0') + s;
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
                //tracks += '<li ng-hide="juno.sections.length" class=""><em>' + trackno + '</em><b title="' + trackdata[track].chapter + '">' + trackdata[track].chapter + '</b> <span class="starttime"> | ' + fmtMSS(starttime) + '</span></li>';
                tracks += '<tr style="border-bottom: 1px dotted #dce5e8;"><td><em>' + trackno + '</em></td><td><b title="' + trackdata[track].chapter + '">' + t + '</b></td><td align="right">' + fmtMSS(starttime) + '</td></tr>';
            } else {
                //tracks += '<li ng-hide="juno.sections.length" class=""><em>' + trackno + '</em><b title="' + trackdata[track].songName + '">' + trackdata[track].songName + '</b> <small>by <span>' + trackdata[track].artistName + '</span></small><span class="starttime"> | ' + fmtMSS(starttime) + '</span></li>';
                tracks += '<tr style="border-bottom: 1px dotted #dce5e8;"><td><em>' + trackno + '</em></td><td><b title="' + trackdata[track].songName + '">' + trackdata[track].songName + '</b> – ' + trackdata[track].artistName + '</td><td align="right">' + fmtMSS(starttime) + '</td></tr>';
            }

            trackno++;
            timeindexes += (trackdata[track].start_time) ? trackdata[track].start_time + ', ' : '';
        }
        return tracks;
    }, insertMTEButton = function (trackhtml) {
        var brainzinsertionooo = '';


        showhidebutton += '<span class="btn btn-small btn-inverse btn-toggled brainz-mte" m-click="tracklistShown=!tracklistShown" ng-class="{\'btn-toggled\': tracklistShown}" style="margin-left: 10px;"><svg class="" xmlns="http://www.w3.org/2000/svg" width="19px" height="14px" viewBox="0 0 19 14" version="1.1"><path d="M6,2h12c0.6,0,1-0.4,1-1s-0.4-1-1-1H6C5.4,0,5,0.4,5,1S5.4,2,6,2z M18,12H6c-0.6,0-1,0.4-1,1s0.4,1,1,1h12\n\r    	c0.6,0,1-0.4,1-1S18.6,12,18,12z M1.5,0H1C0.4,0,0,0.4,0,1s0.4,1,1,1h0.5c0.6,0,1-0.4,1-1S2.1,0,1.5,0z M1.5,12H1c-0.6,0-1,0.4-1,1\n\r    	s0.4,1,1,1h0.5c0.6,0,1-0.4,1-1S2.1,12,1.5,12z M18,6H6C5.4,6,5,6.4,5,7l0,0c0,0.6,0.4,1,1,1h12c0.6,0,1-0.4,1-1l0,0\n\r    	C19,6.4,18.6,6,18,6z M1.5,6H1C0.4,6,0,6.4,0,7s0.4,1,1,1h0.5c0.6,0,1-0.4,1-1S2.1,6,1.5,6z"></path></svg><span ng-show="tracklistShown" class="">Hide </span><span ng-show="!tracklistShown" class="ng-hide">Show </span>tracklist</span>';


        brainzinsertionooo += '<div ng-init="tracklistShown=false;"><div class="tracklist-wrap" ng-show="tracklistShown"><div class="inner-container"><div class="content"><h1>Tracklist</h1><table width="100%" cellpadding=5>';

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
            if (all_tracks[track].startSeconds || all_tracks[track].startSeconds===0) {
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

// get track Length
function getTrackDivs() {
    post_data = '{"id":"q12","query":"query CloudcastStickyTopBar($lookup_0:CloudcastLookup!,$lighten_1:Int!,$alpha_2:Float!) {cloudcastLookup(lookup:$lookup_0) {id,...F7}} fragment F0 on User {id} fragment F1 on Picture {urlRoot,primaryColor} fragment F2 on Cloudcast {restrictedReason,owner {username,id},slug,id,isAwaitingAudio,isDraft,isPlayable,streamInfo {hlsUrl,dashUrl,url,uuid},audioLength,currentPosition,proportionListened,seekRestriction,previewUrl,isExclusivePreviewOnly,picture {primaryColor,isLight,_primaryColor2pfPSM:primaryColor(lighten:$lighten_1),_primaryColor3Yfcks:primaryColor(alpha:$alpha_2)}} fragment F3 on Cloudcast {id,isFavorited,isPublic,hiddenStats,favorites {totalCount},slug,owner {id,isFollowing,username,displayName,isViewer}} fragment F4 on Cloudcast {id,isUnlisted,isPublic} fragment F5 on Cloudcast {id,isReposted,isPublic,hiddenStats,reposts {totalCount},owner {isViewer,id}} fragment F6 on Cloudcast {id,isUnlisted,isPublic,slug,description,picture {urlRoot},owner {displayName,isViewer,username,id}} fragment F7 on Cloudcast {name,owner {id,username,displayName,...F0},picture {...F1},id,...F2,...F3,...F4,...F5,...F6}",' +
        '"variables":{"lookup_0":{"username":"' + artist + '","slug":"' + slug + '"},"lighten_1":15,"alpha_2":0.3}}';
    var o;
    o = window.XMLHttpRequest ? new XMLHttpRequest : new ActiveXObject("Microsoft.XMLHTTP");
    o.onreadystatechange = function () {
        if (4 == o.readyState && 200 == o.status) {
            //console.log(o.responseText);
            var raperelaydata = JSON.parse(o.responseText)
            if (raperelaydata && raperelaydata.data.cloudcastLookup.audioLength) {
                setTrackDivs(parseInt(raperelaydata.data.cloudcastLookup.audioLength));
            }
            //console.log(o.responseText);
        }
    };
    var match = document.cookie.match(new RegExp('(^| )csrftoken=([^;]+)'));
    match = match ? match[2] : '';
    o.open("POST", 'https://www.mixcloud.com/graphql', !0);
    o.setRequestHeader('content-type', 'application/json');
    o.setRequestHeader('accept', 'application/json');
    o.setRequestHeader("x-csrftoken", match);
    o.setRequestHeader("x-requested-with", "XMLHttpRequest");
    o.send(post_data);

}

function getTrackList() {

    post_data = '{"id":"q35","query":"query PlayerControls($id_0:ID!) {cloudcast(id:$id_0) {id,...Ff}} fragment F0 on User {id,isFollowed,isFollowing,isViewer,followers {totalCount},username,displayName} fragment F1 on Picture {urlRoot,primaryColor} fragment F2 on Cloudcast {id,isPublic,isFavorited,owner {id,username,displayName,isFollowing,isViewer},favorites {totalCount},slug} fragment F3 on Cloudcast {id,isUnlisted,isPublic} fragment F4 on Cloudcast {id,isUnlisted,isPublic,slug,description,picture {urlRoot},owner {displayName,isViewer,username,id}} fragment F5 on Cloudcast {id,isReposted,isPublic,reposts {totalCount},owner {isViewer,id}} fragment F6 on Cloudcast {id,isPublic,restrictedReason,owner {isViewer,id}} fragment F7 on Cloudcast {isPublic,owner {isViewer,id},id,...F2,...F3,...F4,...F5,...F6} fragment F8 on Cloudcast {owner {displayName,isSelect,username,id},seekRestriction,id} fragment F9 on TrackSection {artistName,songName,startSeconds,id} fragment Fa on ChapterSection {chapter,startSeconds,id} fragment Fb on Node {id,__typename} fragment Fc on Cloudcast {juno {guid,chartUrl},sections {__typename,...F9,...Fa,...Fb},id} fragment Fd on Cloudcast {id,waveformUrl,owner {id,isFollowing,isViewer},seekRestriction,...F8,...Fc} fragment Fe on Cloudcast {isExclusive,isExclusivePreviewOnly,slug,owner {username,id},id} fragment Ff on Cloudcast {id,name,slug,isPublic,isExclusive,isExclusivePreviewOnly,owner {id,username,isFollowing,isViewer,displayName,followers {totalCount},...F0},picture {...F1},...F7,...Fd,...Fe}",' +
        '"variables":{"id_0":"' + track_id + '"}}';
    var o;
    o = window.XMLHttpRequest ? new XMLHttpRequest : new ActiveXObject("Microsoft.XMLHTTP");
    o.onreadystatechange = function () {
        if (4 == o.readyState && 200 == o.status) {
            //console.log(o.responseText);
            var raperelaydata = JSON.parse(o.responseText)
            if (raperelaydata && raperelaydata.data.cloudcast.sections) {
                all_tracks = raperelaydata.data.cloudcast.sections;
                insertMTEButton(formatTracks(all_tracks));
                getTrackDivs();
            }
            //console.log(o.responseText);
        }
    };
    var match = document.cookie.match(new RegExp('(^| )csrftoken=([^;]+)'));
    match = match ? match[2] : '';
    o.open("POST", 'https://www.mixcloud.com/graphql', !0);
    o.setRequestHeader('content-type', 'application/json');
    o.setRequestHeader('accept', 'application/json');
    o.setRequestHeader("x-csrftoken", match);
    o.setRequestHeader("x-requested-with", "XMLHttpRequest");
    o.send(post_data);

}

function getTrackId() {
    //console.log('get tracks for id ' + id);

    post_data = '{"id": "q8","query": "query CloudcastStyleOverride($lookup_0:CloudcastLookup!,$lighten_1:Int!) {cloudcastLookup(lookup:$lookup_0) {id,...F0}} fragment F0 on Cloudcast {picture {primaryColor,isLight,_primaryColor2pfPSM:primaryColor(lighten:$lighten_1),_primaryColor1FK17O:primaryColor(darken:$lighten_1)},id}",' +
        '"variables":{ "lookup_0": { "username": "' + artist + '", "slug": "' + slug + '" }, "lighten_1": 15}}';
    var o;
    o = window.XMLHttpRequest ? new XMLHttpRequest : new ActiveXObject("Microsoft.XMLHTTP");
    o.onreadystatechange = function () {
        if (4 == o.readyState && 200 == o.status) {
            //console.log(o.responseText);
            var raperelaydata = JSON.parse(o.responseText)
            if (raperelaydata) {
                track_id = raperelaydata.data.cloudcastLookup.id;
                getTrackList();
            }
            //console.log(o.responseText);
        }
    };
    var match = document.cookie.match(new RegExp('(^| )csrftoken=([^;]+)'));
    match = match ? match[2] : '';
    o.open("POST", 'https://www.mixcloud.com/graphql', !0);
    o.setRequestHeader('content-type', 'application/json');
    o.setRequestHeader('accept', 'application/json');
    o.setRequestHeader("x-csrftoken", match);
    o.setRequestHeader("x-requested-with", "XMLHttpRequest");
    o.send(post_data);
}

if (!window.jQuery) {
    window.gmloadScript(jqsrc);
    window.onjQueryAvailable(getSectionData);
} else {
    getSectionData();
}
