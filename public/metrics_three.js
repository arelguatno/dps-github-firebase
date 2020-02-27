// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();
var db = firebase.firestore();

const issueEvents = ["labeled", "unlabeled", "commented", "closed", "opened"];
const labelEvent = ["labeled", "unlabeled"];
const issueState = ["closed", "reopened"];
const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];


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
    var url = 'https://api.github.com/repos/' + repo_name + '/issues?sort=' + rest_api_sort_param + '&state=' + rest_api_state_param + '&page=' + `${pageNo}` + '';
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
    logReport("Queue,Issue #,Date Logged, Engineer's Initial Response Time (hrs),Support's Initial Response Time (hrs),Total Number of Responses,Number of Support Responses,Number of Engineers Responses,Number of External Developer Responses,Number of Triage Activity,Number of api labeling,Number of type labeling,Number of Need Info labeling,Closed Date,Close Time (hrs),Close Time (days),Closed by,Repro,Response,Close,Month Logged");
    logReport("\n");


    for (var i = 0, length = keys.length; i < length; i++) {
        var date_created = new Date(myJson[i].created_at);
        var date_queryy = new Date(queryDate);
        if (myJson[i].pull_request == undefined && (date_created.getTime() >= date_queryy.getTime())) { // only those Github issues
            var issue_number = '';
            var date_logged = '';
            var initial_response_time_hrs = '';
            var total_number_of_responses = 0;
            var number_of_support_responses = 0;
            var number_of_engineers_responses = 0;
            var number_of_external_developer_responses = 0;
            var number_of_triage_activity = 0;
            var number_of_api_labeling = 0;
            var number_of_type_labeling = 0;
            var number_of_need_info_Labeling = 0;
            var closed_date = '';
            var close_time_hrs = '';
            var close_time_days = '';
            var repro = '';
            var response = '';
            var close = '';
            var month_Logged = '';
            var reporter = ''
            var engineer_initial_response_time = '';
            var closed_by = '';

            issue_number = myJson[i].number
            date_logged = formatDate(myJson[i].created_at)
            month_Logged = formatDateMonth(myJson[i].created_at);
            reporter = myJson[i].user.login

            repro = await getIssueReproMessage(getRepoName(repo_name), issue_number.toString());

            if (myJson[i].state == "open") {
                closed_date = ''
                close_time_hrs = '';
                close = 'open'
            } else {
                closed_date = formatDate(myJson[i].closed_at)

                var date2 = new Date(myJson[i].closed_at);
                var date3 = new Date(myJson[i].created_at);

                var difference_in_time2 = date2.getTime() - date3.getTime();
                close_time_hrs = msToTimeToHours(difference_in_time2);
                close = msToTime(difference_in_time2);
                close_time_days = msToTimeDays(difference_in_time2);
            }

            const created_at = myJson[i].created_at
            const html_url = myJson[i].html_url

            const myTimeline = await getEntireTimeline(issue_number, pageNo = 1);
            var myTimelineKeys = Object.keys(myTimeline);

            for (var y = 0, lengths = myTimelineKeys.length; y < lengths; y++) {

                // Initial Response 
                for (var x = 0, length2 = myTimelineKeys.length; x < length2; x++) {
                    var date2 = new Date(myTimeline[x].created_at);
                    var date3 = new Date(created_at);

                    var difference_in_time2 = date2.getTime() - date3.getTime();

                    if ((myTimeline[x].actor.id != google_oos_bot_uid) && (myTimeline[x].event == "commented") && (supportTeamUID.includes(myTimeline[x].actor.id))) {
                        initial_response_time_hrs = msToTimeToHours(difference_in_time2)
                        break;
                    }

                    if ((myTimeline[x].actor.id != google_oos_bot_uid) && (myTimeline[x].event == "commented") && (githubUsers.includes(myTimeline[x].actor.id))) {
                        engineer_initial_response_time = msToTimeToHours(difference_in_time2)
                        break;
                    }
                }

                for (var x = 0, length2 = myTimelineKeys.length; x < length2; x++) {

                    if (myTimeline[x].actor.id != google_oos_bot_uid) {

                        if ((myTimeline[x].event == "commented")) {
                            ++total_number_of_responses;
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

                        if (myTimeline[x].event == "labeled") {
                            ++number_of_triage_activity;
                            var labelName = myTimeline[x].label.name;


                            if (labelName.indexOf("api") >= 0) {
                                ++number_of_api_labeling;
                            }

                            if (labelName.indexOf("type") >= 0) {
                                ++number_of_type_labeling;
                            }

                            if (labelName.indexOf("needs-info") >= 0 || labelName.indexOf("needs info") >= 0) {
                                ++number_of_need_info_Labeling;
                            }
                        }
                    }

                    // closed_by
                    if (myTimeline[x].event == "closed") {
                        closed_by = checkUserMembership(myTimeline[x].actor.id, myTimeline[x].actor.login);
                    }
                }


                logReport(repo_name + ','
                    + issue_number + ','
                    + date_logged + ','
                    + engineer_initial_response_time + ','
                    + initial_response_time_hrs + ','
                    + total_number_of_responses + ','
                    + number_of_support_responses + ','
                    + number_of_engineers_responses + ','
                    + number_of_external_developer_responses + ','
                    + number_of_triage_activity + ','
                    + number_of_api_labeling + ','
                    + number_of_type_labeling + ','
                    + number_of_need_info_Labeling + ','
                    + closed_date + ','
                    + close_time_hrs + ','
                    + close_time_days + ','
                    + closed_by + ','
                    + repro + ','
                    + response + ','
                    + close + ','
                    + month_Logged + ',');

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

function formatDateMonth(s_date) {
    var date = new Date(s_date);

    return (date.getMonth() + 1) + "-" + monthNames[date.getMonth()];
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

function checkUserMembership(user_id, user_name) {
    var checkFirebaseMembers = githubUsers.includes(user_id);
    var checkFirebaseSupports = supportTeamUID.includes(user_id);

    if (checkFirebaseMembers) {
        return "Internal (Firebase Members)";
    } else if (checkFirebaseSupports) {
        return "Support Team (arel/riza/rommel)"
    } else if (user_id == google_oos_bot_uid) {
        return "Google Bot"
    } else {
        return "External (developers)";
    }
}

