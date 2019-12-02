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
var db = firebase.firestore();

//233 People
const githubUsers = [10678845, 969070, 400613, 56451054, 9697957, 531549, 626066, 860441, 7191926, 4783748, 42279346, 5488274, 3010484, 7579932, 211174, 1316937, 2235636, 616364, 18098046, 1371871, 160236, 1392500, 13474811, 1917562, 240083, 19961678, 20483424, 31869252, 27706281, 31256040, 18563577, 228287, 43829046, 2149341, 8563002, 3688431, 2354618, 2672766, 4570265, 7716258, 8961614, 1392690, 6343707, 49409954, 11888634, 21042322, 238530, 1432131, 48732152, 16657086, 5544707, 842078, 179320, 9245, 624032, 16250652, 4391036, 12191552, 3211871, 14813370, 37934, 8175924, 9068391, 26553233, 3605123, 5384588, 824223, 2417005, 20542150, 2375201, 10716545, 12467170, 665326, 5572676, 26582655, 8861854, 3154053, 1553807, 36684410, 44975, 45485827, 4155401, 43789343, 1628592, 49322835, 18298474, 1721, 3289655, 3759507, 32469398, 111856, 4635763, 28762851, 8334459, 49734, 6147184, 4769135, 169368, 10507399, 14354868, 804338, 9759792, 639792, 13021026, 959972, 1319317, 11839002, 17034, 51006219, 23088984, 5566205, 2370200, 55609, 3990804, 45496592, 13542853, 56452299, 17415596, 5937188, 1841926, 23690283, 50713862, 753115, 372282, 850678, 1389937, 1022, 337855, 1348110, 7231485, 2972107, 1082754, 206364, 1613860, 4529021, 1540856, 883082, 4811571, 47536767, 1764944, 3766663, 22248033, 216412, 55852299, 1111611, 73870, 437242, 2335087, 5122391, 102201, 232107, 649249, 1452276, 5268, 18198771, 913631, 209641, 52258509, 40667, 4597180, 11690982, 99534, 31138589, 869251, 1111032, 13852571, 56452638, 368578, 1066253, 136118, 8669100, 29150348, 100155, 56452310, 50421366, 11047174, 54919691, 1649989, 1097316, 5347038, 555046, 2373151, 2019562, 8466666, 4384718, 5757567, 19397744, 19987655, 5479, 7804407, 12303, 48258069, 5292395, 596919, 50927477, 29488810, 478101, 6042948, 401051, 9065906, 26743133, 52238803, 6948042, 31747099, 624211, 9773485, 1987108, 41815, 4397978, 844249, 483300, 702990, 1886147, 821349, 8216808, 1759572, 141824, 44070836, 5298183, 20288217, 10249104, 32399754, 53845758, 682940, 19537619, 10226026, 8353656, 22875286, 20689178, 7097524, 37026441, 26017994];

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
    repo_name = document.getElementById("repo").value
    rest_api_state_param = document.getElementById("state").value;
    queryDate = document.getElementById("datepicker").value;
    document.getElementById("startReport").disabled = true;

    var user = firebase.auth().currentUser;
    if (user) {
        db.collection("users").doc(user.uid)
            .onSnapshot(function (doc) {

                document.getElementById('report_start').style.display = 'block';
                $('#log_report').html("");                        //Clear text field
                countissue = 0;                                   // Set count number to 0
                oauth_token = 'token ' + doc.data().accessToken;  // Get OAuth TOken
                // oauth_token = 'token ' + 'f50ec21226ff6253b0d28b758f9846a834202557';
                console.log("Initializing report, please wait..");
                console.log("Oauth token: " + oauth_token);
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
    // currentValue = document.getElementById("log_report").innerHTML
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
    var url = 'https://api.github.com/repos/firebase/' + repo_name + '/issues?sort=' + rest_api_sort_param + '&state=' + rest_api_state_param + '&page=' + `${pageNo}` + '';
    // var url = 'https://api.github.com/repos/firebase/' + repo_name + '/issues?since=' + queryDate + '&sort=' + rest_api_sort_param + '&state=' + rest_api_state_param + '&page=' + `${pageNo}` + '';
    console.log(url);
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

// // Get all issues
// // Documentation: https://developer.github.com/v3/issues/
// // Note GitHub's REST API v3 considers every pull request an issue.
// const getListOfIssues = async function (pageNo = 1) {
//     var url = 'https://api.github.com/orgs/firebase/members?page=' + `${pageNo}` + '';
//     console.log(url);
//     const apiResults = await fetch(url, {
//         method: 'GET',
//         headers: {
//             'Authorization': oauth_token
//         }
//     }).then(resp => {
//         return resp.json();
//     });
//     return apiResults;
// }

// const getEntireIssueList = async function (pageNo = 1) {
//     const results = await getListOfIssues(pageNo);
//     console.log("Retreiving data from API for page : " + pageNo);
//     if (results.length > 0) {
//         return results.concat(await getEntireIssueList(pageNo + 1));
//     } else {
//         return results;
//     }
// };


// Get issue timeline
// Documentation: https://developer.github.com/v3/issues/timeline/
const getIssueTimeline = async function (issue_number, pageNo = 1) {
    // issue_number = '1006';
    var url = 'https://api.github.com/repos/firebase/' + repo_name + '/issues/' + issue_number + '/timeline?page=' + `${pageNo}` + '';
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
    logReport("Issue Number,POC Assignee,Date Logged,Reporter,Triage Start Date,Triaged by,FR Date, FR Rate, FR by,Triage Completion,Last label changed by,Date Closed,Type,API");
    logReport("\n");


    for (var i = 0, length = keys.length; i < length; i++) {
        var date_created = new Date(myJson[i].created_at);
        var date_queryy = new Date(queryDate);
        if (myJson[i].pull_request == undefined && (date_created.getTime() >= date_queryy.getTime())) { // only those Github issues
            var issue_number = ''
            var poc_assignee = '';
            var date_logged = '';
            var reporter = '';
            var triage_start_date = '';
            var triaged_by = '';
            var fR_date = '';
            var fr_rate = '';
            var fR_by = '';
            var triage_completion = '';
            var last_label_changed_by = '';
            var date_closed = '';
            var type = '';
            var api = '';

            issue_number = myJson[i].number
            if (myJson[i].assignee != null) {
                poc_assignee = myJson[i].assignee.login
            } else {
                poc_assignee = ""
            }
            date_logged = myJson[i].created_at

            if (myJson[i].state == "open") {
                date_closed = ''
            } else {
                date_closed = formatDate(myJson[i].closed_at)
            }

            reporter = myJson[i].user.login

            for (var xx = 0, lengths = myJson[i].labels.length; xx < lengths; xx++) {
                api = api + myJson[i].labels[xx].name + ";";
            }

            var typesss = api.indexOf("feature");
            type = "issue";
            if (typesss >= 0) {
                type = "feature request";
            }

            var typesss = api.indexOf("bug");
            if (typesss >= 0) {
                type = "bug";
            }

            var typesss = api.indexOf("question");
            if (typesss >= 0) {
                type = "question";
            }

            var has_need_info = api.indexOf("needs-info");

            if (has_need_info >= 0) {
                triage_completion = "";
            }

            const created_at = myJson[i].created_at
            const state = myJson[i].state
            const html_url = myJson[i].html_url

            const myTimeline = await getEntireTimeline(issue_number, pageNo = 1);
            var myTimelineKeys = Object.keys(myTimeline);

            for (var y = 0, lengths = myTimelineKeys.length; y < lengths; y++) {
                // first label
                for (var x = 0, length2 = myTimelineKeys.length; x < length2; x++) {
                    var checkUser = githubUsers.includes(myTimeline[x].actor.id);
                    var isLabelled = labelEvent.includes(myTimeline[x].event);


                    var date2 = new Date(myTimeline[x].created_at);
                    var date3 = new Date(created_at);

                    var difference_in_time2 = date2.getTime() - date3.getTime();

                    if (checkUser && myTimeline[x].event == "labeled") {
                        triage_start_date = formatDate(myTimeline[x].created_at) + " (" + msToTime(difference_in_time2) + ")";
                        triaged_by = myTimeline[x].actor.login;
                        break;
                    }
                }

                for (var x = 0, length2 = myTimelineKeys.length; x < length2; x++) {
                    var checkUser = githubUsers.includes(myTimeline[x].actor.id);
                    var isLabelled = labelEvent.includes(myTimeline[x].event);

                    if (checkUser && isLabelled) {
                        last_label_changed_by = myTimeline[x].actor.login;
                    }
                }

                for (var x = 0, length2 = myTimelineKeys.length; x < length2; x++) {

                    if (myTimeline[x].event == "unlabeled" && myTimeline[x].label.name == "needs-info") {
                        triage_completion = formatDate(myTimeline[x].created_at);
                        break;
                    }

                    if (myTimeline[x].event == "unlabeled" && myTimeline[x].label.name == "needs-triage") {
                        triage_completion = formatDate(myTimeline[x].created_at);
                        break;
                    }
                }

                // first FR
                for (var x = 0, length2 = myTimelineKeys.length; x < length2; x++) {
                    var checkUser = githubUsers.includes(myTimeline[x].actor.id);
                    var date2 = new Date(myTimeline[x].created_at);
                    var date3 = new Date(created_at);

                    var difference_in_time2 = date2.getTime() - date3.getTime();
                    if (checkUser && (myTimeline[x].event == "commented")) {

                        fR_date = formatDate(myTimeline[x].created_at);
                        fr_rate = msToTime(difference_in_time2)
                        fR_by = myTimeline[x].actor.login;
                        break;
                    }
                }

                logReport(issue_number + ','
                    + poc_assignee + ','
                    + formatDate(date_logged) + ','
                    + reporter + ','
                    + triage_start_date + ','
                    + triaged_by + ','
                    + fR_date + ','
                    + fr_rate + ','
                    + fR_by + ','
                    + triage_completion + ','
                    + last_label_changed_by + ','
                    + date_closed + ','
                    + type + ','
                    + api + ',');
                break;
            }
            logReport("\n");
        }
    }


    var data = document.getElementById("log_report").textContent;
    document.getElementById('report_start').style.display = 'none';
    downloadFile(data);
    console.log("Report completed!");
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

function downloadFile(urlData) {
    var blob = new Blob([urlData]);
    if (window.navigator.msSaveOrOpenBlob)  // IE hack; see http://msdn.microsoft.com/en-us/library/ie/hh779016.aspx
        window.navigator.msSaveBlob(blob, "" + repo_name + "" + queryDate + ".csv");
    else {
        var a = window.document.createElement("a");
        a.href = window.URL.createObjectURL(blob, { type: "text/plain" });
        a.download = "" + repo_name + " " + queryDate + ".csv";
        document.body.appendChild(a);
        a.click();  // IE: "Access is denied"; see: https://connect.microsoft.com/IE/feedback/details/797361/ie-10-treats-blob-url-as-cross-origin-and-denies-access
        document.body.removeChild(a);
    }
}

