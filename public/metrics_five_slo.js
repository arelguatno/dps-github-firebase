// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();

var oauth_token = ''
var repo_name = '';
var queryDate = '';
var countissue = 0;

var valueToPush = [];
var arrayValue = [[]];

var table = document.getElementById("table");


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
                clearTable();
                countissue = 0;                                   // Set count number to 0
                oauth_token = 'token ' + doc.data().accessToken;  // Get OAuth TOken
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
    // var url = 'https://api.github.com/repos/firebase/firebase-android-sdk/issues/2580';
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
    // issue_number = '2580';
    var url = 'https://api.github.com/repos/' + repo_name + '/issues/' + issue_number + '/timeline?page=' + `${pageNo}` + '';
    console.log(url);
    document.getElementById('report_start').innerHTML = "Getting events in issue#" + issue_number;
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

    // logReport("Issue Number,POC Assignee,Date Logged,Reporter, Reporter FB?,Triage Start Date,Triage Start Rate,Triaged by,Triage FB?,FR Date, FR Rate, FR by, FR FB?,First Need Info Date,First Need Info by, NI FB?,Triage Completion,Triage Completion Rate,Last label changed by,Completed FB?,Date Closed,Closed by,Type,API");
    // logReport("\n");


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
            var slo_triage_8_hrs = 'No';
            var slo_triage_8_hrs_event = '';
            var slo_triage_8_hrs_date = '';
            var reporter_id = '';
            var data_fullfilled = false;

            issue_number = myJson[i].number
            date_logged = formatDate(myJson[i].created_at)

            reporter = myJson[i].user.login
            reporter_id = myJson[i].user.id;

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
                // SLO - Triage 8 HRS Computation

                // (0) Engineer filled the issue
                if (githubUsers.includes(myJson[i].user.id)) {
                    slo_triage_8_hrs = '-';
                    slo_triage_8_hrs_event = "Filled by Engineer";
                    slo_triage_8_hrs_date = "";
                    data_fullfilled = true;
                }

                // (1) Issue assigned to Engineer
                if (myJson[i].assignee != null && !data_fullfilled) {
                    for (var xx = 0, lengths = myJson[i].assignees.length; xx < lengths; xx++) {
                        if (githubUsers.includes(myJson[i].assignees[xx].id)) { //should be member of Firebase Org
                            slo_triage_8_hrs = '-';
                            slo_triage_8_hrs_event = 'Assigned to Engineer'
                            slo_triage_8_hrs_date = '';
                            data_fullfilled = true;
                            break;
                        }
                    }
                }

                // (2) Engineer commented 
                for (var x = 0, length2 = myTimelineKeys.length; x < length2 && !data_fullfilled; x++) {
                    if (myTimeline[x].event == "commented" && githubUsers.includes(myTimeline[x].actor.id)) {
                        slo_triage_8_hrs = '-';
                        slo_triage_8_hrs_event = 'Engineer commented on the issue';
                        slo_triage_8_hrs_date = formatDate(myTimeline[x].created_at);
                        data_fullfilled = true;
                        break;
                    }
                }

                // (3) Tagged to the correct API label
                for (var x = 0, length2 = myTimelineKeys.length; x < length2 && !data_fullfilled; x++) {
                    if (myTimeline[x].actor.id != google_oos_bot_uid // not bot
                        && myTimeline[x].event == "labeled"    // should be labeled
                        && myTimeline[x].actor.id != reporter_id  // should not be same reporter
                        && myTimeline[x].label.name.indexOf("api") >= 0) { // should have api label

                        if ((supportTeamUID.includes(myTimeline[x].actor.id))) {
                            slo_triage_8_hrs = checkEightHoursSLO(date_logged, myTimeline[x].created_at);
                            slo_triage_8_hrs_event = myTimeline[x].actor.login + ' added ' + myTimeline[x].label.name;
                            slo_triage_8_hrs_date = formatDate(myTimeline[x].created_at);
                            data_fullfilled = true;
                            break;
                        }
                    }
                }

                // (10) Support removed needs triage or new label
                for (var x = 0, length2 = myTimelineKeys.length; x < length2 && !data_fullfilled; x++) {
                    if (myTimeline[x].event == "unlabeled" && myTimeline[x].label.name == "new") {
                        slo_triage_8_hrs = checkEightHoursSLO(date_logged, myTimeline[x].created_at);
                        slo_triage_8_hrs_event = myTimeline[x].actor.login + ' removed the ' + myTimeline[x].label.name + ' label';
                        slo_triage_8_hrs_date = formatDate(myTimeline[x].created_at);
                        data_fullfilled = true;
                        break;
                    }
                }

                // (4) If cannot repro, asked for the additional info and labelled case as need_info
                for (var x = 0, length2 = myTimelineKeys.length; x < length2 && !data_fullfilled; x++) {
                    if (myTimeline[x].actor.id != google_oos_bot_uid && myTimeline[x].event == "labeled" &&
                        (myTimeline[x].label.name == "needs-info" || myTimeline[x].label.name == "needs info")) {

                        if ((supportTeamUID.includes(myTimeline[x].actor.id))) {
                            slo_triage_8_hrs = checkEightHoursSLO(date_logged, myTimeline[x].created_at);
                            slo_triage_8_hrs_event = myTimeline[x].actor.login + ' labeled case as need_info';
                            slo_triage_8_hrs_date = formatDate(myTimeline[x].created_at);
                            data_fullfilled = true;
                            break;
                        }
                    }
                }

                // (5) Feature requests are identified and labelled as appropriate
                for (var x = 0, length2 = myTimelineKeys.length; x < length2 && !data_fullfilled; x++) {
                    if (myTimeline[x].actor.id != google_oos_bot_uid // not bot
                        && myTimeline[x].event == "labeled"    // should be labeled
                        && myTimeline[x].actor.id != reporter_id  // should not be same reporter
                        && myTimeline[x].label.name.indexOf("feature") >= 0) { // should have feature request

                        if ((supportTeamUID.includes(myTimeline[x].actor.id))) {
                            slo_triage_8_hrs = checkEightHoursSLO(date_logged, myTimeline[x].created_at);
                            slo_triage_8_hrs_event = myTimeline[x].actor.login + ' labeled case as Feature request';
                            slo_triage_8_hrs_date = formatDate(myTimeline[x].created_at);
                            data_fullfilled = true;
                            break;
                        }
                    }
                }

                // (6) If known bugs, tagged accordingly
                for (var x = 0, length2 = myTimelineKeys.length; x < length2 && !data_fullfilled; x++) {
                    if (myTimeline[x].actor.id != google_oos_bot_uid // not bot
                        && myTimeline[x].event == "labeled"    // should be labeled
                        && myTimeline[x].actor.id != reporter_id  // should not be same reporter
                        && myTimeline[x].label.name.indexOf("bug") >= 0) { // should have feature request

                        if ((supportTeamUID.includes(myTimeline[x].actor.id))) {
                            slo_triage_8_hrs = checkEightHoursSLO(date_logged, myTimeline[x].created_at);
                            slo_triage_8_hrs_event = myTimeline[x].actor.login + ' labeled case as Bug';
                            slo_triage_8_hrs_date = formatDate(myTimeline[x].created_at);
                            data_fullfilled = true;
                            break;
                        }
                    }
                }

                // (7) Duplicate (issue closed)
                for (var x = 0, length2 = myTimelineKeys.length; x < length2 && !data_fullfilled; x++) {
                    if (myTimeline[x].actor.id != google_oos_bot_uid // not bot
                        && myTimeline[x].event == "labeled"    // should be labeled
                        && myTimeline[x].actor.id != reporter_id  // should not be same reporter
                        && myTimeline[x].label.name.indexOf("duplicate") >= 0) { // should have duplicate

                        if ((supportTeamUID.includes(myTimeline[x].actor.id))) {
                            slo_triage_8_hrs = checkEightHoursSLO(date_logged, myTimeline[x].created_at);
                            slo_triage_8_hrs_event = myTimeline[x].actor.login + ' labeled case as Duplicate';
                            slo_triage_8_hrs_date = formatDate(myTimeline[x].created_at);
                            data_fullfilled = true;
                            break;
                        }
                    }
                }

                // (6) Support commented and Closed the issue
                var found_support_fr = false;
                var commented_date = "";
                for (var x = 0, length2 = myTimelineKeys.length; x < length2 && !data_fullfilled; x++) {

                    if (myTimeline[x].event == "commented" && supportTeamUID.includes(myTimeline[x].actor.id) && !found_support_fr) {
                        found_support_fr = true
                        commented_date = myTimeline[x].created_at;
                    }

                    if (found_support_fr && myTimeline[x].event == "closed" && supportTeamUID.includes(myTimeline[x].actor.id) && state == 'closed') {
                        slo_triage_8_hrs = checkEightHoursSLO(date_logged, commented_date);
                        slo_triage_8_hrs_event = myTimeline[x].actor.login + ' commented and closed the issue';
                        slo_triage_8_hrs_date = formatDate(commented_date);
                        data_fullfilled = true;
                        break;
                    }
                }

                // (7) Support provided first response
                for (var x = 0, length2 = myTimelineKeys.length; x < length2 && !data_fullfilled; x++) {
                    if (myTimeline[x].event == "commented" && supportTeamUID.includes(myTimeline[x].actor.id)) {
                        slo_triage_8_hrs = checkEightHoursSLO(date_logged, myTimeline[x].created_at);
                        slo_triage_8_hrs_event = myTimeline[x].actor.login + ' provided first reponse';
                        slo_triage_8_hrs_date = formatDate(myTimeline[x].created_at);
                        data_fullfilled = true;
                        break;
                    }
                }

                // (10) Support removed needs triage or new label
                for (var x = 0, length2 = myTimelineKeys.length; x < length2 && !data_fullfilled; x++) {
                    if (myTimeline[x].event == "unlabeled" && myTimeline[x].label.name == "needs-triage") {
                        slo_triage_8_hrs = checkEightHoursSLO(date_logged, myTimeline[x].created_at);
                        slo_triage_8_hrs_event = myTimeline[x].actor.login + ' removed the ' + myTimeline[x].label.name + ' label';
                        slo_triage_8_hrs_date = formatDate(myTimeline[x].created_at);
                        data_fullfilled = true;
                        break;
                    }
                }

                valueToPush.push(issue_number);
                valueToPush.push(formatDate(date_created.getTime()));
                valueToPush.push(capitalizeFirstLetter(myJson[i].state));
                valueToPush.push("--");
                valueToPush.push(slo_triage_8_hrs);
                valueToPush.push(slo_triage_8_hrs_event);
                valueToPush.push(slo_triage_8_hrs_date);
                valueToPush.push("--");
                valueToPush.push("");
                valueToPush.push("");
                valueToPush.push("");
                valueToPush.push("--");
                valueToPush.push("");
                valueToPush.push("");
                valueToPush.push("");
                valueToPush.push("--");
                // valueToPush.push("SLO - First Repro Attempt");
                // valueToPush.push("Event");
                // valueToPush.push("Date");
                // valueToPush.push("--");
                // valueToPush.push("SLO - Second Repro Attempt");
                // valueToPush.push("Event");
                // valueToPush.push("Date");
                // valueToPush.push("--");
                arrayValue.push(valueToPush);
                // logReport(issue_number + ','
                //     + poc_assignee + ','
                //     + date_logged + ','
                //     + reporter + ','
                //     + reporter_fb + ','
                //     + triage_start_date + ','
                //     + triage_start_rate + ','
                //     + triaged_by + ','
                //     + triage_fb + ','
                //     + fR_date + ','
                //     + fr_rate + ','
                //     + fR_by + ','
                //     + fr_fb + ','
                //     + first_need_info_date + ','
                //     + first_need_info_by + ','
                //     + ni_fb + ','
                //     + triage_completion + ','
                //     + triage_completion_rate + ','
                //     + last_label_changed_by + ','
                //     + completed_fb + ','
                //     + date_closed + ','
                //     + closed_by + ','
                //     + type + ','
                //     + api + ',');
                break;
            }
            logReport("\n");
            valueToPush = [];
        }
    }

    for (var i = 0; i < arrayValue.length; i++) {
        // create a new row
        var newRow = table.insertRow(table.length);
        for (var j = 0; j < arrayValue[i].length; j++) {
            // create a new cell
            var cell = newRow.insertCell(j);

            // add value to the cell
            cell.innerHTML = arrayValue[i][j];
        }
    }

    var data = document.getElementById("log_report").textContent;
    document.getElementById('report_start').style.display = 'none';
    // downloadFile(data);
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


