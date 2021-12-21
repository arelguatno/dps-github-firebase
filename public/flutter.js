// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();
var db = firebase.firestore();

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
    queryDate = document.getElementById("datepicker").value + " 00:00:00";
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

function msToTimeDays(millisec) {
    var seconds = (millisec / 1000).toFixed(1);
    var minutes = (millisec / (1000 * 60)).toFixed(1);
    var hours = (millisec / (1000 * 60 * 60)).toFixed(1);
    var days = (millisec / (1000 * 60 * 60 * 24)).toFixed(1);

    if (seconds < 60) {
        return "";
    } else if (minutes < 60) {
        return "";
    } else if (hours < 24) {
        return "";
    } else {
        return days + " days"
    }
}


function msToTimeToHours(millisec) {
    var seconds = (millisec / 1000).toFixed(1);
    var minutes = (millisec / (1000 * 60)).toFixed(1);
    var hours = (millisec / (1000 * 60 * 60)).toFixed(1);

    if (seconds < 60) {
        return seconds + " sec";
    } else if (minutes < 60) {
        return minutes + " min";
    } else {
        return hours + " hrs";
    }
}

// Get all issues
// Documentation: https://developer.github.com/v3/issues/
// Note GitHub's REST API v3 considers every pull request an issue.
const getListOfIssues = async function (pageNo = 1) {
    var url = 'https://api.github.com/repos/flutter/website/issues?sort=created&state=' + rest_api_state_param + '&page=' + `${pageNo}` + '';
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
    // issue_number = '1006';
    var url = 'https://api.github.com/repos/flutter/website/issues/' + issue_number + '/timeline?page=' + `${pageNo}` + '';
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
    logReport("Queue,ID,Open Date,Issue Description,Labels,Resolution Date,#of comments");
    logReport("\n");

    // flutter/flutter  https://github.com/flutter/flutter/issues
    //flutter/website   https://github.com/flutter/website
    //firebaseextended/flutterfire   https://github.com/FirebaseExtended/flutterfire
    //6 months

    for (var i = 0, length = keys.length; i < length; i++) {
        var date_created = new Date(myJson[i].created_at);
        var date_queryy = new Date(queryDate);

        if (myJson[i].pull_request == undefined) { // only those Github issues

            var issue_number, issue_number_pr = '';
            var date_logged = '';
            var number_of_support_responses = 0;
            var number_of_support_labels = 0;
            var closed_by = '';
            var issue_status = '';
            var queue_pr = '';
            var group = '';
            var issue_description = ''
            var api = '';
            var date_closed = '';

            issue_number = myJson[i].number;
            issue_number_pr = issueNumberWithHyperLink(myJson[i].html_url, issue_number);
            queue_pr = getRepoName(repo_name);
            issue_description = myJson[i].title;

            date_logged = formatDate(myJson[i].created_at)
            month_Logged = formatDateMonth(myJson[i].created_at);
            reporter = myJson[i].user.login

            for (var xx = 0, lengths = myJson[i].labels.length; xx < lengths; xx++) {
                api = api + myJson[i].labels[xx].name + ";";
            }

            if (myJson[i].state == "open") {
                date_closed = ''
            } else {
                date_closed = formatDate(myJson[i].closed_at)
            }


            repro = await getIssueReproMessage(getRepoName(repo_name), issue_number.toString());

            const myTimeline = await getEntireTimeline(issue_number, pageNo = 1);
            var myTimelineKeys = Object.keys(myTimeline);

            if (myTimelineKeys.length == 0) {
                logReport('flutter/website' + ','
                    + issue_number_pr + ','
                    + date_logged + ','
                    + issue_description.replace(',', ' ') + ','
                    + api + ','
                    + date_closed + ','
                    + number_of_support_responses);
                logReport("\n");
            }

            for (var y = 0, lengths = myTimelineKeys.length; y < lengths; y++) {

                var date_queryy = new Date(queryDate);
                var created_att = new Date(myTimeline[y].created_at);


                // if (created_att.getTime() >= date_queryy.getTime()) {

                for (var x = 0, length2 = myTimelineKeys.length; x < length2; x++) {

                    if ((myTimeline[x].event == "commented")) {
                        ++number_of_support_responses;
                    }

                }
                logReport('flutter/website' + ','
                    + issue_number_pr + ','
                    + date_logged + ','
                    + issue_description.replace(',', ' ') + ',' // problem with multiple commas
                    + api + ','
                    + date_closed + ','
                    + number_of_support_responses);
                logReport("\n");
                break;

                // }

            }

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