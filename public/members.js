// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();
var members = ["a-maurice",
    "abeisgoat",
    "adamvduke",
    "afitz0",
    "alexames",
    "alexastrum",
    "aliafshar",
    "alikn",
    "allenktv",
    "alliegan",
    "allisonbm92",
    "allspain",
    "andreaowu",
    "andrewheard",
    "ankitaj224",
    "annzimmer",
    "anonymous-akorn",
    "ashwinraghav",
    "avolkovi",
    "baolocdo",
    "Berlioz",
    "bijanoviedo",
    "bjornick",
    "bkendall",
    "bklimt",
    "bojeil-google",
    "catman-19",
    "cdata",
    "ChaoqunCHEN",
    "chkuang-g",
    "chliangGoogle",
    "chong-shao",
    "christibbs",
    "ciarand",
    "clp93",
    "crabasa",
    "cynthiajoan",
    "dackers86",
    "danasilver",
    "dannhauser",
    "davidair",
    "davideast",
    "davidmotson",
    "dconeybe",
    "DellaBitta",
    "depoll",
    "dh--",
    "diwu-arete",
    "dmandar",
    "eburley",
    "egilmorez",
    "Ehesp",
    "eldhosembabu",
    "elenadoty",
    "elvisun",
    "eobrain",
    "erikeldridge",
    "erikhaddad",
    "Feiyang1",
    "fenmarel",
    "firebase-db-ci",
    "firebase-ios-github-robot",
    "firebase-ops",
    "firebase-promo",
    "fredquintana",
    "fredzqm",
    "Galadros",
    "gkaldev",
    "google-admin",
    "google-oss-bot",
    "googlebot",
    "gracebenz",
    "granluo",
    "gsakakihara",
    "gtknoke",
    "hiranya911",
    "hsubox76",
    "htcgh",
    "huangjeff5",
    "i14h",
    "i2amsam",
    "IanWyszynski",
    "ifielker",
    "ifratric",
    "IljaDaderko",
    "inlined",
    "jacquetd",
    "jakeouellette",
    "jamesdaniels",
    "JasonAHeron",
    "jasonhu-g",
    "JeffAtGoog",
    "jenperson",
    "jeremydurham",
    "jeremyjiang-dev",
    "jfcong",
    "jhuleatt",
    "JimLarson",
    "jladieu",
    "joehan",
    "jonsimantov",
    "jposuna",
    "jsdt",
    "kaibolay",
    "karayu",
    "karenyz",
    "katowulf",
    "kentengjin",
    "kevinajian",
    "kevinthecheung",
    "kevmoo",
    "khutchins",
    "kim-f",
    "kmandrika",
    "kmcnellis",
    "kokoro-team",
    "kroikie",
    "lahirumaramba",
    "leojaygoogle",
    "lepatryk",
    "LexusJulienne",
    "lmonteleone",
    "lsirac",
    "madi8229",
    "mah-fb-ec",
    "maksymmalyhin",
    "makuchaku",
    "malcolmdeck",
    "manjanac",
    "markarndt",
    "markbouchard",
    "mbleigh",
    "MeghaB",
    "melissaelopez",
    "micahstairs",
    "mikehaney24",
    "mjchristy",
    "mmermerkaya",
    "moemcd",
    "morganchen12",
    "mrichards",
    "mrober",
    "nbegley",
    "ncooke3",
    "nguymichael",
    "NickChittle",
    "nicolasgarnier",
    "nitin-kaushik",
    "NothingEverHappens",
    "nrsim",
    "patm1987",
    "paulb777",
    "paulinon",
    "PaulRashidi",
    "PaulTR",
    "pavelgj",
    "petea",
    "peterfriese",
    "prakhar1989",
    "pranavrajgopal",
    "proppy",
    "puf",
    "racheldoshcollins",
    "rachelmyers",
    "rachelsaunders",
    "rafikhan",
    "rajgundluru",
    "ramanpreetSinghKhinda",
    "raymondlam",
    "rebehe",
    "RelaxedPear",
    "renkelvin",
    "richieforeman",
    "rlazo",
    "rnakhan",
    "robdodson",
    "rohandandavati",
    "romannurik",
    "rosalyntan",
    "rosecm",
    "rsgowman",
    "russellwheatley",
    "ryanwilson",
    "Salakar",
    "samedson",
    "samhorlbeck",
    "sampson-chen",
    "samtstern",
    "sbrissenden",
    "schandel",
    "schmidt-sebastian",
    "schnecle",
    "sethladd",
    "sheepmaster",
    "silvolu",
    "SinanKadavath",
    "smorales-goog",
    "ssbushi",
    "stewartmiles",
    "strom2357",
    "sunmou99",
    "taeold",
    "tagboola",
    "tcrowesun",
    "tejasd",
    "the-real-mrcs",
    "thebrianchen",
    "thechenky",
    "thenenadx",
    "tikurahul",
    "tjlav5",
    "TKBurner",
    "tmatsuo",
    "ToddKerpelman",
    "tonybaroneee",
    "tonyjhuang",
    "TristonianJones",
    "tristyn-maalouf",
    "tsunghung",
    "uhhhclem",
    "ulukaya",
    "var-const",
    "vic-flair",
    "vimanyu",
    "VinayGuthal",
    "visumickey",
    "vkryachko",
    "vywoo",
    "weixifan",
    "welishr",
    "welkinlan",
    "wti806",
    "wu-hui",
    "wuyanna",
    "xil222",
    "XuZhen86",
    "yalunqin",
    "ycherenkova",
    "yifanyang",
    "yuchenshi",
    "zijianjoy",
    "zwu52"];

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
const getListOfIssues = async function (username, pageNo = 1) {
    // var url = 'https://api.github.com/repos/' + repo_name + '/issues?sort=' + rest_api_sort_param + '&state=' + rest_api_state_param + '&page=' + `${pageNo}` + '';
    // var url = 'https://api.github.com/repos/firebase/firebase-android-sdk/issues/2580';
    var url = 'https://api.github.com/users/' + username;
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

const getEntireIssueList = async function (username, pageNo = 1) {
    const results = await getListOfIssues(username, pageNo);
    if (results.length > 0) {
        return results.concat(await getEntireIssueList(username, pageNo + 1));
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

    for (var i = 0, length = members.length; i < length; i++) {
        const myJson = await getEntireIssueList(members[i], pageNo = 1);
        console.log(myJson.id);
    }

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

