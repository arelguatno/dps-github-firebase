// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();
var db = firebase.firestore();

var oauth_token = ''
var repo_name = '';
var queryDate = '';
var countissue = 0;

//What to sort results by. Can be either created, updated, comments. Default: created
// Indicates the state of the issues to return. Can be either open, closed, or all. Default: open
var rest_api_state_param = "all";

var rest_api_sort_param = "created";

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
    repo_name = document.getElementById("repo").value;
    rest_api_sort_param = document.getElementById("sort_by").value;
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
        return "1.00";
    } else {
        return Math.round(hours) + ".00";
    }
}

// Get all issues
// Documentation: https://developer.github.com/v3/issues/
// Note GitHub's REST API v3 considers every pull request an issue.
const getListOfIssues = async function (pageNo = 1) {
    var url = 'https://api.github.com/repos/' + repo_name + '/issues?sort=' + rest_api_sort_param + '&state=' + rest_api_state_param + '&page=' + `${pageNo}` + '';
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


// Get issue timeline
// Documentation: https://developer.github.com/v3/issues/timeline/
const getIssueTimeline = async function (issue_number, pageNo = 1) {
    // issue_number = '1006';
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
    logReport("Queue,Issue #,Date Created,Report Group,1st Label Date,1st Label Group,1st Label Duration,FR Date,FR Group,FR Duration,Last Label Date,Last Label Group,Last Label Duration,Closed Date,Closed Group,Closed Duration,Type,API,Has Need Info?,Number of Support Responses,Number of Engineers Responses,Number of External Developer Responses,Last Updated Date,Last Updated Group");
    logReport("\n");


    for (var i = 0, length = keys.length; i < length; i++) {
        var date_created = new Date(myJson[i].created_at);
        var date_queryy = new Date(queryDate);
        if (myJson[i].pull_request == undefined && (date_created.getTime() >= date_queryy.getTime())) { // only those Github issues
            var queue = '';
            var issue_number = '';
            var date_created = '';
            var report_group = '';
            var first_label_date = '';
            var first_label_group = '';
            var first_label_duration = '';
            var fR_date = '';
            var fR_group = '';
            var fR_duration = '';
            var last_label_date = '';
            var last_label_group = '';
            var last_label_duration = '';
            var closed_date = '';
            var closed_group = '';
            var closed_duration = '';
            var type = '';
            var api = '';
            var has_need_info = '';
            var number_of_support_responses = '';
            var number_of_engineers_responses = '';
            var number_of_external_developer_responses = '';
            var last_updated_date = '';
            var last_updated_group = '';
            var reporter = '';
            var reporter_id = '';
            reporter = myJson[i].user.login
            var queue_pr = '';
            var issue_number_pr = '';


            if (repo_name.indexOf("android") >= 0) {
                queue = "Android";
            } else if (repo_name.indexOf("ios") >= 0) {
                queue = "iOS";
            } else if (repo_name.indexOf("js") >= 0) {
                queue = "JS";
            }

            issue_number = myJson[i].number
            issue_number_pr = issueNumberWithHyperLink(myJson[i].html_url, issue_number);
            queue_pr = getRepoName(repo_name);

            date_created = formatDate(myJson[i].created_at)
            report_group = checkUserMembership(myJson[i].user.id)
            reporter_id = myJson[i].user.id;

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

            const myTimeline = await getEntireTimeline(issue_number, pageNo = 1);
            var myTimelineKeys = Object.keys(myTimeline);

            for (var x = 0, lengths = myTimelineKeys.length; x < lengths; x++) {

                // First Label
                for (var x = 0, length2 = myTimelineKeys.length; x < length2; x++) {
                    var date2 = new Date(myTimeline[x].created_at);
                    var date3 = new Date(date_created);

                    var difference_in_time2 = date2.getTime() - date3.getTime();

                    if (myTimeline[x].actor.id != google_oos_bot_uid && myTimeline[x].event == "labeled" && myTimeline[x].actor.id != reporter_id) {
                        first_label_date = formatDate(myTimeline[x].created_at);
                        first_label_group = checkUserMembership(myTimeline[x].actor.id, myTimeline[x].actor.login);
                        first_label_duration = msToTimeToHours(difference_in_time2)
                        break;
                    }
                }

                // First FR
                for (var x = 0, length2 = myTimelineKeys.length; x < length2; x++) {
                    var date2 = new Date(myTimeline[x].created_at);
                    var date3 = new Date(date_created);

                    var difference_in_time2 = date2.getTime() - date3.getTime();

                    if ((myTimeline[x].actor.id != google_oos_bot_uid) && (myTimeline[x].event == "commented") && (myTimeline[x].actor.login != reporter)) {
                        fR_date = formatDate(myTimeline[x].created_at);
                        fR_group = checkUserMembership(myTimeline[x].actor.id, myTimeline[x].actor.login);
                        fR_duration = msToTimeToHours(difference_in_time2);
                        break;
                    }
                }

                // Last Label
                for (var x = 0, length2 = myTimelineKeys.length; x < length2; x++) {
                    var isLabelled = labelEvent.includes(myTimeline[x].event);
                    var date2 = new Date(myTimeline[x].created_at);
                    var date3 = new Date(date_created);

                    var difference_in_time2 = date2.getTime() - date3.getTime();

                    if (myTimeline[x].actor.id != google_oos_bot_uid && isLabelled) {
                        last_label_date = formatDate(myTimeline[x].created_at);
                        last_label_group = checkUserMembership(myTimeline[x].actor.id, myTimeline[x].actor.login);
                        last_label_duration = msToTimeToHours(difference_in_time2);
                    }

                    if (myTimeline[x].event == "closed") {
                        closed_date = formatDate(myTimeline[x].created_at);
                        closed_group = checkUserMembership(myTimeline[x].actor.id);
                        closed_duration = msToTimeToHours(difference_in_time2);
                    }

                    if (myTimeline[x].event == "labeled") {
                        if (myTimeline[x].actor.id != google_oos_bot_uid && (myTimeline[x].label.name == "needs-info" || myTimeline[x].label.name == "needs info")) {
                            has_need_info = "needs-info";
                        }
                    }

                    if (myTimeline[x].actor.id != google_oos_bot_uid) {
                        if ((myTimeline[x].event == "commented")) {
                            if ((supportTeamUID.includes(myTimeline[x].actor.id))) {
                                ++number_of_support_responses;
                            }

                            if ((githubUsers.includes(myTimeline[x].actor.id))) {
                                ++number_of_engineers_responses;
                            }

                            if ((!githubUsers.includes(myTimeline[x].actor.id)) && (!supportTeamUID.includes(myTimeline[x].actor.id))) {
                                ++number_of_external_developer_responses;
                            }
                        }
                    }

                    last_updated_date = formatDate(myTimeline[x].created_at);
                    last_updated_group = checkUserMembership(myTimeline[x].actor.id);

                }

                logReport(queue_pr + ','
                    + issue_number_pr + ','
                    + date_created + ','
                    + report_group + ','
                    + first_label_date + ','
                    + first_label_group + ','
                    + first_label_duration + ','
                    + fR_date + ','
                    + fR_group + ','
                    + fR_duration + ','
                    + last_label_date + ','
                    + last_label_group + ','
                    + last_label_duration + ','
                    + closed_date + ','
                    + closed_group + ','
                    + closed_duration + ','
                    + type + ','
                    + api + ','
                    + has_need_info + ','
                    + number_of_support_responses + ','
                    + number_of_engineers_responses + ','
                    + number_of_external_developer_responses + ','
                    + last_updated_date + ','
                    + last_updated_group + ',');

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


