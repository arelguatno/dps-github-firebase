const triaged_completed_status = "TRIAGED_COMPLETED";

function getIssueStatus(repo_name, issue_number) {
    var docRef = db.collection("notes").doc(repo_name).collection(issue_number).doc("data");
    return new Promise((resolve, reject) => {
        docRef.get().then(function (doc) {
            if (doc.exists) {
                resolve(doc.data());
            } else {
                resolve(null);
            }
        }).catch(function (error) {
            resolve(null);
        });
    })
}

function getIssueReproMessage(repo_name, issue_number) {
    var notesRef = db.collection("notes").doc(repo_name).collection(issue_number).doc("data").collection("notes");
    var query = notesRef.where("action", "==", "REPRO_CREATED")

    return new Promise((resolve, reject) => {
        query.get().then(function (querySnapshot) {
            var cities = [];
            querySnapshot.forEach(function (doc) {
                cities.push(doc.data().message);
                // console.log(doc.data().created_at.toDate()); // access the '_seconds' attribute within the timestamp object
            });

            resolve(cities.join("; "));
        }).catch(function (error) {
            console.log("getIssueReproMessage: " + error);
            resolve(null);
        });
    })
}

function getIssueTriageCompletionDate(repo_name, issue_number){
    var notesRef = db.collection("notes").doc(repo_name).collection(issue_number).doc("data").collection("notes");
    var query = notesRef.where("action", "==", "STATUS_CHANGED").orderBy("created_at", "desc")  // latest first

    return new Promise((resolve, reject) => {
        query.get().then(function (querySnapshot) {
            var cities = [];
            querySnapshot.forEach(function (doc) {

                var test = doc.data().message.indexOf(triaged_completed_status);
                if (test >= 0) {
                    cities.push(doc.data().created_at.toDate());
                    resolve(cities.join("; "));
                }
            });
            resolve(cities.join("; "));
        }).catch(function (error) {
            console.log("getIssueTriageCompletion: " + error);
            resolve(null);
        });
    })
}

function getRepoName(repo_name) {
    if (repo_name == "firebase/firebase-android-sdk") {
        return "android"
    } else if (repo_name == "firebase/firebase-js-sdk") {
        return "js"
    } else if (repo_name == "firebase/firebase-ios-sdk") {
        return "ios"
    } else if (repo_name == "firebase/quickstart-unity") {
        return "quickstart-unity"
    } else if (repo_name == "googlesamples/unity-jar-resolver") {
        return "quickstart-resolver"
    } else {
        return "unkown"
    }
}



