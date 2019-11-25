var firebaseConfig = {
    apiKey: "AIzaSyCUJ-yClOYyuzFb-8HjZ5b8bXF0LXRFPxE",
    authDomain: "dps-github-firebase.firebaseapp.com",
    databaseURL: "https://dps-github-firebase.firebaseio.com",
    projectId: "dps-github-firebase",
    storageBucket: "dps-github-firebase.appspot.com",
    messagingSenderId: "1016091832357",
    appId: "1:1016091832357:web:3a62cc3ff92579837ecfcc",
    measurementId: "G-2P9B87LENM"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

//UID of aye,rom,riza
const githubUsers = [56451054, 56452310, 56452638];

const issueEvents = ["labeled", "unlabeled", "commented"];
const labelEvent = ["labeled", "unlabeled"];

var oauth_token = 'token 61827f8a688618a9b1b2142b91a1e4ce76f301f2';

var repo_name = "firebase-android-sdk";
var queryDate = '2019-11-20';

//What to sort results by. Can be either created, updated, comments. Default: created
var rest_api_sort_param = "created";
// Indicates the state of the issues to return. Can be either open, closed, or all. Default: open
var rest_api_state_param = "all";

document.getElementById("startReport").addEventListener("click", myFunction);

function myFunction() {
    repo_name = document.getElementById("repo").value
    rest_api_sort_param = document.getElementById("sort").value;
    rest_api_state_param = document.getElementById("state").value;
    queryDate = document.getElementById("datepicker").value;
    document.getElementById("startReport").disabled = true;


    //Clear paragraph
    $('#log_report').html("");
    logReport("Initialing report, please wait....");
    logReport("\n");

    letsGo();
}

function logReport(logValue) {
    currentValue = document.getElementById("log_report").innerHTML + "<br />";
    $('#log_report').html(currentValue + logValue);
}

function logReportIssueWithLink(logValue, htmlURL) {
    var par = document.getElementById("log_report");

    var temp_link = document.createElement("a");
    temp_link.href = htmlURL;
    temp_link.target = '_blank';
    temp_link.innerHTML = logValue;

    currentValue = document.getElementById("log_report").innerHTML + "<br />";
    $('#log_report').html(currentValue);
    par.appendChild(temp_link);
}

function authLogin() {
    var provider = new firebase.auth.GithubAuthProvider();

    firebase.auth().signInWithPopup(provider).then(function (result) {
        // This gives you a GitHub Access Token. You can use it to access the GitHub API.
        var token = result.credential.accessToken;
        // The signed-in user info.
        var user = result.user;
        // ...
    }).catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        // ...
    });
}

function msToTime(millisec) {
    var seconds = (millisec / 1000).toFixed(1);
    var minutes = (millisec / (1000 * 60)).toFixed(1);
    var hours = (millisec / (1000 * 60 * 60)).toFixed(1);
    var days = (millisec / (1000 * 60 * 60 * 24)).toFixed(1);

    if (seconds < 60) {
        return seconds + " sec";
    } else if (minutes < 60) {
        return minutes + " min";
    } else if (hours < 24) {
        return hours + " hrs";
    } else {
        return days + " days"
    }
}

// Get all issues
// Documentation: https://developer.github.com/v3/issues/
// Note GitHub's REST API v3 considers every pull request an issue.
const getListOfIssues = async function (pageNo = 1) {
    var url = 'https://api.github.com/repos/firebase/' + repo_name + '/issues?since=' + queryDate + '&sort=' + rest_api_sort_param + '&state=' + rest_api_state_param + '&page=' + `${pageNo}` + '';
    // console.log(url);
    const apiResults = await fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/vnd.github.symmetra-preview+json',
            'Authorization': oauth_token
        }
    }).then(resp => {
        return resp.json();
    });
    return apiResults;
}

const getEntireIssueList = async function (pageNo = 1) {
    const results = await getListOfIssues(pageNo);
    // console.log("Retreiving data from API for page : " + pageNo);
    if (results.length > 0) {
        return results.concat(await getEntireIssueList(pageNo + 1));
    } else {
        return results;
    }
};


