// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();
var db = firebase.firestore();

const issueEvents = ["labeled", "unlabeled", "commented", "closed", "opened"];
const labelEvent = ["labeled", "unlabeled"];
const issueState = ["closed", "reopened"];

var oauth_token = ''
var repo_name = '';
var queryDate = '';
var countissue = 0;

//What to sort results by. Can be either created, updated, comments. Default: created
var rest_api_sort_param = "created";
// Indicates the state of the issues to return. Can be either open, closed, or all. Default: open
var rest_api_state_param = "all";

document.getElementById("startReport").addEventListener("click", myFunction);
document.getElementById('logout').style.visibility = 'hidden';
document.getElementById("logout").addEventListener("click", logOut);

function logOut() {

    firebase.auth().signOut().then(function () {
        // Sign-out successful.
    }).catch(function (error) {
        // An error happened.
    });

}

function myFunction() {
    // const repro_message = await getIssueTriageCompletionDate("android", "1242");
    // var milliSeconds = Date.parse(repro_message);
    // console.log(formatDate(repro_message));

    // var milliSeconds = Date.parse(triage_completion_new);
    // triage_completion_rate_new = msToTimeToHours(milliSeconds);

    repo_name = document.getElementById("repo").value
    rest_api_sort_param = document.getElementById("sort").value;
    rest_api_state_param = document.getElementById("state").value;
    queryDate = document.getElementById("datepicker").value + " 00:00:00";
    only_updated = document.getElementById("allrecords").value;

    document.getElementById("startReport").disabled = true;

    var user = firebase.auth().currentUser;
    if (user) {
        db.collection("users").doc(user.uid)
            .onSnapshot(function (doc) {

                $('#log_report').html("");                        //Clear text field
                countissue = 0;                                   // Set count number to 0
                oauth_token = 'token ' + doc.data().accessToken;  // Get OAuth TOken
                console.log("Oauth token: " + oauth_token);
                logReport("Preparing report, please wait....");
                logReport("\n");
                letsGo();

            }, function (error) {
                console.log(error);
            });

    } else {
        authLogin();
    }
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
    provider.addScope('repo');

    firebase.auth().signInWithPopup(provider).then(function (result) {
        var user = result.user;
        saveUserToken(result.credential.accessToken, user);
    }).catch(function (error) {
        console.log(error);
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
    var url = 'https://api.github.com/repos/' + repo_name + '/issues?since=' + queryDate + '&sort=' + rest_api_sort_param + '&state=' + rest_api_state_param + '&page=' + `${pageNo}` + '';
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
    console.log("Retreiving data from API for page : " + pageNo);
    if (results.length > 0) {
        return results.concat(await getEntireIssueList(pageNo + 1));
    } else {
        return results;
    }
};


// Get issue timeline
// Documentation: https://developer.github.com/v3/issues/timeline/
const getIssueTimeline = async function (issue_number, pageNo = 1) {
    var url = 'https://api.github.com/repos/' + repo_name + '/issues/' + issue_number + '/timeline?page=' + `${pageNo}` + '';
    console.log(url);
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
            const title = myJson[i].title;

            const myTimeline = await getEntireTimeline(issue_number, pageNo = 1);
            var myTimelineKeys = Object.keys(myTimeline);

            for (var y = 0, lengths = myTimelineKeys.length; y < lengths; y++) {
                var date_queryy = new Date(queryDate);
                var created_att = new Date(myTimeline[y].created_at);

                if (myTimeline[y].actor == null) {
                    break;
                }

                var checkUser = supportTeamUID.includes(myTimeline[y].actor.id);
                var checkEvents = issueEvents.includes(myTimeline[y].event);
                
                if (checkUser && (created_att.getTime() >= date_queryy.getTime()) && checkEvents) {
                    countissue = countissue + 1;

                    logReportIssueWithLink("(" + countissue + ")" + "----------" + repo_name + " #" + issue_number + "----------", html_url);
                    logReport("<b>Title</b>: " + title);
                    var date1 = new Date();
                    var date2 = new Date(created_at);
                    var difference_in_time = date1.getTime() - date2.getTime();
                    // logReport("<b>Date created</b>: " + formatDate(created_at) + " (" + msToTime(difference_in_time) + " ago)");

                    const response = await getIssueStatus(getRepoName(repo_name), issue_number.toString());
                    var issueStatus = "-";
                    var needInfo = "-";
                    var needRepro = "-";

                    if (response !== null) {

                        if (response.status !== undefined) {
                            issueStatus = response.status;
                        }

                        if (response.needInfo !== undefined) {
                            if (response.needInfo) {
                                needInfo = "Yes"
                            } else {
                                needInfo = "No"
                            }
                        }

                        if (response.needRepro !== undefined) {
                            if (response.needRepro) {
                                needRepro = "Yes"
                            } else {
                                needRepro = "No"
                            }
                        }
                    }

                    logReport("<b>Date created</b>: " + formatDate(created_at));
                    // logReport("State: " + state);
                    logReport("<b>Status</b>: " + issueStatus + " / " + state);
                    logReport("<b>Need Info</b>: " + needInfo);
                    logReport("<b>Need Repro</b>: " + needRepro);
                    logReport("\n");
                    logReport("<b>Responses:</b>");

                    // Log Responses Time
                    for (var x = 0, length2 = myTimelineKeys.length; x < length2; x++) {
                        var date1 = new Date();
                        var date2 = new Date(myTimeline[x].created_at);
                        var date3 = new Date(created_at);
                        var checkUser2 = supportTeamUID.includes(myTimeline[x].actor.id);

                        var difference_in_time = date1.getTime() - date2.getTime();

                        var difference_in_time2 = date2.getTime() - date3.getTime();

                        if (checkUser2 && (created_att.getTime() >= date_queryy.getTime()) && checkEvents && (myTimeline[x].event == "commented")) {
                            if ((date2.getTime() >= date_queryy.getTime()) && only_updated != "all") {
                                logReport(myTimeline[x].user.login + " " + formatDate(date2) + "/" + msToTime(difference_in_time) + " ago" + " (" + msToTime(difference_in_time2) + ")");
                            } else if (only_updated == "all") {
                                logReport(myTimeline[x].user.login + " " + formatDate(date2) + "/" + msToTime(difference_in_time) + " ago" + " (" + msToTime(difference_in_time2) + ")");
                            }
                        }

                    }

                    logReport("\n");
                    logReport("<b>Labels:</b>");

                    // Log labels
                    for (var c = 0, length3 = myTimelineKeys.length; c < length3; c++) {
                        var checkUser = supportTeamUID.includes(myTimeline[c].actor.id);
                        var isLabelled = labelEvent.includes(myTimeline[c].event);

                        if (checkUser && isLabelled) {
                            var date1 = new Date();
                            var date2 = new Date(myTimeline[c].created_at);
                            var date3 = new Date(created_at);

                            // To calculate the time difference of two dates 
                            var difference_in_time = date1.getTime() - date2.getTime();
                            var difference_in_time2 = date2.getTime() - date3.getTime();

                            if ((date2.getTime() >= date_queryy.getTime()) && only_updated != "all") {
                                logReport(myTimeline[c].actor.login + " " + myTimeline[c].event + " '" + myTimeline[c].label.name + "' " + formatDate(date2) + "/" + msToTime(difference_in_time) + " ago" + " (" + msToTime(difference_in_time2) + ")");
                            } else if (only_updated == "all") {
                                logReport(myTimeline[c].actor.login + " " + myTimeline[c].event + " '" + myTimeline[c].label.name + "' " + formatDate(date2) + "/" + msToTime(difference_in_time) + " ago" + " (" + msToTime(difference_in_time2) + ")");
                            }

                        }
                    }
                    logReport("\n");
                    logReport("<b>Other Activity:</b>");

                    // Log issue status, re-open case
                    for (var d = 0, length3 = myTimelineKeys.length; d < length3; d++) {
                        var checkUser = supportTeamUID.includes(myTimeline[d].actor.id);
                        var state_change = issueState.includes(myTimeline[d].event);

                        if (checkUser && state_change) {
                            var date1 = new Date();
                            var date2 = new Date(myTimeline[d].created_at);
                            var date3 = new Date(created_at);

                            // To calculate the time difference of two dates 
                            var difference_in_time = date1.getTime() - date2.getTime();
                            var difference_in_time2 = date2.getTime() - date3.getTime();

                            if ((date2.getTime() >= date_queryy.getTime()) && only_updated != "all") {
                                logReport(myTimeline[d].actor.login + " " + myTimeline[d].event + " " + msToTime(difference_in_time) + " ago" + " (" + msToTime(difference_in_time2) + ")");
                            } else if (only_updated == "all") {
                                logReport(myTimeline[d].actor.login + " " + myTimeline[d].event + " " + msToTime(difference_in_time) + " ago" + " (" + msToTime(difference_in_time2) + ")");
                            }

                        }

                    }

                    logReport("\n");
                    logReport("\n");
                    break;
                }
            }
        }
    }
    logReport("Report completed!");
    document.getElementById("startReport").disabled = false;

};

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        // console.log("token " + user.getToken);
        $('#user_name').html("Hello! " + user.email + " ");
        document.getElementById('logout').style.visibility = 'visible';
    } else {
        authLogin();
    }
});

function formatDate(s_date) {
    var date = new Date(s_date);

    return date.getFullYear() + "-" + ((date.getMonth() > 8) ? (date.getMonth() + 1) : ('0' + (date.getMonth() + 1))) + '-' + ((date.getDate() > 9) ? date.getDate() : ('0' + date.getDate())) + " " + formatAMPM(date)
}

function formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
}

function saveUserToken(token, user) {
    userDoc = {
        'email': user.email,
        'accessToken': token
    }
    var ref = db.collection('users').doc(user.uid);
    ref.set(userDoc).then(writeResult => {
        // user saved
    }).catch(err => {
        console.log(err);
    });
}