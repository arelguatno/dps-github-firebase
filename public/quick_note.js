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
document.getElementById("logout").addEventListener("click", logOut);
document.getElementById("startReport").addEventListener("click", myFunction);
const issue_list = document.querySelector('#isse-list');

function logOut() {

    firebase.auth().signOut().then(function () {
        // Sign-out successful.
    }).catch(function (error) {
        // An error happened.
    });

}

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        // console.log("token " + user.getToken);
        $('#user_name').html("Hello! " + user.email + " ");
        document.getElementById('logout').style.visibility = 'visible';

        db.collection('issue_note').doc(user.uid).collection('notes').onSnapshot(function (querySnapshot) {
            issue_list.innerHTML = '';
    
            querySnapshot.forEach(function (doc) {
                rederActivity(doc);
            });
    
        });
    } else {
        issue_list.innerHTML = '';
        authLogin();
    }
});

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

function myFunction() {
    var str1 = document.getElementById("issue_number").value;
    var str2 = document.getElementById("issue_comment").value;
    userDoc = {
        'issue_number': str1,
        'issue_comment': str2,
        'dateCreatedMili': new Date().getTime()
    }

    var user = firebase.auth().currentUser;
    if (user) {

        var ref = db.collection('issue_note').doc(user.uid).collection('notes').doc();
        ref.set(userDoc).then(writeResult => {
            // Save information
        }).catch(err => {
            console.log(err);
        });

    }

}

// create element and render player 
function rederActivity(doc) {
    let li = document.createElement('li');

    let name = document.createElement('span');
    let score = document.createElement('span');
    let date = document.createElement('span');

    li.setAttribute('data-id', doc.id);

    name.textContent = doc.data().issue_number;
    score.textContent = doc.data().issue_comment;
    date.textContent = formatDate(doc.data().dateCreatedMili);

    li.appendChild(name);
    li.appendChild(score);
    li.appendChild(date);

    issue_list.appendChild(li);
}


function formatDate(s_date) {
    var date = new Date(s_date);

    return date.getFullYear() + "/" + ((date.getMonth() > 8) ? (date.getMonth() + 1) : ('0' + (date.getMonth() + 1))) + '/' + ((date.getDate() > 9) ? date.getDate() : ('0' + date.getDate())) + " " + formatAMPM(date)
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