function clearTable() {
    var tableHeaderRowCount = 1;
    var rowCount = table.rows.length;
    for (var i = tableHeaderRowCount; i < rowCount; i++) {
        table.deleteRow(tableHeaderRowCount);
    }
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

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
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



function checkEightHoursSLO(issue_date_created, event_date) {
    var date_created_issue = new Date(issue_date_created);
    var event_datee = new Date(event_date);
    var slo = new Date(getEightHoursSLO(date_created_issue));

    if (event_datee.getTime() <= slo.getTime()) {
        return "Pass";
    } else {
        return "Fail";
    }
}

function getEightHoursSLO(date1) {
    var date_to_date = new Date(date1);
    const slo_hrs = 8;
    const shift_start = "17"; //5PM
    const shift_end = "03";  //3AM

    // Convert date to Monday Business Hrs if issue came Saturday, Sunday and Monday.
    if ((date_to_date.getDay() == 6) && date_to_date.getHours() >= 3) { // saturday
        date_to_date.setDate(date_to_date.getDate() + 2);
        date_to_date.setHours(shift_start);
        date_to_date.setMinutes(0);
    } else if ((date_to_date.getDay() == 0)) {  // sunday
        date_to_date.setDate(date_to_date.getDate() + 1);
        date_to_date.setHours(shift_start);
        date_to_date.setMinutes(0);
    } else if (date_to_date.getDay() == 1 && date_to_date.getHours() <= shift_start) { // monday non business hrs
        if (date_to_date.getHours() == shift_start) {
            // nothing here
        } else {
            date_to_date.setHours(shift_start);
            date_to_date.setMinutes(0);
        }
    }

    var new_date = date_to_date.toString();
    var convert_date_to_time_in = formatDate2(new_date) + " " + shift_start + ":00";  // convert date to mm-dd-yyyy 5PM
    var date_at_5pm = new Date(convert_date_to_time_in);

    var issue_created_date = new Date(new_date);
    var getDateHours = parseFloat(issue_created_date.getHours() + "." + issue_created_date.getMinutes());

    if (getDateHours >= shift_end && getDateHours <= shift_start) { // issues came on weekdays non business hours

        date_at_5pm.setHours(date_at_5pm.getHours() + slo_hrs);
        return date_at_5pm;

    } else { // issues came on weekdays business hrs

        issue_created_date.setHours(issue_created_date.getHours() + slo_hrs);
        var getDD = parseFloat(issue_created_date.getHours() + "." + issue_created_date.getMinutes());

        if (getDD <= "3") { // SLO is within business hrs 3AM
            return issue_created_date;
        } else { // SLO exceeded business hrs 3am so remain hrs/minutes pass to next day
            var decimal = issue_created_date.getMinutes();

            var ddd = parseFloat(issue_created_date.getHours() + "." + issue_created_date.getMinutes());
            var diff = (ddd - shift_end) + 14; //next day

            var convert_date_to_time_out = new Date(formatDate2(issue_created_date) + " " + shift_end + ":00");
            var integerPart = parseInt(parseInt(diff.toFixed(2)));

            convert_date_to_time_out.setHours(convert_date_to_time_out.getHours() + integerPart);
            convert_date_to_time_out.setMinutes(decimal);

            var getDDD = parseFloat(convert_date_to_time_out.getHours() + "." + convert_date_to_time_out.getMinutes());

            if (getDDD >= "3" && convert_date_to_time_out.getDay() == 6) {
                convert_date_to_time_out.setHours(convert_date_to_time_out.getHours() + 48); // 2 days
                return convert_date_to_time_out;
            } else {
                if (convert_date_to_time_out.getDay() == 0) { // SLO landed on sunday
                    convert_date_to_time_out.setHours(convert_date_to_time_out.getHours() + 48); // 2 days
                    return convert_date_to_time_out;
                } else {
                    return convert_date_to_time_out;
                }
            }
        }
    }
}

function formatDate2(s_date) {
    var date = new Date(s_date);
    //Output: 2021-04-01 5:50 AM
    return date.getFullYear() + "-" + ((date.getMonth() > 8) ? (date.getMonth() + 1) : ('0' + (date.getMonth() + 1))) + '-' + ((date.getDate() > 9) ? date.getDate() : ('0' + date.getDate()))
}

// 2021-04-14T13:13:40Z
//2021-03-25T17:08:01Z

//testing SDK 2021-04-14T08:55:30Z
//needs triage 2021-04-14T08:55:40Z
//feature request 2021-04-14T13:13:40Z
// console.log(formatDate("2021-04-14T13:13:40Z"));
// var newDate = new Date("2021-04-14T13:13:40Z");
// console.log(newDate);


