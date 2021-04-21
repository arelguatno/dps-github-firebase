// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();
var db = firebase.firestore();

var oauth_token = ''
var repo_name = '';
var queryDate = '';
var countissue = 0;
var participants_array = [];

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
    document.getElementById('report_start').innerHTML = "Retreiving data from API for page : " + pageNo;
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
    document.getElementById('report_start').innerHTML = "Getting timelines of issue#" +issue_number;
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
    logReport("Queue,Issue Number,POC Assignee, Assigned Date, Date Logged,Reporter, Reporter FB?,Triage Start Date (First labeled Date),Triage Start Rate,Triaged by,Triage FB?,First FR Date, First FR Rate, First FR by, FR FB?,First Need Info Date,First Need Info by, NI FB?,Triage Completion,Triage Completion Rate,Last label changed by,Completed FB?,Date Closed,Closed by,Type,API,Dev Response Dates,Participants");
    logReport("\n");


    for (var i = 0, length = keys.length; i < length; i++) {
        var date_created = new Date(myJson[i].created_at);
        var date_queryy = new Date(queryDate);
        if (myJson[i].pull_request == undefined && (date_created.getTime() >= date_queryy.getTime())) { // only those Github issues
            var queue_pr = '';
            var issue_number_pr = '';
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
            var first_need_info_date = ''
            var first_need_info_by = ''
            var triage_start_rate = '';
            var reporter_fb = '';
            var triage_fb = '';
            var fr_fb = '';
            var ni_fb = '';
            var completed_fb = '';
            var triage_completion_rate = '';
            var closed_by = '';
            var dev_response_dates = '';
            var participants = '';
            var reporter_id = '';
            var assigned_date = '';

            issue_number = myJson[i].number
            issue_number_pr = issueNumberWithHyperLink(myJson[i].html_url, issue_number);
            queue_pr = getRepoName(repo_name);

            if (myJson[i].assignee != null) {
                poc_assignee = myJson[i].assignee.login
            } else {
                poc_assignee = ""
            }
            date_logged = formatDate(myJson[i].created_at)

            if (myJson[i].state == "open") {
                date_closed = ''
            } else {
                date_closed = formatDate(myJson[i].closed_at)
            }

            reporter = myJson[i].user.login
            reporter_fb = checkUserMembership(myJson[i].user.id, myJson[i].user.login);
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

            var has_need_info = api.indexOf("needs-info");
            var has_need_info2 = api.indexOf("needs info");

            if (has_need_info >= 0 || has_need_info2 >= 0) {
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

                    if (myTimeline[x].actor.id != google_oos_bot_uid && myTimeline[x].event == "labeled" && myTimeline[x].actor.id != reporter_id) {
                        triage_start_date = formatDate(myTimeline[x].created_at);
                        triage_start_rate = msToTimeToHours(difference_in_time2)
                        triaged_by = myTimeline[x].actor.login;
                        triage_fb = checkUserMembership(myTimeline[x].actor.id, myTimeline[x].actor.login)
                        break;
                    }
                }

                for (var x = 0, length2 = myTimelineKeys.length; x < length2; x++) {
                    var checkUser = githubUsers.includes(myTimeline[x].actor.id);
                    var isLabelled = labelEvent.includes(myTimeline[x].event);

                    if (myTimeline[x].actor.id != google_oos_bot_uid && isLabelled) {
                        last_label_changed_by = myTimeline[x].actor.login;
                        completed_fb = checkUserMembership(myTimeline[x].actor.id, myTimeline[x].actor.login);
                    }
                    // closed_by
                    if (myTimeline[x].event == "closed") {
                        closed_by = checkUserMembership(myTimeline[x].actor.id, myTimeline[x].actor.login);
                    }

                    // dev response dates
                    if ((myTimeline[x].event == "commented") && (myTimeline[x].actor.id == reporter_id)) {
                        dev_response_dates = dev_response_dates + formatDate(myTimeline[x].created_at) + ";";;
                    }

                    //participants
                    if (myTimeline[x].actor.id != google_oos_bot_uid) {
                        participants_array.push(myTimeline[x].actor.login);
                    }

                    if (myTimeline[x].event == "assigned"){
                        poc_assignee = myTimeline[x].actor.login;
                        assigned_date = formatDate(myTimeline[x].created_at);
                    }

                }

                participants_array.push(reporter);
                let dup = [...new Set(participants_array)];
                participants = dup.join(';');

                for (var x = 0, length2 = myTimelineKeys.length; x < length2; x++) {
                    var date2 = new Date(myTimeline[x].created_at);
                    var date3 = new Date(created_at);

                    var difference_in_time2 = date2.getTime() - date3.getTime();

                    if (myTimeline[x].event == "unlabeled" && (myTimeline[x].label.name == "needs-info" || myTimeline[x].label.name == "needs info")) {
                        triage_completion = formatDate(myTimeline[x].created_at);
                        triage_completion_rate = msToTimeToHours(difference_in_time2);
                        break;
                    }

                    // Unity SDK is using new Label
                    if (myTimeline[x].event == "unlabeled" && (myTimeline[x].label.name == "needs-triage" || myTimeline[x].label.name == "new")) {
                        triage_completion = formatDate(myTimeline[x].created_at);
                        triage_completion_rate = msToTimeToHours(difference_in_time2);
                        break;
                    }
                }

                // first FR
                for (var x = 0, length2 = myTimelineKeys.length; x < length2; x++) {
                    var checkUser = githubUsers.includes(myTimeline[x].actor.id);
                    var date2 = new Date(myTimeline[x].created_at);
                    var date3 = new Date(created_at);

                    var difference_in_time2 = date2.getTime() - date3.getTime();

                    if ((myTimeline[x].actor.id != google_oos_bot_uid) && (myTimeline[x].event == "commented") && (myTimeline[x].actor.login != reporter)) {
                        fR_date = formatDate(myTimeline[x].created_at);
                        fr_rate = msToTimeToHours(difference_in_time2)
                        fR_by = myTimeline[x].actor.login;
                        fr_fb = checkUserMembership(myTimeline[x].actor.id, myTimeline[x].actor.login);
                        break;
                    }
                }

                // First need info
                for (var x = 0, length2 = myTimelineKeys.length; x < length2; x++) {
                    var checkUser = githubUsers.includes(myTimeline[x].actor.id);

                    if (myTimeline[x].actor.id != google_oos_bot_uid && myTimeline[x].event == "labeled" && (myTimeline[x].label.name == "needs-info" || myTimeline[x].label.name == "needs info")) {
                        first_need_info_date = formatDate(myTimeline[x].created_at);
                        first_need_info_by = myTimeline[x].actor.login;
                        ni_fb = checkUserMembership(myTimeline[x].actor.id, myTimeline[x].actor.login);
                        break;
                    }
                }

                logReport(queue_pr + ','
                    + issue_number_pr + ','
                    + poc_assignee + ','
                    + assigned_date + ','
                    + date_logged + ','
                    + reporter + ','
                    + reporter_fb + ','
                    + triage_start_date + ','
                    + triage_start_rate + ','
                    + triaged_by + ','
                    + triage_fb + ','
                    + fR_date + ','
                    + fr_rate + ','
                    + fR_by + ','
                    + fr_fb + ','
                    + first_need_info_date + ','
                    + first_need_info_by + ','
                    + ni_fb + ','
                    + triage_completion + ','
                    + triage_completion_rate + ','
                    + last_label_changed_by + ','
                    + completed_fb + ','
                    + date_closed + ','
                    + closed_by + ','
                    + type + ','
                    + api + ','
                    + dev_response_dates + ','
                    + participants);


                break;
            }
            participants_array = [];
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