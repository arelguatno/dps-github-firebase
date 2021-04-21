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
    logReport("Queue,date,abtesting,ads,analytics,appdistribution,appindexing,auth,bom,core,crashlytics,database,dynamiclinks,firestore,functions,hosting,inappmessaging,installations,instanceid,invites,messaging,mlkit,performance,predictions,remoteconfig,segmentation,storage,tagmanager,testlab,total");
    logReport("\n");


    for (var i = 0, length = keys.length; i < length; i++) {
        var date_created = new Date(myJson[i].created_at);
        var date_queryy = new Date(queryDate);

        if (myJson[i].pull_request == undefined && (date_created.getTime() >= date_queryy.getTime())) { // only those Github issues
            var queue_pr = '';
            var date_pr = '';
            var abtesting_pr = 0;
            var ads_pr = 0;
            var analytics_pr = 0;
            var appdistribution_pr = 0;
            var appindexing_pr = 0;
            var auth_pr = 0;
            var bom_pr = 0;
            var core_pr = 0;
            var crashlytics_pr = 0;
            var database_pr = 0;
            var dynamiclinks_pr = 0;
            var firestore_pr = 0;
            var functions_pr = 0;
            var hosting_pr = 0;
            var inappmessaging_pr = 0;
            var installations_pr = 0;
            var instanceid_pr = 0;
            var invites_pr = 0;
            var messaging_pr = 0;
            var mlkit_pr = 0;
            var performance_pr = 0;
            var predictions_pr = 0;
            var remoteconfig_pr = 0;
            var segmentation_pr = 0;
            var storage_pr = 0;
            var tagmanager_pr = 0;
            var testlab_pr = 0;
            var total_pr = 0;

            queue_pr = getRepoName(repo_name);
             date_pr = formatDate(myJson[i].created_at)

            for (var x = 0, length2 = myJson[i].labels.length; x < length2; x++) {
                if (myJson[i].labels[x].name.indexOf("abtesting") >= 0) {
                    ++abtesting_pr;
                } else if (myJson[i].labels[x].name.indexOf("ads") >= 0) {
                    ++ads_pr;
                } else if (myJson[i].labels[x].name.indexOf("analytics") >= 0) {
                    ++analytics_pr;
                } else if (myJson[i].labels[x].name.indexOf("appdistribution") >= 0) {
                    ++appdistribution_pr;
                } else if (myJson[i].labels[x].name.indexOf("appindexing") >= 0) {
                    ++appindexing_pr;
                } else if (myJson[i].labels[x].name.indexOf("auth") >= 0) {
                    ++auth_pr;
                } else if (myJson[i].labels[x].name.indexOf("bom") >= 0) {
                    ++bom_pr;
                } else if (myJson[i].labels[x].name.indexOf("core") >= 0) {
                    ++core_pr;
                } else if (myJson[i].labels[x].name.indexOf("crashlytics") >= 0) {
                    ++crashlytics_pr;
                } else if (myJson[i].labels[x].name.indexOf("database") >= 0) {
                    ++database_pr;
                } else if (myJson[i].labels[x].name.indexOf("dynamiclinks") >= 0) {
                    ++dynamiclinks_pr;
                } else if (myJson[i].labels[x].name.indexOf("firestore") >= 0) {
                    ++firestore_pr;
                } else if (myJson[i].labels[x].name.indexOf("functions") >= 0) {
                    ++functions_pr;
                } else if (myJson[i].labels[x].name.indexOf("hosting") >= 0) {
                    ++hosting_pr;
                } else if (myJson[i].labels[x].name.indexOf("inappmessaging") >= 0) {
                    ++inappmessaging_pr;
                } else if (myJson[i].labels[x].name.indexOf("installations") >= 0) {
                    ++installations_pr;
                } else if (myJson[i].labels[x].name.indexOf("instanceid") >= 0) {
                    ++instanceid_pr;
                } else if (myJson[i].labels[x].name.indexOf("invites") >= 0) {
                    ++instanceid_pr;
                } else if (myJson[i].labels[x].name.indexOf("invites") >= 0) {
                    ++invites_pr;
                } else if (myJson[i].labels[x].name.indexOf("messaging") >= 0) {
                    ++messaging_pr;
                } else if (myJson[i].labels[x].name.indexOf("mlkit") >= 0) {
                    ++mlkit_pr;
                } else if (myJson[i].labels[x].name.indexOf("performance") >= 0) {
                    ++performance_pr;
                } else if (myJson[i].labels[x].name.indexOf("predictions") >= 0) {
                    ++predictions_pr;
                } else if (myJson[i].labels[x].name.indexOf("remoteconfig") >= 0) {
                    ++remoteconfig_pr;
                } else if (myJson[i].labels[x].name.indexOf("segmentation") >= 0) {
                    ++segmentation_pr;
                } else if (myJson[i].labels[x].name.indexOf("storage") >= 0) {
                    ++storage_pr;
                } else if (myJson[i].labels[x].name.indexOf("tagmanager") >= 0) {
                    ++tagmanager_pr;
                } else if (myJson[i].labels[x].name.indexOf("testlab") >= 0) {
                    ++testlab_pr;
                }
            }

            logReport(queue_pr + ','
                + date_pr + ','
                + abtesting_pr + ','
                + ads_pr + ','
                + analytics_pr + ','
                + appdistribution_pr + ','
                + appindexing_pr + ','
                + auth_pr + ','
                + bom_pr + ','
                + core_pr + ','
                + crashlytics_pr + ','
                + database_pr + ','
                + dynamiclinks_pr + ','
                + firestore_pr + ','
                + functions_pr + ','
                + hosting_pr + ','
                + inappmessaging_pr + ','
                + installations_pr + ','
                + instanceid_pr + ','
                + invites_pr + ','
                + messaging_pr + ','
                + mlkit_pr + ','
                + performance_pr + ','
                + predictions_pr + ','
                + remoteconfig_pr + ','
                + segmentation_pr + ','
                + storage_pr + ','
                + tagmanager_pr + ','
                + testlab_pr + ','
                + total_pr + ',');


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


