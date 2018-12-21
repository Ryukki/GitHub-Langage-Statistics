class languagePercentage{
    constructor(language, bytes){
        this.language = language
        this.bytes = bytes
    }
}

var results = document.getElementById('results');
var userName = document.getElementById('userName');
var mails = document.getElementById('mails');
var repoTable = document.getElementById('repoTable');
var languagesTable = document.getElementById('languagesTable');

var accountName;
var apiUrl = "https://api.github.com/";
var emails = [];
var reposResponse;
var languageMap =[];
var totalBytes = 0;

var mailsText = '';
var repoList = ''

document.getElementById('accountName').addEventListener("keyup", function(event) {
    // Cancel the default action, if needed
    event.preventDefault();
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13) {
        getUserInfo()
    }
  });

function clearVariables(){
    results.style.display = "none"
    accountName=""
    emails = []
    mails.innerHTML = ""
    reposResponse = null
    languageMap = []
    totalBytes = 0
    mailsText = ''
    repoList = ''
    repoTable.innerHTML = ""
    languagesTable.innerHTML = ""
}

function getUserInfo(){
    clearVariables();
    accountName = document.getElementById('accountName').value;
    userAction();
}
   
const userAction = async () => {
    let response = await fetch(apiUrl + "users/" + accountName);
    if(handleErrors(response)){
        let jsonResponse = await (response).json()
        handleResponse(jsonResponse)
        displayResults()
    }
}

function handleErrors(response) {
    if (!response.ok) {
        alert("API request returned: " + response.status + " " + response.statusText);
        return false;
    }
    return true;
}
  
function handleResponse(jsonResponse){
    handleMails(jsonResponse);
    getRepos();
} 

const handleMails = async (jsonResponse) => {
    let mail = jsonResponse.mail
    if(mail!=null){
        emails.push(mail)
    }
    let response = await fetch(apiUrl + "users/" + accountName + "/events");
    if(handleErrors(response)){
        let emailsResponse = await (response).json()
        for(event in emailsResponse){
            let payloadCommits = emailsResponse[event].payload.commits
            for(commit in payloadCommits){
                let author = payloadCommits[commit].author
                let username = emailsResponse[event].actor.display_login
                if(username.toString().toLowerCase()===author.name.toString().toLowerCase()){
                    let email = author.email
                    if(!emails.includes(email)){
                        emails.push(email)
                        mailsText += '<li class="list-group-item">' + email + '</li>';
                        mails.innerHTML = mailsText;
                    }
                }
            }
        }
    }
}

const getRepos = async () => {
    response = await fetch(apiUrl + "users/" + accountName + "/repos");
    if(handleErrors(response)){
        reposResponse = await (response).json()
        computeLanguageStatistics();
    }
}

function computeLanguageStatistics(){
    for(repoJson in reposResponse){
        let repoName = reposResponse[repoJson].name
        repoTable.innerHTML+='<a target="_blank" rel="noopener noreferrer" href="' + reposResponse[repoJson].html_url + '" class="list-group-item">' + repoName + '</a>'
        getRepoLanguages(repoName)
    }
}

const getRepoLanguages = async(repoName) => {
    let response = await fetch(apiUrl + "repos/" + accountName + "/" + repoName + "/languages");
    if(handleErrors(response)){
        let repoLanguages = await (response).json()
        for(singleLanguage in repoLanguages){
            byteAmount = repoLanguages[singleLanguage]
            totalBytes += byteAmount
            
            let languageObject = mapHasKey(singleLanguage)
            if(languageObject!=null){
                languageObject.bytes+=byteAmount
            }else{
                languageObject = new languagePercentage(singleLanguage, byteAmount)
            }
            languageMap.push(languageObject)
            printPercentages()
        }
    }
}

function printPercentages(){
    languageMap.sort(compare);
    languagesTable.innerHTML = "";
    for(language in languageMap){
        languagesTable.innerHTML += '<tr><td>' + languageMap[language].language + '</td><td>' + languageMap[language].bytes/totalBytes + '%</td></tr>'
    }
}

function compare(l1, l2){
    if(l1.bytes < l2.bytes)
        return 1;
    if(l1.bytes > l2.bytes)
        return -1;
    return 0;
}

function mapHasKey(key){
    for(language in languageMap){
        if(languageMap[language].language==key){
            return languageMap.splice(language, 1)[0]//first index cause splice returns array when I need just single object
        }
    }
    return null
}

const displayResults = async() => {
    userName.innerHTML = '<h2>' + accountName + '</h2>';

    results.style.display = "inline";
}