// Get issue timeline
// Documentation: https://developer.github.com/v3/issues/timeline/
const getIssueTimeline = async function (issue_number, pageNo = 1) {
    var url = 'https://api.github.com/repos/firebase/' + repo_name + '/issues/' + issue_number + '/timeline?page=' + `${pageNo}` + '';
    const apiResults = await fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/vnd.github.mockingbird-preview',
            'Authorization': oauth_token
        }
    }).then(resp => {
        return resp.json();
    });
    return apiResults;
}


const getEntireTimeline = async function (issue_number, pageNo) {
    const results = await getIssueTimeline(issue_number, pageNo);
    // console.log("Retreiving Timeline for page : " + pageNo);
    if (results.length > 0) {
        return results.concat(await getEntireTimeline(issue_number, pageNo + 1));
    } else {
        return results;
    }
};

const letsGo = async () => {
    const myJson = await getEntireIssueList();
    var keys = Object.keys(myJson);
    // console.log("Total Issues (Pull/Issue): " + keys.length);

    for (var i = 0, length = keys.length; i < length; i++) {
        if (myJson[i].pull_request == undefined) { // only those Github issues
            const issue_number = myJson[i].number
            const created_at = myJson[i].created_at
            const state = myJson[i].state
            const html_url = myJson[i].html_url

            const myTimeline = await getEntireTimeline(issue_number, pageNo = 1);
            var myTimelineKeys = Object.keys(myTimeline);

            for (var y = 0, lengths = myTimelineKeys.length; y < lengths; y++) {
                var date_queryy = new Date(queryDate);
                var created_att = new Date(myTimeline[y].created_at);
                var checkUser = githubUsers.includes(myTimeline[y].actor.id);
                var checkEvents = issueEvents.includes(myTimeline[y].event);

                // Check if user has contribution first
                if (checkUser && (created_att.getTime() >= date_queryy.getTime()) && checkEvents) {
                    logReportIssueWithLink("----------Android SDK #" + issue_number + "----------", html_url);
                    logReport("Created at: " + created_at);
                    logReport("State: " + state);
                    logReport("\n");
                    logReport("Responses Time:");

                    // Log Responses Time
                    for (var x = 0, length2 = myTimelineKeys.length; x < length2; x++) {
                        var date1 = new Date();
                        var date2 = new Date(myTimeline[x].created_at);
                        var date3 = new Date(created_at);
                        var checkUser2 = githubUsers.includes(myTimeline[x].actor.id);

                        var difference_in_time = date1.getTime() - date2.getTime();

                        var difference_in_time2 = date2.getTime() - date3.getTime();

                        if (checkUser2 && (created_att.getTime() >= date_queryy.getTime()) && checkEvents && (myTimeline[x].event == "commented")) {
                            logReport(myTimeline[x].user.login + " " + msToTime(difference_in_time) + " ago" + " (" + msToTime(difference_in_time2) + ")");
                        }

                    }

                    logReport("\n");
                    logReport("Labels:");

                    // Log labels
                    for (var c = 0, length3 = myTimelineKeys.length; c < length3; c++) {
                        var checkUser = githubUsers.includes(myTimeline[c].actor.id);
                        var isLabelled = labelEvent.includes(myTimeline[c].event);

                        if (checkUser && isLabelled) {
                            var date1 = new Date();
                            var date2 = new Date(myTimeline[c].created_at);

                            // To calculate the time difference of two dates 
                            var difference_in_time = date1.getTime() - date2.getTime();
                            logReport(myTimeline[c].actor.login + " " + myTimeline[c].event + " " + myTimeline[c].label.name + " " + msToTime(difference_in_time) + " ago");
                        }
                    }
                    logReport("\n");

                    break;
                }
            }
        }
    }
    logReport("Report completed!");
    document.getElementById("startReport").disabled = false;

};

// authLogin();
